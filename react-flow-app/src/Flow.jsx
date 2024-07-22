import React, { useState, useCallback, useEffect, useRef } from "react";
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
const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(initialNodes, initialEdges);

const Flow = ({ togglePanel }) => {
	/*
        node (node object):                      { id: string, type: string, position: { x: number, y: number }, data: { label: string } }
        edge (edge object):                      { id: string, source: string, target: string }
        selectedNode (node object):              { id: string, type: string, position: { x: number, y: number }, data: { label: string } }
        nodeProperties (node properties object): { [nodeId: string]: { additional: { [key: string]: any } } }
        edgeProperties (edge properties object): { [edgeId: string]: { additional: { [key: string]: any } } }
        selectedNodeAdditionalProperties:        { [key: string]: any }
        contextMenu (dict):                      { x: number, y: number }
    */

	const [nodes, setNodes] = useNodesState(layoutedNodes);
	const [edges, setEdges] = useEdgesState(layoutedEdges);
	const [selectedNode, setSelectedNode] = useState(null);

	const [nodeProperties, setNodeProperties] = useState({});
	const [edgeProperties, setEdgeProperties] = useState({});
	const [selectedNodeAdditionalProperties, setSelectedNodeAdditionalProperties] = useState(null);

	const [contextMenu, setContextMenu] = useState(null);

	const contextMenuRef = useRef(null);
	const isDragging = useRef(false);

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
	}, [setNodes, setEdges]);

	// The hideContextMenu function is called to hide the context menu when the user clicks outside of it.
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (contextMenuRef.current && !contextMenuRef.current.contains(event.target)) {
				hideContextMenu();
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

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

	// The onConnect function is called when a connection is created between two nodes. It adds the new edge to the edges array and saves the flow data to the Chrome storage.
	const onConnect = (connection) => {
		console.log("onConnect", connection);
		setEdges((eds) => {
			const updatedEdges = addEdge(connection, eds);
			saveFlowData(nodes, updatedEdges, { nodes: nodeProperties, edges: edgeProperties }).catch(console.error);
			return updatedEdges;
		});
	};

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

	// The applyNodeChanges function is used to apply the changes to the nodes array. It takes the changes and the nodes array as input and returns the updated nodes array.
	const onNodesChange = (changes) => {
		console.log("onNodesChange: ", changes);
		setNodes((nds) => {
			const updatedNodes = applyNodeChanges(changes, nds);
			if (!isDragging.current) {
				saveFlowData(updatedNodes, edges, { nodes: nodeProperties, edges: edgeProperties }).catch(console.error);
			}
			return updatedNodes;
		});
	};

	// The applyEdgeChanges function is used to apply the changes to the edges array. It takes the changes and the edges array as input and returns the updated edges array.
	const onEdgesChange = (changes) => {
		console.log("onEdgesChange: ", changes);
		setEdges((eds) => {
			const updatedEdges = applyEdgeChanges(changes, eds);
			saveFlowData(nodes, updatedEdges, { nodes: nodeProperties, edges: edgeProperties }).catch(console.error);
			return updatedEdges;
		});
	};

	const onNodeDragStart = () => {
		console.log("onNodeDragStart");
		isDragging.current = true;
	};

	const onNodeDragStop = () => {
		console.log("onNodeDragStop");
		isDragging.current = false;
		saveFlowData(nodes, edges, { nodes: nodeProperties, edges: edgeProperties }).catch(console.error);
	};

	// The onLayout function is called when the vertical or horizontal layout buttons are clicked. It layouts the nodes and edges in the specified direction.
	const onLayout = useCallback(
		(direction) => {
			const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges, direction);

			setNodes([...layoutedNodes]);
			setEdges([...layoutedEdges]);
			// Save the layouted nodes and edges to the Chrome storage
			//saveFlowData(layoutedNodes, layoutedEdges, { nodes: nodeProperties, edges: edgeProperties }).catch(console.error);
		},
		[nodes, edges]
	);

	// The onSelectionChange hook is used to listen to the selection change event. The onChange callback is called whenever the selection changes.
	const onChange = useCallback(({ nodes }) => {
		console.log("onChange: ", nodes);
		if (nodes.length === 0) {
			setSelectedNode(null);
		} else {
			setSelectedNode(nodes[0]);
			// 	getAdditionalNodeProperties(nodes[0].id).then(setSelectedNodeAdditionalProperties);
		}
		console.log("onChange - selectedNode: ", selectedNode);
	});

	// The useOnSelectionChange hook is used to listen to the selection change event. The onChange callback is called whenever the selection changes.
	// Need to have it like this to work!
	useOnSelectionChange({
		onChange,
	});

	const onNodeContextMenu = (event, node) => {
		console.log("onNodeContextMenu: ", node);
		event.preventDefault();
		setSelectedNode(node); // Might not need this is right-click counts as click (so it calls onNodeCLick)
		setContextMenu({
			x: event.clientX,
			y: event.clientY,
		});
	};

	const deleteNode = () => {
		console.log("deleteNode: ", selectedNode);
		if (selectedNode) {
			const newNodes = nodes.filter((node) => node.id !== selectedNode.id);
			const newEdges = edges.filter((edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id);
			setNodes(newNodes);
			setEdges(newEdges);
			setContextMenu(null);
			//    setSelectedNode(null);
		}
	};

	// The onNodeClick function is called when a node is clicked. It sets the selected node and retrieves the additional properties for the node from the Chrome storage.
	// Need this since useOnSelectionChange not called when node is clicked
	const onNodeClick = useCallback((event, node) => {
		console.log("onNodeClick: ", node);
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
		console.log("handleUpdateNodeProperty: ", id, property);
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
		console.log("handleUpdateEdgeProperty: ", id, property);
		updateEdgeProperties(id, property)
			.then(() => {
				setEdgeProperties((props) => ({
					...props,
					[id]: { ...props[id], additional: { ...props[id].additional, ...property } },
				}));
			})
			.catch(console.error);
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
				nodeTypes={nodeTypes}
				onNodesChange={onNodesChange}
				onEdgesChange={onEdgesChange}
				onConnect={onConnect}
				onNodeClick={onNodeClick}
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
				{contextMenu && <ContextMenu x={contextMenu.x} y={contextMenu.y} onDelete={deleteNode} />}
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
