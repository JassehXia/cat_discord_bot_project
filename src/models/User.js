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

    //Daily Stats
    dailyCatnip: { type: Number, default: 0 },
    dailyDiscovers: { type: Number, default: 0 },
    dailyPremiumDiscovers: { type: Number, default: 0 },

    //Daily Quest List
    // Daily Quest List
    dailyQuests: [
        {
            key: String,
            name: String,
            target: Number,
            field: String,
            progress: { type: Number, default: 0 },
            reward: {
                catnip: Number,
                xp: Number
            },
            completed: { type: Boolean, default: false }
        }
    ],


    lastDiscoverAt: { type: Date, default: null },
    catnip: { type: Number, default: 0 },

    // ⭐ NEW
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 }
});

export default mongoose.models.User || mongoose.model('User', userSchema);
