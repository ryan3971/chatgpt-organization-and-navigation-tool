import "bootstrap/dist/css/bootstrap.min.css";
import { useRef } from "react";

const Title = ({ title }) => {
	const titleRef = useRef(null); // Reference to the title div

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
