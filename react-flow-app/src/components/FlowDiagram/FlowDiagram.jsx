/*global chrome*/
import {
	Background,
	Controls,
	MiniMap,
	ReactFlow,
	useEdgesState,
	useNodesState,
	useReactFlow,
	getConnectedEdges,
	useOnSelectionChange,
} from "@xyflow/react";
import { useState, useEffect, useRef, useCallback } from "react";
import "@xyflow/react/dist/style.css";

import CustomNode from "./nodes/CustomNode/CustomNode";
import CustomEdge from "./edges/CustomEdge/CustomEdge";
import { transformStorageData } from "../../util/transformData";

import sampleData from "./sampleData";

import { useNodeContextMenu } from "../../hooks/useNodeContextMenu";
import NodeContextMenu from "./context_menu/NodeContextMenu";

import * as Constants from "../../util/constants";
import { sendMessageToBackground } from "../../util/chromeMessagingService";

import "@xyflow/react/dist/style.css";
import useLayout from "../../hooks/useLayout";

import { showToast } from "../toast/toastService"; // Ensure the correct path to your toast function

const nodeTypes = {
	"custom-node": CustomNode,
};

const edgeTypes = {
	"custom-edge": CustomEdge,
};

const Flow = ({ activeSpace, handleUpdateNodeSpaces }) => {
	const [nodes, setNodes, onNodesChange] = useNodesState([]);
	const [edges, setEdges, onEdgesChange] = useEdgesState([]);
	const ref = useRef(null);

	const [menu, { onNodeContextMenu, onCloseContextMenu }] = useNodeContextMenu(ref, null);
	const [layout] = useLayout(); // Use the updated hook
	const { fitView } = useReactFlow();

	const [selectedNodes, setSelectedNodes] = useState([]);

	const onInit = useCallback(() => {
		// Update the diagram with the new data
		// const { nodesData, edgesData } = transformStorageData(sampleData);

		// setNodes(nodesData);
		// setEdges(edgesData);
	}, [setNodes, setEdges]);

	// useEffect to get the node data from the Chrome storage using the activeSpace key
	useEffect(() => {
		if (!activeSpace) {return;}
		console.log("Getting node data for space", activeSpace);
		sendMessageToBackground(Constants.GET_NODE_SPACE_DATA, { space_id: activeSpace }).then((response) => {
			if (!response.status) {
				showToast("Error retrieving node data", { type: "error" });
				return;
			}

			const { nodesData, edgesData } = transformStorageData(response.data);

			setNodes(nodesData);
			setEdges(edgesData);
		});
	}, [activeSpace, setNodes, setEdges]);

	// useEffect to sync with the Chrome storage
	useEffect(() => {
		function handleStorageChange(changes, namespace) {
			for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
				console.log(`Storage key "${key}" in namespace "${namespace}" changed.`, `Old value was "${oldValue}", new value is "${newValue}".`);
				console.log(newValue);

				switch (key) {
					case Constants.NODE_SPACES_KEY:
						handleUpdateNodeSpaces(newValue);
						break;
					case activeSpace: {
						const { nodesData, edgesData } = transformStorageData(newValue);
						setNodes(nodesData);
						setEdges(edgesData);
						break;
					}
					default:
						console.log("Change to storage does not impact current render");
						break;
				}
			}
		}
		// Add the listener when the component mounts
		chrome.storage.onChanged.addListener(handleStorageChange);

		// Remove the listener when the component unmounts
		return () => {
			chrome.storage.onChanged.removeListener(handleStorageChange);
		};
	}, [activeSpace, handleUpdateNodeSpaces, setNodes, setEdges]);

	// Listen for changes in Chrome storage

	// the passed handler has to be memoized, otherwise the hook will not work correctly
	// For nodes, returns an array of selected nodes (either empty or selected node)
	// Code is a little ugly and confusing but it works
	const onChange = useCallback(({ nodes }) => {

		console.log("useOnSelectionChange")

		function updateSelectedEdges(updatedEdges, connectedEdges, isEdgeSelected) {
			return updatedEdges.map((edge) => {
				if (connectedEdges.some((connect) => connect.id === edge.id)) {
					return {
						...edge,
						data: {
							...edge.data,
							isSelected: isEdgeSelected,
						},
					};
				}
				return edge;
			});
		}
		// Reset the previously selected edges
		let connectedEdges = getConnectedEdges(selectedNodes, edges); // Get the edges connected to the previously selected nodes
		let updatedEdges = updateSelectedEdges(edges, connectedEdges, false); // Deselect those edges

		// Select the newly selected edges
		connectedEdges = getConnectedEdges(nodes, edges); // Get the edges connected to the newly selected nodes
		updatedEdges = updateSelectedEdges(updatedEdges, connectedEdges, true); // Select those edges

		setEdges(updatedEdges); // Finally, update the edges state with all modifications
		setSelectedNodes(nodes);
	},
		[selectedNodes, edges, setEdges, setSelectedNodes]
	);

	useOnSelectionChange({
		onChange,
	});

	// Update the diagram when the layout changes
	useEffect(() => {
		if (layout) {
			setNodes(layout.nodes);
			setEdges(layout.edges);

			window.requestAnimationFrame(() => {
				fitView({ padding: 0.2, maxZoom: 10 });
			});
			console.log("Nodes: ", layout.nodes);
			console.log("Edges: ", layout.edges);
		}
	}, [layout, fitView, setNodes, setEdges]);

	// listen for clicks made outside of a node
	useEffect(() => {
		// Function to close the context menu when a click is detected outside
		const handleOutsideClick = () => {
			console.log("Clicked outside");
		};

		// Listen for mousedown events
		window.addEventListener("mousedown", handleOutsideClick, true);

		// Cleanup the event listener on component unmount
		return () => {
			document.removeEventListener("mousedown", handleOutsideClick, true);
		};
	}, [onCloseContextMenu]);

	return (
		<div className="w-screen h-screen">
			<ReactFlow
				ref={ref}
				nodes={nodes}
				nodeTypes={nodeTypes}
				onNodesChange={onNodesChange}
				edges={edges}
				edgeTypes={edgeTypes}
				onEdgesChange={onEdgesChange}
				onNodeContextMenu={onNodeContextMenu}
				onPaneClick={onCloseContextMenu}
				onInit={onInit}
			>
				<MiniMap />
				<Controls />
				<Background />
				{menu && (
					<NodeContextMenu
						onCloseContextMenu={onCloseContextMenu}
						{...menu}
					/>
				)}
			</ReactFlow>
		</div>
	);
};

export default Flow;
