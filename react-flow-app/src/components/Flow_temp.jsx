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

import customNode from "./components/CustomNode/CustomNode";
import { loadFlowData, saveFlowData, getAdditionalNodeProperties, updateNodeProperties, updateEdgeProperties } from "./backend/chromeStorage";

import ContextMenu from "./components/ContextMenu/ContextMenu";
import "./components/CustomNode/CustomNode.css";

// Graph layout configuration
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));
const nodeWidth = 172;
const nodeHeight = 36;

// Initial node and edge data
const initialNodes = [
	{
		id: "1",
		type: "customNode",
		data: { label: "Node 1" },
		position: { x: 250, y: 0 },
	},
];

// we define the nodeTypes outside of the component to prevent re-renderings
const initialEdges = [];
const nodeTypes = { customNode: customNode };
let nodeId = 2;

// Helper function to layout elements
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
//const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(initialNodes, initialEdges);

const Flow = ({ togglePanel }) => {
	const [nodes, setNodes] = useNodesState(initialNodes);
	const [edges, setEdges] = useEdgesState(initialEdges);
	const [selectedNode, setSelectedNode] = useState(null);
	const [nodeProperties, setNodeProperties] = useState({});
	const [edgeProperties, setEdgeProperties] = useState({});
	const [selectedNodeAdditionalProperties, setSelectedNodeAdditionalProperties] = useState(null);
	const [contextMenu, setContextMenu] = useState(null);

	const isDragging = useRef(false);

	// TODO: change when this is called. Should only be called when the app first loads
	useEffect(() => {
		console.log("useEffect -> Loading flow data");

		const loadInitialData = async () => {
			const data = await loadFlowData();
			if (data) {
				setNodes(data.nodes || []);
				setEdges(data.edges || []);
				setNodeProperties(data.properties.nodes || {});
				setEdgeProperties(data.properties.edges || {});
			} else {
				console.log("No flow data found");
			}
		};

		loadInitialData();
	}, [setNodes, setEdges]); // added setNodes, setEdges as dependencies

	// The addNode function is called when the Add Node button is clicked. It creates a new node and edge and adds them to the nodes and edges arrays.
	const addNode = useCallback(() => {
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
	}, [setNodes, setEdges, selectedNode]);

	// The onConnect callback function is called when a connection is made between two nodes. It adds the new edge to the edges array and saves the flow data to the Chrome storage.
	// TODO: callback dependencies
	const onConnect = useCallback((connection) => {
		console.log("onConnect", connection);
		setEdges((eds) => {
			const updatedEdges = addEdge(connection, eds);
			saveFlowData(nodes, updatedEdges, { nodes: nodeProperties, edges: edgeProperties }).catch(console.error);
			return updatedEdges;
		});
	});

	/*
    Used in the context of the React Flow library to handle the event when one or more nodes are deleted from the graph. 
    This function is called automatically by React Flow when a delete action is performed on nodes, such as through user interaction (e.g., pressing the delete key).
    */
	const onNodesDelete = useCallback(
		(nodesToDelete) => {
			setNodes((nds) => nds.filter((node) => !nodesToDelete.includes(node)));
		},
		[setNodes]
	);

	const onEdgesDelete = useCallback(
		(edgesToDelete) => {
			setEdges((eds) => eds.filter((edge) => !edgesToDelete.includes(edge)));
		},
		[setEdges]
	);

	// The applyNodeChanges function is used to apply the changes to the nodes array. It takes the changes and the nodes array as input and returns the updated nodes array.\
	// TODO - assess commented code
	// const onNodesChange = (changes) => {
	// 	console.log("Nodes change:", changes);
	// 	setNodes((nds) => {
	// 		const updatedNodes = applyNodeChanges(changes, nds);
	// 		if (!isDragging.current) {
	// 			saveFlowData(updatedNodes, edges, { nodes: nodeProperties, edges: edgeProperties }).catch(console.error);
	// 		}
	// 		return updatedNodes;
	// 	});
	// };

	// The applyEdgeChanges function is used to apply the changes to the edges array. It takes the changes and the edges array as input and returns the updated edges array.
    // TODO - assess commented code
	// const onEdgesChange = (changes) => {
	// 	console.log("Edges change:", changes);
	// 	setEdges((eds) => {
	// 		const updatedEdges = applyEdgeChanges(changes, eds);
	// 		saveFlowData(nodes, updatedEdges, { nodes: nodeProperties, edges: edgeProperties }).catch(console.error);
	// 		return updatedEdges;
	// 	});
	// };

	// The onLayout function is called when the vertical or horizontal layout buttons are clicked. It layouts the nodes and edges in the specified direction.
	// TODO - callback dependencies
	const onLayout = useCallback((direction) => {
		const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges, direction);

		setNodes([...layoutedNodes]);
		setEdges([...layoutedEdges]);
		// Save the layouted nodes and edges to the Chrome storage
		saveFlowData(layoutedNodes, layoutedEdges, { nodes: nodeProperties, edges: edgeProperties }).catch(console.error);
	}, []);

	// The useOnSelectionChange hook is used to listen to the selection change event. The onChange callback is called whenever the selection changes.
	// TODO - look at commented code
	useOnSelectionChange({
		onChange: ({ nodes }) => {
			console.log("Selected node:", selectedNode);
			if (nodes.length === 0) {
				setSelectedNode(null);
			} else {
				setSelectedNode(nodes[0]);
			}
			// The setSelectedNode function is called with the first selected node in the nodes array, or null if the array is empty.
			// setSelectedNode(nodes[0] || null);
			// if (nodes[0]) {
			// 	getAdditionalNodeProperties(nodes[0].id).then(setSelectedNodeAdditionalProperties);
			// }
		},
	});
	// TODO - assess commented code
	const onNodeContextMenu = (event, node) => {
		event.preventDefault();
		//setSelectedNode(node);
		setContextMenu({ x: event.clientX, y: event.clientY, node: node });
	};

	const deleteNode = useCallback(() => {
		if (contextMenu) {
			const nodeToDelete = contextMenu.node;
			const newNodes = nodes.filter((node) => node.id !== nodeToDelete.id); // remove the node that matches the id of the node to delete
			const newEdges = edges.filter((edge) => edge.source !== nodeToDelete.id && edge.target !== nodeToDelete.id); // remove the edges that are connected to the node to delete
			setNodes(newNodes);
			setEdges(newEdges);
			setContextMenu(null);
			// 	setSelectedNode(null);
		}
	}, [contextMenu, setNodes, setEdges]);

	// TODO
	const onNodeDragStart = () => {
		isDragging.current = true;
	};

	// TODO
	const onNodeDragStop = () => {
		isDragging.current = false;
		saveFlowData(nodes, edges, { nodes: nodeProperties, edges: edgeProperties }).catch(console.error);
	};

	// The applyNodeChanges function is used to apply the changes to the nodes array. It takes the changes and the nodes array as input and returns the updated nodes array.
	// TODO - assess commented code once it is used
	const handleUpdateNodeProperty = (id, property) => {
		updateNodeProperties(nodeId, properties);
		// console.log("Updating node property:", id, property);
		// updateNodeProperties(id, property)
		// 	.then(() => {
		// 		setNodeProperties((props) => ({
		// 			...props,
		// 			[id]: { ...props[id], additional: { ...props[id].additional, ...property } },
		// 		}));
		// 	})
		// 	.catch(console.error);
	};

	// The applyEdgeChanges function is used to apply the changes to the edges array. It takes the changes and the edges array as input and returns the updated edges array.
	// TODO - assess commented code once it is used
	const handleUpdateEdgeProperty = (id, property) => {
		console.log("Updating edge property:", id, property);
		updateEdgeProperties(id, property);
		// .then(() => {
		// 	setEdgeProperties((props) => ({
		// 		...props,
		// 		[id]: { ...props[id], additional: { ...props[id].additional, ...property } },
		// 	}));
		// })
		// .catch(console.error);
	};

	// The onNodeClick function is called when a node is clicked. It sets the selected node and retrieves the additional properties for the node from the Chrome storage.
    // TODO - assess commented code once it is used (might be able to use this in selection callback)
	// const onNodeClick = useCallback((event, node) => {
	// 	console.log("Selected node:", node);
	// 	setSelectedNode(node);
	// 	getAdditionalNodeProperties(node.id)
	// 		.then((additionalProperties) => {
	// 			setSelectedNodeAdditionalProperties(additionalProperties);
	// 		})
	// 		.catch((error) => {
	// 			console.error(error);
	// 		});
	// }, []);

	// The Flow component renders the ReactFlow component with the nodes and edges arrays as props. It also renders the Controls, MiniMap, and Background components.
	return (
		<div style={{ width: "100vw", height: "100vh" }}>
			<button onClick={togglePanel} style={{ marginLeft: "10px" }}>
				Toggle Side Panel
			</button>
			<ReactFlow
				nodes={nodes}
				edges={edges}
				nodeTypes={nodeTypes}
				onNodesChange={onNodesChange}
				onEdgesChange={onEdgesChange}
				onConnect={onConnect}
				//onNodeClick={onNodeClick}
				onNodesDelete={onNodesDelete}
				onEdgesDelete={onEdgesDelete}
				onNodeContextMenu={onNodeContextMenu}
				onNodeDragStart={onNodeDragStart}
				onNodeDragStop={onNodeDragStop}
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
			{contextMenu && <ContextMenu x={contextMenu.x} y={contextMenu.y} onDelete={deleteNode} />}

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
