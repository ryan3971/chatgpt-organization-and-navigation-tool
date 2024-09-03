import { useEffect, useState } from "react";
import { Handle, Position, useUpdateNodeInternals } from "@xyflow/react";

const CustomHandle = ({ node_id, targetRef, containerId, sourceHandle }) => {
	const updateNodeInternals = useUpdateNodeInternals();
	const [positionStyle, setPositionStyle] = useState({});

	// useEffect to calculate and set the position of the handle relative to its target element
	// This effect runs when the component mounts and whenever the targetRef, node_id, or containerId changes.
	useEffect(() => {
		if (targetRef && targetRef.current) {
			// Get the bounding box of the target element (e.g., a button)
			const targetRect = targetRef.current.getBoundingClientRect();
			const parentRect = targetRef.current.offsetParent.getBoundingClientRect();

			// Calculate the width percentage of the target relative to its parent
			const columnPercent = targetRect.width / parentRect.width;
			console.log("Column Percent in CustomHandle: ", columnPercent);

			// Calculate the handle's position as a percentage of the parent's width
			setPositionStyle({
				left: `${(columnPercent * containerId + columnPercent / 2) * 100}%`, // Adjust to parent's position
				opacity: 0,
				width: 0, // Ensures the handle is invisible
				height: 0, // Ensures the handle is invisible
			});

			// Trigger an update of the node's internals after positioning the handle
			updateNodeInternals(node_id);
		}
	}, [targetRef, node_id, containerId, updateNodeInternals]);

	return (
		<Handle
			className="bg-dark rounded-circle"
			style={positionStyle}
			key={sourceHandle}
			id={sourceHandle}
			type="source"
			position={Position.Bottom}
			isConnectable
		/>
	);
};

export default CustomHandle;
