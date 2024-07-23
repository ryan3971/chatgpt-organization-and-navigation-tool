import { sendMessageToTab, setToStorage, getFromStorage } from "./chromeStorage.js";

/* CONSTANT DEFINITIONS */
const TEST_NEW_NODE = [
	{
		node_parent_id: "",
		node_branch_id: "test_is",
		node_branch_title: "text",
		edge_selected_text: "sample_title",
	},
];

const TEST_NODES = [
	{
		node_id: "1",
		node_type: "default",
		node_position: { x: 250, y: 5 },
		node_data: {
			node_data_title: "Node 1",
		},
	},
];

const CHATGPT_HOSTNAME = "chatgpt.com";


// Variable used for state management
let state = {
	hasNewNode: false,
};

chrome.contextMenus.onClicked.addListener(handleContextMenuClick);

async function handleContextMenuClick(info, tab) {
	try	{
		console.log("Context menu item clicked:", info, tab);
		if (info.menuItemId === "saveHighlightedText") {
			const selectedText = info.selectionText;
			const url = new URL(info.pageUrl);

			//const hostname = url.hostname; // e.g., https://chatgpt.com
			const chat_id = url.pathname; // e.g., /c/f226cd80-a0bd-44f5-9a74-68baa556b80c

			let response = await sendMessageToTab(tab.id, { action: "extractTitle" });
			const titleText = response.title;

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
			await setToStorage({ new_node: TEST_NEW_NODE });
			await setToStorage({ nodes: TEST_NODES });

			// Retrieve the newNodes from storage
			let new_node_stor = await getFromStorage("new_node");
			new_node_stor = new_node_stor["new_node"];
			console.log("Data retrieved from storage:", new_node_stor);

			const updated_new_node_stor = new_node_stor ? [...new_node_stor, new_node] : [new_node];

			// Save the newNode to storage
			response = await setToStorage({ new_node: updated_new_node_stor });
			console.log("Data saved to storage:", response);

			// Set the state to indicate a new node has been created
			state.hasNewNode = true;

			// Open a new ChatGPT chat in the current tab
			const newUrl = "https://chatgpt.com/"; //chatgpt_hostname;

			//Query the active tab
			chrome.tabs.update(tab.id, { url: newUrl });
			console.log("Opened new ChatGPT chat in the current tab", newUrl);
		}
	} catch (error)	{
		console.error("Error in handleContextMenuClick:", error);
	}
}

chrome.tabs.onUpdated.addListener(handleTabUpdate);

async function handleTabUpdate(tabId, changeInfo, tab) {	
	try	{
		if (changeInfo.url && state.hasNewNode) {
			const url = new URL(changeInfo.url);

			const hostname = url.hostname; // e.g., https://chatgpt.com
			const chat_id = url.pathname; // e.g., /c/f226cd80-a0bd-44f5-9a74-68baa556b80c

			// check if hostname is chatgpt and chat_id is empty
			if (hostname === CHATGPT_HOSTNAME && chat_id === "/") {
				console.log("URL is a new ChatGPT page:", url);
				return;
			}
			// Either we have new chat that is a branch or we have navigated to a new page
			state.hasNewNode = false;

			const stor = await getFromStorage(["new_node", "nodes"]);
			let new_node_stor = stor["new_node"];

			let response = await sendMessageToTab(tab.id, { action: "extractTitle" });
			const titleText = response.title;

			// Check the following:
			// 1) if the URL is a ChatGPT conversation page
			// 2) the url has an id (meaning the chat page has been used)
			// 3) The chat title is "ChatGPT"
			if (hostname === CHATGPT_HOSTNAME && chat_id.startsWith("/c/") && titleText === "ChatGPT") {
				// We have a new chat that is a branch.
				console.log("URL is a ChatGPT conversation page:", url);

				// search the new_node_stor for an element with an empty branch_id and return the element index
				const index = new_node_stor.findIndex((node) => !node.node_branch_id);

				if (index != -1) {
					new_node_stor[index].branch_id = chat_id;
					console.log("Updated newNode:", new_node_stor[index].branch_id);

					let response = await setToStorage({ new_node: new_node_stor });
					console.log("Node branch ID updated to storage:", response);
				} else {
					// No newNode with an empty branch_id found
					console.warn("No newNode with an empty branch_id found. This should not happen...");
				}
			} else {
				// We have navigated to a new page or chat; remove the newNode element with an empty branch_id from storage
				const updated_new_node_stor = new_node_stor.filter((node) => node.node_branch_id); // Remove the newNode with an empty branch_id (check if truthy)

				let response = await setToStorage({ new_node: updated_new_node_stor });
				console.log("New Node branch removed from storage", response);
			}
		}
	} catch (error)	{
		console.error("Error in handleTabUpdate:", error);
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

chrome.contextMenus.create({
	id: "saveHighlightedText",
	title: "Save Highlighted Text",
	contexts: ["selection"], // makes it so the button only appears when text is selected
	enabled: false,
});

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
	try	{
		if (message.action === "updateContextMenu") {
			chrome.contextMenus.update("saveHighlightedText", {
				enabled: message.enabled,
			});
		} else if (message.action === "getFromStorage") {
			const result = await chrome.storage.sync.get(message.key);
			console.log("Data retrieved from storage:", result[message.key]);
			sendResponse({ data: result[message.key] });
		} else if (message.action === "setToStorage") {
			const data = { [message.key]: message.value };
			console.log("Data saved to storage:", data);
			await chrome.storage.sync.set(data);
			sendResponse({ success: true });
		} else {
			console.error("Unknown storage action:", message.action);
		}
	} catch (error)	{
		console.error("Error in chrome.storage:", error);
		sendResponse({ success: false });
	}

	return true; // Keeps the message channel open for sendResponse
});
