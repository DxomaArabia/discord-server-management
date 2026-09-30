async function snapshot(guild) {
  await guild.channels.fetch();
  await guild.roles.fetch();
  const channels = guild.channels.cache.map((c) => ({
    id: c.id,
    name: c.name,
    type: c.type,
    parent: c.parentId || null,
  }));
  const roles = guild.roles.cache.map((r) => ({
    id: r.id,
    name: r.name,
    color: r.hexColor,
    permissions: r.permissions.toArray(),
    position: r.position,
  }));
  return { name: guild.name, id: guild.id, channels, roles };
}

module.exports = { snapshot };
