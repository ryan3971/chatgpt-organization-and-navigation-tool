import React, { useEffect, useState, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, Container, Row, Col, OverlayTrigger, Tooltip } from "react-bootstrap";

import { sendMessageToBackground } from "../../../../util/chromeMessagingService";
import * as Constants from "../../../../util/constants";

const MessageTable = ({ node_id, messages, refs }) => {
	const [showUserTooltip, setShowUserTooltip] = useState({});
	const [showGptTooltip, setShowGptTooltip] = useState({});
	const tooltipTimeout = useRef(null);
	
	useEffect(() => {
		const handleBlur = () => {
			// If the document is hidden (e.g., window minimized or tab switched)
			if (document.hidden) {
				// Hide all tooltips when the document becomes hidden
				setShowUserTooltip({});
				setShowGptTooltip({});
				clearTimeout(tooltipTimeout.current);
			}
		};

		// Listen for visibility changes
		window.addEventListener("blur", handleBlur);

		// Cleanup the event listener when the component unmounts
		return () => {
			window.removeEventListener("blur", handleBlur);
		};
	}, []);

	const handleMouseEnter = (event, index, setShowTooltip) => {
		// Set the background color of the button to a light blue when hovered
		event.currentTarget.style.backgroundColor = "#e6f3ff";

		// Show the tooltip after a small delay
		tooltipTimeout.current = setTimeout(() => {
			setShowTooltip((prev) => ({ ...prev, [index]: true }));
		}, 200); // Adding a small delay to prevent flickering when quickly hovering over items
	};

	const handleMouseLeave = (event, index, setShowTooltip) => {
		// Set the background color of the button back to white when not hovered
		event.currentTarget.style.backgroundColor = "#fff";

		// Hide the tooltip
		clearTimeout(tooltipTimeout.current);
		setShowTooltip((prev) => ({ ...prev, [index]: false }));
	};

	useEffect(() => {
		// Create references for each message button if not already created
		messages.forEach((msg, index) => {
			const containerIdKey = index + 1;	// adding one because 0 is reserved for the overwritten messages cases
			if (!refs.current[containerIdKey]) {
				refs.current[containerIdKey] = React.createRef();
			}
		});
	}, [messages, refs]);
	
	
	const handleButtonClick = (node_id, index) => {
		console.log(`User button clicked at index ${index}:`);

		const data = {
			node_id: node_id,
			message_index: index,
		};

		// send a message to the chrome background script to open a chat window
		sendMessageToBackground(Constants.HANDLE_OPEN_NODE_CHAT, data).then((response) => {
			if (!response.status) {
				console.error("Error sending message to background script");
				return;
			}
			console.log("Message sent to background script");
		});
	};

	const renderTooltip = (msg) => (
		<Tooltip
			id="button-tooltip"
			style={{ maxWidth: "200px", opacity: 0.85 }}
		>
			{msg}
		</Tooltip>
	);

	return (
		<Container
			fluid
			className="border border-light bg-white shadow-sm rounded"
			style={{ padding: "15px" }}
		>
			<Row className="h-50  flex-nowrap">
				{messages.map((msg, index) => (
					<Col
						className="p-1"
						key={`user-${index}`}
						xs="auto"
					>
						<OverlayTrigger
							placement="top"
							show={showUserTooltip[index]}
							overlay={renderTooltip(msg.userMessage)}
						>
							<Button
								ref={refs.current[index + 1]} // assign the ref to each button
								variant="outline-primary"
								className="rounded-pill"
								style={{
									width: "35px",
									height: "35px",
									border: "1px solid #b3b3b3",
									backgroundColor: "#fff",
									transition: "background-color 0.2s ease-in-out",
								}}
								onClick={() => handleButtonClick(node_id, index)}
								onMouseEnter={(e) => handleMouseEnter(e, index, setShowUserTooltip)}
								onMouseLeave={(e) => handleMouseLeave(e, index, setShowUserTooltip)}
							/>
						</OverlayTrigger>
					</Col>
				))}
			</Row>

			<Row className="h-50 mt-3  flex-nowrap">
				{messages.map((msg, index) => (
					<Col
						key={`gpt-${index}`}
						xs="auto"
						className="p-1"
					>
						<OverlayTrigger
							placement="top"
							show={showGptTooltip[index]}
							overlay={renderTooltip(msg.gptMessage)}
						>
							<Button
								variant="outline-secondary"
								className="rounded-pill"
								style={{
									width: "35px",
									height: "35px",
									border: "1px solid #b3b3b3",
									backgroundColor: "#fff",
									transition: "background-color 0.2s ease-in-out",
								}}
								onClick={() => handleButtonClick(node_id, index)}
								onMouseEnter={(e) => handleMouseEnter(e, index, setShowGptTooltip)}
								onMouseLeave={(e) => handleMouseLeave(e, index, setShowGptTooltip)}
							/>
						</OverlayTrigger>
					</Col>
				))}
			</Row>
		</Container>
	);
};

export default MessageTable;
