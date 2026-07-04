import { Link as RouterLink } from "react-router-dom";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Typography from "@mui/material/Typography";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
// import { emphasize } from "@mui/material/styles";
// import styled from "@mui/material/styles/styled";
// import Chip from "@mui/material/Chip";

export default function Breadcrumb() {
	return (
		<div role="presentation" onClick={handleClick}>
			<Box sx={{ display: "flex", flexDirection: "column" }}>
				<Breadcrumbs aria-label="breadcrumb" separator={<NavigateNextIcon fontSize="small" />}>
					<LinkRouter underline="hover" color="inherit" to="/">
						Home
					</LinkRouter>
					<LinkRouter to="/proyecto/educacion" underline="hover" color="inherit">
						Colegios
					</LinkRouter>
					<Typography color="text.primary">
						Costos
					</Typography>
				</Breadcrumbs>
			</Box>
		</div>
	)
}

function LinkRouter(props) {
	return <Link {...props} component={RouterLink} />;
}

function handleClick(event) {
	event.preventDefault();
	console.info("You clicked a breadcrumb.");
}
