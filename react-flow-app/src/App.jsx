import { ReactFlowProvider } from "@xyflow/react";
import Flow from "./components/FlowDiagram/FlowDiagram";
import { useState, useEffect } from "react";

import { useNavPanel } from "./hooks/useNavPanel";
import SidePanel from "./components/NodeSpacePanel/SidePanel";

import { sendMessageToBackground } from "./util/chromeMessagingService";
import * as Constants from "./util/constants";

import { Button } from "react-bootstrap";

// const initialSpaceKeys = [1, 2, 3, 4, 5];

// import gpt_image from "./assets/gpt_logo.png";

const initialNodeSpaces = {
	node_1: { title: "Node 1 Title Extra Long Title" },
	node_2: { title: "Node 2" },

	// 	{ id: 2, title: "Nodespace 2", imageUrl: gpt_image, infoText: "Info 2" },
	// 	{ id: 3, title: "Nodespace 3", imageUrl: gpt_image, infoText: "Info 3" },
};


const App = () => {
	const [isPanelOpen, { togglePanel }] = useNavPanel(false);
	const [nodeSpaces, setSpaces] = useState(initialNodeSpaces);
	const [activeSpace, setActiveSpace] = useState(null);

	// useEffect to tell the chrome application that react app has mounted
	// useEffect(() => {
	// 	console.log("Sending message to background script to notify that React app has mounted");
	// 	sendMessageToBackground(Constants.REACT_APP_MOUNTED).then((response) => {
	// 		if (!response.status) {
	// 			console.error("Error sending message to background script");
	// 			return;
	// 		}

	// 		const node_spaces = response.data;
	// 		setSpaces(node_spaces);
	// 	});
	// }, [setSpaces]);

	const handleUpdateActiveSpace = (spaceId) => {
		console.log(`Selected workspace ID: ${spaceId}`);
		setActiveSpace(spaceId);
	};

	const handleUpdateNodeSpaces = (spaces) => {
		console.log("Updating node spaces", spaces);
		setSpaces(spaces);
	};

	// The Flow component renders the ReactFlow component with the nodes and edges arrays as props. It also renders the Controls, MiniMap, and Background components.
	return (
		<ReactFlowProvider>
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
			<Flow
				activeSpace={activeSpace}
				handleUpdateNodeSpaces={handleUpdateNodeSpaces}
			/>
			<SidePanel
				isOpen={isPanelOpen}
				onClose={togglePanel}
				nodeSpaces={nodeSpaces}
				onChangeActiveSpace={handleUpdateActiveSpace}
			/>
		</ReactFlowProvider>
	);
};

export default App;
