import PanelNodeSpace from "./PanelNodeSpace";

const SidePanel = ({ isOpen, onClose, nodeSpaces, onChangeActiveSpace }) => {

	return (
		<div
			className={`fixed left-0 top-0 h-screen w-1/4 bg-gray-800 p-4 shadow-lg transform ${
				isOpen ? "translate-x-0" : "-translate-x-full"
			} transition-transform duration-300 ease-in-out`}
		>
			<div className="flex justify-between items-center mb-4">
				<h2 className="text-white text-lg font-semibold">Workspaces</h2>
				<button onClick={onClose} className="text-white bg-red-500 p-2 rounded-full hover:bg-red-600 transition-colors focus:outline-none">
					&times;
				</button>
			</div>

			{nodeSpaces.map((id) => (
				<PanelNodeSpace key={id} id={id} onClick={onChangeActiveSpace} /> //key prop is also set to the id to ensure React can uniquely identify each component (required when rendering lists)
			))}
		</div>
	);
};

export default SidePanel;