import { useEffect, useState } from "react";
import { Handle, Position, useUpdateNodeInternals } from "@xyflow/react";

const CustomHandle = ({ node_id, containerId, targetRef }) => {
	const updateNodeInternals = useUpdateNodeInternals();
	const [positionStyle, setPositionStyle] = useState({});

	const sourceHandle = `${node_id}-s-${containerId}`;
	console.log("Node ID: ", node_id);
	console.log("Source Handle:", sourceHandle);

	useEffect(() => {
		if (!containerId) {
			setPositionStyle({
				style: {}, //opacity: 0},
				position: Position.Right,
			});
		} else if (targetRef && targetRef.current) {
			// Get the bounding box of the target (e.g., the button)
			const targetRect = targetRef.current.getBoundingClientRect();
			//const parentRect = targetRef.current.offsetParent.getBoundingClientRect();

			// Calculate the handle position based on the target element's position
			setPositionStyle({
				style: {
					left: `${targetRect.left + targetRect.width / 2}px`, // Align center of handle
					//	opacity: 0,
				},
				position: Position.Bottom,
			});
		} else {
			setPositionStyle({
				style: {},
				position: {},
			});
		}
		updateNodeInternals(node_id);
	}, [targetRef, node_id, updateNodeInternals]);

	
	return (
		<Handle
			className="bg-dark rounded-circle"
			style={positionStyle.style}
			key={sourceHandle}
			id={sourceHandle}
			type="source"
			position={positionStyle.position}
			isConnectable
		/>
	);
};

export default CustomHandle;
