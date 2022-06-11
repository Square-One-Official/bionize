const BIONIZED_IDENTIFIER = 'data-bionized-identifier';
const minNumberOfWords = 50;
let turnedOn = true;
const targetElements = [
	'p',
	'span',
	'a',
	'li',
	'strong',
	'i',
	'em',
	'h1',
	'h2',
	'h3',
	'h4',
	'h5',
	'h6',
];
const alternativeStates = {};

function onPressToggle() {
	turnedOn = !turnedOn;
	toggleAllTextElements();
}

async function replaceText() {
	if (!turnedOn) {
		console.log('Turned off, doing nothing...');
		return;
	}

	// Select all target elements without the "bionised" attribute
	const query = targetElements.map(el => `${el}:not([${BIONIZED_IDENTIFIER}])`).join(', ');
	let texts = Array.from(document.querySelectorAll(query)).filter(
		text => text.textContent.split(' ').length > minNumberOfWords,
	);

	console.log(`found ${texts.length} texts.`);

	for (let text of texts) {
		const newTextContent = await fetchBionicText(text.textContent);
		const identifier = Math.floor(Math.random() * 100000);

		// Save states to enable toggling
		alternativeStates[identifier] = text.innerHTML;

		text.innerHTML = newTextContent;

		// Set bionized identifier attribute so we don't bionize the same text twice
		text.setAttribute(BIONIZED_IDENTIFIER, identifier);
	}
}

function toggleAllTextElements() {
	const query = Object.keys(alternativeStates)
		.map(id => `[${BIONIZED_IDENTIFIER}="${id}"]`)
		.join(', ');
	const texts = document.querySelectorAll(query);

	for (let text of texts) {
		// Set text content to value from alt states and set alt state to current content
		const prevState = text.innerHTML;
		const id = text.getAttribute(BIONIZED_IDENTIFIER);
		text.innerHTML = alternativeStates[id];
		alternativeStates[id] = prevState;
	}
}

setInterval(replaceText, 2000);
