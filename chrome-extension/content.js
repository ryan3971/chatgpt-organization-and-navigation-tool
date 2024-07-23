document.addEventListener("mouseup", handleMouseUp);

function handleMouseUp() {
	const selection = window.getSelection();
	const highlightedText = selection.toString();
	const sourceElement = selection.anchorNode?.parentElement;

	console.log("Highlighted text:", highlightedText);
	console.log("Parent element:", sourceElement);

	if (highlightedText.length > 0 && sourceElement) {
		const containerElement = sourceElement.closest("[data-testid]");
		if (containerElement && containerElement.getAttribute("data-testid").includes("conversation-turn")) {
			console.log('Highlighted text is within an element with data-testid containing "conversation-turn"');
			chrome.runtime.sendMessage({
				action: "updateContextMenu",
				enabled: true,
			});
			return;
		}
	}
	chrome.runtime.sendMessage({
		action: "updateContextMenu",
		enabled: false,
	});
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	try {
		if (request.action === "extractTitle") {
			sendResponse({ title: document.title });
		} else {
			console.error("Unknown action:", request.action);
		}
	} catch (error) {
		console.error("Error in message listener:", error);
	}
});
