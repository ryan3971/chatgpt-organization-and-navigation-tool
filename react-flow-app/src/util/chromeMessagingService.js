/*global chrome*/

// Send in format {action: ..., node_data: ..., data: ...}
// Receive in format {status: ..., data: ...}
export async function sendMessageToBackground(message_key, message_data=null) {
	if (!chrome.runtime) {
		console.error("Chrome runtime is not available");
		return null;
	}

	const message = {
		action: message_key,
		data: message_data,
	};

	try {
		console.log("Sending message in sendMessageToBackground:", message_key);
		const response = await chrome.runtime.sendMessage(message);
		console.log("Response from background script in sendMessageToBackground: ", response.status);
		return response;
	} catch (error) {
		console.error("Error sending message in sendMessageToBackground:", error);
		return null;
	}
}
