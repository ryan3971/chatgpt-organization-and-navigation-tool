const testData = {
	"new_nodes": [
		{
			"node_parent_id": "1",
			"node_branch_id": "3",
			"node_branch_title": "Node 3",
			"edge_selected_text": "Selected text for Edge 2-3"
		}
	],
	"nodes": [
		{
			"node_id": "1",
			"node_type": "default",
			"node_position": { "x": 250, "y": 5 },
			"node_data": {
				"node_data_title": "Node 1"
			}
		},
		{
			"node_id": "2",
			"node_type": "default",
			"node_position": { "x": 250, "y": 5 },
			"node_data": {
				"node_data_title": "Node 2"
			}
		}
	],
	"edges": [
		{
			"edge_id": "e1-2",
			"edge_source": "1",
			"edge_target": "2",
			"type": "default",
			"edge_data": {
				"edge_data_selected_text": "Selected text for Edge 1-2"
			}
		}
	]
}
export default testData;
