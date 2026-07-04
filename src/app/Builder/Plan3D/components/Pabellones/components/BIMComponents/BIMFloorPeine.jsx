import React, { useRef, useState } from "react";
import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function BIMFloorPeine({
	sides,
	floor,
	_classroom,
	floorsLength,
	view,
	environment,
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
		<group ref={groupRef} name={`BIMFloorPeine_${floor}`}>
			{/* Renderizar cada lado del peine */}
			{sides.map((side, sideIndex) => (
				<BIMSide
					key={`side_${sideIndex}`}
					side={side}
					floor={floor}
					sideIndex={sideIndex}
					selectedElement={selectedElement}
					hoveredElement={hoveredElement}
					onElementSelect={onElementSelect}
					onHover={setHoveredElement}
					editMode={editMode}
					showDimensions={showDimensions}
					showCosts={showCosts}
				/>
			))}

			{/* Información general del piso peine */}
			{showCosts && bimData && (
				<PeineFloorInfo
					position={[0, 250, 0]}
					bimData={bimData}
					floor={floor}
				/>
			)}

			{/* Conectores visuales entre lados */}
			{showDimensions && <PeineConnectors sides={sides} />}
		</group>
	);
}

// Componente para cada lado del peine
function BIMSide({
	side,
	floor,
	sideIndex,
	selectedElement,
	hoveredElement,
	onElementSelect,
	onHover,
	editMode,
	showDimensions,
	showCosts,
}) {
	return (
		<group position={side.position} name={`Side_${side.side}`}>
			{/* Renderizar aulas/ambientes de este lado */}
			{side.classrooms.map((classroom, index) => (
				<BIMPeineElement
					key={`${side.side}_${index}`}
					element={classroom}
					elementIndex={index}
					sideType={side.side}
					isSelected={selectedElement?.id === classroom.bim?.id}
					isHovered={hoveredElement?.id === classroom.bim?.id}
					onSelect={onElementSelect}
					onHover={onHover}
					editMode={editMode}
					showDimensions={showDimensions}
					showCosts={showCosts}
				/>
			))}

			{/* Etiqueta del lado */}
			{showDimensions && (
				<SideLabel
					position={[0, 100, 0]}
					sideType={side.side}
					elementCount={side.classrooms.length}
				/>
			)}
		</group>
	);
}

