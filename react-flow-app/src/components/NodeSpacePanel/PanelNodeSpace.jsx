import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, Image, Form } from "react-bootstrap";
import ContextMenu from "./PanelContextMenu"; // Import the new ContextMenu component

import * as Constants from "../../util/constants";

import { sendMessageToBackground } from "../../util/chromeMessagingService";
import { showToast } from "../toast/toastService";

export const PanelNodeSpace = ({ id, onClick, title, imageUrl, infoText }) => {
	const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0 });
	const [isEditing, setIsEditing] = useState(false);
	const [titleText, setTitleText] = useState(infoText);

	// Use Effect to handle reamed node space title
	useEffect(() => {

		if (isEditing) return;
		console.log("Renaming nodespace", id, titleText);

		const data = {
			node_space_id: id,
			new_title: titleText,
		};

		// send a message to the chrome background script to open a chat window
		// sendMessageToBackground(Constants.REACT_UPDATE_NODE_SPACE_TITLE, data).then((response) => {
		// 	if (!response.status) {
		// 		showToast("Error renaming the Nodespace", { type: "error" });
		// 		return;
		// 	}
		// 	showToast("Nodespace renamed successfully", { type: "success" });
		// });

	}, [isEditing, id, titleText]);

	// useEffect to handle Space deletion
	// useEffect(() => {

	// 	const data = {
	// 		node_space_id: id,
	// 	};

	// 	// send a message to the chrome background script to open a chat window
	// 	sendMessageToBackground(Constants.REACT_DELETE_NODE_SPACE, data).then((response) => {
	// 		if (!response.status) {
	// 			showToast("Error deleting space", { type: "error" });
	// 			return;
	// 		}
	// 		console.log("Message sent to background script");
	// 	});

	// }, []);

	// Handle right-click context menu
	const handleContextMenu = (e) => {
		e.preventDefault(); // Prevent the default browser context menu
		setContextMenu({
			visible: true,
			x: e.clientX,
			y: e.clientY,
		});
	};

	// Close the context menu
	const handleCloseContextMenu = () => {
		setContextMenu({ ...contextMenu, visible: false });
	};

	// Handle the rename space click; enter edit mode
	const handleEditClick = () => {
		// close the context menu first
		handleCloseContextMenu();

		// Enter edit mode
		setIsEditing(true);
	};

	// Handle input change; update the title text
	const handleInputChange = (e) => {
		setTitleText(e.target.value);
	};

	// Handle input blur (i.e., when the input loses focus)
	const handleInputBlur = () => {
		setIsEditing(false);
	};

	// Handle input key press; exit editing mode when pressing Enter
	const handleInputKeyPress = (e) => {
		if (e.key === "Enter") {
			setIsEditing(false); // Exit editing mode when pressing Enter
		}
	};

	return (
		<>
			<Button
				variant="light"
				className="d-flex flex-column p-2 align-items-start w-full h-full"
				onClick={() => onClick(id)}
				onContextMenu={handleContextMenu}
				style={{ width: "100%", height: "auto" }}
			>
				<h5 className="mb-2 font-bold">{title}</h5>

				<div className="d-flex align-items-center w-100">
					<Image
						src={imageUrl}
						rounded
						style={{ width: "40px", height: "40px" }}
						className="me-2"
					/>
					{/* Conditional rendering: either display input or text */}
					{!isEditing ? (
						<div
							className="text-left pb-1 font-semibold text-2xl leading-5 line-clamp-2 overflow-hidden text-ellipsis"
							style={{ width: "100%", height: "100%" }}
							//	onClick={handleEditClick} // Allow clicking the text to enter edit mode
						>
							<small>{titleText}</small>
						</div>
					) : (
						<Form.Control
							type="text"
							value={titleText}
							onChange={handleInputChange}
							onBlur={handleInputBlur}
							onKeyDown={handleInputKeyPress}
							autoFocus
							className="w-100"
						/>
					)}
				</div>
			</Button>

			{/* Render the context menu */}
			<ContextMenu
				visible={contextMenu.visible}
				x={contextMenu.x}
				y={contextMenu.y}
				onClose={handleCloseContextMenu}
				onRenameSpace={handleEditClick}
			/>
		</>
	);
};

export default PanelNodeSpace;
