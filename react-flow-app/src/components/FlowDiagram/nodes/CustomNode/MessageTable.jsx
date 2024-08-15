import React from "react";
import PropTypes from "prop-types";

const MessageTable = ({ messages }) => {

	const handleMouseEnter = (index, msg) => {
		console.log(`User button Entered at index ${index}:`, msg.userMessage);
	};

	const handleMouseLeave = (index, msg) => {
		console.log(`User button Left at index ${index}:`, msg.userMessage);
	};

	const handleUserButtonClick = (index, msg) => {
		console.log(`User button clicked at index ${index}:`, msg.userMessage);
	};

	const handleGptButtonClick = (index, msg) => {
		console.log(`GPT button clicked at index ${index}:`, msg.gptMessage);
	};

	return (
		<div className="h-4/5 border-2 border-red-500">
			<div className="flex justify-start space-x-2 h-1/2 pt-2 pb-1 border-2 border-green-400">
				{messages.map((msg, index) => (
					<div key={`user-${index}`}>
						<button
							className="w-8 h-full bg-blue-500 rounded-3xl flex items-center justify-center"
							onClick={() => handleUserButtonClick(index, msg)} // Event handler for user button click
							onMouseEnter={() => handleMouseEnter(index, msg)} // Event handler for user button enter
							onMouseLeave={() => handleMouseLeave(index, msg)} // Event handler for user button leave
						></button>
					</div>
				))}
			</div>

			<div className="flex justify-start space-x-2 h-1/2 pt-1 pb-2 border-2">
				{messages.map((msg, index) => (
					<div key={`gpt-${index}`}>
						<button className="w-8 h-full bg-gray-400 rounded-3xl flex items-center justify-center"></button>
					</div>
				))}
			</div>
		</div>
	);
};

export default MessageTable;
