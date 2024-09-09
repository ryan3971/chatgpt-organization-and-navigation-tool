import { useReactFlow, useNodesInitialized } from "@xyflow/react";
import { useEffect, useState } from "react";
import { getLayoutedNodes } from "../components/FlowDiagram/layouting/AutoLayout";

// Options for node initialization, excluding hidden nodes
const options = {
	includeHiddenNodes: false,
};

/**
 * Custom hook for layout management using ELK.
 *
 * @returns {Array} - An array containing the layouted nodes and edges.
 */
export default function useLayout() {
	const { getNodes, getEdges } = useReactFlow(); // Access React Flow's nodes and edges
	const nodesInitialized = useNodesInitialized(options); // Track whether nodes have been initialized
	const [layout, setLayout] = useState({ nodes: [], edges: [] }); // State to store layouted nodes and edges

	useEffect(() => {
		if (nodesInitialized) {
			// Function to layout nodes and update state
			const layoutNodes = async () => {
				const currentNodes = getNodes();
				const currentEdges = getEdges();

				// Perform layout and update the layout state
				const layoutedNodes = await getLayoutedNodes(currentNodes, currentEdges);
				setLayout({ nodes: layoutedNodes, edges: currentEdges });
			};

			layoutNodes(); // Trigger the async layout function when nodes are initialized
		}
	}, [nodesInitialized, getNodes, getEdges]);

	return [layout]; // Return the layouted nodes and edges
}
