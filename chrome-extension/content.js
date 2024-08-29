var Constants = null;

var tempStorage = {
	node_type: null,
	node_space_id: null,
	node_id: null,
	node_title: null,
	selected_text_data: null,
};

// ChatGPT html references elements
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

/************** Mutation Observer Section **************/

// Define the target node (in this case, the entire document)
const targetNode = document.body;

// Define the configuration for the observer
const config = { childList: true, subtree: true };

// Define the state of the elements we are interested in logging the appearance of
let sendButtonFound = false;
let stopButtonFound = false;
let navElementFound = false;

let deleteDialogFound = false;	//Used to detect when a node is being deleted
let inputFieldFound = false;	//Used to detect when a node title is being edited

let navPanelNodeIds = [];
let renamedNodeData = {};

var creatingNewBranchNode = false;

// Function to check and handle the presence of elements of interest
async function checkAndHandleElements(observer, mutation) {
	if (!Constants) return; // Wait for the constants to be loaded

	// Interested in the send button and the navigational panel
	const stopButton = document.querySelector(CHATGPT_STOP_BUTTON_ELEMENT);
	const navPanel = document.querySelector(CHATGPT_NAV_PANEL_ELEMENT);

	// Use this to "detect" new messages in the node
	if (stopButton && !stopButtonFound) {
		console.log("Stop button appeared in the DOM.");
		stopButtonFound = true;

	} else if (!stopButton && stopButtonFound) {
		// If this occurred, a new node message is available
		console.log("Stop button disappeared from the DOM.");
		stopButtonFound = false;

		// A message was sent, check if this is a new branch node, and handle accordingly
		if (tempStorage.node_type === Constants.NODE_TYPE_NEW_BRANCH) {
			// get the node element from the navigation panel
			creatingNewBranchNode = true;
			const madeNewBranch = await createNewBranchNode(navPanel);
			if (!madeNewBranch) return;
			creatingNewBranchNode = false;
		}
		if (tempStorage.node_type === Constants.NODE_TYPE_EXISTING) {
			// Get the new node message
			const nodeMessages = getNodeMessages();
			const response = await sendMessage(Constants.UPDATE_NODE_MESSAGES, nodeMessages);
			if (!response.status) {
				console.log("Error from background script in updating node messages");
				return;
			}
		}
	}

	if (navPanel)	{
		//const deleteDialog = document.querySelector('div[role="dialog"]');
		const inputField = document.querySelector(CHATGPT_TITLE_INPUT_ELEMENT);
		const dangerButton = document.querySelector(CHATGPT_BUTTON_DANGER_ATTRIBUTE);

		if (dangerButton && dangerButton.innerText.trim() === CHATGPT_BUTTON_DANGER_INNER_TEXT && !deleteDialogFound) {
			console.log("Delete dialog appeared in the DOM");
			deleteDialogFound = true;
			const navPanelElements = navPanel.querySelectorAll(CHATGPT_HREF_ATTRIBUTE);
			navPanelNodeIds = getIDfromHref(navPanelElements); // store the node ids from the nav panel into an array
		
		} else if ((!dangerButton && deleteDialogFound) || (dangerButton && dangerButton.innerText.trim() !== CHATGPT_BUTTON_DANGER_INNER_TEXT && deleteDialogFound)) {
			console.log("Delete dialog disappeared from the DOM...and it was there before");
			deleteDialogFound = false;

			// set a timeout to give time for the node to be deleted from the nav panel
			setTimeout(() => {
				// query nav panel for all node elements, het the ids for them
				const navPanelElements = navPanel.querySelectorAll(CHATGPT_HREF_ATTRIBUTE);
				const updatedNavPanelIds = getIDfromHref(navPanelElements);

				// compare the two arrays to find the deleted node id
				const deletedNodeId = navPanelNodeIds.find((id) => !updatedNavPanelIds.includes(id));

				if (deletedNodeId) {
					console.log("Node deleted:", deletedNodeId);
					sendMessage(Constants.HANDLE_NODE_DELETION, { node_id: deletedNodeId });
				} else {
					console.log("No node was deleted");
				}
				navPanelNodeIds = []; // reset the array
			}, 3000);
		}

		if (inputField && !inputFieldFound) {
			console.log("Input field appeared in the DOM");
			inputFieldFound = true;

			const parentElement = inputField.closest(HTML_LIST_TAG);
			const nodeHref = parentElement.querySelector(HTML_ANCHOR_TAG).getAttribute(HTML_HREF_ATTRIBUTE);
			const nodeTitle = parentElement.innerText;
			renamedNodeData = { node_href: nodeHref, node_title: nodeTitle };
		} else if (!inputField && inputFieldFound) {
			console.log("Input field is not in the DOM...and it was there before");
			inputFieldFound = false;

			// set a timeout to give time for the node title to be updated in the nav panel
			setTimeout(() => {
				const nodeHref = CHATGPT_HREF_ATTRIBUTE_START + renamedNodeData.node_href + HTML_GENERIC_CLOSING;
				const navPanelElement = navPanel.querySelector(nodeHref);
				const nodeTitle = navPanelElement.innerText;

				if (nodeTitle !== renamedNodeData.node_title) {
					console.log("Node title changed:", nodeTitle);
					const nodeId = getIDfromHref([navPanelElement])[0];
					const data = { node_id: nodeId, new_title: nodeTitle };
					// send the node id and new node title to the background script
					sendMessage(Constants.HANDLE_NODE_RENAMING, data);
				} else {
					console.log("No node title change");
				}
				renamedNodeData = {}; // reset the object
			}, 3000);
		}
	}
};

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

