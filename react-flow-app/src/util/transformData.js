// transformData.js

export const transformStorageData = (storageData) => {
	const nodesData = [];
	const edgesData = [];
    

	// Assume storageData is an object where keys are node IDs and values are the node information
	Object.keys(storageData).forEach((node_key) => {
		const node = storageData[node_key];
        const branches = node.branches;

        const new_node = {
			id: node_key, // The key is the node ID
			type: "custom-node", // or whatever type your node needs to be
			position: { x: 0, y: 0 }, // Define them here, position will be updated later
			data: {
				title: node.title,
				isParent: node.isParent,
				messages: node.messages,
				branches: branches,
			},
		};

		nodesData.push(new_node);

		// If the item includes information about connections, create edges
			Object.keys(branches).forEach((branch_key) => {
                const branch = branches[branch_key];

				const new_edge = {
					id: `${node_key}-${branch_key}`,
					source: node_key,
					sourceHandle: branch.selectedTextContainerId || "0",	// "0" if null
					target: branch_key,
					data: {
						selectedText: branch.selectedText,
					},
				};

				edgesData.push(new_edge);
			});
	});

	return { nodesData, edgesData };
};
