const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const { getRandomWord, MAX_WORD_RANGE } = require('../other/word_utils')

const createBox = (word, translation, description) => {
    const wordEmbed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('**Random Word**')
        .setDescription(description)
        .setTimestamp()
        .addFields(
            { name: '🇬🇧 English', value: word },
            { name: '🇮🇹 Italian', value: translation },
        );
    return wordEmbed;
};

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('random-en')
        .setDescription('Gives a random English word for which you can get the Italian translation.')
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

            const hiddenEmbed = createBox(word, '❓', 'React with ✅ to reveal the Italian translation')

            const message = await interaction.editReply({ embeds: [hiddenEmbed] })

            await message.react('✅')

            const filter = (reaction, user) => {
                return reaction.emoji.toString() === '✅' && user.id === interaction.user.id
            }

            const collector = message.createReactionCollector({ filter, max: 1, time: 60000 })

            collector.on('collect', async () => {
                const revealEmbed = createBox(word, translation, 'Translation revealed!')
                await message.edit({ embeds: [revealEmbed] })
            })

            collector.on('end', () => {
                // message.reactions.removeAll().catch(console.error)
            })
        } catch (error) {
            console.error('Error in random-en command:', error)
            throw error
        }
    }
}