/************** General Functions **************/

function getIDfromHref(elements) {

	const navPanelIds = [];
	elements.forEach((element) => {
		const href = element.href;
		const url = new URL(href);
		const nodeId = url.pathname;
		navPanelIds.push(nodeId);
	});

	return navPanelIds;
}

async function createNewBranchNode(navPanel) {
	console.log("Message sent in new branch node");

	const url = new URL(window.location.href);
	const nodeId = url.pathname;

	const nodeHref = CHATGPT_HREF_ATTRIBUTE_START + nodeId + HTML_GENERIC_CLOSING;

	// try to get the title now, if it fails, it will be tried again later (nav panel may not have updated yet)
	let nodeTitle = "ChatGPT Chat";
	try {
		nodeTitle = navPanel.querySelector(nodeHref).innerText; // potential race condition between this and the the nav field being created
	} catch (error) {
		console.error("Error getting node title from nav panel", error);
	}

	const data = {
		node_id: nodeId,
		node_title: nodeTitle,
	};
	const response = await sendMessage(Constants.HANDLE_NEW_BRANCH_CREATION, data);
	if (!response.status) {
		console.log("Error from background script in making branch node. Abort");
		return false;
	}

	// Update the tempStorage to reflect the new node type
	tempStorage.node_type = Constants.NODE_TYPE_EXISTING;
	tempStorage.node_id = nodeId;
	tempStorage.node_title = nodeTitle;
	// Don't need to update the node_space_id

	return true;
}

// function getNodeTitle(node_id)	{

// 	if (tempStorage.node_title) {
// 		return tempStorage.node_title;
// 	}
// 	const navPanel = document.querySelector(CHATGPT_NAV_PANEL_ELEMENT);
// 	// const url = new URL(window.location.href);
// 	// const nodeId = url.pathname;
// 	const nodeHref = CHATGPT_HREF_ATTRIBUTE_START + node_id + HTML_GENERIC_CLOSING;

// 	let nodeTitle = null;
// 	try	{
// 		nodeTitle = navPanel.querySelector(nodeHref).innerText; // potential race condition between this and the the nav field being created
// 	} catch (error) {
// 		console.error("Error getting node title from nav panel", error);
// 	}
	
// 	return nodeTitle;
// }

