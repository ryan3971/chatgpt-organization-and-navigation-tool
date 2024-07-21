import { sendMessageToTab, setToStorage, getFromStorage } from "./chromeStorage.js";

// Variable used for state management
let state = {
	state: {
		new_node: false,
	},
};

// Create a context menu item
chrome.contextMenus.create({
	id: "saveHighlightedText",
	title: "Save Highlighted Text",
	contexts: ["selection"], // makes it so the button only appears when text is selected
	enabled: false,
});


// Handle messages from the content script to update the context menu item state
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.action === "updateContextMenu") {
		chrome.contextMenus.update("saveHighlightedText", {
			enabled: message.enabled,
		});
	}
});
/*
Should eventually add code to attempt getting title from side panel:
const linkElement = document.querySelector('a[href="/c/f226cd80-a0bd-44f5-9a74-68baa556b80c"]');
	if (linkElement) {
		console.log("Found link element:", linkElement);
		console.log("Link text content:", linkElement.textContent);
	} else {
		console.log("No link element found with href:", relativeUrl);
	}

*/

// Handle the context menu item click event
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
	console.log("Context menu item clicked:", info, tab);
	if (info.menuItemId === "saveHighlightedText") {
		const selectedText = info.selectionText;
		const url = info.pageUrl;

		// Get the title of the page using a content script

		// send a message to the tab to get the document title. This infomrmation should return before proceeding
		// sendMessageToTab(tab.id, { action: "extractTitle" })
		// 	.then((response) => {
		// 		console.log("Page Title:", response.title);
		// 		titleText = response.title;
		// 	})
		// 	.catch((error) => {
		// 		console.error("Error extracting title:", error);
		// 	});

		let titleText = "";
		try {
			const response = await sendMessageToTab(tab.id, { action: "extractTitle" });
			titleText = response.title;
		} catch (error) {
			console.error("Error extracting title:", error);
		}

		console.log("Selected text:", selectedText);
		console.log("URL:", url);

		// Format the data as specified
		const newNode = {
			parent_id: url,
			branch_id: "",
			titleText: titleText,
			selectedtext: selectedText,
		};

		// temporary code to test the storage (reset the storage)
		let response = await setToStorage({"newNodes": []});

		// Retrieve the newNodes from storage
		const newNodes_data = await getFromStorage("newNodes");
		console.log("Data retrieved from storage:", newNodes_data);

		// Add the newNode to the newNodes_data array
		newNodes_data["newNodes"].push(newNode);

		// Save the newNode to storage
		response = await setToStorage({"newNodes": newNodes_data});
		console.log("Data saved to storage:", response);

		// Set the state to indicate a new node has been created
		state.state.new_node = true;
	}
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	// URL has changed. Check if a newNode is in storage and the url satisfies the conditions
	if (changeInfo.url && state.state.new_node) {
		// Either we have new chat that is a branch or we have navigated to a new page
		state.state.new_node = false;

		// retrieve the newNode from storage and node from storage
		chrome.storage.local.get(["newNodes", "nodes"], (result) => {
			const newNodes = result.newNodes;
			const nodes = result.nodes;

			// Check if the URL already exists in the database
			const url = new URL(changeInfo.url);
			const relativeUrl = url.pathname + url.search + url.hash;

			// Check if the URL already exists in the database
			const existingNode = nodes.find((node) => node.id === relativeUrl);

			// Check if the URL is a ChatGPT conversation page, the url has a branch_id, and the node doesn't exist
			if (url.hostname === "https://chatgpt.com/" && relativeUrl.startsWith("/c/") && !existingNode) {
				// We have a new chat that is a branch.
				console.log("URL is a ChatGPT conversation page:", url);

				// Search the newNode for an element with an empty branch_id and update it
				const newNode = newNodes.find((newNode) => !newNode.branch_id);
				if (newNode) {
					newNode.branch_id = relativeUrl;
					console.log("Updated newNode:", newNode);

					// Save the updated newNode to storage
					chrome.storage.local.set({ newNodes: newNodes }, () => {
						console.log("Data saved to storage:", newNodes);
					});
				} else {
					// No newNode with an empty branch_id found
					console.log("No newNode with an empty branch_id found/ This should not happen...");
				}
			} else {
				// We have navigated to a new page or chat; remove the newNode element with an empty branch_id from storage
				const newNodes = newNodes.filter((newNode) => newNode.branch_id); // Remove the newNode with an empty branch_id (check if truthy)
				chrome.storage.local.set({ newNodes: newNodes }, () => {
					console.log("Data saved to storage:", newNodes);
				});
			}
		});

		// Retrieve the newNode from storage. It could be a list of newNodes
		chrome.storage.local.get("newNodes", (result) => {
			const newNodes = result.newNodes;
			if (newNodes) {
				console.log("New nodes found in storage:", newNodes);
			}

			// Iterate through the newNodes and check if any have an empty branch_id
			newNodes.forEach((newNode) => {
				if (!newNode.branch_id) {
					console.log("Found a new node with an empty branch_id:", newNode);
				}
			});
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

/*************** CHROME STORAGE /***************/
// Handle fetching and saving data to Chrome storage
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
