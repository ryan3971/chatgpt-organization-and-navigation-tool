import { getFromStorage, setToStorage, removeFromStorage } from "../services/chromeStorageService.js";
import * as Constants from "../constants/constants.js";

/****** General Functions ******/
export async function doesNodeExist(node_id) {
	try {
		const node_spaces_keys = await getFromStorage(Constants.NODE_SPACES_KEY);
		if (!node_spaces_keys) return false;

		for (const node_space_key in node_spaces_keys) {
			const nodes = await getFromStorage(node_space_key);
			if (!nodes) {
				console.error("Nodes not found in storage. This should not happen.");
				continue;
			}
			if (node_id in nodes) {
				return {
					node_space_id: node_space_key,
					node_id: node_id,
					node_title: nodes[node_id].title,
				};
			}
		}
		return false;
	} catch (error) {
		console.error("Error in doesNodeExist:", error);
		return false;
	}
}

/***** Create New Storage Objects *****/
export async function createNewNodeSpace(node_space_title) {
	try {
		const nodeSpacesKeys = await getFromStorage(Constants.NODE_SPACES_KEY);

		// Generate a new node space ID
		const nodeSpaceId = generateRandomId();

		// Initialize the node space object to save
		let savedNodeSpaces;
		if (nodeSpacesKeys === null) {
			const nodeSpace = {};
			nodeSpace[nodeSpaceId] = { title: node_space_title };
			savedNodeSpaces = await setToStorage(Constants.NODE_SPACES_KEY, nodeSpace);
		} else if (nodeSpacesKeys !== false) {
			nodeSpacesKeys[nodeSpaceId] = { title: node_space_title };
			savedNodeSpaces = await setToStorage(Constants.NODE_SPACES_KEY, nodeSpacesKeys);
		} else {
			console.error("Node spaces not found in storage");
			return false;
		}

		if (!savedNodeSpaces) {
			console.error("Failed to save new node space to storage");
			return false;
		}
		return nodeSpaceId;
	} catch (error) {
		console.error("Error in createNewNodeSpace:", error);
		return false;
	}
}

export async function createNewNodeParent(node_id, node_title) {
	try {
		// Create a new node space
		const nodeSpaceId = await createNewNodeSpace(node_title);
		if (!nodeSpaceId) {
			console.error("Failed to create new node space");
			return false;
		}

		// Initialize the new parent node
		const newParentNode = {
			title: node_title,
			isParent: true,
			parent_id: null,
			messages: [],
			branches: {},
		};

		const nodeObject = {};
		nodeObject[node_id] = newParentNode;

		// Save the new parent node to storage
		const savedNode = await setToStorage(nodeSpaceId, nodeObject);
		if (!savedNode) {
			console.error("Failed to save new parent node to storage");
			return false;
		}
		return nodeSpaceId;
	} catch (error) {
		console.error("Error in createNewNodeParent:", error);
		return false;
	}
}

export async function createNewNodeBranch(node_space_id, parent_node_id, selected_text_data, branch_node_id, branch_node_title) {
	try {
		const spaceNodes = await getFromStorage(node_space_id);
		if (!spaceNodes) {
			console.error("Nodes not found in storage");
			return false;
		}

		const parentNode = spaceNodes[parent_node_id];
		if (!parentNode) {
			console.error("Parent node not found in storage");
			return false;
		}

		// Update the parent node with new branch data
		const branchData = {
			selectedText: selected_text_data.selectedText,
			selectedTextContainerId: selected_text_data.selectedTextContainerId,
			isMessageOverwritten: false,
		};
		parentNode.branches[branch_node_id] = branchData;
		spaceNodes[parent_node_id] = parentNode;

		// Initialize the new branch node
		const newBranchNode = {
			title: branch_node_title,
			isParent: false,
			parent_id: parent_node_id,
			messages: [],
			branches: {},
		};
		spaceNodes[branch_node_id] = newBranchNode;

		// Save the updated nodes to storage
		const savedSpaceNodes = await setToStorage(node_space_id, spaceNodes);
		if (!savedSpaceNodes) {
			console.error("Failed to save branch node to storage");
			return false;
		}
		return true;
	} catch (error) {
		console.error("Error in createNewNodeBranch:", error);
		return false;
	}
}

