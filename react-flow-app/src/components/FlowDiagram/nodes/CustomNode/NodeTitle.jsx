import "bootstrap/dist/css/bootstrap.min.css";

import { useRef } from "react";

import './NodeTitle.css'


const Title = ({ title }) => {
	const titleRef = useRef(null);

	return (
		<div
			ref={titleRef}
			className="px-4 py-1 rounded-t-full text-center font-semibold text-base"
		>
			{title}
		</div>
	);
};

export default Title;
