import { ReactFlowProvider } from "@xyflow/react";
import Flow from './components/FlowDiagram/FlowDiagram';

const App = () => {

	// The Flow component renders the ReactFlow component with the nodes and edges arrays as props. It also renders the Controls, MiniMap, and Background components.
	return (
		<ReactFlowProvider>
			<Flow/>
		</ReactFlowProvider>
	);
};

export default App;