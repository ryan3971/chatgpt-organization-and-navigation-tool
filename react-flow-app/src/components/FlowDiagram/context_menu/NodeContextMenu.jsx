import { useEffect, useRef } from "react";
import "./NodeContextMenu.css";
import * as Constants from "../../../util/constants";
import { sendMessageToBackground } from "../../../util/chromeMessagingService";

import { showToast } from '../../toast/toastService'; // Ensure the correct path to your toast function


export default function NodeContextMenu({ id, top, left, right, bottom, onCloseContextMenu, ...props }) {
	const menuRef = useRef(null); // Reference to the context menu element

	// send a message to chrome passing the id to the node when button is clicked
	const handleOpenChat = () => {
		console.log("Opening chat for node", id);

		// close the context menu first
		onCloseContextMenu();

		const data = {
			node_id: id,
			message_index: null,
		};

		sendMessageToBackground(Constants.HANDLE_OPEN_NODE_CHAT, data).then((response) => {
			if (!response.status) {
				showToast("Error opening chat", { type: "error" });
				return;
			}
		});
	};

	useEffect(() => {
		// Function to close the context menu when a click is detected outside
		const handleOutsideClick = (e) => {
			if (menuRef.current && !menuRef.current.contains(e.target)) {
				onCloseContextMenu(); // Close the menu if the click is outside the menu
			}
		};

		// Listen for mousedown events
		window.addEventListener("mousedown", handleOutsideClick, true);

		// Cleanup the event listener on component unmount
		return () => {
			document.removeEventListener("mousedown", handleOutsideClick, true);
		};
	}, [onCloseContextMenu]);

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
