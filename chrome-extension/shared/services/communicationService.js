export async function sendMessageToBackground(action) {
	try {
		const response = await chrome.runtime.sendMessage(action);
		console.log("Response from background script in sendMessage: ", response);
		return response;
	} catch (error) {
		console.error("Error sending message in sendMessage:", error);
		return null;
	}
}

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
