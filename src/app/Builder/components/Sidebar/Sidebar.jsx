import { useEffect } from "react";
import "./styles.css";
import {
	Accordion,
	AccordionDetails,
	AccordionSummary,
	Box,
	Typography,
} from "@mui/material";
import { ChevronDown, Home } from "lucide-react";
import { useRender } from '../../RenderContext';

// [DOCUMENTACIÓN]
// Funciones auxiliares para calcular datos geométricos soportando tanto formato objeto como array.
const getCoord = (v) => {
    if (Array.isArray(v)) {
        return { x: Number(v[0]) || 0, y: Number(v[1]) || 0 };
    } else if (v && typeof v === 'object') {
        return { x: Number(v.x) || Number(v.X) || 0, y: Number(v.y) || Number(v.Y) || 0 };
    }
    return { x: 0, y: 0 };
};

const calculatePolygonArea = (vertices) => {
    if (!vertices || vertices.length < 3) return 0;
    let area = 0;
    for (let i = 0; i < vertices.length; i++) {
        let j = (i + 1) % vertices.length;
        const vi = getCoord(vertices[i]);
        const vj = getCoord(vertices[j]);
        area += vi.x * vj.y;
        area -= vj.x * vi.y;
    }
    return Math.abs(area / 2).toFixed(2);
};

const calculatePerimeter = (vertices) => {
    if (!vertices || vertices.length < 2) return 0;
    let perimeter = 0;
    for (let i = 0; i < vertices.length; i++) {
        let j = (i + 1) % vertices.length;
        const vi = getCoord(vertices[i]);
        const vj = getCoord(vertices[j]);
        const dx = vj.x - vi.x;
        const dy = vj.y - vi.y;
        perimeter += Math.sqrt(dx * dx + dy * dy);
    }
    return perimeter.toFixed(2);
};