/***** Other Storage Objects *****/
export async function pinNodeMessage(node_space_id, node_id, message_container_id)	{

	try {
		const spaceNodes = await getFromStorage(node_space_id);
		if (!spaceNodes) {
			console.error("Nodes not found in storage");
			return false;
		}

		const node = spaceNodes[node_id];
		if (!node) {
			console.error("Node not found in storage");
			return false;
		}

		// Get the message to pin, set it to true
		const messageToPinIndex = Math.floor(message_container_id / 2);
		const messageToPin = node.messages[messageToPinIndex][2] = true;
		if (!messageToPin) {
			console.error("Message to pin not found in storage");
			return false;
		}

		// Save the updated node to storage
		spaceNodes[node_id] = node;
		const savedSpaceNodes = await setToStorage(node_space_id, spaceNodes);
		if (!savedSpaceNodes) {
			console.error("Failed to save updated node messages to storage");
			return false;
		}
		return true;
	} catch (error) {
		console.error("Error in pinNodeMessage:", error);
		return false;
	}
}

/***** Update Storage Objects *****/
export async function updateNodeMessages(node_space_id, node_id, messages) {
	try {
		const spaceNodes = await getFromStorage(node_space_id);
		if (!spaceNodes) {
			console.error("Nodes not found in storage");
			return false;
		}

		const node = spaceNodes[node_id];
		if (!node) {
			console.error("Node not found in storage");
			return false;
		}

		// Iterate through each of the messages and save the pinned status of the message from what was in storage
		for (let i = 0; i < messages.length; i++) {
			try {
				const pinnedMessage = node.messages[i][2];	// Get the pinned status of the message
				messages[i][2] = pinnedMessage;				// Set the pinned status of the message
			}
			catch (error) {
				messages[i][2] = false;						// Set the pinned status of the message to false if it was not found
			}
		}

		// Update node with new messages
		node.messages = messages;

		// Check for overwritten messages in branches
		const messagesLength = messages.length;
		for (const branch_id in node.branches) {
			let selectedTextContainerId = node.branches[branch_id].selectedTextContainerId;
			selectedTextContainerId = Math.floor(selectedTextContainerId / 2);

			if (selectedTextContainerId > messagesLength - 2) {	// -2 because the last 2 messages are the overriding messages
				node.branches[branch_id].isMessageOverwritten = true;
				node.branches[branch_id].selectedTextContainerId = messagesLength; // reposition the branch to the last message
				console.warn(`Branch message at container ${selectedTextContainerId} is overwritten`);
			}
		}

		// Save the updated node to storage
		spaceNodes[node_id] = node;
		const savedSpaceNodes = await setToStorage(node_space_id, spaceNodes);
		if (!savedSpaceNodes) {
			console.error("Failed to save updated node messages to storage");
			return false;
		}
		return true;
	} catch (error) {
		console.error("Error in updateNodeMessages:", error);
		return false;
	}
}


export async function updateNodeSpaceTitle(nodeSpaceId, newTitle) {
	try {
		const nodeSpacesKeys = await getFromStorage(Constants.NODE_SPACES_KEY);
		if (!nodeSpacesKeys) {
			console.error("Node spaces not found in storage");
			return false;
		}

		if (nodeSpaceId in nodeSpacesKeys) {
			nodeSpacesKeys[nodeSpaceId].title = newTitle;
		} else {
			console.error("Node space not found in storage");
			return false;
		}

		const savedNodeSpacesKeys = await setToStorage(Constants.NODE_SPACES_KEY, nodeSpacesKeys);
		if (!savedNodeSpacesKeys) {
			console.error("Failed to save node space title to storage");
			return false;
		}
		return true;
	} catch (error) {
		console.error("Error in updateNodeSpaceTitle:", error);
		return false;
	}
}


export async function updateNodeTitle(nodeId, newTitle) {
	try {
		const nodeSpacesKeys = await getFromStorage(Constants.NODE_SPACES_KEY);
		if (!nodeSpacesKeys) {
			console.error("Node spaces not found in storage");
			return false;
		}

		for (const nodeSpaceKey in nodeSpacesKeys) {
			const nodes = await getFromStorage(nodeSpaceKey);
			if (!nodes) {
				console.error("Nodes not found in storage. This should not happen.");
				continue;
			}

			if (nodeId in nodes) {
				nodes[nodeId].title = newTitle;
				const savedNodes = await setToStorage(nodeSpaceKey, nodes);
				if (!savedNodes) {
					console.error("Failed to save updated node title to storage");
					return false;
				}
				return true;
			}
		}

		console.warn("Node not found in storage. It might not have been stored.");
		return true; // It might be valid for a node not to be stored, depending on the application logic
	} catch (error) {
		console.error("Error in updateNodeTitle:", error);
		return false;
	}
}


