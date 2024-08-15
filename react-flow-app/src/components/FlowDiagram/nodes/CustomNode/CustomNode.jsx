import React from "react";
import PropTypes from "prop-types";
import { Handle } from "@xyflow/react";
import MessageTable from "./MessageTable";
import CustomHandle from "./CustomHandle";
import Title from "./NodeTitle";
import { COLUMN_WIDTH, DEFAULT_NODE_WIDTH, DEFAULT_NODE_HEIGHT, TABLE_WIDTH, TABLE_HEIGHT } from "../../helper/constants";

const CustomNode = ({ id, data }) => {
	const { title, messages, branches, isParent } = data;
	const nodeWidth = Math.max(DEFAULT_NODE_WIDTH, messages.length * COLUMN_WIDTH);

	return (
		<div className="bg-white border-black border-2 rounded-lg p-2 w-auto min-w-[12rem] h-40">
			{/* Title */}
			<Title title={title} />

			{/* Message Table */}
			<MessageTable 
				messages={messages} 
			/>

			{/* Handles */}
			{!isParent && <Handle type="target" position="top" className="w-4 h-4 bg-black" />}
			{Object.keys(branches).map((branch_key) => {
				return <CustomHandle key={branch_key} branch={branches[branch_key]} />;
			})}
		</div>
	);
};

export default CustomNode;