import { useEffect, useState } from "react";
import { Handle, Position, useUpdateNodeInternals } from "@xyflow/react";

const CustomHandle = ({ node_id, branch, targetRef }) => {
	const updateNodeInternals = useUpdateNodeInternals();
	const [positionStyle, setPositionStyle] = useState({});

	useEffect(() => {
		if (!targetRef) {
			console.log("No target ref");
			// cause where the branch message was overwritten; branch should align to the right
			setPositionStyle({
				left: "100%",
				right: "0",
				width: "16px",
				height: "16px",
			});
		} else if (targetRef.current) {
			console.log("Target Ref:", targetRef.current);
			// Get the bounding box of the target (e.g., the button)
			const targetRect = targetRef.current.getBoundingClientRect();
			const parentRect = targetRef.current.offsetParent.getBoundingClientRect();

			// Calculate the handle position based on the target element's position
			setPositionStyle({
				left: `${targetRect.left - parentRect.left + targetRect.width / 2}px`, // Align center of handle
				bottom: "0",
				width: "16px",
				height: "16px",
			});
		}
		updateNodeInternals(node_id);
	}, [targetRef, node_id, updateNodeInternals]);

	
	return (
		<Handle
			className="bg-dark rounded-circle"
			style={positionStyle}
			id={branch.selectedTextContainerId || "0"}
			type="source"
			position={Position.Bottom}
			isConnectable
		/>
	);
};

export default CustomHandle;
