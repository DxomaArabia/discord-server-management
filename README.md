# Discord Server Management

An AI-powered Discord server management bot that allows administrators to manage their Discord servers using natural language.

Instead of manually creating channels, configuring roles, or organizing your server, simply describe what you want, review the generated plan, and let the bot handle it.

## Features

- **AI-Powered Management** — Manage your Discord server using natural language.
- **Smart Planning** — Converts your requests into structured actions.
- **Preview System** — Review all planned changes before executing them.
- **Confirmation System** — Confirm or cancel operations before they are applied.
- **Destructive Action Protection** — Additional confirmation for potentially destructive operations.
- **Channel Management** — Create, edit, delete, and organize channels.
- **Category Management** — Create and manage server categories.
- **Role Management** — Create, edit, and manage server roles.
- **Permission Management** — Configure channel and role permissions.
- **Validation System** — Validate planned actions before execution.
- **Safe Execution** — Executes actions in a controlled sequence.
- **Error Handling** — Handles failed actions and reports execution results.

## How It Works

The bot follows a simple workflow:

1. The administrator submits a management request.
2. The bot collects the necessary server information.
3. The AI analyzes the request and generates an action plan.
4. The bot displays a preview of the planned changes.
5. The administrator reviews and confirms the plan.
6. The bot executes the approved actions.
7. The bot reports the results.

## Example Requests

You can use requests such as:

- `Create a category called Support and add ticket, help and report channels.`
- `Create a staff role with access to the moderation channels.`
- `Organize my server into categories for community, gaming and staff.`
- `Create a private staff category with chat and logs channels.`
- `Create a announcements channel and allow only administrators to send messages.`
- `Delete the old unused channels.`

## Requirements

- Node.js 20 or newer
- A Discord Bot Application
- Discord Bot Token
- AI API Key
- Required Discord permissions

## Installation

Clone the repository:

```bash
git clone https://github.com/DxomaArabia/discord-server-management.git
```

Navigate to the project directory:

```bash
cd discord-server-management
```

Install dependencies:

```bash
npm install
```

## Configuration

Create a `.env` file in the root directory:

```env
DISCORD_TOKEN=your_discord_bot_token
CLIENT_ID=your_discord_application_id
OPENAI_API_KEY=your_openai_api_key
```

Replace the values with your actual credentials.

**Never share your bot token or API key, and never upload your `.env` file to GitHub.**

## Discord Bot Setup

1. Open the [Discord Developer Portal](https://discord.com/developers/applications).
2. Create a new application or select an existing one.
3. Open the **Bot** section and create your bot.
4. Copy the bot token and add it to your `.env` file.
5. Enable the required intents if the project requires them.
6. Under **OAuth2 → URL Generator**, select the required scopes and permissions.
7. Invite the bot to your server.

### Required Permissions

The bot may require the following permissions depending on the requested operations:

- Manage Channels
- Manage Roles
- View Channels
- Send Messages
- Read Message History
- Use Application Commands

Make sure the bot's role is positioned appropriately in the server role hierarchy.

## Usage

Start the bot:

```bash
node index.js
```

Use the `/manage` command in your Discord server and describe the changes you want to make.

Review the generated plan, then confirm or cancel the operation.

## Safety

This project is designed with safety in mind:

- Actions are reviewed before execution.
- Planned actions are validated.
- Destructive operations require additional confirmation.
- Pending plans expire automatically.
- Operations are executed only after administrator confirmation.

Always review the preview carefully before approving any changes.

## Project Structure

```text
discord-server-management/
├── index.js
├── package.json
├── .env
├── .env.example
├── src/
│   ├── ai.js
│   ├── actions.js
│   ├── snapshot.js
│   ├── validation.js
│   ├── response.js
│   └── deploy.js
└── README.md
```

## Contributing

Contributions, suggestions, bug reports, and feature requests are welcome.

If you want to improve the project:

1. Fork the repository.
2. Create a new branch.
3. Make your changes.
4. Test your changes.
5. Submit a Pull Request.

## License

This project is provided for educational and development purposes. Please check the repository for the applicable license.

---

**Developed by EpicDxoma**
