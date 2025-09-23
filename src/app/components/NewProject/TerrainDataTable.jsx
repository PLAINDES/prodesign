import {
	Card,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TablePagination,
	TableRow,
} from "@mui/material";
import React, { useEffect, useState } from "react";
//COMPONENTE TABLA DE VERTICES
const TerrainDataTable = ({ vertices, onExcludedChange, onPriorityChange }) => {
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(4);
	const [selectedOptions, setSelectedOptions] = useState({});
	const [excludedVertices, setExcludedVertices] = useState([]);
	const [priorityVertices, setPriorityVertices] = useState([]);

	useEffect(() => {
		setSelectedOptions(
			vertices.reduce((acc, vertice) => {
				acc[vertice.id] = "";
				return acc;
			}, {})
		);
	}, [vertices]);

	useEffect(() => {
		const excluded = vertices
			.filter((vertice) => selectedOptions[vertice.id] === "Exclusion")
			.map((vertice) => [vertice.x, vertice.y]);
		setExcludedVertices(excluded);
		onExcludedChange && onExcludedChange(excluded);
	}, [selectedOptions, vertices]);
	useEffect(() => {
		const priority = vertices
			.filter((vertice) => selectedOptions[vertice.id] === "Prioridad")
			.map((vertice) => [vertice.x, vertice.y]);
		setPriorityVertices(priority);
		onPriorityChange && onPriorityChange(priority);
	}, [selectedOptions, vertices]);

	const handleSelectChange = (id, value) => {
		setSelectedOptions((prevOptions) => ({
			...prevOptions,
			[id]: value, // Se asigna el valor a un ID único
		}));
	};

	const handleChangePage = (event, newPage) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (event) => {
		setRowsPerPage(+event.target.value);
		setPage(0);
	};
	//console.log("options", selectedOptions);
	console.log("vertice prioriaria:", priorityVertices);
	console.log("vertice excluidas:", excludedVertices);
	return (
		<>
			<TableContainer component={Paper} sx={{ pl: 4, pt: 2 }}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell>Verticess</TableCell>
							<TableCell align="left">Lado</TableCell>
							<TableCell align="left">Coordenada X</TableCell>
							<TableCell align="left">Coordenada Y</TableCell>
							<TableCell>Seleccionar</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{vertices
							.slice(
								page * rowsPerPage,
								page * rowsPerPage + rowsPerPage
							)
							.map((vertice, index) => (
								<TableRow key={vertice.id}>
									<TableCell>{vertice.id}</TableCell>
									<TableCell>
										{vertice.id}-{`V${index + 2}`}
									</TableCell>
									<TableCell>{vertice.x}</TableCell>
									<TableCell>{vertice.y}</TableCell>
									<TableCell>
										<div>
											<label>Selecciona opcion</label>
											<select
												value={
													selectedOptions[
														vertice.id
													] || ""
												}
												onChange={(e) =>
													handleSelectChange(
														vertice.id,
														e.target.value
													)
												}
											>
												<option value="">
													--Seleccionar--
												</option>
												<option value="Prioridad">
													Prioridad
												</option>
												<option value="Exclusion">
													Exclusion
												</option>
												<option value="Comentario">
													Comentario
												</option>
											</select>
										</div>
									</TableCell>
									<TableCell></TableCell>
								</TableRow>
							))}
					</TableBody>
				</Table>

				<TablePagination
					rowsPerPageOptions={[4, 8, 12]}
					component="div"
					count={vertices.length}
					rowsPerPage={rowsPerPage}
					page={page}
					onPageChange={handleChangePage}
					onRowsPerPageChange={handleChangeRowsPerPage}
				/>
			</TableContainer>
		</>
	);
};

export default TerrainDataTable;
