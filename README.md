# Temp Rooms - Discord Bot for Temporary Voice Channels

**Temp Rooms** is a Discord bot that allows you to create temporary voice channels. When a user joins a specific "generator" channel, the bot automatically creates a new custom voice channel for that user. The channel is automatically deleted when it becomes empty.

## Features

- **Automatic Creation**: Join the generator channel to instantly create a custom voice channel.
- **Automatic Deletion**: Channels are automatically deleted when they become empty.
- **Customization**: Each created channel will have a custom name with the user's name or progressive numbering.
- **Security**: Only server users can access the temporary channels.
- **Dynamic Configuration**: Slash commands to configure the bot directly from Discord.


## Requirements

- [Node.js](https://nodejs.org/) v16.6.0 or higher
- A Discord bot registered on the [Discord Developer Portal](https://discord.com/developers/applications)


## Installation

1. Clone the repository:

```bash
git clone https://github.com/Piixell/temp-rooms-open.git
cd temp-rooms-open
```

2. Install the dependencies:

```bash
npm install
```

3. Create a `.env` file in the project's root directory:

```bash
cp .env.example .env
```

4. Configure the environment variables in the `.env` file:

```env
DISCORD_TOKEN=your_bot_token
CLIENT_ID=your_discord_application_id
PORT=3000

# Channel Configuration
GENERATOR_CHANNEL_ID=
CATEGORY_ID=
CONTROL_CHANNEL_ID=
CHANNEL_NAME_TEMPLATE=🔊 Room #
DEFAULT_USER_LIMIT=0
MAX_CHANNELS=10
```

5. Register the bot's slash commands:

```bash
npm run deploy-commands
```


## Bot Configuration on Discord

1. Create a new bot on the [Discord Developer Portal](https://discord.com/developers/applications).
2. Copy the bot token and application ID and paste them into their respective variables in the `.env` file.
3. Invite the bot to your server using the OAuth2 URL Generator with the necessary permissions.
4. Create a voice channel that will act as a "generator" (e.g., "➕ Create Room").
5. Create a category where the temporary channels will be created.
6. Use the slash commands to configure the bot:
    - `/setup` - Guide for initial setup.
    - `/config set` - Set the server configurations.
    - `/config view` - View the current configurations.

## Starting the Bot

To start the bot, run:

```bash
npm start
```

Or directly with Node.js:

```bash
node index.js
```

If the bot starts correctly, you will see the message "TempRooms is online!" in the console.

## Usage

1. Use `/setup` for the initial configuration.
2. Use `/config set generator_channel #channel-name` to set the generator channel.
3. Use `/config set category #category-name` to set the category.
4. Join the "generator" voice channel you have configured.
5. The bot will automatically create a new custom voice channel for you.
6. When all users leave the channel, it will be automatically deleted.

## Available Commands

- `/setup` - Guide for initial setup.
- `/config view` - View the current configuration.
- `/config set` - Set a configuration.
- `/config reset` - Reset to default settings.
- `/limit` - Set the user limit for the current channel.


## Customizing Channel Names

The bot supports two formats for the names of temporary channels:

1. **Username**: Use `{username}` to include the name of the user creating the channel.
    - Example: `🔊 Room of {username}` → `🔊 Room of John`
2. **Progressive Numbering**: Use `#` to create automatic numbering.
    - Example: `🔊 Room #` → `🔊 Room #1`, `🔊 Room #2`, etc.

You can change the format using the command:

```
/config set channel_name_template "Your format"
```


## Project Structure

```
/temp-rooms-open
├── index.js                    # Main bot code
├── package.json               # Dependencies and project information
├── .env.example               # Example file for environment variables
├── .gitignore                 # Files to ignore in version control
├── README.md                  # This file
├── commands/
│   ├── deploy-commands.js    # Script to register slash commands
│   └── handlers/             # Handlers for slash commands
│       ├── configHandler.js
│       ├── setupHandler.js
│       └── limitHandler.js
```


## Technologies Used

- [Node.js](https://nodejs.org/)
- [discord.js](https://discord.js.org/) v14
- [dotenv](https://github.com/motdotla/dotenv) for managing environment variables.


## Contributing

1. Fork the project.
2. Create a branch for your feature (`git checkout -b feature/NewFeature`).
3. Commit your changes (`git commit -m 'Add new feature'`).
4. Push to the branch (`git push origin feature/NewFeature`).
5. Open a Pull Request.

## License

This project is distributed under the MIT License. See the `LICENSE` file for more information.

## Support

For any issues or questions, open an issue on GitHub or contact the developer.