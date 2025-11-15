// src/loot-tables/seedEventCats.js
import EventCat from "../models/EventCat.js";

const EVENT_NAME = "Christmas 2025";
const EVENT_START = new Date("2025-12-01T00:00:00Z");
const EVENT_END = new Date("2025-12-31T23:59:59Z");

const rarityMap = {
    Common: "Festive-R",
    Uncommon: "Festive-SR",
    Rare: "Festive-SSR",
    Epic: "Festive-UR",
    Legendary: "Festive-LR"
};

const baseCats = [
    // Rare (30)
    { name: 'Santa Claws Cat', description: 'Delivers purrs and presents.', rarity: 'Rare' },
    { name: 'Frosty Paws Cat', description: 'Chills in the snow all day.', rarity: 'Rare' },
    { name: 'Candy Cane Whiskers Cat', description: 'Sweet and striped like a candy cane.', rarity: 'Rare' },
    { name: 'Mistletoe Meow Cat', description: 'Kisses for everyone under the mistletoe.', rarity: 'Rare' },
    { name: 'Snowball Snuggles Cat', description: 'Loves snow and warm blankets alike.', rarity: 'Rare' },
    { name: 'Icicle Kitty Cat', description: 'Sharp looks and icy purrs.', rarity: 'Rare' },
    { name: 'Gingerbread Paws Cat', description: 'Bakes up trouble and treats.', rarity: 'Rare' },
    { name: 'Tinsel Tail Cat', description: 'Decorates everything with festive flair.', rarity: 'Rare' },
    { name: 'Jingle Bell Cat', description: 'Rings in fun wherever it goes.', rarity: 'Rare' },
    { name: 'Snowflake Whiskers Cat', description: 'Delicate as a snowflake.', rarity: 'Rare' },
    { name: 'Candy Cane Paws Cat', description: 'A treat for every pat.', rarity: 'Rare' },
    { name: 'Peppermint Purr Cat', description: 'Cool and refreshing.', rarity: 'Rare' },
    { name: 'Holiday Hopper Cat', description: 'Bounces around spreading cheer.', rarity: 'Rare' },
    { name: 'Chestnut Cheer Cat', description: 'Warm and cozy, loves firesides.', rarity: 'Rare' },
    { name: 'Yuletide Yowler Cat', description: 'Sings festive songs at night.', rarity: 'Rare' },
    { name: 'Frostbite Feline Cat', description: 'Cold but lovable.', rarity: 'Rare' },
    { name: 'Reindeer Paw Cat', description: 'Leads the sleigh pack.', rarity: 'Rare' },
    { name: 'Ornament Pouncer Cat', description: 'Plays with decorations constantly.', rarity: 'Rare' },
    { name: 'Cocoa Cuddler Cat', description: 'Loves hot cocoa and naps.', rarity: 'Rare' },
    { name: 'Gala Garland Cat', description: 'Adds sparkle to any party.', rarity: 'Rare' },
    { name: 'North Pole Nibbler Cat', description: 'Snacks around the North Pole.', rarity: 'Rare' },
    { name: 'Snowglobe Sniffer Cat', description: 'Curious about tiny winter worlds.', rarity: 'Rare' },
    { name: 'Frosty Fluff Cat', description: 'Extra fluffy in the snow.', rarity: 'Rare' },
    { name: 'Icicle Eyes Cat', description: 'Stares like a winter night sky.', rarity: 'Rare' },
    { name: 'Twinkle Toes Cat', description: 'Dances across rooftops.', rarity: 'Rare' },
    { name: 'Blizzard Buddy Cat', description: 'Never afraid of a snowstorm.', rarity: 'Rare' },
    { name: 'Evergreen Purr Cat', description: 'Green as the pine trees.', rarity: 'Rare' },
    { name: 'Holiday Hopper Cat', description: 'Spreads festive energy everywhere.', rarity: 'Rare' },
    { name: 'Frostpaw Cat', description: 'Silent as a falling snowflake.', rarity: 'Rare' },
    { name: 'Snowdrift Cat', description: 'Glides across snowy landscapes.', rarity: 'Rare' },

    // Epic (15)
    { name: 'Aurora Whiskers Cat', description: 'Lights up the night with magical colors.', rarity: 'Epic' },
    { name: 'Starlight Paws Cat', description: 'Walks among the stars.', rarity: 'Epic' },
    { name: 'Winter Solstice Cat', description: 'Balances night and day.', rarity: 'Epic' },
    { name: 'Blizzard King Cat', description: 'Commands the winter storms.', rarity: 'Epic' },
    { name: 'Crystal Pelt Cat', description: 'Shimmers like ice crystals.', rarity: 'Epic' },
    { name: 'Frostfire Cat', description: 'Cold as ice, fierce as fire.', rarity: 'Epic' },
    { name: 'Snowstorm Spirit Cat', description: 'Appears in heavy flurries.', rarity: 'Epic' },
    { name: 'Hollyheart Cat', description: 'Spreads love during winter.', rarity: 'Epic' },
    { name: 'Candy Cane Shadow Cat', description: 'Mysterious yet sweet.', rarity: 'Epic' },
    { name: 'Twilight Tux Cat', description: 'Dressed for night festivities.', rarity: 'Epic' },
    { name: 'Icicle Dancer Cat', description: 'Moves gracefully on frozen lakes.', rarity: 'Epic' },
    { name: 'Frostfang Cat', description: 'Sharp claws in snowy nights.', rarity: 'Epic' },
    { name: 'Everfrost Cat', description: 'Never melts, always magical.', rarity: 'Epic' },
    { name: 'Snowfire Cat', description: 'A rare mix of flame and frost.', rarity: 'Epic' },
    { name: 'Ginger Frost Cat', description: 'Spicy and icy at the same time.', rarity: 'Epic' },

    // Legendary (5)
    { name: 'Frosty Whiskers Cat Cat', description: 'A legendary snow cat with magical fur.', rarity: 'Legendary' },
    { name: 'Aurora Borealis Cat Cat', description: 'Casts the northern lights wherever it goes.', rarity: 'Legendary' },
    { name: 'Santa’s Spirit Cat', description: 'The guardian of holiday cheer.', rarity: 'Legendary' },
    { name: 'Blizzard Emperor Cat', description: 'Ruler of all winter cats.', rarity: 'Legendary' },
    { name: 'Crystal Snowpaw Cat', description: 'Fur sparkling like frozen diamonds.', rarity: 'Legendary' }
];

const eventCats = baseCats.map(cat => ({
    ...cat,
    eventName: EVENT_NAME,
    eventRarity: rarityMap[cat.rarity] || "Festive-R",
    startDate: EVENT_START,
    endDate: EVENT_END,
    isLimited: true
}));

export async function seedEventCats() {
    await EventCat.deleteMany({ eventName: EVENT_NAME });
    await EventCat.insertMany(eventCats);

    console.log(`🎄 Seeded ${eventCats.length} event cats for ${EVENT_NAME}!`);
}
