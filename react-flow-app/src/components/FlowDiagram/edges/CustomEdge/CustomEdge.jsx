import { BaseEdge, getBezierPath, EdgeLabelRenderer } from "@xyflow/react";

export default function CustomEdge({ id, sourceX, sourceY, targetX, targetY, data }) {
	const { isMessageOverwritten } = data;
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
				className={`${isMessageOverwritten ? "stroke-red-600" : "stroke-black"} stroke-1`}
			/>
			<EdgeLabelRenderer>
				<div
					className="opacity-100 bg-orange-50 px-2 rounded-3xl text-center font-semibold text-sm"
					style={{
						position: "absolute",
						transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
					}}
				>
					{data.selectedText}
				</div>
			</EdgeLabelRenderer>
		</>
	);
}
