// src/models/EventCat.js
import mongoose from 'mongoose';
import { catSchema } from './Cat.js';

// Clone the base schema so Mongoose doesn’t share internals
const eventCatSchema = new mongoose.Schema({
    ...catSchema.obj,  // inherit base cat fields

    // Additional event-only fields
    eventName: { type: String, required: true },
    eventRarity: { type: String, required: true }, // e.g. “Festive-UR”, “Spooky-SSR”
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isLimited: { type: Boolean, default: true }
});

// Prevent duplicate model registration
export default mongoose.models.EventCat || mongoose.model('EventCat', eventCatSchema);
