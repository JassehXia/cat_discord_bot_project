// src/models/Cat.js
import mongoose from 'mongoose';

export const catSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    rarity: { type: String, required: true }
});

// Avoid overwrite errors (hot reload in dev)
export default mongoose.models.Cat || mongoose.model('Cat', catSchema);
