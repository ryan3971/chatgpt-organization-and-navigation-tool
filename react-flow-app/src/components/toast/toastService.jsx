import { Toast, ToastContainer } from "react-bootstrap";
import ReactDOM from "react-dom";

let toastContainer = null;

export function showToast(message, type = "info") {
	// Create the toast container if it doesn't exist
	if (!toastContainer) {
		toastContainer = document.createElement("div");
		document.body.appendChild(toastContainer);
	}

	const toastId = Math.random().toString(36).substr(2, 9); // Unique ID for the toast

	const ToastComponent = () => (
		<ToastContainer
			position="top-end"
			className="p-3"
			style={{ zIndex: 1060 }}
		>
			<Toast
				bg={type}
				autohide
				delay={5000}
			>
				<Toast.Body>{message}</Toast.Body>
			</Toast>
		</ToastContainer>
	);

	// Render the toast in the container
	ReactDOM.render(<ToastComponent key={toastId} />, toastContainer);

	// Remove the toast after it autohides
	setTimeout(() => {
		ReactDOM.unmountComponentAtNode(toastContainer);
	}, 5000);
}
