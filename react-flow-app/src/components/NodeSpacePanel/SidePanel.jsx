import PanelNodeSpace from "./PanelNodeSpace";

import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, ListGroup, Offcanvas } from "react-bootstrap";

const SidePanel = ({ isOpen, onClose, nodeSpaces, onChangeActiveSpace }) => {

	return (
		<Offcanvas
			show={isOpen}
			onHide={onClose}
			placement="start"
			style={{ width: "25%" }}
		>
			<Offcanvas.Header closeButton>
				<Offcanvas.Title>Workspaces</Offcanvas.Title>
			</Offcanvas.Header>
			<Offcanvas.Body>
				<ListGroup>
					{nodeSpaces.map((space) => (
						<ListGroup.Item key={space}>
							<PanelNodeSpace
								id={space}
								title={space.title}
								imageUrl={space.imageUrl}
								infoText={space.infoText}
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