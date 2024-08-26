import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";

import { sendMessageToBackground } from "../../../../util/chromeMessagingService";
import * as Constants from "../../../../util/constants";

import { showToast } from "../../../toast/toastService"; // Ensure the correct path to your toast function

const TOOLTIP_HEIGHT = 80	// Height of the tooltip in pixels

const MessageButton = ({ node_id, message, message_index, style }) => {
	const [showTooltip, setShowTooltip] = useState(false);
	const [tooltipPosition, setTooltipPosition] = useState({ top: -9999, left: -9999 });
	const [tooltipPlacement, setTooltipPlacement] = useState("top"); // Tracks whether the tooltip is above or below the button
	const [tooltipReady, setTooltipReady] = useState(false); // To control when to show the tooltip after positioning
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
		// Show the tooltip off-screen for measurement
		setTooltipReady(true);

		// Delay the actual showing of the tooltip to allow time for measurement
		timeoutRef.current = setTimeout(() => {
			const buttonRect = buttonRef.current.getBoundingClientRect();
			const tooltipRect = tooltipRef.current.getBoundingClientRect(); // Get tooltip dimensions dynamically

			// Calculate default tooltip position above the button
			let calculatedTop = buttonRect.top - 10; // Position above the button
			let placement = "top"; // Assume top placement by default

			// Check if the tooltip would go out of the viewport above
			if (calculatedTop - tooltipRect.height < 0) {
				// If the tooltip would go out of the viewport at the top, place it below
				calculatedTop = buttonRect.bottom + 10; // Position below the button
				placement = "bottom";
			} else if (buttonRect.bottom + tooltipRect.height > window.innerHeight) {
				// If the tooltip would go out of the viewport at the bottom, place it above
				calculatedTop = buttonRect.top - 10; // Position above the button
				placement = "top";
			}

			// Calculate horizontal position
			let calculatedLeft = buttonRect.left + buttonRect.width / 2;

			// Ensure the tooltip does not go beyond the left edge of the viewport
			if (calculatedLeft - tooltipRect.width / 2 < 0) {
				calculatedLeft = tooltipRect.width / 2 + 10; // Align to the left edge
			}

			// Ensure the tooltip does not go beyond the right edge of the viewport
			if (calculatedLeft + tooltipRect.width / 2 > window.innerWidth) {
				calculatedLeft = window.innerWidth - tooltipRect.width / 2 - 10; // Align to the right edge
			}

			// Set tooltip position and placement state
			setTooltipPosition({
				top: calculatedTop,
				left: calculatedLeft,
			});
			setTooltipPlacement(placement);
			setShowTooltip(true); // Finally, show the tooltip after positioning
		}, 400); // Delay for measurement and positioning
	};

	const handleMouseLeave = () => {
		clearTimeout(timeoutRef.current); // Clear the delay if the user moves the mouse away before it shows
		// Hide the tooltip if the mouse is not over it
		setTimeout(() => {
			if (!tooltipRef.current?.matches(":hover") && !buttonRef.current?.matches(":hover")) {
				setShowTooltip(false);
				setTooltipReady(false); // Hide the tooltip off-screen when not in use
			}
		}, 100);
	};

	const handleTooltipLeave = () => {
		setTimeout(() => {
			if (!tooltipRef.current?.matches(":hover") && !buttonRef.current?.matches(":hover")) {
				setShowTooltip(false);
				setTooltipReady(false); // Hide the tooltip off-screen when not in use
			}
		}, 100);
	};

	const Tooltip = tooltipReady ? (
		<div
			ref={tooltipRef}
			className="fixed bg-orange-100 rounded-md px-3 py-2 w-[20rem] max-h-[10rem] overflow-y-auto shadow-lg text-s text-center"
			style={{
				top: `${tooltipPosition.top}px`, // Use the calculated top position
				left: `${tooltipPosition.left}px`, // Use the calculated left position
				transform: "translateX(-50%)" + (tooltipPlacement === "top" ? " translateY(-100%)" : ""),
				visibility: showTooltip ? "visible" : "hidden", // Hide the tooltip until it's positioned
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
