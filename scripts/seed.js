// scripts/seed.js
import dotenv from "dotenv";
import mongoose from "mongoose";

import { seedCats } from "../src/loot-tables/seedCats.js";
import { seedEventCats } from "../src/loot-tables/seedEventCats.js";

dotenv.config();

async function runSeeder() {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);

        console.log("🌱 Running seeders...\n");

        await seedCats();
        await seedEventCats();

        console.log("\n✅ All seeders completed!");
    } catch (err) {
        console.error("❌ Seeder error:", err);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB");
    }
}

runSeeder();
