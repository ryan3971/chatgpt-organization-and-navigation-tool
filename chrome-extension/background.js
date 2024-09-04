import {
	doesNodeExist,
	createNewNodeParent,
	updateNodeMessages,
	createNewNodeBranch,
	updateNodeTitle,
	deleteNode,
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
	navigatedChat: { tab: null, messageIndex: null },
	storageChange: false,
	lastActiveChatTabId: null,
	tabLoadComplete: {tabId: null, status: false},
};

// store data to pass onto a newly created branch node
let branchParentData = {
	node_space_id: null,
	parent_node_id: null,
	selected_text_data: null,
};

/***** Chrome Listeners ******/

/* Listen for Tab Updates */
chrome.tabs.onUpdated.addListener(handleTabUpdate);
async function handleTabUpdate(tabId, changeInfo, tab) {
	try {
		console.log("Tab status:", tabId, changeInfo, tab);
		console.log("Tab updated:", tabId, changeInfo, tab);
		if (changeInfo.status !== "complete") return; // Wait for the page to load completely
		// New webpage open, is it ChatGPT?
		const url = new URL(tab.url);
		const hostname = url.hostname; // e.g., chatgpt.com

		if (hostname !== Constants.CHATGPT_HOSTNAME) return; // Not ChatGPT

		// We need to send the Constants to the content script
		let response = await sendMessage(tabId, Constants.CONTENT_SCRIPT_CONSTANTS, Constants);
		if (!response || !response.status) {
			throw new Error("Error sending constants to content script");
		}

		// Check if we are in the middle of creating a new branch
		response = await sendMessage(tabId, Constants.IS_NEW_BRANCH);
		if (!response || !response.status) {
			throw new Error("Error checking if new branch is being created");
		}
		if (response.data) {
			console.log("New branch node creation in progress...");
			return;
		}

		// Check the Node URL
		const nodeId = url.pathname; // e.g., /c/f226cd80-a0bd-44f5-9a74-68baa556b80c
		let message = {
			node_type: null,
			node_space_id: null,
			node_id: null,
			node_title: null,
			selected_text_data: null,
		};

		if (nodeId === "/") {
			if (state.isNewBranchNode) {
				console.warn("New branch node");
				state.isNewBranchNode = false;
				message.node_type = Constants.NODE_TYPE_NEW_BRANCH;
				message.node_space_id = branchParentData.node_space_id;
				message.node_id = branchParentData.parent_node_id;
				message.selected_text_data = branchParentData.selected_text_data;
				branchParentData = {}; // Reset the branch parent data
			} else {
				console.warn("New node");
				message.node_type = Constants.NODE_TYPE_NEW;
			}
		} else {
			// Existing node
			response = await doesNodeExist(nodeId);
			if (!response) {
				console.warn("Node does not exist");
				message.node_type = Constants.NODE_TYPE_UNKNOWN;
			} else {
				console.warn("Node exists");
				const { node_space_id, node_id, node_title } = response;
				message = {
					node_type: Constants.NODE_TYPE_EXISTING,
					node_space_id,
					node_id,
					node_title,
				};
			}
		}

		// Send the node data to the content script
		response = await sendMessage(tabId, Constants.SYNC_WITH_CONTENT_SCRIPT, message);
		if (!response || !response.status) {
			throw new Error("Error updating content script temp data");
		}

		// Scroll to the message index if navigating from the React app
		if (state.navigatedChat.tab === tabId) {
			console.log("Navigating to message index:", state.navigatedChat.messageIndex);
			navigateToNodeChatCallback(state.navigatedChat.tab, state.navigatedChat.messageIndex);
			state.navigatedChat = { tab: null, messageIndex: null };
		}
	} catch (error) {
		console.error("Error in handleTabUpdate:", error);
	}
}

