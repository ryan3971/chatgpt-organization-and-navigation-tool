import {
	doesChatExist,
	createNewNodeParent,
	updateNodeMessages,
	createNewNodeBranch,
	updateNodeTitle,
	deleteNode,
} from "./background_helpers/helper_functions.js";
import * as Constants from "./Constants/constants.js";

/**
 * To account for multiple tabs, I need one state objects in background that will persist on tab changes
 * And info specific to a tab stored in the content script
 */

// Variable used for state management
let state = {
	isNewBranchNode: false,

	// hasNewNode: false,
	// lastActiveChatId: null,
	// overviewWindowId: null,
};

let branchParentData = {
	node_space_id: null,
	parent_node_id: null,
	selected_text_data: null,
};

chrome.tabs.onUpdated.addListener(handleTabUpdate);
async function handleTabUpdate(tabId, changeInfo, tab) {
	
	if (changeInfo.status !== 'complete') return;	// Wait for the page to load completely
	var response;
	// New webpage open, is it ChatGPT?
	const url = new URL(tab.url);
	const hostname = url.hostname; // e.g., chatgpt.com

	if (hostname !== Constants.CHATGPT_HOSTNAME) return; // Not ChatGPT

	//state.lastActiveChatId = tab.id;
	//console.log("Last active ChatGPT tab ID Saved:", state.lastActiveChatId);

	// Check the Chat URL
	const chatId = url.pathname; // e.g., /c/f226cd80-a0bd-44f5-9a74-68baa556b80c
	var message;
	var message = {
		chat_type: null,
		node_space_id: null,
		node_id: null,
		selected_text_data: null,
	};

	if (chatId === "/") {
		if (state.isNewBranchNode) {	// New branch chat
			console.log("New branch chat");
			state.isNewBranchNode = false;
			message.chat_type = Constants.CHAT_TYPE_NEW_BRANCH_CHAT;
			message.node_space_id = branchParentData.node_space_id;
			message.node_id = branchParentData.parent_node_id;
			message.selected_text_data = branchParentData.selected_text_data;
			branchParentData = {}; // Reset the branch parent data
		}else {	// New chat
			console.log("New chat");
			message.chat_type = Constants.CHAT_TYPE_NEW_CHAT;
		}
	} else { // Existing chat
		response = await doesChatExist(chatId);
		if (!response) {	// Chat does not exist
			console.warn("Chat does not exist");
			message.chat_type = Constants.CHAT_TYPE_UNKNOWN_CHAT;
		} else {	// Chat exists
			console.log("Value of response: ", response);
			console.log("Chat exists");
			message.chat_type = Constants.CHAT_TYPE_EXISTING_CHAT;
			const {node_space_id, node_id} = response;
			message.node_space_id = node_space_id;
			message.node_id = node_id;
		}
	}

	// We need to send the Constants to the content script
	response = await sendMessage(tab.id, Constants.CONTENT_SCRIPT_CONSTANTS, Constants);
	if (!response.status) {
		console.error("Error sending constants to content script");
		return;
	}

	response = await sendMessage(tab.id, Constants.UPDATE_CONTENT_SCRIPT_TEMP_DATA, message);
	if (!response.status) {
		console.error("Error updating content script temp data");
		return;
	}
}

/***** Context Menu Setup */
chrome.runtime.onInstalled.addListener(() => {
	chrome.contextMenus.create({
		id: Constants.CONTEXT_MENU_CREATE_BRANCH_NODE,
		title: "Create Branch Chat",
		contexts: ["selection"], // makes it so the button only appears when text is selected
		enabled: true,
	});
	chrome.contextMenus.create({
		id: Constants.CONTEXT_MENU_CREATE_PARENT_NODE,
		title: "Make Parent Chat",
		contexts: ["all"],
	});
	chrome.contextMenus.create({
		id: Constants.CONTEXT_MENU_RESET,
		title: "Reset",
		contexts: ["all"],
	});
});

chrome.contextMenus.onClicked.addListener(handleContextMenuClick);

function handleContextMenuClick(info, tab) {
	console.log("Chrome context menu item clicked");

	if (info.menuItemId === Constants.CONTEXT_MENU_CREATE_PARENT_NODE) {
		createParentNode(info, tab);
	} else if (info.menuItemId === Constants.CONTEXT_MENU_CREATE_BRANCH_NODE) {
		startNewBranchChat(info, tab);
	} else if (info.menuItemId === Constants.CONTEXT_MENU_RESET) {
		// Temporary code to reset the storage
		chrome.storage.sync.clear();
	} else {
		console.error("Unknown context menu item clicked:", info.menuItemId);
	}
}