export default function Sidebar({ state, school, ...props}) {
	const { dataProject } = useRender();

	// [DOCUMENTACIÓN]
	// Se parsean los vértices priorizando vertices_terreno_utm (coordenadas 2D reales)
	// para evitar que use la lista de malla 3D y arroje NaN.
	let parsedVertices = [];
	try {
		const rawVertices = dataProject?.vertices_terreno_utm || dataProject?.vertices || [];
		parsedVertices = typeof rawVertices === 'string' 
			? JSON.parse(rawVertices) 
			: rawVertices;
		if (!Array.isArray(parsedVertices)) parsedVertices = [];
	} catch (e) { parsedVertices = []; }

	let parsedAforo = [];
	try {
		parsedAforo = typeof dataProject?.aforo === 'string'
			? JSON.parse(dataProject.aforo)
			: dataProject?.aforo || [];
		if (!Array.isArray(parsedAforo)) parsedAforo = [];
	} catch (e) { parsedAforo = []; }

	// [DOCUMENTACIÓN]
	// Se extraen las dimensiones reales calculadas por el motor 3D desde resumen_ambientes.
	let parsedResumenAmbientes = [];
	try {
		parsedResumenAmbientes = typeof dataProject?.resumen_ambientes === 'string'
			? JSON.parse(dataProject.resumen_ambientes)
			: dataProject?.resumen_ambientes || [];
		if (!Array.isArray(parsedResumenAmbientes)) parsedResumenAmbientes = [];
	} catch (e) { parsedResumenAmbientes = []; }

	const medidasTerreno = parsedResumenAmbientes.find(item => item && item.medidas_terreno)?.medidas_terreno || {};
	
	// Cálculos
	const totalArea = calculatePolygonArea(parsedVertices);
	const totalPerimeter = calculatePerimeter(parsedVertices);
	
	const areaDisponible = medidasTerreno.area_disponible || totalArea;
	const anchoDisponible = medidasTerreno.ancho_disponible || "Calculando...";
	const largoDisponible = medidasTerreno.largo_disponible || "Calculando...";
	
	const totalCapacity = parsedAforo.reduce((sum, item) => sum + (Number(item.aforo_por_grado) || 0), 0);
	const totalClassrooms = parsedAforo.reduce((sum, item) => sum + (Number(item.cantidad_aulas) || 0), 0);

	const aulasInicial = parsedAforo.filter(a => String(a.grado).toLowerCase().includes('inicial')).reduce((sum, item) => sum + (Number(item.cantidad_aulas) || 0), 0);
	const aulasPrimaria = parsedAforo.filter(a => String(a.grado).toLowerCase().includes('primaria')).reduce((sum, item) => sum + (Number(item.cantidad_aulas) || 0), 0);
	const aulasSecundaria = parsedAforo.filter(a => String(a.grado).toLowerCase().includes('secundaria')).reduce((sum, item) => sum + (Number(item.cantidad_aulas) || 0), 0);

	useEffect(() => {
		Array.from(document.getElementsByClassName("sidebar-item")).forEach(
			(el) => {
				el.className = "sidebar-item active";
			}
		);
	}, []);

	return (
		<div className="sidebar" {...props}>
			<ul className="sidebar-list">
				<li className="sidebar-item">
					<span className="sidebar-anchor">
						Informacion del Proyecto{" "}
					</span>
					<p style={{ marginTop: ".4rem" }}>Nombre: {dataProject?.name}</p>
					<p>Versión: VERSIÓN 1</p>
					<p>Zona: {dataProject?.zone}</p>
					<p>
						Niveles:&nbsp;
						{dataProject?.pisos || state?.level || "1"}
					</p>
					<p>Tipo: {dataProject?.tipo || state?.sublevel}</p>
					<p>Aforo Estudiantil: {totalCapacity > 0 ? totalCapacity : (school?.maxCapacity || "No definido")}</p>
				</li>
				<li className="sidebar-item">
					<span className="sidebar-anchor">Terreno </span>
					<p>
						Area total: {totalArea}m
						<span style={{ fontSize: "1.5rem" }}>²</span>
					</p>
					<p>Perimetro: {totalPerimeter}m</p>
				</li>
				<li className="sidebar-item">
					<span className="sidebar-anchor">Area Disponible</span>
					<p style={{ marginTop: "10px" }}>
						Area : {areaDisponible}m<span style={{ fontSize: "1.5rem" }}>²</span>
					</p>
					<p>Perimetro : {totalPerimeter}m</p>
					<p>Ancho: {anchoDisponible}{typeof anchoDisponible === 'number' ? 'm' : ''}</p>
					<p>Largo: {largoDisponible}{typeof largoDisponible === 'number' ? 'm' : ''}</p>
				</li>
				<li className="sidebar-item">
					{/* <a href="#" className="sidebar-anchor">Cantidad: </a> */}
					<span className="sidebar-anchor">Cantidad</span>
					<Accordion
						sx={{
							boxShadow: "none",
							"&:before": { display: "none" },
							backgroundColor: "transparent",
						}}
					>
						<AccordionSummary
							expandIcon={<ChevronDown />}
							sx={{
								padding: 0,
								minHeight: "auto",
								"& .MuiAccordionSummary-content": {
									margin: "8px 0",
									display: "flex",
									alignItems: "center",
									gap: 1,
								},
							}}
						>
							{/* <SchoolIcon
								sx={{ fontSize: 20, color: "primary.main" }}
							/> */}
							<Typography
								variant="body3"
								sx={{ fontWeight: 600 }}
							>
								Aulas: {totalClassrooms > 0 ? totalClassrooms : (school?.numberOfClassrooms?.getTotal?.() || 0)}
							</Typography>
						</AccordionSummary>

						<AccordionDetails sx={{ padding: "0 0 0 5px" }}>
							<Box
								sx={{
									display: "flex",
									flexDirection: "column",
									gap: 0.5,
								}}
							>
								<Typography
									variant="body2"
									sx={{ color: "text.secondary" }}
								>
									📚 Inicial:{" "}
									{aulasInicial || 0}
								</Typography>
								<Typography
									variant="body2"
									sx={{ color: "text.secondary" }}
								>
									📘 Primaria:{" "}
									{aulasPrimaria || 0}
								</Typography>
								<Typography
									variant="body2"
									sx={{ color: "text.secondary" }}
								>
									📕 Secundaria:{" "}
									{aulasSecundaria || 0}
								</Typography>
							</Box>
						</AccordionDetails>
					</Accordion>
					<p>Baños : {school?.bathrooms.length}</p>
					<Accordion
						sx={{
							boxShadow: "none",
							"&:before": { display: "none" },
							backgroundColor: "transparent",
						}}
					>
						<AccordionSummary
							expandIcon={<ChevronDown />}
							sx={{
								padding: 0,
								minHeight: "auto",
								"& .MuiAccordionSummary-content": {
									margin: "4px 0",
									display: "flex",
									alignItems: "center",
									gap: 1,
								},
							}}
						>
							{/* <SchoolIcon
								sx={{ fontSize: 20, color: "primary.main" }}
							/> */}
							<Typography
								variant="body3"
								sx={{ fontWeight: 600 }}
							>
								Ambientes :{" "}
								{school?.complementaryEnvironment.length}
							</Typography>
						</AccordionSummary>

						<AccordionDetails sx={{ padding: "0 0 0 5px" }}>
							{school?.complementaryEnvironment.map((ambiente) => (
								<Box
									sx={{
										display: "flex",
										flexDirection: "column",
										gap: 10.5,
									}}
								>
									<Typography
										variant="body3"
										sx={{ color: "text.secondary" }}
									>
										{/* <Home sx={{}}/>{" "} */}
										{ambiente?.ambienteComplementario}
									</Typography>
								</Box>
							))}
						</AccordionDetails>
					</Accordion>
				</li>
			</ul>
		</div>
	);
}