/* Context Menu Setup */
chrome.runtime.onInstalled.addListener(() => {
	const contextMenuItems = [
		{
			id: Constants.CONTEXT_MENU_OPEN_GUI,
			title: "Open GUI",
			contexts: ["all"], // This menu item is available on all contexts
		},
		{
			id: Constants.CONTEXT_MENU_CREATE_BRANCH_NODE,
			title: "Create Branch Node",
			contexts: ["selection"], // Only shows up when text is selected
		},
		{
			id: Constants.CONTEXT_MENU_CREATE_PARENT_NODE,
			title: "Make Parent Node",
			contexts: ["all"], // This menu item is available on all contexts
		},
		{
			id: Constants.CONTEXT_MENU_RESET,
			title: "Reset",
			contexts: ["all"], // This menu item is available on all contexts
		},
	];

	// Create each context menu item
	contextMenuItems.forEach((item) => {
		chrome.contextMenus.create(
			{
				id: item.id,
				title: item.title,
				contexts: item.contexts,
				enabled: true,
			},
			() => {
				if (chrome.runtime.lastError) {
					console.error(`Error creating context menu item ${item.id}: ${chrome.runtime.lastError.message}`);
				}
			}
		);
	});
});

/* Context Menu Click Handler */
chrome.contextMenus.onClicked.addListener(handleContextMenuClick);

function handleContextMenuClick(info, tab) {
	console.log("Chrome context menu item clicked:", info.menuItemId);

	switch (info.menuItemId) {
		case Constants.CONTEXT_MENU_OPEN_GUI:
			openOverviewWindow();
			break;
		case Constants.CONTEXT_MENU_CREATE_PARENT_NODE:
			createParentNode(info, tab);
			break;
		case Constants.CONTEXT_MENU_CREATE_BRANCH_NODE:
			startNewBranchChat(info, tab);
			break;
		case Constants.CONTEXT_MENU_RESET:
			chrome.storage.sync.clear(); // Temporary code to reset the storage
			console.log("Storage reset successfully.");
			break;
		default:
			console.error("Unknown context menu item clicked:", info.menuItemId);
			break;
	}
}

/* React Application Handlers */
chrome.action.onClicked.addListener(openOverviewWindow);

async function openOverviewWindow() {
	try {
		// Check if the window already exists
		if (state.reactWindowId) {
			console.log("React window already exists. Focusing on it.");
			await chrome.windows.update(state.reactWindowId, { focused: true });
			return true;
		}

		// Get the info for the currently active tab and save it
		const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
		if (tabs.length > 0) {
			const tab = tabs[0];
			state.lastActiveChatTabId = tab.id;
			console.log("Active tab before React app opens: ", tab);
		}

		console.log("Action button clicked. Opening window.");

		// Create a new window for the React application
		const window = await chrome.windows.create({
			url: "index.html",
			type: "popup",
			state: "maximized",
		});

		// Save the React window ID in the state
		state.reactWindowId = window.id;
	} catch (error) {
		console.error("Error in openOverviewWindow:", error);
	}
}

/* React Application Close Handler */
chrome.windows.onRemoved.addListener(handleOverviewWindowClose);

function handleOverviewWindowClose(windowId) {
	if (windowId === state.reactWindowId) {
		state.reactWindowId = null;
		console.log("React window was closed.");
	}
}

