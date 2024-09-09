export async function getFromStorage(key) {
	try {
		const response = await chrome.storage.local.get(key);

		// Return null if the response is empty
		if (Object.keys(response).length === 0) {
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
		const response = await chrome.storage.local.set(dataObj);
		return true;
	} catch (error) {
		console.error("Error setting to storage in setToStorage", error);
		return false;
	}
}

export async function removeFromStorage(key) {
	try {
		const response = await chrome.storage.local.remove(key);
		return true;
	} catch (error) {
		console.error("Error removing from storage in removeFromStorage", error);
		return false;
	}
}