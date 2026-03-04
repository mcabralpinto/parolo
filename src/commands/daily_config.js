const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const fs = require('node:fs')
const path = require('node:path')

const configPath = path.join(__dirname, '..', 'data/daily_config.json')

const getConfig = () => {
    if (fs.existsSync(configPath)) {
        return JSON.parse(fs.readFileSync(configPath, 'utf8'))
    }
    return {}
}

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('config-daily-word')
        .setDescription('Sets or clears the channel where the daily Italian word will be sent.')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel to send the daily word to. Leave empty to clear.')
                .setRequired(false)),

    async execute(interaction) {
        if (!interaction.memberPermissions.has('Administrator')) {
            await interaction.reply({ content: 'You need Administrator permissions to use this command.', ephemeral: true })
            return
        }

        const channel = interaction.options.getChannel('channel')
        const guildId = interaction.guildId
        const guildName = interaction.guild.name
        const config = getConfig()
        if (!config[guildId]) config[guildId] = {}

        if (channel) {
            config[guildId].dailyChannelId = channel.id
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
            console.log(`Server "${guildName}" had its Daily Word channel changed to #${channel.name}`)

            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle('Daily Channel Set')
                .setDescription(`Daily Italian word will be sent to ${channel}`)
                .setTimestamp()

            await interaction.reply({ embeds: [embed] })
        } else {
            delete config[guildId].dailyChannelId
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
            console.log(`Server "${guildName}" had its Daily Word channel cleared.`)

            const embed = new EmbedBuilder()
                .setColor(0xFF9900)
                .setTitle('Daily Channel Cleared')
                .setDescription('The daily Italian word channel has been cleared. No words will be sent until a new channel is configured.')
                .setTimestamp()

            await interaction.reply({ embeds: [embed] })
        }
    }
}