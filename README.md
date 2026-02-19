# parolo

A Discord bot that sends a daily word in Italian (or any language) to configured channels across multiple servers.

## Features

- 🇮🇹 **Daily word** — sends a random translated word every day at a scheduled time
- ✅ **Reveal interaction** — users react to reveal the translation
- ⚙️ **Per-server config** — each server sets its own channel via `/config-daily-word`

## Setup

1. **Clone the repo**
   ```sh
   git clone https://github.com/mcabralpinto/parolo.git
   cd parolo
   ```

2. **Install dependencies**
   ```sh
   npm install
   ```

3. **Create a `.env` file** in the project root:
   ```env
   TOKEN=your_bot_token
   CLIENT_ID=your_application_id
   ```

4. **Register slash commands**
   ```sh
   node src/deploy-commands.js
   ```

5. **Start the bot**
   ```sh
   node src/index.js
   ```

## Credits

Structure based on [German Helper](https://github.com/IgorDGomes/German-Helper-Discord-Bot)