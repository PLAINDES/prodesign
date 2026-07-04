// components/ViewControls.jsx
import { Html } from "@react-three/drei";
import { useThree, useFrame } from "@react-three/fiber";
import { useState, useRef } from "react";
import * as THREE from "three";

const ViewControls = ({ terrain }) => {
	const { camera, controls } = useThree();
	const [activeView, setActiveView] = useState("isometrica");
	const [isAnimating, setIsAnimating] = useState(false);
	const animationRef = useRef({
		startPosition: new THREE.Vector3(),
		startTarget: new THREE.Vector3(),
		endPosition: new THREE.Vector3(),
		endTarget: new THREE.Vector3(),
		progress: 0,
		duration: 1.5, // duración en segundos
	});

	const views = {
		frontal: {
			position: [0, terrain.length / 4, terrain.length * 0.8],
			target: [0, 0, 0],
			name: "🏠 Frontal",
		},
		trasera: {
			position: [0, terrain.length / 4, -terrain.length * 0.8],
			target: [0, 0, 0],
			name: "🔄 Trasera",
		},
		lateral: {
			position: [terrain.length * 0.8, terrain.length / 4, 0],
			target: [0, 0, 0],
			name: "↔️ Lateral",
		},
		isometrica: {
			position: [terrain.length, terrain.length / 2 - 500, 0],
			target: [0, 0, 0],
			name: "📐 Isométrica",
		},
		superior: {
			position: [0, terrain.length * 1.5, 0],
			target: [0, 0, 0],
			name: "⬆️ Superior",
		},
		pabellones: {
			position: [terrain.length / 2, 300, terrain.length / 2],
			target: [0, 0, 0],
			name: "🏫 Pabellones",
		},
		canchas: {
			position: [-200, 200, 400],
			target: [-200, 0, 200],
			name: "⚽ Canchas",
		},
		general: {
			position: [
				terrain.length * 1.2,
				terrain.length * 0.8,
				terrain.length * 1.2,
			],
			target: [0, 0, 0],
			name: "🌍 General",
		},
	};

	// Animación frame por frame
	useFrame((state, delta) => {
		if (!isAnimating) return;

		const anim = animationRef.current;
		anim.progress += delta / anim.duration;

		if (anim.progress >= 1) {
			// Terminar animación
			camera.position.copy(anim.endPosition);
			if (controls) {
				controls.target.copy(anim.endTarget);
				controls.update();
			}
			setIsAnimating(false);
			anim.progress = 0;
		} else {
			// Interpolar suavemente
			const easedProgress = easeInOutCubic(anim.progress);

			camera.position.lerpVectors(
				anim.startPosition,
				anim.endPosition,
				easedProgress
			);

			if (controls) {
				controls.target.lerpVectors(
					anim.startTarget,
					anim.endTarget,
					easedProgress
				);
				controls.update();
			}
		}
	});

	// Función de easing para animación suave
	const easeInOutCubic = (t) => {
		return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
	};

	const handleViewChange = (viewKey) => {
		if (isAnimating) return; // Evitar múltiples animaciones

		const view = views[viewKey];
		setActiveView(viewKey);

		if (!controls) {
			console.warn("OrbitControls no disponible");
			return;
		}

		// Configurar animación
		const anim = animationRef.current;
		anim.startPosition.copy(camera.position);
		anim.startTarget.copy(controls.target);
		anim.endPosition.set(...view.position);
		anim.endTarget.set(...view.target);
		anim.progress = 0;

		setIsAnimating(true);

		console.log(`Cambiando a vista: ${view.name}`, {
			from: camera.position.toArray(),
			to: view.position,
			target: view.target,
		});
	};

	return (
		<Html transform={false} style={{ pointerEvents: "none" }}>
			<div
				style={{
					position: "fixed",
					top: "20px",
					right: "20px",
					display: "flex",
					flexDirection: "column",
					gap: "8px",
					pointerEvents: "auto",
					zIndex: 1000,
				}}
			>
				{Object.entries(views).map(([key, view]) => (
					<button
						key={key}
						onClick={() => handleViewChange(key)}
						disabled={isAnimating}
						style={{
							background:
								activeView === key
									? "linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)"
									: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
							border: "none",
							color: "white",
							padding: "10px 14px",
							borderRadius: "10px",
							cursor: isAnimating ? "not-allowed" : "pointer",
							fontSize: "11px",
							fontWeight: "bold",
							textTransform: "uppercase",
							letterSpacing: "0.5px",
							transition: "all 0.3s ease",
							backdropFilter: "blur(10px)",
							//border: "1px solid rgba(255,255,255,0.2)",
							boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
							minWidth: "120px",
							textAlign: "center",
							opacity: isAnimating ? 0.7 : 1,
						}}
						onMouseEnter={(e) => {
							if (activeView !== key && !isAnimating) {
								e.target.style.transform = "translateY(-2px)";
								e.target.style.boxShadow =
									"0 6px 20px rgba(0,0,0,0.3)";
							}
						}}
						onMouseLeave={(e) => {
							e.target.style.transform = "translateY(0)";
							e.target.style.boxShadow =
								"0 4px 16px rgba(0,0,0,0.2)";
						}}
					>
						{view.name}
					</button>
				))}
			</div>
		</Html>
	);
};

export default ViewControls;
