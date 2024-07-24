import { sendMessageToTab, setToStorage, getFromStorage } from "./chromeStorage.js";

/* CONSTANT DEFINITIONS */
// const TEST_NEW_NODE = [
// 	{
// 		node_parent_id: "",
// 		node_branch_id: "test_is",
// 		node_parent_title: "text",
// 		edge_selected_text: "sample_title",
// 	},
// ];

// const TEST_NODES = [
// 	{
// 		node_id: "1",
// 		node_type: "default",
// 		node_position: { x: 250, y: 5 },
// 		node_data: {
// 			node_data_title: "Node 1",
// 		},
// 	},
// ];

const CHATGPT_HOSTNAME = "chatgpt.com";


// Variable used for state management
let state = {
	hasNewNode: false,
	lastActiveChatId: null,
};

chrome.runtime.onInstalled.addListener(() => {

	chrome.contextMenus.create({
		id: "saveHighlightedText",
		title: "Save Highlighted Text",
		contexts: ["selection"], // makes it so the button only appears when text is selected
		enabled: false,
	});

	chrome.contextMenus.create({
		id: "createParentNode",
		title: "Make Parent Node",
		contexts: ["all"],
	});
});

async function createParentNode(info, tab) {
	let titleText = "",
		response;
	const url = new URL(info.pageUrl);

	//const hostname = url.hostname; // e.g., https://chatgpt.com
	const chatId = url.pathname; // e.g., /c/f226cd80-a0bd-44f5-9a74-68baa556b80c
	console.log("Pathname: ", chatId);

	if (chatId === "/") {
		console.warn("URL is a new chat. Cannot make parent yet: ", url);
		return;
	}

	try {
		response = await sendMessageToTab(tab.id, { action: "extractTitle" });
		titleText = response.title;
	} catch (error) {
		console.error("Error extracting title from the page: ", error);
	}

	// Format the data as specified
	const newParentNode = {
		node_parent_id: chatId,
		node_parent_title: titleText,
	};

	// Save the newParentNode to storage
	response = await setToStorage({ new_parent_node: newParentNode });
	console.log("Data saved to storage: ", response);
}

async function saveHighlightedText(info, tab) {
	let titleText = "", response;
	const selectedText = info.selectionText;
	const url = new URL(info.pageUrl);

	//const hostname = url.hostname; // e.g., https://chatgpt.com
	const chatId = url.pathname; // e.g., /c/f226cd80-a0bd-44f5-9a74-68baa556b80c

	try {
		response = await sendMessageToTab(tab.id, { action: "extractTitle" });
		titleText = response.title;
	} catch (error) {
		console.error("Error extracting title from the page: ", error);
	}

	console.log("Selected text:", selectedText);
	console.log("Pathname:", chatId);

	// Format the data as specified
	const new_node = {
		node_parent_id: chatId,
		node_branch_id: "",
		node_parent_title: titleText,
		edge_selected_text: selectedText,
	};

	// temporary code to test the storage (reset the storage)
	//await setToStorage({ new_nodes: TEST_NEW_NODE });
	//await setToStorage({ nodes: TEST_NODES });

	// Retrieve the newNodes from storage
	const { new_nodes: newNodesStor } = await getFromStorage("new_nodes");
	console.log("Data retrieved from storage:", newNodesStor);

	const updatedNewNodesStor = newNodesStor ? [...newNodesStor, new_node] : [new_node];

	// Save the newNode to storage
	response = await setToStorage({ new_nodes: updatedNewNodesStor });
	console.log("Data saved to storage:", response);

	// Set the state to indicate a new node has been created
	state.hasNewNode = true;

	// Open a new ChatGPT chat in the current tab
	const newUrl = "https://chatgpt.com/"; //chatgpt_hostname;

	//Query the active tab
	chrome.tabs.update(tab.id, { url: newUrl });
	console.log("Opened new ChatGPT chat in the current tab: ", newUrl);
}

chrome.contextMenus.onClicked.addListener(handleContextMenuClick);

async function handleContextMenuClick(info, tab) {
	console.log("Context menu item clicked:", info, tab);

	if (info.menuItemId === "createParentNode") {
		chrome.storage.sync.clear();
		createParentNode(info, tab);
	} else if (info.menuItemId === "saveHighlightedText") {
		saveHighlightedText(info, tab);
	} else {
		console.error("Unknown context menu item clicked:", info.menuItemId);
	}
}

chrome.tabs.onUpdated.addListener(handleTabUpdate);

