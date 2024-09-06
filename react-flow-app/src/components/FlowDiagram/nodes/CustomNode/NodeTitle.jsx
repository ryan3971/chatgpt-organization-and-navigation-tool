import "bootstrap/dist/css/bootstrap.min.css";
import { useRef } from "react";
import PropTypes from "prop-types";

/**
 * Title component.
 * @component
 * @param {Object} props - The component props.
 * @param {string} props.title - The title to display.
 * @returns {JSX.Element} The rendered Title component.
 */
const Title = ({ title }) => {
	const titleRef = useRef(null); // Reference to the title div

	console.log("Title rendering");

	return (
		<div
			ref={titleRef}
			className="px-4 py-1 rounded-t-full text-center font-semibold text-base"
		>
			{/* Render the title text */}
			{title}
		</div>
	);
};

export default Title;

Title.propTypes = {
	title: PropTypes.string.isRequired,
};