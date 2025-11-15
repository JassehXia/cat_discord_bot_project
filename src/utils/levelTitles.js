export const levelTitles = [
    { level: 1, title: "Cat Novice" },
    { level: 5, title: "Cat Enthusiast" },
    { level: 10, title: "Cat Collector" },
    { level: 20, title: "Cat Master" },
    { level: 35, title: "Cat Legend" },
    { level: 50, title: "Cat Overlord" },
    { level: 75, title: "Cat Deity" },
    { level: 100, title: "Supreme Cat God" }
];

/**
 * Get the highest title the user qualifies for
 * @param {number} level
 */
export function getTitle(level) {
    let userTitle = levelTitles[0];
    for (const t of levelTitles) {
        if (level >= t.level) userTitle = t;
    }
    return userTitle;
}

/**
 * Calculate Catnip bonus multiplier based on title
 * +5% per title tier achieved
 * @param {number} level
 */
export function getCatnipMultiplier(level) {
    const highestTitle = getTitle(level);
    const titleIndex = levelTitles.findIndex(t => t.level === highestTitle.level);
    return 1 + titleIndex * 0.05; // 5% per title tier
}
