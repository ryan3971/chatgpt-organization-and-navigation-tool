export async function getFromStorage(keys) {
	try {
		const response = await chrome.storage.sync.get(keys);
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
		console.log("Background script saved data to storage");
		return true;
	} catch (error) {
		console.error("Error getting from storage in setToStorage", error);
		return false;
	}
}