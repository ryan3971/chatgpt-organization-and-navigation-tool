
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
import dagre, { layout } from "dagre";
import "@xyflow/react/dist/style.css";

import customNode from "./components/CustomNode/CustomNode";
import { getFromStorage, setToStorage, sendMessage } from "./backend/chromeStorage";

import ContextMenu from "./components/ContextMenu/ContextMenu";
import "./components/CustomNode/CustomNode.css";

import { createNewNodes, createNewParentNode } from "./util/createNewNodes.js";

import testData from "./example/test_data.js";

// Graph layout configuration
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));
const nodeWidth = 172;
const nodeHeight = 36;

//Initial node and edge data
const initialNodes = [
	{
		id: "1",
		type: "customNode",
		data: { label: "Node 1" },
		position: { x: 250, y: 0 },
	},
];

// //we define the nodeTypes outside of the component to prevent re-renderings
const initialEdges = [];
const nodeTypes = { customNode: customNode };
//let nodeId = 2;

// Styling for the button and container
const buttonStyle = {
	marginLeft: "10px",
};

const containerStyle = {
	width: "100vw",
	height: "100vh",
};

/**
 * Layouts the nodes and edges in the specified direction using the dagre library.
 * 
 * @param {Array} nodes - The array of nodes.
 * @param {Array} edges - The array of edges.
 * @param {string} direction - The direction of the layout. Can be "TB" (top to bottom) or "LR" (left to right).
 * @returns {Object} - The layouted nodes and edges.
 */
const getLayoutedElements = (nodes, edges, direction = "TB") => {
	console.log("Layouting elements with direction: ", direction);

	const isHorizontal = direction === "LR";
	dagreGraph.setGraph({ rankdir: direction });

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
		return {
			...node,
			targetPosition: isHorizontal ? "left" : "top",
			sourcePosition: isHorizontal ? "right" : "bottom",
			position: {
				x: nodeWithPosition.x - (node.data.dimensions?.width || nodeWidth) / 2,
				y: nodeWithPosition.y - (node.data.dimensions?.height || nodeHeight) / 2,
			},
		};
	});

	return { nodes: newNodes, edges };
};

const TESTING_REACT = false;
let layoutedNodes = [];
let layoutedEdges = [];
if (TESTING_REACT)	{
	const initialLayout = getLayoutedElements(initialNodes, initialEdges);
	layoutedNodes = initialLayout.nodes;
	layoutedEdges = initialLayout.edges;
}
/**
 * Represents the Flow component.
 * 
 * @component
 * @param {Object} props - The component props.
 * @param {Function} props.togglePanel - The function to toggle the panel.
 * @returns {JSX.Element} - The rendered Flow component.
 */
