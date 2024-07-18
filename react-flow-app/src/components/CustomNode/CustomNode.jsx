import React, { useRef, useEffect, useState } from "react";
import { Handle, Position } from "@xyflow/react";

// CustomNode component
function CustomNode({ data, isConnectable }) {
	const nodeRef = useRef(null);
	const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

	// Update dimensions when label or description changes
	useEffect(() => {
		if (nodeRef.current) {
			const { offsetWidth, offsetHeight } = nodeRef.current;
			setDimensions({ width: offsetWidth, height: offsetHeight });
		}
	}, [data.label, data.description]);
	
	// Render the custom node with handles
	return (
		<div ref={nodeRef} className="custom-node">
			<Handle type="target" position={Position.Top} isConnectable={isConnectable} />
			<div className="custom-node_label">{data.label}</div>
			<Handle type="source" position={Position.Bottom} id="a" isConnectable={isConnectable} />
		</div>
	);
}

export default CustomNode;
