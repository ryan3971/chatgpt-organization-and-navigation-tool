import React, { useState, useCallback } from "react";
import {
	ReactFlow,
	ReactFlowProvider,
	MiniMap,
  Panel,
	Controls,
	Background,
	useNodesState,
	useEdgesState,
	addEdge,
	useOnSelectionChange,
} from "@xyflow/react";

import dagre from "dagre";

import "@xyflow/react/dist/style.css";
import "./custom-node.css";

import customNode from "./CustomNode";

import SidePanel from './SidePanel';
import './SidePanel.css'; // Ensure the path is correct

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 172;
const nodeHeight = 36;

const initialNodes = [
	{
		id: "1",
		type: "customNode",
		// set the label of the node
		data: { label: "Node 1" },
		position: { x: 250, y: 0 },
	},
];
// we define the nodeTypes outside of the component to prevent re-renderings
// you could also use useMemo inside the component
const nodeTypes = { customNode: customNode};


const initialEdges = [];

let nodeId = 2;

const getLayoutedElements = (nodes, edges, direction = "TB") => {
	const isHorizontal = direction === "LR";
	dagreGraph.setGraph({ rankdir: direction });

	nodes.forEach((node) => {
		dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
	});

	edges.forEach((edge) => {
		dagreGraph.setEdge(edge.source, edge.target);
	});

	dagre.layout(dagreGraph);

	const newNodes = nodes.map((node) => {
		const nodeWithPosition = dagreGraph.node(node.id);
		const newNode = {
			...node,
			targetPosition: isHorizontal ? "left" : "top",
			sourcePosition: isHorizontal ? "right" : "bottom",
			// We are shifting the dagre node position (anchor=center center) to the top left
			// so it matches the React Flow node anchor point (top left).
			position: {
				x: nodeWithPosition.x - nodeWidth / 2,
				y: nodeWithPosition.y - nodeHeight / 2,
			},
		};

		return newNode;
	});

	return { nodes: newNodes, edges };
};

const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(initialNodes, initialEdges);

const Flow = () => {
	/*The useNodesState and useEdgesState hooks are used to manage the nodes and edges arrays. The onNodesChange and onEdgesChange callbacks are called whenever the nodes or edges arrays change.
  The initialNodes and initialEdges arrays are used to initialize the nodes and edges arrays.
  The setNodes and setEdges functions are used to update the nodes and edges arrays.
  The nodes and edges arrays are passed as props to the ReactFlow component.
  */
	const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
	const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
	const [selectedNode, setSelectedNode] = useState(null);
  	const [isPanelOpen, setIsPanelOpen] = useState(false);

	console.log("Selected node:", selectedNode);

	// The onConnect callback is called whenever a new edge is created. It adds the new edge to the edges array.
	const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

	// The onSelectionChange hook is used to listen to the selection change event. The onChange callback is called whenever the selection changes.
	const onChange = useCallback(({ nodes }) => {
		console.log("Selected node 2:", selectedNode);
		if (nodes.length === 0) {
			setSelectedNode(null);
		} else {
			setSelectedNode(nodes[0]);
		}
	});

	// The useOnSelectionChange hook is used to listen to the selection change event. The onChange callback is called whenever the selection changes.
	useOnSelectionChange({
		onChange,
	});

	// The addNode function is called when the Add Node button is clicked. It creates a new node and edge and adds them to the nodes and edges arrays.
	const addNode = () => {
		if (!selectedNode) return;

		// Create a new node
		const newNode = {
			id: `${nodeId++}`,
			type: "customNode",
			data: { label: `Node ${nodeId}` },
			position: { x: selectedNode.position.x + 100, y: selectedNode.position.y + 100 },
		};

		// Create a new edge
		const newEdge = {
			id: `e${selectedNode.id}-${newNode.id}`,
			source: selectedNode.id,
			target: newNode.id,
		};

		// Add the new node and edge to the nodes and edges arrays
		setNodes((nds) => nds.concat(newNode));
		setEdges((eds) => eds.concat(newEdge));
	};

	const onLayout = useCallback(
		(direction) => {
			const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges, direction);

			setNodes([...layoutedNodes]);
			setEdges([...layoutedEdges]);
		},
		[nodes, edges]
	);

	const togglePanel = () => {
		setIsPanelOpen(!isPanelOpen);
	};

	// The Flow component renders the ReactFlow component with the nodes and edges arrays as props. It also renders the Controls, MiniMap, and Background components.
	return (
		<div style={{ width: "100vw", height: "100vh" }}>
			<button onClick={togglePanel} style={{ marginLeft: "10px" }}>
				Toggle Side Panel
			</button>
			<ReactFlow
				nodes={nodes}
				edges={edges}
				onNodesChange={onNodesChange}
				onEdgesChange={onEdgesChange}
				onConnect={onConnect}
				onNodeClick={(event, node) => setSelectedNode(node)}
				nodeTypes={nodeTypes}
			>
				<Panel position="top-right">
					<button onClick={addNode} disabled={!selectedNode}>
						Add Node
					</button>
					<button onClick={() => onLayout("TB")}>vertical layout</button>
					<button onClick={() => onLayout("LR")}>horizontal layout</button>
				</Panel>
				<Controls />
				<MiniMap />
				<Background variant="dots" gap={12} size={1} />
			</ReactFlow>
			<SidePanel isOpen={isPanelOpen} onClose={togglePanel} />
		</div>
	);
};

// The App component is wrapped with ReactFlowProvider to provide the context to the Flow component. This is necessary to use the hooks provided by the library (onSelectionChange)
const App = () => (
	<ReactFlowProvider>
		<Flow />
	</ReactFlowProvider>
);

export default App;
