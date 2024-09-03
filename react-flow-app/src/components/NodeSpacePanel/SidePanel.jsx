import PanelNodeSpace from "./PanelNodeSpace";
import "bootstrap/dist/css/bootstrap.min.css";
import { ListGroup, Offcanvas } from "react-bootstrap";
import gpt_image from "../../assets/gpt_logo.png";

const SidePanel = ({ isOpen, onClose, nodeSpaces, activeSpace, onChangeActiveSpace }) => {
	return (
		<Offcanvas
			show={isOpen}
			onHide={onClose}
			placement="start"
			style={{ width: "30%" }}
		>
			<Offcanvas.Header closeButton>
				<Offcanvas.Title>Workspaces</Offcanvas.Title>
			</Offcanvas.Header>
			<Offcanvas.Body>
				<ListGroup>
					{/* Iterate over the nodeSpaces object to render each node space */}
					{Object.keys(nodeSpaces).map((spaceKey, index) => {
						console.log("Space key", spaceKey);
						const space = nodeSpaces[spaceKey];

						return (
							<ListGroup.Item
								key={spaceKey}
								className="p-2"
							>
								<PanelNodeSpace
									id={spaceKey}
									title={`Nodespace ${index + 1}`}
									imageUrl={gpt_image}
									infoText={space.title}
									activeSpace={activeSpace}
									onClick={onChangeActiveSpace}
								/>
							</ListGroup.Item>
						);
					})}
				</ListGroup>
			</Offcanvas.Body>
		</Offcanvas>
	);
};

export default SidePanel;
