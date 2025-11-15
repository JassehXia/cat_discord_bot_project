// utils/snowfall.js

const BASE_PARTICLES = ['*', '❄', '.', '•'];

const SPECIAL_PARTICLES = {
    Rare: ['❄'],           // Mostly snow
    Epic: ['✨'],           // Stars
    Legendary: ['🌈', '⭐', '💫'] // Rainbows & sparkles
};

// Generate a single frame with mixed particles
export function snowfallFrame(width = 25, height = 6, rarity = 'Common') {
    const special = SPECIAL_PARTICLES[rarity] || [];
    const chars = [...BASE_PARTICLES, ...special]; // mix base + special
    let frame = '';
    for (let h = 0; h < height; h++) {
        let line = '';
        for (let w = 0; w < width; w++) {
            line += Math.random() < 0.15
                ? chars[Math.floor(Math.random() * chars.length)]
                : ' ';
        }
        frame += line + '\n';
    }
    return frame;
}

// Generate multiple frames for animation
export function snowfallFrames(frameCount = 5, width = 25, height = 6, rarity = 'Common') {
    const frames = [];
    for (let i = 0; i < frameCount; i++) {
        frames.push(snowfallFrame(width, height, rarity));
    }
    return frames;
}
