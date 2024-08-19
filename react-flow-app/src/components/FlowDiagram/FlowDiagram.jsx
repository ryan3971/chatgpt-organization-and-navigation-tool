/*global chrome*/
import { Background, Controls, MiniMap, ReactFlow, useEdgesState, useNodesState, Panel } from "@xyflow/react";
import { useEffect, useRef, useCallback } from "react";
import "@xyflow/react/dist/style.css";

import CustomNode from "./nodes/CustomNode/CustomNode";
import { transformStorageData } from "../../util/transformData";

import sampleData from "./sampleData";

import { getLayoutedElements } from "./layouting/AutoLayout";

import "@xyflow/react/dist/style.css";

import { useNodeContextMenu } from "../../hooks/useNodeContextMenu";
import NodeContextMenu from "./context_menu/NodeContextMenu";

import * as Constants from "../../util/constants";
import { sendMessageToBackground } from "../../util/chromeMessagingService";

const nodeTypes = {
	"custom-node": CustomNode,
};

//const { nodesData, edgesData } = transformStorageData(sampleData);

const Flow = ({ nodeSpaces, activeSpace, handleUpdateNodeSpaces }) => {
	const [nodes, setNodes, onNodesChange] = useNodesState([]);
	const [edges, setEdges, onEdgesChange] = useEdgesState([]);
	const ref = useRef(null);

	const [menu, { onNodeContextMenu, onPaneClick }] = useNodeContextMenu(ref, null);

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
	// useEffect(() => {
	// 	// Update the diagram with the new data
	// 	const { nodesData, edgesData } = transformStorageData(sampleData);

	// 	setNodes(nodesData);
	// 	setEdges(edgesData);
	// }, [setNodes, setEdges]);

	const onAutoLayout = useCallback(
		(direction) => {
			console.log(nodes);
			const layouted = getLayoutedElements(nodes, edges, { direction });

			setNodes([...layouted.nodes]);
			setEdges([...layouted.edges]);
		},
		[nodes, edges, setNodes, setEdges]
	);

	return (
		<div style={{ height: "800vw", width: "100vw" }}>
			<ReactFlow
				ref={ref}
				nodes={nodes}
				nodeTypes={nodeTypes}
				onNodesChange={onNodesChange}
				edges={edges}
				onEdgesChange={onEdgesChange}
				onNodeContextMenu={onNodeContextMenu}
				onPaneClick={onPaneClick}
			>
				<MiniMap />
				<Controls />
				<Background color="#ffffff" />
				{menu && <NodeContextMenu onClick={onPaneClick} {...menu} />}
				<Panel position="top-right">
					<button onClick={() => onAutoLayout("TB")}>vertical layout</button>
					<button onClick={() => onAutoLayout("LR")}>horizontal layout</button>
				</Panel>
			</ReactFlow>
		</div>
	);
};

export default Flow;
