const { EmbedBuilder } = require('discord.js')
const fs = require('node:fs')
const path = require('node:path')

const COMMON_WORD_LIMIT = 5000;
const data = require('subtlex-word-frequencies');
const commonWords = data.slice(0, COMMON_WORD_LIMIT).map(item =>
    typeof item === 'string' ? item : item.word || item
);

const getRandomItalianWord = async () => {
    try {
        const randomWord = commonWords[Math.floor(Math.random() * commonWords.length)];
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

const sendDailyWord = async (channel) => {
    try {
        const { word, translation } = await getRandomItalianWord()

        const hiddenEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('**Daily Word**')
            .setDescription("React with ✅ to reveal the English translation")
            .setTimestamp()
            .addFields(
                // { name: '\u200B', value: '\u200B' },
                { name: '🇮🇹 Italian', value: translation },
                { name: '🇬🇧 English', value: '❓' },
                // { name: '\u200B', value: '\u200B' },
            );

        const message = await channel.send({ embeds: [hiddenEmbed] })
        await message.react('✅')

        const filter = (reaction, user) => reaction.emoji.toString() === '✅' && !user.bot
        const collector = message.createReactionCollector({ filter, max: 1, time: 60_000 })

        collector.on('collect', async () => {
            const revealEmbed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle('**Daily Word**')
                .setDescription('Translation revealed!')
                .setTimestamp()
                .addFields(
                    // { name: '\u200B', value: '\u200B' },
                    { name: '🇮🇹 Italian', value: translation },
                    { name: '🇬🇧 English', value: word },
                    // { name: '\u200B', value: '\u200B' },
                );
            await message.edit({ embeds: [revealEmbed] })
        })

        collector.on('end', () => {
            message.reactions.removeAll().catch(() => { })
        })
    } catch (err) {
        console.error('Error sending daily word:', err)
    }
}

const getChannel = async (client, guildId) => {
    const configPath = path.join(__dirname, '..', 'data/daily_config.json')
    let config = {}

    if (fs.existsSync(configPath)) {
        config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
    }

    // Per-guild channel config, keyed by guildId
    const channelId = guildId ? config[guildId]?.dailyChannelId : null

    if (!channelId) {
        console.error(`No daily channel configured for guild ${guildId}. Use /set-daily-channel to set one.`)
        return null
    }
    return await client.channels.fetch(channelId)
};

const scheduleAtHour = (client, hour = 0, minute = 0) => {
    const now = new Date()
    let next = new Date(now)
    next.setHours(hour, minute, 0, 0)
    if (next <= now) next.setDate(next.getDate() + 1)
    const ms = next - now
    console.log('Current time:', now)
    console.log('Next scheduled time:', next)
    console.log('Milliseconds until next scheduled time:', ms)
    setTimeout(async () => {
        // Run for every guild the bot is in
        for (const [guildId] of client.guilds.cache) {
            const channel = await getChannel(client, guildId)
            if (!channel) continue
            sendDailyWord(channel)
        }
        setInterval(async () => {
            for (const [guildId] of client.guilds.cache) {
                const channel = await getChannel(client, guildId)
                if (!channel) continue
                sendDailyWord(channel)
            }
        }, 24 * 60 * 60 * 1000)
    }, ms)
}

module.exports = {
    scheduleAtHour
}