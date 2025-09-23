import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Unstable_Grid2";
import Paper from "@mui/material/Paper";
import styled from "@mui/material/styles/styled";
import Typography from "@mui/material/Typography";
import { Chart } from "chart.js/auto";
import VersionChart from "../Charts/VersionChart";
import ComparisonChart from "../Charts/ComparisonChart";
import {
	Button,
	Dialog,
	DialogContent,
	DialogTitle,
	FormControl,
	InputLabel,
	MenuItem,
	Select,
} from "@mui/material";
import TableCosts from "../TableCosts";
import { useState } from "react";
import CostsTables from "./CostsTables";
import NewCostsTables from "./NewCostsTable";

export default function Dashboard({ project, costs, school, handleCosts }) {
	const { numberOfClassrooms } = school;
	const [loading, setLoading] = useState(false);
	const [open, setOpen] = useState(false);
	const [projectVersions, setProjectVersions] = useState([]);
	const [projectCosts, setProjectCosts] = useState("");
	const [projectCount, setProjectCount] = useState(0);
	const [selectedProjectData, setSelectedProjectData] = useState(null); // costos asociados
	if (!project || !costs) return <></>; // initial load not null
	console.log(project);
	console.log(costs);
	if (project.length - 1 !== costs.calculatedCosts.length) return <></>;

	const versions = project.filter((el) => el.parent_id !== 0);

	const handleClickOpen = () => {
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
	};

	const handleProjectCosts = async (event) => {
		const selectedId = event.target.value;
		setProjectCosts(selectedId);

		setLoading(true);
		try {
			const data = await getProjectCostsByIDService(selectedId);
			setSelectedProjectData(data);
		} finally {
			setLoading(false);
		}
	};

	const handleToggleLoading = () => setLoading((prev) => !prev);

	// const addNewProjectVersion = () => {
	// 	const nextCount = projectCount + 1;

	// 	const newVersion = {
	// 		id: Date.now(), // o el ID real del backend
	// 		name: `Proyecto ${nextCount}`,
	// 	};

	// 	setProjectVersions((prev) => [...prev, newVersion]);
	// 	setProjectCosts(newVersion.id); // selecciona automáticamente
	// 	setProjectCount(nextCount); // incrementa el contador
	// };

	const addNewProjectVersion = async () => {
		const nextCount = projectCount + 1;

		const newVersion = {
			id: Date.now(), // o el ID real del backend
			name: `Proyecto ${nextCount}`,
		};

		setProjectVersions((prev) => [...prev, newVersion]);
		setProjectCosts(newVersion.id); // selecciona automáticamente
		setProjectCount(nextCount); // incrementa el contador
		// const nextCount = projectCount + 1;
		// const newVersion = {
		// 	id: projectId,
		// 	name: `Proyecto ${nextCount}`,
		// };

		// setProjectVersions((prev) => [...prev, newVersion]);
		// setProjectCosts(projectId);
		// setProjectCount(nextCount);

		// // cargar costos asociados
		// setLoading(true);
		// try {
		// 	// const data = await getProjectCostsByIDService(projectId);
		// 	const data = costs.calculatedCosts.find(
		// 		(c) => c.projectId === projectId
		// 	);
		// 	setSelectedProjectData(data);
		// } finally {
		// 	setLoading(false);
		// }
	};

	console.log("mirador del loading", loading);

	return (
		<Grid
			xs={12}
			sx={{
				display: "flex",
				flexDirection: "column",
				gap: "7px",
			}}
		>
			{project
				?.filter((el) => el.parent_id !== 0)
				.map((el, i) => (
					<TableCosts
						handleCosts={handleCosts}
						handleToggleLoading={handleToggleLoading}
						costsCategories={costs.costsCategories[i]}
						calculatedCosts={costs.calculatedCosts[i]}
						project={el}
						onNewVersion={addNewProjectVersion}
					/>
				))}
			{loading && (
				<>
					<div style={{ paddingBottom: "9px" }}>
						<StyledPaper>Costos del proyecto</StyledPaper>
					</div>
					<Grid container>
						<Grid item xs={12} sm={4}>
							<FormControl fullWidth>
								<InputLabel id="demo-simple-select-label">
									Proyecto
								</InputLabel>
								<Select
									labelId="demo-simple-select-label"
									id="demo-simple-select"
									value={projectCosts}
									onChange={handleProjectCosts}
								>
									{projectVersions.map((version) => (
										<MenuItem
											key={version.id}
											value={version.id}
										>
											{version.name}
										</MenuItem>
									))}
								</Select>

								{/* {!loading ? (
									<p>Cargando costos...</p>
								) : (
									selectedProjectData && (
										<TableCosts
											handleCosts={handleCosts}
											handleToggleLoading={
												handleToggleLoading
											}
											costsCategories={
												selectedProjectData.costsCategories
											}
											calculatedCosts={
												selectedProjectData.calculatedCosts
											}
											project={
												selectedProjectData.project
											}
											onNewVersion={addNewProjectVersion}
										/>
									)
								)} */}
							</FormControl>
						</Grid>
						<Grid item xs={12} sm={4}>
							<Button variant="contained">
								<h2>Exportar Reporte</h2>
							</Button>
						</Grid>
						<Grid item xs={12} sm={4}>
							<Button
								variant="contained"
								onClick={handleClickOpen}
							>
								<h2>Comparativo de Costos</h2>
							</Button>
						</Grid>
					</Grid>
					<NewCostsTables
						project={project}
						costs={costs}
						numberOfClassrooms={numberOfClassrooms}
					/>
				</>
			)}

			{/* <Grid xs={12}>
				<Card>
					<CardContent
						sx={{
							px: 1.5,
							pt: 2,
							position: "relative",
							":last-child": { paddingBottom: "8px" },
						}}
					>
						<ComparisonChart
							versions={versions}
							costs={costs.calculatedCosts}
						/>
					</CardContent>
				</Card>
			</Grid> */}
			<Dialog
				open={open}
				onClose={handleClose}
				aria-labelledby="alert-dialog-title"
				aria-describedby="alert-dialog-description"
			>
				<DialogTitle id="alert-dialog-title">
					Barra de costos
				</DialogTitle>
				<DialogContent>
					<Grid xs={12} sm>
						<Grid container>
							{/* El spacing={} se hereda del Grid de mas alto nivel */}
							<Grid xs={12}>
								<Paper
									variant="outlined"
									sx={{
										padding: "6px 0",
										textAlign: "center",
										boxShadow:
											"0 2px 5px 1px rgb(64 60 67 / 16%)",
									}}
								>
									<Typography fontWeight={500}>
										COMPARACION DE COSTOS
									</Typography>
								</Paper>
							</Grid>
							<Grid xs={12}>
								<Card>
									<CardContent
										sx={{
											px: 1.5,
											pt: 2,
											position: "relative",
											":last-child": {
												paddingBottom: "8px",
											},
										}}
									>
										<ComparisonChart
											versions={versions}
											costs={costs.calculatedCosts}
										/>
									</CardContent>
								</Card>
							</Grid>
						</Grid>
					</Grid>
				</DialogContent>
			</Dialog>
		</Grid>

		// <>
		// 	{project
		// 		?.filter((el) => el.parent_id !== 0)
		// 		.map((el, index) => (
		// 			<Grid xs={12} md={6} xl={4} key={el.id}>
		// 				{/* lg={4} */}
		// 				<Card>
		// 					<CardHeader
		// 						title={
		// 							<Typography
		// 								variant="subtitle1"
		// 								sx={{
		// 									boxShadow:
		// 										"0 2px 5px 1px rgb(64 60 67 / 18%)",
		// 									fontWeight: 400,
		// 									fontSize: "1.05rem",
		// 									backgroundColor: "#c1c1c1",
		// 									width: "100%",
		// 									p: "3px 7px",
		// 									borderRadius: "4px",
		// 									color: "#ffffff",
		// 									textAlign: "center",
		// 								}}
		// 							>
		// 								{el.name}
		// 							</Typography>
		// 						}
		// 					/>
		// 					<CardContent
		// 						sx={{
		// 							p: 1,
		// 							pt: 0,
		// 							position: "relative",
		// 							":hover": { cursor: "crosshair" },
		// 							"&:last-child": { pb: 1 },
		// 						}}
		// 					>
		// 						<VersionChart
		// 							costs={costs.calculatedCosts[index]}
		// 						/>
		// 					</CardContent>
		// 				</Card>
		// 			</Grid>
		// 		))}

		// 	{/* comparacion de costos */}
		// 	<Grid xs={12} sm>
		// 		<Grid container>
		// 			{/* El spacing={} se hereda del Grid de mas alto nivel */}
		// 			<Grid xs={12}>
		// 				<Paper
		// 					variant="outlined"
		// 					sx={{
		// 						padding: "6px 0",
		// 						textAlign: "center",
		// 						boxShadow: "0 2px 5px 1px rgb(64 60 67 / 16%)",
		// 					}}
		// 				>
		// 					<Typography fontWeight={500}>
		// 						COMPARACION DE COSTOS
		// 					</Typography>
		// 				</Paper>
		// 			</Grid>
		// 			<Grid xs={12}>
		// 				<Card>
		// 					<CardContent
		// 						sx={{
		// 							px: 1.5,
		// 							pt: 2,
		// 							position: "relative",
		// 							":last-child": { paddingBottom: "8px" },
		// 						}}
		// 					>
		// 						<ComparisonChart
		// 							versions={versions}
		// 							costs={costs.calculatedCosts}
		// 						/>
		// 					</CardContent>
		// 				</Card>
		// 			</Grid>
		// 		</Grid>
		// 	</Grid>
		// </>
	);
}
const StyledPaper = styled(Paper)(({ theme }) => ({
	...theme.typography.body2,
	color: "#fff",
	textAlign: "center",
	padding: "5px 0",
	backgroundColor: "#adadad",
	fontSize: "1rem",
	fontWeight: "500",
}));
