try {
	importScripts('/global.js');
} catch (e) {
	console.error(e);
}

chrome.runtime.onInstalled.addListener(() => {
	setIconAccordingToStateInStorage();
});

chrome.action.onClicked.addListener(tab => {
	setIconAccordingToStateInStorage(true);

	chrome.scripting.executeScript({
		target: { tabId: tab.id },
		files: ['scripts/toggleStateOnIconClick.js'],
	});
});

chrome.contextMenus.create({
	id: 'bioinze_feedback',
	title: 'Feedback 💬 ',
	contexts: ['action'],
});
chrome.contextMenus.create({
	id: 'bioinze_feature_wishlist',
	title: 'Feature wishlist 🗒 ',
	contexts: ['action'],
});
chrome.contextMenus.create({
	id: 'bioinze_buy_coffee',
	title: 'Buy us a coffee ☕️ ',
	contexts: ['action'],
});
chrome.contextMenus.onClicked.addListener(info => {
	switch (info.menuItemId) {
		case 'bioinze_feedback':
			chrome.tabs.create({ url: 'https://0zitr0ubvu5.typeform.com/to/DLyGSj12' });
			break;
		case 'bioinze_feature_wishlist':
			chrome.tabs.create({ url: 'https://bionize.nolt.io/' });
			break;
		case 'bioinze_buy_coffee':
			chrome.tabs.create({ url: 'https://www.buymeacoffee.com/squareone' });
			break;
	}
});

/**
 *
 * @param {boolean} isInverted Pass `true` if updating user toggled state but storage hasn't been updated yet
 */
function setIconAccordingToStateInStorage(isInverted) {
	chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
		// NOTE: This will only toggle the state for the currently active tab in the currently active browser window
		// If the user has multiple windows with the current tab
		const tab = tabs[0];
		const storageKey = getStorageKey(tab.url);
		chrome.storage.sync.get([storageKey], result => {
			const isTurnedOn = result[storageKey];
			chrome.action.setIcon({
				path: `assets/${
					(isInverted ? !isTurnedOn : isTurnedOn) ? 'state_active' : 'state_inactive'
				}.png`,
				tabId: tab.id,
			});
		});
	});
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	setIconAccordingToStateInStorage();
});
