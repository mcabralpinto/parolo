# parolo

A Discord bot that sends a daily word in Italian (or any language) to configured channels across multiple servers.

You can invite to your server through [this link](https://discord.com/oauth2/authorize?client_id=1473726535507644587&permissions=274878000128&integration_type=0&scope=bot).

## Features

- **Daily word** - sends a random translated word every day at a scheduled time to a configurable channel
- **Both-way translation** - command that translates text from English to Italian and vice-versa
- **Random word** - command that sends a random word and its translation to the users; has variants that hides one of the words

## Running Locally

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