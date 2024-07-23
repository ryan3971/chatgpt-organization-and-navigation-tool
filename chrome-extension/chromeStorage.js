/**
 * Sends a message to a specified tab and returns a response.
 * @param {number} tabId - The ID of the tab to send the message to.
 * @param {object} message - The message object to send.
 * @returns {Promise<object>} - A promise that resolves with the response from the content script.
 */
export async function sendMessageToTab(tabId, message) {
    return new Promise((resolve, reject) => {
        chrome.tabs.sendMessage(tabId, message, (response) => {
            if (chrome.runtime.lastError) {
                reject(`Error sending message to tab: ${chrome.runtime.lastError.message}`);
            } else if (response) {
                resolve(response);
            } else {
                reject("Unknown error: No response from content script");
            }
        });
    });
}

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
