import "bootstrap/dist/css/bootstrap.min.css";
import { ListGroup, Offcanvas } from "react-bootstrap";
import PropTypes from "prop-types";
import gpt_image from "../../assets/react_icon.png";
import PanelNodeSpace from "./PanelNodeSpace";

/**
 * SidePanel component.
 * @component
 * @param {Object} props - The component props.
 * @param {boolean} props.isOpen - Indicates if the side panel is open.
 * @param {Function} props.onClose - The function to close the side panel.
 * @param {Object} props.nodeSpaces - The node spaces to display.
 * @param {string} props.activeSpace - The ID of the active node space.
 * @param {Function} props.onChangeActiveSpace - The function to change the active node space.
 * @returns {JSX.Element} The rendered SidePanel component.
 */
const SidePanel = ({ isOpen, onClose, nodeSpaces, activeSpace, onChangeActiveSpace }) => {
	return (
		<Offcanvas
			className="bg-[#f4f4f4]"
			show={isOpen}
			onHide={onClose}
			placement="start"
			style={{ width: "30%" }}
		>
			<Offcanvas.Header closeButton>
				<Offcanvas.Title>Nodespaces</Offcanvas.Title>
			</Offcanvas.Header>
			<Offcanvas.Body>
				<ListGroup>
					{/* Iterate over the nodeSpaces object to render each node space */}
					{Object.keys(nodeSpaces).map((spaceKey, index) => {
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

SidePanel.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	nodeSpaces: PropTypes.object.isRequired,
	activeSpace: PropTypes.string.isRequired,
	onChangeActiveSpace: PropTypes.func.isRequired,
};