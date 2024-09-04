var Constants = null;

// Temp storage for the node data
var tempStorage = {
	node_type: null,
	node_space_id: null,
	node_id: null,
	node_title: null,
	selected_text_data: null,
};

/* ChatGPT HTML element selectors */
const CHATGPT_STOP_BUTTON_ELEMENT = '[data-testid="stop-button"]';
const CHATGPT_NAV_PANEL_ELEMENT = "nav[class]";
const CHATGPT_TITLE_INPUT_ELEMENT = 'input[type="text"]';
const CHATGPT_BUTTON_DANGER_ATTRIBUTE = "button.btn-danger";
const CHATGPT_BUTTON_DANGER_INNER_TEXT = "Delete";
const CHATGPT_HREF_ATTRIBUTE = 'a[href*="/c/"]';
const CHATGPT_DATA_TEST_ID_ATTRIBUTE = "data-testid";
const CHATGPT_DATA_MESSAGE_ID_ATTRIBUTE = '[data-message-id]';
const CHATGPT_HREF_ATTRIBUTE_START = 'a[href*="';
const CHATGPT_MESSAGE_CONTAINER_START = '[data-testid="conversation-turn-';
const HTML_GENERIC_CLOSING = '"]';
const HTML_LIST_TAG = "li";
const HTML_ANCHOR_TAG = "a";
const HTML_HREF_ATTRIBUTE = "href";

const CONTENT_SCRIPT_CONSTANTS = "content_script_constants";

var isCreatingNewBranch = false;


/***** Mutation Observer Section *****/

const targetNode = document.body; // Define the target node (in this case, the entire document)
const config = { childList: true, subtree: true }; // Define the configuration for the observer

// Define the state of the elements we are interested in logging the appearance of
let sendButtonFound = false; // Used to check when a message from ChatGPT has finished being received
let stopButtonFound = false; // Used to check when a response is being made by ChatGPT
let deleteDialogFound = false; // Used to detect when/if a node is being deleted
let inputFieldFound = false; // Used to detect when a node title is being edited
let navPanelNodeIds = []; // Used to store the node IDs in the navigation panel
let renamedNodeData = {}; // Used to store the data of a node being renamed

/* Function to ensure Constants are loaded */
function ensureConstants() {
	if (!Constants) {
		throw new Error("Constants have not been loaded yet.");
	}
}

/* Function to check and handle the presence of elements of interest */
async function checkAndHandleElements(observer, mutation) {
	try {
		ensureConstants();

		const stopButton = document.querySelector(CHATGPT_STOP_BUTTON_ELEMENT);
		const navPanel = document.querySelector(CHATGPT_NAV_PANEL_ELEMENT);

		if (stopButton && !stopButtonFound) {
			console.log("Stop button appeared in the DOM.");
			stopButtonFound = true;
		} else if (!stopButton && stopButtonFound) {
			console.log("Stop button disappeared from the DOM.");
			stopButtonFound = false;

			if (tempStorage.node_type === Constants.NODE_TYPE_NEW_BRANCH) {
				isCreatingNewBranch = true;
				const madeNewBranch = await createNewBranchNode(navPanel);
				isCreatingNewBranch = false;
				if (!madeNewBranch) return;
			}
			if (tempStorage.node_type === Constants.NODE_TYPE_EXISTING) {
				const nodeMessages = getNodeMessages();
				const response = await sendMessage(Constants.UPDATE_NODE_MESSAGES, nodeMessages);
				if (!response?.status) {
					console.error("Error updating node messages");
				}
			}
		}

		if (navPanel) {
			handleNavPanel(navPanel);
		}
	} catch (error) {
		console.error("Error in checkAndHandleElements:", error);
	}
}

/* Refactored handling of the navigation panel */
function handleNavPanel(navPanel) {
	try {
		const inputField = document.querySelector(CHATGPT_TITLE_INPUT_ELEMENT);
		const dangerButton = document.querySelector(CHATGPT_BUTTON_DANGER_ATTRIBUTE);

		handleDeleteDialog(navPanel, dangerButton);
		handleInputField(navPanel, inputField);
	} catch (error) {
		console.error("Error in handleNavPanel:", error);
	}
}

