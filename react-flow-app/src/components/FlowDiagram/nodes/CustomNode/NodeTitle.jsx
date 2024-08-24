import "bootstrap/dist/css/bootstrap.min.css";
import { Card, Image } from "react-bootstrap";
import gptLogo from "./gpt_logo.png";

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
		<Card.Header
				ref={titleRef}
				className={`text-center font-semibold truncate-title ${isTwoLines ? "text-base" : "text-lg"}`}
			>
				{title}
		</Card.Header>
	);
};

export default Title;
