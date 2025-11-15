// src/loot-tables/seedCats.js
import Cat from "../models/Cat.js";

const normalCats = [
    { name: "Whisker Cat", description: "A curious cat with big whiskers.", rarity: "Common" },
    { name: "Shadow Cat", description: "Sneaky and silent.", rarity: "Common" },
    { name: "Pounce Cat", description: "Always ready to jump.", rarity: "Common" },
    { name: "Furry Cat", description: "Soft and cuddly.", rarity: "Common" },
    { name: "Tailflick Cat", description: "Playful and mischievous.", rarity: "Common" },
    { name: "Kitty Cat", description: "Adorable and affectionate.", rarity: "Common" },
    { name: "Mittens Cat", description: "Warm and cozy.", rarity: "Common" },
    { name: "Snuggles Cat", description: "Loves to snuggle.", rarity: "Common" },
    { name: "Cuddle Cat", description: "Just wants to be close.", rarity: "Common" },
    { name: "Snout Cat", description: "Loves to burrow.", rarity: "Common" },

    { name: "Moonlit Cat", description: "Glows faintly in the night.", rarity: "Uncommon" },
    { name: "Rusty Cat", description: "Orange and mischievous.", rarity: "Uncommon" },
    { name: "Splash Cat", description: "Loves water more than most cats.", rarity: "Uncommon" },
    { name: "Glimmer Cat", description: "Shines with a faint glow.", rarity: "Uncommon" },
    { name: "Frostbite Cat", description: "Can survive in cold climates.", rarity: "Uncommon" },
    { name: "Pixie Cat", description: "Mischievous and playful.", rarity: "Uncommon" },
    { name: "Starlight Cat", description: "Twinkles like the stars.", rarity: "Uncommon" },
    { name: "Breeze Cat", description: "Loves to feel the wind.", rarity: "Uncommon" },
    { name: "Ripple Cat", description: "Creates small waves in water.", rarity: "Uncommon" },

    { name: "Knight Cat", description: "Brave protector of cat kingdoms.", rarity: "Rare" },
    { name: "Stormrunner Cat", description: "Fast as a lightning strike.", rarity: "Rare" },
    { name: "Crystal Claw Cat", description: "Fur shines like gemstones.", rarity: "Rare" },
    { name: "Thunderbolt Cat", description: "Electrifying speed.", rarity: "Rare" },
    { name: "Galeforce Cat", description: "Strong winds follow this cat.", rarity: "Rare" },
    { name: "Maelstrom Cat", description: "Whirlpools of energy surround this cat.", rarity: "Rare" },
    { name: "Stormsurge Cat", description: "Electrifying energy crackles around this cat.", rarity: "Rare" },

    { name: "Phantom Cat", description: "Moves between shadows.", rarity: "Epic" },
    { name: "Titan Paw Cat", description: "Strong enough to break boulders.", rarity: "Epic" },
    { name: "Inferno Cat", description: "Burning spirit and blazing fur.", rarity: "Epic" },
    { name: "Aurora Cat", description: "Northern lights dance around this cat.", rarity: "Epic" },
    { name: "Solar Flare Cat", description: "Bursts of energy erupt around this cat.", rarity: "Epic" },

    { name: "Celestial Cat", description: "A guardian from the stars.", rarity: "Legendary" },
    { name: "Chrono Cat", description: "Manipulates time in mysterious ways.", rarity: "Legendary" },
    { name: "Mythic Nine-Lives Cat", description: "Rumored to be truly immortal.", rarity: "Legendary" }
];

export async function seedCats() {
    await Cat.deleteMany({});
    await Cat.insertMany(normalCats);
    console.log(`🐾 Seeded ${normalCats.length} normal cats!`);
}
