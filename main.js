const HTML_ELEMENTS = ['p', 'strong', 'i', 'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
const BIONIZED_IDENTIFIER = 'data-bionized-identifier';
const MIN_NUM_OF_WORDS = 15;

let turnedOn = true;
const alternativeStates = {};

const { hostname } = window.location;

async function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

async function syncStateWithStorage() {
	const turnedOnStateInStorage = await getStateFromStorage(hostname);

	// If storage and local states are different, set local state to storage state
	if (turnedOn !== turnedOnStateInStorage) {
		await toggleState();
	}
}

async function toggleState() {
	turnedOn = !turnedOn;
	await setStateInStorage(hostname, turnedOn);
	toggleAllTextElements();
}

async function replaceText() {
	// Make sure everything is nice and synced before proceeding
	await syncStateWithStorage();

	if (!turnedOn) {
		console.log('Turned off, doing nothing...');
		return;
	}

	// Select all target elements without the "bionised" attribute
	const query = HTML_ELEMENTS.map(el => `${el}:not([${BIONIZED_IDENTIFIER}])`).join(', ');
	let texts = Array.from(document.querySelectorAll(query)).filter(
		text => text.textContent.split(' ').length > MIN_NUM_OF_WORDS,
	);

	for (let text of texts) {
		const bionizedText = getBionizedTextHTML(text.textContent);
		const identifier = Math.floor(Math.random() * 100000);

		// Save states to enable toggling
		alternativeStates[identifier] = text.innerHTML;

		text.innerHTML = bionizedText;

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

async function init() {
	await sleep(100); // Wait for all files to be properly imported, otherwise throws ReferenceError
	turnedOn = getStateFromStorage ? await getStateFromStorage(hostname) : false;
	setInterval(replaceText, 500);
}

init();
