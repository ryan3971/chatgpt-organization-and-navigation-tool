import { Handle, Position } from "@xyflow/react";

function CustomNode({ data, isConnectable }) {
	return (
		<div className="custom-node">
			<Handle type="target" position={Position.Top} isConnectable={isConnectable} />
			<div className="custom-node_label">{data.label}</div>
			<Handle type="source" position={Position.Bottom} id="a" isConnectable={isConnectable} />
		</div>
	);}

export default CustomNode;