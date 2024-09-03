// transformData.js

/**
 * Transforms storage data into nodes and edges data for use in the flow diagram.
 *
 * @param {Object} storageData - The raw data from storage, where keys are node IDs and values are node information.
 * @returns {Object} An object containing arrays of nodesData and edgesData.
 */
export const transformStorageData = (storageData) => {
	const nodesData = [];
	const edgesData = [];

	// Iterate over each node in the storageData
	Object.keys(storageData).forEach((node_id) => {
		const selectedTextContainerIds = [];
		const node = storageData[node_id];
		const branches = node.branches;

		// Initialize the target handles list with a default handle
		const targetHandlesList = [{ id: `t-${node_id}` }];
		let sourceHandlesList = [];

		// Iterate over each branch to create edges and handle connections
		Object.keys(branches).forEach((branch_id) => {
			const branch = branches[branch_id];

			// Add the selected text container ID to the list if it is not already included
			if (!selectedTextContainerIds.includes(branch.selectedTextContainerId)) {
				selectedTextContainerIds.push(branch.selectedTextContainerId);
			}

			// Create source and target handles for the edge
			const sourceHandle = `${node_id}-s-${branch.selectedTextContainerId}`;
			const targetHandle = `t-${branch_id}`;

			// Add the source handle to the list that will be stored in the node
			sourceHandlesList.push({ id: sourceHandle });

			// Create the edge that connects this node to its branch
			const new_edge = {
				id: `${node_id}-${branch_id}`,
				type: "custom-edge",
				source: node_id,
				sourceHandle: sourceHandle,
				target: branch_id,
				targetHandle: targetHandle,
				data: {
					selectedText: branch.selectedText,
					isMessageOverwritten: branch.isMessageOverwritten,
					isSelected: false,
				},
			};

			edgesData.push(new_edge);
		});

		// Create the new node with its data and initial position
		const new_node = {
			id: node_id,
			type: "custom-node",
			position: { x: 0, y: 0 }, // Position will be updated later
			data: {
				title: node.title,
				isParent: node.isParent,
				messages: node.messages,
				selectedTextContainerIds: selectedTextContainerIds,
				targetHandles: targetHandlesList,
				sourceHandles: sourceHandlesList,
			},
		};

		nodesData.push(new_node);
	});

	return { nodesData, edgesData };
};
