/**
 * Retrieves data from chrome.storage.sync.
 * @param {string|string[]|object} keys - A single key, an array of keys, or an object specifying default values to retrieve.
 * @returns {Promise<object>} - A promise that resolves to an object containing the retrieved data.
 */
export async function getFromStorage(keys) {
	return new Promise((resolve, reject) => {
		chrome.storage.sync.get(keys, (result) => {
			if (chrome.runtime.lastError) {
				reject(`Error getting from storage: ${chrome.runtime.lastError.message}`);
			} else {
				resolve(result);
			}
		});
	});
}

/**
 * Stores data in chrome.storage.sync.
 * @param {object} items - An object containing key-value pairs to store.
 * @returns {Promise<void>} - A promise that resolves when the data is successfully stored.
 */
export async function setToStorage(items) {
	return new Promise((resolve, reject) => {
		chrome.storage.sync.set(items, () => {
			if (chrome.runtime.lastError) {
				reject(`Error setting to storage: ${chrome.runtime.lastError.message}`);
			} else {
				resolve("Data saved to storage");
			}
		});
	});
}
