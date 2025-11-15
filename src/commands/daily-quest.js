import { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from "discord.js";
import User from "../models/User.js";
import { getRandomQuests, dailyQuests as QUEST_POOL } from "../utils/dailyQuests.js";

export default {
    data: new SlashCommandBuilder()
        .setName("daily-quest")
        .setDescription("View your daily quests"),

    async execute(interaction) {
        let user = await User.findOne({ discordId: interaction.user.id });

        // Create user if needed
        if (!user) {
            user = await User.create({
                discordId: interaction.user.id,
                username: interaction.user.username
            });
        }

        // -----------------------------
        // VALIDATION FUNCTION
        // -----------------------------
        function isValidQuest(q) {
            if (!q || !q.key) return false;

            const template = QUEST_POOL.find(t => t.key === q.key);
            if (!template) return false;

            // Ensure required fields exist
            if (typeof q.progress !== "number") return false;
            if (typeof q.completed !== "boolean") return false;

            return true;
        }

        // -----------------------------
        // CHECK FOR MALFORMED QUESTS
        // -----------------------------
        let needsReset = false;

        if (!user.dailyQuests || user.dailyQuests.length === 0) {
            needsReset = true;
        } else {
            for (const q of user.dailyQuests) {
                if (!isValidQuest(q)) {
                    needsReset = true;
                    break;
                }
            }
        }

        // -----------------------------
        // RESET OR ASSIGN NEW QUESTS
        // -----------------------------
        if (needsReset) {
            const fresh = getRandomQuests(3);
            user.dailyQuests = fresh.map(q => ({
                ...q,
                progress: 0,
                completed: false
            }));
            await user.save();
        }

        // -----------------------------
        // PROGRESS BAR
        // -----------------------------
        function progressBar(current, target) {
            const totalBars = 10;
            const filledBars = Math.min(Math.floor((current / target) * totalBars), totalBars);
            return "█".repeat(filledBars) + "░".repeat(totalBars - filledBars);
        }

        // -----------------------------
        // BUILD QUEST DISPLAY
        // -----------------------------
        const questDescriptions = user.dailyQuests.map((quest, i) => {
            return `**${i + 1}. ${quest.name}**  
Progress: \`${progressBar(quest.progress, quest.target)}\` (${quest.progress}/${quest.target})  
Reward: **${quest.reward.catnip} 🪙 Catnip**, **${quest.reward.xp} ⭐ XP**  
Status: ${quest.completed ? "✅ Completed" : "🔸 In Progress"}`;
        }).join("\n\n");

        const embed = new EmbedBuilder()
            .setTitle("🐾 Daily Quests")
            .setDescription(questDescriptions)
            .setColor("#FFD166");

        // Claim button
        const claimButton = new ButtonBuilder()
            .setCustomId("claimDailyQuests")
            .setLabel("Claim Rewards")
            .setStyle(ButtonStyle.Success);

        await interaction.reply({
            embeds: [embed],
            components: [new ActionRowBuilder().addComponents(claimButton)],
            ephemeral: false
        });

        // -----------------------------
        // CLAIM BUTTON HANDLER
        // -----------------------------
        const collector = interaction.channel.createMessageComponentCollector({
            filter: (i) =>
                i.customId === "claimDailyQuests" &&
                i.user.id === interaction.user.id,
            time: 1000 * 30
        });

        collector.on("collect", async (btn) => {

            // Always fetch fresh document
            const updatedUser = await User.findOne({ discordId: interaction.user.id });

            if (!updatedUser) {
                return btn.reply({ content: "❌ User not found.", ephemeral: false });
            }

            const completedQuests = updatedUser.dailyQuests.filter(q => q.completed);

            if (completedQuests.length === 0) {
                return btn.reply({ content: "❌ You haven't completed any quests yet!", ephemeral: false });
            }

            // Accumulate rewards
            let totalCatnip = 0;
            let totalXp = 0;

            completedQuests.forEach(q => {
                totalCatnip += q.reward.catnip;
                totalXp += q.reward.xp;
            });

            const remainingQuests = updatedUser.dailyQuests.filter(q => !q.completed);

            // 🔥 ATOMIC UPDATE — avoids VersionError completely
            await User.findOneAndUpdate(
                { discordId: interaction.user.id },
                {
                    $inc: { catnip: totalCatnip, xp: totalXp },
                    $set: { dailyQuests: remainingQuests }
                },
                { new: true }
            );

            return btn.reply({
                content: `🎉 **Rewards Claimed!**  
You received **${totalCatnip} Catnip** and **${totalXp} XP**.`,
                ephemeral: false
            });
        });

    }
};
