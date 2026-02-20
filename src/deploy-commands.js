const { REST, Routes } = require('discord.js')
const dotenv = require('dotenv')
const fs = require('node:fs')
const path = require('node:path')

dotenv.config({ path: path.join(__dirname, '..', '.env') })
const { TOKEN, CLIENT_ID } = process.env

const commandsPath = path.join(__dirname, 'commands')
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'))

const commands = []

for (const file of commandFiles) {
    const command = require(`./commands/${file}`)
    if (command.data && command.data.toJSON) {
        commands.push(command.data.toJSON())
    } else {
        console.error("Error: Command data is not defined or does not have a toJSON method.")
    }
}

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
    try {
        console.log(`Reseting ${commands.length} commands...`)

        const data = await rest.put(
            Routes.applicationCommands(CLIENT_ID),
            { body: commands }
        )
        console.log('Commands registered successfully!')
    }
    catch (error) {
        console.error(error)
    }
})()