/* Event Handlers */
async function createParentNode(info, tab) {
	console.log("Setting Parent Node");

	try {
		// Ensure that the page URL is available
		if (!info.pageUrl) {
			console.error("Missing pageUrl in context menu info.");
			notifyUser(Constants.ERROR, "Invalid page URL.");
			return;
		}

		// Parse the URL to extract node ID
		let url;
		try {
			url = new URL(info.pageUrl);
		} catch (urlError) {
			console.error("Invalid URL format:", info.pageUrl, urlError);
			notifyUser(Constants.ERROR, "Invalid URL format.");
			return;
		}

		const node_id = url.pathname;
		if (!node_id) {
			console.error("Unable to extract node ID from URL:", url);
			notifyUser(Constants.ERROR, "Unable to extract node ID.");
			return;
		}

		// Send a message to the content script to get node data
		const nodeDataResponse = await sendMessage(tab.id, Constants.GET_NODE_DATA);
		if (!nodeDataResponse || !nodeDataResponse.status) {
			console.error("Failed to get node data:", nodeDataResponse);
			notifyUser(Constants.ERROR, "Error getting chat data.");
			return;
		}

		const node_data = nodeDataResponse.data;
		const node_type = node_data.node_type;

		// Check if the node is a branch node
		if (node_type !== Constants.NODE_TYPE_UNKNOWN) {
			console.warn("Node is not a new chat. Cannot make into parent.");
			notifyUser(Constants.WARNING, "Node is not a new chat. Cannot make into parent.");
			return;
		}

		// Send a message to get the node title
		const nodeTitleResponse = await sendMessage(tab.id, Constants.GET_NODE_TITLE);
		if (!nodeTitleResponse || !nodeTitleResponse.status) {
			console.error("Failed to get node title:", nodeTitleResponse);
			notifyUser(Constants.ERROR, "Error getting node title.");
			return;
		}

		const node_title = nodeTitleResponse.data;
		if (!node_title) {
			console.error("Node title is empty.");
			notifyUser(Constants.ERROR, "Node title cannot be empty.");
			return;
		}

		// Create a new parent node
		const node_space_id = await createNewNodeParent(node_id, node_title);
		if (!node_space_id) {
			console.error("Failed to create new parent node.");
			notifyUser(Constants.ERROR, "Error creating new node.");
			return;
		}

		// Update node_data with new parent node information
		node_data.node_type = Constants.NODE_TYPE_EXISTING;
		node_data.node_space_id = node_space_id;
		node_data.node_id = node_id;

		// Sync the updated node data with the content script
		const syncResponse = await sendMessage(tab.id, Constants.SYNC_WITH_CONTENT_SCRIPT, node_data);
		if (!syncResponse || !syncResponse.status) {
			console.error("Failed to sync node data with content script:", syncResponse);
			notifyUser(Constants.ERROR, "Error updating the parent node data.");
			return;
		}

		// Request to update node messages from the content script
		const updateMessagesResponse = await sendMessage(tab.id, Constants.UPDATE_NODE_MESSAGES);
		if (!updateMessagesResponse || !updateMessagesResponse.status) {
			console.error("Failed to update node messages:", updateMessagesResponse);
			notifyUser(Constants.ERROR, "Error getting node data.");
			return;
		}

		console.log("Parent Node Created Successfully.");
		notifyUser(Constants.SUCCESS, "Parent node created successfully.");
	} catch (error) {
		console.error("Unexpected error in createParentNode:", error);
		notifyUser(Constants.ERROR, "An unexpected error occurred while creating the parent node.");
	}
}

/* Create a new branch node */
async function startNewBranchChat(info, tab) {
	try {
		// Get the node information from the content script
		const nodeDataResponse = await sendMessage(tab.id, Constants.GET_NODE_DATA);
		if (!nodeDataResponse || !nodeDataResponse.status) {
			notifyUser(Constants.ERROR, "Error getting node data");
			return;
		}

		const node_data = nodeDataResponse.data;

		// Check what type of node it is
		if (node_data.node_type === Constants.NODE_TYPE_UNKNOWN) {
			notifyUser(Constants.WARNING, "URL is not a known node. Cannot create branch from it");
			return;
		} else if (node_data.node_type === Constants.NODE_TYPE_NEW) {
			notifyUser(Constants.WARNING, "URL is a new node. Cannot create branch from it");
			return;
		}

		// Get the selected text from the context menu
		const textSelectionResponse = await sendMessage(tab.id, Constants.GET_SELECTED_TEXT);
		if (!textSelectionResponse || !textSelectionResponse.status) {
			handleTextSelectionError(textSelectionResponse.data);
			return;
		}

		// Selected text is valid; extract the selected text and its container ID
		const { selectedText, selectedTextContainerId } = textSelectionResponse.data;

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

	} catch (error) {
		console.error("Error in startNewBranchChat:", error);
		notifyUser(Constants.ERROR, "Unexpected error while starting new branch chat.");
	}
}

