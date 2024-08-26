import { useEffect, useState } from "react";
import { Handle, Position, useUpdateNodeInternals } from "@xyflow/react";

const CustomHandle = ({ node_id, branch, targetRef }) => {
	const updateNodeInternals = useUpdateNodeInternals();
	const [positionStyle, setPositionStyle] = useState({});

	useEffect(() => {
		if (!targetRef) {
			setPositionStyle({
				style: {opacity: 0},
				position: Position.Right,
			});
		} else if (targetRef.current) {
			// Get the bounding box of the target (e.g., the button)
			const targetRect = targetRef.current.getBoundingClientRect();
			//const parentRect = targetRef.current.offsetParent.getBoundingClientRect();

			// Calculate the handle position based on the target element's position
			setPositionStyle({
				style: {
					left: `${targetRect.left + targetRect.width / 2}px`, // Align center of handle
					opacity: 0,
				},
				position: Position.Bottom,
			});
		}
		updateNodeInternals(node_id);
	}, [targetRef, node_id, updateNodeInternals]);

	
	return (
		<Handle
			className="bg-dark rounded-circle"
			style={positionStyle.style}
			id={String(branch.selectedTextContainerId) || "overwritten"}
			type="source"
			position={positionStyle.position}
			isConnectable
		/>
	);
};

export default CustomHandle;
