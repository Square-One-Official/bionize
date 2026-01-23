// Content script for Bionize
const STORAGE_PREFIX = 'bionize_state_';
const BIONIZED_IDENTIFIER = 'data-bionized';
const MIN_NUM_OF_WORDS = 15;
const OPACITY_VALUE = 0.35; // Opacity for the latter part of words

let isEnabled = false;
const originalContent = new Map();

// Helper function to get storage key
function getStorageKey(url) {
	try {
		const hostname = new URL(url).hostname;
		return `${STORAGE_PREFIX}${hostname}`;
	} catch (error) {
		console.error('Error creating storage key:', error);
		return `${STORAGE_PREFIX}${url}`;
	}
}

// Text processing function
function bionizeText(text) {
	if (!text || text.trim().length === 0) return text;
	const words = text.trim().split(/\s+/);
	if (words.length < MIN_NUM_OF_WORDS) return text;
	
	return words.map(word => {
		if (word.length <= 2) return word;
		const focusLength = Math.ceil(word.length * 0.6);
		const firstPart = word.slice(0, focusLength);
		const secondPart = word.slice(focusLength);
		return firstPart + `<span style="opacity: ${OPACITY_VALUE};">${secondPart}</span>`;
	}).join(' ');
}

// Process all text nodes
function processText() {
	if (!isEnabled) return;

	try {
		// Create a TreeWalker to find all text nodes
		const walker = document.createTreeWalker(
			document.body,
			NodeFilter.SHOW_TEXT,
			{
				acceptNode: function(node) {
					// Skip script and style tags
					const parent = node.parentElement;
					if (!parent) return NodeFilter.FILTER_REJECT;

					const tagName = parent.tagName.toLowerCase();
					if (tagName === 'script' || 
						tagName === 'style' || 
						tagName === 'noscript' ||
						parent.closest('script, style, noscript, button, a, input, select, textarea')) {
						return NodeFilter.FILTER_REJECT;
					}

					// Skip if already processed
					if (parent.hasAttribute(BIONIZED_IDENTIFIER)) {
						return NodeFilter.FILTER_REJECT;
					}

					// Skip if empty or whitespace
					const text = node.textContent.trim();
					if (!text || text.split(/\s+/).length < MIN_NUM_OF_WORDS) {
						return NodeFilter.FILTER_REJECT;
					}

					return NodeFilter.FILTER_ACCEPT;
				}
			}
		);

		let node;
		while (node = walker.nextNode()) {
			const parent = node.parentElement;
			if (!parent) continue;

			// Store original content if not already stored
			if (!originalContent.has(parent)) {
				originalContent.set(parent, {
					html: parent.innerHTML,
					text: node.textContent
				});
			}

			// Process the text
			const processedText = bionizeText(node.textContent);
			if (processedText !== node.textContent) {
				const span = document.createElement('span');
				span.innerHTML = processedText;
				parent.setAttribute(BIONIZED_IDENTIFIER, 'true');
				node.replaceWith(...span.childNodes);
			}
		}
	} catch (error) {
		console.error('Error processing text:', error);
	}
}

// Revert all changes
function revertText() {
	try {
		for (const [element, content] of originalContent.entries()) {
			if (element && element.isConnected) {
				element.innerHTML = content.html;
				element.removeAttribute(BIONIZED_IDENTIFIER);
			}
		}
		originalContent.clear();
	} catch (error) {
		console.error('Error reverting text:', error);
	}
}

// Create an observer to handle dynamic content
const observer = new MutationObserver((mutations) => {
	if (isEnabled) {
		const hasNewText = mutations.some(mutation => 
			Array.from(mutation.addedNodes).some(node => 
				node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.TEXT_NODE
			)
		);
		if (hasNewText) {
			processText();
		}
	}
});

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.action === 'toggleState') {
		isEnabled = message.state;
		if (isEnabled) {
			processText();
		} else {
			revertText();
		}
		sendResponse({ success: true });
	}
	return true;
});

// Initialize
async function initializeState() {
	try {
		// Get initial state
		const key = getStorageKey(window.location.href);
		const data = await chrome.storage.sync.get(key);
		isEnabled = data[key] || false;
		
		// Start observing
		observer.observe(document.body, {
			childList: true,
			subtree: true,
			characterData: true
		});

		if (isEnabled) {
			processText();
		}
	} catch (error) {
		console.error('Error initializing:', error);
	}
}

// Start the extension
initializeState();
