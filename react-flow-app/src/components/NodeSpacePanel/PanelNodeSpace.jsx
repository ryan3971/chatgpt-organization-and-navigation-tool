import "bootstrap/dist/css/bootstrap.min.css";
import { Button, Image } from "react-bootstrap";

export const PanelNodeSpace = ({ id, onClick, title, imageUrl, infoText }) => {
	return (
		<Button
			variant="light"
			className="d-flex flex-column p-3 align-items-start"
			onClick={() => onClick(id)}
			style={{ width: "100%", height: "auto" }}
		>
			<h5 className="mb-2">{title}</h5>

			<div className="d-flex align-items-center w-100">
				<Image
					src={imageUrl}
					rounded
					style={{ width: "40px", height: "40px" }}
					className="me-2"
				/>
				<div className="text-left">
					<small>{infoText}</small>
				</div>
			</div>
		</Button>
	);
};

export default PanelNodeSpace;
