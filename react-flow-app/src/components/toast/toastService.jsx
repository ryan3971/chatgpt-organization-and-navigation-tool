import { Toast, ToastContainer } from "react-bootstrap";
import { createRoot } from "react-dom/client";

const TOAST_TIMEOUT = 3000; // 5 seconds

let toastRoot = null;

// Custom color mapping for borders in Tailwind
const borderColorMap = {
	info: "border-blue-200", // Light blue
	error: "border-red-200", // Light red
	success: "border-green-200", // Light green
	// Add more mappings as needed
};

export function showToast(message, variant = "info") {
	// Create the toast container if it doesn't exist
	if (!toastRoot) {
		const container = document.createElement("div");
		document.body.appendChild(container);
		toastRoot = createRoot(container); // Create the root for React 18
	}

	// Get the mapped border color or default to light blue for 'info'
	const borderColor = borderColorMap[variant] || "border-blue-200";

	const toastId = Math.random().toString(12) // Unique ID for the toast

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

	// Render the toast in the container
	toastRoot.render(<ToastComponent key={toastId} />);

	// Automatically remove the toast after it autohides
	setTimeout(() => {
		if (!toastRoot) return; // Exit if the root is already null
		toastRoot.unmount(); // Unmount the toast
		toastRoot = null; // Reset toastRoot to allow creating a new root for the next toast
	}, TOAST_TIMEOUT); // Match this to the autohide delay
}
