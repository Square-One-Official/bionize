async function getStateFromStorage(url) {
	return new Promise((resolve, reject) => {
		chrome.storage.sync.get([storageKey(url)], function (result) {
			resolve(result[STORAGE_KEY]);
		});
	});
}

async function setStateInStorage(url, value) {
	return new Promise(resolve => {
		chrome.storage.sync.set({ [storageKey(url)]: value }, function () {
			resolve();
		});
	});
}
