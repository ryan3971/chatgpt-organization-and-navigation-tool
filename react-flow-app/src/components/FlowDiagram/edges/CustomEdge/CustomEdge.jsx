import { BaseEdge, getBezierPath, EdgeLabelRenderer } from "@xyflow/react";
import PropTypes from "prop-types";

/**
 * CustomEdge component represents a custom edge in the flow diagram.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {string} props.id - The unique identifier of the edge.
 * @param {number} props.sourceX - The x-coordinate of the source node.
 * @param {number} props.sourceY - The y-coordinate of the source node.
 * @param {number} props.targetX - The x-coordinate of the target node.
 * @param {number} props.targetY - The y-coordinate of the target node.
 * @param {Object} props.data - Additional data for the edge.
 * @param {boolean} props.data.isMessageOverwritten - Indicates if the message is overwritten.
 * @param {boolean} props.data.isSelected - Indicates if the edge is selected.
 * @param {string} props.data.selectedText - The text to display when the edge is selected.
 * @returns {JSX.Element} The rendered CustomEdge component.
 */
export default function CustomEdge({ id, sourceX, sourceY, targetX, targetY, data }) {
	const { isMessageOverwritten, isSelected } = data;

	// Calculate the path for the edge using a Bezier curve
	const [edgePath, labelX, labelY] = getBezierPath({
		sourceX,
		sourceY,
		targetX,
		targetY,
	});

	return (
		<>
			{/* Render the base edge with conditional styling */}
			<BaseEdge
				id={id}
				path={edgePath}
				className={`${isMessageOverwritten ? "stroke-red-600" : "stroke-black"} ${isSelected ? "stroke-2" : "stroke-1"}`}
			/>

			{/* Render the label for the edge */}
			<EdgeLabelRenderer>
				<div
					className={`${
						isSelected ? "opacity-100 bg-orange-50 px-2 rounded-3xl text-center font-semibold text-sm overflow-y-auto max-w-50" : ""
					}`}
					style={{
						position: "absolute",
						transform: `translate(-50%, -100%) translate(${targetX}px, ${targetY}px)`,
					}}
				>
					{/* Show the text when an edge is selected and render a diamond shape when the edge is not selected */}
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

CustomEdge.propTypes = {
	id: PropTypes.string.isRequired,
	sourceX: PropTypes.number.isRequired,
	sourceY: PropTypes.number.isRequired,
	targetX: PropTypes.number.isRequired,
	targetY: PropTypes.number.isRequired,
	data: PropTypes.shape({
		isMessageOverwritten: PropTypes.bool,
		isSelected: PropTypes.bool,
		selectedText: PropTypes.string,
	}),
};