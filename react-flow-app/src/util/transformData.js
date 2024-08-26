// transformData.js

export const transformStorageData = (storageData) => {
	const nodesData = [];
	const edgesData = [];
	/*
	sourceHandle: node_id-s-branch_container_id
	targetHandle: t-branch_id

	*/

	// Assume storageData is an object where keys are node IDs and values are the node information
	Object.keys(storageData).forEach((node_id) => {

		const selectedTextContainerIds = [];
		const node = storageData[node_id];
		const branches = node.branches;

		const targetHandlesList = [{ id: `t-${node_id}`}];
		let sourceHandlesList = [];

		// If the item includes information about connections, create edges
		Object.keys(branches).forEach((branch_id) => {
			const branch = branches[branch_id];

			// Add the selected text container ID to the list
			selectedTextContainerIds.push(branch.selectedTextContainerId);

			// Create the eges that will connect to this node 
			const sourceHandle = `${node_id}-s-${branch.selectedTextContainerId}`;
			const targetHandle = `t-${branch_id}`;

			// add the source handle to the list that will be stored in the node
			sourceHandlesList.push({
				id: sourceHandle,
				isSideHandle: branch.selectedTextContainerId ? false : true,
			});

			console.log("Edge Source Handle:", sourceHandle);
			console.log("Edge Target Handle:", targetHandle);

			const new_edge = {
				id: `${node_id}-${branch_id}`,
				type: "custom-edge",
				source: node_id,
				sourceHandle: sourceHandle,
				target: branch_id,
				targetHandle: targetHandle,
				data: {
					selectedText: branch.selectedText,
				},
			};

			edgesData.push(new_edge);
		});

		
		const new_node = {
			id: node_id, // The key is the node ID
			type: "custom-node", // or whatever type your node needs to be
			position: { x: 0, y: 0 }, // Define them here, position will be updated later
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
