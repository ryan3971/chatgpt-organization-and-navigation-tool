import CustomNode from "./CustomNode/CustomNode.jsx";

export const initialNodes = [
	{
		id: "1",
		type: "custom-node",
		data: {
			title: "Title",
			numColumns: 6,
		},
		position: { x: 250, y: 5 },
	},

	{
		id: "2",
		type: "custom-node",
		data: {
			title: "Title_2",
			numColumns: 4,
		},
		position: { x: 250, y: 255 },
	},
];

export const nodeTypes = {
	"custom-node": CustomNode,
};