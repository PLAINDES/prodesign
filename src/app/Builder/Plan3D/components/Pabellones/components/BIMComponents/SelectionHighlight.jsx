import React, { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

export default function SelectionHighlight({
	element,
	position = [0, 0, 0],
	visible = true,
	color = "#00ff00",
	thickness = 3,
	animated = true,
}) {
	const groupRef = useRef();

	// No renderizar si no hay elemento seleccionado
	if (!element || !visible) return null;

	const dimensions = element.dimensiones || {
		ancho: 8,
		largo: 7.2,
		alto: 3.5,
	};

	return (
		<group ref={groupRef} position={position} name="SelectionHighlight">
			{/* Caja de selección principal */}
			<SelectionBox
				dimensions={dimensions}
				color={color}
				thickness={thickness}
				animated={animated}
			/>

			{/* Indicadores en las esquinas */}
			<CornerIndicators
				dimensions={dimensions}
				color={color}
				animated={animated}
			/>

			{/* Información flotante del elemento */}
			<SelectionInfo
				element={element}
				position={[0, dimensions.alto + 20, 0]}
			/>

			{/* Ejes de coordenadas del elemento */}
			<ElementAxes dimensions={dimensions} visible={true} />
		</group>
	);
}

// Caja de selección con múltiples wireframes (reemplaza Outline)
function SelectionBox({ dimensions, color, thickness, animated }) {
	const materialRef = useRef();
	const outerRef = useRef();
	const innerRef = useRef();

	// Animación de pulsado
	useFrame((state) => {
		if (animated) {
			// Pulsar la opacidad del material principal
			if (materialRef.current) {
				const intensity =
					Math.sin(state.clock.elapsedTime * 3) * 0.3 + 0.7;
				materialRef.current.opacity = intensity;
			}

			// Escalar los wireframes
			if (outerRef.current) {
				const scale =
					Math.sin(state.clock.elapsedTime * 2) * 0.02 + 1.05;
				outerRef.current.scale.setScalar(scale);
			}

			if (innerRef.current) {
				const scale =
					Math.sin(state.clock.elapsedTime * 2.5) * 0.01 + 1.02;
				innerRef.current.scale.setScalar(scale);
			}
		}
	});

	return (
		<group>
			{/* Caja base semi-transparente */}
			<mesh position={[0, dimensions.alto / 2, 0]}>
				<boxGeometry
					args={[dimensions.ancho, dimensions.alto, dimensions.largo]}
				/>
				<meshBasicMaterial
					ref={materialRef}
					color={color}
					transparent={true}
					opacity={0.1}
					wireframe={false}
				/>
			</mesh>

			{/* Wireframe exterior (grueso) */}
			<mesh ref={outerRef} position={[0, dimensions.alto / 2, 0]}>
				<boxGeometry
					args={[
						dimensions.ancho + thickness * 0.2,
						dimensions.alto + thickness * 0.2,
						dimensions.largo + thickness * 0.2,
					]}
				/>
				<meshBasicMaterial
					color={color}
					wireframe={true}
					transparent={true}
					opacity={0.8}
				/>
			</mesh>

			{/* Wireframe interior */}
			<mesh ref={innerRef} position={[0, dimensions.alto / 2, 0]}>
				<boxGeometry
					args={[dimensions.ancho, dimensions.alto, dimensions.largo]}
				/>
				<meshBasicMaterial
					color={color}
					wireframe={true}
					transparent={true}
					opacity={0.6}
				/>
			</mesh>

			{/* Wireframe muy exterior para efecto de "glow" */}
			<mesh position={[0, dimensions.alto / 2, 0]}>
				<boxGeometry
					args={[
						dimensions.ancho + thickness * 0.5,
						dimensions.alto + thickness * 0.5,
						dimensions.largo + thickness * 0.5,
					]}
				/>
				<meshBasicMaterial
					color={color}
					wireframe={true}
					transparent={true}
					opacity={0.3}
				/>
			</mesh>
		</group>
	);
}

// Indicadores en las esquinas (sin cambios)
function CornerIndicators({ dimensions, color, animated }) {
	const corners = [
		// Esquinas inferiores
		[-dimensions.ancho / 2, 0, -dimensions.largo / 2],
		[dimensions.ancho / 2, 0, -dimensions.largo / 2],
		[dimensions.ancho / 2, 0, dimensions.largo / 2],
		[-dimensions.ancho / 2, 0, dimensions.largo / 2],
		// Esquinas superiores
		[-dimensions.ancho / 2, dimensions.alto, -dimensions.largo / 2],
		[dimensions.ancho / 2, dimensions.alto, -dimensions.largo / 2],
		[dimensions.ancho / 2, dimensions.alto, dimensions.largo / 2],
		[-dimensions.ancho / 2, dimensions.alto, dimensions.largo / 2],
	];

	return (
		<group name="CornerIndicators">
			{corners.map((corner, index) => (
				<CornerMarker
					key={index}
					position={corner}
					color={color}
					animated={animated}
					delay={index * 0.1}
				/>
			))}
		</group>
	);
}

// Marcador individual de esquina (simplificado)
function CornerMarker({ position, color, animated, delay = 0 }) {
	const meshRef = useRef();

	useFrame((state) => {
		if (animated && meshRef.current) {
			const time = state.clock.elapsedTime + delay;
			const scale = Math.sin(time * 4) * 0.5 + 1.5;
			meshRef.current.scale.setScalar(scale);
		}
	});

	return (
		<mesh ref={meshRef} position={position}>
			<sphereGeometry args={[2, 8, 8]} />
			<meshBasicMaterial color={color} transparent={true} opacity={0.9} />
		</mesh>
	);
}

// Información del elemento seleccionado (sin cambios)
function SelectionInfo({ element, position }) {
	return (
		<Html position={position} center>
			<div className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg border-2 border-white">
				<div className="font-bold text-sm">{element.nombre}</div>
				<div className="text-xs opacity-90">
					{element.tipo} • {element.area?.toFixed(1)}m²
				</div>
				<div className="text-xs opacity-90">
					${element.costo?.toLocaleString()} {element.moneda}
				</div>
			</div>
		</Html>
	);
}

// Ejes de coordenadas del elemento (simplificados - sin líneas complejas)
function ElementAxes({ dimensions, visible }) {
	if (!visible) return null;

	return (
		<group name="ElementAxes">
			{/* Eje X (rojo) - como cilindro */}
			<mesh
				position={[dimensions.ancho / 4 + 5, 0, 0]}
				rotation={[0, 0, Math.PI / 2]}
			>
				<cylinderGeometry
					args={[0.5, 0.5, dimensions.ancho / 2 + 10]}
				/>
				<meshBasicMaterial color="#ff0000" />
			</mesh>

			{/* Eje Y (verde) - como cilindro */}
			<mesh position={[0, dimensions.alto / 2 + 5, 0]}>
				<cylinderGeometry args={[0.5, 0.5, dimensions.alto + 10]} />
				<meshBasicMaterial color="#00ff00" />
			</mesh>

			{/* Eje Z (azul) - como cilindro */}
			<mesh
				position={[0, 0, dimensions.largo / 4 + 5]}
				rotation={[Math.PI / 2, 0, 0]}
			>
				<cylinderGeometry
					args={[0.5, 0.5, dimensions.largo / 2 + 10]}
				/>
				<meshBasicMaterial color="#0000ff" />
			</mesh>

			{/* Etiquetas de ejes - Solo HTML */}
			<Html position={[dimensions.ancho / 2 + 15, 0, 0]}>
				<div className="text-red-500 font-bold text-lg bg-white/80 px-1 rounded">
					X
				</div>
			</Html>
			<Html position={[0, dimensions.alto + 15, 0]}>
				<div className="text-green-500 font-bold text-lg bg-white/80 px-1 rounded">
					Y
				</div>
			</Html>
			<Html position={[0, 0, dimensions.largo / 2 + 15]}>
				<div className="text-blue-500 font-bold text-lg bg-white/80 px-1 rounded">
					Z
				</div>
			</Html>
		</group>
	);
}

// Variante simple del highlight (sin fuentes)
export function SimpleSelectionHighlight({
	position,
	dimensions,
	color = "#00ff00",
}) {
	const meshRef = useRef();

	useFrame((state) => {
		if (meshRef.current) {
			// Animación sutil de escala
			const scale = Math.sin(state.clock.elapsedTime * 2) * 0.05 + 1.05;
			meshRef.current.scale.setScalar(scale);
		}
	});

	return (
		<group position={position}>
			{/* Wireframe principal */}
			<mesh ref={meshRef} position={[0, dimensions.alto / 2, 0]}>
				<boxGeometry
					args={[
						dimensions.ancho + 2,
						dimensions.alto + 2,
						dimensions.largo + 2,
					]}
				/>
				<meshBasicMaterial
					color={color}
					wireframe={true}
					transparent={true}
					opacity={0.8}
				/>
			</mesh>

			{/* Wireframe exterior para efecto de glow */}
			<mesh position={[0, dimensions.alto / 2, 0]}>
				<boxGeometry
					args={[
						dimensions.ancho + 4,
						dimensions.alto + 4,
						dimensions.largo + 4,
					]}
				/>
				<meshBasicMaterial
					color={color}
					wireframe={true}
					transparent={true}
					opacity={0.3}
				/>
			</mesh>
		</group>
	);
}

// Highlight para hover (sin fuentes)
export function HoverHighlight({ position, dimensions, color = "#ffff00" }) {
	const meshRef = useRef();
	const pulseRef = useRef();

	useFrame((state) => {
		if (meshRef.current) {
			const opacity = Math.sin(state.clock.elapsedTime * 5) * 0.2 + 0.5;
			meshRef.current.material.opacity = opacity;
		}

		if (pulseRef.current) {
			const scale = Math.sin(state.clock.elapsedTime * 4) * 0.1 + 1.1;
			pulseRef.current.scale.setScalar(scale);
		}
	});

	return (
		<group position={position}>
			{/* Highlight principal */}
			<mesh ref={meshRef} position={[0, dimensions.alto / 2, 0]}>
				<boxGeometry
					args={[
						dimensions.ancho + 1,
						dimensions.alto + 1,
						dimensions.largo + 1,
					]}
				/>
				<meshBasicMaterial
					color={color}
					transparent={true}
					opacity={0.5}
				/>
			</mesh>

			{/* Efecto de pulso exterior */}
			<mesh ref={pulseRef} position={[0, dimensions.alto / 2, 0]}>
				<boxGeometry
					args={[
						dimensions.ancho + 2,
						dimensions.alto + 2,
						dimensions.largo + 2,
					]}
				/>
				<meshBasicMaterial
					color={color}
					wireframe={true}
					transparent={true}
					opacity={0.6}
				/>
			</mesh>
		</group>
	);
}