/* Handle text selection errors */
function handleTextSelectionError(errorCode) {
	switch (errorCode) {
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
}

/* Create a new branch node */
async function createBranchChat(node_data, data, tab_id) {
	try {
		// Create a new node object and associated objects
		const { node_space_id, node_id: parent_node_id, selected_text_data } = node_data;
		const { node_id: branch_node_id, node_title: branch_node_title } = data;

		const response = await createNewNodeBranch(
			node_space_id,
			parent_node_id,
			selected_text_data,
			branch_node_id,
			branch_node_title
		);

		if (!response) {
			notifyUser(Constants.ERROR, "Error creating new branch node");
			return false;
		}

		console.log("Branch Node Created");
		return true;
	} catch (error) {
		console.error("Error in createBranchChat:", error);
		notifyUser(Constants.ERROR, "Unexpected error while creating branch chat.");
		return false;
	}
}
/* Update the chat messages */
async function updateChatMessages(node_data, node_messages) {
	try {
		const { node_space_id, node_id, node_type } = node_data;

		if (node_type !== Constants.NODE_TYPE_EXISTING) {
			console.error(`Unknown node type: ${node_type}`);
			notifyUser(Constants.ERROR, "Unknown node type. Cannot update messages.");
			return false;
		}

		// Update the node messages
		const response = await updateNodeMessages(node_space_id, node_id, node_messages);
		if (!response) {
			notifyUser(Constants.ERROR, "Error updating node messages");
			return false;
		}

		return true;
	} catch (error) {
		console.error("Error in updateChatMessages:", error);
		notifyUser(Constants.ERROR, "Unexpected error while updating chat messages.");
		return false;
	}
}

/* Update the chat title */
async function updateChatTitle(data) {
	try {
		const { node_id, new_title } = data;

		const response = await updateNodeTitle(node_id, new_title);
		if (!response) {
			notifyUser(Constants.ERROR, "Error updating node title");
			return false;
		}

		return true;
	} catch (error) {
		console.error("Error in updateChatTitle:", error);
		notifyUser(Constants.ERROR, "Unexpected error while updating chat title.");
		return false;
	}
}

/* Delete the chat */
async function deleteChat(data) {
	try {
		const { node_id } = data;

		const response = await deleteNode(node_id);
		if (!response) {
			notifyUser(Constants.ERROR, "Error deleting node");
			return false;
		}

		return true;
	} catch (error) {
		console.error("Error in deleteChat:", error);
		notifyUser(Constants.ERROR, "Unexpected error while deleting chat.");
		return false;
	}
}

/* Get the node space keys */
async function getNodeSpaceKeys() {
	let active_node_space = null;

	try {
		// Get the node space keys
		const node_space_keys = await getNodeSpaces();

		// Try sending a message to the active tab to retrieve node information
		const response = await sendMessage(state.lastActiveChatTabId, Constants.GET_NODE_DATA);

		if (response?.status) {
			const { node_space_id } = response.data;
			console.log("Found active space:", node_space_id);
			active_node_space = node_space_id;
		} else {
			console.log("Couldn't retrieve info on the active tab.");
		}

		return { node_space_keys, active_node_space };
	} catch (error) {
		console.error("Error in getNodeSpaceKeys:", error);
		return { node_space_keys: [], active_node_space: null };
	}
}

/* Get the node space data */
async function getNodeSpace(space_id) {
	try {
		return await getNodeSpaceData(space_id);
	} catch (error) {
		console.error("Error retrieving node space data:", error);
		return null;
	}
}

/* Handle navigation to a node chat */
function navigateToNodeChatCallback(tab, message_index) {
	chrome.windows.update(tab.windowId, { focused: true });

	if (message_index === null) return;

	console.log("Sending message to content script to navigate to message index:", message_index);

	sendMessage(tab.id, Constants.SCROLL_TO_CHAT_MESSAGE, message_index)
		.then((response) => {
			if (!response?.status) {
				console.error("Error sending message to scroll to message index.");
			}
		})
		.catch((error) => {
			console.error("Error during scroll to message index:", error);
		});
}

/* Handle opening a node chat */
async function handleOpenNodeChat(node_id, message_index) {
	try {
		const tabs = await chrome.tabs.query({ url: `${Constants.CHATGPT_ORIGIN}${node_id}` });
		console.log("Tabs with the node id in the URL:", tabs);

		if (tabs.length > 0) {
			// Update the tab and handle navigation after the tab is updated (set it to active)
			chrome.tabs.update(tabs[0].id, { active: true }, (tab) => {
				navigateToNodeChatCallback(tab, message_index);
			});
		} else {
			// Open a new tab and handle navigation after the tab is created
			chrome.tabs.create({ url: `${Constants.CHATGPT_ORIGIN}${node_id}` }, (newTab) => {
				// Save the tab id and message index to navigate to after the tab is created
				state.navigatedChat = { tab: newTab, messageIndex: message_index };
			});
		}

		// Minimize the React window if it's open
		// if (state.reactWindowId) {
		// 	chrome.windows.update(state.reactWindowId, { state: "minimized" });
		// }

		return true;
	} catch (error) {
		console.error("Error in handleOpenNodeChat:", error);
		return false;
	}
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

	console.log("Sending message to Content Script:", message);

	try {
		const response = await chrome.tabs.sendMessage(tabId, message);
		console.log("Response from content script in sendMessage:", response.status);
		return response;
	} catch (error) {
		console.error("Error sending message in sendMessage:", error);
		return null;
	}
}

// Receive in format {action: ..., node_data: ..., data: ...}
// Respond in format {status: ..., data: ...}
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	let node_data = null; // Node data from the content script
	const response = {
		status: false,
		data: null,
	};

	// Check if the message is from the ChatGPT origin
	if (sender.origin === Constants.CHATGPT_ORIGIN) {
		node_data = message.node_data;
	}

	const data = message.data;

	console.log("Received message in Background Script:", message);

	const handleMessage = async () => {
		try {
			switch (message.action) {
				case Constants.UPDATE_NODE_MESSAGES:
					console.log("Received message to update node messages");
					response.status = await updateChatMessages(node_data, data);
					break;
				case Constants.UPDATE_NODE_TITLE:
					console.log("Received message to update node title");
					response.status = await updateChatTitle(data);
					break;
				case Constants.HANDLE_NEW_BRANCH_CREATION:
					console.log("Received message to handle new branch creation");
					const tab_id = sender.tab.id;
					response.status = await createBranchChat(node_data, data, tab_id);
					break;
				case Constants.UPDATE_NODE_TITLE:
					console.log("Received message to update node title");
					response.status = await updateChatTitle(data);
					break;
				case Constants.HANDLE_NODE_DELETION:
					console.log("Received message to delete node");
					response.status = await deleteChat(data);
					break;
				case Constants.REACT_APP_MOUNTED:
					console.log("Received message that React application mounted");
					const space_data = await getNodeSpaceKeys();
					if (space_data) {
						response.status = true;
						response.data = space_data;
					}
					break;
				case Constants.GET_NODE_SPACE_DATA:
					console.log("Received message from React application to get node space data");
					const node_space_data = await getNodeSpace(data.space_id);
					if (node_space_data) {
						response.status = true;
						response.data = node_space_data;
					}
					break;
				case Constants.HANDLE_OPEN_NODE_CHAT:
					console.log("Received message to open chat for node", data.node_id);
					response.status = await handleOpenNodeChat(data.node_id, data.message_index);
					break;
				case Constants.REACT_UPDATE_NODE_SPACE_TITLE:
					console.log("Received message to update node space title");
					const nodeId = data.node_space_id;
					const nodeTitle = data.new_title;
					response.status = await updateNodeSpaceTitle(nodeId, nodeTitle);
					if (response.status) {
						state.storageChange = true;
					}
					break;
				default:
					console.error("Unknown action:", message.action);
			}
		} catch (error) {
			console.error("Error handling message in chrome.runtime.onMessage:", error);
		}
		sendResponse(response);
	};

	handleMessage();

	return true; // Indicate that sendResponse will be called asynchronously
});

/***** Background Notifications ******/
async function notifyUser(action_type, invalid_action_message) {
	try {
		const alert_message = `${action_type}: ${invalid_action_message}`;
		const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
		if (tabs.length > 0) {
			const response = await sendMessage(tabs[0].id, Constants.ALERT, alert_message);
			if (!response?.status) {
				console.error("Error sending alert message");
			}
		}
	} catch (error) {
		console.error("Error in notifyUser:", error);
	}
}