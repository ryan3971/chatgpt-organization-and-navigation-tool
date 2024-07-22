import React, { useState, useCallback, useEffect } from "react";
import {
	ReactFlow,
	MiniMap,
	Panel,
	Controls,
	Background,
	useNodesState,
	useEdgesState,
	addEdge,
	useOnSelectionChange,
	applyNodeChanges,
	applyEdgeChanges,
} from "@xyflow/react";

import dagre from "dagre";
import "@xyflow/react/dist/style.css";

import "./components/CustomNode/CustomNode.css";
import customNode from "./components/CustomNode/CustomNode";

import { loadFlowData, saveFlowData, getAdditionalNodeProperties, updateNodeProperties, updateEdgeProperties } from "./backend/chromeStorage";

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
const nodeTypes = { customNode: customNode };

const initialEdges = [];

let nodeId = 2;

// The getLayoutedElements function is used to layout the nodes and edges using the dagre library. It takes the nodes and edges arrays as input and returns the layouted nodes and edges.
const getLayoutedElements = (nodes, edges, direction = "TB") => {
	console.log("Layouting elements with direction:", direction);

	// we create a new dagre graph with the direction
	const isHorizontal = direction === "LR";
	dagreGraph.setGraph({ rankdir: direction });

	// we need to pass a copy of the nodes to dagre.
	nodes.forEach((node) => {
		const { width, height } = node.data.dimensions || { width: nodeWidth, height: nodeHeight };
		dagreGraph.setNode(node.id, { width, height });
	});

	edges.forEach((edge) => {
		dagreGraph.setEdge(edge.source, edge.target);
	});

	dagre.layout(dagreGraph);

	// we need to update the nodes with the calculated positions
	const newNodes = nodes.map((node) => {
		const nodeWithPosition = dagreGraph.node(node.id);
		const newNode = {
			...node,
			targetPosition: isHorizontal ? "left" : "top",
			sourcePosition: isHorizontal ? "right" : "bottom",
			// We are shifting the dagre node position (anchor=center center) to the top left
			// so it matches the React Flow node anchor point (top left).
			position: {
				x: nodeWithPosition.x - (node.data.dimensions?.width || nodeWidth) / 2,
				y: nodeWithPosition.y - (node.data.dimensions?.height || nodeHeight) / 2,
			},
		};

		return newNode;
	});

	return { nodes: newNodes, edges };
};

// Layout the initial nodes and edges
const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(initialNodes, initialEdges);

