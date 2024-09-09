/*global chrome*/
import {
	Background,
	BackgroundVariant,
	Controls,
	MiniMap,
	ReactFlow,
	useEdgesState,
	useNodesState,
	useReactFlow,
	getConnectedEdges,
	useOnSelectionChange,
} from "@xyflow/react";
import PropTypes from "prop-types";
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

const Flow = ({ activeSpace, handleUpdateNodeSpaces, handleUpdateActiveSpace }) => {
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
		// Fetch node and edge data for the active space
		sendMessageToBackground(Constants.GET_NODE_SPACE_DATA, { space_id: activeSpace })
			.then((response) => {
				if (!response.status) {
					showToast("Error retrieving node data", "error");
					return;
				}

				const { nodesData, edgesData } = transformStorageData(response.data);
				setNodes(nodesData);
				setEdges(edgesData);
			})
			.catch((error) => {
				console.error("Unexpected error while retrieving node data:", error);
				showToast("An unexpected error occurred", "error");
			});
	}, [activeSpace, setNodes, setEdges]);

	// useEffect to sync with the Chrome storage
	useEffect(() => {
		// Handle storage changes and update the nodes/edges or node spaces accordingly
		function handleStorageChange(changes, namespace) {
			for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
				switch (key) {
					case Constants.NODE_SPACES_KEY:
						if (!newValue) {
							// If the node spaces are updated
							handleUpdateNodeSpaces([]);
							setNodes([]);
							setEdges([]);
						} else {
							// If the node spaces are deleted
							handleUpdateNodeSpaces(newValue);
						}
						break;
					case activeSpace: {
						if (!newValue) {
							// If the active space is deleted
							handleUpdateActiveSpace(null);
							setNodes([]);
							setEdges([]);
						} else {
							// If the active space is updated
							const { nodesData, edgesData } = transformStorageData(newValue);
							setNodes(nodesData);
							setEdges(edgesData);
						}
						break;
					}
					default:
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
	}, [activeSpace, handleUpdateNodeSpaces, handleUpdateActiveSpace, setNodes, setEdges]);

	// Callback to handle selection changes in nodes
	const onChange = useCallback(
		({ nodes }) => {
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
				fitView({ padding: 1, maxZoom: 1.5 });
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
		}
	}, [forceRender, nodes, edges, setEdges, setNodes]);

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
				<MiniMap className="" />
				<Controls className="" />
				<Background
					className="bg-white"
					variant={BackgroundVariant.Dots}
				/>
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

Flow.propTypes = {
	activeSpace: PropTypes.string,
	handleUpdateNodeSpaces: PropTypes.func,
	handleUpdateActiveSpace: PropTypes.func,
};