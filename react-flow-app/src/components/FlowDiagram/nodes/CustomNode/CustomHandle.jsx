import React from "react";
import { Handle, Position } from "@xyflow/react";

const CustomHandle = ({ branch, totalColumns }) => {
	let selectedTextContainerId = branch.selectedTextContainerId || "0"; // Default to "0" if null
	let handleStyle = {};
	let position;

	if (selectedTextContainerId === "0") {
		// Center the handle on the right side of the node
		handleStyle = {
			right: "0",
			top: "50%",
			transform: "translateY(-50%)", // Center the handle vertically
		};
		position = Position.Right;
	} else {
		const handlePosition = Number(selectedTextContainerId) - 1;
		// Calculate the position based on the column the handle should be aligned with
		handleStyle = {
			left: `calc((100% / ${totalColumns}) * ${handlePosition} + (100% / ${totalColumns}) / 2 - 8px)`, // Align center of the handle to column
			bottom: "0",
		};
		position = Position.Bottom;
	}

	console.log("Selected Text Container ID in Custom Handle:", selectedTextContainerId);

	return (
		<Handle
			className="bg-dark rounded-circle"
			style={handleStyle}
			id={selectedTextContainerId}
			type="source"
			position={position}
			isConnectable
		/>
	);
};

export default CustomHandle;
