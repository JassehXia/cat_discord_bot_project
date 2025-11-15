// src/utils/generateRandomCat.js
export async function rollRandomCat() {
    if (!activeLootTable.length) throw new Error('No cats in the active loot table!');

    const rarities = [
        { type: 'Common', chance: 0.6 },
        { type: 'Uncommon', chance: 0.25 },
        { type: 'Rare', chance: 0.1 },
        { type: 'Epic', chance: 0.04 },
        { type: 'Legendary', chance: 0.01 }
    ];

    const roll = Math.random();
    let rarity = 'Common';
    let cumulative = 0;
    for (const r of rarities) {
        cumulative += r.chance;
        if (roll < cumulative) { rarity = r.type; break; }
    }

    const catsOfRarity = activeLootTable.filter(c => c.rarity === rarity);

    // fallback if no cats of that rarity exist
    if (!catsOfRarity.length) {
        console.warn(`No cats found for rarity ${rarity}, defaulting to a random cat`);
        return activeLootTable[Math.floor(Math.random() * activeLootTable.length)];
    }

    const catData = catsOfRarity[Math.floor(Math.random() * catsOfRarity.length)];

    let cat = await Cat.findOne({ name: catData.name });
    if (!cat) {
        cat = await Cat.create({ ...catData });
    }

    return cat;
}