/* Handle delete dialog interactions */
function handleDeleteDialog(navPanel, dangerButton) {
	try {
		if (dangerButton && dangerButton.innerText.trim() === CHATGPT_BUTTON_DANGER_INNER_TEXT && !deleteDialogFound) {
			console.log("Delete dialog appeared in the DOM");
			deleteDialogFound = true;
			navPanelNodeIds = getIDfromHref(navPanel.querySelectorAll(CHATGPT_HREF_ATTRIBUTE));
		} else if ((!dangerButton || dangerButton.innerText.trim() !== CHATGPT_BUTTON_DANGER_INNER_TEXT) && deleteDialogFound) {
			console.log("Delete dialog disappeared from the DOM");
			deleteDialogFound = false;

			setTimeout(() => {
				const updatedNavPanelIds = getIDfromHref(navPanel.querySelectorAll(CHATGPT_HREF_ATTRIBUTE));
				const deletedNodeId = navPanelNodeIds.find((id) => !updatedNavPanelIds.includes(id));

				if (deletedNodeId) {
					console.log("Node deleted:", deletedNodeId);
					sendMessage(Constants.HANDLE_NODE_DELETION, { node_id: deletedNodeId });
				} else {
					console.log("No node was deleted");
				}
				navPanelNodeIds = [];
			}, 3000);
		}
	} catch (error) {
		console.error("Error in handleDeleteDialog:", error);
	}
}

/* Handle node title input field interactions */
function handleInputField(navPanel, inputField) {
	try {
		if (inputField && !inputFieldFound) {
			console.log("Input field appeared in the DOM");
			inputFieldFound = true;

			const parentElement = inputField.closest(HTML_LIST_TAG);
			const nodeHref = parentElement.querySelector(HTML_ANCHOR_TAG).getAttribute(HTML_HREF_ATTRIBUTE);
			const nodeTitle = parentElement.innerText;
			renamedNodeData = { node_href: nodeHref, node_title: nodeTitle };
		} else if (!inputField && inputFieldFound) {
			console.log("Input field is not in the DOM anymore");
			inputFieldFound = false;

			setTimeout(() => {
				const nodeHref = CHATGPT_HREF_ATTRIBUTE_START + renamedNodeData.node_href + HTML_GENERIC_CLOSING;
				const navPanelElement = navPanel.querySelector(nodeHref);
				const nodeTitle = navPanelElement.innerText;

				if (nodeTitle !== renamedNodeData.node_title) {
					console.log("Node title changed:", nodeTitle);
					const nodeId = getIDfromHref([navPanelElement])[0];
					tempStorage.node_title = nodeTitle;
					sendMessage(Constants.UPDATE_NODE_TITLE, { node_id: nodeId, new_title: nodeTitle });
				} else {
					console.log("No node title change");
				}
				renamedNodeData = {};
			}, 3000);
		}
	} catch (error) {
		console.error("Error in handleInputField:", error);
	}
}

/* Extract node IDs from href attributes */
function getIDfromHref(elements) {
	const navPanelIds = [];

	elements.forEach((element) => {
		try {
			const href = element.href;
			const url = new URL(href);
			const nodeId = url.pathname;
			navPanelIds.push(nodeId);
		} catch (error) {
			console.error("Error parsing href:", element.href, error);
		}
	});

	return navPanelIds;
}


// Callback function to execute when mutations are observed
const callback = function (mutationsList, observer) {
	for (const mutation of mutationsList) {
		// only interested in childList mutations (i.e., new nodes added or removed)
		if (mutation.type === "childList") {
			checkAndHandleElements(observer, mutation);
		}
	}
};

// Initial check in case the send button is already in the DOM
checkAndHandleElements({ disconnect: () => {} });

// Create an observer instance linked to the callback function
const observer = new MutationObserver(callback);

// Start observing the target node for configured mutations
observer.observe(targetNode, config);

/************** End Mutation Observer Section **************/

/***** New Title MutationObserver Section *****/

