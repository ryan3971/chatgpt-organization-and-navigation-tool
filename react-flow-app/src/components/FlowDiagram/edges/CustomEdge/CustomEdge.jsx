import { BaseEdge, getBezierPath, getSmoothStepPath, EdgeLabelRenderer, Position } from "@xyflow/react";

export default function CustomEdge({ id, sourceX, sourceY, targetX, targetY, data }) {
	const { isMessageOverwritten, isSelected } = data;
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
				className={`${isMessageOverwritten ? "stroke-red-600" : "stroke-black"} ${isSelected ? "stroke-2" : "stroke-1"}`}
			/>
			<EdgeLabelRenderer>
				<div
					className={`${
						isSelected
							? "opacity-100 bg-orange-50 px-2 rounded-3xl text-center font-semibold text-sm overflow-y-auto max-w-50"
							: ""
					}`}
					style={{
						position: "absolute",
						transform: `translate(-50%, -100%) translate(${targetX}px,${targetY}px)`,
					}}
				>
					{isSelected ? (
						<span>{data.selectedText}</span>
					) : (
						<svg
							width="10"
							height="10"
							viewBox="0 0 10 10"
						>
							<polygon
								points="5,0 10,5 5,10 0,5"
								fill="black"
							/>
						</svg>
					)}
				</div>
			</EdgeLabelRenderer>
		</>
	);
}
