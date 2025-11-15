import User from "../models/User.js";
import { getRandomQuests } from "./dailyQuests.js";

/**
 * Calculate milliseconds until next EST midnight
 */
function msUntilNextESTMidnight() {
    const now = new Date();
    const estOffset = -5 * 60; // EST is UTC-5 in minutes
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const estNow = new Date(utc + estOffset * 60000);

    const nextMidnight = new Date(estNow);
    nextMidnight.setHours(24, 0, 0, 0); // next midnight EST

    return nextMidnight - estNow;
}

/**
 * Reset daily quests for all users
 */
export async function resetDailyQuests() {
    try {
        const users = await User.find({});

        for (const user of users) {
            const freshQuests = getRandomQuests(2).map(q => ({
                ...q,
                progress: 0,
                completed: false
            }));

            user.dailyQuests = freshQuests;
            user.dailyCatnip = 0;
            user.dailyDiscovers = 0;
            user.dailyPremiumDiscovers = 0;

            await user.save();
        }

        console.log(`[Daily Quests] Reset completed at ${new Date().toLocaleString()}`);
    } catch (err) {
        console.error("Error resetting daily quests:", err);
    }

    // Schedule next reset
    setTimeout(resetDailyQuests, msUntilNextESTMidnight());
}

/**
 * Start the daily reset scheduler
 */
export function startDailyResetScheduler() {
    setTimeout(resetDailyQuests, msUntilNextESTMidnight());
}
