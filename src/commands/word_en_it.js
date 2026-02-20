const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')

const COMMON_WORD_LIMIT = 5000;
const data = require('subtlex-word-frequencies');
const commonWords = data.slice(0, COMMON_WORD_LIMIT).map(item =>
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
                .setDescription('The slice of the list to use (e.g., searching in the 1000 most common words); max is 20000')),

    async execute(interaction) {
        await interaction.deferReply()

        const wordRange = interaction.options.getInteger('range');
        const { word, translation } = await getRandomItalianWord(wordRange)

        const hiddenEmbed = createBox(word, '❓', 'React with ✅ to reveal the English translation')

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
            // message.reactions.removeAll()
        })
    }
}