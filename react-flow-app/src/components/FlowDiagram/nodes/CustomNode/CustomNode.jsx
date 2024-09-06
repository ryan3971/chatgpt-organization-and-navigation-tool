import { useRef, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import PropTypes from "prop-types";

import { Handle, Position, useUpdateNodeInternals } from "@xyflow/react";

import Title from "./NodeTitle";
import MessageTable from "./MessageTable";
import CustomHandle from "./CustomHandle";

import { sendMessageToBackground } from "../../../../util/chromeMessagingService";
import { showToast } from "../../../toast/toastService";
import * as Constants from "../../../../util/constants";

/**
 * CustomNode component represents a custom node in the flow diagram.
 * @component
 * @param {Object} props - The component props.
 * @param {string} props.id - The unique identifier of the node.
 * @param {Object} props.data - Additional data for the node.
 * @param {boolean} props.selected - Indicates if the node is selected.
 * 		@param {string} data.title - The title of the node.
 * 		@param {Array} data.messages - The messages associated with the node.
 * 		@param {Array} data.selectedTextContainerIds - The IDs of the selected text containers.
 * 		@param {boolean} data.isParent - Indicates if the node is a parent node.
 * @returns {JSX.Element} The rendered CustomNode component.
 */
const CustomNode = ({ id, data, selected }) => {
	const { title, messages, selectedTextContainerIds, isParent } = data;
	const refs = useRef({});
	const updateNodeInternals = useUpdateNodeInternals();

	// Effect to update the node internals when the node is mounted or its ID changes
	useEffect(() => {
		updateNodeInternals(id);
	}, [id, updateNodeInternals]);

	// Handler for double-click events on the node
	function handleDoubleClick() {
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

CustomNode.propTypes = {
	id: PropTypes.string.isRequired,
	data: PropTypes.shape({
		title: PropTypes.string.isRequired,
		messages: PropTypes.array.isRequired,
		selectedTextContainerIds: PropTypes.array.isRequired,
		isParent: PropTypes.bool.isRequired,
	}).isRequired,
	selected: PropTypes.bool,
};