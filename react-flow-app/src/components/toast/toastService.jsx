import { Toast, ToastContainer } from "react-bootstrap";
import { createRoot } from "react-dom/client";

const TOAST_TIMEOUT = 3000; // Toast display duration in milliseconds

let toastRoot = null; // Global variable to hold the root for the toast

// Custom color mapping for borders based on the variant using Tailwind CSS classes
const borderColorMap = {
	info: "border-blue-200", // Light blue
	error: "border-red-200", // Light red
	success: "border-green-200", // Light green
	// Additional mappings can be added here as needed
};

/**
 * Displays a toast message.
 *
 * @param {string} message - The message to display in the toast.
 * @param {string} type - The variant type of the toast ('info', 'error', 'success', etc.).
 */
export function showToast(message, type = "info") {
	// Create the toast container if it doesn't exist
	if (!toastRoot) {
		const container = document.createElement("div");
		document.body.appendChild(container);
		toastRoot = createRoot(container); // Create the root using React 18
	}

	console.log(`Showing toast message: ${message}`);
	console.log(`Toast type: ${type}`);
	// Get the corresponding border color based on the variant
	const borderColor = borderColorMap[type] || borderColorMap.info;
	console.log(`Toast border color: ${borderColor}`);
	// Generate a unique ID for the toast component
	const toastId = Math.random().toString(12);

	// Toast component to display the message
	const ToastComponent = () => (
		<ToastContainer className="fixed bottom-5 left-1/2 transform -translate-x-1/2 z-50">
			<Toast
				autohide
				delay={TOAST_TIMEOUT}
				className={`bg-white text-center rounded-md shadow-lg border-2 ${borderColor} w-auto max-w-[50vw] min-w-52 opacity-75 break-words`}
				style={{ whiteSpace: "normal" }}
			>
				<Toast.Body className="text-sm">{message}</Toast.Body>
			</Toast>
		</ToastContainer>
	);

	// Render the toast in the toast container
	toastRoot.render(<ToastComponent key={toastId} />);

	// Automatically remove the toast after the timeout
	setTimeout(() => {
		if (!toastRoot) return; // Exit if the root is already null
		toastRoot.unmount(); // Unmount the toast
		toastRoot = null; // Reset toastRoot for future toasts
	}, TOAST_TIMEOUT); // Ensure this matches the autohide delay
}
