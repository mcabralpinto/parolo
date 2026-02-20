const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const { getRandomWord, MAX_WORD_RANGE } = require('../other/word_utils')

const createBox = async (interaction) => {
    const wordRange = interaction.options.getInteger('range');
    const { word, translation } = await getRandomWord(wordRange, 'en|it')

    const wordEmbed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('**Random Word**')
        .setTimestamp()
        .addFields(
            { name: '🇮🇹 Italian', value: translation },
            { name: '🇬🇧 English', value: word },
        );

    await interaction.editReply({ embeds: [wordEmbed] })
};

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('random')
        .setDescription('Gives a random Italian word with English translation from a list ordered by frequency.')
        .addIntegerOption(option =>
            option.setName('range')
                .setDescription('The slice of the list to use (e.g., searching in the 1000 most common words); max is 20000')
                .setMinValue(1)
                .setMaxValue(MAX_WORD_RANGE)),

    async execute(interaction) {
        await interaction.deferReply()
        await createBox(interaction)
    }
}