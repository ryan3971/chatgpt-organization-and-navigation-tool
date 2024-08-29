import ELK from "elkjs";

const layoutOptions = {
	"elk.algorithm": "layered",
	"elk.direction": "DOWN",
	"elk.layered.spacing.edgeNodeBetweenLayers": "75",
	"elk.spacing.nodeNode": "100",
	"elk.spacing.edgeNode": "100",
	"elk.layered.spacing.nodeNodeBetweenLayers": "100",

	"elk.layered.nodePlacement.strategy": "SIMPLE",
	"elk.portConstraints": "FIXED_ORDER", // Ensures ports have defined sides


	//"elk.spacing.edgeEdge": "100",

	//"elk.layered.spacing.nodeNode": 30,
	//"elk.layered.layering.strategy": "INTERACTIVE",
	//"elk.layered.crossingMinimization.strategy": "LAYER_SWEEP",
	//"elk.edgeRouting": "ORTHOGONAL",
	// "elk.hierarchyHandling": "INCLUDE_CHILDREN",
	//"elk.layered.nodePlacement.bk.edgeCrossing.minimize": "true", // Minimize edge crossings
};

const elk = new ELK();

// Function to layout the nodes using ELK
export const getLayoutedNodes = async (nodes, edges) => {
	console.log("Autolayouting Nodes: ", nodes);
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

			// console.log("node.data.sourceHandles", node.data.sourceHandles);

			const sourcePorts = node.data.sourceHandles.map((sourcePort) => ({
				id: sourcePort.id,
				properties: {
					side: "SOUTH",
				},

			}));

			return {
				id: node.id,
				width: node.measured.width ?? 200,
				height: node.measured.height ?? 100,
				ports: [...targetPorts, ...sourcePorts],
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
		console.log("End of Auto Layouted Node: ", layoutedNode);
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
