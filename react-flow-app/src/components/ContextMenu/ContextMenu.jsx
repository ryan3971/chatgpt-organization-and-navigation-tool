import React from "react";
import "./ContextMenu.css";

const ContextMenu = ({ x, y, onDelete, openChat }) => {
	return (
		<div className="context-menu" style={{ top: y, left: x }}>
			<button onClick={onDelete}>Delete Node</button>
			<button onClick={openChat}>Open Chat</button>
		</div>
	);
};

export default ContextMenu;
