import { useCallback, useState } from "react";

/**
 * Custom hook to manage the state and behavior of a node's context menu.
 *
 * @param {object} ref - A React ref to the pane element where the context menu will be positioned.
 * @param {object|null} initialState - The initial state of the context menu, typically null.
 * @returns {Array} - An array containing the current menu state and an object with handlers for opening and closing the context menu.
 */
export const useNodeContextMenu = (ref, initialState = null) => {
	const [menu, setMenu] = useState(initialState); // State to manage the context menu's visibility and position

	/**
	 * Handler to open the context menu when a node is right-clicked.
	 *
	 * @param {MouseEvent} event - The right-click event.
	 * @param {object} node - The node data where the context menu is triggered.
	 */
	const onNodeContextMenu = useCallback(
		(event, node) => {
			// Prevent the native context menu from showing
			event.preventDefault();

			// Calculate the position of the context menu, ensuring it stays within the pane's bounds
			const pane = ref.current.getBoundingClientRect();
			setMenu({
				id: node.id,
				top: event.clientY < pane.height - 200 ? event.clientY : undefined,
				left: event.clientX < pane.width - 200 ? event.clientX : undefined,
				right: event.clientX >= pane.width - 200 ? pane.width - event.clientX : undefined,
				bottom: event.clientY >= pane.height - 200 ? pane.height - event.clientY : undefined,
			});
		},
		[setMenu, ref]
	);

	/**
	 * Handler to close the context menu.
	 */
	const onCloseContextMenu = useCallback(() => setMenu(null), [setMenu]);

	return [menu, { onNodeContextMenu, onCloseContextMenu }];
};
