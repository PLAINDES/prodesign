import React, { useRef, useMemo } from "react";
import { Text, Html } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

export default function DimensionLines({
	floors = [],
	classroom = {},
	visible = true,
	style = "architectural", // 'architectural', 'engineering', 'minimal'
	units = "m",
	precision = 1,
	offset = 15, // Distancia de las cotas al objeto
}) {
	const { camera } = useThree();

	if (!visible || !floors || floors.length === 0) return null;

	return (
		<group name="DimensionLines">
			{floors.map((floor, floorIndex) => (
				<FloorDimensions
					key={floorIndex}
					floor={floor}
					floorIndex={floorIndex}
					classroom={classroom}
					style={style}
					units={units}
					precision={precision}
					offset={offset}
					camera={camera}
				/>
			))}
		</group>
	);
}

// Dimensiones para un piso completo
function FloorDimensions({
	floor,
	floorIndex,
	classroom,
	style,
	units,
	precision,
	offset,
	camera,
}) {
	return (
		<group name={`FloorDimensions_${floorIndex}`}>
			{/* Dimensiones de aulas */}
			{floor.classrooms?.map((aula, aulaIndex) => (
				<ElementDimensions
					key={`classroom_${aulaIndex}`}
					element={aula}
					elementType="classroom"
					style={style}
					units={units}
					precision={precision}
					offset={offset}
					camera={camera}
				/>
			))}

			{/* Dimensiones de baño */}
			{floor.bathroom && (
				<ElementDimensions
					element={floor.bathroom}
					elementType="bathroom"
					style={style}
					units={units}
					precision={precision}
					offset={offset}
					camera={camera}
				/>
			)}

			{/* Dimensiones de escaleras */}
			{floor.stairs && (
				<ElementDimensions
					element={floor.stairs}
					elementType="stairs"
					style={style}
					units={units}
					precision={precision}
					offset={offset}
					camera={camera}
				/>
			)}

			{/* Dimensiones generales del piso */}
			<FloorOverallDimensions
				floor={floor}
				floorIndex={floorIndex}
				style={style}
				units={units}
				precision={precision}
				offset={offset * 2}
			/>
		</group>
	);
}

// Dimensiones de un elemento individual
function ElementDimensions({
	element,
	elementType,
	style,
	units,
	precision,
	offset,
	camera,
}) {
	if (!element || !element.bim) return null;

	const { dimensiones, posicion } = element.bim;
	const pos = element.position || posicion || [0, 0, 0];

	return (
		<group position={pos} name={`ElementDimensions_${elementType}`}>
			{/* Cota horizontal (ancho) */}
			<HorizontalDimension
				width={dimensiones.ancho}
				length={dimensiones.largo}
				height={dimensiones.alto}
				position={[0, 0, -dimensiones.largo / 2 - offset]}
				style={style}
				units={units}
				precision={precision}
				label="ancho"
				camera={camera}
			/>

			{/* Cota vertical (largo) */}
			<VerticalDimension
				width={dimensiones.ancho}
				length={dimensiones.largo}
				height={dimensiones.alto}
				position={[-dimensiones.ancho / 2 - offset, 0, 0]}
				style={style}
				units={units}
				precision={precision}
				label="largo"
				camera={camera}
			/>

			{/* Cota de altura (solo si es relevante) */}
			{dimensiones.alto > 0 && (
				<HeightDimension
					width={dimensiones.ancho}
					length={dimensiones.largo}
					height={dimensiones.alto}
					position={[
						dimensiones.ancho / 2 + offset,
						0,
						dimensiones.largo / 2 + offset,
					]}
					style={style}
					units={units}
					precision={precision}
					camera={camera}
				/>
			)}
		</group>
	);
}

// Cota horizontal (ancho)
function HorizontalDimension({
	width,
	length,
	height,
	position,
	style,
	units,
	precision,
	label,
	camera,
}) {
	const lineColor = getStyleColor(style);
	const textSize = getStyleTextSize(style);

	return (
		<group position={position}>
			{/* Línea principal de cota */}
			<DimensionLine
				start={[-width / 2, 0, 0]}
				end={[width / 2, 0, 0]}
				color={lineColor}
				style={style}
			/>

			{/* Líneas de extensión */}
			<ExtensionLine
				start={[-width / 2, 0, 0]}
				end={[-width / 2, 0, -10]}
				color={lineColor}
			/>
			<ExtensionLine
				start={[width / 2, 0, 0]}
				end={[width / 2, 0, -10]}
				color={lineColor}
			/>

			{/* Texto de la dimensión */}
			<DimensionText
				value={width}
				units={units}
				precision={precision}
				position={[0, 5, 0]}
				size={textSize}
				color={lineColor}
				camera={camera}
			/>

			{/* Flechas en los extremos */}
			<DimensionArrow
				position={[-width / 2, 0, 0]}
				direction={[1, 0, 0]}
				color={lineColor}
				style={style}
			/>
			<DimensionArrow
				position={[width / 2, 0, 0]}
				direction={[-1, 0, 0]}
				color={lineColor}
				style={style}
			/>
		</group>
	);
}