// Elemento individual del peine (aula, baño, ambiente complementario)
function BIMPeineElement({
	element,
	elementIndex,
	sideType,
	isSelected,
	isHovered,
	onSelect,
	onHover,
	editMode,
	showDimensions,
	showCosts,
}) {
	const meshRef = useRef();
	const outlineRef = useRef();

	// Animación del outline
	useFrame((state) => {
		if (outlineRef.current) {
			if (isSelected) {
				// Pulsado para seleccionado
				const scale =
					Math.sin(state.clock.elapsedTime * 3) * 0.05 + 1.05;
				outlineRef.current.scale.setScalar(scale);
			} else if (isHovered) {
				// Escala fija para hover
				outlineRef.current.scale.setScalar(1.02);
			} else {
				outlineRef.current.scale.setScalar(1);
			}
		}
	});

	const handleClick = (event) => {
		if (editMode && onSelect && element.bim) {
			event.stopPropagation();
			onSelect(element.bim);
		}
	};

	const handlePointerOver = (event) => {
		if (editMode && element.bim) {
			event.stopPropagation();
			onHover(element.bim);
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

	// Color basado en tipo y estado
	const getMaterialColor = () => {
		if (isSelected) return "#00ff00";
		if (isHovered) return "#ffff00";

		const tipo = element.bim?.tipo || "aula";
		const colorMap = {
			aula: "#87CEEB",
			laboratorio: "#FF6B6B",
			biblioteca: "#4ECDC4",
			taller: "#45B7D1",
			almacen: "#96CEB4",
			bano: "#FECA57",
			cocina: "#FD79A8",
			sum: "#6C5CE7",
			ept: "#A29BFE",
			psicomotricidad: "#FD8EF0",
			entrance: "#00B894",
		};
		return colorMap[tipo] || "#87CEEB";
	};

	// Dimensiones del elemento
	const dimensions = element.bim?.dimensiones || {
		ancho: 8,
		largo: 7.2,
		alto: 3.5,
	};

	return (
		<group position={element.position} rotation={element.rotation}>
			{/* Geometría principal */}
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
					opacity={isSelected ? 0.9 : isHovered ? 0.8 : 0.7}
				/>
			</mesh>

			{/* Outline manual (wireframe) */}
			{(isSelected || isHovered) && (
				<ManualOutlineEffect
					ref={outlineRef}
					dimensions={dimensions}
					color={isSelected ? "#00ff00" : "#ffff00"}
					isSelected={isSelected}
				/>
			)}

			{/* Etiqueta con información BIM */}
			{(isSelected || isHovered) && element.bim && (
				<PeineElementLabel
					position={[0, dimensions.alto + 20, 0]}
					bimData={element.bim}
					sideType={sideType}
					showCosts={showCosts}
				/>
			)}

			{/* Dimensiones del elemento */}
			{showDimensions &&
				element.bim &&
				(isSelected || sideType === "top") && (
					<ElementDimensions
						dimensions={dimensions}
						position={[0, 0, 0]}
					/>
				)}

			{/* Icono de tipo de ambiente */}
			<EnvironmentTypeIcon
				position={[0, dimensions.alto + 5, 0]}
				tipo={element.bim?.tipo}
				visible={isHovered || isSelected}
			/>

			{/* Costo flotante */}
			{showCosts && element.bim && (
				<FloatingCost
					position={[0, dimensions.alto + 10, 0]}
					cost={element.bim.costo}
					area={element.bim.area}
					visible={isSelected}
				/>
			)}
		</group>
	);
}

// Outline manual con efectos
const ManualOutlineEffect = React.forwardRef(
	({ dimensions, color, isSelected }, ref) => {
		const { ancho, alto, largo } = dimensions;

		return (
			<group ref={ref}>
				{/* Wireframe principal */}
				<mesh position={[0, alto / 2, 0]}>
					<boxGeometry
						args={[ancho + 0.2, alto + 0.2, largo + 0.2]}
					/>
					<meshBasicMaterial
						color={color}
						wireframe={true}
						transparent={true}
						opacity={0.8}
					/>
				</mesh>

				{/* Wireframe exterior más grueso */}
				<mesh position={[0, alto / 2, 0]}>
					<boxGeometry
						args={[ancho + 0.4, alto + 0.4, largo + 0.4]}
					/>
					<meshBasicMaterial
						color={color}
						wireframe={true}
						transparent={true}
						opacity={0.4}
					/>
				</mesh>

				{/* Puntos en las esquinas para efecto extra */}
				<CornerPoints
					dimensions={dimensions}
					color={color}
					isSelected={isSelected}
				/>
			</group>
		);
	}
);

// Puntos en las esquinas para efecto visual
function CornerPoints({ dimensions, color, isSelected }) {
	const { ancho, alto, largo } = dimensions;

	const corners = [
		// Esquinas inferiores
		[-ancho / 2, 0, -largo / 2],
		[ancho / 2, 0, -largo / 2],
		[ancho / 2, 0, largo / 2],
		[-ancho / 2, 0, largo / 2],
		// Esquinas superiores
		[-ancho / 2, alto, -largo / 2],
		[ancho / 2, alto, -largo / 2],
		[ancho / 2, alto, largo / 2],
		[-ancho / 2, alto, largo / 2],
	];

	return (
		<group>
			{corners.map((corner, index) => (
				<mesh key={index} position={corner}>
					<sphereGeometry args={[isSelected ? 3 : 2, 8, 8]} />
					<meshBasicMaterial
						color={color}
						transparent={true}
						opacity={0.8}
					/>
				</mesh>
			))}
		</group>
	);
}

// Etiqueta específica para elementos del peine
function PeineElementLabel({ position, bimData, sideType, showCosts }) {
	const getSideDisplayName = (side) => {
		const sideNames = {
			top: "Lateral Superior",
			bottom: "Lateral Inferior",
			midTop: "Centro Superior",
			midBottom: "Centro Inferior",
		};
		return sideNames[side] || side;
	};

	return (
		<Html position={position} center>
			<div className="bg-white/95 p-3 rounded-lg shadow-xl border-2 border-blue-200 text-xs max-w-64">
				<div className="font-bold text-blue-800 text-sm mb-1">
					{bimData.nombre}
				</div>

				<div className="grid grid-cols-2 gap-1 text-gray-600">
					<span>Tipo:</span>
					<span className="font-medium">{bimData.tipo}</span>

					<span>Ubicación:</span>
					<span className="font-medium">
						{getSideDisplayName(sideType)}
					</span>

					<span>Piso:</span>
					<span className="font-medium">{bimData.piso}</span>

					<span>Área:</span>
					<span className="font-medium">
						{bimData.area?.toFixed(1)}m²
					</span>
				</div>

				<div className="mt-2 text-gray-500">
					<div>
						Dimensiones: {bimData.dimensiones?.ancho} ×{" "}
						{bimData.dimensiones?.largo} ×{" "}
						{bimData.dimensiones?.alto}m
					</div>
				</div>

				{showCosts && (
					<div className="mt-2 p-2 bg-green-50 rounded border">
						<div className="text-green-700 font-semibold">
							${bimData.costo?.toLocaleString()} {bimData.moneda}
						</div>
						<div className="text-green-600 text-xs">
							${bimData.costoM2}/m² × {bimData.area?.toFixed(1)}m²
						</div>
					</div>
				)}

				<div className="mt-2 text-xs text-gray-400 border-t pt-1">
					ID: {bimData.id}
				</div>
			</div>
		</Html>
	);
}

// Dimensiones específicas para elementos del peine (solo HTML)
function ElementDimensions({ dimensions, position }) {
	if (!dimensions) return null;

	return (
		<group position={position}>
			{/* Cota de ancho */}
			<Html position={[0, 5, -dimensions.largo / 2 - 15]} center>
				<div className="bg-white/90 px-2 py-1 rounded text-xs font-bold border">
					{dimensions.ancho}m
				</div>
			</Html>

			{/* Cota de largo */}
			<Html position={[-dimensions.ancho / 2 - 15, 5, 0]} center>
				<div className="bg-white/90 px-2 py-1 rounded text-xs font-bold border">
					{dimensions.largo}m
				</div>
			</Html>

			{/* Líneas de cota con meshes */}
			<group>
				{/* Línea horizontal */}
				<mesh position={[0, 2, -dimensions.largo / 2 - 10]}>
					<boxGeometry args={[dimensions.ancho, 0.1, 0.1]} />
					<meshBasicMaterial color="#333" />
				</mesh>

				{/* Línea vertical */}
				<mesh position={[-dimensions.ancho / 2 - 10, 2, 0]}>
					<boxGeometry args={[0.1, 0.1, dimensions.largo]} />
					<meshBasicMaterial color="#333" />
				</mesh>
			</group>
		</group>
	);
}

// Icono de tipo de ambiente
function EnvironmentTypeIcon({ position, tipo, visible }) {
	if (!visible) return null;

	const getIcon = (tipo) => {
		const icons = {
			aula: "🏫",
			laboratorio: "🔬",
			biblioteca: "📚",
			taller: "🔨",
			bano: "🚻",
			cocina: "👨‍🍳",
			sum: "🎭",
			ept: "⚙️",
			psicomotricidad: "🤸",
			almacen: "📦",
			entrance: "🚪",
		};
		return icons[tipo] || "🏛️";
	};

	return (
		<Html position={position} center>
			<div className="text-2xl bg-white/80 p-1 rounded-full shadow-md">
				{getIcon(tipo)}
			</div>
		</Html>
	);
}

// Costo flotante
function FloatingCost({ position, cost, area, visible }) {
	if (!visible) return null;

	return (
		<Html position={position} center>
			<div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse">
				<div>${cost?.toLocaleString()}</div>
				<div className="text-xs opacity-80">{area?.toFixed(1)}m²</div>
			</div>
		</Html>
	);
}

// Etiqueta del lado del peine
function SideLabel({ position, sideType, elementCount }) {
	const getSideInfo = (side) => {
		const sideInfo = {
			top: { name: "Lateral Superior", color: "#3498db" },
			bottom: { name: "Lateral Inferior", color: "#e74c3c" },
			midTop: { name: "Centro Superior", color: "#f39c12" },
			midBottom: { name: "Centro Inferior", color: "#9b59b6" },
		};
		return sideInfo[side] || { name: side, color: "#7f8c8d" };
	};

	const sideInfo = getSideInfo(sideType);

	return (
		<Html position={position} center>
			<div
				className="px-3 py-1 rounded-lg text-white font-semibold text-sm shadow-lg"
				style={{ backgroundColor: sideInfo.color }}
			>
				{sideInfo.name} ({elementCount})
			</div>
		</Html>
	);
}

// Conectores visuales entre lados del peine
function PeineConnectors({ sides }) {
	return (
		<group name="PeineConnectors">
			{sides.map((side, index) => {
				if (index === 0) return null;

				const prevSide = sides[index - 1];
				const currentSide = side;
				const startPos = prevSide.position;
				const endPos = currentSide.position;

				return (
					<mesh
						key={`connector_${index}`}
						position={[
							(startPos[0] + endPos[0]) / 2,
							startPos[1] + 20,
							(startPos[2] + endPos[2]) / 2,
						]}
					>
						<boxGeometry
							args={[
								Math.abs(endPos[0] - startPos[0]),
								0.5,
								Math.abs(endPos[2] - startPos[2]),
							]}
						/>
						<meshBasicMaterial
							color="#888"
							transparent
							opacity={0.3}
						/>
					</mesh>
				);
			})}
		</group>
	);
}

// Información general del piso peine
function PeineFloorInfo({ position, bimData, floor }) {
	return (
		<Html position={position} center>
			<div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-xl shadow-2xl">
				<div className="text-lg font-bold mb-2">
					Piso {floor} - Layout Peine
				</div>
				<div className="grid grid-cols-2 gap-2 text-sm">
					<div>Elementos: {bimData?.totalElements || 0}</div>
					<div>Área: {bimData?.totalArea?.toFixed(1) || 0}m²</div>
				</div>
				<div className="mt-2 text-lg font-semibold">
					Costo: ${bimData?.totalCost?.toLocaleString() || 0}
				</div>
			</div>
		</Html>
	);
}
