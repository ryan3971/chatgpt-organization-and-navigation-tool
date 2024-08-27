import {
	doesNodeExist,
	createNewNodeParent,
	updateNodeMessages,
	createNewNodeBranch,
	updateNodeTitle,
	deleteNode,
	deleteNodeSpace,
	getNodeSpaces,
	getNodeSpaceData,
	updateNodeSpaceTitle,
} from "./background_helpers/helper_functions.js";
import * as Constants from "./Constants/constants.js";

/**
 * To account for multiple tabs, I need one state objects in background that will persist on tab changes
 * And info specific to a tab stored in the content script
 */

// Variable used for state management
let state = {
	isNewBranchNode: false,
	reactWindowId: null,
	navigatedChat: { tabId: null, messageIndex: null },
	storageChange: false,
};

// store data to pass onto a newly created branch node
let branchParentData = {
	node_space_id: null,
	parent_node_id: null,
	selected_text_data: null,
};

// Listen for tab updates
chrome.tabs.onUpdated.addListener(handleTabUpdate);
async function handleTabUpdate(tabId, changeInfo, tab) {
	console.log("Tab updated:", tab.status);
	if (changeInfo.status !== "complete") return; // Wait for the page to load completely
	console.log("Tab fully loaded");

	let response;
	// New webpage open, is it ChatGPT?
	const url = new URL(tab.url);
	const hostname = url.hostname; // e.g., chatgpt.com

	if (hostname !== Constants.CHATGPT_HOSTNAME) return; // Not ChatGPT

	// We need to send the Constants to the content script
	response = await sendMessage(tabId, Constants.CONTENT_SCRIPT_CONSTANTS, Constants);
	if (!response.status) {
		console.error("Error sending constants to content script");
		return;
	}

	// Check the Node URL
	const nodeId = url.pathname; // e.g., /c/f226cd80-a0bd-44f5-9a74-68baa556b80c
	var message = {
		node_type: null,
		node_space_id: null,
		node_id: null,
		selected_text_data: null,
	};

	if (nodeId === "/") {
		if (state.isNewBranchNode) {
			// New branch node
			console.warn("New branch node");
			state.isNewBranchNode = false;
			message.node_type = Constants.NODE_TYPE_NEW_BRANCH;
			message.node_space_id = branchParentData.node_space_id;
			message.node_id = branchParentData.parent_node_id;
			message.selected_text_data = branchParentData.selected_text_data;
			branchParentData = {}; // Reset the branch parent data
		} else {
			// New node
			console.warn("New node");
			message.node_type = Constants.NODE_TYPE_NEW;
		}
	} else {
		// Existing node
		response = await doesNodeExist(nodeId);
		if (!response) {
			// Node does not exist
			console.warn("Node does not exist");
			message.node_type = Constants.NODE_TYPE_UNKNOWN;
		} else {
			// Node exists
			console.warn("Node exists");
			message.node_type = Constants.NODE_TYPE_EXISTING;
			const { node_space_id, node_id } = response;
			message.node_space_id = node_space_id;
			message.node_id = node_id;
		}
	}

	// Send the node data to the content script
	response = await sendMessage(tabId, Constants.UPDATE_CONTENT_SCRIPT_TEMP_DATA, message);
	if (!response.status) {
		console.error("Error updating content script temp data");
		return;
	}

	// if this is a chat navigated to from the react app, scroll to the message index
	if (state.navigatedChat.tabId === tabId) {
		console.log("Navigating to message index:", state.navigatedChat.messageIndex);
		sendMessage(tab.id, Constants.SCROLL_TO_CHAT_MESSAGE, state.navigatedChat.messageIndex).then((response) => {
			if (!response.status) {
				console.error("Error sending message to scroll to message index. ");
			}
		});
		state.navigatedChat = { tabId: null, messageIndex: null }; // Reset the navigated chat
	}
}

/***** Context Menu Setup ******/
chrome.runtime.onInstalled.addListener(() => {
	chrome.contextMenus.create({
		id: Constants.CONTEXT_MENU_OPEN_GUI,
		title: "Open GUI",
		contexts: ["all"], // makes it so the button only appears when text is selected
		enabled: true,
	});

	chrome.contextMenus.create({
		id: Constants.CONTEXT_MENU_CREATE_BRANCH_NODE,
		title: "Create Branch Node",
		contexts: ["selection"], // makes it so the button only appears when text is selected
		enabled: true,
	});
	chrome.contextMenus.create({
		id: Constants.CONTEXT_MENU_CREATE_PARENT_NODE,
		title: "Make Parent Node",
		contexts: ["all"],
	});
	chrome.contextMenus.create({
		id: Constants.CONTEXT_MENU_RESET,
		title: "Reset",
		contexts: ["all"],
	});
});