/* Function to observe title changes */
function observeTitleChange() {
	const targetNode = document.querySelector("title");

	if (targetNode) {
		const observer = new MutationObserver((mutationsList) => {
			for (const mutation of mutationsList) {
				if (mutation.type === "childList") {
					console.log("Document title changed:", document.title);

					ensureConstants();

					// Send the new title to the background script if this is a known node
					if (
						document.title !== "ChatGPT" &&
						document.title !== tempStorage.node_title &&
						tempStorage.node_type === Constants.NODE_TYPE_EXISTING
					) {
						tempStorage.node_title = document.title;
						sendMessage(Constants.UPDATE_NODE_TITLE, { node_id: tempStorage.node_id, new_title: document.title });
					}
				}
			}
		});

		// Start observing the title node for changes
		observer.observe(targetNode, { childList: true });
	}
}

// Start observing title changes
observeTitleChange();

/***** End Title MutationObserver Section *****/

/************** General Functions **************/

/* Function to create a new branch node */
async function createNewBranchNode(navPanel) {
	console.log("Creating new branch node");

	try {
		const url = new URL(window.location.href);
		const nodeId = url.pathname;
		const nodeHref = CHATGPT_HREF_ATTRIBUTE_START + nodeId + HTML_GENERIC_CLOSING;

		// Wait for the node title to be updated in the nav panel
		await new Promise((resolve) => setTimeout(resolve, 2000));
		
		let nodeTitle = "ChatGPT Chat";
		try {
			nodeTitle = navPanel.querySelector(nodeHref)?.innerText || nodeTitle;
		} catch (error) {
			console.warn("Could not get node title from nav panel immediately, might be updated later", error);
		}

		const data = { node_id: nodeId, node_title: nodeTitle };
		const response = await sendMessage(Constants.HANDLE_NEW_BRANCH_CREATION, data);

		if (!response?.status) {
			console.error("Failed to create new branch node");
			return false;
		}

		console.log("Branch node created successfully");
		tempStorage.node_type = Constants.NODE_TYPE_EXISTING;
		tempStorage.node_id = nodeId;
		tempStorage.node_title = nodeTitle;

		return true;
	} catch (error) {
		console.error("Error in createNewBranchNode:", error);
		return false;
	}
}

/* Function to extract conversation data and save it */
function getNodeMessages() {
	let nodeMessages = [];
	let turnNumber = 2;

	try {
		while (true) {
			const containerId = CHATGPT_MESSAGE_CONTAINER_START + String(turnNumber) + HTML_GENERIC_CLOSING;
			const conversationTurn = document.querySelector(containerId);

			if (!conversationTurn) break;

			const dataMessageId = conversationTurn.querySelector(CHATGPT_DATA_MESSAGE_ID_ATTRIBUTE);
			const text = dataMessageId?.textContent.trim().substring(0, 100) || "";

			const index = Math.floor(turnNumber / 2) - 1;
			if (!nodeMessages[index]) {
				nodeMessages[index] = [];
			}
			nodeMessages[index].push(text);

			turnNumber++;
		}
		console.log("Extracted Conversation Data:", nodeMessages);
	} catch (error) {
		console.error("Error in getNodeMessages:", error);
	}

	return nodeMessages;
}

/* Function to get the selected text */
async function getSelectedText() {
	const selection = window.getSelection();
	const response = { flag: null, data: null };

	if (!selection || selection.toString().trim() === "") {
		response.flag = Constants.NO_TEXT_SELECTED;
	} else if (selection.toString().trim().length > Constants.MAX_TEXT_SELECTION_LENGTH) {
		response.flag = Constants.MAX_TEXT_SELECTION_LENGTH_EXCEEDED;
	} else {
		const range = selection.getRangeAt(0);
		const startElement = findAncestorWithTestId(range.startContainer.parentElement);
		const endElement = findAncestorWithTestId(range.endContainer.parentElement);

		if (startElement && endElement) {
			if (startElement === endElement) {
				const dataTestId = startElement.getAttribute(CHATGPT_DATA_TEST_ID_ATTRIBUTE);
				const selectedTextContainerId = parseInt(dataTestId.match(/(\d+)/)[0], 10) - 2;

				response.flag = Constants.VALID_TEXT_SELECTION;
				response.data = { selectedText: selection.toString().trim(), selectedTextContainerId };
			} else {
				response.flag = Constants.TEXT_SPANS_MULTIPLE_MESSAGES;
			}
		} else {
			response.flag = Constants.INVALID_TEXT_SELECTED;
		}
	}
	return response;
}

