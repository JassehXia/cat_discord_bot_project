// src/utils/addXP.js

/**
 * Adds XP to a user and handles level-ups.
 * 
 * Leveling formula:
 * XP needed = level * 100
 * 
 * @param {User} user - Mongoose user document
 * @param {number} amount - How much XP to add
 * @returns {boolean} whether the user leveled up
 */
export function addXP(user, amount) {
    if (!user || typeof amount !== 'number') return false;

    user.xp = (user.xp || 0) + amount;

    let leveledUp = false;

    // Level-up loop in case a big XP reward jumps multiple levels
    while (user.xp >= user.level * 100) {
        user.xp -= user.level * 100;
        user.level += 1;
        leveledUp = true;
    }

    return leveledUp;
}
