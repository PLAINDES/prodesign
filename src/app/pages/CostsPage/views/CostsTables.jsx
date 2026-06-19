import Grid from "@mui/material/Grid2";
import Paper from "@mui/material/Paper";
import Skeleton from "@mui/material/Skeleton";
import styled from "@mui/material/styles/styled";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { useEffect, useState } from "react";

import TableCosts from "../TableCosts";

export default function CostsTables({ project, costs, handleCosts, dataCosto }) {
	if (!project || !costs) return <></>;
	if (project.length - 1 !== costs.calculatedCosts?.length) return <></>;

	return (
		<>
			{project
				.filter((el) => el.parent_id !== 0)
				.map((el, i) => (
					<VersionTable
						key={el.id}
						el={el}
						costsCategories={costs.costsCategories?.[i]}
						calculatedCosts={costs.calculatedCosts?.[i]}
						handleCosts={handleCosts}
						dataCosto={dataCosto}
					/>
				))}
		</>
	);
}

function VersionTable({ el, costsCategories, calculatedCosts, handleCosts, dataCosto }) {
	const [loading, setLoading] = useState(false);

	// 🛡️ Protección contra build_data null/undefined
	let area_total = 0;
	try {
		if (el?.build_data) {
			const parsed = JSON.parse(el.build_data);
			area_total = parsed?.result_data?.area_total || 0;
		}
	} catch (error) {
		console.warn(`Error parsing build_data for project ${el?.id}:`, error);
		area_total = 0;
	}

	const total_structure =
		(calculatedCosts?.muros_y_columnas || 0) +
		(calculatedCosts?.techos || 0) * area_total;

	const total_finishes =
		((calculatedCosts?.puertas_y_ventanas || 0) +
			(calculatedCosts?.revestimientos || 0) +
			(calculatedCosts?.banos || 0)) *
		area_total;

	const total_installations = (calculatedCosts?.instalaciones || 0) * area_total;

	const total_construction =
		total_structure + total_finishes + total_installations;

	const costoDirecto = 6538651.13;
	const gastosGenerales = 653865.11;
	const utilidad = 653865.11;
	const subTotal = 7846381.35;
	const igv = 1412348.64;
	const presupuestoTotal = 9258730.00;

	// const rows = [
	// 	createData("COSTOS DIRECTOS", `S/${formatNumber(costoDirecto)}`),
	// 	// createData("GASTOS GENERALES (10%)", `S/${formatNumber(gastosGenerales)}`),
	// 	// createData("UTILIDAD (10%)", `S/${formatNumber(utilidad)}`),
	// 	// createData("SUB TOTAL", `S/${formatNumber(subTotal)}`),
	// 	// createData("IGV", `S/${formatNumber(igv)}`),
	// 	// createData("PRESUPUESTO TOTAL", `S/${formatNumber(presupuestoTotal)}`)
	// ];

	const [data_project, setdata_project] = useState([])

	useEffect(()=>{
		console.log("Data project",data_project);
		
		setdata_project(dataCosto)
	},[dataCosto])

	// const data_project = dataCosto["data_calculo_costos"]

	const rows_modulo = data_project
    .filter(item => item["MODULO"].includes("MODULO"))
    .map(item => createDataMod(
        item["MODULO"],
        item["ÁREA POR MODULO"],
        item["COSTO MODULO"]
    ));

	const rows = data_project
    .filter(item => item["MODULO"].includes("COSTO DIRECTO"))
    .map(item => createData(
        item["MODULO"],
        item["COSTO MODULO"]
    ));

	// const rows_modulo = [
	// 	createDataMod("MODULO I", "480.00", "S/ 1,480,614.72"),
	// 	createDataMod("MODULO II", "943.15", "S/ 2,237,887.46"),
	// 	createDataMod("MODULO III", "132.60", "S/ 332,395.05"),
	// 	createDataMod("MODULO IV", "135.33", "S/ 321,108.32"),
	// 	createDataMod("MODULO V", "1,011.11", "S/ 892,740.72")
	// ];

	const handleToggleLoading = () => setLoading((prev) => !prev);

	return (
		<Grid
			xs={12}
			sx={{
				display: "flex",
				flexDirection: "column",
				gap: "7px",
			}}
		>
			<TableCosts
				project={el}
				categories={costsCategories}
				calculatedCosts={calculatedCosts}
				handleCosts={handleCosts}
				handleToggleLoading={handleToggleLoading}
			/>

			<div style={{ paddingBottom: "9px" }}>
				<StyledPaper>{el?.name || "Proyecto sin nombre"}</StyledPaper>
			</div>

			<TableContainer component={Paper}>
				<Table sx={{ minWidth: 300 }} size="small">
					<TableHead>
						<TableRow sx={{ ".MuiTableCell-root": { fontSize: "1rem" } }}>
							<TableCell
								scope="col"
								sx={{ padding: { xs: "6px 10px", sm: "6px 16px" } }}
							>
								MODULO
							</TableCell>
							<TableCell></TableCell>
							<TableCell
								align="right"
								sx={{
									minWidth: 111,
									padding: { xs: "6px 10px", sm: "6px 16px" },
								}}
							>
								AREA POR MODULO
							</TableCell>
							<TableCell></TableCell>
							<TableCell
								align="right"
								sx={{
									minWidth: 111,
									padding: { xs: "6px 10px", sm: "6px 16px" },
								}}
							>
								COSTO MODULO
							</TableCell>
						</TableRow>
					</TableHead>
					<TableBody
						sx={{
							".MuiTableRow-root .MuiTableCell-root": { fontSize: "0.94rem" },
							".MuiTableRow-root:last-child td, .MuiTableRow-root:last-child th":
								{ border: 0 },
							"& th, td": {
								padding: { xs: "6px 10px", sm: "6px 16px" },
							},
						}}
					>
						{rows_modulo.map((row) => (
							<TableRow key={row.type} hover>
								<TableCell component="th" scope="row">
									{row.type}
								</TableCell>
								<TableCell></TableCell>
								<TableCell align="right" sx={{ pl: 0 }}>
									{loading ? (
										<div style={{ display: "flex", justifyContent: "end" }}>
											<Skeleton
												sx={{ width: { xs: "100%", md: "50%" } }}
											/>
										</div>
									) : (
										row.totalCost
									)}
								</TableCell>
								<TableCell></TableCell>
								<TableCell align="right" sx={{ pl: 0 }}>
									{loading ? (
										<div style={{ display: "flex", justifyContent: "end" }}>
											<Skeleton
												sx={{ width: { xs: "100%", md: "50%" } }}
											/>
										</div>
									) : (
										row.costModulo
									)}
								</TableCell>
							</TableRow>
						))}

					</TableBody>
				</Table>
			</TableContainer>
			<TableContainer component={Paper}>
				<Table sx={{ minWidth: 300 }} size="small">
					<TableHead>
						<TableRow sx={{ ".MuiTableCell-root": { fontSize: "1rem" } }}>
							<TableCell
								scope="col"
								sx={{ padding: { xs: "6px 10px", sm: "6px 16px" } }}
							>
								TIPO
							</TableCell>
							<TableCell></TableCell>
							<TableCell
								align="right"
								sx={{
									minWidth: 111,
									padding: { xs: "6px 10px", sm: "6px 16px" },
								}}
							>
								COSTO TOTAL
							</TableCell>
						</TableRow>
					</TableHead>
					<TableBody
						sx={{
							".MuiTableRow-root .MuiTableCell-root": { fontSize: "0.94rem" },
							".MuiTableRow-root:last-child td, .MuiTableRow-root:last-child th":
								{ border: 0 },
							"& th, td": {
								padding: { xs: "6px 10px", sm: "6px 16px" },
							},
						}}
					>
						{rows.map((row) => (
							<TableRow key={row.type} hover>
								<TableCell component="th" scope="row">
									{row.type}
								</TableCell>
								<TableCell></TableCell>
								<TableCell align="right" sx={{ pl: 0 }}>
									{loading ? (
										<div style={{ display: "flex", justifyContent: "end" }}>
											<Skeleton
												sx={{ width: { xs: "100%", md: "50%" } }}
											/>
										</div>
									) : (
										row.totalCost
									)}
								</TableCell>
							</TableRow>
						))}

					</TableBody>
				</Table>
			</TableContainer>
		</Grid>
	);
}

function createData(type, totalCost) {
	return { type, totalCost };
}

function createDataMod(type, totalCost, costModulo) {
	return { type, totalCost, costModulo };
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

function formatNumber(num) {
	return new Intl.NumberFormat("en-US", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(num || 0);
}