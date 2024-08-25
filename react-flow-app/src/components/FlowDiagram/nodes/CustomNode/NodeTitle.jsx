import "bootstrap/dist/css/bootstrap.min.css";

import { useEffect, useRef, useState } from "react";

import './NodeTitle.css'


const Title = ({ title }) => {
	const titleRef = useRef(null);
	const [isTwoLines, setIsTwoLines] = useState(false);

	useEffect(() => {
		const titleElement = titleRef.current;
		if (titleElement) {
			// Check if the title wraps to two lines
			setIsTwoLines(titleElement.scrollHeight > titleElement.clientHeight);
		}
	}, [title]);

	return (
		<div
			ref={titleRef}
			//className={`bg-gray-100 p-2 rounded-t-md text-center font-semibold truncate-title ${isTwoLines ? "text-base" : "text-lg"}`}
			className={"px-4 py-1 rounded-t-full text-center font-semibold truncate-title text-base whitespace-normal overflow-hidden flex-nowrap"}
		>
			{title}
		</div>
	);
};

export default Title;