// Cota vertical (largo)
function VerticalDimension({
	width,
	length,
	height,
	position,
	style,
	units,
	precision,
	camera,
}) {
	const lineColor = getStyleColor(style);
	const textSize = getStyleTextSize(style);

	return (
		<group position={position}>
			{/* Línea principal */}
			<DimensionLine
				start={[0, 0, -length / 2]}
				end={[0, 0, length / 2]}
				color={lineColor}
				style={style}
			/>

			{/* Líneas de extensión */}
			<ExtensionLine
				start={[0, 0, -length / 2]}
				end={[-10, 0, -length / 2]}
				color={lineColor}
			/>
			<ExtensionLine
				start={[0, 0, length / 2]}
				end={[-10, 0, length / 2]}
				color={lineColor}
			/>

			{/* Texto */}
			<DimensionText
				value={length}
				units={units}
				precision={precision}
				position={[-5, 5, 0]}
				size={textSize}
				color={lineColor}
				rotation={[0, Math.PI / 2, 0]}
				camera={camera}
			/>

			{/* Flechas */}
			<DimensionArrow
				position={[0, 0, -length / 2]}
				direction={[0, 0, 1]}
				color={lineColor}
				style={style}
			/>
			<DimensionArrow
				position={[0, 0, length / 2]}
				direction={[0, 0, -1]}
				color={lineColor}
				style={style}
			/>
		</group>
	);
}

// Cota de altura
function HeightDimension({
	width,
	length,
	height,
	position,
	style,
	units,
	precision,
	camera,
}) {
	const lineColor = getStyleColor(style);
	const textSize = getStyleTextSize(style);

	return (
		<group position={position}>
			{/* Línea vertical */}
			<DimensionLine
				start={[0, 0, 0]}
				end={[0, height, 0]}
				color={lineColor}
				style={style}
			/>

			{/* Líneas de extensión */}
			<ExtensionLine
				start={[0, 0, 0]}
				end={[10, 0, 0]}
				color={lineColor}
			/>
			<ExtensionLine
				start={[0, height, 0]}
				end={[10, height, 0]}
				color={lineColor}
			/>

			{/* Texto */}
			<DimensionText
				value={height}
				units={units}
				precision={precision}
				position={[15, height / 2, 0]}
				size={textSize}
				color={lineColor}
				camera={camera}
			/>

			{/* Flechas */}
			<DimensionArrow
				position={[0, 0, 0]}
				direction={[0, 1, 0]}
				color={lineColor}
				style={style}
			/>
			<DimensionArrow
				position={[0, height, 0]}
				direction={[0, -1, 0]}
				color={lineColor}
				style={style}
			/>
		</group>
	);
}

// Línea de dimensión básica
function DimensionLine({ start, end, color, style }) {
	const points = [new THREE.Vector3(...start), new THREE.Vector3(...end)];
	const lineWidth = getStyleLineWidth(style);

	return (
		<line>
			<bufferGeometry>
				<bufferAttribute
					attach="attributes-position"
					count={points.length}
					array={
						new Float32Array(points.flatMap((p) => [p.x, p.y, p.z]))
					}
					itemSize={3}
				/>
			</bufferGeometry>
			<lineBasicMaterial
				color={color}
				linewidth={lineWidth}
				transparent={true}
				opacity={0.8}
			/>
		</line>
	);
}

// Línea de extensión
function ExtensionLine({ start, end, color }) {
	const points = [new THREE.Vector3(...start), new THREE.Vector3(...end)];

	return (
		<line>
			<bufferGeometry>
				<bufferAttribute
					attach="attributes-position"
					count={points.length}
					array={
						new Float32Array(points.flatMap((p) => [p.x, p.y, p.z]))
					}
					itemSize={3}
				/>
			</bufferGeometry>
			<lineBasicMaterial
				color={color}
				linewidth={1}
				transparent={true}
				opacity={0.6}
			/>
		</line>
	);
}

// Texto de dimensión
function DimensionText({
	value,
	units,
	precision,
	position,
	size,
	color,
	rotation = [0, 0, 0],
	camera,
}) {
	const displayValue = `${value.toFixed(precision)}${units}`;

	return (
		<Text
			position={position}
			rotation={rotation}
			fontSize={size}
			color={color}
			anchorX="center"
			anchorY="middle"
			font="/fonts/helvetiker_regular.typeface.json"
		>
			{displayValue}
		</Text>
	);
}

