import PropTypes from "prop-types";
import "./node-title.css";

const Title = ({ title, nodeWidth, nodeHeight }) => {
	return (
		<div
			className="absolute top-0 left-0 flex items-center justify-center bg-gray-100 rounded-lg"
			style={{ width: nodeWidth / 2, height: nodeHeight / 4 }}
		>
			{title}
		</div>
	);
};

Title.propTypes = {
    title: PropTypes.string.isRequired,
    nodeWidth: PropTypes.number.isRequired,
    nodeHeight: PropTypes.number.isRequired,
};

export default Title;
