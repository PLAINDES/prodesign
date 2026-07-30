// React and Hooks
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

// Third-party Libraries
import Backdrop from '@mui/material/Backdrop';
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader';

// Local Application Imports
import Header from "./components/Header";
import Sidebar from "./components/Sidebar/Sidebar";
import { RenderProvider, useRender } from './RenderContext';

function ThreeDViewer({ onLoad, projectId }) {
    const mountRef = useRef(null);

    useEffect(() => {
        const currentMount = mountRef.current;
        if (!currentMount) return;

        // Scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0F172A); // Match the background color from parent div

        // Camera
        const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
        camera.position.set(10, 10, 10);

        // Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        currentMount.appendChild(renderer.domElement);

        // Controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 2.5);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
        directionalLight.position.set(5, 10, 7.5);
        scene.add(directionalLight);

        // GLTF Loader
        const loader = new GLTFLoader();

        const isDev = import.meta.env.VITE_DEV === 'true';
        const basePath = isDev
            ? 'https://plaindes.s3.us-east-2.amazonaws.com/prodesign/test'
            : 'https://plaindes.s3.us-east-2.amazonaws.com/prodesign/prod';
        const modelUrl = `${basePath}/plane_${projectId - 1}.glb`;

        loader.load(modelUrl, (gltf) => {
            const box = new THREE.Box3().setFromObject(gltf.scene);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            
            // Center the model
            gltf.scene.position.sub(center);
            scene.add(gltf.scene);

            // Adjust camera to fit model
            const maxDim = Math.max(size.x, size.y, size.z);
            const fov = camera.fov * (Math.PI / 180);
            let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
            cameraZ *= 1.5; // zoom out a bit
            
            camera.position.set(cameraZ, cameraZ, cameraZ);
            controls.target.set(0, 0, 0); // look at origin, since model is centered
            controls.update();

            if (onLoad) {
                onLoad();
            }
        }, undefined, (error) => {
            console.error('An error happened while loading the model:', error);
        });

        // Handle resize
        const handleResize = () => {
            if (mountRef.current) {
                const width = mountRef.current.clientWidth;
                const height = mountRef.current.clientHeight;
                camera.aspect = width / height;
                camera.updateProjectionMatrix();
                renderer.setSize(width, height);
            }
        };
        window.addEventListener('resize', handleResize);

        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            if (currentMount && renderer.domElement) {
                currentMount.removeChild(renderer.domElement);
            }
            // Dispose Three.js objects to free memory
            scene.traverse(object => {
                if (object.isMesh) {
                    if (object.geometry) object.geometry.dispose();
                    if (object.material) {
                        if (Array.isArray(object.material)) {
                            object.material.forEach(material => material.dispose());
                        } else {
                            object.material.dispose();
                        }
                    }
                }
            });
            renderer.dispose();
        };
    }, [onLoad, projectId]);

    return <div ref={mountRef} style={{ width: '100%', height: '100%', overflow: 'hidden' }} />;
}

