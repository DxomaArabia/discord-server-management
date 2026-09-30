require('dotenv').config();
const { REST, Routes, SlashCommandBuilder } = require('discord.js');

const command = new SlashCommandBuilder()
  .setName('manage')
  .setDescription('manage this server with a natural language request')
  .setDefaultMemberPermissions('0')
  .toJSON();

const rest = new REST().setToken(process.env.token);

(async () => {
  try {
    await rest.put(Routes.applicationCommands(process.env.clientid), { body: [command] });
    console.log('slash command deployed globally');
  } catch (err) {
    console.error('deploy failed:', err);
    process.exit(1);
  }
})();
