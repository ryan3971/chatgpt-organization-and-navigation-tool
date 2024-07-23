// src/chromeStorage.js

// This file contains functions to interact with the Chrome storage API. It is used to save and retrieve the flow data and additional properties of nodes and edges.

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