// Handle the context menu click
chrome.contextMenus.onClicked.addListener(handleContextMenuClick);
function handleContextMenuClick(info, tab) {
	console.log("Chrome context menu item clicked");
	if (info.menuItemId === Constants.CONTEXT_MENU_OPEN_GUI) {
		openOverviewWindow();
	} else if (info.menuItemId === Constants.CONTEXT_MENU_CREATE_PARENT_NODE) {
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

/*****React Application Handlers ******/
chrome.action.onClicked.addListener(openOverviewWindow);

function openOverviewWindow() {
	// Check if the window already exists
	if (state.reactWindowId) {
		console.log("React window already exists. Focusing on it.");
		chrome.windows.update(state.reactWindowId, { focused: true });
		return true;
	}

	console.log("Action button clicked. Opening window.");

	chrome.windows.create(
		{
			url: "index.html",
			type: "popup",
			state: "maximized",
		},
		function (window) {
			state.reactWindowId = window.id;
		}
	);
}

// Handle the closing of the React window
chrome.windows.onRemoved.addListener(handleOverviewWindowClose);
function handleOverviewWindowClose(windowId) {
	if (windowId === state.reactWindowId) {
		state.reactWindowId = null;
		console.log("React window was closed.");
	}
}

/***** Event Handlers ******/

async function createParentNode(info, tab) {
	console.log("Setting Parent Node");

	var node_data = {};
	var response;

	// Get the node information from the content script
	response = await sendMessage(tab.id, Constants.GET_NODE_DATA);
	if (!response.status) {
		notifyUser(Constants.ERROR, "Error getting chat data");
		return;
	}
	node_data = response.data;
	const node_type = node_data.node_type;

	// is this node a branch?
	if (node_type !== Constants.NODE_TYPE_UNKNOWN) {
		notifyUser(Constants.WARNING, "Node is not a new chat. Cannot make into parent");
		return;
	}

	// Get the node id and node title
	const url = new URL(info.pageUrl);
	const node_id = url.pathname;

	response = await sendMessage(tab.id, Constants.GET_NODE_TITLE);
	const node_title = response.data;

	// Create new node
	const node_space_id = await createNewNodeParent(node_id, node_title);
	if (!node_space_id) {
		notifyUser(Constants.ERROR, "Error creating new node");
		return;
	}

	// Send the node data back to the content script
	node_data.node_type = Constants.NODE_TYPE_EXISTING;
	node_data.node_space_id = node_space_id;
	node_data.node_id = node_id;

	response = await sendMessage(tab.id, Constants.UPDATE_CONTENT_SCRIPT_TEMP_DATA, node_data);
	if (!response.status) {
		notifyUser(Constants.ERROR, "Error updating the parent node data");
		return;
	}

	// send message to get the messages from the chat
	response = await sendMessage(tab.id, Constants.UPDATE_NODE_MESSAGES);
	if (!response.status) {
		notifyUser(Constants.ERROR, "Error getting node data");
		return;
	}

	console.log("Parent Node Created");
}

async function startNewBranchChat(info, tab) {
	var response;
	// Get the node information from the content script
	response = await sendMessage(tab.id, Constants.GET_NODE_DATA);
	if (!response.status) {
		notifyUser(Constants.ERROR, "Error getting node data");
		return;
	}
	const node_data = response.data;

	// Check what type of node it is
	if (node_data.node_type === Constants.NODE_TYPE_UNKNOWN) {
		notifyUser(Constants.WARNING, "URL is not a known node. Cannot create branch from it");
		return;
	} else if (node_data.node_type === Constants.NODE_TYPE_NEW) {
		notifyUser(Constants.WARNING, "URL is a new node. Cannot create branch from it");
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
		node_space_id: node_data.node_space_id,
		parent_node_id: node_data.node_id,
		selected_text_data: { selectedText, selectedTextContainerId },
	};

	// Set the state to indicate a new branch node has been created
	state.isNewBranchNode = true;

	// Open a new ChatGPT node in the current tab
	notifyUser(Constants.INFO, "New branch node started");
	chrome.tabs.update(tab.id, { url: Constants.CHATGPT_ORIGIN });
}

async function createBranchChat(node_data, data, tab_id) {
	var response;
	// Create a new node object and associated objects
	const node_space_id = node_data.node_space_id;
	const parent_node_id = node_data.node_id;
	const selected_text_data = node_data.selected_text_data;

	const branch_node_id = data.node_id;
	const branch_node_title = data.node_title;

	response = await createNewNodeBranch(node_space_id, parent_node_id, selected_text_data, branch_node_id, branch_node_title);
	if (!response) {
		notifyUser(Constants.ERROR, "Error creating new branch node");
		return false;
	}

	console.log("Branch Node Created");

	return true;
}

async function updateChatMessages(node_data, node_messages) {
	var response;
	const node_space_id = node_data.node_space_id;
	const node_id = node_data.node_id;
	const node_type = node_data.node_type;

	if (node_type === Constants.NODE_TYPE_EXISTING) {
		// Update the node messages
		response = await updateNodeMessages(node_space_id, node_id, node_messages);
		if (!response) {
			notifyUser(Constants.ERROR, "Error updating node messages");
			return false;
		}
	} else {
		console.error("Unknown node type:", node_type);
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

async function getNodeSpaceKeys() {
	// Get the node space keys
	const node_space_keys = await getNodeSpaces();
	return node_space_keys;
}

async function getNodeSpace(space_id) {
	// Get the node space data
	const node_space_data = await getNodeSpaceData(space_id);
	return node_space_data;
}

function navigateToNodeChatCallback(tab, message_index) {
	// focus on the tab
	chrome.windows.update(tab.windowId, { focused: true });

	const tab_id = tab.id;

	// Check if a message_index was provided
	if (!message_index) return;
	console.log("Sending message to content script to navigate to message index:", message_index);

	// Send a message to the content script to scroll to the message index
	sendMessage(tab_id, Constants.SCROLL_TO_CHAT_MESSAGE, message_index).then((response) => {
		if (!response.status) {
			console.error("Error sending message to scroll to message index");
		}
	});
}

async function handleOpenNodeChat(node_id, message_index) {
	// Check if there is a tab with the node id in the URL open already
	chrome.tabs.query({ url: `${Constants.CHATGPT_ORIGIN}${node_id}` }, function (tabs) {
		console.log("Tabs with the node id in the URL:", tabs);
		if (tabs.length > 0) {
			// Update the tab and handle navigation after the tab is updated (set it to active)
			chrome.tabs.update(tabs[0].id, { active: true }, function (tab) {
				navigateToNodeChatCallback(tab, message_index);
			});
		} else {
			// Open a new tab and handle navigation after the tab is created
			chrome.tabs.create({ url: `${Constants.CHATGPT_ORIGIN}${node_id}` }, function (newTab) {
				// Save the tab id and message index to navigate to after the tab is created
				state.navigatedChat = { tabId: newTab.id, messageIndex: message_index };
			});
		}
	});

	// Minimize the React window
	if (state.reactWindowId) {
		chrome.windows.update(state.reactWindowId, { state: "minimized" });
	}

	return true;
}

/*** Storage Listener ****/

// chrome.storage.onChanged.addListener(handleStorageChange);
// function handleStorageChange(changes, namespace) {
// 	if (!state.storageChange) {
// 		return;
// 	}

// 	for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
// 		console.log(`Storage key "${key}" in namespace "${namespace}" changed.`, `Old value was "${oldValue}", new value is "${newValue}".`);
// 		console.log(newValue);

// 	}
// }

/***** Messaging ******/

// Send in format {action: ..., data: ...}
// Receive in format {status: ..., data: ...}
async function sendMessage(tabId, message_key, message_data = null) {
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

// Receive in format {action: ..., node_data: ..., data: ...}
// Respond in format {status: ..., data: ...}
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	var node_data = null; // Node data from the content script
	var response = {
		// Response to send back to the content script
		status: false,
		data: null,
	};

	// Check if the message is from the ChatGPT origin, and get the node data if it is
	if (sender.origin === Constants.CHATGPT_ORIGIN) {
		node_data = message.node_data;
	}

	// Get the data from the message
	const data = message.data;

	switch (message.action) {
		case Constants.UPDATE_NODE_MESSAGES:
			console.log("Received message to update node messages");
			updateChatMessages(node_data, data).then((status) => {
				response.status = status;
				sendResponse(response);
			});
			break;
		case Constants.HANDLE_NEW_BRANCH_CREATION:
			console.log("Received message to handle new branch creation");
			const tab_id = sender.tab.id;
			createBranchChat(node_data, data, tab_id).then((status) => {
				response.status = status;
				sendResponse(response);
			});
			break;
		case Constants.HANDLE_NODE_RENAMING:
			console.log("Received message to update node title");
			updateChatTitle(data).then((status) => {
				response.status = status;
				sendResponse(response);
			});
			break;
		case Constants.HANDLE_NODE_DELETION:
			console.log("Received message to delete node");
			deleteChat(data).then((status) => {
				response.status = status;
				sendResponse(response);
			});
			break;
		case Constants.REACT_APP_MOUNTED:
			console.log("Received message that React application mounted");
			getNodeSpaceKeys().then((node_space_keys) => {
				if (node_space_keys) {
					response.status = true;
					response.data = node_space_keys;
				}
				sendResponse(response);
			});
			break;
		case Constants.GET_NODE_SPACE_DATA:
			console.log("Received message from React application to get node space data");
			getNodeSpace(data.space_id).then((node_space_data) => {
				if (node_space_data) {
					response.status = true;
					response.data = node_space_data;
				}
				sendResponse(response);
			});
			break;
		case Constants.HANDLE_OPEN_NODE_CHAT:
			console.log("Received message to open chat for node", data.node_id);
			handleOpenNodeChat(data.node_id, data.message_index).then((status) => {
				response.status = status;
				sendResponse(response);
			});
			break;
		case Constants.REACT_UPDATE_NODE_SPACE_TITLE:
			console.log("Received message to update node space title");
			updateNodeSpaceTitle(data).then((status) => {
				if (status) {
					state.storageChange = true;
				}
				response.status = status;
				sendResponse(response);
			});
			break;
		// case Constants.REACT_DELETE_NODE_SPACE:
		// 	console.log("Received message to delete node space");
		// 	deleteNodeSpace(data.node_space_id).then((status) => {
		// 		if (status) {
		// 			state.storageChange = true;
		// 		}
		// 		response.status = status;
		// 		sendResponse(response);
		// 	});
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
