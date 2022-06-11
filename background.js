// TODO: Import this value instead of rewriting it
const STORAGE_KEY = 'isTurnedOn';

chrome.runtime.onInstalled.addListener(details => {
	setIconAccordingToStateInStorage();
});

chrome.action.onClicked.addListener(tab => {
	chrome.scripting.executeScript({
		target: { tabId: tab.id },
		files: ['toggle.js'],
	});

	setIconAccordingToStateInStorage(true);
});

/**
 *
 * @param {boolean} isInverted Pass `true` if updating user toggled state but storage hasn't been updated yet
 */
function setIconAccordingToStateInStorage(isInverted) {
	chrome.storage.sync.get([STORAGE_KEY], result => {
		const isTurnedOn = result[STORAGE_KEY];
		chrome.action.setIcon({
			path: `assets/${
				(isInverted ? !isTurnedOn : isTurnedOn) ? 'state_active' : 'state_inactive'
			}.png`,
		});
	});
}
