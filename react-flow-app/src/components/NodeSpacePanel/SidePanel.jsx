import PanelNodeSpace from "./PanelNodeSpace";

import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, ListGroup, Offcanvas } from "react-bootstrap";

import gpt_image from "../../assets/gpt_logo.png";

const SidePanel = ({ isOpen, onClose, nodeSpaces, onChangeActiveSpace }) => {

	return (
		<Offcanvas
			show={isOpen}
			onHide={onClose}
			placement="start"
			style={{ width: "35%" }}
		>
			<Offcanvas.Header closeButton>
				<Offcanvas.Title>Workspaces</Offcanvas.Title>
			</Offcanvas.Header>
			<Offcanvas.Body>
				<ListGroup>
					{nodeSpaces.map((space, index) => (
						<ListGroup.Item key={space}>
							<PanelNodeSpace
								id={space}
								title={`Nodespace ${index + 1}`}
								imageUrl={gpt_image}
								infoText={"Info"}
								onClick={onChangeActiveSpace}
							/>
						</ListGroup.Item>
					))}
				</ListGroup>
			</Offcanvas.Body>
		</Offcanvas>
	);
};

export default SidePanel;