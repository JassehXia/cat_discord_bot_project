// src/utils/rollPersonality.js

/**
 * Rolls a random personality trait for a cat.
 * Returns null if no personality is rolled.
 */

const traits = [
    { name: 'Curious', type: 'xp', tierName: 'Minor', multiplier: 1.1 },
    { name: 'Playful', type: 'catnip', tierName: 'Minor', multiplier: 1.1 },
    { name: 'Lucky', type: 'both', tierName: 'Moderate', multiplier: 1.25 },
    { name: 'Energetic', type: 'xp', tierName: 'Moderate', multiplier: 1.25 },
    { name: 'Generous', type: 'catnip', tierName: 'Major', multiplier: 1.5 },
    { name: 'Legendary', type: 'both', tierName: 'Major', multiplier: 1.5 }
];

// Chance that a cat gets a personality trait
const PERSONALITY_CHANCE = 0.3; // 30%

export function rollPersonality() {
    if (Math.random() > PERSONALITY_CHANCE) return null;

    // Pick a random trait
    const trait = traits[Math.floor(Math.random() * traits.length)];

    // Return a new object so we don't accidentally modify the original
    return { ...trait };
}
