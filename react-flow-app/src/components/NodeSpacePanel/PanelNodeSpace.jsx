
export const PanelNodeSpace = ({id, onClick}) => {

	return (
		<button className="h-10 w-10 bg-blue-500 ml-1 mb-10 border-black border-2"
			onClick={() => onClick(id)}
			>
		</button>
	);
};

export default PanelNodeSpace;