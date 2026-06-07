import { useSelector } from "react-redux";
import Grid from "@mui/material/Grid2";
import Card from "@mui/material/Card";
import NewProject from "../../components/NewProject/NewProject";
import GridData from "../../components/GridData/GridData";

export function Home({ proyecto, school }) {
	const projects = useSelector((state) => state.project.projects);

	return (
		<Card sx={{ borderRadius: "5px" }}>
			<Grid
				container
				spacing={{ xs: 2, sm: 3 }}
				p="2rem"
				justifyContent="space-between"
			>
				<Grid xs={12} sm>
					<h4 style={{ fontWeight: 500 }}>CREAR UN DISEÑO</h4>
					<span style={{ fontSize: 13 }}>
						Puedes crear desde cero o escoger una plantilla de
						proyectos
					</span>
				</Grid>
				
				<Grid xs={12} sm="auto">
					<NewProject school={school} />
				</Grid>

			</Grid>
			<Grid
				container
				spacing={{ xs: 2, sm: 3 }}
				px="2rem"
			>
				<Grid xs={12} mb=".5rem" mt="1.5rem">
					<h4 style={{ fontWeight: 500 }}>MIS DISEÑOS</h4>
					<span style={{ fontSize: 13 }}>
						Revisa los últimos diseños realizados
					</span>
				</Grid>
				<GridData projects={projects} typeProject={proyecto} />
			</Grid>
		</Card>
	);
}
