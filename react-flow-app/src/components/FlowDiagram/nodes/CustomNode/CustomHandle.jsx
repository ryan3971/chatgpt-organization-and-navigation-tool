import { Handle, Position } from "@xyflow/react";

const CustomHandle = ({ branch }) => {
    const selectedTextContainerId = branch.selectedTextContainerId;
  const handleStyle = {
		left: `calc(0.5rem + 0.5rem + (2rem / 2) + (3rem * ${Number(branch.selectedTextContainerId)}))`,
  };
    return (
		<Handle className="w-4 h-4 bg-black left-10" style={handleStyle}
			id={selectedTextContainerId}
			type="source"
			position={Position.Bottom}
		/>
	);
};

export default CustomHandle;
