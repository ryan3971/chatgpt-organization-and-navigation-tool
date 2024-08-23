export async function getFromStorage(key) {
	try {
		const response = await chrome.storage.sync.get(key);
		console.log("Response from getting storage in getFromStorage", response);

		// Return null if the response is empty
		if (Object.keys(response).length === 0) {
			console.log("No data found in storage in getFromStorage");
			return null;
		}

		return response[key];
	} catch (error) {
		console.error("Error getting from storage in getFromStorage:", error);
		return null;
	}
}

export async function setToStorage(data_key, data) {
	var dataObj = {};
	dataObj[data_key] = data;

	try {
		const response = await chrome.storage.sync.set(dataObj);
		console.log("Saved to storage in setToStorage");
		return true;
	} catch (error) {
		console.error("Error setting to storage in setToStorage", error);
		return false;
	}
}

export async function removeFromStorage(key) {
	try {
		const response = await chrome.storage.sync.remove(key);
		console.log("Removed from storage in removeFromStorage");
		return true;
	} catch (error) {
		console.error("Error removing from storage in removeFromStorage", error);
		return false;
	}
}