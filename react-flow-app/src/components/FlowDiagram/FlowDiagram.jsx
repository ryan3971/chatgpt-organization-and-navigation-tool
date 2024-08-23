/*global chrome*/
import { Background, Controls, MiniMap, ReactFlow, useEdgesState, useNodesState, useReactFlow } from "@xyflow/react";
import { useEffect, useRef, useCallback } from "react";
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

	const [menu, { onNodeContextMenu, onPaneClick }] = useNodeContextMenu(ref, null);
	const [layout] = useLayout(); // Use the updated hook
	const { fitView } = useReactFlow();

	const onInit = useCallback(() => {
		// // Update the diagram with the new data
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
				console.error("Error retrieving node data");
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

	useEffect(() => {
		if (layout) {
			setNodes(layout.nodes);
			setEdges(layout.edges);

			window.requestAnimationFrame(() => {
				fitView().then((response) => {
					console.log("Fit view response", response);
				});
			});
		}
	}, [layout, fitView, setNodes, setEdges]);

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
				onPaneClick={onPaneClick}
				onInit={onInit}
			>
				<MiniMap />
				<Controls />
				<Background />
				{menu && (
					<NodeContextMenu
						onClick={onPaneClick}
						{...menu}
					/>
				)}
			</ReactFlow>
		</div>
	);
};

export default Flow;