// Function to extract conversation text and save it
function getNodeMessages() {
	let nodeMessages = []; // Reset the array
	let turnNumber = 2; // Start with 2

	while (true) {
		const containerId = CHATGPT_MESSAGE_CONTAINER_START + String(turnNumber) + HTML_GENERIC_CLOSING;
		const conversationTurn = document.querySelector(containerId);

		if (!conversationTurn) {
			break; // Exit the loop if no more conversation turns are found
		}
		
		// locate the element within the conversation turn that has the data-message-id attribute (using this to skip down to the closet identifiable element before the inner text)
		const dataMessageId = conversationTurn.querySelector(CHATGPT_DATA_MESSAGE_ID_ATTRIBUTE);

		// Extract the text and trim it to the first 100 characters
		const text = dataMessageId.textContent.trim().substring(0, 100);

		let index = Math.floor(turnNumber / 2) - 1;
		if (!nodeMessages[index]) {
			nodeMessages[index] = [];
		}
		nodeMessages[index].push(text);

		turnNumber++; // Move to the next conversation turn
	}

	console.log("Extracted Conversation Data:", nodeMessages);

	return nodeMessages;
};

async function getSelectedText() {
	const selection = window.getSelection();

	var response = {
		flag: null,
		data: null,
	}

	if (!selection || selection.toString().trim() === "")	{
		console.log("No text selected");
		response.flag = Constants.NO_TEXT_SELECTED;
		return response;
	}
	
	if (selection.toString().trim().length > Constants.MAX_TEXT_SELECTION_LENGTH) {
		console.log("Selected text exceeds maximum length");
		response.flag = Constants.MAX_TEXT_SELECTION_LENGTH_EXCEEDED;
		return response;
	}

	const range = selection.getRangeAt(0);  // Get the range of the selected text
    const startContainer = range.startContainer;  // The start node of the selection
    const endContainer = range.endContainer;      // The end node of the selection

    // Function to find the closest ancestor with the `data-testid` attribute
    const findAncestorWithTestId = (node) => {
        while (node && node !== document.body) {
            if (node.hasAttribute && node.hasAttribute(CHATGPT_DATA_TEST_ID_ATTRIBUTE)) {
				return node;
			}
            node = node.parentElement;
        }
        return null;
    };

    const startElement = findAncestorWithTestId(startContainer.parentElement);
    const endElement = findAncestorWithTestId(endContainer.parentElement);

    if (startElement && endElement) {
         if (startElement === endElement) {
			const dataTestId = startElement.getAttribute(CHATGPT_DATA_TEST_ID_ATTRIBUTE);
			console.log("Selected text is within a single element.");
			console.log("Selected text: ", selection.toString().trim());
			console.log("data-testid:", dataTestId);

			// Extract the number from the conversation-turn attribute
			var selectedTextContainerId = dataTestId.match(/(\d+)/)[0]
			console.log("Selected text container id:", selectedTextContainerId);
			selectedTextContainerId = selectedTextContainerId - 2; // subtract 2 to normalize it

			// return the selected text and the data-testid value
			response.flag = Constants.VALID_TEXT_SELECTION;
			response.data = {
				selectedText: selection.toString().trim(),
				selectedTextContainerId: selectedTextContainerId,
			};
		} else {
			console.log("Selected text spans multiple elements.");
			console.log("Start element:", startElement);
			console.log("End element:", endElement);
			response.flag = Constants.TEXT_SPANS_MULTIPLE_MESSAGES;
		}
    } else {
        console.log('Selection is not within the expected elements.');
		response.flag = Constants.INVALID_TEXT_SELECTED;
    }
	return response;
}

// Function to focus on an element based on data-testid attribute
function focusChatMessageByTestId(message_index) {
	// remember to convert the message_id back to the conversation-turn number
	const containerId = CHATGPT_MESSAGE_CONTAINER_START + String(message_index + 2) + HTML_GENERIC_CLOSING;
	const element = document.querySelector(containerId);
	
	console.log("Element:", element);
	if (element) {
		element.scrollIntoView({
			behavior: 'smooth', // Enables the scrolling animation
			block: 'start',    // Aligns the element to the center of the view
			inline: 'nearest'   // Keeps horizontal alignment as close as possible
		});
		element.focus();
	} else {
		console.error("Element not found:", selector);
	}
}

