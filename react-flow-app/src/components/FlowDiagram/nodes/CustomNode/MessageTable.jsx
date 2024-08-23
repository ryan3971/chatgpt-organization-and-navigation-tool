import React, { useEffect, useState, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, Container, Row, Col, Overlay, Tooltip } from "react-bootstrap";

import { sendMessageToBackground } from "../../../../util/chromeMessagingService";
import * as Constants from "../../../../util/constants";

import { showToast } from '../../../toast/toastService'; // Ensure the correct path to your toast function

const MessageTable = ({ node_id, messages, refs }) => {
	const [showTooltip, setShowTooltip] = useState({});
	const tooltipTimeout = useRef(null);
	
	useEffect(() => {
		const handleWindowBlur = () => {
			// If the document is hidden (e.g., window minimized or tab switched)
			if (document.hidden) {
				// Hide all tooltips when the document becomes hidden
				setShowTooltip({});
				clearTimeout(tooltipTimeout.current);
			}
		};

		// Listen for visibility changes
		window.addEventListener("blur", handleWindowBlur);

		// Cleanup the event listener when the component unmounts
		return () => {
			window.removeEventListener("blur", handleWindowBlur);
		};
	}, []);

	const handleMouseEnter = (event, index) => {
		// Set the background color of the button to a light blue when hovered
		event.currentTarget.style.backgroundColor = "#e6f3ff";

		showToast("Click to open chat", { type: "error" });

		// Show the tooltip after a small delay
		tooltipTimeout.current = setTimeout(() => {
			setShowTooltip((prev) => ({ ...prev, [index]: true }));
		}, 200); // Adding a small delay to prevent flickering when quickly hovering over items
	};

	const handleMouseLeave = (event, index) => {
		// Set the background color of the button back to white when not hovered
		event.currentTarget.style.backgroundColor = "#fff";

		// Hide the tooltip
		clearTimeout(tooltipTimeout.current);
		setShowTooltip((prev) => ({ ...prev, [index]: false }));
	};

	useEffect(() => {
		// Create references for each message button if not already created
		messages.forEach((msg, index) => {
			if (!refs.current[index]) {
				refs.current[index] = React.createRef();
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
				showToast("Error opening chat", { type: "error" });
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
			<Row className="h-50 flex-nowrap">
				{messages.map((msg, index) => {
					if (index % 2 === 0) { 
						// User messages (even indices)
						return (
							<Col
								key={`user-${index}`}
								xs="auto"
								className="p-1"
							>
								<Button
									ref={refs.current[index]}
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
									onMouseEnter={(e) => handleMouseEnter(e, index)}
									onMouseLeave={(e) => handleMouseLeave(e, index)}
								/>
								{refs.current[index] && refs.current[index].current && (
									<Overlay
										target={refs.current[index].current}
										show={showTooltip[index]}
										placement="top"
									>
										{renderTooltip(msg)}
									</Overlay>
								)}
							</Col>
						);
					}
					return null;
				})}
			</Row>

			<Row className="h-50 mt-3 flex-nowrap">
				{messages.map((msg, index) => {
					if (index % 2 !== 0) {
						// GPT messages (odd indices)
						return (
							<Col
								key={`gpt-${index}`}
								xs="auto"
								className="p-1"
							>
								<Button
									ref={refs.current[index]}
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
									onMouseEnter={(e) => handleMouseEnter(e, index)}
									onMouseLeave={(e) => handleMouseLeave(e, index)}
								/>
								{refs.current[index] && refs.current[index].current && (
									<Overlay
										target={refs.current[index].current}
										show={showTooltip[index]}
										placement="top"
									>
										{renderTooltip(msg)}
									</Overlay>
								)}
							</Col>
						);
					}
					return null;
				})}
			</Row>
		</Container>
	);
};

export default MessageTable;
