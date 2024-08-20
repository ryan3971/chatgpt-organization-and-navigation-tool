import React from "react";
import PropTypes from "prop-types";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, Container, Row, Col, OverlayTrigger, Tooltip } from "react-bootstrap";

const MessageTable = ({ messages }) => {
	const handleButtonClick = (index, msg) => {
		console.log(`User button clicked at index ${index}:`, msg.userMessage);
	};

	const handleGptButtonClick = (index, msg) => {
		console.log(`GPT button clicked at index ${index}:`, msg.gptMessage);
	};

	const renderTooltip = (msg) => (
		<Tooltip
			id="button-tooltip"
			style={{ maxWidth: "200px", opacity: 0.65 }}
		>
			{msg}
		</Tooltip>
	);

	return (
		<Container
			fluid
			className="border border-light bg-white shadow-sm rounded"
			style={{ padding: "15px" }}
		>
			<Row className="h-50">
				{messages.map((msg, index) => (
					<Col
						key={`user-${index}`}
						xs="auto"
						className="p-1"
					>
						<OverlayTrigger
							placement="top"
							overlay={renderTooltip(msg.userMessage)}
						>
							<Button
								variant="outline-primary"
								className="rounded-pill"
								style={{
									width: "35px",
									height: "35px",
									border: "1px solid #b3b3b3",
									backgroundColor: "#fff",
									transition: "background-color 0.2s ease-in-out",
								}}
								onClick={() => handleButtonClick(index, msg)}
								onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e6f3ff")}
								onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#fff")}
							/>
						</OverlayTrigger>
					</Col>
				))}
			</Row>

			<Row className="h-50 mt-3">
				{messages.map((msg, index) => (
					<Col
						key={`gpt-${index}`}
						xs="auto"
						className="p-1"
					>
						<OverlayTrigger
							placement="top"
							overlay={renderTooltip(msg.gptMessage)}
						>
							<Button
								variant="outline-secondary"
								className="rounded-pill"
								style={{
									width: "35px",
									height: "35px",
									border: "1px solid #b3b3b3",
									backgroundColor: "#fff",
									transition: "background-color 0.2s ease-in-out",
								}}
								onClick={() => handleButtonClick(index, msg)}
								onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f0f0f0")}
								onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#fff")}
							/>
						</OverlayTrigger>
					</Col>
				))}
			</Row>
		</Container>
	);
};

MessageTable.propTypes = {
	messages: PropTypes.arrayOf(
		PropTypes.shape({
			userMessage: PropTypes.string.isRequired,
			gptMessage: PropTypes.string.isRequired,
		})
	).isRequired,
};

export default MessageTable;