const Flow = ({ togglePanel }) => {
	/*The useNodesState and useEdgesState hooks are used to manage the nodes and edges arrays. The onNodesChange and onEdgesChange callbacks are called whenever the nodes or edges arrays change.
  The initialNodes and initialEdges arrays are used to initialize the nodes and edges arrays.
  The setNodes and setEdges functions are used to update the nodes and edges arrays.
  The nodes and edges arrays are passed as props to the ReactFlow component.
  */
	const [nodes, setNodes] = useNodesState(initialNodes);
	const [edges, setEdges] = useEdgesState(initialEdges);
	const [selectedNode, setSelectedNode] = useState(null);

	const [nodeProperties, setNodeProperties] = useState({});
	const [edgeProperties, setEdgeProperties] = useState({});
	const [selectedNodeAdditionalProperties, setSelectedNodeAdditionalProperties] = useState(null);

	// The useEffect hook is used to load the flow data from the Chrome storage when the component mounts. It sets the nodes and edges arrays, as well as the nodeProperties and edgeProperties objects.
	useEffect(() => {
		console.log("Loading flow data");
		loadFlowData()
			.then((data) => {
				if (data) {
					setNodes(data.nodes || []);
					setEdges(data.edges || []);
					setNodeProperties(data.properties.nodes || {});
					setEdgeProperties(data.properties.edges || {});
				}
			})
			.catch((error) => {
				console.error(error);
			});
	}, []);

	// The applyNodeChanges function is used to apply the changes to the nodes array. It takes the changes and the nodes array as input and returns the updated nodes array.
	const onNodesChange = (changes) => {
		console.log("Nodes change:", changes);
		setNodes((nds) => {
			const updatedNodes = applyNodeChanges(changes, nds);
			saveFlowData(updatedNodes, edges, { nodes: nodeProperties, edges: edgeProperties }).catch(console.error);
			return updatedNodes;
		});
	};

	// The applyEdgeChanges function is used to apply the changes to the edges array. It takes the changes and the edges array as input and returns the updated edges array.
	const onEdgesChange = (changes) => {
		console.log("Edges change:", changes);
		setEdges((eds) => {
			const updatedEdges = applyEdgeChanges(changes, eds);
			saveFlowData(nodes, updatedEdges, { nodes: nodeProperties, edges: edgeProperties }).catch(console.error);
			return updatedEdges;
		});
	};

	// The onConnect function is called when a connection is created between two nodes. It adds the new edge to the edges array and saves the flow data to the Chrome storage.
	const onConnect = (connection) => {
		console.log("onConnect", connection);
		setEdges((eds) => {
			const updatedEdges = addEdge(connection, eds);
			saveFlowData(nodes, updatedEdges, { nodes: nodeProperties, edges: edgeProperties }).catch(console.error);
			return updatedEdges;
		});
	};

	// The onNodeClick function is called when a node is clicked. It sets the selected node and retrieves the additional properties for the node from the Chrome storage.
	const onNodeClick = useCallback((event, node) => {
		console.log("Selected node:", node);
		setSelectedNode(node);
		getAdditionalNodeProperties(node.id)
			.then((additionalProperties) => {
				setSelectedNodeAdditionalProperties(additionalProperties);
			})
			.catch((error) => {
				console.error(error);
			});
	}, []);

	// The applyNodeChanges function is used to apply the changes to the nodes array. It takes the changes and the nodes array as input and returns the updated nodes array.
	const handleUpdateNodeProperty = (id, property) => {
		console.log("Updating node property:", id, property);
		updateNodeProperties(id, property)
			.then(() => {
				setNodeProperties((props) => ({
					...props,
					[id]: { ...props[id], additional: { ...props[id].additional, ...property } },
				}));
			})
			.catch(console.error);
	};

	// The applyEdgeChanges function is used to apply the changes to the edges array. It takes the changes and the edges array as input and returns the updated edges array.
	const handleUpdateEdgeProperty = (id, property) => {
		console.log("Updating edge property:", id, property);
		updateEdgeProperties(id, property)
			.then(() => {
				setEdgeProperties((props) => ({
					...props,
					[id]: { ...props[id], additional: { ...props[id].additional, ...property } },
				}));
			})
			.catch(console.error);
	};

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

	// The onLayout function is called when the vertical or horizontal layout buttons are clicked. It layouts the nodes and edges in the specified direction.
	const onLayout = useCallback(
		(direction) => {
			const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges, direction);

			setNodes([...layoutedNodes]);
			setEdges([...layoutedEdges]);
		},
		[nodes, edges]
	);

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
				onNodeClick={onNodeClick}
				nodeTypes={nodeTypes}
			>
				<Panel position="top-right">
					<button onClick={addNode} disabled={!selectedNode}>
						Add Node
					</button>
					<button onClick={() => onLayout("TB")}>vertical layout</button>
					<button onClick={() => onLayout("LR")}>horizontal layout</button>
				</Panel>
				{contextMenu && (
					<ContextMenu x={contextMenu.x} y={contextMenu.y} onDelete={deleteNode} />
				)}
				<Controls />
				<MiniMap />
				<Background variant="dots" gap={12} size={1} />
			</ReactFlow>
			{selectedNode && selectedNodeAdditionalProperties && (
				<div>
					<h3>Additional Properties for {selectedNode.data.label}</h3>
					<pre>{JSON.stringify(selectedNodeAdditionalProperties, null, 2)}</pre>
					{/* UI to update properties */}
					<button onClick={() => handleUpdateNodeProperty(selectedNode.id, { customProperty: "newValue" })}>Update Property</button>
				</div>
			)}
		</div>
	);
};

export default Flow;