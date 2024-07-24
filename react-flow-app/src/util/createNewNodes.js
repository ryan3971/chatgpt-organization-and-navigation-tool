
/**
 * Create new nodes and edges based on existing nodes and new nodes.
 * @param {Array} existingNodes - Array of existing nodes.
 * @param {Array} newNodes - Array of new nodes.
 * @returns {Array} - Array of created nodes and edges.
 */

export const createNewParentNode = (newParenNode) => {

	const newNode = {
		id: newParenNode.node_parent_id,
		type: "customNode",
		data: { label: newParenNode.node_parent_title },
		position: { x: 250, y: 0 },
	};

	return newNode;
};

export const createNewNodes = (existingNodes, newNodes) => {

	const result = newNodes
		.map(({ node_branch_id, node_parent_title, node_parent_id }) => {
			
			if (!node_branch_id) {
				console.error("Branch Node does not exist. Do not create node yet");
				return null;
			}

			// Get the existing node with the new_nodes.parent_id
			const parentNode = existingNodes.find(({ id }) => id === node_parent_id);
			if (!parentNode) {
				console.error("Parent Node does not exist")
				return null;
			}

			console.log("parentNode", parentNode);

			// Get the parent node position
			const { x: parentPositionX, y: parentPositionY } = parentNode.position;

			// Create the new node
			const newNode = {
				id: node_branch_id,
				type: "customNode",
				data: { label: "Branch Title" },
				position: { x: parentPositionX + 100, y: parentPositionY + 100 },
			};

			const newEdge = {
				id: `e${node_parent_id}-${node_branch_id}`,
				source: node_parent_id,
				target: node_branch_id,
			};

			console.log("createNewNodes- newNode: ", newNode);
			console.log("createNewNodes - newEdge: ", newEdge);

			return { newNode, newEdge };
			
		}).filter((item) => item !== null); // Filter out null values in case of errors

	return result;
};