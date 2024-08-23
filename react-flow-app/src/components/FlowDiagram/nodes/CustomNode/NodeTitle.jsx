import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Card, Image } from "react-bootstrap";
import gptLogo from "./gpt_logo.png";

const Title = ({ title }) => {
	return (
		<Card.Header
			className="d-flex align-items-center"
			style={{ backgroundColor: "#f8f9fa", padding: "10px" }}
		>
			<Image
				src={gptLogo}
				alt="gpt_icon"
				style={{ height: "20px" }}
			/>
			<span
				className="ms-2"
				style={{ fontWeight: "500", fontSize: "1rem", color: "#495057" }}
			>
				{title}
			</span>
		</Card.Header>
	);
};

export default Title;
