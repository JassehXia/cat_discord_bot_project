import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import User from '../models/User.js';
import EventCat from '../models/EventCat.js';
import { animateEmbed } from '../utils/animateEmbed.js';
import { snowfallFrames } from '../utils/christmasUtils/snowfall.js';

// Embed colors
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

// Snowflake variants for animation by rarity
const snowflakeVariants = {
    Rare: ['*', '❄', '.', '•'],
    Epic: ['⭐', '✦', '✧', '🌟'],
    Legendary: ['✨', '💫', '🌈', '🌟']
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

// Custom function to generate frames using rarity-specific symbols
function customSnowfallFrames(frameCount, width = 25, height = 6, rarity = 'Rare') {
    const chars = snowflakeVariants[rarity] || ['*', '❄', '.', '•'];
    const frames = [];

    for (let i = 0; i < frameCount; i++) {
        let frame = '';
        for (let h = 0; h < height; h++) {
            let line = '';
            for (let w = 0; w < width; w++) {
                line += Math.random() < 0.15
                    ? chars[Math.floor(Math.random() * chars.length)]
                    : ' ';
            }
            frame += line + '\n';
        }
        frames.push(frame);
    }

    return frames;
}

export default {
    data: new SlashCommandBuilder()
        .setName('premium-discover')
        .setDescription('Open the premium discover (Rare+ guaranteed from Event Cats)'),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: false });

        const discordId = interaction.user.id;
        const username = interaction.user.username;

        try {
            let user = await User.findOne({ discordId }).populate('cats.cat');
            if (!user) user = await User.create({ discordId, username, cats: [], catnip: 0 });

            // Pull selection embed
            const embed = new EmbedBuilder()
                .setTitle('🎁 Premium Event Discover')
                .setDescription(
                    `Choose your premium pull:\n\n` +
                    `🎯 **Single Pull:** 1 Rare+ Event Cat for **${SINGLE_COST} Catnip**\n` +
                    `🎯 **Multi Pull:** 11 Rare+ Event Cats for **${MULTI_COST} Catnip**`
                )
                .setColor('#FFD700');

            const pullRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder().setCustomId('single').setLabel('Single Pull').setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId('multi').setLabel('Multi Pull').setStyle(ButtonStyle.Success)
                );

            const message = await interaction.editReply({ embeds: [embed], components: [pullRow] });
            const collector = message.createMessageComponentCollector({ time: 120000 });

            collector.on('collect', async i => {
                if (i.user.id !== discordId) return i.reply({ content: 'This is not your discover!', ephemeral: true });
                await i.deferUpdate();

                const pullCount = i.customId === 'single' ? 1 : MULTI_COUNT;
                const cost = i.customId === 'single' ? SINGLE_COST : MULTI_COST;

                if ((user.catnip || 0) < cost) {
                    return i.followUp({ content: `❌ Not enough Catnip! Need ${cost}.`, ephemeral: true });
                }

                user.catnip -= cost;
                await user.save();

                // Remove the pull buttons immediately
                await i.editReply({ components: [] });

                // Generate all pulls upfront
                const results = [];
                for (let j = 0; j < pullCount; j++) {
                    const roll = Math.random();
                    let rarity = 'Rare';
                    let cumulative = 0;
                    for (const r of rarities) {
                        cumulative += r.chance;
                        if (roll < cumulative) { rarity = r.type; break; }
                    }

                    const catsOfRarity = await EventCat.find({ eventRarity: eventRarityMap[rarity] });
                    if (!catsOfRarity.length) continue;
                    const cat = catsOfRarity[Math.floor(Math.random() * catsOfRarity.length)];

                    results.push({ cat, rarity });
                }

                // Animation loop (fast)
                for (let j = 0; j < results.length; j++) {
                    const { cat, rarity } = results[j];
                    const frames = customSnowfallFrames(2, 25, 6, rarity); // 2 frames for faster animation

                    await animateEmbed(i, `🎁 Pull ${j + 1}`, frames, rarityColors[rarity]);

                    // Reveal cat
                    const revealEmbed = new EmbedBuilder()
                        .setTitle(`🎉 Pull ${j + 1}`)
                        .setDescription(`**${rarityEmojis[rarity]} ${cat.name}**`)
                        .setColor(rarityColors[rarity])
                        .setFooter({ text: `💰 Remaining Catnip: ${user.catnip}` });

                    await i.editReply({ embeds: [revealEmbed] });

                    // Very short delay before next pull
                    await new Promise(res => setTimeout(res, 600));
                }

                // Add all pulls to user collection
                for (const { cat } of results) {
                    const existing = user.cats.find(c => c.cat.equals(cat._id));
                    if (existing) {
                        existing.quantity += 1;
                    } else {
                        user.cats.push({
                            cat: cat._id,
                            model: 'EventCat', // explicitly mark as EventCat
                            quantity: 1
                        });
                    }
                }
                await user.save();


                // Final results list
                const descriptionList = results.map(r => `${rarityEmojis[r.rarity]} **${r.cat.name}**`).join('\n');
                const finalEmbed = new EmbedBuilder()
                    .setTitle(`🎉 Premium Discover Results!`)
                    .setDescription(descriptionList + `\n\n💰 Remaining Catnip: ${user.catnip}`)
                    .setColor('#FFD700');

                await i.editReply({ embeds: [finalEmbed], components: [] });
            });

        } catch (err) {
            console.error('Error executing /premium-discover:', err);
            await interaction.editReply({ content: '❌ Something went wrong!', ephemeral: true });
        }
    }
};
