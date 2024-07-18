import React, { useState, useCallback, useEffect } from "react";
import {
	ReactFlowProvider,
} from "@xyflow/react";

import Flow from './Flow';

import SidePanel from './components/SidePanel/SidePanel';
import './components/SidePanel/SidePanel.css';

const App = () => {

	const [isPanelOpen, setIsPanelOpen] = useState(false);

	// The togglePanel function is called when the Toggle Side Panel button is clicked. It toggles the isPanelOpen state.
	const togglePanel = () => {
		setIsPanelOpen(!isPanelOpen);
	};

	// The Flow component renders the ReactFlow component with the nodes and edges arrays as props. It also renders the Controls, MiniMap, and Background components.
	return (
		<ReactFlowProvider>
			<Flow togglePanel={togglePanel} />
			<SidePanel isOpen={isPanelOpen} onClose={togglePanel} />
		</ReactFlowProvider>
	);
};

export default App;
