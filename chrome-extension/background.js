import { sendMessageToTab, setToStorage, getFromStorage } from "./chromeStorage.js";

const test_new_node = [
	{
		node_parent_id: "",
		node_branch_id: "test_is",
		node_branch_title: "text",
		edge_selected_text: "sample_title",
	},
];

const test_nodes = [
	{
		node_id: "1",
		node_type: "default",
		node_position: { x: 250, y: 5 },
		node_data: {
			node_data_title: "Node 1",
		},
	},
];

const chatgpt_hostname = "chatgpt.com";


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
		const url = new URL(info.pageUrl);

		//const hostname = url.hostname; // e.g., https://chatgpt.com
		const chat_id = url.pathname; // e.g., /c/f226cd80-a0bd-44f5-9a74-68baa556b80c

		let titleText = "";
		let response = await sendMessageToTab(tab.id, { action: "extractTitle" });
		titleText = response.title;


		console.log("Selected text:", selectedText);
		console.log("Pathname:", chat_id);

		// Format the data as specified
		const new_node = {
			node_parent_id: chat_id,
			node_branch_id: "",
			node_branch_title: titleText,
			edge_selected_text: selectedText,
		};

		// temporary code to test the storage (reset the storage)
		response = await setToStorage({ new_nodes: test_new_node });
		response = await setToStorage({ nodes: test_nodes });

		//	const updatedNewNodes = newNodes ? [...newNodes, newNode] : [newNode];
		// Add the new object to the existing array. If newNodes is undefined (i.e., no data in storage), initialize the array with the new object.

		// Retrieve the newNodes from storage
		let new_nodes_stor = await getFromStorage("new_nodes");
		new_nodes_stor = new_nodes_stor["new_nodes"];
		console.log("Data retrieved from storage:", new_nodes_stor);

		const updated_new_nodes_stor = new_nodes_stor ? [...new_nodes_stor, new_node] : [new_node];

		// Add the newNode to the newNodes_data array
		//newNodes_data["newNodes"].push(newNode);

		// Save the newNode to storage
		response = await setToStorage({ new_nodes: updated_new_nodes_stor });
		console.log("Data saved to storage:", response);

		// Set the state to indicate a new node has been created
		state.state.new_node = true;

		// Ope na new ChatGPT chat in the current tab

		// Launch the new chat
		const newUrl = "https://chatgpt.com/"//chatgpt_hostname;

		//Query the active tab
		try {
			chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
				const activeTab = tabs[0];
				chrome.tabs.update(tab.id, { url: newUrl });
				console.log("Opened new ChatGPT chat in the current tab", newUrl);
			});
		} catch (error) {
			console.error("Error occurred while updating tab URL:", error);
		}
	}
});

// chrome.webNavigation.onCommitted.addListener((details) => {
// 	if (details.frameId === 0) {
// 		// frameId 0 indicates the main frame
// 		console.log("User navigated to a new page:", details.url);
// 	}
// });


chrome.tabs.onUpdated.addListener( async (tabId, changeInfo, tab) => {
	// URL has changed. Check if a newNode is in storage and the url satisfies the conditions
	// For now, the following will be used to register a new branch
		// The branch button is clicked
		// A new chat is launched
		// We monitor a change in the url
			// when it changes, we check the usual + the chat title
				// If the url changed to an id but the chat title is still ChatGPT, then we know (I think) that we are using the branched chat

	if (changeInfo.url && state.state.new_node) {
		// Check if the URL already exists in the database
		const url = new URL(changeInfo.url);

		const hostname = url.hostname; // e.g., https://chatgpt.com
		const chat_id = url.pathname; // e.g., /c/f226cd80-a0bd-44f5-9a74-68baa556b80c

		// check if hostname is chatgpt and chat_id is empty
		if (hostname === chatgpt_hostname && chat_id === "/") {
			console.log("URL is a new ChatGPT page:", url);
			return;
		}
		// Either we have new chat that is a branch or we have navigated to a new page
		state.state.new_node = false;

		const stor = await getFromStorage(["new_nodes", "nodes"]);
		let new_nodes_stor = stor["new_nodes"];
		let nodes_stor = stor["nodes"];

		// Check if the URL already exists in the database for nodes and newNodes
		// If no matching element is found, isExistingNode will be assigned the value undefined.
		//const isExistingNode = nodes_stor.find((node) => node.node_id === chat_id);
		//const isExistingNode_2 = new_node_stor.find((node) => node.node_parent_id === chat_id);

		let response = await sendMessageToTab(tab.id, { action: "extractTitle" });
		const titleText = response.title;


		// Check the following:
			// 1) if the URL is a ChatGPT conversation page
			// 2) the url has an id (meaning the chat page has been used)
			// 3) The chat title is "ChatGPT"
		if (hostname === chatgpt_hostname && chat_id.startsWith("/c/") && titleText === "ChatGPT") {
			// We have a new chat that is a branch.
			console.log("URL is a ChatGPT conversation page:", url);

			// search the new_node_stor for an element with an empty branch_id and return the element index
			const index = new_nodes_stor.findIndex((node) => !node.node_branch_id);

			if (index) {
				new_nodes_stor[index].branch_id = chat_id;
				console.log("Updated newNode:", new_nodes_stor[index].branch_id);

				let response = await setToStorage({ new_nodes: new_nodes_stor });
				console.log("Node branch ID updated to storage:", response);
			} else {
				// No newNode with an empty branch_id found
				console.log("No newNode with an empty branch_id found. This should not happen...");
			}
		} else {
			// We have navigated to a new page or chat; remove the newNode element with an empty branch_id from storage
			const updated_new_nodes_stor = new_nodes_stor.filter((node) => node.node_branch_id); // Remove the newNode with an empty branch_id (check if truthy)

			let response = await setToStorage({ new_nodes: updated_new_nodes_stor });
			console.log("New Node branch removed from storage", response);
		}
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
