import User from "../models/User.js";
import { getRandomQuests } from "./dailyQuests.js";

// Number of daily quests per user
const QUESTS_PER_DAY = 3;

// Helper: get current EST date as YYYY-MM-DD
function getESTDateString(offsetDays = 0) {
    const now = new Date();
    const estOffset = -5 * 60; // EST UTC-5
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const estNow = new Date(utc + estOffset * 60000 + offsetDays * 86400000);
    return estNow.toISOString().split("T")[0];
}

// Reset all users' daily quests
export async function resetDailyQuests() {
    try {
        const users = await User.find({});

        const today = getESTDateString();

        for (const user of users) {
            const lastReset = user.lastDailyReset ? user.lastDailyReset.toISOString().split("T")[0] : null;

            if (lastReset !== today) {
                const freshQuests = getRandomQuests(QUESTS_PER_DAY).map(q => ({
                    ...q,
                    progress: 0,
                    completed: false
                }));

                user.dailyQuests = freshQuests;
                user.dailyCatnip = 0;
                user.dailyDiscovers = 0;
                user.dailyPremiumDiscovers = 0;
                user.lastDailyReset = new Date();
                await user.save();
            }
        }

        console.log(`[Daily Reset] Daily quests reset for all users at EST ${today}`);
    } catch (err) {
        console.error("[Daily Reset] Error resetting quests:", err);
    }
}

// Schedule the reset to run at midnight EST every day
export function scheduleDailyReset() {
    const now = new Date();

    // EST midnight in milliseconds
    const estOffset = -5 * 60; // UTC-5
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const estNow = new Date(utc + estOffset * 60000);

    const nextMidnight = new Date(estNow);
    nextMidnight.setHours(24, 0, 0, 0); // next midnight
    const delay = nextMidnight.getTime() - estNow.getTime();

    setTimeout(() => {
        resetDailyQuests();

        // Then run every 24h
        setInterval(resetDailyQuests, 24 * 60 * 60 * 1000);
    }, delay);

    console.log(`[Daily Reset] Scheduled daily quest reset in ${Math.floor(delay / 1000)} seconds`);
}
