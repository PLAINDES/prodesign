import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid2";
import Paper from "@mui/material/Paper";
import styled from "@mui/material/styles/styled";
import Typography from "@mui/material/Typography";
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
	CircularProgress,
} from "@mui/material";

import TableCosts from "../TableCosts";
import NewCostsTables from "./NewCostsTable";
import { useState } from "react";

export default function Dashboard({ project, costs, handleCosts }) {
	// Validación básica
	if (!project || !costs) return <></>;

	// Estados locales (solo frontend)
	const [savedProjects, setSavedProjects] = useState([]);
	const [selectedProjectId, setSelectedProjectId] = useState("");
	const [selectedProjectData, setSelectedProjectData] = useState(null);
	const [open, setOpen] = useState(false);

	const versions = project.filter((el) => el.parent_id !== 0);

	const handleClickOpen = () => setOpen(true);
	const handleClose = () => setOpen(false);

	const handleProjectChange = (event) => {
		const selectedId = event.target.value;
		setSelectedProjectId(selectedId);

		const projectData = savedProjects.find((p) => p.id === selectedId);
		setSelectedProjectData(projectData || null);
	};

	// Crear nueva versión de costeo (local)
	const handleNewProjectVersion = (
		updatedCategories,
		updatedCalculatedCosts,
		projectData
	) => {
		if (!updatedCategories || !updatedCalculatedCosts || !projectData) return;

		const nextProjectNumber = savedProjects.length + 1;
		const newProjectId = `project-${Date.now()}`;

		const newProject = {
			id: newProjectId,
			name: `Costeo ${nextProjectNumber}`,
			costsCategories: { ...updatedCategories },
			calculatedCosts: { ...updatedCalculatedCosts },
			projectData: { ...projectData },
		};

		setSavedProjects((prev) => [...prev, newProject]);
		setSelectedProjectId(newProjectId);
		setSelectedProjectData(newProject);
	};

	const hasProjects = savedProjects.length > 0;

	return (
		<Grid xs={12} sx={{ display: "flex", flexDirection: "column", gap: "7px" }}>
			{/* Tablas de costos iniciales */}
			{project.map((el, i) => (
				<TableCosts
					key={el.id}
					handleCosts={handleCosts}
					categories={costs.costsCategories[i]}
					calculatedCosts={costs.calculatedCosts[i]}
					project={el}
					onNewVersion={handleNewProjectVersion}
				/>
			))}

			{/* Sección de proyectos guardados */}
			{hasProjects && (
				<>
					<div style={{ paddingBottom: "9px" }}>
						<StyledPaper>Costos del proyecto</StyledPaper>
					</div>

					<Grid container spacing={2}>
						<Grid item xs={12} sm={4}>
							<FormControl fullWidth>
								<InputLabel id="project-select-label">Proyecto</InputLabel>
								<Select
									labelId="project-select-label"
									id="project-select"
									value={selectedProjectId}
									label="Proyecto"
									onChange={handleProjectChange}
								>
									{savedProjects.map((proj) => (
										<MenuItem key={proj.id} value={proj.id}>
											{proj.name}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						</Grid>

						<Grid item xs={12} sm={4}>
							<Button variant="contained" fullWidth sx={{ height: "56px" }}>
								Exportar Reporte
							</Button>
						</Grid>

						<Grid item xs={12} sm={4}>
							<Button
								variant="contained"
								fullWidth
								sx={{ height: "56px" }}
								onClick={handleClickOpen}
							>
								Comparativo de Costos
							</Button>
						</Grid>
					</Grid>

					{/* Tabla del proyecto seleccionado */}
					<div style={{ marginTop: "16px" }}>
						{selectedProjectData ? (
							<>
								<Typography
									variant="h6"
									sx={{
										mb: 2,
										p: 1,
										bgcolor: "#f5f5f5",
										borderRadius: 1,
										textAlign: "center",
									}}
								>
									Mostrando: {selectedProjectData.name}
								</Typography>
								<NewCostsTables
									key={selectedProjectData.id}
									project={[project[0], selectedProjectData.projectData]}
									costs={{
										costsCategories: [selectedProjectData.costsCategories],
										calculatedCosts: [selectedProjectData.calculatedCosts],
									}}
								/>
							</>
						) : (
							<Typography
								variant="body1"
								sx={{
									textAlign: "center",
									py: 4,
									color: "text.secondary",
								}}
							>
								Selecciona un proyecto para ver sus costos
							</Typography>
						)}
					</div>
				</>
			)}

			{/* Dialog de comparación */}
			<Dialog
				open={open}
				onClose={handleClose}
				maxWidth="md"
				fullWidth
			>
				<DialogTitle>Comparación de costos</DialogTitle>
				<DialogContent>
					<Grid container spacing={2}>
						<Grid xs={12}>
							<Paper
								variant="outlined"
								sx={{
									padding: "6px 0",
									textAlign: "center",
									boxShadow: "0 2px 5px 1px rgb(64 60 67 / 16%)",
								}}
							>
								<Typography fontWeight={500}>COMPARACIÓN DE COSTOS</Typography>
							</Paper>
						</Grid>
						<Grid xs={12}>
							<Card>
								<CardContent sx={{ px: 1.5, pt: 2, pb: 2 }}>
									{savedProjects.length > 1 ? (
										<ComparisonChart savedProjects={savedProjects} />
									) : (
										<Typography
											variant="body2"
											sx={{ textAlign: "center", py: 4 }}
										>
											Necesitas al menos 2 proyectos para comparar
										</Typography>
									)}
								</CardContent>
							</Card>
						</Grid>
					</Grid>
				</DialogContent>
			</Dialog>
		</Grid>
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