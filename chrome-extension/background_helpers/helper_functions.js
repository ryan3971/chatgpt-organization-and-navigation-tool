import { getFromStorage, setToStorage } from "../shared/services/chromeStorageService.js";
import * as Constants from "../Constants/constants.js";

/****** General Functions ******/

export async function doesChatExist(chat_id)    {
	// First, get from storage the node spaces
	const node_spaces = await getFromStorage(Constants.NODE_SPACES_KEY);
	if (!node_spaces) return false; // false if node_spaces is undefined or false
    
	// Iterate through the node spaces and get the key to the nodes within them
	for (const node_space of node_spaces) {
		const nodes = await getFromStorage(getNodesKey(node_space.id));

        // If nodes is undefined, continue to the next node space
        if (!nodes) {
            console.error("Nodes not found in storage. This should not happen.");
            continue;
        }

		var node = getObject(chat_id, nodes);
		if (node)   {
            return {
                node_space_id: node_space.id, 
                node_id: node.id 
            };
        }
	}
	return false;
}

/***** Create New Storage Objects *****/

export async function createNewNodeSpace(node_id) {
    const node_spaces = await getFromStorage(Constants.NODE_SPACES_KEY);
    var node_space_id;

    switch (node_spaces) {
        case false:
            return false;
        case null:
            console.log("Node spaces not found in storage. Creating first one...");
            node_space_id = 1;
            break;
        default:
            node_space_id = node_spaces.length + 1;
    }

    const new_node_space = {
		id: node_space_id,
		node_parent_id: node_id,
	};

    var savedNodeSpaces;
    if (node_spaces === null) {
        savedNodeSpaces = await setToStorage(Constants.NODE_SPACES_KEY, [new_node_space]);
    } else {
        node_spaces.push(new_node_space);
        savedNodeSpaces = await setToStorage(Constants.NODE_SPACES_KEY, node_spaces);
    }

    if (!savedNodeSpaces) {
        console.error("Node spaces not saved to storage");
        return false;
    }

    return new_node_space;
}

export async function createNewNodeParent(node_space_id, node_id, node_title) {
    const node = {
		id: node_id,
		type: "",
		position: {
			x: 0,
			y: 0,
		},
		data: {
			label: node_title,
		},
	};

    const nodes_property = {
        id: node_id,
        isDeleted: false,
        parentNodeId: null,
        branchNodesIds: [],
    }

    const nodes_messages = {
        id: node_id,
        messages: [],
    }
    
    const savedNodes = await setToStorage(getNodesKey(node_space_id), [node]);
    const savedNodesProperties = await setToStorage(getNodesPropertiesKey(node_space_id), [nodes_property]);

    // Create an empty messages object
    const savedNodesMessages = await setToStorage(getNodesMessagesKey(node_space_id), [nodes_messages]);

    // Create an empty edge and edge property object
    const savedEdges = await setToStorage(getEdgesKey(node_space_id), []);
    const savedEdgesProperties = await setToStorage(getEdgesPropertiesKey(node_space_id), []);

    if (!savedNodes || !savedNodesProperties || !savedNodesMessages || !savedEdges || !savedEdgesProperties) {
        console.error("Nodes, nodes properties, nodes messages, edges, or edges properties not saved to storage");
        return false;
    }
    return node;
}

