export const createNewNodes = (existing_nodes, new_nodes) => {
	
    
    const result = new_nodes.map((new_node) => {
		// Get the existing node with the new_nodes.parent_id
		const parentNode = existing_nodes.find((existing_node) => existing_node.node_id === new_node.node_parent_id);
        console.log("parentNode", parentNode);
		// Get the parent node position
		const parentPosition_x = parentNode.node_position.x;
		const parentPosition_y = parentNode.node_position.y;

		// Create the new node
		const newNode = {
			id: new_node.node_branch_id,
			type: "customNode",
			data: { label: new_node.node_branch_title },
			position: { x: parentPosition_x + 100, y: parentPosition_y + 100 },
		};

		const newEdge = {
			id: `e${new_node.node_parent_id}-${new_node.node_branch_id}`,
			source: new_node.node_parent_id,
			target: new_node.node_branch_id,
		};
		return { newNode, newEdge };
	});

	return result;
};