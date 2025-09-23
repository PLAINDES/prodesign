import React, { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

// Verificar si Outline está disponible (fallback si no funciona)
let Outline;
try {
	const drei = require("@react-three/drei");
	Outline = drei.Outline;
} catch (error) {
	Outline = null;
}

// Componente principal BIMFloor
export default function BIMFloor({
	classrooms,
	bathroom,
	stairs,
	floor,
	view,
	haveCorridor,
	havePeine,
	_classroom,
	_bathroom,
	_stairs,
	pab,
	length,
	// Props BIM
	bimData,
	selectedElement,
	onElementSelect,
	editMode = false,
	showDimensions = true,
	showCosts = false,
}) {
	const groupRef = useRef();
	const [hoveredElement, setHoveredElement] = useState(null);

	return (
		<group ref={groupRef} name={`BIMFloor_${floor}`}>
			{/* Aulas con interactividad BIM */}
			{classrooms &&
				classrooms.map((classroom, index) => (
					<BIMClassroom
						key={`classroom_${floor}_${index}`}
						classroom={classroom}
						isSelected={selectedElement?.id === classroom.bim?.id}
						isHovered={hoveredElement?.id === classroom.bim?.id}
						onSelect={onElementSelect}
						editMode={editMode}
						showDimensions={showDimensions}
						showCosts={showCosts}
						onHover={setHoveredElement}
					/>
				))}

			{/* Baño con BIM */}
			{bathroom && (
				<BIMBathroom
					bathroom={bathroom}
					isSelected={selectedElement?.id === bathroom.bim?.id}
					isHovered={hoveredElement?.id === bathroom.bim?.id}
					onSelect={onElementSelect}
					editMode={editMode}
					showDimensions={showDimensions}
					showCosts={showCosts}
					onHover={setHoveredElement}
				/>
			)}

			{/* Escaleras con BIM */}
			{stairs && (
				<BIMStairs
					stairs={stairs}
					isSelected={selectedElement?.id === stairs.bim?.id}
					isHovered={hoveredElement?.id === stairs.bim?.id}
					onSelect={onElementSelect}
					editMode={editMode}
					showDimensions={showDimensions}
					showCosts={showCosts}
					onHover={setHoveredElement}
				/>
			)}

			{/* Información del piso */}
			{showCosts && bimData && (
				<FloorCostInfo
					position={[0, 200, 0]}
					bimData={bimData}
					floor={floor}
				/>
			)}
		</group>
	);
}

// Componente para aula interactiva
function BIMClassroom({
	classroom,
	isSelected,
	isHovered,
	onSelect,
	editMode,
	showDimensions,
	showCosts,
	onHover,
}) {
	const meshRef = useRef();
	const outlineRef = useRef();

	const handleClick = (event) => {
		if (editMode && onSelect && classroom.bim) {
			event.stopPropagation();
			onSelect(classroom.bim);
		}
	};

	const handlePointerOver = (event) => {
		if (editMode) {
			event.stopPropagation();
			onHover(classroom.bim);
			document.body.style.cursor = "pointer";
		}
	};

	const handlePointerOut = (event) => {
		if (editMode) {
			event.stopPropagation();
			onHover(null);
			document.body.style.cursor = "default";
		}
	};

	// Color del material basado en estado
	const getMaterialColor = () => {
		if (isSelected) return "#00ff00";
		if (isHovered) return "#ffff00";

		const tipo = classroom.bim?.tipo || "aula";
		const colorMap = {
			aula: "#87CEEB",
			laboratorio: "#FF6B6B",
			biblioteca: "#4ECDC4",
			taller: "#45B7D1",
			almacen: "#96CEB4",
			bano: "#FECA57",
		};
		return colorMap[tipo] || "#87CEEB";
	};

	// Animación de selección/hover
	useFrame(() => {
		if (outlineRef.current) {
			if (isSelected) {
				outlineRef.current.scale.setScalar(
					Math.sin(Date.now() * 0.005) * 0.02 + 1.02
				);
			} else if (isHovered) {
				outlineRef.current.scale.setScalar(1.01);
			} else {
				outlineRef.current.scale.setScalar(1);
			}
		}
	});

	const dimensions = classroom.bim?.dimensiones || {
		ancho: 8,
		alto: 3.5,
		largo: 7.2,
	};

	return (
		<group position={classroom.position}>
			{/* Elemento principal clickeable */}
			<mesh
				ref={meshRef}
				onClick={handleClick}
				onPointerOver={handlePointerOver}
				onPointerOut={handlePointerOut}
				position={[0, dimensions.alto / 2, 0]}
			>
				<boxGeometry
					args={[dimensions.ancho, dimensions.alto, dimensions.largo]}
				/>
				<meshLambertMaterial
					color={getMaterialColor()}
					transparent={true}
					opacity={isSelected ? 0.8 : 0.6}
				/>
			</mesh>

			{/* Outline (con fallback manual si Outline no está disponible) */}
			{(isSelected || isHovered) &&
				(Outline ? (
					<Outline
						selection={[meshRef]}
						selectionLayer={10}
						color={isSelected ? "#00ff00" : "#ffff00"}
						screenspace={false}
						thickness={isSelected ? 4 : 2}
						transparent={true}
						opacity={0.8}
					/>
				) : (
					<ManualOutline
						ref={outlineRef}
						dimensions={dimensions}
						color={isSelected ? "#00ff00" : "#ffff00"}
						thickness={isSelected ? 3 : 2}
					/>
				))}

			{/* Etiqueta con información BIM */}
			{(isSelected || isHovered) && classroom.bim && (
				<BIMLabel
					position={[0, dimensions.alto + 20, 0]}
					bimData={classroom.bim}
					showCosts={showCosts}
				/>
			)}

			{/* Dimensiones básicas */}
			{showDimensions && classroom.bim && isSelected && (
				<SimpleDimensionLabels dimensions={dimensions} />
			)}

			{/* Icono de costo */}
			{showCosts && classroom.bim && (
				<CostIcon
					position={[0, dimensions.alto + 10, 0]}
					cost={classroom.bim.costo}
					area={classroom.bim.area}
				/>
			)}
		</group>
	);
}

// Componente para baño interactivo
function BIMBathroom({
	bathroom,
	isSelected,
	isHovered,
	onSelect,
	editMode,
	showDimensions,
	showCosts,
	onHover,
}) {
	const meshRef = useRef();

	const handleClick = (event) => {
		if (editMode && onSelect && bathroom.bim) {
			event.stopPropagation();
			onSelect(bathroom.bim);
		}
	};

	const handlePointerOver = (event) => {
		if (editMode) {
			event.stopPropagation();
			onHover(bathroom.bim);
			document.body.style.cursor = "pointer";
		}
	};

	const handlePointerOut = (event) => {
		if (editMode) {
			event.stopPropagation();
			onHover(null);
			document.body.style.cursor = "default";
		}
	};

	const dimensions = bathroom.bim?.dimensiones || {
		ancho: 4,
		alto: 3.5,
		largo: 3,
	};

	return (
		<group position={bathroom.position}>
			<mesh
				ref={meshRef}
				onClick={handleClick}
				onPointerOver={handlePointerOver}
				onPointerOut={handlePointerOut}
				position={[0, dimensions.alto / 2, 0]}
			>
				<boxGeometry
					args={[dimensions.ancho, dimensions.alto, dimensions.largo]}
				/>
				<meshLambertMaterial
					color={
						isSelected
							? "#00ff00"
							: isHovered
							? "#ffff00"
							: "#FECA57"
					}
					transparent={true}
					opacity={isSelected ? 0.8 : 0.6}
				/>
			</mesh>

			{(isSelected || isHovered) &&
				(Outline ? (
					<Outline
						selection={[meshRef]}
						selectionLayer={10}
						color={isSelected ? "#00ff00" : "#ffff00"}
						thickness={isSelected ? 4 : 2}
					/>
				) : (
					<SimpleWireframe
						dimensions={dimensions}
						color={isSelected ? "#00ff00" : "#ffff00"}
					/>
				))}

			{(isSelected || isHovered) && bathroom.bim && (
				<BIMLabel
					position={[0, dimensions.alto + 20, 0]}
					bimData={bathroom.bim}
					showCosts={showCosts}
				/>
			)}
		</group>
	);
}

// Componente para escaleras interactivas
function BIMStairs({
	stairs,
	isSelected,
	isHovered,
	onSelect,
	editMode,
	showDimensions,
	showCosts,
	onHover,
}) {
	const meshRef = useRef();

	const handleClick = (event) => {
		if (editMode && onSelect && stairs.bim) {
			event.stopPropagation();
			onSelect(stairs.bim);
		}
	};

	const handlePointerOver = (event) => {
		if (editMode) {
			event.stopPropagation();
			onHover(stairs.bim);
			document.body.style.cursor = "pointer";
		}
	};

	const handlePointerOut = (event) => {
		if (editMode) {
			event.stopPropagation();
			onHover(null);
			document.body.style.cursor = "default";
		}
	};

	const dimensions = stairs.bim?.dimensiones || {
		ancho: 3,
		alto: 3.5,
		largo: 4,
	};

	return (
		<group position={stairs.position}>
			<mesh
				ref={meshRef}
				onClick={handleClick}
				onPointerOver={handlePointerOver}
				onPointerOut={handlePointerOut}
				position={[0, dimensions.alto / 2, 0]}
			>
				<boxGeometry
					args={[dimensions.ancho, dimensions.alto, dimensions.largo]}
				/>
				<meshLambertMaterial
					color={
						isSelected
							? "#00ff00"
							: isHovered
							? "#ffff00"
							: "#8B4513"
					}
					transparent={true}
					opacity={isSelected ? 0.8 : 0.6}
				/>
			</mesh>

			{(isSelected || isHovered) &&
				(Outline ? (
					<Outline
						selection={[meshRef]}
						selectionLayer={10}
						color={isSelected ? "#00ff00" : "#ffff00"}
						thickness={isSelected ? 4 : 2}
					/>
				) : (
					<SimpleWireframe
						dimensions={dimensions}
						color={isSelected ? "#00ff00" : "#ffff00"}
					/>
				))}

			{(isSelected || isHovered) && stairs.bim && (
				<BIMLabel
					position={[0, dimensions.alto + 20, 0]}
					bimData={stairs.bim}
					showCosts={showCosts}
				/>
			)}
		</group>
	);
}

// Outline manual (fallback si Outline no está disponible)
const ManualOutline = React.forwardRef(
	({ dimensions, color, thickness }, ref) => {
		const { ancho, alto, largo } = dimensions;

		return (
			<group ref={ref}>
				<mesh position={[0, alto / 2, 0]}>
					<boxGeometry
						args={[
							ancho + thickness * 0.1,
							alto + thickness * 0.1,
							largo + thickness * 0.1,
						]}
					/>
					<meshBasicMaterial
						color={color}
						wireframe={true}
						transparent={true}
						opacity={0.8}
					/>
				</mesh>
			</group>
		);
	}
);

// Wireframe simple como alternativa
function SimpleWireframe({ dimensions, color }) {
	const { ancho, alto, largo } = dimensions;

	return (
		<mesh position={[0, alto / 2, 0]}>
			<boxGeometry args={[ancho + 0.2, alto + 0.2, largo + 0.2]} />
			<meshBasicMaterial
				color={color}
				wireframe={true}
				transparent={true}
				opacity={0.8}
			/>
		</mesh>
	);
}

// Etiqueta con información BIM
function BIMLabel({ position, bimData, showCosts }) {
	return (
		<Html position={position} center>
			<div className="bg-white/90 p-2 rounded shadow-lg border text-xs min-w-48">
				<div className="font-semibold text-blue-800">
					{bimData.nombre}
				</div>
				<div className="text-gray-600">Tipo: {bimData.tipo}</div>
				<div className="text-gray-600">
					Área: {bimData.area?.toFixed(1)}m²
				</div>
				<div className="text-gray-600">
					Dimensiones: {bimData.dimensiones?.ancho}×
					{bimData.dimensiones?.largo}×{bimData.dimensiones?.alto}m
				</div>
				{showCosts && (
					<div className="text-green-600 font-medium mt-1">
						Costo: ${bimData.costo?.toLocaleString()}{" "}
						{bimData.moneda}
					</div>
				)}
				<div className="text-xs text-gray-500 mt-1">
					ID: {bimData.id}
				</div>
			</div>
		</Html>
	);
}

// Etiquetas de dimensiones simples (solo HTML)
function SimpleDimensionLabels({ dimensions }) {
	if (!dimensions) return null;

	return (
		<group>
			{/* Cota de ancho */}
			<Html position={[0, 5, -dimensions.largo / 2 - 20]} center>
				<div className="bg-white/90 px-2 py-1 rounded text-xs font-bold border">
					{dimensions.ancho}m
				</div>
			</Html>

			{/* Cota de largo */}
			<Html position={[-dimensions.ancho / 2 - 20, 5, 0]} center>
				<div className="bg-white/90 px-2 py-1 rounded text-xs font-bold border">
					{dimensions.largo}m
				</div>
			</Html>

			{/* Líneas de cota simples */}
			<group>
				{/* Línea horizontal */}
				<mesh position={[0, 2, -dimensions.largo / 2 - 15]}>
					<boxGeometry args={[dimensions.ancho, 0.1, 0.1]} />
					<meshBasicMaterial color="#333" />
				</mesh>

				{/* Línea vertical */}
				<mesh position={[-dimensions.ancho / 2 - 15, 2, 0]}>
					<boxGeometry args={[0.1, 0.1, dimensions.largo]} />
					<meshBasicMaterial color="#333" />
				</mesh>
			</group>
		</group>
	);
}

// Icono de costo
function CostIcon({ position, cost, area }) {
	return (
		<Html position={position} center>
			<div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
				${cost?.toLocaleString()}
			</div>
		</Html>
	);
}

// Información de costos del piso
function FloorCostInfo({ position, bimData, floor }) {
	return (
		<Html position={position} center>
			<div className="bg-blue-500 text-white p-3 rounded-lg shadow-lg">
				<div className="font-bold">Piso {floor}</div>
				<div>Elementos: {bimData.elementos}</div>
				<div>Área: {bimData.areaTotal?.toFixed(1)}m²</div>
				<div>Costo: ${bimData.costoTotal?.toLocaleString()}</div>
			</div>
		</Html>
	);
}
