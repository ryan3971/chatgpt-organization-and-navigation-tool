//import * as Constants from "./Constants/constants.js";

//let Constants = chrome.runtime.getURL("Constants/constants.js");

var Constants = null;

var tempStorage = {
	chat_type: null,
	node_space_id: null,
	node_id: null,
	node_title: null,
	selected_text_data: null,
};

/************** Mutation Observer Section **************/

// Define the target node (in this case, the entire document)
const targetNode = document.body;

// Define the configuration for the observer
const config = { childList: true, subtree: true };

// Define the state of the elements we are interested in logging the appearance of
let sendButtonFound = false;
let stopButtonFound = false;
let navElementFound = false;

// Function to check and handle the presence of elements of interest
const checkAndHandleElements = function (observer) {

	if (!Constants) return; // Wait for the constants to be loaded

	const sendButton = document.querySelector('[data-testid="send-button"]');
	const stopButton = document.querySelector('[data-testid="stop-button"]');
	const navElement = document.querySelector("nav[class]");

	if (sendButton && !sendButtonFound) {
		// Fires when the end button appears (not necessarily when a message is sent)
		console.log("Send button appeared in the DOM.");
		sendButtonFound = true;
	} else if (!sendButton && sendButtonFound) {
		console.log("Send button disappeared from the DOM.");
		sendButtonFound = false;
	}

	if (stopButton && !stopButtonFound) {
		console.log("Stop button appeared in the DOM.");
		stopButtonFound = true;
	} else if (!stopButton && stopButtonFound) {
		// If this occurred, a new chat message is available
		console.log("Stop button disappeared from the DOM.");
		stopButtonFound = false;

		// A message was sent, check if this is a new branch chat, and handle accordingly
		if (tempStorage.chat_type === Constants.CHAT_TYPE_NEW_BRANCH_CHAT) {
			const madeNewBranch = createNewBranchChat();
			if (!madeNewBranch) return;
		}
		if (tempStorage.chat_type === Constants.CHAT_TYPE_EXISTING_CHAT) {
			// Get the new chat message
			const chatMessages = getChatMessages();
			sendMessage(Constants.UPDATE_CHAT_MESSAGES, chatMessages);
		}
	}

	if (navElement && !navElementFound) {
		console.log("Nav element appeared in the DOM.");
		navElementFound = true;
	} else if (!navElement && navElementFound) {
		console.log("Nav element disappeared from the DOM.");
		navElementFound = false;
	}
};

