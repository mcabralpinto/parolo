const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')

const translateText = async (text) => {
    try {
        const translationData = await fetch(
            `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=it|en`
        ).then(res => res.json());
        const translation = translationData.responseData.translatedText;
        
        return {
            text: text,
            translation: translation
        };
    } catch (error) {
        console.error('Error translating text:', error);
        return {
            text: 'Errore durante la traduzione del testo',
            translation: 'Error translating text'
        };
    }
};

const createBox = async (interaction) => {
    await interaction.deferReply()

    const textToTranslate = interaction.options.getString('text');
    const { text, translation } = await translateText(textToTranslate)

    const wordEmbed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('**Translation**')
        .setTimestamp()
        .addFields(
            // { name: '\u200B', value: '\u200B' },
            { name: '🇮🇹 Italian', value: text },
            { name: '🇬🇧 English', value: translation },
            // { name: '\u200B', value: '\u200B' },
        );

    await interaction.editReply({ embeds: [wordEmbed] })
};

module.exports = {
	cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('it-en')
        .setDescription('Translates an Italian text to English.')
        .addStringOption(option =>
            option.setName('text')
                .setDescription('The Italian text to translate')
                .setRequired(true)),

    async execute(interaction) {
        createBox(interaction)
    }
}