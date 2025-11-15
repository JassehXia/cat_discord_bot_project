// utils/animateEmbed.js
import { EmbedBuilder } from 'discord.js';

export async function animateEmbed(interaction, title, frames, color) {
    for (const frame of frames) {
        const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(`\`\`\`\n${frame}\`\`\``)
            .setColor(color);
        if (!interaction.replied) {
            await interaction.editReply({ embeds: [embed] });
        } else {
            await interaction.editReply({ embeds: [embed] });
        }
        await new Promise(res => setTimeout(res, 1500)); // Increase the delay to 1500ms (1.5 seconds)
    }
}
