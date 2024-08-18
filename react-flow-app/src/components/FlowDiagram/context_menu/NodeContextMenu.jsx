import "./NodeContextMenu.css";
import * as Constants from "../helper/constants";
import {sendMessageToBackground} from "../helper/chromeMessagingService";

export default function NodeContextMenu({ id, top, left, right, bottom, ...props }) {

	function handleDeleteNode()	{
		console.log("React Application - Deleting Node");
		const response = sendMessageToBackground(Constants.HANDLE_NODE_DELETION, { node_id: id });
		if (!response) {
			console.error("Error deleting node");
		}
	}
	
	function handleOpenChat()	{
		console.log("React Application - Opening Chat");
		// const response = sendMessageToBackground(Constants.REACT_OPEN_CHAT, { node_id: id });
		// if (!response) {
		// 	console.error("Error opening chat");
		// }
	}

	return (
		<div style={{ top, left, right, bottom }} className="context-menu" {...props}>
			<p style={{ margin: "0.5em" }}>
				<small>node: {id}</small>
			</p>
			<button onClick={handleDeleteNode}>Delete Chat</button>
			<button onClick={handleOpenChat}>Open Chat</button>
		</div>
	);
}
