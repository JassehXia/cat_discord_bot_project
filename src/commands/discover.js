// src/commands/discover.js
import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import User from '../models/User.js';
import Cat from '../models/Cat.js';
import { snowfallFrames } from '../utils/christmasUtils/snowfall.js';
import { animateEmbed } from '../utils/animateEmbed.js';
import { addXP } from '../utils/addXP.js'; // ⬅ NEW

const rarityColors = {
    Common: '#A0A0A0',
    Uncommon: '#31FF1E',
    Rare: '#3261CD',
    Epic: '#A200FF',
    Legendary: '#F2FF00'
};

const rarityEmojis = {
    Common: '🐱',
    Uncommon: '😺',
    Rare: '😻',
    Epic: '🌟',
    Legendary: '🌈✨'
};

const catnipRewards = {
    Common: 5,
    Uncommon: 10,
    Rare: 25,
    Epic: 50,
    Legendary: 100
};

// XP rewards for leveling
const xpRewards = {
    Common: 5,
    Uncommon: 10,
    Rare: 20,
    Epic: 40,
    Legendary: 80
};

const cooldowns = new Map();
const COOLDOWN_MS = 15 * 1000;

export default {
    data: new SlashCommandBuilder()
        .setName('discover')
        .setDescription('Discover a random cat!'),

    async execute(interaction) {
        await interaction.deferReply();

        const discordId = interaction.user.id;
        const username = interaction.user.username;

        // Cooldown check
        const now = Date.now();
        const lastUsed = cooldowns.get(discordId) || 0;
        const remaining = COOLDOWN_MS - (now - lastUsed);
        if (remaining > 0) {
            const seconds = Math.ceil(remaining / 1000);
            return interaction.editReply(`🕒 Wait ${seconds}s before discovering again.`);
        }

        try {
            let user = await User.findOne({ discordId }).populate('cats.cat');
            if (!user) {
                user = await User.create({
                    discordId,
                    username,
                    cats: [],
                    catnip: 0,
                    xp: 0,
                    level: 1
                });
            }

            // Determine rarity
            const rarities = [
                { type: 'Common', chance: 0.6 },
                { type: 'Uncommon', chance: 0.25 },
                { type: 'Rare', chance: 0.1 },
                { type: 'Epic', chance: 0.04 },
                { type: 'Legendary', chance: 0.01 }
            ];

            let rarity = 'Common';
            const roll = Math.random();
            let cumulative = 0;

            for (const r of rarities) {
                cumulative += r.chance;
                if (roll < cumulative) {
                    rarity = r.type;
                    break;
                }
            }

            const catsOfRarity = await Cat.find({ rarity });
            const cat = catsOfRarity[Math.floor(Math.random() * catsOfRarity.length)];

            // Add cat to collection
            let existing = user.cats.find(c => c.cat && c.cat._id.equals(cat._id));
            if (existing) existing.quantity++;
            else user.cats.push({ cat: cat._id, model: 'Cat', quantity: 1 });

            // Catnip gain
            const catnipEarned = catnipRewards[rarity];
            user.catnip += catnipEarned;

            // XP gain
            const xpEarned = xpRewards[rarity];
            const leveledUp = addXP(user, xpEarned);

            await user.save();
            cooldowns.set(discordId, now);

            // Animation
            const frames = snowfallFrames(5, 30, 6);
            await animateEmbed(interaction, `🎄 ${username} discovers a cat...`, frames, rarityColors[rarity]);

            // Final reveal
            const embed = new EmbedBuilder()
                .setTitle(`🎄 You discovered a cat! ${rarityEmojis[rarity]}`)
                .setColor(rarityColors[rarity])
                .setDescription(
                    `**${cat.name}** — ${cat.description}\n\n` +
                    `🎁 Catnip Earned: **${catnipEarned}**\n` +
                    `⭐ XP Earned: **${xpEarned}**\n\n` +
                    (leveledUp ? `🎉 **LEVEL UP!** You are now **Level ${user.level}**!\n` : ``) +
                    `💰 Total Catnip: **${user.catnip}**`
                );

            await interaction.editReply({ embeds: [embed] });

        } catch (err) {
            console.error('/discover error:', err);
            interaction.editReply('❌ Something went wrong.');
        }
    }
};
