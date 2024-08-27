import React, { useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Container, Row, Col } from "react-bootstrap";

import MessageButton from "./MessageButton";

const MessageTable = ({ node_id, messages, refs }) => {
	// useEffect(() => {
	// 	const handleWindowBlur = () => {
	// 		// If the document is hidden (e.g., window minimized or tab switched)
	// 		if (document.hidden) {
	// 			// Hide all tooltips when the document becomes hidden
	// 			setShowTooltip({});
	// 			clearTimeout(tooltipTimeout.current);
	// 		}
	// 	};

	// 	// Listen for visibility changes
	// 	window.addEventListener("blur", handleWindowBlur);

	// 	// Cleanup the event listener when the component unmounts
	// 	return () => {
	// 		window.removeEventListener("blur", handleWindowBlur);
	// 	};
	// }, []);

	useEffect(() => {
		// Create references for each message button if not already created
		messages.forEach((msg, index) => {
			if (!refs.current[index]) {
				console.log("Creating ref for index", index);
				refs.current[index] = React.createRef();
			}
		});
	}, [messages, refs]);

	const renderButton = (index, message) => {
		const isUser = index % 2 === 0; // true if index is even, false if index is odd
		return (
			<div className="flex justify-center">
				{isUser && (
					<MessageButton
						node_id={node_id}
						message={message}
						message_index={index}
						style={"w-5 h-5 bg-blue-100 rounded-t-full hover:bg-blue-300 hover:border-blue-300 transition-colors duration-200"}
					/>
				)}
				{!isUser && (
					<MessageButton
						node_id={node_id}
						message={message}
						message_index={index}
						style={"w-5 h-5 bg-neutral-500 rounded-b-full hover:bg-neutral-700 hover:border-neutral-700 transition-colors duration-200"}
					/>
				)}
			</div>
		);
	};

	return (
		<Container fluid>
			<Row className="h-full flex-nowrap">
				{messages.map((msg, index) => {
						let userMessage = msg[0];
						let gptMessage = msg[1];
						
						return (
							<Col
								ref={refs.current[index]}
								key={index}
								className="pb-2"
							>
								{renderButton(index * 2, userMessage)}
								{renderButton(index * 2 + 1, gptMessage)}
							</Col>
						);
					})}
			</Row>
		</Container>
	);
};

export default MessageTable;
