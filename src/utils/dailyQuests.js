export const dailyQuests = [
    { key: "discover_3", name: "Discover 3 Cats", target: 3, field: "dailyDiscovers", reward: { catnip: 50, xp: 50 } },
    { key: "discover_premium_1", name: "Discover 1 Premium Cat", target: 1, field: "dailyPremiumDiscovers", reward: { catnip: 100, xp: 100 } },
    { key: "earn_100_catnip", name: "Get 100 Catnip", target: 100, field: "dailyCatnip", reward: { catnip: 100, xp: 100 } }
];

export function getRandomQuests(amount) {
    const pool = [...dailyQuests];
    const selected = [];

    for (let i = 0; i < amount; i++) {
        const idx = Math.floor(Math.random() * pool.length);
        selected.push(pool[idx]);
        pool.splice(idx, 1);
    }

    return selected;
}
