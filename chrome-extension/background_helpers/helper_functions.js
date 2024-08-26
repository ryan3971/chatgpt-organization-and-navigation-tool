import { getFromStorage, setToStorage, removeFromStorage } from "../shared/services/chromeStorageService.js";
import * as Constants from "../Constants/constants.js";

/****** General Functions ******/

export async function doesNodeExist(node_id)    {
	// First, get from storage the node spaces
	const node_spaces_keys = await getFromStorage(Constants.NODE_SPACES_KEY);
	if (!node_spaces_keys) return false; // false if node_spaces is undefined or false
    
	// Iterate through the node spaces and get the key to the nodes within them
	for (const node_space_key of node_spaces_keys) {
		const nodes = await getFromStorage(node_space_key);

        // If nodes is undefined, continue to the next node space
        if (!nodes) {
            console.error("Nodes not found in storage. This should not happen.");
            continue;
        }

        // Check if the key exists in the nodes
        if (node_id in nodes) {
            return {
                node_space_id: node_space_key,
                node_id: node_id,
            };
        }
	}
	return false;
}

/***** Create New Storage Objects *****/
export async function createNewNodeSpace() {
    const nodeSpacesKeys = await getFromStorage(Constants.NODE_SPACES_KEY);

    if (nodeSpacesKeys === false) {
        return false;
    }
    // create a new node space id
    const nodeSpaceId = generateRandomId();

    // save the new node space id
    var savedNodeSpaces;
    if (nodeSpacesKeys === null) {
        savedNodeSpaces = await setToStorage(Constants.NODE_SPACES_KEY, [nodeSpaceId]);
    } else {
        nodeSpacesKeys.push(nodeSpaceId);
        savedNodeSpaces = await setToStorage(Constants.NODE_SPACES_KEY, nodeSpacesKeys);
    }

    if (!savedNodeSpaces) {
        console.error("Node spaces not saved to storage");
        return false;
    }
    return nodeSpaceId;
}

export async function createNewNodeParent(node_id, node_title) {
    
    // Create a new node space
    const nodeSpaceId = await createNewNodeSpace();
    if (!nodeSpaceId) {
        console.error("Node space not created");
        return false;
    }
    
    const newParentNode = {
        title: node_title,
        isParent: true,
        messages: [],
        branches: {},
	};

    var nodeObject  = {};
    nodeObject[node_id] = newParentNode;
    
    const savedNode = await setToStorage(nodeSpaceId, nodeObject);

    if (!savedNode) {
		console.error("Nodes, nodes properties, nodes messages, edges, or edges properties not saved to storage");
		return false;
	}
    return nodeSpaceId;
}

export async function createNewNodeBranch(node_space_id, parent_node_id, selected_text_data, branch_node_id, branch_node_title) {
	// get the nodes from storage
	const spaceNodes = await getFromStorage(node_space_id);
    if (!spaceNodes) {
		console.error("Nodes not found in storage");
		return false;
	}

    // get the parent node
    const parentNode = spaceNodes[parent_node_id];
    if (!parentNode) {
        console.error("Parent node not found in storage (should not happen)");
        return false;
    }
    // update the parent node with the new branch data
    const branchData = {
		selectedText: selected_text_data.selectedText,
		selectedTextContainerId: selected_text_data.selectedTextContainerId,    // convert to string
	};
    console.log("Selected text container id - helper - create branch:", selected_text_data.selectedTextContainerId);
    parentNode.branches[branch_node_id] = branchData;
    spaceNodes[parent_node_id] = parentNode;

    const newBranchNode = {
		title: branch_node_title,
		isParent: false,
		messages: [],
		branches: {},
	};

    spaceNodes[branch_node_id] = newBranchNode;

	// save the new arrays to storage
	const savedSpaceNodes = await setToStorage(node_space_id, spaceNodes);
    if (!savedSpaceNodes) {
		console.error("Nodes not saved to storage");
		return false;
	}
	return true;
}

/***** Update Storage Objects *****/
// Function that retrieves object from storage - get it from storage, search for the one we want, and pop it from the array

export async function updateNodeMessages(node_space_id, node_id, messages) {

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

    // update the node with the new messages
    node.messages = messages;

    // get the length of the messages dict
    var messagesLength = messages.length;
   
    for (const branch_id in node.branches) {

        let selectedTextContainerId = node.branches[branch_id].selectedTextContainerId;
        selectedTextContainerId = selectedTextContainerId;  // convert back to number, already has been normalized
        
        console.log("Selected text container id - helper:", selectedTextContainerId);
        console.log("Messages length - helper:", messagesLength - 2);

        if (selectedTextContainerId >= messagesLength - 2) { // subtract 2 to account for the overwritten messages
            // set the selected text container id to be null
            node.branches[branch_id].selectedTextContainerId = null;
            console.log("Selected text container id is greater than the length of the messages. Setting it to null");
		}
    }

    spaceNodes[node_id] = node;

    const savedSpaceNodes = await setToStorage(node_space_id, spaceNodes);
    if (!savedSpaceNodes) {
        console.error("Nodes not saved to storage");
        return false;
    }
    return true;
}

