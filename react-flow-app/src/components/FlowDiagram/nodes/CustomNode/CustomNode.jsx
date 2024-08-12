import PropTypes from "prop-types";
import { Handle } from "@xyflow/react";

import NodeTable from "./NodeTable/NodeTable.jsx";
import NodeTitle from "./NodeTitle/NodeTitle.jsx";
import "./CustomNode.css";

/**
 *
 * @param {*} data
 * @returns
 */

const CustomNode = ({ data }) => {
	const { title, numColumns } = data;
	const columnWidth = 30; // Width of each column
	const defaultNodeWidth = 100;
	const defaultNodeHeight = 200;

	const nodeWidth = Math.max(defaultNodeWidth, numColumns * columnWidth);

	return (
		<div className="relative border border-black rounded-lg" style={{ width: nodeWidth, height: defaultNodeHeight }}>
			{/* Title */}
			<NodeTitle title={title} nodeWidth={nodeWidth} nodeHeight={defaultNodeHeight} />

			{/* Columns */}
			<NodeTable numColumns={numColumns} />
                
            {/* Handles */}
			<Handle type="target" position="top" className="w-4 h-4 bg-black" />
			<Handle type="source" position="bottom" className="w-4 h-4 bg-black" />
		</div>
	);
};

CustomNode.propTypes = {
	data: PropTypes.shape({
		title: PropTypes.string.isRequired,
		numColumns: PropTypes.number.isRequired,
	}).isRequired,
};

export default CustomNode;
