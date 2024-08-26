import ELK from "elkjs";

const layoutOptions = {
	"elk.algorithm": "layered",
	"elk.direction": "DOWN" ,
	"elk.layered.spacing.edgeNodeBetweenLayers": "50",
	"elk.spacing.nodeNode": "80",
	"elk.layered.nodePlacement.bk.edgeCrossing.minimize": "true", // Minimize edge crossings
	"elk.layered.nodePlacement.strategy": "SIMPLE",
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
					side: sourcePort.isSideHandle ? "EAST" : "SOUTH",
				},
			}));

			return {
				id: node.id,
				width: node.width ?? 150,
				height: node.height ?? 50,
				properties: {
					"org.eclipse.elk.portConstraints": "FIXED_ORDER",
				},
				ports: [{ id: node.id }, ...targetPorts, ...sourcePorts],
			};
		}),

		edges: edges.map((edge) => ({
			id: edge.id,
			sources: [edge.sourceHandle || edge.source],
			targets: [edge.targetHandle || edge.target],
			x: edge.x || 0,
			y: edge.t || 0,
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
