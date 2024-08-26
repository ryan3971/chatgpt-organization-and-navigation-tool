import { BaseEdge, getBezierPath, EdgeText } from "@xyflow/react";

export default function CustomEdge({ id, sourceX, sourceY, targetX, targetY, data }) {
	const [edgePath, labelX, labelY] = getBezierPath({
		sourceX,
		sourceY,
		targetX,
		targetY,
	});

	console.log("CustomEdge id:", id);

	return (
		<>
			<BaseEdge
				id={id}
				path={edgePath}
				sourceX={sourceX}
				sourceY={sourceY}
			/>
			<EdgeText
				x={labelX}
				y={labelY}
				label={data.selectedText}
				labelStyle={{ fill: "#333", fontSize: "12px" }} // Customize text styling here
				labelShowBg={true}
				labelBgStyle={{ opacity: 0 }} // Customize background styling here
			/>
		</>
	);
}
