import { useCallback, useState } from "react";

export const useNavPanel = (initialState = false) => {
	const [isPanelOpen, setIsPanelOpen] = useState(false);

    // const handleWorkspaceSelect = (workspaceId) => {
    //     // Logic to load the selected workspace
    //     console.log(`Selected workspace ID: ${workspaceId}`);
    // };

    const togglePanel = () => {
        setIsPanelOpen(!isPanelOpen);
    };

	return [isPanelOpen, { togglePanel }];
};
