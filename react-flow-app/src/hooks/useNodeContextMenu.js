import { useCallback, useState } from "react";

export const useNodeContextMenu = (ref, initialState = null) => {
	const [menu, setMenu] = useState(initialState);

	const onNodeContextMenu = useCallback(
		(event, node) => {
			// Prevent native context menu from showing
			event.preventDefault();

			// Calculate position of the context menu. We want to make sure it
			// doesn't get positioned off-screen.
			const pane = ref.current.getBoundingClientRect();
			setMenu({
				id: node.id,
				top: event.clientY < pane.height - 200 && event.clientY,
				left: event.clientX < pane.width - 200 && event.clientX,
				right: event.clientX >= pane.width - 200 && pane.width - event.clientX,
				bottom: event.clientY >= pane.height - 200 && pane.height - event.clientY,
			});
		},
		[setMenu, ref]
	);

	// Close the context menu if it's open whenever the window is clicked.
	const onCloseContextMenu = useCallback(() => setMenu(null), [setMenu]);

	return [menu, { onNodeContextMenu, onCloseContextMenu }];
};