const Flow = ({ togglePanel }) => {
	/*
        node (node object):                      { id: string, type: string, position: { x: number, y: number }, data: { label: string } }
        edge (edge object):                      { id: string, source: string, target: string }
        selectedNode (node object):              { id: string, type: string, position: { x: number, y: number }, data: { label: string } }
        contextMenu (dict):                      { x: number, y: number }
    */

	const [nodes, setNodes] = useNodesState(layoutedNodes);
	const [edges, setEdges] = useEdgesState(layoutedEdges);
	const [selectedNode, setSelectedNode] = useState(null);
	const [contextMenu, setContextMenu] = useState(null);
	const contextMenuRef = useRef(null);
	const isDragging = useRef(false);

	useEffect(() => {
		console.log("Entered useEffect for handling loading data from storage");
		const fetchData = async () => {
			let response = null;
			let stor, nodesStor, edgesStor, newNodesStor, newParentNodeStor;
			let saveToStorageState = false;

			try {
				stor = await getFromStorage(["nodes", "edges", "new_nodes", "new_parent_node"]);

				nodesStor = stor["nodes"];
				edgesStor = stor["edges"];
				newNodesStor = stor["new_nodes"];
				newParentNodeStor = stor["new_parent_node"];
				console.log("In UseEffect, loaded data from storage", stor);
			} catch (error) {
				console.error("Error loading data from storage:", error);
			}


			if (nodesStor && edgesStor) {
				setNodes(nodesStor);
				setEdges(edgesStor);
				console.log("In UseEffect, loaded nodes and edges");
			}
			
			if (newParentNodeStor) {
				// Create new parent node
				const newParentNodeData = createNewParentNode(newParentNodeStor);

				// merge the new parent node with the existing nodes
				if (!nodesStor) {
					setNodes([newParentNodeData]);
					nodesStor = [newParentNodeData];
				} else	{
					setNodes((nds) => nds.concat(newParentNodeData));
					nodesStor = nodesStor.concat(newParentNodeData);
				}
				// remove the new parent node from the chrome storage
				try {
					response = await setToStorage({ new_parent_node: null });
					console.log("Parent changed to React Node and set to null in storage");
				} catch (error) {
					console.error("Error removing new parent node from storage:", error);
				}

				saveToStorageState = true;
				console.log("In UseEffect, loaded Parent Node: ", newParentNodeData);
			}

			if (newNodesStor) {
				// Create new nodes and edges
				const newData = createNewNodes(nodesStor, newNodesStor);
				const newNodesData = newData.map(({ newNode }) => newNode);
				const newEdgesData = newData.map(({ newEdge }) => newEdge);

				// merge the new nodes and edges with the existing nodes and edges
				setNodes((nds) => nds.concat(newNodesData));
				setEdges((eds) => eds.concat(newEdgesData));

				// remove the new nodes from the chrome storage
				try {
					response = await setToStorage({ new_nodes: null });
					console.log("Branch Node(s) changed to React Node(s) and set to null in storage");
				} catch (error) {
					console.error("Error removing new nodes from storage:", error);
				}
				saveToStorageState = true;
				console.log("In UseEffect, loaded Branch Node(s): ", newNodesData);
			}
		};
		fetchData();
	}, []);

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
	}, [contextMenuRef]);

	
	// The addNode function is called when the Add Node button is clicked. It creates a new node and edge and adds them to the nodes and edges arrays.
	// const addNode = useCallback(() => {
	// 	if (!selectedNode) return;

	// 	// Create a new node
	// 	const newNode = {
	// 		id: `${nodeId++}`,
	// 		type: "customNode",
	// 		data: { label: `Node ${nodeId}` },
	// 		position: { x: selectedNode.position.x + 100, y: selectedNode.position.y + 100 },
	// 	};

	// 	// Create a new edge
	// 	const newEdge = {
	// 		id: `e${selectedNode.id}-${newNode.id}`,
	// 		source: selectedNode.id,
	// 		target: newNode.id,
	// 	};

	// 	// Add the new node and edge to the nodes and edges arrays
	// 	setNodes((nds) => nds.concat(newNode));
	// 	setEdges((eds) => eds.concat(newEdge));
	// }, [setNodes, setEdges, selectedNode]);

	// The onConnect function is called when a connection is created between two nodes. It adds the new edge to the edges array and saves the flow data to the Chrome storage.
	const onConnect = (connection) => {
		console.log("onConnect", connection);
		setEdges((eds) => {
			const updatedEdges = addEdge(connection, eds);
			setToStorage({ nodes: nodes, edges: updatedEdges }).then((response) => {
				console.log("onConnect called, saved updated Edges (and nodes) to storage");
			});

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
				setToStorage({ nodes: updatedNodes, edges: edges }).then((response) => {
					console.log("onNodesChange called, saved Updated Node data to Storage");
				});
			}
			return updatedNodes;
			});
		};

	// The applyEdgeChanges function is used to apply the changes to the edges array. It takes the changes and the edges array as input and returns the updated edges array.
	const onEdgesChange = (changes) => {
		console.log("onEdgesChange: ", changes);
		setEdges((eds) => {
			const updatedEdges = applyEdgeChanges(changes, eds);
			setToStorage({ nodes: nodes, edges: updatedEdges }).then((response) => {
				console.log("onEdgesChange called, saved updated Edges (and nodes) to storage", response);
			});
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

		// Called here because onNodeChange is not called when dragging stops
		setToStorage({ nodes: nodes, edges: edges }).then((response) => {
			console.log("Dragging stopped, saved Updated Node data to Storage");
		});
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

	// The onSelectionChange hook is used to listen to the selection change event. The onChange callback is called whenever the selection changes.
	const onChange = useCallback(({ nodes }) => {
		console.log("onChange: ", nodes);
		if (nodes.length === 0) {
			setSelectedNode(null);
		} else {
			setSelectedNode(nodes[0]);
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

	const openChat = () => {
		console.log("openChat: ", selectedNode);
		if (selectedNode) {
			setContextMenu(null);	// I think this calls onNodeChange

			// Get the node id and pass it to the content script
			const nodeId = selectedNode.id;
			console.log("openChat - Node ID: ", nodeId);

			// setToStorage({ nodes: nodes, edges: edges }).then((response) => {
			// 	console.log("onNodesChange called, saved Updated Node data to Storage");
			// });

			sendMessage({ action: "openChat", nodeId: nodeId }).then((response) => {
				console.log("openChat called, opened new Chat");
			});
			//    setSelectedNode(null);
		}
	};

	// The onNodeClick function is called when a node is clicked. It sets the selected node and retrieves the additional properties for the node from the Chrome storage.
	// Need this since useOnSelectionChange not called when node is clicked
	const onNodeClick = useCallback((event, node) => {
		console.log("onNodeClick: ", node);
		setSelectedNode(node);
	}, []);

	const refreshDiagram = useCallback(async () => {
		console.log("refreshDiagram");
		let response = null;
		try {
			response = await sendMessage({ action: "updateDiagram" });
			console.log("Refreshed diagram Response: ", response);
		} catch (error) {
			console.error(error);
		}

		// Reload the nodes and edges from storage
		const stor = await getFromStorage(["nodes", "edges"]);
		const nodesStor = stor["nodes"] || [];
		const edgesStor = stor["edges"] || [];
		setNodes(nodesStor);
		setEdges(edgesStor);
	}, []);

	// The Flow component renders the ReactFlow component with the nodes and edges arrays as props. It also renders the Controls, MiniMap, and Background components.
	return (
		<div style={containerStyle}>
			<button onClick={togglePanel} style={buttonStyle}>
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
					{/* <button onClick={addNode} disabled={!selectedNode}>
						Add Node
					</button> */}
					<button onClick={() => refreshDiagram()}>Refresh</button>
					<button onClick={() => onLayout("TB")}>vertical layout</button>
					<button onClick={() => onLayout("LR")}>horizontal layout</button>
				</Panel>
				{contextMenu && <ContextMenu x={contextMenu.x} y={contextMenu.y} onDelete={deleteNode} openChat={openChat} />}
				<Controls />
				<MiniMap />
				<Background variant="dots" gap={12} size={1} />
			</ReactFlow>
		</div>
	);
};

export default Flow;