async function createParentNode(info, tab) {
	console.log("Setting Parent Node");

	var chat_data = {};
	var response;

	// Get the chat information from the content script
	response = await sendMessage(tab.id, Constants.GET_CHAT_DATA);
	if (!response.status) {
		notifyUser(Constants.ERROR, "Error getting chat data");
		return;
	}
	chat_data = response.data;
	const chat_type = chat_data.chat_type;

	// is this chat a branch?
	if (chat_type !== Constants.CHAT_TYPE_UNKNOWN_CHAT) {
		notifyUser(Constants.WARNING, "Chat is not a new chat. Cannot make into parent");
		return;
	}

	// Get the chat id and chat title
	const url = new URL(info.pageUrl);
	const chat_id = url.pathname;

	response = await sendMessage(tab.id, Constants.GET_CHAT_TITLE);
	const chat_title = response.data || "ChatGPT Title";

	// Create new node
	const node_space_id = await createNewNodeParent(chat_id, chat_title);
	if (!node) {
		notifyUser(Constants.ERROR, "Error creating new node");
		return;
	}

	// Send the chat data back to the content script
	chat_data.chat_type = Constants.CHAT_TYPE_EXISTING_CHAT;
	chat_data.node_space_id = node_space_id;
	chat_data.node_id = chat_id;

	response = await sendMessage(tab.id, Constants.UPDATE_CONTENT_SCRIPT_TEMP_DATA, chat_data);
	if (!response.status) {
		notifyUser(Constants.ERROR, "Error updating the parent chat data");
		return;
	}

	console.log("Parent Node Created");
}

async function startNewBranchChat(info, tab) {

	var response;
	// Get the chat information from the content script
	response = await sendMessage(tab.id, Constants.GET_CHAT_DATA);
	if (!response.status) {
		notifyUser(Constants.ERROR, "Error getting chat data");
		return;
	}
	const chat_data = response.data;

	// Check what type of chat it is
	if (chat_data.chat_type === Constants.CHAT_TYPE_UNKNOWN_CHAT) {
		notifyUser(Constants.WARNING, "URL is not a known chat. Cannot create branch from it");
		return;
	} else if (chat_data.chat_type === Constants.CHAT_TYPE_NEW_CHAT) {
		notifyUser(Constants.WARNING, "URL is a new chat. Cannot create branch from it");
		return;
	}

	// Get the selected text from the context menu
	response = await sendMessage(tab.id, Constants.GET_SELECTED_TEXT);
	if (!response.status) {
		switch (response.data) {
			case Constants.NO_TEXT_SELECTED:
				notifyUser(Constants.ERROR, "No text selected");
				break;
			case Constants.MAX_TEXT_SELECTION_LENGTH_EXCEEDED:
				notifyUser(Constants.ERROR, "Exceeded text selection limit");
				break;
			case Constants.TEXT_SPANS_MULTIPLE_MESSAGES:
				notifyUser(Constants.ERROR, "Text spans multiple messages");
				break;
			case Constants.INVALID_TEXT_SELECTED:
				notifyUser(Constants.ERROR, "Invalid text selected");
				break;
			default:
				notifyUser(Constants.ERROR, "Unknown error");
		}
		return;
	}

	// selected text is valid; get the selected text and the selected text container id
	const { selectedText, selectedTextContainerId } = response.data;

	branchParentData = {
		node_space_id: chat_data.node_space_id,
		parent_node_id: chat_data.node_id,
		selected_text_data: {selectedText, selectedTextContainerId},
	};

	// Set the state to indicate a new branch node has been created
	state.isNewBranchNode = true;

	// Open a new ChatGPT chat in the current tab
	notifyUser(Constants.INFO, "New branch chat started");
	chrome.tabs.update(tab.id, { url: Constants.CHATGPT_ORIGIN });
}

