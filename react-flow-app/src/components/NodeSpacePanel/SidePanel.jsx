import React, { useState } from "react";

const workspaces = [
	{ id: 1, title: "Workspace 1", description: "Description of Workspace 1" },
	{ id: 2, title: "Workspace 2", description: "Description of Workspace 2" },
	{ id: 3, title: "Workspace 3", description: "Description of Workspace 3" },
	// Add more workspaces as needed
];

const SidePanel = ({ isOpen, onClose, onWorkspaceSelect, nodeSpaces }) => {
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
			{workspaces.map((workspace) => (
				<div
					key={workspace.id}
					className="bg-gray-700 text-white p-4 rounded-lg mb-4 cursor-pointer hover:bg-gray-600 transition-colors"
					onClick={() => onWorkspaceSelect(workspace.id)}
				>
					<h3 className="text-lg font-bold">{workspace.title}</h3>
					<p className="text-sm">{workspace.description}</p>
				</div>
			))}
		</div>
	);
};

export default SidePanel;