// Flecha de dimensión
function DimensionArrow({ position, direction, color, style }) {
	const arrowSize = getStyleArrowSize(style);

	return (
		<mesh position={position}>
			<coneGeometry args={[arrowSize * 0.5, arrowSize, 8]} />
			<meshBasicMaterial color={color} />
		</mesh>
	);
}

// Dimensiones generales del piso
function FloorOverallDimensions({
	floor,
	floorIndex,
	style,
	units,
	precision,
	offset,
}) {
	// Calcular dimensiones totales del piso
	const totalWidth = calculateFloorWidth(floor);
	const totalLength = calculateFloorLength(floor);

	return (
		<group name={`FloorOverall_${floorIndex}`}>
			{/* Cota total horizontal */}
			<OverallHorizontalDimension
				width={totalWidth}
				position={[0, 0, -offset]}
				style={style}
				units={units}
				precision={precision}
			/>

			{/* Cota total vertical */}
			<OverallVerticalDimension
				length={totalLength}
				position={[-offset, 0, 0]}
				style={style}
				units={units}
				precision={precision}
			/>
		</group>
	);
}

// Cota horizontal general
function OverallHorizontalDimension({
	width,
	position,
	style,
	units,
	precision,
}) {
	const lineColor = getStyleColor(style, "overall");
	const textSize = getStyleTextSize(style) * 1.2;

	return (
		<group position={position}>
			<DimensionLine
				start={[-width / 2, 0, 0]}
				end={[width / 2, 0, 0]}
				color={lineColor}
				style={style}
			/>
			<DimensionText
				value={width}
				units={units}
				precision={precision}
				position={[0, 8, 0]}
				size={textSize}
				color={lineColor}
			/>
		</group>
	);
}

// Cota vertical general
function OverallVerticalDimension({
	length,
	position,
	style,
	units,
	precision,
}) {
	const lineColor = getStyleColor(style, "overall");
	const textSize = getStyleTextSize(style) * 1.2;

	return (
		<group position={position}>
			<DimensionLine
				start={[0, 0, -length / 2]}
				end={[0, 0, length / 2]}
				color={lineColor}
				style={style}
			/>
			<DimensionText
				value={length}
				units={units}
				precision={precision}
				position={[-8, 8, 0]}
				size={textSize}
				color={lineColor}
				rotation={[0, Math.PI / 2, 0]}
			/>
		</group>
	);
}

// Funciones de utilidad para estilos
function getStyleColor(style, type = "normal") {
	const colors = {
		architectural: type === "overall" ? "#2c3e50" : "#34495e",
		engineering: type === "overall" ? "#e74c3c" : "#c0392b",
		minimal: type === "overall" ? "#333333" : "#666666",
	};
	return colors[style] || colors.architectural;
}

function getStyleTextSize(style) {
	const sizes = {
		architectural: 8,
		engineering: 10,
		minimal: 6,
	};
	return sizes[style] || sizes.architectural;
}

function getStyleLineWidth(style) {
	const widths = {
		architectural: 2,
		engineering: 3,
		minimal: 1,
	};
	return widths[style] || widths.architectural;
}

function getStyleArrowSize(style) {
	const sizes = {
		architectural: 3,
		engineering: 4,
		minimal: 2,
	};
	return sizes[style] || sizes.architectural;
}

// Funciones de cálculo
function calculateFloorWidth(floor) {
	// Implementar cálculo del ancho total del piso
	const numClassrooms = floor.classrooms?.length || 0;
	return numClassrooms * 8 + (numClassrooms - 1) * 1; // Ejemplo
}

function calculateFloorLength(floor) {
	// Implementar cálculo del largo total del piso
	return 7.2; // Ejemplo
}

// Componente simplificado para casos básicos
export function SimpleDimensionLines({ element, visible = true }) {
	if (!visible || !element?.bim?.dimensiones) return null;

	const { dimensiones, posicion } = element.bim;
	const pos = element.position || posicion || [0, 0, 0];

	return (
		<group position={pos}>
			<Text
				position={[
					0,
					dimensiones.alto + 5,
					-dimensiones.largo / 2 - 10,
				]}
				fontSize={6}
				color="#333"
				anchorX="center"
			>
				{dimensiones.ancho}m
			</Text>
			<Text
				position={[
					-dimensiones.ancho / 2 - 10,
					dimensiones.alto + 5,
					0,
				]}
				fontSize={6}
				color="#333"
				anchorX="center"
				rotation={[0, Math.PI / 2, 0]}
			>
				{dimensiones.largo}m
			</Text>
		</group>
	);
}
