import React, { useEffect, useState, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, Container, Row, Col, Overlay, Tooltip } from "react-bootstrap";

import { sendMessageToBackground } from "../../../../util/chromeMessagingService";
import * as Constants from "../../../../util/constants";

import { showToast } from "../../../toast/toastService"; // Ensure the correct path to your toast function

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
		showToast("Click to open chat", { type: "error" });

		// Show the tooltip after a small delay
		tooltipTimeout.current = setTimeout(() => {
			setShowTooltip((prev) => ({ ...prev, [index]: true }));
		}, 200); // Adding a small delay to prevent flickering when quickly hovering over items
	};

	const handleMouseLeave = (event, index) => {
		// Set the background color of the button back to white when not hovered
		//event.currentTarget.style.backgroundColor = "#fff";

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

	const renderColumns = (messages) => {
		let listItems = [];
		for (let index = 0; index < messages.length; index = index + 2) {
			let userMessage = messages[index];
			let gptMessage = messages[index + 1];

			let column = (
				<Col
					key={index}
					xs="auto"
					className="px-[0.5rem]"
				>
					{renderButton(index)}
					{renderOverlay(userMessage, index)}
					{renderButton(index + 1)}
					{renderOverlay(gptMessage, index + 1)}
				</Col>
			);

			listItems.push(column);
		}
		return listItems;
	};

	const renderButton = (index) => {
		let isUser;
		if (index % 2 === 0) {
			isUser = true;
		} else {
			isUser = false;
		}

		return (
			<div className="relative w-6 h-6">
				{isUser && (
					<button
						ref={refs.current[index]}
						className="absolute top-0 left-0 w-full h-full bg-blue-100 rounded-t-full hover:bg-blue-300 transition-colors duration-200"
						onClick={() => handleButtonClick(node_id, index)}
						onMouseEnter={(e) => handleMouseEnter(e, index)}
						onMouseLeave={(e) => handleMouseLeave(e, index)}
					/>
				)}
				{!isUser && (
					<button
						ref={refs.current[index]}
						className="absolute bottom-0 left-0 w-full h-full bg-slate-100 rounded-b-full hover:bg-slate-300 transition-colors duration-200"
						onClick={() => handleButtonClick(node_id, index)}
						onMouseEnter={(e) => handleMouseEnter(e, index)}
						onMouseLeave={(e) => handleMouseLeave(e, index)}
					/>
				)}
			</div>
		);
	};

	const renderTooltip = (msg) => (
		<Tooltip
			id="button-tooltip"
			style={{ maxWidth: "200px", opacity: 0.85 }}
		>
			{msg}
		</Tooltip>
	);

	const renderOverlay = (msg, index) => {
		if (refs.current[index] && refs.current[index].current) {
			return (
				<Overlay
					target={refs.current[index].current}
					show={showTooltip[index]}
					placement="top"
				>
					{renderTooltip(msg)}
				</Overlay>
			);
		}
		return null;
	};

	return (
		<Container
			fluid
			className="border border-light bg-white shadow-sm rounded p-3"
		>
			<Row className="h-50 flex-nowrap justify-center">{renderColumns(messages)}</Row>
		</Container>
	);
};

export default MessageTable;
