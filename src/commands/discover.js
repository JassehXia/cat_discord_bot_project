// src/commands/discover.js
import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import User from '../models/User.js';
import Cat from '../models/Cat.js';
import { snowfallFrames } from '../utils/christmasUtils/snowfall.js';
import { animateEmbed } from '../utils/animateEmbed.js';

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

// Cooldown map
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
            const totalBars = 10;
            const filledBars = Math.round(totalBars * ((COOLDOWN_MS - remaining) / COOLDOWN_MS));
            const bar = '❄️'.repeat(filledBars) + '⚪'.repeat(totalBars - filledBars);

            return interaction.editReply(`🕒 Please wait ${seconds}s before discovering again.\n${bar}`);
        }

        try {
            // Load or create user
            let user = await User.findOne({ discordId }).populate('cats.cat');
            if (!user) {
                user = await User.create({ discordId, username, cats: [], catnip: 0 });
            }

            // Determine rarity
            const rarities = [
                { type: 'Common', chance: 0.6 },
                { type: 'Uncommon', chance: 0.25 },
                { type: 'Rare', chance: 0.1 },
                { type: 'Epic', chance: 0.04 },
                { type: 'Legendary', chance: 0.01 }
            ];

            const roll = Math.random();
            let rarity = 'Common';
            let cumulative = 0;
            for (const r of rarities) {
                cumulative += r.chance;
                if (roll < cumulative) {
                    rarity = r.type;
                    break;
                }
            }

            // Select a random cat from the regular pool
            const catsOfRarity = await Cat.find({ rarity });
            if (!catsOfRarity.length) throw new Error(`No regular cats found for rarity ${rarity}`);

            const cat = catsOfRarity[Math.floor(Math.random() * catsOfRarity.length)];
            if (!cat) throw new Error('Selected cat is null');

            // Add cat to user collection safely
            // Add cat to user collection safely
            let existing = user.cats.find(c => c.cat && c.cat._id.equals(cat._id));
            if (existing) {
                existing.quantity += 1;
            } else {
                user.cats.push({
                    cat: cat._id,
                    model: 'Cat', // <-- THIS IS REQUIRED
                    quantity: 1
                });
            }


            // Award Catnip
            const catnipEarned = catnipRewards[rarity] || 0;
            user.catnip += catnipEarned;

            // Save user
            await user.save();

            cooldowns.set(discordId, now);

            // ❄️ Snowfall animation reveal
            const frames = snowfallFrames(5, 30, 6); // shorter animation
            await animateEmbed(interaction, `🎄 ${username} is discovering a cat! 🐾`, frames, rarityColors[rarity]);

            // Final reveal embed
            const embed = new EmbedBuilder()
                .setTitle(`🎄 You discovered a cat! ${rarityEmojis[rarity]}`)
                .setDescription(
                    `**${cat.name}** — ${cat.description}\n` +
                    `You now have **${existing ? existing.quantity : 1}** of this cat.\n\n` +
                    `🎁 Earned **${catnipEarned} Catnip**!\n` +
                    `💰 Total Catnip: **${user.catnip}**`
                )
                .setColor(rarityColors[rarity]);

            await interaction.editReply({ embeds: [embed] });

        } catch (err) {
            console.error('/discover error:', err);
            if (!interaction.replied) {
                await interaction.editReply({ content: '❌ Something went wrong!', ephemeral: true });
            }
        }
    }
};
