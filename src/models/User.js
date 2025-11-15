import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    discordId: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    cats: [
        {
            cat: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                refPath: 'cats.model'
            },
            model: {
                type: String,
                required: true,
                enum: ['Cat', 'EventCat']
            },
            quantity: { type: Number, default: 1 }
        }
    ],
    lastDiscoverAt: { type: Date, default: null },
    catnip: { type: Number, default: 0 },

    // ⭐ NEW
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 }
});

export default mongoose.models.User || mongoose.model('User', userSchema);
