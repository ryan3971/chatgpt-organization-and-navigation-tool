import { useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

import { Handle, Position } from "@xyflow/react";

import Title from "./NodeTitle";
import MessageTable from "./MessageTable";
import CustomHandle from "./CustomHandle";

const CustomNode = ({ id, data }) => {
	const { title, messages, selectedTextContainerIds, isParent } = data;
	const refs = useRef({});

	return (
		<div
			className="bg-gray-100 border border-gray-200 shadow-sm rounded-full min-w-[12rem]"
			onDoubleClick={() => console.log("Double clicked node", id)}
		>
			{/* Title */}
			<Title title={title} />
			{/* Message Table */}
			<MessageTable
				node_id={id}
				messages={messages}
				refs={refs}
			/>

			{/* Top Handle if node is a parent */}
			{!isParent && (
				console.log("Top handle for node", id),
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
					//	opacity: 0,
					}}
				/>
			)}

			{/* Handles for branches */}
			{selectedTextContainerIds.map((containerId, index) => {
				console.log("Branch handle for container", containerId);
				console.log("Branch index", index);
				let targetRef = null;
				if (containerId) {
					const columnIndex = Math.floor(containerId / 2);
					targetRef = refs.current[columnIndex];
				}
				return (
					<CustomHandle
						key={containerId}
						node_id={id}
						containerId={containerId}
						targetRef={targetRef}
					/>
				);
			})}
		</div>
	);
};

export default CustomNode;
