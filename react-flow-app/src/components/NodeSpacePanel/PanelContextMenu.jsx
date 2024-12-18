import "bootstrap/dist/css/bootstrap.min.css";

const PanelContextMenu = ({ visible, x, y, onClose, onRenameSpace }) => {
	// If the context menu is not visible, do not render anything
	if (!visible) return null;

	return (
		<>
			{/* Context Menu */}
			<div
				className="bg-white border shadow-lg position-fixed"
				style={{
					top: `${y}px`,
					left: `${x}px`,
					zIndex: 1000,
				}}
			>
				{/* Rename Space Option */}
				<button
					key={2}
					className="border-0 block p-2 text-left w-full hover:bg-white"
					onClick={onRenameSpace}
				>
					{"Rename Space"}
				</button>
			</div>

			{/* Full-screen overlay to detect outside clicks */}
			<div
				className="position-fixed"
				style={{
					top: 0,
					left: 0,
					width: "100vw",
					height: "100vh",
					zIndex: 999,
				}}
				onClick={onClose}
			/>
		</>
	);
};

export default PanelContextMenu;
