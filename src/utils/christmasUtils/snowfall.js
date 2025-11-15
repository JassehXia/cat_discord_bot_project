// utils/snowfall.js

const SNOW_CHARS = ['*', '❄', '.', '•'];

// Generate a single frame of snowfall
export function snowfallFrame(width = 25, height = 6) {
    let frame = '';
    for (let h = 0; h < height; h++) {
        let line = '';
        for (let w = 0; w < width; w++) {
            line += Math.random() < 0.15
                ? SNOW_CHARS[Math.floor(Math.random() * SNOW_CHARS.length)]
                : ' ';
        }
        frame += line + '\n';
    }
    return frame;
}

// Generate multiple frames for animation
export function snowfallFrames(frameCount = 5, width = 25, height = 6) {
    const frames = [];
    for (let i = 0; i < frameCount; i++) {
        let frame = '';
        for (let h = 0; h < height; h++) {
            let line = '';
            for (let w = 0; w < width; w++) {
                line += Math.random() < 0.15
                    ? SNOW_CHARS[Math.floor(Math.random() * SNOW_CHARS.length)]
                    : ' ';
            }
            if (i === 0 && h === 0) {
                // Add sparkles for epic and legendary rarities
                if (i === 0 && h === 0 && (i === 5 || i === 7)) {
                    line = '✨'.repeat(width);
                } else if (i === 0 && h === 0 && i > 5 && i < 10) {
                    line = '✨'.repeat(width);
                }
            }
            frame += line + '\n';
        }
        frames.push(frame);
    }
    return frames;
}
