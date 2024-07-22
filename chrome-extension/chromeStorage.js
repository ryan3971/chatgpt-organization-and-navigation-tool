// Create a function to handle calls to and from chrome tabs

// This function is used to send messages to the content scripts. It takes a tab ID and a message object as arguments and returns a promise. The promise resolves with the response from the content script if successful, or rejects with an error message if there is an error.
export function sendMessageToTab(tabId, message) {
    try {
        return new Promise((resolve, reject) => {
            // Send a message to the content script
            chrome.tabs.sendMessage(tabId, message, (response) => {
                if (response) {
                    resolve(response);
                } else {
                    reject("Error sending message to tab");
                }
            });
        });
    } catch (error) {
        console.error("Error sending message to tab:", error);
        throw error;
    }
}

/**
 * Retrieves data from chrome.storage.sync.
 * @param {string|string[]|object} keys - A single key, an array of keys, or an object specifying default values to retrieve.
 * @returns {Promise<object>} - A promise that resolves to an object containing the retrieved data.
 */
export async function getFromStorage(keys) {
    try {
        return new Promise((resolve, reject) => {
            chrome.storage.sync.get(keys, (result) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(result);
                }
            });
        });
    } catch (error) {
        console.error("Error getting from storage:", error);
        throw error;
    }
}

/**
 * Stores data in chrome.storage.sync.
 * @param {object} items - An object containing key-value pairs to store.
 * @returns {Promise<void>} - A promise that resolves when the data is successfully stored.
 */
export async function setToStorage(items) {
    try {
        return new Promise((resolve, reject) => {
            chrome.storage.sync.set(items, () => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve("Data saved to storage");
                }
            });
        });
    } catch (error) {
        console.error("Error setting to storage:", error);
        throw error;
    }
}