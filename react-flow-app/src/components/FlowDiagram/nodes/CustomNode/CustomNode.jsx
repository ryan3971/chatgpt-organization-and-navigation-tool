import { useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Card, Container, Row } from "react-bootstrap";

import { Handle, Position } from "@xyflow/react";

import Title from "./NodeTitle";
import MessageTable from "./MessageTable";
import CustomHandle from "./CustomHandle";

const CustomNode = ({ id, data }) => {
	const { title, messages, branches, isParent } = data;
	const refs = useRef({});

	return (
		<Card
			className="bg-gray-50 border border-gray-200 shadow-sm rounded-lg w-min-[12rem]"
			onDoubleClick={() => console.log("Double clicked node", id)}
		>
			<Card.Header
				className="bg-gray-100 p-2 rounded-t-md"
			>
				<Title title={title} />
			</Card.Header>

			<Card.Body
				className="d-flex justify-content-center align-items-center p-2"
			>
				<Container fluid>
					<Row className="justify-content-center">
						{/* Message Table */}
						<MessageTable
							node_id={id}
							messages={messages}
							refs={refs}
						/>
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
				const targetRef = refs.current[Number(branch.selectedTextContainerId)] || null;
				return (
					<CustomHandle
						node_id={id}
						key={index}
						branch={branch}
						targetRef={targetRef}
					/>
				);
			})}
		</Card>
	);
};

export default CustomNode;
