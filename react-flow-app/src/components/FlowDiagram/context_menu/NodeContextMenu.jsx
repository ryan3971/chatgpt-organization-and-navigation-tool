import "./NodeContextMenu.css";
import * as Constants from "../../../util/constants";
import {sendMessageToBackground} from "../../../util/chromeMessagingService";

export default function NodeContextMenu({ id, top, left, right, bottom, ...props }) {

	// send a message to chrome passing the id to the node when button is clicked
	const handleOpenChat = () => {
		console.log("Opening chat for node", id);

		data = {
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
	

	return (
		<div style={{ top, left, right, bottom }} className="context-menu" {...props}>
			<p style={{ margin: "0.5em" }}>
				<small>node: {id}</small>
			</p>
			<button onClick={handleOpenChat}>Open Chat</button>
		</div>
	);
}
