import React, { useEffect, useState, useMemo } from "react";
import { Building2, AlertCircle, Upload, X, SaveIcon } from "lucide-react";
import {
	Alert,
	Box,
	Button,
	CircularProgress,
	Grid,
	Paper,
	Snackbar,
	Typography,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import DxfWriter from "dxf-writer";
import { resetExport } from "../../../redux/features/exportSlice";
import { setVista3DData } from "../../../redux/features/view3DSlice";
import { savePerimetersToAPI } from "../../../utils/perimeterAPI";
import { useParams } from "react-router-dom";
import { getProjectByIDCalc } from "../../../services/projectsService";
import { useRender } from '../RenderContext'; // <-- MOVIDO ARRIBA

import {
	getDistributionFromAPI,
	saveDistributionToAPI,
} from "../../../utils/distributionAPI";

export default function TerrainPlanner({ state, height }) {
	const [coordinates, setCoordinates] = useState([]);
	const [maxRectangle, setMaxRectangle] = useState(null);
	const [isCalculating, setIsCalculating] = useState(false);
	const [savingPerimeters, setSavingPerimeters] = useState(false);
	const [saveStatus, setSaveStatus] = useState({
		open: false,
		message: "",
		severity: "success",
	});

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100" style={{ height: height, width: "100%", position: "relative", overflow: "hidden" }}>
			<div className="lg:col-span-1 space-y-6" style={{ position: "absolute", top: 10, left: 10 }}>
				<div className="flex-shrink-0">
					<svg
						width="80"
						height="80"
						viewBox="-50 -50 100 100"
					>
						<circle
							cx="0"
							cy="0"
							r="40"
							fill="rgba(255, 255, 255, 0.95)"
							stroke="#334155"
							strokeWidth="2"
							filter="drop-shadow(0px 2px 4px rgba(0,0,0,0.2))"
						/>
						<line x1="0" y1="-35" x2="0" y2="35" stroke="#e2e8f0" strokeWidth="1" />
						<line x1="-35" y1="0" x2="35" y2="0" stroke="#e2e8f0" strokeWidth="1" />
						<path d="M 0,-30 L -6,-12 L 0,-18 L 6,-12 Z" fill="#ef4444" stroke="#991b1b" strokeWidth="1" />
						<text x="0" y="-33" textAnchor="middle" className="text-sm font-bold" fill="#ef4444">N</text>
						<path d="M 0,30 L -6,12 L 0,18 L 6,12 Z" fill="#94a3b8" stroke="#475569" strokeWidth="1" />
						<text x="0" y="38" textAnchor="middle" className="text-sm font-semibold" fill="#64748b">S</text>
						<text x="33" y="5" textAnchor="middle" className="text-sm" fill="#64748b">E</text>
						<text x="-33" y="5" textAnchor="middle" className="text-sm" fill="#64748b">O</text>
						<circle cx="0" cy="0" r="3" fill="#334155" />
					</svg>
				</div>
			</div>
			<div style={{ display: "flex", justifyContent: "center", width: "100%", height: "90vh", overflow: "hidden" }}>
				<Plano2D />
			</div>
		</div>
	);
}

const Plano2D = () => {
	const params = useParams();
	const url_calc = import.meta.env.VITE_API_BASE_URL_CALCULATE;

	return (
		<div style={{ width: "100%", background: '#fff', overflow: "hidden" }}>
			<h3 style={{ marginLeft: "100px", marginTop: "20px" }}>Plano Georeferenciado</h3>
			<div style={{ display: "flex", width: "100%", overflow: "hidden" }}>
				<ProjectViewer params={params} url_calc={url_calc} />
			</div>
		</div>
	);
};

function ProjectViewer({ params, url_calc }) {
	const { renderSeleccionado, loading, setLoading, dataProject, retryJob } = useRender();
	const tipo_render = ["2d", "3d", "render ia"];

	const handleLoad = () => {
		// CORREGIDO: Cuando el iframe termina de cargar, apagamos el spinner
		setLoading(false);
	};

	// Si los datos del proyecto aún no llegan, mostramos el spinner global
	if (!dataProject || !dataProject.status_job) {
		return (
			<div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "85vh", width: "100%" }}>
				<CircularProgress color="info" />
			</div>
		);
	}

	return (
		<div style={{ display: "flex", marginLeft: "27px", flexDirection: "column", width: "100%", overflow: "hidden" }}>

			{/* ESTADO: TERMINADO (Muestra el iframe) */}
			{dataProject.status_job === "finished" && (
				<>
					{loading && <CircularProgress color="info" style={{ position: "absolute", alignSelf: "center", top: "35vh" }} />}
					<iframe
						title={`Project Viewer ${tipo_render[renderSeleccionado]}`}
						src={`${url_calc}/api/v3/project-render/${params.id}?render=${tipo_render[renderSeleccionado]}`}
						style={{ border: "1px solid #fff", height: "85vh", width: "100%", overflow: "hidden" }}
						onLoad={handleLoad}
					/>
				</>
			)}

			{/* ESTADO: FALLIDO (Muestra error y botón de reintentar) */}
			{dataProject.status_job === "failed" && (
				<div style={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					height: "85vh",
					color: "#666"
				}}>
					<p style={{ fontSize: "18px", fontWeight: "bold" }}>⚠️ La generación falló</p>
					<button
						onClick={retryJob}
						style={{
							padding: "10px 20px",
							backgroundColor: "#007bff",
							color: "#fff",
							border: "none",
							borderRadius: "5px",
							cursor: "pointer",
							marginTop: "10px",
							fontWeight: "bold"
						}}
					>
						🔄 Reintentar generación
					</button>
				</div>
			)}

			{/* ESTADO: EN PROGRESO o NUEVO (Muestra spinner) */}
			{(dataProject.status_job === "started" || dataProject.status_job === "queued" || dataProject.status_job === "pending") && (
				<div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "85vh", color: "#666" }}>
					<CircularProgress color="info" style={{ marginBottom: "15px" }} />
					<p>Generando plano, por favor espera...</p>
				</div>
			)}

		</div>
	);
}