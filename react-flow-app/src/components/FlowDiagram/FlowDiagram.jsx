import { Background, Controls, MiniMap, ReactFlow, useEdgesState, useNodesState, useReactFlow, Panel } from "@xyflow/react";
import React, { useEffect, useCallback } from "react";
import "@xyflow/react/dist/style.css";

import CustomNode from "./nodes/CustomNode/CustomNode";
import {transformStorageData} from "./helper/transformData";

import sampleData from "./sampleData";

import getLayoutedElements from "./helper/setLayout";

import "@xyflow/react/dist/style.css";


export const nodeTypes = {
	"custom-node": CustomNode,
};

//const { nodesData, edgesData } = transformStorageData(sampleData);

const Flow = () => {
	const [nodes, setNodes, onNodesChange] = useNodesState([]);
	const [edges, setEdges, onEdgesChange] = useEdgesState([]);


	const onLayout = useCallback(
		(direction) => {
			console.log(nodes);
			const layouted = getLayoutedElements(nodes, edges, { direction });

			setNodes([...layouted.nodes]);
			setEdges([...layouted.edges]);

		},
		[nodes, edges]
	);

	// Function to update the diagram with new nodes and edges
	const updateDiagram = (storageData) => {
		const { nodesData, edgesData } = transformStorageData(storageData);
		
		setNodes(nodesData);
		setEdges(edgesData);

	};

  // Listen for changes in Chrome storage
	useEffect(() => {
		// Update the diagram with the new data
		updateDiagram(sampleData);

	}, []);



	return (
		<div style={{ height: "800vw", width: "100vw" }}>
			<ReactFlow nodes={nodes} nodeTypes={nodeTypes} onNodesChange={onNodesChange} edges={edges} onEdgesChange={onEdgesChange}>
				<MiniMap />
				<Controls />
				<Background color="#ffffff"/>
				<Panel position="top-right">
					<button onClick={() => onLayout("TB")}>vertical layout</button>
					<button onClick={() => onLayout("LR")}>horizontal layout</button>
				</Panel>
			</ReactFlow>
		</div>
	);
};

export default Flow;
