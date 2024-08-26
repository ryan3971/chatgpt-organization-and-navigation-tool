import { useReactFlow, useNodesInitialized } from "@xyflow/react";
import { useEffect, useState } from "react";

import { getLayoutedNodes } from "../components/FlowDiagram/layouting/AutoLayout";

const options = {
	includeHiddenNodes: false,
};
export default function useLayout() {
	const { getNodes, getEdges } = useReactFlow();
	const nodesInitialized = useNodesInitialized(options);
	const [layout, setLayout] = useState({ nodes: [], edges: [] });

	useEffect(() => {
		console.log("Nodes initialized", nodesInitialized);

		const layoutNodes = async () => {
			if (nodesInitialized) {
				const currentNodes = getNodes();
				const currentEdges = getEdges();

				// Get the layouted nodes and apply them
				const layoutedNodes = await getLayoutedNodes(currentNodes, currentEdges);

				setLayout({ nodes: layoutedNodes, edges: currentEdges });
			}
		};

		layoutNodes(); // Trigger the async layout function when nodes are initialized
	}, [nodesInitialized, getNodes, getEdges]);

	return [layout];
}