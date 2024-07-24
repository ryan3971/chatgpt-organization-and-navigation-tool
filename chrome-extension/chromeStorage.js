export async function sendMessageToTab(tabId, message) {
	try {
		const response = await chrome.tabs.sendMessage(tabId, message);
		console.log("Response from content script:", response);
		return response;
	} catch (error) {
		console.error("Error sending message to tab:", error);
		return null;
	}
}

export async function getFromStorage(keys) {
	try {
		const response = chrome.storage.sync.get(keys);
		console.log("Response from background script in getFromStorage: ", response);
		return response;
	} catch (error) {
		console.error("Error getting from storage in getFromStorage:", error);
		return null;
	}
}

export async function setToStorage(items) {
	try {
		const response = await chrome.storage.sync.set(items);
		console.log("Response from background script in setToStorage: ", response);
		return response;
	} catch (error) {
		console.error("Error getting from storage in setToStorage", error);
		return null;
	}
}