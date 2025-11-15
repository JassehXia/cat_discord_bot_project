// src/utils/rollPersonality.js
const baseTraits = [
    { name: 'Playful', type: 'catnip' },
    { name: 'Curious', type: 'xp' },
    { name: 'Loyal', type: 'both' },
    { name: 'Mischievous', type: 'catnip' },
    { name: 'Wise', type: 'xp' },
    { name: 'Energetic', type: 'both' }
];

const traitTiers = [
    { tier: 'Minor', multiplier: 1.1, chance: 0.5 },
    { tier: 'Moderate', multiplier: 1.2, chance: 0.35 },
    { tier: 'Major', multiplier: 1.3, chance: 0.15 }
];

/**
 * Roll a personality trait for a cat
 * @returns {Object|null} Trait object or null if no trait
 */
export function rollPersonality() {
    if (Math.random() > 0.2) return null; // 20% chance

    const trait = baseTraits[Math.floor(Math.random() * baseTraits.length)];

    // Roll tier
    const tierRoll = Math.random();
    let cumulative = 0;
    let tier = traitTiers[0];
    for (const t of traitTiers) {
        cumulative += t.chance;
        if (tierRoll < cumulative) {
            tier = t;
            break;
        }
    }

    return {
        name: trait.name,
        type: trait.type,
        tierName: tier.tier,
        multiplier: tier.multiplier
    };
}
