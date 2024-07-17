import React from "react";
import "./SidePanel.css";

const SidePanel = ({ isOpen, onClose }) => {
	return (
		<div className={`side-panel ${isOpen ? "open" : ""}`}>
			<button className="close-button" onClick={onClose}>
				X
			</button>
			<div className="content">
				<h2>Side Panel</h2>
				<p>This is a side panel that appears on the right side of the app.</p>
			</div>
		</div>
	);
};

export default SidePanel;
