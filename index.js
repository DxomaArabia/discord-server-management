require('dotenv').config();
const {
  Client,
  GatewayIntentBits,
  PermissionFlagsBits,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
} = require('discord.js');
const { snapshot } = require('./src/snapshot');
const { plan } = require('./src/ai');
const { run, isDestructive } = require('./src/actions');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const pending = new Map();

client.once('ready', () => console.log(`logged in as ${client.user.tag}`));

client.on('interactionCreate', async (interaction) => {
  try {
    if (interaction.isChatInputCommand() && interaction.commandName === 'manage') {
      if (!interaction.inGuild()) {
        return interaction.reply({ content: 'this command only works inside a server', flags: MessageFlags.Ephemeral });
      }
      if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
        return interaction.reply({ content: 'you need the manage server permission to use this', flags: MessageFlags.Ephemeral });
      }
      const modal = new ModalBuilder()
        .setCustomId('manage-modal')
        .setTitle('manage server')
        .addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId('request')
              .setLabel('what should i change?')
              .setPlaceholder('example: create community channels for chat gaming media and announcements')
              .setStyle(TextInputStyle.Paragraph)
              .setMaxLength(1000)
              .setRequired(true)
          )
        );
      return interaction.showModal(modal);
    }

    if (interaction.isModalSubmit() && interaction.customId === 'manage-modal') {
      const request = interaction.fields.getTextInputValue('request');
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      const me = interaction.guild.members.me;
      if (!me.permissions.has(PermissionFlagsBits.ManageChannels) || !me.permissions.has(PermissionFlagsBits.ManageRoles)) {
        return interaction.editReply('i need manage channels and manage roles permissions to do this');
      }

      const snap = await snapshot(interaction.guild);
      const result = await plan(request, snap);
      const destructive = result.actions.filter(isDestructive);
      const safe = result.actions.filter((a) => !isDestructive(a));

      if (destructive.length > 0) {
        pending.set(interaction.user.id, { safe, destructive, summary: result.summary });
        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('confirm-yes').setLabel('confirm').setStyle(ButtonStyle.Danger),
          new ButtonBuilder().setCustomId('confirm-no').setLabel('cancel').setStyle(ButtonStyle.Secondary)
        );
        const list = destructive.map((a) => `- ${a.type} ${a.id}`).join('\n');
        return interaction.editReply({
          content: `plan: ${result.summary || 'changes requested'}\n\nthese destructive actions need confirmation:\n${list}`,
          components: [row],
        });
      }

      const log = await run(interaction.guild, result.actions, [`plan: ${result.summary || 'changes requested'}`]);
      return interaction.editReply(log.join('\n').slice(0, 1900));
    }

    if (interaction.isButton() && (interaction.customId === 'confirm-yes' || interaction.customId === 'confirm-no')) {
      const job = pending.get(interaction.user.id);
      if (!job) {
        return interaction.update({ content: 'this request expired, please run the command again', components: [] });
      }
      pending.delete(interaction.user.id);
      if (interaction.customId === 'confirm-no') {
        return interaction.update({ content: 'cancelled, nothing was changed', components: [] });
      }
      await interaction.update({ content: 'executing...', components: [] });
      const log = await run(interaction.guild, [...job.safe, ...job.destructive], [`plan: ${job.summary || 'changes requested'}`]);
      return interaction.editReply(log.join('\n').slice(0, 1900));
    }
  } catch (err) {
    console.error(err);
    const msg = `something went wrong: ${err.message}`.slice(0, 1900);
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply(msg).catch(() => {});
    } else {
      await interaction.reply({ content: msg, flags: MessageFlags.Ephemeral }).catch(() => {});
    }
  }
});
client.login(process.env.token);
