import { useState, useRef } from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import { sendMessageToBackground } from "../../../../util/chromeMessagingService";
import * as Constants from "../../../../util/constants";
import { showToast } from "../../../toast/toastService"; // Ensure the correct path to your toast function

/**
 * MessageButton component.
 * @component
 * @param {Object} props - The component props.
 * @param {string} props.node_id - The ID of the node.
 * @param {string} props.message - The message to display in the tooltip.
 * @param {number} props.message_index - The index of the message.
 * @param {string} props.style - The style of the button.
 * @returns {JSX.Element} The rendered MessageButton component.
 */
const MessageButton = ({ node_id, message, message_index, style }) => {
	const [showTooltip, setShowTooltip] = useState(false);
	const [tooltipPosition, setTooltipPosition] = useState({ top: -9999, left: -9999 });
	const [tooltipPlacement, setTooltipPlacement] = useState("top"); // Tracks tooltip placement (top/bottom)
	const [tooltipReady, setTooltipReady] = useState(false); // Controls when the tooltip is ready to show
	const buttonRef = useRef(null);
	const tooltipRef = useRef(null);
	const timeoutRef = useRef(null);

	// Handle button click to send a message to the background script
	const handleButtonClick = () => {
		const data = {
			node_id: node_id,
			message_index: message_index,
		};

		// Hide the tooltip when the button is clicked
		setShowTooltip(false);
		setTooltipReady(false);

		// Send a message to the background script to open the chat
		sendMessageToBackground(Constants.HANDLE_OPEN_NODE_CHAT, data)
			.then((response) => {
				if (!response.status) {
					showToast("Error opening chat", "error");
					return;
				}
			})
			.catch((error) => {
				console.error("Error opening chat:", error);
				showToast("An unexpected error occurred", "error");
			});
	};

	// Handle mouse entering the button to display the tooltip
	const handleMouseEnter = () => {
		// Prepare the tooltip for display
		setTooltipReady(true);

		// Delay the tooltip display for positioning purposes
		timeoutRef.current = setTimeout(() => {
			const buttonRect = buttonRef.current.getBoundingClientRect();
			const tooltipRect = tooltipRef.current.getBoundingClientRect();

			// Calculate vertical position and handle edge cases
			let calculatedTop = buttonRect.top - 10;
			let placement = "top";

			// Check if tooltip would go out of viewport above
			if (calculatedTop - tooltipRect.height < 0) {
				calculatedTop = buttonRect.bottom + 10; // Place tooltip below
				placement = "bottom";
			} else if (buttonRect.bottom + tooltipRect.height > window.innerHeight) {
				calculatedTop = buttonRect.top - 10; // Keep it above
				placement = "top";
			}

			// Calculate horizontal position
			let calculatedLeft = buttonRect.left + buttonRect.width / 2;

			// Adjust horizontal position to prevent overflow on the left side
			if (calculatedLeft - tooltipRect.width / 2 < 0) {
				calculatedLeft = tooltipRect.width / 2 + 10;
			}

			// Adjust horizontal position to prevent overflow on the right side
			if (calculatedLeft + tooltipRect.width / 2 > window.innerWidth) {
				calculatedLeft = window.innerWidth - tooltipRect.width / 2 - 10;
			}

			// Set tooltip position and show it
			setTooltipPosition({ top: calculatedTop, left: calculatedLeft });
			setTooltipPlacement(placement);
			setShowTooltip(true);
		}, 400); // Small delay for positioning
	};

	// Handle mouse leaving the button to hide the tooltip
	const handleMouseLeave = () => {
		clearTimeout(timeoutRef.current); // Cancel the delayed tooltip display
		setTimeout(() => {
			if (!tooltipRef.current?.matches(":hover") && !buttonRef.current?.matches(":hover")) {
				setShowTooltip(false);
				setTooltipReady(false);
			}
		}, 100);
	};

	// Handle tooltip leave event to hide it
	const handleTooltipLeave = () => {
		setTimeout(() => {
			if (!tooltipRef.current?.matches(":hover") && !buttonRef.current?.matches(":hover")) {
				setShowTooltip(false);
				setTooltipReady(false);
			}
		}, 100);
	};

	// Tooltip component (conditionally rendered when ready)
	const Tooltip = tooltipReady ? (
		<div
			ref={tooltipRef}
			className="fixed bg-orange-100 rounded-lg px-3 py-2 w-[20rem] max-h-[10rem] overflow-y-auto shadow-lg text-s text-center"
			style={{
				top: `${tooltipPosition.top}px`,
				left: `${tooltipPosition.left}px`,
				transform: `translateX(-50%)${tooltipPlacement === "top" ? " translateY(-100%)" : ""}`,
				visibility: showTooltip ? "visible" : "hidden",
			}}
			onMouseEnter={() => clearTimeout(timeoutRef.current)} // Prevent hiding when hovering over tooltip
			onMouseLeave={handleTooltipLeave} // Handle mouse leave on tooltip
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

			{/* Render the tooltip using a portal to the body */}
			{ReactDOM.createPortal(Tooltip, document.body)}
		</>
	);
};

export default MessageButton;

MessageButton.propTypes = {
	node_id: PropTypes.string.isRequired,
	message: PropTypes.string.isRequired,
	message_index: PropTypes.number.isRequired,
	style: PropTypes.string.isRequired,
};
