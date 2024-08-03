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

async function searchChatTitlesInSidePanel() {
	
	// check if any href elements exists that at least contain the /c/ path

	const ishrefs = document.querySelectorAll('a[href*="/c/"]');

	if (!ishrefs) {
		console.log("No hrefs found. Side Panel is likely not open.");
		return false;
	}
	
	const {nodes : nodesStor} = await chrome.storage.sync.get("nodes");

	// for each node id, query the document for an href that matches the format href="id"

	for (let i = 0; i < nodesStor.length; i++)	{
		const node = nodesStor[i];
		const id = node.id;
		const href = document.querySelector(`a[href="${id}"]`);
		if (href) {
			console.log("Found href for node:", href);
			const chatTitle = href.innerText;
			if (chatTitle) {
				console.log("Chat title:", chatTitle);
				nodesStor[i].data.label = chatTitle;
			}
		}
	}

	await chrome.storage.sync.set({nodes : nodesStor});
	return true
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	try {
		if (request.action === "extractTitle") {
			sendResponse({ title: document.title });
		} else if (request.action === "getPanelData") {
			searchChatTitlesInSidePanel().then((response) => {;
				sendResponse({ response: response });
			});
		} else {
			console.error("Unknown action:", request.action);
			sendResponse({ response: false });
		}
	} catch (error) {
		console.error("Error in message listener:", error);
		sendResponse({ response: false });
	}
	return true;
});
