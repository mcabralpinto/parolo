const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js')
const { getRandomWord, MAX_WORD_RANGE } = require('../other/word_utils')

const createBox = (word, translation, description) => {
    const wordEmbed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('**Random Word**')
        .setDescription(description)
        .setTimestamp()
        .addFields(
            { name: '🇮🇹 Italian', value: translation },
            { name: '🇬🇧 English', value: word },
        );
    return wordEmbed;
};

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('random-it')
        .setDescription('Gives a random Italian word for which you can get the English translation.')
        .addIntegerOption(option =>
            option.setName('range')
                .setDescription('The slice of the list to use (e.g., searching in the 1000 most common words); max is 20000')
                .setMinValue(1)
                .setMaxValue(MAX_WORD_RANGE)),

    async execute(interaction) {
        await interaction.deferReply()

        try {
            const wordRange = interaction.options.getInteger('range');
            const { word, translation } = await getRandomWord(wordRange, 'en|it')

            const hiddenEmbed = createBox('❓', translation, 'Click the button to reveal the English translation')

            const revealButton = new ButtonBuilder()
                .setCustomId('reveal')
                .setLabel('✅ Reveal')
                .setStyle(ButtonStyle.Primary)

            const row = new ActionRowBuilder().addComponents(revealButton)

            const message = await interaction.editReply({ embeds: [hiddenEmbed], components: [row] })

            const collector = message.createMessageComponentCollector({
                componentType: ComponentType.Button,
                filter: i => i.customId === 'reveal' && i.user.id === interaction.user.id,
                max: 1,
                time: 60000
            })

            collector.on('collect', async i => {
                const revealEmbed = createBox(word, translation, 'Translation revealed!')
                await i.update({ embeds: [revealEmbed], components: [] })
            })

            collector.on('end', async (collected) => {
                if (collected.size === 0) {
                    const disabledRow = new ActionRowBuilder().addComponents(
                        ButtonBuilder.from(revealButton).setDisabled(true)
                    )
                    await interaction.editReply({ components: [disabledRow] }).catch(() => { })
                }
            })
        } catch (error) {
            console.error('Error in random-it command:', error)
            throw error
        }
    }
}