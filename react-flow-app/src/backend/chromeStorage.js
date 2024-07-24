export async function sendMessage(action) {
	try	{
		const response = await chrome.runtime.sendMessage(action);
		console.log("Response from background script in sendMessage: ", response);
		return response;
	} catch (error) {
		console.error("Error sending message in sendMessage:", error);
		return null;
	}
}

export async function getFromStorage(keys) {
	try	{
		const response = chrome.storage.sync.get(keys);
		console.log("Response from background script in getFromStorage: ", response);
		return response;
	}
	catch (error) {
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