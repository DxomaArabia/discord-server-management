const { ChannelType, PermissionFlagsBits } = require('discord.js');

const channelTypes = {
  text: ChannelType.GuildText,
  voice: ChannelType.GuildVoice,
  announcement: ChannelType.GuildAnnouncement,
  forum: ChannelType.GuildForum,
};

function flag(name) {
  const key = Object.keys(PermissionFlagsBits).find(
    (k) => k.toLowerCase() === String(name).toLowerCase()
  );
  return key ? PermissionFlagsBits[key] : null;
}

function isDestructive(action) {
  return action.type === 'deletechannel' || action.type === 'deleterole';
}

async function run(guild, actions, log) {
  const created = {};
  for (const a of actions) {
    try {
      if (a.type === 'reply') {
        log.push(a.text);
      } else if (a.type === 'createcategory') {
        const name = String(a.name || '').toLowerCase();
        const exists = guild.channels.cache.find((c) => c.name === name && c.type === ChannelType.GuildCategory);
        if (exists) {
          created[name] = exists.id;
          log.push(`category ${name} already exists, skipped`);
        } else {
          const c = await guild.channels.create({ name, type: ChannelType.GuildCategory });
          created[name] = c.id;
          log.push(`created category ${name}`);
        }
      } else if (a.type === 'createchannel') {
        const name = String(a.name || '').toLowerCase().replace(/\s+/g, '-');
        const type = channelTypes[a.channeltype] || ChannelType.GuildText;
        const parent = a.category
          ? created[String(a.category).toLowerCase()] ||
            guild.channels.cache.find(
              (c) => c.name === String(a.category).toLowerCase() && c.type === ChannelType.GuildCategory
            )?.id
          : undefined;
        if (guild.channels.cache.find((c) => c.name === name && c.type === type)) {
          log.push(`channel ${name} already exists, skipped`);
          continue;
        }
        await guild.channels.create({ name, type, parent: parent || undefined, topic: a.topic || undefined });
        log.push(`created channel ${name}${parent ? ' in category ' + a.category : ''}`);
      } else if (a.type === 'renamechannel') {
        const c = guild.channels.cache.get(a.id);
        if (!c) { log.push(`rename skipped, channel id not found`); continue; }
        await c.setName(String(a.name || '').toLowerCase().replace(/\s+/g, '-'));
        log.push(`renamed channel to ${a.name}`);
      } else if (a.type === 'deletechannel') {
        const c = guild.channels.cache.get(a.id);
        if (!c) { log.push(`delete skipped, channel id not found`); continue; }
        await c.delete();
        log.push(`deleted channel ${c.name}`);
      } else if (a.type === 'createrole') {
        const name = String(a.name || '').toLowerCase();
        if (guild.roles.cache.find((r) => r.name === name)) {
          log.push(`role ${name} already exists, skipped`);
          continue;
        }
        const perms = (a.permissions || []).map(flag).filter(Boolean);
        await guild.roles.create({
          name,
          color: a.color || undefined,
          permissions: perms,
          hoist: !!a.hoist,
          mentionable: !!a.mentionable,
        });
        log.push(`created role ${name}`);
      } else if (a.type === 'deleterole') {
        const r = guild.roles.cache.get(a.id);
        if (!r || r.managed || r.id === guild.id) { log.push(`delete role skipped, not allowed`); continue; }
        await r.delete();
        log.push(`deleted role ${r.name}`);
      } else if (a.type === 'setpermissions') {
        const c = guild.channels.cache.get(a.channelid);
        const role = a.roleid === '@everyone' ? guild.roles.everyone : guild.roles.cache.get(a.roleid);
        if (!c || !role) { log.push(`permission change skipped, target not found`); continue; }
        const allow = (a.allow || []).map(flag).filter(Boolean);
        const deny = (a.deny || []).map(flag).filter(Boolean);
        const overwrite = {};
        for (const p of allow) overwrite[p] = true;
        for (const p of deny) overwrite[p] = false;
        await c.permissionOverwrites.edit(role.id, overwrite);
        log.push(`updated permissions on ${c.name} for ${role.name}`);
      } else {
        log.push(`unknown action skipped`);
      }
    } catch (err) {
      log.push(`failed: ${a.type} (${err.message})`);
    }
  }
  return log;
}

module.exports = { run, isDestructive };
