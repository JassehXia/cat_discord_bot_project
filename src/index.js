import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Client, Collection, GatewayIntentBits } from 'discord.js';
import mongoose from 'mongoose';
import express from 'express'; // ✅ add Express

//--------------------- In Project Imports -----------------------
import { startDailyResetScheduler } from "./utils/dailyReset.js";

// -------------------- Keep-alive Web Server --------------------
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Bot is running 24/7 on Render!');
});

app.listen(PORT, () => console.log(`Keep-alive web server running on port ${PORT}`));
// --------------------------------------------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));

for (const file of commandFiles) {
    const { default: command } = await import(`./commands/${file}`);
    client.commands.set(command.data.name, command);
    console.log(`Loaded command: ${command.data.name}`);
}

client.once('clientReady', () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
    startDailyResetScheduler();
});

client.on('interactionCreate', async (interaction) => {
    console.log('Interaction received');
    if (!interaction.isCommand()) return;

    console.log('Command:', interaction.commandName);
    const command = client.commands.get(interaction.commandName);
    if (!command) {
        console.log('Command not found!');
        return;
    }

    try {
        await command.execute(interaction);
    } catch (err) {
        console.error('Error executing command:', err);
        await interaction.reply({ content: '❌ Error executing command', ephemeral: true });
    }
});

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB');
        client.login(process.env.DISCORD_TOKEN);
    })
    .catch(err => console.error('❌ MongoDB connection error:', err));
