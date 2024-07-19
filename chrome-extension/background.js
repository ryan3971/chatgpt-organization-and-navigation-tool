// Create a context menu item
chrome.contextMenus.create({
	id: "saveHighlightedText",
	title: "Save Highlighted Text",
	contexts: ["selection"],		// makes it so the button only appears when text is selected
	enabled: false,
});

// Handle messages from the content script to update the context menu item state
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'updateContextMenu') {
    chrome.contextMenus.update('saveHighlightedText', {
      enabled: message.enabled
    });
  }
});

// Handle the context menu item click event
chrome.contextMenus.onClicked.addListener((info, tab) => {
	console.log("Context menu item clicked:", info, tab);
  	if (info.menuItemId === 'saveHighlightedText') {
		const selectedText = info.selectionText;
		const url = info.pageUrl;
		console.log('Context menu item clicked. Selected text:', selectedText, 'URL:', url);

		// Save the highlighted text and URL using chrome.storage.local
		chrome.storage.local.set({ highlightedText: selectedText, url: url }, () => {
			console.log('Highlighted text and URL saved to chrome.storage.local:');
			console.log('Highlighted text:', selectedText);
			console.log('URL:', url);
		});
	}
});



chrome.action.onClicked.addListener(() => {
	console.log("Action button clicked. Opening window.");

	chrome.windows.create({
		url: "index.html",
		type: "popup",
		width: 800,
		height: 600,
		focused: true,
	});
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.action === "getFromStorage") {
		chrome.storage.sync.get(request.key, (result) => {
			console.log("Data retrieved from storage:", result[request.key]);
			sendResponse({ data: result[request.key] });
		});
	} else if (request.action === "setToStorage") {
		let data = {};
		data[request.key] = request.value;
		console.log("Data saved to storage:", data);
		chrome.storage.sync.set(data, () => {
			sendResponse({ success: true });
		});
	}
	return true; // Keeps the message channel open for sendResponse
});
