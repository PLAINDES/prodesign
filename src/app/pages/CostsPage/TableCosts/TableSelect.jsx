import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import styled from "@mui/material/styles/styled";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import tableCellClasses from "@mui/material/TableCell/tableCellClasses";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import MuiRadio from "@mui/material/Radio";
import {row_lima_callao} from "./options_table"
import {rows_excep_lima_callao} from "./options_table"
import {rows_selva} from "./options_table"
import {rows_sierra} from "./options_table"
import {rows} from "./options_table"

export default function TableSelect({ regionProject, categories }) {
	const [selectedCategories, setSelectedCategories] = useState({
		...categories,
	});

	const [optionsSelectedRegion, setoptionsSelectedRegion] = useState(rows)

	useEffect(()=>{
		console.log("REGION: ", regionProject);
		if (regionProject == "SIERRA") {
			setoptionsSelectedRegion(rows_sierra)
		}
		else if (regionProject == "SELVA") {
			setoptionsSelectedRegion(rows_selva)
		}
		else if (regionProject == "COSTA (EXCEPTO LIMA METROPOLITANA Y CALLAO)") {
			setoptionsSelectedRegion(rows_excep_lima_callao)
		}
		else if (regionProject == "LIMA METROPOLITANA Y PROVINCIA CONSTITUCIONAL DEL CALLAO") {
			setoptionsSelectedRegion(rows_sierra)
		}

	}, [regionProject])

	const handleChange = (evt) => {
		setSelectedCategories({
			...selectedCategories,
			[evt.target.name]: evt.target.value,
		});
	};

	return (
		<TableContainer component={Paper}>
			<Table
				sx={{
					minWidth: 890,
					borderCollapse: "separate",
					borderSpacing: 3,
				}}
			>
				<TableHead>
					<TableRow>
						<StyledTableCell align="center" rowSpan={2}>
							CATEGORIA
						</StyledTableCell>
						<StyledTableCell align="center" colSpan={2}>
							ESTRUCTURAS
						</StyledTableCell>
						<StyledTableCell align="center" colSpan={4}>
							ACABADOS
						</StyledTableCell>
						<StyledTableCell
							align="center"
							rowSpan={2}
							sx={{ maxWidth: "210px" }}
						>
							INSTALACIONES. ELECT. Y SANT.
						</StyledTableCell>
					</TableRow>
					<TableRow>
						<StyledTableCell align="center">
							MUROS Y COLUMNAS
						</StyledTableCell>
						<StyledTableCell align="center">TECHOS</StyledTableCell>
						<StyledTableCell align="center">PISOS</StyledTableCell>
						<StyledTableCell align="center">
							PUERTAS Y VENTANAS
						</StyledTableCell>
						<StyledTableCell align="center">
							REVESTIMIENTOS
						</StyledTableCell>
						<StyledTableCell align="center">BAÑOS</StyledTableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{optionsSelectedRegion.map((row, i) => (
						<StyledTableRow
							key={i}
							onClick={(evt) => evt.target.children[0].click()}
						>
							<StyledTableCell
								component="th"
								scope="row"
								align="center"
							>
								<span>{row.categoria}</span>
							</StyledTableCell>
							<StyledTableCell align="center">
								<Radio
									name="muros_y_columnas"
									value={row.categoria}
									checked={
										selectedCategories.muros_y_columnas ===
										row.categoria
									}
									onChange={handleChange}
									disabled={!row.muros_y_columnas}
								/>
								<Typography maxWidth="140px" fontSize="0.9rem">
									{row.muros_y_columnas}
								</Typography>
							</StyledTableCell>
							<StyledTableCell align="center">
								<Radio
									type="radio"
									name="techos"
									value={row.categoria}
									checked={
										selectedCategories.techos ===
										row.categoria
									}
									onChange={handleChange}
									disabled={!row.techos}
								/>
								<Typography maxWidth="140px" fontSize="0.9rem">
									{row.techos}
								</Typography>
							</StyledTableCell>
							<StyledTableCell align="center">
								<Radio
									type="radio"
									name="pisos"
									value={row.categoria}
									checked={
										selectedCategories.pisos ===
										row.categoria
									}
									onChange={handleChange}
									disabled={!row.pisos}
								/>
								<Typography maxWidth="140px" fontSize="0.9rem">
									{row.pisos}
								</Typography>
							</StyledTableCell>
							<StyledTableCell align="center">
								<Radio
									type="radio"
									name="puertas_y_ventanas"
									value={row.categoria}
									checked={
										selectedCategories.puertas_y_ventanas ===
										row.categoria
									}
									onChange={handleChange}
									disabled={!row.puertas_y_ventanas}
								/>
								<Typography maxWidth="140px" fontSize="0.9rem">
									{row.puertas_y_ventanas}
								</Typography>
							</StyledTableCell>
							<StyledTableCell align="center">
								<Radio
									type="radio"
									name="revestimientos"
									value={row.categoria}
									checked={
										selectedCategories.revestimientos ===
										row.categoria
									}
									onChange={handleChange}
									disabled={!row.revestimientos}
								/>
								<Typography maxWidth="140px" fontSize="0.9rem">
									{row.revestimientos}
								</Typography>
							</StyledTableCell>
							<StyledTableCell align="center">
								<Radio
									type="radio"
									name="banos"
									value={row.categoria}
									checked={
										selectedCategories.banos ===
										row.categoria
									}
									onChange={handleChange}
									disabled={!row.banos}
								/>
								<Typography maxWidth="140px" fontSize="0.9rem">
									{row.banos}
								</Typography>
							</StyledTableCell>
							<StyledTableCell align="center">
								<Radio
									type="radio"
									name="instalaciones"
									value={row.categoria}
									checked={
										selectedCategories.instalaciones ===
										row.categoria
									}
									onChange={handleChange}
									disabled={!row.instalaciones}
								/>
								<Typography maxWidth="140px" fontSize="0.9rem">
									{row.instalaciones}
								</Typography>
							</StyledTableCell>
						</StyledTableRow>
					))}
				</TableBody>
			</Table>
		</TableContainer>
	);
}

const StyledTableCell = styled(TableCell)(({ theme }) => ({
	[`&.${tableCellClasses.head}`]: {
		backgroundColor: "rgb(5, 36, 92)",
		padding: 10,
		color: theme.palette.common.white,
		borderBottom: 0,
		[theme.breakpoints.up("sm")]: {
			padding: 14,
		},
		// variacion good del blanco = rgba(224, 224, 224, 1)
	},
	[`&.${tableCellClasses.body}`]: {
		fontSize: 14,
		padding: 10,
		[theme.breakpoints.up("sm")]: {
			padding: 14,
		},
	},
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
	"&:nth-of-type(odd)": {
		backgroundColor: theme.palette.action.hover,
	},
	// hide last border
	"&:last-child td, &:last-child th": {
		borderBottom: 0,
	},
}));

const Radio = styled(MuiRadio)(({ theme }) => ({
	color: "rgba(14, 100, 184, 0.4)",
	"&.Mui-checked": {
		color: "rgba(14, 100, 184, 1)",
	},
}));

{
	/* <ul>
  <li>
    <input type="radio" id="f-option" name="selector" />
    <label for="f-option">Pizza</label>
    
    <div class="check"></div>
  </li>
  
  <li>
    <input type="radio" id="s-option" name="selector" />
    <label for="s-option">Bacon</label>
    
    <div class="check"><div class="inside"></div></div>
  </li>
  
  <li>
    <input type="radio" id="t-option" name="selector" />
    <label for="t-option">Cats</label>
    
    <div class="check"><div class="inside"></div></div>
  </li>
</ul> */
}
