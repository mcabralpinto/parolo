const { Client, Events, GatewayIntentBits, Collection, EmbedBuilder } = require('discord.js')

const dotenv = require('dotenv')
const path = require('node:path')
dotenv.config({ path: path.join(__dirname, '..', '.env') })
const { TOKEN, CLIENT_ID } = process.env

const fs = require('node:fs')

const { scheduleAtHour } = require('./other/word_daily')

const commandsPath = path.join(__dirname, 'commands')
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'))

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions
    ]
})

client.commands = new Collection()


for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file)
    const command = require(filePath)
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command)
    } else {
        console.log(`This command in ${filePath} is with missing 'data' or 'execute'`)
    }
}

client.once(Events.ClientReady, async readyClient => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`)

    scheduleAtHour(client, 16, 0)
});

client.login(TOKEN)

/*! Embed options
const bwatch = new EmbedBuilder()
    .setColor('Green')
    .setTitle('Some title')
    .setDescription('Some description here')
    .addFields(
        { name: 'Regular field title', value: 'Some value here' },
        { name: '\u200B', value: '\u200B' },
        { name: 'Inline field title', value: 'Some value here', inline: true },
        { name: 'Inline field title', value: 'Some value here', inline: true },
    )
    .addFields({ name: 'Inline field title', value: 'Some value here', inline: true })
    .setImage('https://i.imgur.com/AfFp7pu.png')
    .setTimestamp()
    .setFooter({ text: 'Some footer text here', iconURL: 'https://i.imgur.com/AfFp7pu.png' });
*/

client.on(Events.InteractionCreate, async interaction => {
    // if (interaction.isStringSelectMenu()) {
    //     const selected = interaction.values[0]
    // switch (selected) {
    //     // Beginner

    //     case 'watch':
    //         await interaction.reply({ embeds: [bwatch] })
    //         break;

    //     default:
    //         break;
    // }

    if (interaction.isChatInputCommand()) {
        const command = interaction.client.commands.get(interaction.commandName)
        if (!command) {
            console.error('Command not found')
            return
        }
        try {
            await command.execute(interaction)
        } catch (error) {
            console.error(error)
            const errorMessage = 'An error occurred executing this command'
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: errorMessage, ephemeral: true }).catch(console.error)
            } else {
                await interaction.reply({ content: errorMessage, ephemeral: true }).catch(console.error)
            }
        }
    }
})


// node index.js