async function createBranchChat(chat_data, data, tab_id) {
	var response;
	// Create a new node object and associated objects
	const node_space_id = chat_data.node_space_id;
	const parent_node_id = chat_data.node_id;
	const selected_text_data = chat_data.selected_text_data;

	const branch_node_id = data.chat_id;
	const branch_node_title = data.chat_title;

	response = await createNewNodeBranch(node_space_id, parent_node_id, selected_text_data, branch_node_id, branch_node_title);
	if (!response) {
		notifyUser(Constants.ERROR, "Error creating new branch node");
		return false;
	}

	// Creating a new chat object to send to the content script
	var new_chat_data = {
		chat_type: null,
		node_space_id: null,
		node_id: null,
		selected_text_data: null,
	};

	// Send the chat data back to the content script
	new_chat_data.chat_type = Constants.CHAT_TYPE_EXISTING_CHAT;
	new_chat_data.node_space_id = node_space_id;
	new_chat_data.node_id = branch_node_id;

	// Send the chat data back to the content script
	response = await sendMessage(tab_id, Constants.UPDATE_CONTENT_SCRIPT_TEMP_DATA, new_chat_data);
	if (!response.status) {
		notifyUser(Constants.ERROR, "Error updating the new branch chat data");
		return;
	}

	console.log("Branch Node Created");

	return true;
}

async function updateChatMessages(chat_data, chatMessages) {
	
	var response;
	const node_space_id = chat_data.node_space_id;
	const node_id = chat_data.node_id;
	const chat_type = chat_data.chat_type;

	if (chat_type === Constants.CHAT_TYPE_EXISTING_CHAT)	{
		// Update the chat messages
		response = await updateNodeMessages(node_space_id, node_id, chatMessages);
		if (!response) {
			notifyUser(Constants.ERROR, "Error updating chat messages");
			return false;
		}
	} else {
		console.error("Unknown chat type:", chat_type);
		return false;
	}
	return true;
}

async function updateChatTitle(data) {
	var response;
	const node_id = data.node_id;
	const new_title = data.new_title;

	response = await updateNodeTitle(node_id, new_title);

	if (!response) {
		notifyUser(Constants.ERROR, "Error updating node title");
		return false;
	}
	return true;
}

async function deleteChat(data) {
	var response;
	const node_id = data.node_id;

	response = await deleteNode(node_id);

	if (!response) {
		notifyUser(Constants.ERROR, "Error deleting node");
		return false;
	}
	return true;
}



// Send in format {action: ..., data: ...}
// Receive in format {status: ..., data: ...}
async function sendMessage(tabId, message_key, message_data=null) {
	const message = {
		action: message_key,
		data: message_data,
	};

	try {
		const response = await chrome.tabs.sendMessage(tabId, message);
		console.log("Response from content script in sendMessage: ", response.status);
		return response;
	} catch (error) {
		console.error("Error sending message in sendMessage:", error);
		return null;
	}
}

// Receive in format {action: ..., chat_data: ..., data: ...}
// Respond in format {status: ..., data: ...}
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	
	const chat_data = message.chat_data;
	const data = message.data;

	var response = {
		status: false,
		data: null,
	};

	switch (message.action) {
		case Constants.UPDATE_CHAT_MESSAGES:
			console.log("Received message to update chat messages");
			updateChatMessages(chat_data, data).then((status) => {
				response.status = status;
				sendResponse(response);
			});
			break;
		case Constants.HANDLE_NEW_BRANCH_CREATION:
			console.log("Received message to handle new branch creation");
			const tab_id = sender.tab.id;
			createBranchChat(chat_data, data, tab_id).then((status) => {
				response.status = status;
				sendResponse(response);
			});
			break;

		case Constants.HANDLE_CHAT_RENAMING:
			console.log("Received message to update node title");
			updateChatTitle(data).then((status) => {
				response.status = status;
				sendResponse(response);
			});

		case Constants.HANDLE_CHAT_DELETION:
			console.log("Received message to delete node");
			deleteChat(data).then((status) => {
				response.status = status;
				sendResponse(response);
			});

		default:
			console.error("Unknown action:", message.action);
			sendResponse(response);
	}
	return true;
});


/***** Background Notifications ******/
async function notifyUser(action_type, invalid_action_message) {

	const alert_message = `${action_type}: ${invalid_action_message}`;
	
	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		sendMessage(tabs[0].id, Constants.ALERT, alert_message).then((response) => {
			if (!response.status) {
				console.error("Error sending alert message");
			}
		});
	});
}


// 	if (message.action === "updateContextMenu") {


// /* CONSTANT DEFINITIONS */
// // const TEST_NEW_NODE = [
// // 	{
// // 		node_parent_id: "",
// // 		node_branch_id: "test_is",
// // 		node_parent_title: "text",
// // 		edge_selected_text: "sample_title",
// // 	},
// // ];

