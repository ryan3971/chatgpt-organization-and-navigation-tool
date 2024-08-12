import { Background, Controls, MiniMap, ReactFlow, useEdgesState, useNodesState } from "@xyflow/react";

import { initialNodes, nodeTypes } from "./nodes/Nodes.jsx";
import { initialEdges, edgeTypes } from "./edges/Edges.jsx";

import "@xyflow/react/dist/style.css";


const Flow = () => {
	const [nodes, , onNodesChange] = useNodesState(initialNodes);
	const [edges, , onEdgesChange] = useEdgesState(initialEdges);

	return (
		<div style={{ height: "800vw", width: "100vw" }}>
			<ReactFlow
				nodes={nodes}
				nodeTypes={nodeTypes}
				onNodesChange={onNodesChange}
				edges={edges}
				edgeTypes={edgeTypes}
				onEdgesChange={onEdgesChange}
			>
				<MiniMap />
				<Controls />
				<Background />
			</ReactFlow>
		</div>
	);
};

export default Flow;
