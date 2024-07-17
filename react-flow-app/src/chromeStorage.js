// src/chromeStorage.js

// Function to get data from chrome.storage. It sends a message to the background script to retrieve the data.
export const getFromStorage = (key) => {
	return new Promise((resolve, reject) => {
		chrome.runtime.sendMessage({ action: "getFromStorage", key }, (response) => {
			if (response) {
				resolve(response.data);
			} else {
				reject("Error retrieving data");
			}
		});
	});
};

// Function to set data in chrome.storage. It sends a message to the background script to save the data.
export const setToStorage = (key, value) => {
	return new Promise((resolve, reject) => {
		chrome.runtime.sendMessage({ action: "setToStorage", key, value }, (response) => {
			if (response && response.success) {
				resolve();
			} else {
				reject("Error saving data");
			}
		});
	});
};
