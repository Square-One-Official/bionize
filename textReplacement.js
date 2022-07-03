/**
 * @param {string} word text to be bionized
 */
function calculateNumberOfBoldCharacters(word) {
	const wordLength = trimSpecialChars(word).length;
	let boldCharacterCount = Math.round((wordLength - 2 / 3) * (5 / 6));

	// Handle edge cases that I wasn't able to nail with this formula
	switch (wordLength) {
		case 5:
			boldCharacterCount = 3;
	}

	return boldCharacterCount;
}

/**
 * @param {string} word text to be bionized
 */
function getBoldWordHTML(word) {
	const boldCharacterCount = calculateNumberOfBoldCharacters(word);
	const boldSection = `<b style="font-weight: 800 !important">${word.slice(
		0,
		boldCharacterCount,
	)}</b>`;
	const restOfWord = word.slice(boldCharacterCount);
	return `${boldSection}${restOfWord}`;
}

/**
 * @param {string} text text to be bionized
 */
function getBionizedTextHTML(text) {
	const words = text.split(' ');
	const result = words.map(word => getBoldWordHTML(word)).join(' ');
	return result;
}

/**
 * Removes trailing dots and commas that would affect the length of the word
 * @param {string} word
 *
 */
function trimSpecialChars(word) {
	return word.replace(/[,.]/g, '');
}
