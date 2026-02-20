const data = require('subtlex-word-frequencies');

const MAX_WORD_RANGE = 20000;
const commonWords = data.slice(0, MAX_WORD_RANGE).map(item =>
    typeof item === 'string' ? item : item.word || item
);

/**
 * Fetches a random word and its translation.
 * @param {number|null} wordRange The slice of the list to use.
 * @param {string} langPair The language pair for translation (e.g., 'en|it').
 * @returns {Promise<{word: string, translation: string}>}
 */
async function getRandomWord(wordRange, langPair = 'en|it') {
    try {
        const range = (wordRange > 0 && wordRange <= commonWords.length) ? wordRange : commonWords.length;
        const randomWord = commonWords[Math.floor(Math.random() * range)].toLowerCase();

        const translationData = await fetch(
            `https://api.mymemory.translated.net/get?q=${encodeURIComponent(randomWord)}&langpair=${langPair}`
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
}

module.exports = {
    getRandomWord,
    MAX_WORD_RANGE,
    commonWordsCount: commonWords.length
};
