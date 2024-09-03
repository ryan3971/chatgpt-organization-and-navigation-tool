import { useState } from "react";

/**
 * Custom hook to manage the state of a navigation panel.
 *
 * @param {boolean} initialState - The initial state of the panel (open or closed).
 * @returns {Array} - An array containing the current state of the panel and an object with a toggle function.
 */
export const useNavPanel = (initialState = false) => {
	const [isPanelOpen, setIsPanelOpen] = useState(initialState); // State to track if the panel is open

	/**
	 * Function to toggle the panel's open/closed state.
	 */
	const togglePanel = () => {
		setIsPanelOpen(!isPanelOpen); // Toggle the panel state
	};

	return [isPanelOpen, { togglePanel }]; // Return the current state and toggle function
};