/************** Message Send/Receive Section **************/

// Send in format {action: ..., node_data: ..., data: ...}
// Receive in format {status: ..., data: ...}
async function sendMessage(message_key, message_data) {
	const message = {
		action: message_key,
		node_data: tempStorage,
		data: message_data,
	};

	console.log("Current values of tempStorage:", tempStorage);
	
	try {
		console.log("Sending message in sendMessage:", message_key);
		const response = await chrome.runtime.sendMessage(message);
		console.log("Response from background script in sendMessage: ", response.status);
		return response;
	} catch (error) {
		console.error("Error sending message in sendMessage:", error);
		return null;
	}
}

// Receive in format {action: ..., data: ...}
// Respond in format {status: ..., data: ...}
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	console.log("Received message in content script");
	var data;
	var response = {
		status: false,
		data: null,
	};

	try {
		switch (request.action) {
			case CONTENT_SCRIPT_CONSTANTS:
				console.log("Received message to get content script constants");
				Constants = request.data;
				response.status = true;
				sendResponse(response);
				break;
			case Constants.GET_NODE_TITLE:
				console.log("Received message to get node title");
				const nodeTitle = tempStorage.node_title  || document.title || "ChatGPT Chat";
				response.status = true;
				response.data = nodeTitle;
				sendResponse(response);
				break;
			case Constants.GET_NODE_DATA:
				console.log("Received message to get node data");
				response.status = true;
				response.data = tempStorage;
				sendResponse(response);
				break;
			case Constants.SYNC_WITH_CONTENT_SCRIPT:
				console.log("Received message to update content script temp data");
				data = request.data;
				tempStorage.node_type = data.node_type;
				tempStorage.node_space_id = data.node_space_id;
				tempStorage.node_title = data.node_title;
				tempStorage.node_id = data.node_id;
				tempStorage.selected_text_data = data.selected_text_data;

				// sync with the chat node title
				if (data.node_type === Constants.NODE_TYPE_EXISTING) {
					if (document.title !== data.node_title) {
						response.data = { node_id: data.node_id, node_title: document.title };
					}
				}
				response.status = true;
				sendResponse(response);
				break;
			case Constants.IS_BRANCH_BEING_CREATED:
				console.log("Received message to check if branch is being created");
				response.data = creatingNewBranchNode;
				response.status = true;
				sendResponse(response);
				break;
			case Constants.GET_SELECTED_TEXT:
				console.log("Received message to get selected text");
				getSelectedText().then((selected_text_response) => {
					const { flag, data } = selected_text_response;
					if (flag === Constants.VALID_TEXT_SELECTION) {
						console.log("Selected text is valid. Sending back");
						response.status = true;
						response.data = data;
					} else {
						console.log("Invalid text selection:", flag);
						response.status = false;
						response.data = flag;
					}
					sendResponse(response);
				});
				break;
			case Constants.UPDATE_NODE_MESSAGES:
				const nodeMessages = getNodeMessages();
				sendMessage(Constants.UPDATE_NODE_MESSAGES, nodeMessages).then((response) => {
					sendResponse(response);
				});
				break;
			case Constants.SCROLL_TO_CHAT_MESSAGE:
				console.log("Received message to scroll to chat message");
				// Wait for a second before scrolling to the chat message to let chatGPT scrolling animation to end
				//setTimeout(() => {
				response.status = focusChatMessageByTestId(request.data);
				sendResponse(response);
				//}, 2000);
				break;
			case Constants.ALERT:
				console.log("Received message to alert");
				alert(request.data);
				response.status = true;
				sendResponse(response);
				break;
			default:
				console.error("Unknown action:", request.action);
				sendResponse(response);
				break;
		}
	} catch (error) {
		console.error("Error in message listener:", error);
		sendResponse({ response: false });
	}
	return true;
});