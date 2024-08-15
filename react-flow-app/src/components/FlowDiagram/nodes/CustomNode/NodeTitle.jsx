import PropTypes from "prop-types";
import gptLogo from "./gpt_logo.png";

const Title = ({ title }) => {
	return (
		<div className="text-lg font-sans font-semibold w-full h-1/5 flex items-center border-black border-2">
			<img className="h-6" src={gptLogo} alt="gpt_icon" />
			<span className="ml-2">{title}</span>
		</div>
	);
};

export default Title;
