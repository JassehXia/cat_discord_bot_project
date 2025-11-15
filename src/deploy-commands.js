import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import path from 'path';
import { REST, Routes } from 'discord.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));

for (const file of commandFiles) {
    const { default: command } = await import(`./commands/${file}`);
    commands.push(command.data.toJSON());
}

console.log('Commands to deploy:', commands.map(c => c.name));

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log('🔄 Registering commands to guild...');
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands }
        );
        console.log('✅ Commands registered successfully!');
    } catch (err) {
        console.error('❌ Error registering commands:', err);
    }
})();