async function handleTabUpdate(tabId, changeInfo, tab) {
	// Check if the tab has hostname CHATGPT_HOSTNAME. If it does, save the tab info so we can manipulate it later
	const url = new URL(tab.url);
	const hostname = url.hostname; // e.g., chatgpt.com

	if (hostname === CHATGPT_HOSTNAME) {
		state.lastActiveChatId = tab.id;
		console.log("Last active ChatGPT tab ID Saved:", state.lastActiveChatId);
	}

	if (changeInfo.url && state.hasNewNode) {
		const url = new URL(changeInfo.url);

		const hostname = url.hostname; // e.g., chatgpt.com
		const chatId = url.pathname; // e.g., /c/f226cd80-a0bd-44f5-9a74-68baa556b80c

		// check if hostname is chatgpt and chat_id is empty
		if (hostname === CHATGPT_HOSTNAME && chatId === "/") {
			console.log("URL is a new ChatGPT page: ", url);
			return;
		}
		// Either we have new chat that is a branch or we have navigated to a new page
		state.hasNewNode = false;

		const { new_nodes: newNodesStor } = await getFromStorage("new_nodes");

		let response = await sendMessageToTab(tab.id, { action: "extractTitle" });
		const titleText = response.title;

		// Check the following:
		// 1) if the URL is a ChatGPT conversation page
		// 2) the url has an id (meaning the chat page has been used)
		// 3) The chat title is "ChatGPT"
		if (hostname === CHATGPT_HOSTNAME && chatId.startsWith("/c/") && titleText === "ChatGPT") {
			// We have a new chat that is a branch.
			console.log("URL is a ChatGPT conversation page: ", url);

			// search the new_nodes_stor for an element with an empty branch_id and return the element index
			const index = newNodesStor.findIndex((node) => !node.node_branch_id);

			if (index != -1) {
				newNodesStor[index].node_branch_id = chatId;
				console.log("Updated newNode: ", newNodesStor[index].node_branch_id);

				let response = await setToStorage({ new_nodes: newNodesStor });
				console.log("Node branch ID updated to storage: ", response);
			} else {
				// No newNode with an empty branch_id found
				console.warn("No newNode with an empty branch_id found. This should not happen...");
			}
		} else {
			// We have navigated to a new page or chat; remove the newNode element with an empty branch_id from storage
			const updated_new_nodes_stor = newNodesStor.filter((node) => node.node_branch_id); // Remove the newNode with an empty branch_id (check if truthy)

			let response = await setToStorage({ new_nodes: updated_new_nodes_stor });
			console.log("New Node branch removed from storage: ", response);
		}
	}
}

chrome.action.onClicked.addListener(handleChromeActionClick);

function handleChromeActionClick() {
	console.log("Action button clicked. Opening window.");

	chrome.windows.create({
		url: "index.html",
		type: "popup",
		width: 800,
		height: 600,
		focused: true,
	});
}
// function isTabExist(tabId) {
// 	return new Promise((resolve, reject) => {
// 		chrome.tabs.get(tabId, (tab) => {
// 			if (chrome.runtime.lastError) {
// 				return reject(new Error(chrome.runtime.lastError.message));
// 			}
// 			resolve(tab);
// 		});
// 	});
// }

// async function executeScript(tabId, func) {

// 			// (results) => {
// 			// 	if (chrome.runtime.lastError) {
// 			// 		return reject(new Error(chrome.runtime.lastError.message));
// 			// 	}
// 			// 	resolve(results);
// 			// }
// }

function getPanelData() {
	// wrap this in a promise
	console.log("getPanelData executed");
	return document.documentElement.outerHTML;
}

/*
Note: Keeping .catch for each promise to make debugging easier.
	  Might change it from throwing an error to just a warning
*/
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.action === "updateContextMenu") {
		chrome.contextMenus.update("saveHighlightedText", {enabled: message.enabled,})
			.then(() => {
				sendResponse({ success: true });
			}).catch((error) => {
				console.error("Error updating context menu: ", error);
				sendResponse({ success: false });
			});

	} else if (message.action === "updateDiagram")	{
		chrome.tabs.get(state.lastActiveChatId)
			.then((tab) => {
				if (!tab) {
					console.error("Error getting tab: ", chrome.runtime.lastError.message);
				}
				console.log("Last active chat tab found");

				const response = sendMessageToTab(tab.id, { action: "getPanelData" })
				return response;
			})
			.then((response) => {
				if (!response) {
					console.error("Error getting panel data: ", chrome.runtime.lastError.message);
				}
				console.log("Response from getPanelData: ", response);
				sendResponse({ success: true, html: response });
			})
			.catch((error) => {
				console.error("Error updating diagram: ", error);
				sendResponse({ success: false });
			});
	} else if (message.action === "getFromStorage") {
		chrome.storage.sync.get(message.key)
			.then((result) => {
				console.log("Data retrieved from storage: ", result[message.key]);
				sendResponse({ success: true, data: result[message.key] });
			}).catch((error) => {
				console.error("Error getting from storage: ", error);
				sendResponse({ success: false });
		});
	} else if (message.action === "setToStorage") {
		const data = { [message.key]: message.value };
		console.log("Data saved to storage: ", data);
		chrome.storage.sync.set(data)
		.then(() => {
			sendResponse({ success: true });
		}).catch((error) => {
			console.error("Error setting to storage: ", error);
			sendResponse({ success: false });
		});
	} else {
		console.error("Unknown storage action: ", message.action);
		sendResponse({ success: false });
	}

	return true; // Keeps the message channel open for sendResponse
});
