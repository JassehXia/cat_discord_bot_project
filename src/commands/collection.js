import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import User from '../models/User.js';

// Rarity colors
const rarityColors = {
    Common: '#A0A0A0',
    Uncommon: '#31FF1E',
    Rare: '#3261CD',
    Epic: '#A200FF',
    Legendary: '#F2FF00'
};

// Emoji + symbol per rarity
const rarityFlair = {
    Common: { emoji: '🐱', symbol: '-' },
    Uncommon: { emoji: '😺', symbol: '*' },
    Rare: { emoji: '😻', symbol: '**' },
    Epic: { emoji: '🌟', symbol: '✨' },
    Legendary: { emoji: '🌈✨', symbol: '💎' }
};

// Rarity order for sorting (Legendary → Common)
const rarityOrder = ['Legendary', 'Epic', 'Rare', 'Uncommon', 'Common'];

export default {
    data: new SlashCommandBuilder()
        .setName('collection')
        .setDescription('View all your collected cats'),

    async execute(interaction) {
        await interaction.deferReply();

        try {
            const discordId = interaction.user.id;
            const username = interaction.user.username;

            const user = await User.findOne({ discordId }).populate('cats.cat');

            if (!user || user.cats.length === 0) {
                return await interaction.editReply(
                    `🐾 ${username}, you haven’t found any cats yet! Use **/discover** or **/premium-discover** to begin.`
                );
            }

            user.cats = user.cats.filter(c => c.cat);
            if (user.cats.length === 0) {
                return await interaction.editReply(
                    `🐾 ${username}, your collection is empty. Use **/discover** to get new cats!`
                );
            }

            const sortedCats = user.cats.sort(
                (a, b) => rarityOrder.indexOf(a.cat.rarity) - rarityOrder.indexOf(b.cat.rarity)
            );

            const pageSize = 10;
            let page = 0;
            const totalPages = Math.ceil(sortedCats.length / pageSize);

            const generateEmbed = (page) => {
                const start = page * pageSize;
                const currentCats = sortedCats.slice(start, start + pageSize);

                let highestRarity = 'Common';
                currentCats.forEach(c => {
                    if (rarityOrder.indexOf(c.cat.rarity) < rarityOrder.indexOf(highestRarity)) {
                        highestRarity = c.cat.rarity;
                    }
                });

                const embed = new EmbedBuilder()
                    .setTitle(`🎄 ${username}'s Cat Collection 🐾`)
                    .setColor(rarityColors[highestRarity])
                    .setDescription(`You have **${user.cats.reduce((a, b) => a + b.quantity, 0)} cats total!**\nPage ${page + 1} of ${totalPages}`);

                currentCats.forEach(c => {
                    const flair = rarityFlair[c.cat.rarity] || { emoji: '🐱', symbol: '' };
                    const eventTag = c.model === 'EventCat' ? '❄️' : '';
                    let value = `Quantity: **x${c.quantity}**`;
                    if (c.personality) {
                        value += `\n🌟 Personality: **${c.personality.tierName} ${c.personality.name}** (${c.personality.type})`;
                    }
                    embed.addFields({
                        name: `${eventTag}${flair.emoji} **${c.cat.name}** — *${c.cat.rarity}* ${flair.symbol}`,
                        value,
                        inline: false
                    });
                });

                return embed;
            };

            const createRow = () => new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('prev')
                    .setLabel('⬅️ Previous')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(page === 0),
                new ButtonBuilder()
                    .setCustomId('next')
                    .setLabel('Next ➡️')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(page === totalPages - 1)
            );

            const message = await interaction.editReply({ embeds: [generateEmbed(page)], components: [createRow()] });

            const collector = message.createMessageComponentCollector({ time: 120000 });

            collector.on('collect', async i => {
                if (i.user.id !== interaction.user.id) return i.reply({ content: 'This is not your collection!', ephemeral: true });

                if (i.customId === 'next' && page < totalPages - 1) page++;
                if (i.customId === 'prev' && page > 0) page--;

                await i.update({ embeds: [generateEmbed(page)], components: [createRow()] });
            });

        } catch (err) {
            console.error('Error executing /collection:', err);
            await interaction.editReply({ content: '❌ Something went wrong!', ephemeral: true });
        }
    }
};
