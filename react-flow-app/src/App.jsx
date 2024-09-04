import { ReactFlowProvider } from "@xyflow/react";
import Flow from "./components/FlowDiagram/FlowDiagram";
import { useState, useEffect } from "react";
import { useNavPanel } from "./hooks/useNavPanel";
import SidePanel from "./components/NodeSpacePanel/SidePanel";
import { sendMessageToBackground } from "./util/chromeMessagingService";
import * as Constants from "./util/constants";
import { Button } from "react-bootstrap";

// Initial node spaces structure, can be populated as needed.
const initialNodeSpaces = {
	node_1: { title: "Node 1 Title Extra Long Title" },
	node_2: { title: "Node 2" },
};

/**
 * Main entry point of the application.
 * @returns {JSX.Element} The rendered App component.
 */
const App = () => {
	// State to control the visibility of the side panel
	const [isPanelOpen, { togglePanel }] = useNavPanel(false);

	// State to manage node spaces and the currently active space
	const [nodeSpaces, setSpaces] = useState([]); // Set initial state with empty array
	const [activeSpace, setActiveSpace] = useState(null); // Initially, no active space

	// useEffect to notify the Chrome extension that the React app has mounted
	useEffect(() => {
		console.log("Sending message to background script to notify that React app has mounted");

		// Send a message to the background script to notify that the React app has mounted
		sendMessageToBackground(Constants.REACT_APP_MOUNTED)
			.then((response) => {
				if (!response.status) {
					console.error("Failed to send message to background script:", response.error);
					return;
				}

				// Extract node space data from the response
				console.log("Received data from background script:", response.data);
				const { node_space_keys, active_node_space } = response.data;
				
				// Update state with received node spaces and active space
				setSpaces(node_space_keys || []);
				setActiveSpace(active_node_space);
			})
			.catch((error) => {
				console.error("Unexpected error while communicating with background script:", error);
			});
	}, [setSpaces]);

	// Function to handle updating the active space
	const handleUpdateActiveSpace = (spaceId) => {
		console.log(`Selected workspace ID: ${spaceId}`);
		setActiveSpace(spaceId);
	};

	// Function to handle updating the list of node spaces
	const handleUpdateNodeSpaces = (spaces) => {
		console.log("Updating node spaces", spaces);
		setSpaces(spaces);
	};

	return (
		<ReactFlowProvider>
			{/* Button to toggle side panel */}
			{!isPanelOpen && (
				<Button
					variant="light"
					className="shadow-sm border border-light position-fixed m-3 rounded"
					style={{
						left: "10px",
						top: "10px",
						zIndex: "10",
						padding: "8px 16px",
						fontWeight: "500",
						fontSize: "0.9rem",
						color: "#495057",
						backgroundColor: "#f8f9fa",
						transition: "background-color 0.2s ease-in-out",
					}}
					onClick={togglePanel}
					onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e2e6ea")}
					onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#f8f9fa")}
				>
					{isPanelOpen ? "Close Panel" : "Open Panel"}
				</Button>
			)}

			{/* Main Flow component handling the diagram */}
			<Flow
				activeSpace={activeSpace}
				handleUpdateNodeSpaces={handleUpdateNodeSpaces}
				handleUpdateActiveSpace={handleUpdateActiveSpace}
			/>

			{/* Side panel for managing node spaces */}
			<SidePanel
				isOpen={isPanelOpen}
				onClose={togglePanel}
				nodeSpaces={nodeSpaces}
				activeSpace={activeSpace}
				onChangeActiveSpace={handleUpdateActiveSpace}
			/>
		</ReactFlowProvider>
	);
};

export default App;