/* Helper function to find the closest ancestor with the data-testid attribute */
function findAncestorWithTestId(node) {
	while (node && node !== document.body) {
		if (node.hasAttribute && node.hasAttribute(CHATGPT_DATA_TEST_ID_ATTRIBUTE)) {
			return node;
		}
		node = node.parentElement;
	}
	return null;
}
/* Function to focus on chat message based on data-testid attribute */
async function focusChatMessageByTestId(message_index) {
	console.log("Focusing on chat message:", message_index);
	const containerId = CHATGPT_MESSAGE_CONTAINER_START + String(message_index + 2) + HTML_GENERIC_CLOSING;

	const focusElement = () => {
		const element = document.querySelector(containerId);
		if (element) {
			element.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
			element.focus();
			console.log("Element found and focused:", containerId);
			return true;
		}
		console.error("Element not found:", containerId);
		return false;
	};

	if (focusElement()) return true;

	console.log("Element not found, retrying in 3 seconds...");
	await new Promise(resolve => setTimeout(resolve, 3000));

	return focusElement();
}



/************** Message Send/Receive Section **************/

// Send in format {action: ..., node_data: ..., data: ...}
// Receive in format {status: ..., data: ...}
async function sendMessage(message_key, message_data) {
	const message = { action: message_key, node_data: tempStorage, data: message_data };

	console.log("Sending message to Background script:", message);

	try {
		console.log("Sending message:", message_key);
		const response = await chrome.runtime.sendMessage(message);
		return response;
	} catch (error) {
		console.error("Error in sendMessage:", error);
		return null;
	}
}

// Receive in format {action: ..., data: ...}
// Respond in format {status: ..., data: ...}
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	try {
		const { action, data } = request;

		console.log("Received message in Content Script:", request);

		const response = { status: false, data: null };
		switch (action) {
			case CONTENT_SCRIPT_CONSTANTS:
				Constants = data;
				response.status = true;
				sendResponse(response);
				break;
			case Constants.IS_NEW_BRANCH:
				response.status = true;
				response.data = isCreatingNewBranch;
				sendResponse(response);
				break;
			case Constants.GET_NODE_TITLE:
				response.status = true;
				response.data = tempStorage.node_title || document.title || "ChatGPT Chat";
				sendResponse(response);
				break;
			case Constants.GET_NODE_DATA:
				response.status = true;
				response.data = tempStorage;
				sendResponse(response);
				break;
			case Constants.SYNC_WITH_CONTENT_SCRIPT:
				tempStorage.node_type = data.node_type;
				tempStorage.node_space_id = data.node_space_id;
				tempStorage.node_title = data.node_title;
				tempStorage.node_id = data.node_id;
				tempStorage.selected_text_data = data.selected_text_data;
				sendResponse({ status: true });
				break;
			case Constants.GET_SELECTED_TEXT:
				getSelectedText().then((selected_text_response) => {
					if (selected_text_response.flag === Constants.VALID_TEXT_SELECTION) {
						response.status = true;
						response.data = selected_text_response.data;
					} else {
						response.data = selected_text_response.flag;
					}
					sendResponse(response);
				});
				break;
			case Constants.UPDATE_NODE_MESSAGES:
				const nodeMessages = getNodeMessages();
				sendMessage(Constants.UPDATE_NODE_MESSAGES, nodeMessages).then(sendResponse);
				break;
			case Constants.SCROLL_TO_CHAT_MESSAGE:
				focusChatMessageByTestId(request.data).then((status) => {
					response.status = status;
					sendResponse(response);
				});
				break;
			case Constants.ALERT:
				alert(request.data);
				response.status = true;
				sendResponse(response);
				break;
			default:
				console.error("Unknown action:", action);
				sendResponse(response);
		}
	} catch (error) {
		console.error("Error in message listener:", error);
		sendResponse({ response: false });
	}
	return true;
});