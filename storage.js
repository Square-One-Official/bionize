// Storage functions for Bionize
window.getStorageKey = function(url) {
	return `bionize_state_${url}`;
};

window.getStateFromStorage = async function(url) {
	return new Promise((resolve, reject) => {
		try {
			if (!chrome?.storage?.sync) {
				resolve(false);
				return;
			}
			
			if (!chrome.runtime?.id) {
				resolve(false);
				return;
			}

			chrome.storage.sync.get([getStorageKey(url)], function(result) {
				if (chrome.runtime.lastError) {
					console.warn('Storage error:', chrome.runtime.lastError);
					resolve(false);
					return;
				}
				resolve(result[getStorageKey(url)] ?? false);
			});
		} catch (error) {
			console.warn('Storage error:', error);
			resolve(false);
		}
	});
};

window.setStateInStorage = async function(url, value) {
	return new Promise((resolve, reject) => {
		try {
			if (!chrome?.storage?.sync) {
				resolve();
				return;
			}
			
			if (!chrome.runtime?.id) {
				resolve();
				return;
			}

			chrome.storage.sync.set({ [getStorageKey(url)]: value }, function() {
				if (chrome.runtime.lastError) {
					console.warn('Storage error:', chrome.runtime.lastError);
					resolve();
					return;
				}
				resolve();
			});
		} catch (error) {
			console.warn('Storage error:', error);
			resolve();
		}
	});
};
