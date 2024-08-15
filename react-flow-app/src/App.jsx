import { ReactFlowProvider } from "@xyflow/react";
import Flow from './components/FlowDiagram/FlowDiagram';
import { useState } from 'react';

import SidePanel from './components/NodeSpacePanel/SidePanel';
const App = () => {
	const [isPanelOpen, setIsPanelOpen] = useState(false);
	
	const handleWorkspaceSelect = (workspaceId) => {
			// Logic to load the selected workspace
			console.log(`Selected workspace ID: ${workspaceId}`);
	};

	const togglePanel = () => {
		setIsPanelOpen(!isPanelOpen);
	};

	const closePanel = () => {
		setIsPanelOpen(false);
	};

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
			<SidePanel isOpen={isPanelOpen} onClose={closePanel} onWorkspaceSelect={handleWorkspaceSelect} />
		</ReactFlowProvider>
	);
};

export default App;