// // const TEST_NODES = [
// // 	{
// // 		node_id: "1",
// // 		node_type: "default",
// // 		node_position: { x: 250, y: 5 },
// // 		node_data: {
// // 			node_data_title: "Node 1",
// // 		},
// // 	},
// // ];

// const CHATGPT_ORIGIN = "https://chatgpt.com"
// const CHATGPT_HOSTNAME = "chatgpt.com";

// // Variable used for state management
// let state = {
// 	hasNewNode: false,
// 	lastActiveChatId: null,
// 	overviewWindowId: null,
// };



// chrome.tabs.onUpdated.addListener(handleTabUpdate);

// async function handleTabUpdate(tabId, changeInfo, tab) {
// 	// New webpage open, is it ChatGPT?
// 	const url = new URL(tab.url);
// 	const hostname = url.hostname; // e.g., chatgpt.com

// 	if (hostname !== CHATGPT_HOSTNAME) return;

// 	state.lastActiveChatId = tab.id;
// 	console.log("Last active ChatGPT tab ID Saved:", state.lastActiveChatId);

// 	if (changeInfo.url && state.hasNewNode) {
// 		const url = new URL(changeInfo.url);

// 		const hostname = url.hostname; // e.g., chatgpt.com
// 		const chatId = url.pathname; // e.g., /c/f226cd80-a0bd-44f5-9a74-68baa556b80c

// 		// check if hostname is chatgpt and chat_id is empty
// 		if (hostname === CHATGPT_HOSTNAME && chatId === "/") {
// 			console.log("URL is a new ChatGPT page: ", url);
// 			return;
// 		}
// 		// Either we have new chat that is a branch or we have navigated to a new page
// 		state.hasNewNode = false;

// 		const { new_nodes: newNodesStor } = await getFromStorage("new_nodes");

// 		let response = await sendMessageToTab(tab.id, { action: "extractTitle" });
// 		const titleText = response.title;

// 		// Check the following:
// 		// 1) if the URL is a ChatGPT conversation page
// 		// 2) the url has an id (meaning the chat page has been used)
// 		// 3) The chat title is "ChatGPT"
// 		if (hostname === CHATGPT_HOSTNAME && chatId.startsWith("/c/") && titleText === "ChatGPT") {
// 			// We have a new chat that is a branch.
// 			console.log("URL is a ChatGPT conversation page: ", url);

// 			// search the new_nodes_stor for an element with an empty branch_id and return the element index
// 			const index = newNodesStor.findIndex((node) => !node.node_branch_id);

// 			if (index != -1) {
// 				newNodesStor[index].node_branch_id = chatId;
// 				console.log("Updated newNode: ", newNodesStor[index].node_branch_id);

// 				let response = await setToStorage({ new_nodes: newNodesStor });
// 				console.log("Node branch ID updated to storage: ", response);
// 			} else {
// 				// No newNode with an empty branch_id found
// 				console.warn("No newNode with an empty branch_id found. This should not happen...");
// 			}
// 		} else {
// 			// We have navigated to a new page or chat; remove the newNode element with an empty branch_id from storage
// 			const updated_new_nodes_stor = newNodesStor.filter((node) => node.node_branch_id); // Remove the newNode with an empty branch_id (check if truthy)

// 			let response = await setToStorage({ new_nodes: updated_new_nodes_stor });
// 			console.log("New Node branch removed from storage: ", response);
// 		}
// 	}
// }


// async function saveHighlightedText(info, tab) {
// 	console.log("Saving Highlighted Text");

// 	let titleText = "", response;
// 	const selectedText = info.selectionText;
// 	const url = new URL(info.pageUrl);

// 	//const hostname = url.hostname; // e.g., chatgpt.com
// 	const chatId = url.pathname; // e.g., /c/f226cd80-a0bd-44f5-9a74-68baa556b80c

// 	try {
// 		response = await sendMessageToTab(tab.id, { action: "extractTitle" });
// 		titleText = response.title;
// 	} catch (error) {
// 		console.error("Error extracting title from the page: ", error);
// 	}

// 	console.log("Selected text:", selectedText);
// 	console.log("Pathname:", chatId);

// 	// Format the data as specified
// 	const new_node = {
// 		node_parent_id: chatId,
// 		node_branch_id: "",
// 		node_parent_title: titleText,
// 		edge_selected_text: selectedText,
// 	};

// 	// temporary code to test the storage (reset the storage)
// 	//await setToStorage({ new_nodes: TEST_NEW_NODE });
// 	//await setToStorage({ nodes: TEST_NODES });

