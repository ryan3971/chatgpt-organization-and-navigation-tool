import ELK from "elkjs";

// Layout options for the ELK layout algorithm
const layoutOptions = {
	"elk.algorithm": "layered",
	"elk.direction": "DOWN",
	"elk.layered.spacing.edgeNodeBetweenLayers": "75",
	"elk.spacing.nodeNode": "100",
	"elk.spacing.edgeNode": "100",
	"elk.layered.spacing.nodeNodeBetweenLayers": "100",
	"elk.layered.nodePlacement.strategy": "SIMPLE",
	"elk.portConstraints": "FIXED_ORDER", // Ensures ports have defined sides
};

const elk = new ELK();

/**
 * Function to layout the nodes using ELK
 * @param {Array} nodes - The array of nodes to be laid out
 * @param {Array} edges - The array of edges connecting the nodes
 * @returns {Promise<Array>} - A promise that resolves to the laid-out nodes
 */
export const getLayoutedNodes = async (nodes, edges) => {
	// Construct the graph object required by ELK
	const graph = {
		id: "root",
		layoutOptions,
		children: nodes.map((node) => {
			// Map target and source handles to ELK ports
			const targetPorts = node.data.targetHandles.map((targetPort) => ({
				id: targetPort.id,
				properties: {
					side: "NORTH",
				},
			}));

			const sourcePorts = node.data.sourceHandles.map((sourcePort) => ({
				id: sourcePort.id,
				properties: {
					side: "SOUTH",
				},
			}));

			return {
				id: node.id,
				width: node.measured.width ?? 200, // Default width if not measured
				height: node.measured.height ?? 100, // Default height if not measured
				ports: [...targetPorts, ...sourcePorts],
			};
		}),
		edges: edges.map((edge) => ({
			id: edge.id,
			sources: [edge.sourceHandle || edge.source],
			targets: [edge.targetHandle || edge.target],
		})),
	};

	// Perform the layout using ELK
	const layoutedGraph = await elk.layout(graph);

	// Map the layouted positions back to the original nodes
	const layoutedNodes = nodes.map((node) => {
		const layoutedNode = layoutedGraph.children?.find((layoutedGraphNode) => layoutedGraphNode.id === node.id);
		return {
			...node,
			position: {
				x: layoutedNode?.x ?? 0,
				y: layoutedNode?.y ?? 0,
			},
		};
	});

	return layoutedNodes;
};
