const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')

const MAX_WORD_RANGE = 20000; 
const data = require('subtlex-word-frequencies');
const commonWords = data.slice(0, MAX_WORD_RANGE).map(item => 
  typeof item === 'string' ? item : item.word || item
);

const getRandomItalianWord = async (wordRange = MAX_WORD_RANGE) => {
    try {
        const randomWord = commonWords[Math.floor(Math.random() * Math.min(wordRange, commonWords.length))];
        const translationData = await fetch(
            `https://api.mymemory.translated.net/get?q=${encodeURIComponent(randomWord)}&langpair=en|it`
        ).then(res => res.json());
        const translation = translationData.responseData.translatedText;
        
        return {
            word: randomWord,
            translation: translation
        };
    } catch (error) {
        console.error('Error fetching word:', error);
        return {
            word: 'Errore recuperando la parola',
            translation: 'Error fetching word'
        };
    }
};

const createBox = async (interaction) => {
    await interaction.deferReply()

    wordRange = interaction.options.getInteger('range');
    const { word, translation } = await getRandomItalianWord(wordRange)

    const wordEmbed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('**Random Word**')
        .setTimestamp()
        .addFields(
            // { name: '\u200B', value: '\u200B' },
            { name: '🇮🇹 Italian', value: translation },
            { name: '🇬🇧 English', value: word },
            // { name: '\u200B', value: '\u200B' },
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
                .setDescription('The slice of the list to use (e.g., searching in the 1000 most common words); max is 20000')),

    async execute(interaction) {
        createBox(interaction)
    },
    getRandomItalianWord,
    createBox
}