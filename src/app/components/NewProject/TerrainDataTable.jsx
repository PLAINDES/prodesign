// TAREA 1: Agregado botón para eliminar vértice en la tabla de terreno
// TAREA 2: Agregada columna de Distancia (m) usando fórmula euclidiana para UTM
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
import React, { useEffect, useState, useRef } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import StraightenIcon from "@mui/icons-material/Straighten";

// Función auxiliar para calcular distancia entre dos puntos UTM
const calcularDistanciaUTM = (v1, v2) => {
	if (!v1 || !v2) return "0.00";
	const dx = v2.x - v1.x;
	const dy = v2.y - v1.y;
	return Math.sqrt(dx * dx + dy * dy).toFixed(2);
};

// COMPONENTE TABLA DE VÉRTICES
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
	const [selectedOptions, setSelectedOptions] = useState({});

	// [DOCUMENTACIÓN] Se utiliza useRef para recordar las últimas listas de exclusión y prioridad notificadas
	// al padre, evitando bucles de renderizado infinitos si las funciones callback cambian de referencia.
	const lastExcludedRef = useRef(null);
	const lastPriorityRef = useRef(null);

	useEffect(() => {
		setSelectedOptions(
			vertices.reduce((acc, vertice) => {
				acc[vertice.vertice] = "";
				return acc;
			}, {})
		);
	}, [vertices]);

	// [DOCUMENTACIÓN] Sincroniza las opciones de la tabla cuando cambian los vértices excluidos
	// o prioritarios desde el exterior (por ejemplo, al hacer clic sobre ellos en el mapa/gráfico).
	useEffect(() => {
		let changed = false;
		const newOptions = { ...selectedOptions };
		vertices.forEach((vertice) => {
			const isExcluded = excludedVertices?.some(([vx, vy]) => vx === vertice.x && vy === vertice.y);
			const isPriority = priorityVertices?.some(([vx, vy]) => vx === vertice.x && vy === vertice.y);
			
			let expectedValue = "";
			if (isExcluded) expectedValue = "Exclusion";
			else if (isPriority) expectedValue = "Prioridad";

			const currentValue = selectedOptions[vertice.vertice] || "";
			if (currentValue !== expectedValue) {
				if (expectedValue !== "" || currentValue === "Exclusion" || currentValue === "Prioridad") {
					newOptions[vertice.vertice] = expectedValue;
					changed = true;
				}
			}
		});
		if (changed) {
			setSelectedOptions(newOptions);
		}
	}, [excludedVertices, priorityVertices, vertices]);

	useEffect(() => {
		const excluded = vertices
			.filter((vertice) => selectedOptions[vertice.vertice] === "Exclusion")
			.map((vertice) => [vertice.x, vertice.y]);

		const isSame = lastExcludedRef.current && 
			lastExcludedRef.current.length === excluded.length &&
			lastExcludedRef.current.every(([x, y], idx) => x === excluded[idx][0] && y === excluded[idx][1]);

		if (!isSame) {
			lastExcludedRef.current = excluded;
			onExcludedChange && onExcludedChange(excluded);
		}
	}, [selectedOptions, vertices, onExcludedChange]);

	useEffect(() => {
		const priority = vertices
			.filter((vertice) => selectedOptions[vertice.vertice] === "Prioridad")
			.map((vertice) => [vertice.x, vertice.y]);

		const isSame = lastPriorityRef.current && 
			lastPriorityRef.current.length === priority.length &&
			lastPriorityRef.current.every(([x, y], idx) => x === priority[idx][0] && y === priority[idx][1]);

		if (!isSame) {
			lastPriorityRef.current = priority;
			onPriorityChange && onPriorityChange(priority);
		}
	}, [selectedOptions, vertices, onPriorityChange]);

	const handleSelectChange = (id, value) => {
		setSelectedOptions((prevOptions) => ({
			...prevOptions,
			[id]: value,
		}));
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
													handleSelectChange(vertice.vertice, e.target.value)
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