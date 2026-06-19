import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import Grid from "@mui/material/Grid2";
import Typography from "@mui/material/Typography";
import axios from 'axios';
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { getProjectsCosts } from "../../../services/projectsService";
import Breadcrumb from "./Misc/Breadcrumb";
import CostsTables from "./views/CostsTables";

export function CostsPage({ school }) {
	const [costs, setCosts] = useState(null);
	const [slot, setSlot] = useState("dashboard");
	const BASE_URL_CALC = import.meta.env.VITE_API_BASE_URL_CALCULATE;

	const params = useParams();
	const projectID = Number(params.id);

	const projects = useSelector((state) => state.project.projects);
	const project = projects?.filter(
		(el) => el.id === projectID || el.parent_id === projectID
	);

	const handleCosts = (costs) => {
		setCosts(costs);
	};

	const handleSlot = (slot) => () => {
		setSlot(slot);
	};

	useEffect(() => {
		if (project) {
			getProjectsCosts(projectID).then(
				({ data }) =>
					handleCosts({
						costsCategories: data.costsCategories,
						calculatedCosts: data.calculatedCosts,
					}),
				(err) => console.log(err)
			);
		}

		return handleSlot("dashboard");
	}, [projects, projectID]);
	console.log("slottt:", slot);

	const [opcionCosto, setopcionCosto] = useState('');
	const [dataCostos, setdataCostos] = useState([])
	const [dataCostoSelect, setdataCostoSelect] = useState([])

	const handleChange = (event) => {
		
		setopcionCosto(event.target.value);
		console.log(dataCostos);
		
		setdataCostoSelect(dataCostos[event.target.value]["data_calculo_costos"])
	};

	async function FetchGetDataCostos(project_id) {

		const response = await axios.get(
			BASE_URL_CALC + "/api/v3/project/costos/" + project_id
		);

		if (response.status == 200) {
			const data_costos = response.data["data"]
			console.log("Costos ",data_costos);
			setdataCostos(data_costos)
			
			if(data_costos.length > 0){
				setdataCostoSelect(data_costos[0]["data_calculo_costos"])
				setopcionCosto(0);
			}
		}
	}

	useEffect(() => {
		console.log(projectID);
		
		FetchGetDataCostos(projectID)
	}, [projectID])

	return (
		<Grid container spacing={{ xs: 1.5, sm: 2 }}>
			<Grid
				xs={12}
				sx={{
					display: "inline-flex",
					justifyContent: "space-between",
					flexDirection: { xs: "column", sm: "row" },
					gap: "12px",
				}}
			>
				<Breadcrumb />
				<Typography variant="h6" fontWeight={600} textAlign="center">
					MODELO FINANCIERO INTEGRADO
				</Typography>
				{/* <SelectSlot slot={slot} handleSlot={handleSlot} /> */}
			</Grid>

			<Grid xs={12}>
				{/* <TableProjects projects={project} initialExpand /> */}
			</Grid>

			{/* <Views project={project} /> */}
			{/* {slot === "CostsTables" ? (
				<Dashboard
					project={project}
					costs={costs}
					school={school}
					handleCosts={handleCosts}
				/>
			) : (
				<CostsTables
					project={project}
					costs={costs}
					handleCosts={handleCosts}
				/>
			)} */}

			<FormControl fullWidth>
				<InputLabel id="demo-simple-select-label">Costos</InputLabel>
				<Select
					labelId="demo-simple-select-label"
					id="demo-simple-select"
					value={opcionCosto}
					label="Edad"
					variant='filled'
					onChange={handleChange}
				>
					{dataCostos && dataCostos.map((item, index) => (
						<MenuItem key={index} value={index}>
							Costos {index + 1}
						</MenuItem>
					))}
				</Select>
			</FormControl>
			<CostsTables
				project={project}
				costs={costs}
				handleCosts={handleCosts}
				dataCosto={dataCostoSelect}
			/>
		</Grid>
	);
}