// Callback function to execute when mutations are observed
const callback = function (mutationsList, observer) {
	for (const mutation of mutationsList) {
		if (mutation.type === "childList") {
			checkAndHandleElements(observer);
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

async function createNewBranchChat() {
	console.log("Message sent in new branch chat");

	const url = new URL(window.location.href);
	const chat_id = url.pathname;

	const data = {
		chat_id: chat_id,
		chat_title: document.title,
	};
	const response = await sendMessage(Constants.HANDLE_NEW_BRANCH_CREATION, data);
	if (!response.status) {
		console.log("Error from background script in making branch node. Abort");
		return false;
	}

	// Update the tempStorage to reflect the new chat type
	tempStorage.chat_type = Constants.CHAT_TYPE_EXISTING_CHAT;
	tempStorage.chat_id = window.location.href;
	tempStorage.chat_title = document.title;

	return true;
}

// Function to extract conversation text and save it
function getChatMessages() {
	let chatMessages = []; // Reset the array
	var turnChats = {};

	const userMessageKey = Constants.NODES_MESSAGES_USER_MESSAGE_KEY;
	const gptMessageKey = Constants.NODES_MESSAGES_GPT_MESSAGE_KEY;

	let turnNumber = 2; // Start with 2

	while (true) {
		const conversationTurn = document.querySelector(`[data-testid="conversation-turn-${turnNumber}"]`);

		if (!conversationTurn) {
			break; // Exit the loop if no more conversation turns are found
		}

		// Extract the text and trim it to the first 100 characters
		const text = conversationTurn.textContent.trim().substring(0, 100);

		// Store the data based on whether the turn number is even or odd
		if (turnNumber % 2 === 0) {
			turnChats[userMessageKey] = text;
		} else {
			turnChats[gptMessageKey] = text;
			chatMessages.push(turnChats);
			turnChats = {};
		}

		turnNumber++; // Move to the next conversation turn
	}

	console.log("Extracted Conversation Data:", chatMessages);

	return chatMessages;
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
            if (node.hasAttribute && node.hasAttribute('data-testid')) {
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
			const dataTestId = startElement.getAttribute("data-testid");
			console.log("Selected text is within a single element.");
			console.log("Selected text: ", selection.toString().trim());
			console.log("data-testid:", dataTestId);

			// get just the number from the data-testid by splitting it on conversation-turn-
			const selectedTextContainerId = dataTestId.split("conversation-turn-")[1];

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

/************** Message Send/Receive Section **************/

// Send in format {action: ..., chat_data: ..., data: ...}
// Receive in format {status: ..., data: ...}
async function sendMessage(message_key, message_data) {
	const message = {
		action: message_key,
		chat_data: tempStorage,
		data: message_data,
	};
	
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

	var response = {
		status: false,
		data: null,
	};

	try {
		switch (request.action) {
			case "content_script_constants":
				console.log("Received message to get content script constants");
				Constants = request.data;
				response.status = true;
				sendResponse(response);
				break;
			case Constants.GET_CHAT_TITLE:
				console.log("Received message to get chat title");
				response.status = true;
				response.data = document.title;
				sendResponse(response);
				break;
			case Constants.GET_CHAT_DATA:
				console.log("Received message to get chat data");
				response.status = true;
				response.data = tempStorage;
				sendResponse(response);
				break;
			case Constants.UPDATE_CONTENT_SCRIPT_TEMP_DATA:
				console.log("Received message to update content script temp data");
				data = request.data;
				tempStorage.chat_type = data.chat_type;
				tempStorage.node_space_id = data.node_space_id;
				tempStorage.node_id = data.node_id;
				tempStorage.selected_text_data = data.selected_text_data;
				response.status = true;
				sendResponse(response);
				break;
			case Constants.GET_SELECTED_TEXT:
				console.log("Received message to get selected text");
				getSelectedText().then((selected_text_response) => {
					const {flag, data} = selected_text_response;
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
			// } else if (request.action === "getPanelData") {
			// 	searchChatTitlesInSidePanel().then((response) => {;
			// 		sendResponse({ response: response });
			// 	});
		}
	} catch (error) {
		console.error("Error in message listener:", error);
		sendResponse({ response: false });
	}
	return true;
});



/************** End Message Passing Section **************/


// document.addEventListener("mouseup", handleMouseUp);

// function handleMouseUp() {
// 	const selection = window.getSelection();
// 	const highlightedText = selection.toString();
// 	const sourceElement = selection.anchorNode?.parentElement;

// 	console.log("Highlighted text:", highlightedText);
// 	console.log("Parent element:", sourceElement);

// 	if (highlightedText.length > 0 && sourceElement) {
// 		const containerElement = sourceElement.closest("[data-testid]");
// 		if (containerElement && containerElement.getAttribute("data-testid").includes("conversation-turn")) {
// 			console.log('Highlighted text is within an element with data-testid containing "conversation-turn"');
// 			chrome.runtime.sendMessage({
// 				action: "updateContextMenu",
// 				enabled: true,
// 			});
// 			return;
// 		}
// 	}
// 	chrome.runtime.sendMessage({
// 		action: "updateContextMenu",
// 		enabled: false,
// 	});
// }

// async function searchChatTitlesInSidePanel() {

// 	// check if any href elements exists that at least contain the /c/ path

// 	const ishrefs = document.querySelectorAll('a[href*="/c/"]');

// 	if (!ishrefs) {
// 		console.log("No hrefs found. Side Panel is likely not open.");
// 		return false;
// 	}

// 	const {nodes : nodesStor} = await chrome.storage.sync.get("nodes");

// 	// for each node id, query the document for an href that matches the format href="id"

// 	for (let i = 0; i < nodesStor.length; i++)	{
// 		const node = nodesStor[i];
// 		const id = node.id;
// 		const href = document.querySelector(`a[href="${id}"]`);
// 		if (href) {
// 			console.log("Found href for node:", href);
// 			const chatTitle = href.innerText;
// 			if (chatTitle) {
// 				console.log("Chat title:", chatTitle);
// 				nodesStor[i].data.label = chatTitle;
// 			}
// 		}
// 	}

// 	await chrome.storage.sync.set({nodes : nodesStor});
// 	return true
// }

