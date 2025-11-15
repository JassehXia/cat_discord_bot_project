// src/models/Cat.js
import mongoose from 'mongoose';

export const personalitySchema = new mongoose.Schema({
    name: String,
    type: { type: String, enum: ['catnip', 'xp', 'both'] },
    tierName: { type: String, enum: ['Minor', 'Moderate', 'Major'] },
    multiplier: Number
}, { _id: false });

export const catSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    rarity: { type: String, required: true },
    personality: personalitySchema // optional trait
});

// Avoid overwrite errors (hot reload in dev)
export default mongoose.models.Cat || mongoose.model('Cat', catSchema);
