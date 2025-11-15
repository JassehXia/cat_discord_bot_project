import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import User from '../models/User.js';

export default {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('View your cat collector profile'),

    async execute(interaction) {
        const discordId = interaction.user.id;

        // Fetch or create user
        let user = await User.findOne({ discordId });
        if (!user) {
            user = await User.create({
                discordId,
                username: interaction.user.username,
            });
        }

        // Calculate total cats
        const totalCats = user.cats.reduce((sum, c) => sum + c.quantity, 0);

        // Create embed
        const embed = new EmbedBuilder()
            .setColor('#F7C873')
            .setTitle(`${interaction.user.username}'s Profile`)
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
            .addFields(
                {
                    name: '⭐ Level',
                    value: `${user.level || 1}`,
                    inline: true
                },
                {
                    name: '✨ XP',
                    value: `${user.xp || 0} / ${user.level * 100}`,
                    inline: true
                },
                {
                    name: '🌾 Catnip',
                    value: `${user.catnip || 0}`,
                    inline: true
                },
                {
                    name: '🐾 Cats Collected',
                    value: `${totalCats}`,
                    inline: true
                },
                {
                    name: '📦 Unique Cats',
                    value: `${user.cats.length}`,
                    inline: true
                }
            )
            .setFooter({ text: 'Cat Card Collector — Profile' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