/***** Delete Storage Objects *****/
export async function deleteNodeSpace(nodeSpaceId) {
	try {
		const deletedNodeSpace = await removeFromStorage(nodeSpaceId);
		if (!deletedNodeSpace) {
			console.error("Failed to delete node space from storage");
			return false;
		}

		const nodeSpacesKeys = await getFromStorage(Constants.NODE_SPACES_KEY);
		if (!nodeSpacesKeys) {
			console.error("Node spaces keys not found in storage");
			return false;
		}

		if (nodeSpaceId in nodeSpacesKeys) {
			delete nodeSpacesKeys[nodeSpaceId];
		} else {
			console.error("Node space key not found in node spaces keys");
			return false;
		}

		const savedNodeSpacesKeys = await setToStorage(Constants.NODE_SPACES_KEY, nodeSpacesKeys);
		if (!savedNodeSpacesKeys) {
			console.error("Failed to save updated node spaces keys to storage");
			return false;
		}
		return true;
	} catch (error) {
		console.error("Error in deleteNodeSpace:", error);
		return false;
	}
}


export async function deleteNode(node_id, nodes = null, level = 0) {
	try {
		let nodeSpaceKey;

		if (nodes === null) {
			const nodeSpacesKeys = await getFromStorage(Constants.NODE_SPACES_KEY);
			if (!nodeSpacesKeys) {
				console.error("Node spaces not found in storage");
				return false;
			}

			for (nodeSpaceKey in nodeSpacesKeys) {
				nodes = await getFromStorage(nodeSpaceKey);
				if (!nodes) {
					console.error("Nodes not found in storage. This should not happen.");
					continue;
				}

				if (node_id in nodes) {
					if (nodes[node_id].isParent) {
						const deletedNodeSpace = await deleteNodeSpace(nodeSpaceKey);
						if (!deletedNodeSpace) {
							console.error("Node space not deleted");
							return false;
						}
						return true;
					}
					break;
				}
			}
		}

		if (node_id in nodes) {
			const nodeBranchesIds = Object.keys(nodes[node_id].branches);
			for (const branch_id of nodeBranchesIds) {
				await deleteNode(branch_id, nodes, level + 1);
			}
			if (level !== 0) delete nodes[node_id];	// Do not delete the original node yet

		} else {
			if (level === 0) {
				console.warn("Node not found in storage. Node likely was not a stored node");
				return true;
			} else {
				console.error("Node not found in storage. This should not happen.");
				return false;
			}
		}

		if (level === 0) {
			// Use the nodes parent_id property to find the parent node and remove the branch
			const parentNodeId = nodes[node_id].parent_id;
			const parentNode = nodes[parentNodeId];
			if (!parentNode) {
				console.error("Parent node not found in storage");
				return false;
			}

			// Remove the branch from the parent node
			delete parentNode.branches[node_id];
			nodes[parentNodeId] = parentNode;

			//Lastly, delete the original node
			delete nodes[node_id];

			const savedNodes = await setToStorage(nodeSpaceKey, nodes);
			if (!savedNodes) {
				console.error("Nodes not saved to storage");
				return false;
			}
		}
		return true;
	} catch (error) {
		console.error("Error in deleteNode:", error);
		return false;
	}
}



/**** Getter Functions ******/
export async function getNodeSpaces() {
	try {
		const nodeSpacesKeys = await getFromStorage(Constants.NODE_SPACES_KEY);
		if (nodeSpacesKeys === null) {
			console.warn("No Node spaces available in storage");
			return null;
		} else if (nodeSpacesKeys === false) {
			console.error("Failed to retrieve node spaces from storage");
			return false;
		}
		return nodeSpacesKeys;
	} catch (error) {
		console.error("Error in getNodeSpaces:", error);
		return false;
	}
}


export async function getNodeSpaceData(node_space_id) {
	try {
		const nodes = await getFromStorage(node_space_id);
		if (nodes === null) {
			console.warn("No nodes available in storage");
			return null;
		} else if (nodes === false) {
			console.error("Failed to retrieve nodes from storage");
			return false;
		}
		return nodes;
	} catch (error) {
		console.error("Error in getNodeSpaceData:", error);
		return false;
	}
}


/***** General Helper Function ******/
function generateRandomId() {
	return Date.now().toString(16);
}