import { useRef, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

import { Handle, Position, useUpdateNodeInternals } from "@xyflow/react";

import Title from "./NodeTitle";
import MessageTable from "./MessageTable";
import CustomHandle from "./CustomHandle";

import { sendMessageToBackground } from "../../../../util/chromeMessagingService";
import { showToast } from "../../../toast/toastService";
import * as Constants from "../../../../util/constants";

const CustomNode = ({ id, data, selected }) => {
	const { title, messages, selectedTextContainerIds, isParent } = data;
	const refs = useRef({});

	const updateNodeInternals = useUpdateNodeInternals();

	console.log("CustomNode rendering for node", id);
	console.log("Value of refs in CustomNode: ", refs);

	// Effect to update the node internals when the node is mounted or its ID changes
	useEffect(() => {
		updateNodeInternals(id);
		console.log("Updating node internals for node", id);
	}, [id, updateNodeInternals]);

	// Handler for double-click events on the node
	function handleDoubleClick() {
		console.log("Double clicked node", id);

		// Prepare the data to send to the background script
		const data = {
			node_id: id,
			message_index: null,
		};

		// Send a message to the background script to open the chat for this node
		sendMessageToBackground(Constants.HANDLE_OPEN_NODE_CHAT, data)
			.then((response) => {
				if (!response.status) {
					showToast("Error opening chat", "error");
					return;
				}
			})
			.catch((error) => {
				console.error("Unexpected error opening chat:", error);
				showToast("An unexpected error occurred", "error");
			});
	}

	return (
		<div
			className={`${
				selected ? "border-blue-300 shadow-lg border-3" : "border-gray-200 shadow-sm border"
			} bg-gray-100 rounded-full min-w-[12rem]`}
			onDoubleClick={handleDoubleClick}
		>
			{/* Node Title */}
			<Title title={title} />

			{/* Message Table */}
			<MessageTable
				node_id={id}
				messages={messages}
				refs={refs}
			/>

			{/* Top Handle if the node is not a parent */}
			{!isParent && (
				<Handle
					type="target"
					position={Position.Top}
					className="bg-dark rounded-circle"
					id={`t-${id}`}
					style={{
						top: "-8px", // Slightly above the top of the card
						left: "50%",
						transform: "translateX(-50%)", // Centered horizontally
						width: "16px",
						height: "16px",
						opacity: 0, // Hidden by default
					}}
				/>
			)}

			{/* Handles for branches */}
			{selectedTextContainerIds.map((containerId) => {
				const columnIndex = Math.floor(containerId / 2);
				const targetRef = refs.current[columnIndex];
				const sourceHandle = `${id}-s-${containerId}`;

				console.log("Creating handle for container", containerId);

				return (
					<CustomHandle
						key={sourceHandle}
						node_id={id}
						targetRef={targetRef}
						containerId={columnIndex}
						sourceHandle={sourceHandle}
						messageLength={messages.length}
					/>
				);
			})}
		</div>
	);
};

export default CustomNode;
