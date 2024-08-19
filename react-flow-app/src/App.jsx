import { ReactFlowProvider } from "@xyflow/react";
import Flow from './components/FlowDiagram/FlowDiagram';
import { useState } from 'react';

import {useNavPanel} from './hooks/useNavPanel';
import SidePanel from './components/NodeSpacePanel/SidePanel';

import { sendMessageToBackground } from "./helper/chromeMessagingService";
import * as Constants from "./helper/constants";

const App = () => {
	const [isPanelOpen, togglePanel] = useNavPanel(false);

	// useEffect for initial setup
	useEffect(() => {
		sendMessageToBackground(Constants.REACT_GET_NODE_SPACE_KEYS).then((response) => {
			if (!response.status) {
				console.error("Error getting space keys");
			}
			const nodeSpaceKeys = response.data;
			setSpace(nodeSpaceKeys);

			console.log("React Application - Received Space Keys");
			console.log(response);
		});
	}, []);

	// The Flow component renders the ReactFlow component with the nodes and edges arrays as props. It also renders the Controls, MiniMap, and Background components.
	return (
		<ReactFlowProvider>
			<button
				onClick={togglePanel}
				className="p-2 m-4 bg-blue-500 text-white rounded-lg focus:outline-none hover:bg-blue-600 transition-colors"
			>
				{isPanelOpen ? "Close Panel" : "Open Panel"}
			</button>
			<Flow />
			<SidePanel isOpen={isPanelOpen} onClose={togglePanel} />
		</ReactFlowProvider>
	);
};

export default App;