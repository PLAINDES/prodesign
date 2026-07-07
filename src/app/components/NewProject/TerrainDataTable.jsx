// [DOCUMENTACIÓN] Se reestructuró por completo el componente como un componente de presentación
// controlado, derivando la selección de opciones (Exclusión/Prioridad) directamente desde las propiedades
// 'excludedVertices' y 'priorityVertices' del padre. Se eliminaron los estados locales de selección
// y todos los 'useEffect' para descartar definitivamente los parpadeos y los bucles de renderizado.
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
	IconButton,
	Tooltip,
	TextField,
	Box
} from "@mui/material";
import React, { useState, useMemo } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import StraightenIcon from "@mui/icons-material/Straighten";

// Función auxiliar para calcular distancia entre dos puntos UTM
const calcularDistanciaUTM = (v1, v2) => {
	if (!v1 || !v2) return "0.00";
	const dx = v2.x - v1.x;
	const dy = v2.y - v1.y;
	return Math.sqrt(dx * dx + dy * dy).toFixed(2);
};

// [DOCUMENTACIÓN] Comparación robusta con tolerancia a coma flotante para asociar los selectores
const coordsMatch = (c1, c2) => {
	if (!c1 || !c2) return false;
	return Math.abs(Number(c1[0]) - Number(c2[0])) < 0.001 && 
	       Math.abs(Number(c1[1]) - Number(c2[1])) < 0.001;
};

// COMPONENTE TABLA DE VÉRTICES (CONTROLADO)
const TerrainDataTable = ({
	vertices,
	onExcludedChange,
	onPriorityChange,
	onDeleteVertex,
	onUpdateVertex,
	excludedVertices = [],
	priorityVertices = [],
}) => {
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(4);

	// [DOCUMENTACIÓN] Derivación instantánea y memoizada de las opciones seleccionadas
	const selectedOptions = useMemo(() => {
		const options = {};
		vertices.forEach((vertice) => {
			const isExcluded = excludedVertices?.some((c) => coordsMatch(c, [vertice.x, vertice.y]));
			const isPriority = priorityVertices?.some((c) => coordsMatch(c, [vertice.x, vertice.y]));
			
			if (isExcluded) {
				options[vertice.vertice] = "Exclusion";
			} else if (isPriority) {
				options[vertice.vertice] = "Prioridad";
			} else {
				options[vertice.vertice] = "";
			}
		});
		return options;
	}, [vertices, excludedVertices, priorityVertices]);

	// [DOCUMENTACIÓN] Manejo de cambio en el selector que actualiza las colecciones del padre
	const handleSelectChange = (vertice, value) => {
		const newExclusions = (excludedVertices || []).filter((c) => !coordsMatch(c, [vertice.x, vertice.y]));
		const newPriorities = (priorityVertices || []).filter((c) => !coordsMatch(c, [vertice.x, vertice.y]));

		if (value === "Exclusion") {
			newExclusions.push([vertice.x, vertice.y]);
		} else if (value === "Prioridad") {
			newPriorities.push([vertice.x, vertice.y]);
		}

		onExcludedChange && onExcludedChange(newExclusions);
		onPriorityChange && onPriorityChange(newPriorities);
	};

	const handleChangePage = (event, newPage) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (event) => {
		setRowsPerPage(+event.target.value);
		setPage(0);
	};

	return (
		<>
			<TableContainer component={Paper} sx={{ pl: 4, pt: 2 }}>
				<Table size="small">
					<TableHead>
						<TableRow>
							<TableCell>Vértice</TableCell>
							<TableCell align="left">Lado</TableCell>
							<TableCell align="left">Coordenada X</TableCell>
							<TableCell align="left">Coordenada Y</TableCell>
							<TableCell align="center">
								<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
									<StraightenIcon fontSize="small" sx={{ mr: 1 }} />
									Distancia (m)
								</Box>
							</TableCell>
							<TableCell>Seleccionar</TableCell>
							<TableCell align="center">Acciones</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{vertices
							.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
							.map((vertice) => {
								// Encontrar el índice real en el array completo (importante para la paginación)
								const currentIndex = vertices.findIndex(
									(v) => v.vertice === vertice.vertice
								);
								const nextIndex = (currentIndex + 1) % vertices.length;
								const nextVertice = vertices[nextIndex];
								const distancia = calcularDistanciaUTM(vertice, nextVertice);

								return (
									<TableRow key={vertice.vertice}>
										<TableCell>{vertice.vertice}</TableCell>
										<TableCell>
											{vertice.vertice} - {nextVertice.vertice}
										</TableCell>
										<TableCell>
											<TextField
												size="small"
												value={vertice.x}
												onChange={(e) =>
													onUpdateVertex?.(
														vertice.vertice,
														"x",
														parseFloat(e.target.value) || 0
													)
												}
												sx={{ width: 90 }}
												inputProps={{ step: "any" }}
												type="number"
											/>
										</TableCell>
										<TableCell>
											<TextField
												size="small"
												value={vertice.y}
												onChange={(e) =>
													onUpdateVertex?.(
														vertice.vertice,
														"y",
														parseFloat(e.target.value) || 0
													)
												}
												sx={{ width: 90 }}
												inputProps={{ step: "any" }}
												type="number"
											/>
										</TableCell>
										<TableCell align="center">
											<strong>{distancia}</strong>
										</TableCell>
										<TableCell>
											<select
												value={selectedOptions[vertice.vertice] || ""}
												onChange={(e) =>
													handleSelectChange(vertice, e.target.value)
												}
												style={{ padding: "4px", width: "100%" }}
											>
												<option value="">-- Seleccionar --</option>
												<option value="Prioridad">Prioridad</option>
												<option value="Exclusion">Exclusión</option>
												<option value="Comentario">Comentario</option>
											</select>
										</TableCell>
										<TableCell align="center">
											<Tooltip title="Eliminar vértice">
												<IconButton
													size="small"
													onClick={() => onDeleteVertex?.(vertice.vertice)}
													color="error"
													sx={{ p: 0.5 }}
												>
													<DeleteIcon fontSize="small" />
												</IconButton>
											</Tooltip>
										</TableCell>
									</TableRow>
								);
							})}
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