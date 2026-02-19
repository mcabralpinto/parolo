const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')

const translateText = async (text) => {
    try {
        const translationData = await fetch(
            `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|it`
        ).then(res => res.json());
        const translation = translationData.responseData.translatedText;
        
        return {
            text: text,
            translation: translation
        };
    } catch (error) {
        console.error('Error translating text:', error);
        return {
            text: 'Error translating text',
            translation: 'Errore durante la traduzione del testo'
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
            { name: '🇬🇧 English', value: text },
            { name: '🇮🇹 Italian', value: translation },
            // { name: '\u200B', value: '\u200B' },
        );

    await interaction.editReply({ embeds: [wordEmbed] })
};

module.exports = {
	cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('en-it')
        .setDescription('Translates an English text to Italian.')
        .addStringOption(option =>
            option.setName('text')
                .setDescription('The English text to translate')
                .setRequired(true)),

    async execute(interaction) {
        createBox(interaction)
    }
}