import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, Html } from "@react-three/drei";
import * as THREE from "three";

export default function NorthIndicator({
	position = [0, 0, 0],
	angle = 0,
	visible = true,
	size = 1,
	showLabel = true,
	interactive = true,
}) {
	const groupRef = useRef();
	const arrowRef = useRef();

	// Convertir ángulo a radianes
	const angleRad = THREE.MathUtils.degToRad(angle);

	// Animación sutil de la flecha
	useFrame((state) => {
		if (arrowRef.current && interactive) {
			arrowRef.current.position.y =
				Math.sin(state.clock.elapsedTime * 2) * 0.1;
		}
	});

	if (!visible) return null;

	return (
		<group ref={groupRef} position={position} rotation={[0, angleRad, 0]}>
			{/* Base circular de la brújula */}
			<mesh position={[0, 0, 0]}>
				<cylinderGeometry args={[size * 2, size * 2, 0.2]} />
				<meshLambertMaterial
					color="#f8f9fa"
					transparent
					opacity={0.8}
				/>
			</mesh>

			{/* Círculo exterior */}
			<mesh position={[0, 0.11, 0]}>
				<ringGeometry args={[size * 1.8, size * 2, 32]} />
				<meshBasicMaterial color="#333" side={THREE.DoubleSide} />
			</mesh>

			{/* Flecha principal (Norte) */}
			<group ref={arrowRef}>
				{/* Punta de la flecha */}
				<mesh position={[0, 1.5 * size, 0]}>
					<coneGeometry args={[0.3 * size, 1 * size, 8]} />
					<meshLambertMaterial color="#dc3545" />
				</mesh>

				{/* Cuerpo de la flecha */}
				<mesh position={[0, 0.5 * size, 0]}>
					<cylinderGeometry
						args={[0.1 * size, 0.1 * size, 1 * size]}
					/>
					<meshLambertMaterial color="#333" />
				</mesh>

				{/* Parte trasera (Sur) */}
				<mesh position={[0, -0.5 * size, 0]}>
					<coneGeometry args={[0.2 * size, 0.8 * size, 8]} />
					<meshLambertMaterial color="#6c757d" />
				</mesh>
			</group>

			{/* Marcas cardinales */}
			<CardinalMarks size={size} />

			{/* Etiqueta "N" */}
			{showLabel && (
				<Text
					position={[0, 3 * size, 0]}
					fontSize={size * 0.8}
					color="#dc3545"
					anchorX="center"
					anchorY="middle"
					font="/fonts/helvetiker_bold.typeface.json"
				>
					N
				</Text>
			)}

			{/* Información del ángulo */}
			{interactive && (
				<Html position={[0, -1 * size, 0]} center>
					<div className="bg-white/90 px-2 py-1 rounded shadow text-xs font-medium">
						{angle}°
					</div>
				</Html>
			)}

			{/* Rosa de los vientos decorativa */}
			<CompassRose size={size} />
		</group>
	);
}

// Componente para las marcas cardinales
function CardinalMarks({ size }) {
	const marks = [
		{ angle: 0, label: "N", color: "#dc3545" },
		{ angle: 90, label: "E", color: "#6c757d" },
		{ angle: 180, label: "S", color: "#6c757d" },
		{ angle: 270, label: "W", color: "#6c757d" },
	];

	return (
		<group>
			{marks.map((mark, index) => {
				const angleRad = THREE.MathUtils.degToRad(mark.angle);
				const x = Math.sin(angleRad) * size * 1.5;
				const z = Math.cos(angleRad) * size * 1.5;

				return (
					<group key={index}>
						{/* Marca */}
						<mesh position={[x, 0.15, z]}>
							<boxGeometry args={[0.1, 0.3, 0.1]} />
							<meshBasicMaterial color={mark.color} />
						</mesh>

						{/* Etiqueta */}
						<Text
							position={[x, 0.5, z]}
							fontSize={size * 0.3}
							color={mark.color}
							anchorX="center"
							anchorY="middle"
						>
							{mark.label}
						</Text>
					</group>
				);
			})}
		</group>
	);
}

// Rosa de los vientos decorativa
function CompassRose({ size }) {
	const spokes = 8;
	const spokeLength = size * 1.6;

	return (
		<group position={[0, 0.12, 0]}>
			{Array.from({ length: spokes }, (_, i) => {
				const angle = (i * 360) / spokes;
				const angleRad = THREE.MathUtils.degToRad(angle);
				const x = Math.sin(angleRad) * spokeLength;
				const z = Math.cos(angleRad) * spokeLength;

				// Líneas principales (N, E, S, W)
				const isMainDirection = i % 2 === 0;
				const thickness = isMainDirection ? 0.05 : 0.02;
				const length = isMainDirection
					? spokeLength
					: spokeLength * 0.7;

				return (
					<mesh
						key={i}
						position={[x * 0.5, 0, z * 0.5]}
						rotation={[0, angleRad, 0]}
					>
						<boxGeometry args={[thickness, 0.02, length]} />
						<meshBasicMaterial
							color={isMainDirection ? "#333" : "#666"}
							transparent
							opacity={0.6}
						/>
					</mesh>
				);
			})}
		</group>
	);
}

// Componente compacto para UI
export function MiniNorthIndicator({ angle = 0, size = 0.5 }) {
	const angleRad = THREE.MathUtils.degToRad(angle);

	return (
		<group rotation={[0, angleRad, 0]}>
			{/* Flecha simple */}
			<mesh>
				<coneGeometry args={[0.2 * size, 0.8 * size, 6]} />
				<meshBasicMaterial color="#dc3545" />
			</mesh>

			{/* Etiqueta N */}
			<Text
				position={[0, 1.2 * size, 0]}
				fontSize={size * 0.6}
				color="#dc3545"
				anchorX="center"
				anchorY="middle"
			>
				N
			</Text>
		</group>
	);
}

// Hook para control del norte magnético
export function useNorthIndicator(initialAngle = 0) {
	const [angle, setAngle] = React.useState(initialAngle);
	const [visible, setVisible] = React.useState(true);

	const rotateNorth = (newAngle) => {
		setAngle(newAngle % 360);
	};

	const toggleVisibility = () => {
		setVisible(!visible);
	};

	const resetNorth = () => {
		setAngle(0);
	};

	return {
		angle,
		visible,
		setAngle: rotateNorth,
		setVisible,
		toggleVisibility,
		resetNorth,
	};
}
