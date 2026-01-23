/**
 * @param {string} word text to be enhanced
 */
function calculateFocusCharacters(word) {
	const wordLength = trimSpecialChars(word).length;
	let focusCharacterCount = Math.round((wordLength - 2 / 3) * (5 / 6));

	// Handle edge cases
	switch (wordLength) {
		case 5:
			focusCharacterCount = 3;
	}

	return focusCharacterCount;
}

/**
 * @param {string} word text to be enhanced
 */
function getEnhancedWordHTML(word) {
	const focusCharacterCount = calculateFocusCharacters(word);
	const focusSection = word.slice(0, focusCharacterCount);
	const fadeSection = `<span style="opacity: 0.5 !important">${word.slice(focusCharacterCount)}</span>`;
	return `${focusSection}${fadeSection}`;
}

/**
 * @param {string} text text to be enhanced
 */
function getBionizedTextHTML(text) {
	const words = text.split(' ');
	const result = words.map(word => getEnhancedWordHTML(word)).join(' ');
	return result;
}

/**
 * Removes trailing dots and commas that would affect the length of the word
 * @param {string} word
 */
function trimSpecialChars(word) {
	return word.replace(/[,.]/g, '');
}