export async function createNewNodeBranch(node_space_id, parent_node_id, selected_text_data, branch_node_id, branch_node_title) {
	// get the nodes, nodes properties, edges, and edges properties from storage
	const nodes = await getFromStorage(getNodesKey(node_space_id));
	const nodes_properties = await getFromStorage(getNodesPropertiesKey(node_space_id));
    const nodes_messages = await getFromStorage(getNodesMessagesKey(node_space_id));
	const edges = await getFromStorage(getEdgesKey(node_space_id));
	const edges_properties = await getFromStorage(getEdgesPropertiesKey(node_space_id));

    if (!nodes || !nodes_properties || !nodes_messages || !edges || !edges_properties) {
		console.error("Nodes, nodes properties, nodes messages, edges, or edges properties not found in storage");
		return false;
	}

	// get the node property with the parent_node_id, pop it from the array, and store it in parent_node
	var parent_node_property = popObject(parent_node_id, nodes_properties);
	if (!parent_node_property) {
		console.error("Parent node not found in storage");
		return false;
	}
	// add the branch node id to the parent node's branchNodesIds
	parent_node_property.branchNodesIds.push(branch_node_id);
	nodes_properties.push(parent_node_property);

	// create the new branch node
	const node = {
		id: branch_node_id,
		type: "",
		position: {
			x: 0,
			y: 0,
		},
		data: {
			label: branch_node_title,
		},
	};

	// create the new branch node property
	const node_property = {
		id: branch_node_id,
		isDeleted: false,
		parentNodeId: parent_node_id,
		branchNodesIds: [],
	};

    // create the new branch node messages
    const node_messages = {
        id: branch_node_id,
        messages: [],
    }

	// create new edge
	const edge = {
		id: parent_node_id.concat("->", branch_node_id),
		source: parent_node_id,
		target: branch_node_id,
	};

	// create new edge property
	const edge_property = {
		id: parent_node_id.concat("->", branch_node_id),
		selectedText: selected_text_data.selectedText,
		selectedTextContainerId: selected_text_data.selectedTextContainerId,
	};

	// add the new node, node property, edge, and edge property to the respective arrays
	nodes.push(node);
	nodes_properties.push(node_property);
    nodes_messages.push(node_messages);
	edges.push(edge);
	edges_properties.push(edge_property);

	// save the new arrays to storage
	const savedNodes = await setToStorage(getNodesKey(node_space_id), nodes);
	const savedNodesProperties = await setToStorage(getNodesPropertiesKey(node_space_id), nodes_properties);
    const savedNodesMessages = await setToStorage(getNodesMessagesKey(node_space_id), nodes_messages);
	const savedEdges = await setToStorage(getEdgesKey(node_space_id), edges);
	const savedEdgesProperties = await setToStorage(getEdgesPropertiesKey(node_space_id), edges_properties);

    if (!savedNodes || !savedNodesProperties || !savedNodesMessages || !savedEdges || !savedEdgesProperties) {
		console.error("Nodes, nodes properties, node messages, edges, or edges properties not saved to storage");
		return false;
	}

	return true;
}

/***** Update Storage Objects *****/

// Function that retrieves object from storage - get it from storage, search for the one we want, and pop it from the array

export async function updateNodeMessages(node_space_id, node_id, messages) {
    const nodes_messages = await getFromStorage(getNodesMessagesKey(node_space_id));
    if (!nodes_messages)   {
        console.error("Nodes messages not found in storage");
        return false;
    }

    var node_messages = popObject(node_id, nodes_messages);
    if (!node_messages) {
        console.error("Node messages not found in storage");
        return false;
    }

    node_messages.messages = messages;
    nodes_messages.push(node_messages);

    const savedNodesMessages = await setToStorage(getNodesMessagesKey(node_space_id), nodes_messages);

    if (!savedNodesMessages) {
        console.error("Nodes messages not saved to storage");
        return false;
    }

    return true;
}

/***** General Helper Function ******/
// Function that takes an object and one or more key values pairs and returns a new object with the key value pairs added/updated
export function updateObject(obj, ...keyValues) {
    return Object.assign({}, obj, ...keyValues);
}

// Function that takes an id and an array of objects and returns the object with that id
export function getObject(id, objects) {
    for (const object of objects) {
		if (object.id === id) return object;
	}
    return null;
}

// Function that takes an id and an array of objects and returns the object with that id, popping it from the array
export function popObject(id, objects) {
    for (var i = 0; i < objects.length; i++) {
        if (objects[i].id === id) return objects.splice(i, 1)[0];
    }
    return null;
}

/***** Key Fetchers ******/

export function getNodesKey(node_space_id) {
	return Constants.NODES_KEY.concat("_", node_space_id);
}

export function getNodesPropertiesKey(node_space_id) {
	return Constants.NODES_PROPERTIES_KEY.concat("_", node_space_id);
}

export function getNodesMessagesKey(node_space_id) {
    return Constants.NODES_MESSAGES_KEY.concat("_", node_space_id);
}

export function getEdgesKey(node_space_id) {
	return Constants.EDGES_KEY.concat("_", node_space_id);
}

export function getEdgesPropertiesKey(node_space_id) {
    return Constants.EDGES_PROPERTIES_KEY.concat("_", node_space_id);
}
