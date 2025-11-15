import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import User from '../models/User.js';

const rarityOrder = ['Legendary', 'Epic', 'Rare', 'Uncommon', 'Common'];
const rarityColors = { Common: '#A0A0A0', Uncommon: '#31FF1E', Rare: '#3261CD', Epic: '#A200FF', Legendary: '#F2FF00' };

export default {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('View your cat collector profile 🎄🐱'),

    async execute(interaction) {
        await interaction.deferReply();

        try {
            const discordId = interaction.user.id;
            const username = interaction.user.username;

            const user = await User.findOne({ discordId }).populate('cats.cat');

            if (!user) {
                await interaction.editReply(`🐾 ${username}, you don’t have a profile yet! Use /discover to start collecting cats.`);
                return;
            }

            // Total cats
            const totalCats = user.cats.reduce((sum, c) => sum + c.quantity, 0);

            // Count cats per rarity
            const rarityCounts = {};
            for (const rarity of rarityOrder) rarityCounts[rarity] = 0;
            for (const c of user.cats) {
                if (c.cat && c.cat.rarity) {
                    rarityCounts[c.cat.rarity] += c.quantity;
                }
            }

            // Determine highest rarity for embed color
            let highestRarity = 'Common';
            for (const r of rarityOrder) {
                if (rarityCounts[r] > 0) {
                    highestRarity = r;
                    break;
                }
            }

            // Build embed
            const embed = new EmbedBuilder()
                .setTitle(`🎄 ${username}'s Collector Profile 🎄`)
                .setColor(rarityColors[highestRarity])
                .setDescription(`💰 **Catnip:** ${user.catnip}\n🐾 **Total Cats:** ${totalCats}`)


            await interaction.editReply({ embeds: [embed] });

        } catch (err) {
            console.error('Error executing /profile:', err);
            await interaction.editReply({ content: '❌ Something went wrong!', ephemeral: true });
        }
    }
};
