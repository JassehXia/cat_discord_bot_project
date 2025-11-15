// src/commands/premium-discover.js
import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import User from '../models/User.js';
import EventCat from '../models/EventCat.js';
import { animateEmbed } from '../utils/animateEmbed.js';
import { snowfallFrames } from '../utils/christmasUtils/snowfall.js';
import { addXP } from '../utils/addXP.js'; // ⬅ NEW

const rarityColors = {
    Rare: '#3261CD',
    Epic: '#A200FF',
    Legendary: '#F2FF00'
};

const rarityEmojis = {
    Rare: '😻',
    Epic: '🌟',
    Legendary: '🌈✨'
};

// XP rewards
const xpRewards = {
    Rare: 20,
    Epic: 50,
    Legendary: 100
};

const SINGLE_COST = 20;
const MULTI_COST = 200;
const MULTI_COUNT = 11;

const rarities = [
    { type: 'Rare', chance: 0.85 },
    { type: 'Epic', chance: 0.12 },
    { type: 'Legendary', chance: 0.03 }
];

const eventRarityMap = {
    Rare: 'Festive-SSR',
    Epic: 'Festive-UR',
    Legendary: 'Festive-LR'
};

export default {
    data: new SlashCommandBuilder()
        .setName('premium-discover')
        .setDescription('Open the premium discover (Rare+ guaranteed)'),

    async execute(interaction) {
        await interaction.deferReply();

        const discordId = interaction.user.id;
        const username = interaction.user.username;

        try {
            let user = await User.findOne({ discordId }).populate('cats.cat');
            if (!user)
                user = await User.create({
                    discordId,
                    username,
                    cats: [],
                    catnip: 0,
                    xp: 0,
                    level: 1
                });

            // Menu
            const embed = new EmbedBuilder()
                .setTitle('🎁 Premium Event Discover')
                .setDescription(
                    `🎯 **Single Pull:** 1 Rare+ Event Cat — **${SINGLE_COST} Catnip**\n` +
                    `🎯 **Multi Pull:** 11 Rare+ Event Cats — **${MULTI_COST} Catnip**`
                )
                .setColor('#FFD700');

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('single').setLabel('Single Pull').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('multi').setLabel('Multi Pull').setStyle(ButtonStyle.Success)
            );

            const msg = await interaction.editReply({ embeds: [embed], components: [row] });
            const collector = msg.createMessageComponentCollector({ time: 120000 });

            collector.on('collect', async i => {
                if (i.user.id !== discordId) return i.reply({ content: 'Not your discover!', ephemeral: true });
                await i.deferUpdate();

                const pullCount = i.customId === 'single' ? 1 : MULTI_COUNT;
                const cost = i.customId === 'single' ? SINGLE_COST : MULTI_COST;

                if (user.catnip < cost)
                    return i.followUp({ content: `❌ Not enough Catnip! Need ${cost}.`, ephemeral: true });

                user.catnip -= cost;
                await user.save();

                await i.editReply({ components: [] });

                const results = [];
                let levelUps = 0;

                for (let j = 0; j < pullCount; j++) {
                    const roll = Math.random();
                    let rarity = 'Rare';
                    let cumulative = 0;

                    for (const r of rarities) {
                        cumulative += r.chance;
                        if (roll < cumulative) { rarity = r.type; break; }
                    }

                    const pool = await EventCat.find({ eventRarity: eventRarityMap[rarity] });
                    const cat = pool[Math.floor(Math.random() * pool.length)];

                    results.push({ cat, rarity });

                    // XP Logic
                    const xpEarned = xpRewards[rarity];
                    const leveledUp = addXP(user, xpEarned);
                    if (leveledUp) levelUps++;

                    // Animation
                    const frames = snowfallFrames(2, 25, 6);
                    await animateEmbed(i, `🎁 Pull ${j + 1}`, frames, rarityColors[rarity]);

                    await i.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle(`🎉 Pull ${j + 1}`)
                                .setDescription(`${rarityEmojis[rarity]} **${cat.name}**\n⭐ XP Earned: **${xpEarned}**`)
                                .setColor(rarityColors[rarity])
                        ]
                    });

                    await new Promise(res => setTimeout(res, 600));
                }

                // Add cats to inventory
                for (const { cat } of results) {
                    const found = user.cats.find(c => c.cat.equals(cat._id));
                    if (found) found.quantity++;
                    else user.cats.push({ cat: cat._id, model: 'EventCat', quantity: 1 });
                }

                await user.save();

                const list = results
                    .map(r => `${rarityEmojis[r.rarity]} **${r.cat.name}**`)
                    .join('\n');

                const finalEmbed = new EmbedBuilder()
                    .setTitle(`🎉 Premium Discover Results!`)
                    .setColor('#FFD700')
                    .setDescription(
                        `${list}\n\n` +
                        (levelUps > 0 ? `🎉 **You leveled up ${levelUps} time(s)!** New Level: **${user.level}**\n\n` : ``) +
                        `💰 Remaining Catnip: **${user.catnip}**`
                    );

                await i.editReply({ embeds: [finalEmbed] });
            });

        } catch (err) {
            console.error('premium-discover error:', err);
            interaction.editReply('❌ Something went wrong.');
        }
    }
};
