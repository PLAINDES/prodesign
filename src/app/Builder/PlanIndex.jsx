import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar/Sidebar";
import Plan3D from "./Plan3D/Plan3D";
import Box from "@mui/material/Box";
import Grid from '@mui/material/Grid2';
import { useRender } from './RenderContext';
import CircularProgress from '@mui/material/CircularProgress';
import Backdrop from '@mui/material/Backdrop'; // Nuevo: Para el fondo del loading

import { OpenIconSpeedDial } from "./components/OpenIconSpeedDial";
import { getProjectByID } from "../../services/projectsService";
import { RenderProvider } from './RenderContext';
import zIndex from "@mui/material/styles/zIndex";
import axios from "axios";

// --- SEPARACIÓN DEL COMPONENTE PARA ARREGLAR EL ERROR DEL CONTEXT ---
function PlanContent() {
	const [state, setState] = useState();
	const [mobileOpen, setMobileOpen] = useState(false);
	const [view, setViewState] = useState({ view: "2D", roof: true });
	const params = useParams();
	const { dataProject, loading, setLoading, error, retryJob, renderSeleccionado, jobStatus } = useRender();
	const tipo_render = ["2d", "3d", "render ia"];
	const BASE_URL_CALC = import.meta.env.VITE_API_BASE_URL_CALCULATE;
	const url_calc = BASE_URL_CALC;

	const handleViewState = (state) => {
		setViewState((prev) => ({ ...prev, ...state }));
	};

	const handleSetClassrooms = ({ inicial, primaria, secundaria }) => {
		setState({
			...state,
			aforo: {
				...state.aforo,
				aulaInicial: inicial,
				aulaPrimaria: primaria,
				aulaSecundaria: secundaria,
			},
		});
	};

	const handleDrawerToggle = () => {
		setMobileOpen((prevState) => !prevState);
	};

	const handleLoad = () => {
		console.log("Iframe loaded successfully");
		setLoading(false);
	};

	return (
		<div style={{ height: "100vh", display: "flex", flexDirection: "column", backgroundColor: "#0F172A" }}>
			<Header
				state={state}
				view={view}
				handleViewState={handleViewState}
				handleDrawerToggle={handleDrawerToggle}
				handleSetClassrooms={handleSetClassrooms}
			/>

			<div style={{ flex: 1, display: "flex", position: "relative" }}>
				{/* --- INTERFAZ DE CARGA CENTRADA Y MEJORADA --- */}
				<Backdrop
					sx={{ 
						color: '#fff', 
						zIndex: (theme) => theme.zIndex.drawer + 1, 
						position: "absolute",
						top: 0,
						left: 0,
						width: "100%",
						height: "100%",
						backgroundColor: "rgba(0, 0, 0, 0.7)",
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
					}}
					open={!!loading && !error}
				>
					{/* [DOCUMENTACIÓN - TAREA 2]: Overlay de Carga Contextual
					    Se evalúa el estado del trabajo (jobStatus) y el tipo de render 
					    para proveer una retroalimentación más amigable al usuario. */}
					<div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px", textAlign: "center" }}>
						<CircularProgress color="inherit" size={60} />
						<p style={{ fontWeight: "500", fontSize: "1.1rem" }}>
							{dataProject?.status_job === "finished" 
								? "Cargando vista..." 
								: renderSeleccionado === 0 
									? "Generando plano 2D..."
									: renderSeleccionado === 1
										? "Generando modelo 3D..."
										: "Procesando render IA..."}
						</p>
						{(jobStatus === "generating" || jobStatus === "failed") && (
							<p style={{ color: "#aaa", fontSize: "0.9rem" }}>
								{jobStatus === "failed" 
									? "Error al generar. Reintentando..." 
									: "Tiempo estimado: 1 a 3 minutos"}
							</p>
						)}
					</div>
				</Backdrop>

				{/* --- INTERFAZ DE ERROR --- */}
				{error && (
					<div style={{
						display: "flex", flexDirection: "column", alignItems: "center",
						justifyContent: "center", height: "100%", color: "#d32f2f", gap: "15px", width: "100%"
					}}>
						<p style={{ fontSize: "18px", fontWeight: "bold" }}>⚠️ {error}</p>
						<button
							onClick={retryJob}
							style={{ padding: "12px 24px", backgroundColor: "#007bff", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: "bold" }}
						>
							🔄 Reintentar generación
						</button>
					</div>
				)}

				{/* --- IFRAME PARA RESULTADO EXITOSO --- */}
				{dataProject?.status_job === "finished" && (
					<div style={{
						display: "flex",
						flexDirection: "column",
						justifyContent: "center",
						alignItems: "center",
						width: "100%",
						height: "100%",
						overflow: "hidden",
						padding: "0" /* [DOCUMENTACIÓN] Edge-to-edge (Eliminado el padding para inmersión 3D completa) */
					}}>
						<iframe
							title={`Project Viewer ${tipo_render[renderSeleccionado]}`}
							src={`${url_calc}/api/v3/project-render/${params.id}?render=${encodeURIComponent(tipo_render[renderSeleccionado])}`}
							style={{
								border: "none", /* Eliminamos borde */
								height: "100%",
								width: "100%",
								overflow: "hidden",
								backgroundColor: "transparent"
							}}
							onLoad={handleLoad}
						/>
					</div>
				)}

				<div item>
					<Sidebar
						state={state}
						style={{
							height: "calc(100vh - 65px)",
							position: "fixed",
							top: 65,
							overflowY: "auto",
							right: 0, /* Pegado a la derecha */
							zIndex: 100
						}}
					/>
				</div>
			</div>
		</div>
	);
}

// <--- LÍNEA AÑADIDA 2: Envolver el contenido para que useRender funcione
export default function PlanIndex() {
	return (
		<RenderProvider>
			<PlanContent />
		</RenderProvider>
	);
}