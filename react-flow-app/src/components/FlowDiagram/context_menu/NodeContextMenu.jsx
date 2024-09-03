import { useEffect, useRef } from "react";
import * as Constants from "../../../util/constants";
import { sendMessageToBackground } from "../../../util/chromeMessagingService";
import { showToast } from "../../toast/toastService"; // Ensure the correct path to your toast function

/**
 * NodeContextMenu component.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {string} props.id - The ID of the node.
 * @param {number} props.top - The top position of the context menu.
 * @param {number} props.left - The left position of the context menu.
 * @param {number} props.right - The right position of the context menu.
 * @param {number} props.bottom - The bottom position of the context menu.
 * @param {Function} props.onCloseContextMenu - The function to close the context menu.
 * @returns {JSX.Element} The NodeContextMenu component.
 */
export default function NodeContextMenu({ id, top, left, right, bottom, onCloseContextMenu, ...props }) {
	const menuRef = useRef(null); // Reference to the context menu element

	/**
	 * Handles opening the chat for a node.
	 */
	const handleOpenChat = () => {
		console.log("Opening chat for node", id);

		// Close the context menu first
		onCloseContextMenu();

		// Create the data object to send to the background script
		const data = {
			node_id: id,
			message_index: null,
		};

		// Send a message to the background script to open the chat
		sendMessageToBackground(Constants.HANDLE_OPEN_NODE_CHAT, data).then((response) => {
			if (!response.status) {
				showToast("Error opening chat", { type: "error" });
				return;
			}
		});
	};

	/**
	 * useEffect hook to close the context menu when a click is detected outside of it.
	 */
	useEffect(() => {
		/**
		 * Function to close the context menu when a click is detected outside of it.
		 * @param {MouseEvent} e - The mouse event.
		 */
		const handleOutsideClick = (e) => {
			if (menuRef.current && !menuRef.current.contains(e.target)) {
				onCloseContextMenu(); // Close the menu if the click is outside the menu
			}
		};

		// Listen for mousedown events to detect clicks outside the context menu
		window.addEventListener("mousedown", handleOutsideClick, true);

		// Cleanup the event listener on component unmount
		return () => {
			window.removeEventListener("mousedown", handleOutsideClick, true);
		};
	}, [onCloseContextMenu]);

	return (
		<div
			ref={menuRef} // Assign the ref to the context menu element
			style={{ top, left, right, bottom }}
			className="bg-white border shadow-lg absolute z-10"
			{...props}
		>
			<button
				className="border-0 block p-2 text-left w-full hover:bg-white"
				onClick={handleOpenChat}
			>
				Open Chat
			</button>
		</div>
	);
}