// --- SEPARACIÓN DEL COMPONENTE PARA ARREGLAR EL ERROR DEL CONTEXT ---
function PlanContent() {
	const [state, setState] = useState();
	const [mobileOpen, setMobileOpen] = useState(false);
	const [view, setViewState] = useState({ view: "2D", roof: true });
	const params = useParams();
	const { dataProject, loading, setLoading, error, setError, retryJob, renderSeleccionado, jobStatus } = useRender();
	
	// [DOCUMENTACIÓN] Se agregó la variable de estado 'progress' y un efecto 'useEffect' para simular y mostrar de forma dinámica
	// el porcentaje de progreso (grado de generación) de los planos 2D y modelos 3D del proyecto.
	const [progress, setProgress] = useState(0);

	useEffect(() => {
		let interval;
		if (jobStatus === "generating") {
			setProgress(0);
			interval = setInterval(() => {
				setProgress((prev) => {
					if (prev < 30) {
						return Math.min(prev + Math.floor(Math.random() * 3) + 3, 30);
					} else if (prev < 60) {
						return Math.min(prev + Math.floor(Math.random() * 2) + 1, 60);
					} else if (prev < 85) {
						return Math.min(prev + (Math.random() > 0.3 ? 1 : 0), 85);
					} else if (prev < 95) {
						return Math.min(prev + (Math.random() > 0.7 ? 1 : 0), 95);
					} else if (prev < 98) {
						return Math.min(prev + (Math.random() > 0.9 ? 1 : 0), 98);
					} else {
						return prev;
					}
				});
			}, 1000);
		} else if (loading && (jobStatus === "finished" || dataProject?.status_job === "finished")) {
			// [DOCUMENTACIÓN] Para la pantalla de carga "Cargando vista...", simulamos el tramo final del 98% al 99% hasta que cargue completamente el iframe.
			setProgress(98);
			interval = setInterval(() => {
				setProgress((prev) => {
					if (prev < 99) return prev + 1;
					return prev;
				});
			}, 1000);
		} else if (!loading) {
			setProgress(100);
		} else {
			setProgress(0);
		}

		return () => {
			if (interval) clearInterval(interval);
		};
	}, [jobStatus, loading, dataProject?.status_job]);

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
						backgroundColor: "rgba(0, 0, 0, 0.2)",
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
					}}
					open={!!loading && !error}
				>
					{/* [DOCUMENTACIÓN - TAREA 2]: Overlay de Carga Contextual
					    Se evalúa el estado del trabajo (jobStatus) y el tipo de render 
					    para proveer una retroalimentación más amigable al usuario. */}
					{/* [DOCUMENTACIÓN] Se unificó la interfaz de carga (Backdrop) para que en todas las pantallas (2D, 3D y render IA), así como en el estado "Cargando vista...", el porcentaje de progreso se dibuje de forma centralizada y alineada dentro del propio spinner circular (CircularProgress). Se removió la barra de progreso inferior duplicada para lograr un diseño minimalista y limpio acorde al feedback. */}
					<div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px", textAlign: "center" }}>
						<Box sx={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
							<CircularProgress color="inherit" size={80} thickness={4} />
							<div style={{
								position: "absolute",
								color: "#38bdf8",
								fontWeight: "700",
								fontSize: "1.2rem",
								fontFamily: "sans-serif"
							}}>
								{progress}%
							</div>
						</Box>
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

				{/* --- VENTANA EMERGENTE DE ERROR (DIALOG MODAL) --- */}
				{/* [DOCUMENTACIÓN] Se reemplazó la interfaz de error de pantalla principal por un Dialog emergente (modal) con un botón de cerrar y opción de reintento, de acuerdo a la solicitud del usuario para no bloquear la pantalla principal. */}
				<Dialog
					open={!!error}
					onClose={() => setError(null)}
					PaperProps={{
						sx: {
							backgroundColor: "#1E293B",
							color: "#F8FAFC",
							borderRadius: "16px",
							padding: "16px",
							maxWidth: "500px",
							width: "100%"
						}
					}}
				>
					<DialogTitle sx={{ display: "flex", alignItems: "center", gap: "10px", fontWeight: "bold", color: "#F43F5E", pb: 1 }}>
						<span style={{ fontSize: "24px" }}>⚠️</span> Advertencia de Generación
					</DialogTitle>
					<DialogContent>
						<DialogContentText sx={{ color: "#CBD5E1", fontSize: "16px", lineHeight: "1.6" }}>
							{error}
						</DialogContentText>
					</DialogContent>
					<DialogActions sx={{ justifyContent: "flex-end", gap: "12px", padding: "16px 24px" }}>
						<Button 
							onClick={() => setError(null)}
							sx={{ 
								color: "#94A3B8", 
								textTransform: "none", 
								fontWeight: "600",
								"&:hover": { backgroundColor: "rgba(255, 255, 255, 0.05)" }
							}}
						>
							Cerrar
						</Button>
						<Button 
							onClick={() => {
								setError(null);
								retryJob();
							}}
							variant="contained"
							sx={{ 
								backgroundColor: "#3B82F6", 
								color: "#FFFFFF",
								textTransform: "none", 
								fontWeight: "600",
								borderRadius: "8px",
								padding: "8px 16px",
								"&:hover": { backgroundColor: "#2563EB" }
							}}
						>
							🔄 Reintentar generación
						</Button>
					</DialogActions>
				</Dialog>

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
						{renderSeleccionado === 1 ? (
							<ThreeDViewer onLoad={handleLoad} projectId={params.id} />
						) : (
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
						)}
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