// 	// Retrieve the newNodes from storage
// 	const { new_nodes: newNodesStor } = await getFromStorage("new_nodes");
// 	console.log("Data retrieved from storage (this may be empty, that is fine):", newNodesStor);

// 	const updatedNewNodesStor = newNodesStor ? [...newNodesStor, new_node] : [new_node];

// 	// Save the newNode to storage
// 	response = await setToStorage({ new_nodes: updatedNewNodesStor });
// 	console.log("Data saved to storage:", response);

// 	// Set the state to indicate a new node has been created
// 	state.hasNewNode = true;

// 	// Open a new ChatGPT chat in the current tab
// 	const newUrl = "https://chatgpt.com/"; //chatgpt_hostname;

// 	//Query the active tab
// 	chrome.tabs.update(tab.id, { url: newUrl });
// 	console.log("Opened new ChatGPT chat in the current tab: ", newUrl);
// }



// // Function to message the react application, if the window is open

// chrome.action.onClicked.addListener(openOverviewWindow);

// chrome.windows.onRemoved.addListener(handleOverviewWindowClose);

// function openOverviewWindow() {

// 	// Check if the window already exists
// 	if (state.overviewWindowId) {
// 		chrome.windows.update(state.overviewWindowId, { focused: true });
// 		return;
// 	}

// 	console.log("Action button clicked. Opening window.");

// 	chrome.windows.create({
// 		url: "index.html",
// 		type: "popup",
// 		width: 800,
// 		height: 600,
// 		focused: true,
// 	}, function(window) {
//   		state.overviewWindowId = window.id;
// 	});
// }

// function handleOverviewWindowClose(windowId) {
// 	if (windowId === state.overviewWindowId) {
// 		state.overviewWindowId = null;
// 		console.log("Overview window was closed.");
// 	}
// }

// /*
// Note: Keeping .catch for each promise to make debugging easier.
// 	  Might change it from throwing an error to just a warning
// */
// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
// 	if (message.action === "updateContextMenu") {
// 		chrome.contextMenus.update("saveHighlightedText", {enabled: message.enabled,})
// 			.then(() => {
// 				sendResponse({ success: true });
// 			}).catch((error) => {
// 				console.error("Error updating context menu: ", error);
// 				sendResponse({ success: false });
// 			});

// 	} else if (message.action === "updateDiagram")	{
// 		chrome.tabs.get(state.lastActiveChatId)
// 			.then((tab) => {
// 				if (!tab) {
// 					console.error("Error getting tab: ", chrome.runtime.lastError.message);
// 				}
// 				console.log("Last active chat tab found");

// 				const response = sendMessageToTab(tab.id, { action: "getPanelData" })
// 				return response;
// 			})
// 			.then((response) => {
// 				if (!response) {
// 					console.error("Error getting panel data: ", chrome.runtime.lastError.message);
// 				}
// 				console.log("Response from getPanelData: ", response);
// 				sendResponse({ success: true });
// 			})
// 			.catch((error) => {
// 				console.error("Error updating diagram: ", error);
// 				sendResponse({ success: false });
// 			});
// 	} else if (message.action === "openChat") 		{
// 		const chatId = message.nodeId;
// 		const chatUrl = `${CHATGPT_ORIGIN}${chatId}`
// 		// Launch in the last active chatGPT tab or create a new tab
// 		if (state.lastActiveChatId) {
// 			chrome.tabs.update(state.lastActiveChatId, { url: chatUrl });
// 		} else {
// 			chrome.tabs.create({ url: chatUrl });
// 		}
// 		sendResponse({ success: true });

// 	} else if (message.action === "getFromStorage") {
// 		chrome.storage.sync.get(message.key)
// 			.then((result) => {
// 				console.log("Data retrieved from storage: ", result[message.key]);
// 				sendResponse({ success: true, data: result[message.key] });
// 			}).catch((error) => {
// 				console.error("Error getting from storage: ", error);
// 				sendResponse({ success: false });
// 		});
// 	} else if (message.action === "setToStorage") {
// 		const data = { [message.key]: message.value };
// 		console.log("Data saved to storage: ", data);
// 		chrome.storage.sync.set(data)
// 		.then(() => {
// 			sendResponse({ success: true });
// 		}).catch((error) => {
// 			console.error("Error setting to storage: ", error);
// 			sendResponse({ success: false });
// 		});
// 	} else {
// 		console.error("Unknown storage action: ", message.action);
// 		sendResponse({ success: false });
// 	}

// 	return true; // Keeps the message channel open for sendResponse
// });
