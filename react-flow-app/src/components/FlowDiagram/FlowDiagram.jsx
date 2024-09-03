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
import sampleData_2 from "./sampleData_2";

import { useNodeContextMenu } from "../../hooks/useNodeContextMenu";
import NodeContextMenu from "./context_menu/NodeContextMenu";

import * as Constants from "../../util/constants";
import { sendMessageToBackground } from "../../util/chromeMessagingService";

import useLayout from "../../hooks/useLayout";
import { showToast } from "../toast/toastService"; // Ensure the correct path to your toast function

const nodeTypes = {
	"custom-node": CustomNode,
};

const edgeTypes = {
	"custom-edge": CustomEdge,
};

const Flow = ({ activeSpace, handleUpdateNodeSpaces }) => {
	// State hooks for nodes and edges
	const [nodes, setNodes, onNodesChange] = useNodesState([]);
	const [edges, setEdges, onEdgesChange] = useEdgesState([]);
	const ref = useRef(null);

	// State hooks for managing the context menu and layout
	const [menu, { onNodeContextMenu, onCloseContextMenu }] = useNodeContextMenu(ref, null);
	const [layout] = useLayout();
	const { fitView } = useReactFlow();

	// State hooks for selected nodes and force render control
	const [selectedNodes, setSelectedNodes] = useState([]);
	const [forceRender, setForceRender] = useState(false);

	// useEffect to fetch node data from the Chrome storage using the activeSpace key
	useEffect(() => {
		if (!activeSpace) {
			return;
		}
		console.log("Getting node data for space", activeSpace);

		// Fetch node and edge data for the active space
		sendMessageToBackground(Constants.GET_NODE_SPACE_DATA, { space_id: activeSpace })
			.then((response) => {
				if (!response.status) {
					showToast("Error retrieving node data", { type: "error" });
					return;
				}

				const { nodesData, edgesData } = transformStorageData(response.data);
				setNodes(nodesData);
				setEdges(edgesData);
				console.log("Set the nodes and edges from storage data");
			})
			.catch((error) => {
				console.error("Unexpected error while retrieving node data:", error);
				showToast("An unexpected error occurred", { type: "error" });
			});
	}, [activeSpace, setNodes, setEdges]);

	// useEffect to sync with the Chrome storage
	useEffect(() => {
		// Handle storage changes and update the nodes/edges or node spaces accordingly
		function handleStorageChange(changes, namespace) {
			for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
				console.log(`Storage key "${key}" in namespace "${namespace}" changed.`, `Old value was "${oldValue}", new value is "${newValue}".`);

				switch (key) {
					case Constants.NODE_SPACES_KEY:
						if (newValue) {
							handleUpdateNodeSpaces(newValue);
						} else {
							handleUpdateNodeSpaces([]);
							setNodes([]);
							setEdges([]);
						}
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

		// Add the storage listener when the component mounts
		chrome.storage.onChanged.addListener(handleStorageChange);

		// Cleanup the storage listener when the component unmounts
		return () => {
			chrome.storage.onChanged.removeListener(handleStorageChange);
		};
	}, [activeSpace, handleUpdateNodeSpaces, setNodes, setEdges]);

	// Callback to handle selection changes in nodes
	const onChange = useCallback(
		({ nodes }) => {
			console.log("useOnSelectionChange");

			// Helper function to update the selected state of edges
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

			// Deselect edges connected to the previously selected nodes
			let connectedEdges = getConnectedEdges(selectedNodes, edges);
			let updatedEdges = updateSelectedEdges(edges, connectedEdges, false);

			// Select edges connected to the newly selected nodes
			connectedEdges = getConnectedEdges(nodes, edges);
			updatedEdges = updateSelectedEdges(updatedEdges, connectedEdges, true);

			// Update the edges and selected nodes state
			setEdges(updatedEdges);
			setSelectedNodes(nodes);
		},
		[selectedNodes, edges, setEdges, setSelectedNodes]
	);

	useOnSelectionChange({ onChange });

	// useEffect to update the diagram when the layout changes
	useEffect(() => {
		if (layout) {
			setNodes(layout.nodes);
			setEdges(layout.edges);

			// Fit the view to the new layout
			window.requestAnimationFrame(() => {
				fitView({ padding: 1, maxZoom: 1.5 }).then(() => console.log("Fitview called"));
				setForceRender(true);
			});
		}
	}, [layout, fitView, setNodes, setEdges]);

	// useEffect to force a render when required
	useEffect(() => {
		if (forceRender) {
			setNodes(nodes);
			setEdges(edges);
			setForceRender(false);
			console.log("Forced render");
		}
	}, [forceRender, nodes, edges, setEdges, setNodes]);

	// // useEffect to listen for clicks outside of nodes to close the context menu
	// useEffect(() => {
	// 	// Function to close the context menu when a click is detected outside
	// 	const handleOutsideClick = () => {
	// 		console.log("Clicked outside");
	// 		onCloseContextMenu(); // Close the context menu
	// 	};

	// 	// Listen for mousedown events
	// 	window.addEventListener("mousedown", handleOutsideClick, true);

	// 	// Cleanup the event listener on component unmount
	// 	return () => {
	// 		window.removeEventListener("mousedown", handleOutsideClick, true);
	// 	};
	// }, [onCloseContextMenu]);

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
