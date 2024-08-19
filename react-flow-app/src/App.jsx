import { ReactFlowProvider } from "@xyflow/react";
import Flow from "./components/FlowDiagram/FlowDiagram";
import { useState, useEffect } from "react";

import { useNavPanel } from "./hooks/useNavPanel";
import SidePanel from "./components/NodeSpacePanel/SidePanel";

import { sendMessageToBackground } from "./util/chromeMessagingService";
import * as Constants from "./util/constants";

//const initialSpaceKeys = [1, 2, 3, 4, 5];

const App = () => {
	const [isPanelOpen, { togglePanel }] = useNavPanel(false);
	const [nodeSpaces, setSpaces] = useState([]);
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
				<button
					onClick={togglePanel}
					className="m-5 p-5 fixed left-0 top-0 h-50 w-100 bg-blue-500 text-white rounded-lg focus:outline-none hover:bg-blue-600 transition-colors z-10"
				>
					{isPanelOpen ? "Close Panel" : "Open Panel"}
				</button>
			)}
			<Flow
				className="h-screen w-screen z-1"
				nodeSpaces={nodeSpaces}
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