export async function updateNodeTitle(nodeId, newTitle) {
    
    const nodeSpacesKeys = await getFromStorage(Constants.NODE_SPACES_KEY);

    if (!nodeSpacesKeys) {
        console.error("Node spaces not found in storage");
        return false;
    }
    
    for (const nodeSpaceKey of nodeSpacesKeys) {
        const nodes = await getFromStorage(nodeSpaceKey);

        if (!nodes) {
            console.error("Nodes not found in storage. This should not happen.");
            continue;
        }

        if (nodeId in nodes) {
			// update the node with the new title
			nodes[nodeId].title = newTitle;
			const savedNodes = await setToStorage(nodeSpaceKey, nodes);

			if (!savedNodes) {
				console.error("Nodes title not saved to storage");
				return false;
			}
			console.log("Node title updated in storage:", newTitle);
			return true;
		}
    }

    console.log("Node not found in storage. Likely was not a stored node");
    return true;    // might change
}

export async function deleteNodeSpace(nodeSpaceId) {

    // delete the node space and remove it from the node spaces keys
    const deletedNodeSpace = await removeFromStorage(nodeSpaceId);
    if (!deletedNodeSpace) {
        console.error("Node space not deleted");
        return false;
    }

    // get the node spaces keys
    const nodeSpacesKeys = await getFromStorage(Constants.NODE_SPACES_KEY);
    if (!nodeSpacesKeys) {
        console.error("Node spaces keys not found in storage");
        return false;
    }

    // remove the node space key from the node spaces keys
    const nodeSpacesKeysIndex = nodeSpacesKeys.indexOf(nodeSpaceId);
    if (nodeSpacesKeysIndex > -1) {
        nodeSpacesKeys.splice(nodeSpacesKeysIndex, 1);
    } else {
        console.error("Node space key not found in node spaces keys");
        return false;
    }

    // save the new node spaces keys
    const savedNodeSpacesKeys = await setToStorage(Constants.NODE_SPACES_KEY, nodeSpacesKeys );
    if (!savedNodeSpacesKeys) {
        console.error("Node spaces keys not saved to storage");
        return false;
    }
    return true;
}

export async function deleteNode(node_id, nodes=null, level=0) {
    
    // we need to get the nodes from storage, check if the node is in the nodes, and recursively delete all branches of the node (and the branches of those nodes too) if it is found
    var nodeSpaceKey;
    
    if (nodes === null) {
        const nodeSpacesKeys = await getFromStorage(Constants.NODE_SPACES_KEY);
        if (!nodeSpacesKeys) {
            console.error("Node spaces not found in storage");
            return false;
        }
        
        for (nodeSpaceKey of nodeSpacesKeys) {
            nodes = await getFromStorage(nodeSpaceKey);

            if (!nodes) {
                console.error("Nodes not found in storage. This should not happen.");
                continue;
            }

            if (node_id in nodes) {
                // Check if this node is the parent node; if it is, delete the node space
                if (nodes[node_id].isParent) {
                    // delete the node space
                    const deletedNodeSpace = await deleteNodeSpace(nodeSpaceKey);
                    if (!deletedNodeSpace) {
                        console.error("Node space not deleted");
                        return false;
                    }
                    console.log("Node space deleted");
                    return true;
                }
                break;
            }
        }
    }

    if (node_id in nodes) {
		// recursively delete the branches of the node
        const nodeBranchesIds = Object.keys(nodes[node_id].branches);
		for (const branch_id of nodeBranchesIds) {
			deleteNode(branch_id, nodes, level + 1);
            console.log("Branch deleted");
		}
		// delete the node
		delete nodes[node_id];
        console.log("Node deleted");

	} else if (level === 0) {
        console.error("Node not found in storage. Node likely was not a stored node");
        return true;
    } else if (level > 0) {
        console.error("Node not found in storage. This should not happen.");
        return false;
    }

    // save the new nodes to storage
    if (level === 0) {
        const savedNodes = await setToStorage(nodeSpaceKey, nodes);
        if (!savedNodes) {
            console.error("Nodes not saved to storage");
            return false;
        }
    }
    return true;
}

/**** Getter Functions ******/
export async function getNodeSpaces() {
	const nodeSpacesKeys = await getFromStorage(Constants.NODE_SPACES_KEY);
	if (nodeSpacesKeys === null) {
        console.warn("No Node spaces available in storage");
        return null;
    } else if (nodeSpacesKeys === false) {
		console.error("Node spaces not found in storage");
		return false;
	}
	return nodeSpacesKeys;
}

export async function getNodeSpaceData(node_space_id) {
    const nodes = await getFromStorage(node_space_id);
    if (nodes === null) {
        console.warn("No nodes available in storage");
        return null;
    } else if (nodes === false) {
        console.error("Nodes not found in storage");
        return false;
    }
    return nodes;
}


/***** General Helper Function ******/
function generateRandomId() {
	return Date.now().toString(16);
}