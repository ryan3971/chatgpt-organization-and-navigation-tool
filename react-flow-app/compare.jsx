import React, { useEffect, useRef } from "react";
import "./NodeContextMenu.css";
import * as Constants from "../../../util/constants";
import { sendMessageToBackground } from "../../../util/chromeMessagingService";

export default function NodeContextMenu({ id, top, left, right, bottom, onClose, ...props }) {
	const menuRef = useRef(null); // Reference to the context menu element

	// Function to handle opening chat for a node
	const handleOpenChat = () => {
		console.log("Opening chat for node", id);

		const data = {
			node_id: id,
			message_index: null,
		};

		sendMessageToBackground(Constants.HANDLE_OPEN_NODE_CHAT, data).then((response) => {
			if (!response.status) {
				console.error("Error sending message to background script");
				return;
			}
		});
	};

	useEffect(() => {
		// Function to close the context menu when a click is detected outside
		const handleOutsideClick = (e) => {
			if (menuRef.current && !menuRef.current.contains(e.target)) {
				onClose(); // Close the menu if the click is outside the menu
			}
		};

		// Listen for mousedown events
		document.addEventListener("mousedown", handleOutsideClick);

		// Cleanup the event listener on component unmount
		return () => {
			document.removeEventListener("mousedown", handleOutsideClick);
		};
	}, [onClose]);

	return (
		<div
			ref={menuRef} // Assign the ref to the context menu
			style={{ top, left, right, bottom }}
			className="context-menu"
			{...props}
		>
			<button onClick={handleOpenChat}>Open Chat</button>
		</div>
	);
}
