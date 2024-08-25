import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";


import { sendMessageToBackground } from "../../../../util/chromeMessagingService";
import * as Constants from "../../../../util/constants";

import { showToast } from "../../../toast/toastService"; // Ensure the correct path to your toast function

const MessageButton = ({ node_id, message, message_index, style }) => {
	const [showTooltip, setShowTooltip] = useState(false);
	const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
	const buttonRef = useRef(null);
	const tooltipRef = useRef(null); // Ref for the tooltip
	const timeoutRef = useRef(null);

	const handleButtonClick = () => {
		console.log(`User button clicked at index ${message_index}:`);

		const data = {
			node_id: node_id,
			message_index: message_index,
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

	const handleMouseEnter = () => {
		const buttonRect = buttonRef.current.getBoundingClientRect();

		// Set the tooltip position relative to the button's position
		setTooltipPosition({
			top: buttonRect.top - 10, // Position above the button
			left: buttonRect.left + buttonRect.width / 2, // Center horizontally
		});

		// Show tooltip after 400ms delay
		timeoutRef.current = setTimeout(() => {
			setShowTooltip(true);
		}, 400);
	};

	const handleMouseLeave = () => {
		clearTimeout(timeoutRef.current); // Clear the delay if the user moves the mouse away before it shows
		// We need to check if the mouse is over the tooltip as well
		setTimeout(() => {
			if (!tooltipRef.current?.matches(":hover") && !buttonRef.current?.matches(":hover")) {
				setShowTooltip(false);
			}
		}, 100);
	};

	const handleTooltipLeave = () => {
		setTimeout(() => {
			if (!tooltipRef.current?.matches(":hover") && !buttonRef.current?.matches(":hover")) {
				setShowTooltip(false);
			}
		}, 100);
	};

	const Tooltip = showTooltip ? (
		<div
			ref={tooltipRef}
			className="fixed bg-orange-100 rounded-md px-3 py-2 max-w-[20rem] max-h-[10rem] overflow-y-auto shadow-lg text-s"
			style={{
				top: `${tooltipPosition.top}px`,
				left: `${tooltipPosition.left}px`,
				transform: "translateX(-50%) translateY(-100%)", // Center horizontally and position above the button
			}}
			onMouseEnter={() => clearTimeout(timeoutRef.current)} // Stop hiding when hovering the tooltip
			onMouseLeave={handleTooltipLeave} // Hide when leaving the tooltip
		>
			{message}
		</div>
	) : null;

	return (
		<>
			<button
				ref={buttonRef}
				className={style}
				onClick={handleButtonClick}
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
			></button>

			{ReactDOM.createPortal(Tooltip, document.body)}
		</>
	);
};

export default MessageButton;
