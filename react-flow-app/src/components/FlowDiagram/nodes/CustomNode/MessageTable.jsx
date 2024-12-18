import React, { useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Container, Row, Col } from "react-bootstrap";

import MessageButton from "./MessageButton";

const MessageTable = ({ node_id, messages, refs }) => {
	// Effect to create references for each message button
	useEffect(() => {
		// Create a ref for each message if not already created
		messages.forEach((msg, index) => {
			if (!refs.current[index]) {
				console.log("Creating ref for index", index);
				refs.current[index] = React.createRef();
			}
		});
	}, [messages, refs]);

	// Function to render a message button based on its index
	const renderButton = (index, message) => {
		const isUser = index % 2 === 0; // Determine if the message is from the user (even index)
		const commonStyles = "w-5 h-5 transition-colors duration-200"; // Shared styles for all buttons

		return (
			<div className="flex justify-center">
				{isUser ? (
					<MessageButton
						node_id={node_id}
						message={message}
						message_index={index}
						style={`${commonStyles} bg-blue-100 rounded-t-full hover:bg-blue-300 hover:border-blue-300`}
					/>
				) : (
					<MessageButton
						node_id={node_id}
						message={message}
						message_index={index}
						style={`${commonStyles} bg-neutral-500 rounded-b-full hover:bg-neutral-700 hover:border-neutral-700`}
					/>
				)}
			</div>
		);
	};

	return (
		<Container fluid>
			<Row className="h-full flex-nowrap">
				{messages.map((msg, index) => {
					const userMessage = msg[0];
					const gptMessage = msg[1];

					return (
						<Col
							ref={refs.current[index]}
							key={index}
							className="pb-2"
						>
							{/* Render the user and GPT message buttons */}
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
