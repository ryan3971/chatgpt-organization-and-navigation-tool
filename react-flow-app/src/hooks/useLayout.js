import { useReactFlow, useNodesInitialized } from "@xyflow/react";
import { useEffect, useState } from "react";

import { getLayoutedElements } from "../components/FlowDiagram/layouting/AutoLayout";

const options = {
	includeHiddenNodes: false,
};

export default function useLayout() {
	const { getNodes, getEdges } = useReactFlow();
	const nodesInitialized = useNodesInitialized(options);
	const [layout, setLayout] = useState({ nodes: [], edges: [] });

	useEffect(() => {
		console.log("Nodes initialized", nodesInitialized);
		if (nodesInitialized) {
			const currentNodes = getNodes();
			const currentEdges = getEdges();

			const layoutedElements = getLayoutedElements(currentNodes, currentEdges, { direction: "TB" });
			setLayout({nodes: layoutedElements.nodes, edges: layoutedElements.edges});	// redundant but reminder of the key value pair
		}
	}, [nodesInitialized]);

	return [layout];
}
