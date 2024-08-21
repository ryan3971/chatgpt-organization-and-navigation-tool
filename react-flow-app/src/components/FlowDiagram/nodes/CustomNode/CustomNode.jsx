import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Card, Container, Row, Col } from "react-bootstrap";

import { Handle, Position } from "@xyflow/react";

import Title from "./NodeTitle";
import MessageTable from "./MessageTable";
import CustomHandle from "./CustomHandle";

const CustomNode = ({ id, data }) => {
	const { title, messages, branches, isParent } = data;
	const totalColumns = messages.length; // Assuming each message corresponds to a column

	return (
		<Card
			className="border-light shadow-sm rounded-lg"
			style={{ minWidth: "12rem", padding: "10px", backgroundColor: "#f4f4f9", position: "relative" }}
		>
			<Card.Header
				className="text-center p-2"
				style={{ backgroundColor: "#fff", borderBottom: "none", fontWeight: "600" }}
			>
				<Title title={title} />
			</Card.Header>

			<Card.Body
				className="d-flex justify-content-center align-items-center"
				style={{ padding: "10px" }}
			>
				<Container fluid>
					<Row className="justify-content-center">
						{/* Message Table */}
						<MessageTable node_id={id} messages={messages} />
					</Row>
				</Container>
			</Card.Body>

			{/* Top Handle if node is a parent */}
			{!isParent && (
				<Handle
					type="target"
					position={Position.Top}
					className="bg-dark rounded-circle"
					style={{
						top: "-8px", // Slightly above the top of the card
						left: "50%",
						transform: "translateX(-50%)", // Centered horizontally
						width: "16px",
						height: "16px",
					}}
				/>
			)}

			{/* Handles for branches */}
			{Object.keys(branches).map((key, index) => {
				const branch = branches[key];
				return (
					<CustomHandle
						key={index}
						branch={branch}
						totalColumns={totalColumns}
					/>
				);
			})}
		</Card>
	);
};

export default CustomNode;
