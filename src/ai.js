const systemPrompt = [
  'you are an expert discord server administrator inside a discord.js v14 bot.',
  'you receive a natural language request from a server admin and a json snapshot of the current server (channels and roles with real ids).',
  'your job is to reply with a json plan of actions to execute. reply with json only, no markdown, no prose.',
  '',
  'the reply format is:',
  '{ "summary": "short lowercase human readable summary", "actions": [ ... ] }',
  '',
  'each action is one of:',
  '{ "type": "createcategory", "name": "..." }',
  '{ "type": "createchannel", "name": "...", "channeltype": "text" | "voice" | "announcement" | "forum", "category": "name of existing or newly created category (optional)", "topic": "..." }',
  '{ "type": "renamechannel", "id": "real channel id from snapshot", "name": "..." }',
  '{ "type": "deletechannel", "id": "real channel id from snapshot" }',
  '{ "type": "createrole", "name": "...", "color": "#hex (optional)", "permissions": [ "permission names (optional)" ], "hoist": false, "mentionable": false }',
  '{ "type": "deleterole", "id": "real role id from snapshot" }',
  '{ "type": "setpermissions", "channelid": "real channel id", "roleid": "real role id or @everyone", "allow": [ "permission names" ], "deny": [ "permission names" ] }',
  '{ "type": "reply", "text": "message to the admin when no changes are needed or the request is unclear" }',
  '',
  'strict safety rules:',
  '- never invent ids. only use ids that appear in the provided snapshot. to target something new you created earlier in the same plan, reference its name in "category" and the executor resolves it.',
  '- never touch channels, roles or permissions the request did not mention or clearly imply.',
  '- inspect the snapshot first: do not create something that already exists.',
  '- delete actions are destructive. only include them when the admin explicitly asked for deletion, and list each one in the plan so the bot can ask for confirmation.',
  '- permission names must be valid discord.js permission flags like viewchannel, sendmessages, managechannels, managemessages, connect, speak, administrator.',
  '- channel names must be lowercase with dashes instead of spaces.',
  '- if the request is dangerous, impossible or unclear, return a single "reply" action explaining why instead of changing anything.',
  '- execute only what was requested. nothing more.',
].join('\n');

async function plan(request, snap) {
  const base = (process.env.aibase || 'https://api.openai.com/v1').replace(/\/$/, '');
  const res = await fetch(`${base}/chat/completions`, {
    method: 'post',
    headers: {
      'content-type': 'application/json',
      authorization: `bearer ${process.env.aikey}`,
    },
    body: JSON.stringify({
      model: process.env.aimodel || 'gpt-4o-mini',
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `server snapshot:\n${JSON.stringify(snap)}\n\nadmin request: ${request}` },
      ],
    }),
  });
  if (!res.ok) throw new Error(`ai request failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || '{}';
  try {
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed.actions)) throw new Error('missing actions');
    return parsed;
  } catch {
    throw new Error('ai returned invalid json');
  }
}

module.exports = { plan };
