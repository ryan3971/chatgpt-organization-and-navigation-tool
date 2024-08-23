import { BaseEdge, getBezierPath, EdgeText } from "@xyflow/react";

export default function CustomEdge({ id, sourceX, sourceY, targetX, targetY, data }) {
	const [edgePath, labelX, labelY] = getBezierPath({
		sourceX,
		sourceY,
		targetX,
		targetY,
	});

	return (
		<>
			<BaseEdge
				id={id}
				path={edgePath}
			/>
			<EdgeText
				x={labelX}
				y={labelY}
				label={data.selectedText}
				labelStyle={{ fill: "#333", fontSize: "12px" }} // Customize text styling here
				labelShowBg={false}
			/>
		</>
	);
}
