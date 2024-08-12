import PropTypes from "prop-types";
import "./node-table.css";

const NodeTable = ({ numColumns }) => {
	const columns = Array(numColumns).fill(""); // Create an array with the given number of columns
	//const columnWidth = 50; // Width of each column

	return (
		<div className="absolute top-1/4 left-0 w-full h-3/4 flex flex-col p-1">
			<div className="flex flex-1">
				{columns.map((_, index) => (
					<div key={index} className="w-6 h-full flex items-center justify-center rounded-lg bg-red-200 m-1">
					</div>
				))}
			</div>
			<div className="flex flex-1">
				{columns.map((_, index) => (
					<div key={index} className="w-6 h-full flex items-center justify-center rounded-lg bg-gray-200 m-1">
					</div>
				))}
			</div>
		</div>
	);
};

NodeTable.propTypes = {
	numColumns: PropTypes.number.isRequired,
};

export default NodeTable;
