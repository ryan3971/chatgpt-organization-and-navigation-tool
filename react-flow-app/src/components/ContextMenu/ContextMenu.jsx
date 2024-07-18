import React from "react";
import "./ContextMenu.css";

const ContextMenu = ({ x, y, onDelete }) => {
	return (
		<div className="context-menu" style={{ top: y, left: x }}>
			<button onClick={onDelete}>Delete Node</button>
		</div>
	);
};

export default ContextMenu;
