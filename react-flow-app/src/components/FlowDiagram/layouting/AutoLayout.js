import ELK from "elkjs";

const layoutOptions = {
	"elk.algorithm": "layered",
	"elk.direction": "DOWN",
	"elk.layered.spacing.edgeNodeBetweenLayers": "50",
	"elk.spacing.nodeNode": "100",
	"elk.spacing.edgeNode": "100",
	"elk.layered.nodePlacement.strategy": "SIMPLE",

	//"elk.spacing.edgeEdge": "100",

	//"elk.layered.spacing.nodeNodeBetweenLayers": 50,
	//"elk.layered.spacing.nodeNode": 30,
	// "elk.layered.layering.strategy": "INTERACTIVE",
	//"elk.layered.crossingMinimization.strategy": "LAYER_SWEEP",
	// "elk.edgeRouting": "ORTHOGONAL",
	// "elk.hierarchyHandling": "INCLUDE_CHILDREN",
	//"elk.portConstraints": "FIXED_ORDER", // Ensures ports have defined sides
	//"elk.layered.nodePlacement.bk.edgeCrossing.minimize": "true", // Minimize edge crossings
};

const elk = new ELK();

// Function to layout the nodes using ELK
export const getLayoutedNodes = async (nodes, edges) => {
	const graph = {
		id: "root",
		layoutOptions,
		children: nodes.map((node) => {
			const targetPorts = node.data.targetHandles.map((targetPort) => ({
				id: targetPort.id,
				properties: {
					side: "NORTH",
				},
			}));

			console.log("node.data.sourceHandles", node.data.sourceHandles);

			const sourcePorts = node.data.sourceHandles.map((sourcePort) => ({
				id: sourcePort.id,
				properties: {
					side: "SOUTH",
				},

			}));

			return {
				id: node.id,
				width: node.width ?? 150,
				height: node.height ?? 50,
				properties: {
					"org.eclipse.elk.portConstraints": "FIXED_ORDER",
				},
				ports: [
					{
						id: `${node.id}`, // Ensure the main port has a unique ID and side assignment
					},
					...targetPorts,
					...sourcePorts,
				],
			};
		}),

		edges: edges.map((edge) => ({
			id: edge.id,
			sources: [edge.sourceHandle || edge.source],
			targets: [edge.targetHandle || edge.target],
		})),
	};

	const layoutedGraph = await elk.layout(graph);

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
