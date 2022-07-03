async function getStateFromStorage() {
	return new Promise((resolve, reject) => {
		chrome.storage.sync.get([STORAGE_KEY], function (result) {
			resolve(result[STORAGE_KEY]);
		});
	});
}

async function setStateInStorage(value) {
	return new Promise(resolve => {
		chrome.storage.sync.set({ [STORAGE_KEY]: value }, function () {
			resolve();
		});
	});
}
