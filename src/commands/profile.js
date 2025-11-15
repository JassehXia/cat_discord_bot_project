import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import User from '../models/User.js';
import Cat from '../models/Cat.js';
import EventCat from '../models/EventCat.js';
import { getTitle } from '../utils/levelTitles.js';

export default {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('View your cat collector profile'),

    async execute(interaction) {
        const discordId = interaction.user.id;
        let user = await User.findOne({ discordId });
        if (!user) {
            user = await User.create({ discordId, username: interaction.user.username });
        }

        const level = user.level || 1;
        const xp = user.xp || 0;
        const xpRequired = level * 100;
        const title = getTitle(level);

        // Progress bar
        const barLength = 20;
        const percent = xp / xpRequired;
        const filled = Math.round(percent * barLength);
        const empty = barLength - filled;
        const progressBar = `🟦`.repeat(filled) + `⬜`.repeat(empty);

        // Rarest cat
        let rarestCat = null;
        if (user.cats.length > 0) {
            const populatedCats = await Promise.all(
                user.cats.map(async c => {
                    const model = c.model === "Cat" ? Cat : EventCat;
                    const data = await model.findById(c.cat);
                    return { ...c.toObject(), data };
                })
            );

            const rarityWeight = { Common: 1, Uncommon: 2, Rare: 3, Epic: 4, Legendary: 5 };
            populatedCats.sort((a, b) =>
                (rarityWeight[b.data.rarity] || 0) - (rarityWeight[a.data.rarity] || 0)
            );

            rarestCat = populatedCats[0];
        }

        const totalCats = user.cats.reduce((sum, c) => sum + c.quantity, 0);

        const embed = new EmbedBuilder()
            .setColor('#F7C873')
            .setTitle(`${interaction.user.username}'s Profile — ${title}`) // <--- TITLE
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: '⭐ Level', value: `${level}`, inline: true },
                { name: '✨ XP', value: `${xp} / ${xpRequired}`, inline: true },
                { name: '📈 Progress', value: `${progressBar} (${Math.round(percent * 100)}%)` },
                { name: '🌾 Catnip', value: `${user.catnip}`, inline: true },
                { name: '🐾 Total Cats', value: `${totalCats}`, inline: true },
                { name: '📦 Unique Cats', value: `${user.cats.length}`, inline: true }
            )
            .setFooter({ text: 'Cat Card Collector — Profile' })
            .setTimestamp();

        if (rarestCat) {
            embed.addFields({
                name: '🐱 Rarest Cat',
                value: `**${rarestCat.data.name}** — *${rarestCat.data.rarity}*`
            });
        } else {
            embed.addFields({ name: '🐱 Rarest Cat', value: 'You have no cats yet!' });
        }

        await interaction.reply({ embeds: [embed] });
    }
};
