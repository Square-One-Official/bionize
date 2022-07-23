async function getStateFromStorage(url) {
	return new Promise((resolve, reject) => {
		chrome.storage.sync.get([getStorageKey(url)], function (result) {
			resolve(result[getStorageKey(url)]);
		});
	});
}

async function setStateInStorage(url, value) {
	console.log('setStateaInStorage called');
	return new Promise(resolve => {
		chrome.storage.sync.set({ [getStorageKey(url)]: value }, function () {
			resolve();
		});
	});
}
