import { useRef, useMemo } from "react";
import { Vector3, BufferGeometry, BufferAttribute } from "three";
import { Text } from "@react-three/drei";

// Componente principal de cota
export function Dimension({
	start = [0, 0, 0],
	end = [10, 0, 0],
	offset = 2, // Separación de la línea principal
	color = "#000000",
	textColor = "#000000",
	fontSize = 0.5,
	unit = "m",
	precision = 2,
	visible = true,
	above = true, // Si la cota va arriba o abajo de la línea
}) {
	const startVec = useMemo(() => new Vector3(...start), [start]);
	const endVec = useMemo(() => new Vector3(...end), [end]);

	// Calcular la distancia
	const distance = useMemo(() => {
		return startVec.distanceTo(endVec);
	}, [startVec, endVec]);

	// Calcular la dirección perpendicular para el offset
	const { offsetStart, offsetEnd, textPosition } = useMemo(() => {
		const direction = new Vector3()
			.subVectors(endVec, startVec)
			.normalize();
		const perpendicular = new Vector3(
			-direction.z,
			0,
			direction.x
		).normalize();

		if (!above) {
			perpendicular.multiplyScalar(-1);
		}

		const offsetVector = perpendicular.multiplyScalar(offset);

		const offsetStart = new Vector3().addVectors(startVec, offsetVector);
		const offsetEnd = new Vector3().addVectors(endVec, offsetVector);
		const textPosition = new Vector3()
			.addVectors(offsetStart, offsetEnd)
			.multiplyScalar(0.5);

		return { offsetStart, offsetEnd, textPosition };
	}, [startVec, endVec, offset, above]);

	// Crear geometría de las líneas
	const lineGeometry = useMemo(() => {
		const geometry = new BufferGeometry();
		const positions = new Float32Array([
			// Línea principal de cota
			offsetStart.x,
			offsetStart.y,
			offsetStart.z,
			offsetEnd.x,
			offsetEnd.y,
			offsetEnd.z,

			// Línea de extensión izquierda
			startVec.x,
			startVec.y,
			startVec.z,
			offsetStart.x,
			offsetStart.y + 0.5,
			offsetStart.z,

			// Línea de extensión derecha
			endVec.x,
			endVec.y,
			endVec.z,
			offsetEnd.x,
			offsetEnd.y + 0.5,
			offsetEnd.z,
		]);

		geometry.setAttribute("position", new BufferAttribute(positions, 3));
		return geometry;
	}, [startVec, endVec, offsetStart, offsetEnd]);

	// Crear flechas
	const ArrowHead = ({ position, rotation }) => (
		<mesh position={position} rotation={rotation}>
			<coneGeometry args={[0.1, 0.3, 8]} />
			<meshBasicMaterial color={color} />
		</mesh>
	);

	// Calcular rotación de las flechas
	const arrowRotations = useMemo(() => {
		const direction = new Vector3()
			.subVectors(offsetEnd, offsetStart)
			.normalize();
		const angle = Math.atan2(direction.x, direction.z);

		return {
			start: [0, angle + Math.PI, 0],
			end: [0, angle, 0],
		};
	}, [offsetStart, offsetEnd]);

	// Formatear el texto de la cota
	const dimensionText = useMemo(() => {
		return `${distance.toFixed(precision)}${unit}`;
	}, [distance, precision, unit]);

	if (!visible) return null;

	return (
		<group>
			{/* Líneas de cota */}
			<line geometry={lineGeometry}>
				<lineBasicMaterial color={color} linewidth={2} />
			</line>

			{/* Flechas */}
			<ArrowHead
				position={offsetStart.toArray()}
				rotation={arrowRotations.start}
			/>
			<ArrowHead
				position={offsetEnd.toArray()}
				rotation={arrowRotations.end}
			/>

			{/* Texto de la dimensión */}
			<Text
				position={[
					textPosition.x,
					textPosition.y + 0.8,
					textPosition.z,
				]}
				fontSize={fontSize}
				color={textColor}
				anchorX="center"
				anchorY="middle"
				rotation={[0, 0, 0]}
			>
				{dimensionText}
			</Text>
		</group>
	);
}

