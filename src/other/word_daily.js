const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js')
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

const sendDailyWord = async (channel, word, translation) => {
    try {
        const hiddenEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('**Daily Word**')
            .setDescription('Click the button to reveal the English translation')
            .setTimestamp()
            .addFields(
                { name: '🇮🇹 Italian', value: translation },
                { name: '🇬🇧 English', value: '❓' },
            );

        const revealButton = new ButtonBuilder()
            .setCustomId('daily_reveal')
            .setLabel('✅ Reveal')
            .setStyle(ButtonStyle.Primary)

        const row = new ActionRowBuilder().addComponents(revealButton)

        const message = await channel.send({ embeds: [hiddenEmbed], components: [row] })

        const collector = message.createMessageComponentCollector({
            componentType: ComponentType.Button,
            filter: i => i.customId === 'daily_reveal' && !i.user.bot,
            max: 1,
            time: 60_000
        })

        collector.on('collect', async i => {
            const revealEmbed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle('**Daily Word**')
                .setDescription('Translation revealed!')
                .setTimestamp()
                .addFields(
                    { name: '🇮🇹 Italian', value: translation },
                    { name: '🇬🇧 English', value: word },
                );
            await i.update({ embeds: [revealEmbed], components: [] })
        })

        collector.on('end', async (collected) => {
            if (collected.size === 0) {
                const disabledRow = new ActionRowBuilder().addComponents(
                    ButtonBuilder.from(revealButton).setDisabled(true)
                )
                await message.edit({ components: [disabledRow] }).catch(() => { })
            }
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

    const channelId = guildId ? config[guildId]?.dailyChannelId : null

    if (!channelId) {
        // console.error(`No daily channel configured for guild ${guildId}. Use /config-daily-word to set one.`)
        return null
    }
    return await client.channels.fetch(channelId)
};

const sendDailyWordToAll = async (client) => {
    let total = 0
    let missed = 0
    for (const [guildId] of client.guilds.cache) {
        total++
        const channel = await getChannel(client, guildId)
        if (!channel) {
            missed++
            continue
        }
        const { word, translation } = await getRandomItalianWord()
        sendDailyWord(channel, word, translation)
    }
    if (missed > 0) {
        console.log(`Sent daily word to ${total - missed} servers, missed ${missed} servers.`)
    } else {
        console.log(`Sent daily word to all ${total} servers.`)
    }
}   

const scheduleAtHour = (client, hour = 0, minute = 0) => {
    const now = new Date()
    let next = new Date(now)
    next.setHours(hour, minute, 00, 0)
    if (next <= now) next.setDate(next.getDate() + 1)
    const ms = next - now
    console.log('Current time:', now)
    console.log('Next scheduled time:', next)
    console.log('Milliseconds until next scheduled time:', ms)
    setTimeout(async () => {
        sendDailyWordToAll(client)
        setInterval(async () => {
            sendDailyWordToAll(client)
        }, 24 * 60 * 60 * 1000)
    }, ms)
}

module.exports = {
    scheduleAtHour
}