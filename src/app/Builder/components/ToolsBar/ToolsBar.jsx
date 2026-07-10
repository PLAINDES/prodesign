import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from 'axios';
import Swal from "sweetalert2";
import { requestExchangeCode } from "../../../../utils/probudgetsExchange";
import {
	setPlayCamera,
	setRoof,
	setColorWall,
	setColorForLevel,
	setClassroomsLights,
} from "../../../../redux/building/buildingSlice";
import styled from "@mui/material/styles/styled";
import MuiButton from "@mui/material/Button";
// import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import PlayIcon from "@mui/icons-material/PlayCircle";
// import AreasList from "../../Plan3D/components/AreasList";
import Button3D from "./Buttons/Button3D";
import Button2D from "./Buttons/Button2D";
// import ButtonSave from "./Buttons/ButtonSave";
import "./styles.css";
import Settings from "../Settings/Settings";
import { requestExport } from "../../../../redux/features/exportSlice";
import { useParams } from "react-router-dom";

import { useRender } from '../../RenderContext';
import { useApi } from '../../../../hooks/useApi';


const BASE_URL_CALC = import.meta.env.VITE_API_BASE_URL_CALCULATE;

export default function ToolsBar({
	state,
	school,
	view,
	handleViewState,
	handleSetClassrooms,
}) {
	const dispatch = useDispatch();
	// [DOCUMENTACIÓN] Estado local para prevenir doble clic / doble envío al generar el PDF para ProInvierte
	const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
	const { sendData } = useApi();

	function baseFn(value) {
		dispatch(setColorWall({ color: value }));
	}

	const handleColorWall = debounce((value) => baseFn(value));
	const params = useParams();


	const handleImgPlane2D = async (projectId) => {
		try {
			const token = localStorage.getItem('token');
			const response = await axios.get(`/api/v1/project/${Number(projectId - 1)}`, {
				headers: {
					'Authorization': `Bearer ${token}`,
					'Accept': 'text/html', // opcional, para que el servidor sepa que esperamos HTML
				}
			});

			// 🔹 Obtener el HTML como string
			const htmlContent = response.data;

			// 🔹 Insertarlo en el iframe usando srcdoc
			const iframe = document.getElementById("miIframe"); // tu iframe en el DOM
			iframe.srcdoc = htmlContent;

		} catch (error) {
			console.log(error);
		}
	}

	const handleDownloadDXF = async (projectId) => {
		try {
			const token = localStorage.getItem('token');
			const response = await axios.get(`/api/v1/project-export/${Number(projectId - 1)}`, {
				responseType: 'blob', // <-- ESTO ES LO MÁS IMPORTANTE
				headers: {
					// El estándar es 'Bearer ' seguido del token
					'Authorization': `Bearer ${token}`,
					'Accept': 'application/dxf'
				}
			});

			// Crear un link temporal en el DOM
			const url = window.URL.createObjectURL(new Blob([response.data]));
			const link = document.createElement('a');
			link.href = url;

			// Nombre del archivo que verá el usuario
			link.setAttribute('download', `Plano_Proyecto_${projectId}.dxf`);

			document.body.appendChild(link);
			link.click();

			// Limpieza
			link.parentNode.removeChild(link);
			window.URL.revokeObjectURL(url);
		} catch (error) {
			console.error("Error al descargar el DXF:", error);
		}
	};

	const handleExportChange = (event) => {
		const exportType = event.target.value; // 'json', 'excel', etc.
		console.log(exportType);
		handleDownloadDXF(params.id)

		// if (exportType) {
		// 	dispatch(requestExport(exportType));
		// }
	};

	const tipo_render = ["2d", "3d", "render ia"];
	// [DOCUMENTACIÓN] Se añade dataProject desde el hook useRender para usarlo como fallback si no se ha modificado el estado local.
	const { renderSeleccionado, cambiarRender, dataProject } = useRender();


	async function getProinvierteLink() {
		if (isGeneratingPdf) return;

		const projectId = params.id;
		const url_api_generate = `${BASE_URL_CALC}/api/v3/project/generate-proinvierte/${projectId}`;
		const url_proinvierte = `${import.meta.env.VITE_URL_PROINVIERTE}/prodesign-import?prodesign=${projectId}`;

		setIsGeneratingPdf(true);

		try {
			Swal.fire({
				title: 'Generando PDF...',
				text: 'Preparando el documento para ProInviert',
				allowOutsideClick: false,
				allowEscapeKey: false,
				didOpen: () => {
					Swal.showLoading();
				}
			});

			const response = await axios.get(url_api_generate);
			const data = response.data;

			const pdfUrl = data?.url_pdf || data?.result?.url_pdf;

			if (pdfUrl) {
				Swal.fire({
					title: '¡PDF Generado!',
					text: 'Se ha generado la información para ProInviert.',
					icon: 'success',
					showCancelButton: true,
					confirmButtonText: 'Ver en ProInviert',
					cancelButtonText: 'Descargar PDF'
				}).then((result) => {
					if (result.isConfirmed) {
						window.open(url_proinvierte, '_blank');
					} else if (result.dismiss === Swal.DismissReason.cancel) {
						window.open(pdfUrl, '_blank');
					}
				});
			} else {
				throw new Error(data?.message || 'El servidor no respondió con éxito.');
			}

		} catch (error) {
			console.error("Error al generar PDF para ProInviert:", error);
			const errorMsg = error.response?.data?.detail || error.message || 'Hubo un error al generar el PDF del proyecto.';
			Swal.fire({
				title: 'Error',
				text: errorMsg,
				icon: 'error',
				confirmButtonText: 'Aceptar'
			});
		} finally {
			setIsGeneratingPdf(false);
		}
	}

	const { idToken, accessToken } = useSelector((state) => state.auth);
	const [isSendingToProbudgets, setIsSendingToProbudgets] = useState(false);
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const dropdownRef = useRef(null);

	useEffect(() => {
		function handleClickOutside(e) {
			if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
				setDropdownOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	// [DOCUMENTACIÓN] Manejador de redirección para "Enviar a ProBudgets".
	// Primero sincroniza los datos del proyecto con la API de ProBudgets (POST /v1/integracion/sync),
	// luego obtiene el token Cognito (en memoria) o local, solicita un código de intercambio de un solo uso
	// desde nuestro backend, y redirige al portal de ProBudgets con dicho código (?exchange_code=...)
	// o con el token en hash (#token=...) como fallback seguro para evitar logs del lado del servidor.
	const handleSendToProbudgets = async (e) => {
		if (e) e.preventDefault();
		const projectId = params.id;
		const urlProbudgetsPortal = import.meta.env.VITE_URL_PROBUDGETS_PORTAL;

		if (!projectId || !urlProbudgetsPortal) {
			Swal.fire({
				title: 'Configuración incompleta',
				text: 'Falta configurar la URL del portal de ProBudgets o el ID del proyecto.',
				icon: 'error',
				confirmButtonText: 'Aceptar'
			});
			return;
		}

		// Obtenemos token en memoria (SSO) o fallback de localStorage
		const token = idToken || accessToken || localStorage.getItem("token");

		if (!token) {
			Swal.fire({
				title: 'Sesión Requerida',
				text: 'No tienes una sesión activa para enviar este proyecto. Por favor, inicia sesión.',
				icon: 'warning',
				confirmButtonText: 'Aceptar'
			});
			return;
		}

		setIsSendingToProbudgets(true);

		try {
			// [DOCUMENTACIÓN] Sincronizar datos del proyecto con ProBudgets antes de redirigir
			Swal.fire({
				title: 'Sincronizando...',
				text: 'Enviando datos del proyecto a ProBudgets',
				allowOutsideClick: false,
				allowEscapeKey: false,
				didOpen: () => Swal.showLoading()
			});

			const projectData = { ...state, id: projectId };
			await sendData(projectData);

			const exchangeResult = await requestExchangeCode(token);
			let finalUrl = "";

			if (exchangeResult.useFallback) {
				// Fallback seguro: pasar token en fragmento hash
				finalUrl = `${urlProbudgetsPortal}?proyecto_id=${projectId}#token=${encodeURIComponent(token)}`;
			} else {
				// Estándar seguro: canjear código temporal query string
				finalUrl = `${urlProbudgetsPortal}?proyecto_id=${projectId}&exchange_code=${encodeURIComponent(exchangeResult.exchangeCode)}`;
			}

			Swal.close();
			window.open(finalUrl, "_blank", "noopener,noreferrer");
		} catch (err) {
			console.error("Error al enviar a ProBudgets:", err);
			Swal.fire({
				title: 'Error',
				text: err.message || 'No se pudo completar el envío a ProBudgets.',
				icon: 'error',
				confirmButtonText: 'Aceptar'
			});
		} finally {
			setIsSendingToProbudgets(false);
		}
	};

	return (
		<Box
			sx={{
				display: "flex",
				alignItems: "center",
				flex: 1,
			}}
		>
			<Link to={"/"} className="toolbar-logo">
				ProDesign
			</Link>
			<select style={{ backgroundColor: "#E4E6EF", margin: "0 2.4rem" }}>
				<option>VERSION 1: HOME</option>
				<option>ESTRUCTURA</option>
			</select>
			<nav className="greedy">
				{/* width: 100% */}
				<ul className="links">
					{/* <li>
						<Button
							onClick={() =>
								dispatch(
									setPlayCamera({ isPlayCamera: "play" })
								)
							}
						>
							<PlayIcon htmlColor="#3699FF" />
							&nbsp; Play
						</Button>
					</li> */}

					{/* <li>
						<Button2D handleViewState={handleViewState} />
					</li>

					<li>
						<Button3D handleViewState={handleViewState} />
					</li> */}
					{/* [DOCUMENTACIÓN] Se movieron "Settings" (Ajustes) y "select-export" (EXPORTAR) dentro del contenedor flex principal para asegurar una alineación horizontal perfecta y homogénea en toda la barra de herramientas superior. */}
					<div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
						{tipo_render.map((tipo, index) => (
							<button
							key={index}
							onClick={() => cambiarRender(index)} // Cambia entre 0 (2d) y 1 (3d)
							style={{
								marginTop: "4px",
								height:"38px",
								padding: "0px 16px",
								border: "1px solid #ccc",
								backgroundColor: renderSeleccionado === index ? "#007bff" : "#fff",
								color: renderSeleccionado === index ? "#fff" : "#000",
								cursor: "pointer",
								borderRadius: "5px",
								fontWeight: "bold"
							}}
							>
							{tipo.toUpperCase()}
							</button>
						))}

						<div ref={dropdownRef} style={{ position: "relative", display: "inline-block" }}>
							<button
								onClick={() => setDropdownOpen(!dropdownOpen)}
								style={{
									marginTop: "4px",
									height: "38px",
									padding: "0px 20px",
									border: "none",
									background: "linear-gradient(135deg, #6c757d 0%, #495057 100%)",
									color: "#fff",
									cursor: "pointer",
									borderRadius: "20px",
									fontWeight: 600,
									fontSize: "13px",
									display: "inline-flex",
									alignItems: "center",
									gap: "8px",
									letterSpacing: "0.5px",
									transition: "all 0.25s ease",
									boxShadow: "0 3px 10px rgba(108,117,125,0.35)"
								}}
								onMouseEnter={(e) => {
									e.currentTarget.style.transform = "translateY(-1px)";
									e.currentTarget.style.boxShadow = "0 5px 16px rgba(108,117,125,0.45)";
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.transform = "translateY(0)";
									e.currentTarget.style.boxShadow = "0 3px 10px rgba(108,117,125,0.35)";
								}}
							>
								<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
									<path d="M22 2L11 13"/>
									<path d="M22 2L15 22L11 13L2 9L22 2Z"/>
								</svg>
								<span>Enviar</span>
								<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "transform 0.25s", transform: dropdownOpen ? "rotate(180deg)" : "rotate(0)" }}>
									<polyline points="6 9 12 15 18 9"/>
								</svg>
							</button>

							{dropdownOpen && (
								<div
									style={{
										position: "absolute",
										top: "calc(100% + 8px)",
										left: 0,
										backgroundColor: "#fff",
										borderRadius: "16px",
										boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
										zIndex: 2000,
										minWidth: "210px",
										padding: "8px"
									}}
								>
									<button
										onClick={() => { getProinvierteLink(); setDropdownOpen(false); }}
										disabled={isGeneratingPdf}
										style={{
											width: "100%",
											padding: "12px 16px",
											border: "none",
											background: isGeneratingPdf ? "#f8f9fa" : "none",
											cursor: isGeneratingPdf ? "default" : "pointer",
											display: "flex",
											alignItems: "center",
											gap: "14px",
											fontSize: "14px",
											fontWeight: 600,
											color: isGeneratingPdf ? "#adb5bd" : "#212529",
											borderRadius: "12px",
											textAlign: "left",
											transition: "all 0.2s",
											opacity: isGeneratingPdf ? 0.6 : 1
										}}
										onMouseEnter={(e) => { if (!isGeneratingPdf) e.currentTarget.style.background = "#eef2ff"; }}
										onMouseLeave={(e) => { if (!isGeneratingPdf) e.currentTarget.style.background = "none"; }}
									>
										<span style={{
											width: 36,
											height: 36,
											borderRadius: "10px",
											backgroundColor: "#e8f0fe",
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											flexShrink: 0
										}}>
											<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1a73e8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
												<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
												<polyline points="14 2 14 8 20 8"/>
												<line x1="16" y1="13" x2="8" y2="13"/>
												<line x1="16" y1="17" x2="8" y2="17"/>
												<polyline points="10 9 9 9 8 9"/>
											</svg>
										</span>
										<span style={{ flex: 1 }}>
											<div style={{ fontWeight: 600, fontSize: "14px", color: "#212529" }}>ProInviert</div>
											<div style={{ fontWeight: 400, fontSize: "11px", color: "#868e96", marginTop: "2px" }}>Generar PDF y enviar</div>
										</span>
										{isGeneratingPdf && (
											<span style={{ width: 16, height: 16, border: "2px solid #dee2e6", borderTopColor: "#1a73e8", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
										)}
									</button>

									<div style={{ height: "1px", background: "#f0f0f0", margin: "4px 8px" }} />

									<button
										onClick={() => { handleSendToProbudgets(); setDropdownOpen(false); }}
										disabled={isSendingToProbudgets}
										style={{
											width: "100%",
											padding: "12px 16px",
											border: "none",
											background: isSendingToProbudgets ? "#f8f9fa" : "none",
											cursor: isSendingToProbudgets ? "default" : "pointer",
											display: "flex",
											alignItems: "center",
											gap: "14px",
											fontSize: "14px",
											fontWeight: 600,
											color: isSendingToProbudgets ? "#adb5bd" : "#212529",
											borderRadius: "12px",
											textAlign: "left",
											transition: "all 0.2s",
											opacity: isSendingToProbudgets ? 0.6 : 1
										}}
										onMouseEnter={(e) => { if (!isSendingToProbudgets) e.currentTarget.style.background = "#f0fdf4"; }}
										onMouseLeave={(e) => { if (!isSendingToProbudgets) e.currentTarget.style.background = "none"; }}
									>
										<span style={{
											width: 36,
											height: 36,
											borderRadius: "10px",
											backgroundColor: "#e8fae9",
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											flexShrink: 0
										}}>
											<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
												<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
												<path d="M7 11V7a5 5 0 0 1 10 0v4"/>
											</svg>
										</span>
										<span style={{ flex: 1 }}>
											<div style={{ fontWeight: 600, fontSize: "14px", color: "#212529" }}>ProBudgets</div>
											<div style={{ fontWeight: 400, fontSize: "11px", color: "#868e96", marginTop: "2px" }}>Enviar a presupuestos</div>
										</span>
										{isSendingToProbudgets && (
											<span style={{ width: 16, height: 16, border: "2px solid #dee2e6", borderTopColor: "#16a34a", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
										)}
									</button>
								</div>
							)}
						</div>

						<Settings
							//state={state}
							projectData={state}
							school={school}
							handleSetClassrooms={handleSetClassrooms}
						/>

						<select
							id="select-export"
							style={{
								marginTop: "4px",
								height: "38px",
								padding: "0px 16px",
								backgroundColor: "#E4E6EF",
								border: "1px solid #ccc",
								borderRadius: "5px",
								fontWeight: "bold",
								cursor: "pointer",
							}}
							onChange={handleExportChange}
						>
							<option value="EXPORTAR">EXPORTAR</option>
							<option value="dxf">DXF (AUTOCAD)</option>
						</select>
					</div>

					{/* <li>
						<select
							id="select-view"
							style={{
								margin: "0.3rem 0.4rem",
								backgroundColor: "#E4E6EF",
							}}
							onChange={() => {
								dispatch(setRoof());
							}}
						>
							<option value="1">VISTA COMPLETA</option>
							<option value="2">VISTA MUROS</option>
						</select>
					</li> */}

					{/* <li>
						<Button id="save-obj">
							<DataObjectIcon htmlColor="#3699FF" />
						</Button>
					</li> */}

					{/* <li>
						<Button>
							<TextureIcon htmlColor="#3699FF" />
						</Button>
					</li> */}

					{/* <li>
						<Button onClick={() => dispatch(setClassroomsLights())}>
							<LightbulbOutlinedIcon htmlColor="#3699FF" />
						</Button>
					</li> */}

					{/* <li>
						<Button
							// onClick={() => dispatch(setRoof())}
							onClick={() => {
								handleViewState({ roof: !view.roof });
							}}
						>
							roof (temp)
						</Button>
					</li> */}

					{/* <li>
						<Button onClick={() => dispatch(setColorForLevel())}>
							level color (temp)
						</Button>
					</li> */}

					{/* <ButtonSave /> */}

					{/* <div style={{}}>
						<input id="color" type="color" name="color_wall" onChange={(evt) => {
							handleColorWall(evt.target.value);
						}} />
						<label htmlFor="color" style={{font: ".7rem "Fira Sans", sans-serif", color: "black"}}>(prototype)</label>
					</div> */}
				</ul>
			</nav>
		</Box>
	);
}

const Button = styled(MuiButton)({
	borderRadius: ".42rem",
	color: "#3F4254",
	padding: ".60rem 1rem",
	fontFamily: "inherit",
	textTransform: "none",
	border: "1px solid #E4E6EF",
	margin: ".3rem .4rem",
	boxShadow: "none",
	backgroundColor: "#E4E6EF",
	"&:hover": {
		backgroundColor: "#d8dbe8",
		// boxShadow: "none"
	},
});

function debounce(func, timeout = 300) {
	let timer;
	return (...args) => {
		clearTimeout(timer);
		timer = setTimeout(() => {
			func.apply(this, args);
		}, timeout);
	};
}