// Componente para cotas de aulas
export function ClassroomDimensions({
	position = [0, 0, 0],
	width,
	length,
	height,
	visible = true,
	color = "#ff0000",
}) {
	if (!visible) return null;

	const [x, y, z] = position;

	return (
		<group position={position}>
			{/* Cota del ancho (width) */}
			<Dimension
				start={[-width / 2, 0, -length / 2]}
				end={[width / 2, 0, -length / 2]}
				offset={-3}
				color={color}
				textColor={color}
				above={false}
			/>

			{/* Cota del largo (length) */}
			<Dimension
				start={[width / 2, 0, -length / 2]}
				end={[width / 2, 0, length / 2]}
				offset={3}
				color={color}
				textColor={color}
				above={true}
			/>

			{/* Cota de la altura (height) - vertical */}
			<VerticalDimension
				start={[width / 2, 0, 0]}
				end={[width / 2, height, 0]}
				offset={3}
				color={color}
				textColor={color}
			/>
		</group>
	);
}

// Componente para cotas verticales
export function VerticalDimension({
	start = [0, 0, 0],
	end = [0, 3, 0],
	offset = 2,
	color = "#000000",
	textColor = "#000000",
	fontSize = 0.5,
	unit = "m",
	precision = 2,
}) {
	const startVec = useMemo(() => new Vector3(...start), [start]);
	const endVec = useMemo(() => new Vector3(...end), [end]);

	const distance = useMemo(() => {
		return startVec.distanceTo(endVec);
	}, [startVec, endVec]);

	const { offsetStart, offsetEnd, textPosition } = useMemo(() => {
		const offsetStart = new Vector3(
			startVec.x + offset,
			startVec.y,
			startVec.z
		);
		const offsetEnd = new Vector3(endVec.x + offset, endVec.y, endVec.z);
		const textPosition = new Vector3()
			.addVectors(offsetStart, offsetEnd)
			.multiplyScalar(0.5);

		return { offsetStart, offsetEnd, textPosition };
	}, [startVec, endVec, offset]);

	const lineGeometry = useMemo(() => {
		const geometry = new BufferGeometry();
		const positions = new Float32Array([
			// Línea principal vertical
			offsetStart.x,
			offsetStart.y,
			offsetStart.z,
			offsetEnd.x,
			offsetEnd.y,
			offsetEnd.z,

			// Línea de extensión inferior
			startVec.x,
			startVec.y,
			startVec.z,
			offsetStart.x + 0.5,
			offsetStart.y,
			offsetStart.z,

			// Línea de extensión superior
			endVec.x,
			endVec.y,
			endVec.z,
			offsetEnd.x + 0.5,
			offsetEnd.y,
			offsetEnd.z,
		]);

		geometry.setAttribute("position", new BufferAttribute(positions, 3));
		return geometry;
	}, [startVec, endVec, offsetStart, offsetEnd]);

	const dimensionText = useMemo(() => {
		return `${distance.toFixed(precision)}${unit}`;
	}, [distance, precision, unit]);

	return (
		<group>
			<line geometry={lineGeometry}>
				<lineBasicMaterial color={color} linewidth={2} />
			</line>

			{/* Flechas verticales */}
			<mesh
				position={[offsetStart.x, offsetStart.y, offsetStart.z]}
				rotation={[Math.PI, 0, 0]}
			>
				<coneGeometry args={[0.1, 0.3, 8]} />
				<meshBasicMaterial color={color} />
			</mesh>

			<mesh
				position={[offsetEnd.x, offsetEnd.y, offsetEnd.z]}
				rotation={[0, 0, 0]}
			>
				<coneGeometry args={[0.1, 0.3, 8]} />
				<meshBasicMaterial color={color} />
			</mesh>

			<Text
				position={[textPosition.x + 1, textPosition.y, textPosition.z]}
				fontSize={fontSize}
				color={textColor}
				anchorX="center"
				anchorY="middle"
				rotation={[0, 0, Math.PI / 2]}
			>
				{dimensionText}
			</Text>
		</group>
	);
}

// Componente para mostrar cotas entre edificios
export function BuildingDistances({
	buildings = [],
	visible = true,
	color = "#0066cc",
}) {
	if (!visible || buildings.length < 2) return null;

	return (
		<group>
			{buildings.map((building, index) => {
				if (index === buildings.length - 1) return null;

				const nextBuilding = buildings[index + 1];

				return (
					<Dimension
						key={`distance-${index}`}
						start={[building.position[0], 0, building.position[2]]}
						end={[
							nextBuilding.position[0],
							0,
							nextBuilding.position[2],
						]}
						offset={-8}
						color={color}
						textColor={color}
						above={false}
					/>
				);
			})}
		</group>
	);
}
