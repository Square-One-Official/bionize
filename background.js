// Background service worker for Bionize
const STORAGE_PREFIX = 'bionize_state_';

// Helper function to get storage key for a URL
function getStorageKey(url) {
	try {
		const hostname = new URL(url).hostname;
		return `${STORAGE_PREFIX}${hostname}`;
	} catch (error) {
		console.error('Error creating storage key:', error);
		return `${STORAGE_PREFIX}${url}`;
	}
}

// Helper function to update icon state
async function updateIconState(tabId, url) {
	try {
		if (!url || !url.startsWith('http')) return;
		
		const key = getStorageKey(url);
		const data = await chrome.storage.sync.get(key);
		const currentState = data[key] || false;

		await chrome.action.setIcon({
			path: currentState ? 'assets/state_active.png' : 'assets/state_inactive.png',
			tabId: tabId
		});
	} catch (error) {
		console.error('Error updating icon state:', error);
	}
}

// Initialize context menus
chrome.runtime.onInstalled.addListener(() => {
	// Remove existing menus and create new ones
	chrome.contextMenus.removeAll(() => {
		const menuItems = [
			{
				id: 'bionize_feedback',
				title: 'Feedback 💬',
				url: 'https://0zitr0ubvu5.typeform.com/to/DLyGSj12'
			},
			{
				id: 'bionize_feature_wishlist',
				title: 'Feature wishlist 🗒',
				url: 'https://bionize.nolt.io/'
			},
			{
				id: 'bionize_buy_coffee',
				title: 'Buy us a coffee ☕️',
				url: 'https://www.buymeacoffee.com/squareone'
			}
		];

		menuItems.forEach(item => {
			chrome.contextMenus.create({
				id: item.id,
				title: item.title,
				contexts: ['action']
			});
		});
	});
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
	const menuUrls = {
		'bionize_feedback': 'https://0zitr0ubvu5.typeform.com/to/DLyGSj12',
		'bionize_feature_wishlist': 'https://bionize.nolt.io/',
		'bionize_buy_coffee': 'https://www.buymeacoffee.com/squareone'
	};

	const url = menuUrls[info.menuItemId];
	if (url) {
		chrome.tabs.create({ url });
	}
});

// Handle extension icon clicks
chrome.action.onClicked.addListener(async (tab) => {
	try {
		if (!tab.url || !tab.url.startsWith('http')) return;

		// Get current state
		const key = getStorageKey(tab.url);
		const data = await chrome.storage.sync.get(key);
		const currentState = data[key] || false;
		
		// Toggle state
		const newState = !currentState;
		await chrome.storage.sync.set({ [key]: newState });

		// Update icon
		await updateIconState(tab.id, tab.url);

		// Notify content script using messaging
		try {
			await chrome.tabs.sendMessage(tab.id, { 
				action: 'toggleState',
				state: newState 
			});
		} catch (error) {
			// If content script isn't ready, inject it
			await chrome.scripting.executeScript({
				target: { tabId: tab.id },
				files: ['main.js']
			});
			// Try sending the message again
			await chrome.tabs.sendMessage(tab.id, { 
				action: 'toggleState',
				state: newState 
			});
		}
	} catch (error) {
		console.error('Error handling click:', error);
	}
});

// Handle tab updates (navigation, refresh, etc.)
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
	if (changeInfo.status === 'complete' && tab.url && tab.url.startsWith('http')) {
		await updateIconState(tabId, tab.url);
	}
});

// Handle tab activation (switching between tabs)
chrome.tabs.onActivated.addListener(async (activeInfo) => {
	const tab = await chrome.tabs.get(activeInfo.tabId);
	if (tab.url && tab.url.startsWith('http')) {
		await updateIconState(tab.id, tab.url);
	}
});

// Handle navigation within the same tab
chrome.webNavigation?.onCommitted.addListener(async (details) => {
	if (details.frameId === 0 && details.url && details.url.startsWith('http')) {
		await updateIconState(details.tabId, details.url);
	}
});
