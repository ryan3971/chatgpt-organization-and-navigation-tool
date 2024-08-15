export const calculateHandlePosition = (containerId, totalColumns) => {
	const columnWidthPercentage = 100 / totalColumns;
	const handlePosition = containerId * columnWidthPercentage + columnWidthPercentage / 2;

	return {
		left: `${handlePosition}%`,
		transform: "translateX(-50%)",
	};
};
