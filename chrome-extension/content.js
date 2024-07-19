let highlightedText = "";
let highlightedWithinMain = false;

// Example content script functionality
console.log("Content script loaded");

// Listen for mouseup events to detect highlighted text
document.addEventListener("mouseup", () => {
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
});