/*global chrome */

// Send a message to the background script
// Input format: {action: ..., node_data: ..., data: ...}
// Output format: {status: ..., data: ...}
export async function sendMessageToBackground(message_key, message_data = null) {
	// Check if the Chrome runtime is available
	if (!chrome.runtime) {
		console.error("Chrome runtime is not available");
		return { status: false, error: "Chrome runtime is not available" };
	}

	// Construct the message to send
	const message = {
		action: message_key,
		data: message_data,
	};

	try {
		// Send the message and wait for a response
		const response = await chrome.runtime.sendMessage(message);
		return response;
	} catch (error) {
		console.error("Error occurred while sending message:", error);
		return { status: false, error: error.message || "Unknown error occurred" };
	}
}
