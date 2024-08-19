import { Handle, Position } from "@xyflow/react";

const CustomHandle = ({ branch }) => {
	var selectedTextContainerId = branch.selectedTextContainerId;

	let handleStyle = {};
	let position;

	if (selectedTextContainerId) {
		const handlePosition = Number(branch.selectedTextContainerId) - 1;
		handleStyle.left = `calc(0.5rem + 0.5rem + (2rem / 2) + (3rem * ${handlePosition}))`;
		position = Position.Bottom;
	} else	{
		selectedTextContainerId = "0";
		position = Position.Bottom;	// fix when I style
	}

	return (
		<Handle
			className="w-4 h-4 bg-black left-10"
			style={handleStyle}
			id={selectedTextContainerId}
			type="source"
			position={position}
		/>
	);
};

export default CustomHandle;
