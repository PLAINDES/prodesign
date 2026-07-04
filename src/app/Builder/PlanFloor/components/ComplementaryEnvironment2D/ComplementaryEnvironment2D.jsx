import { Color, Shape, BufferGeometry } from "three";
import { Text } from "@react-three/drei";
import { WALL_THICKNESS } from "../../../Plan3D/components/Pabellones/app.settings";

export default function ComplementaryEnvironment2D({
	position,
	rotation,
	classroom,
	corridor,
	level,
}) {
	const entradaAncho = 80;
	//console.log("medida de ambientes ::::", environment);
	const salaSum = level === "Sala de Usos Múltiples (SUM)";
	const salaCocina = level === "Cocina escolar";
	const tallerCreativo = level === "Taller creativo";
	const salaLaboratorio = level === "Laboratorio";
	const salaMaestros = level === "Sala de maestros";
	const direccionAdministrativa = level === "Dirección administrativa";
	const biblioteca = level === "Biblioteca escolar";
	const patioInicial = level === "Patio Inicial";
	const lactario = level === "Lactario";
	const topico = level === "Topico";
	const sumInicial = level == "Auditorio multiusos";

	const shouldShowText = !lactario && !topico;

	const scaledClassroom = {
		length: salaSum
			? classroom.length * 2.5
			: salaCocina
			? classroom.length * 0.5
			: salaLaboratorio
			? classroom.length * 1.25
			: tallerCreativo
			? classroom.length * 1.25
			: biblioteca
			? classroom.length * 1
			: patioInicial
			? classroom.length * 1.5
			: lactario
			? classroom.length * 0.25
			: topico
			? classroom.length * 0.35
			: sumInicial
			? classroom.length * 2
			: classroom.length,

		width: salaSum ? classroom.width * 1.5 : classroom.width,
	};

	const shape1 = new Shape();
	shape1.moveTo(
		scaledClassroom.length / 2 - entradaAncho / 2,
		scaledClassroom.width
	); // entrada arriba
	shape1.lineTo(0, scaledClassroom.width);
	shape1.lineTo(0, 0);
	shape1.lineTo(scaledClassroom.length, 0);
	shape1.lineTo(scaledClassroom.length, scaledClassroom.width);
	shape1.lineTo(
		scaledClassroom.length / 2 + entradaAncho / 2,
		scaledClassroom.width
	);

	const shape2 = new Shape();
	shape2.moveTo(
		scaledClassroom.length / 2 - entradaAncho / 2,
		scaledClassroom.width
	);
	shape2.lineTo(0, scaledClassroom.width - WALL_THICKNESS * 6);
	shape2.lineTo(
		scaledClassroom.length - WALL_THICKNESS * 6,
		scaledClassroom.width - WALL_THICKNESS * 6
	);
	shape2.lineTo(scaledClassroom.length - WALL_THICKNESS * 6, 0);
	shape2.closePath();

	const geometry = new BufferGeometry().setFromPoints(shape1.getPoints());

	const points = createSquareShape(
		scaledClassroom.width - WALL_THICKNESS * 6,
		scaledClassroom.length - WALL_THICKNESS * 6
	);

	const ambienteColor = lactario
		? "yellow" // Azul claro para lactario
		: topico
		? "red" // Rosa/morado claro para tópico
		: "#ffe0b2"; // Naranja suave por defecto // Naranja suave

	// Colores para los segmentos de la sala de maestros
	const segmentColors = [
		"#FB8C00", // Rojo suave
		"#00ACC1", // Verde suave
		"#43A047", // Azul suave
	];

	// Función para crear forma de segmento
	const createSegmentShape = (startX, endX) => {
		const segmentShape = new Shape();

		// Si el segmento incluye la entrada (segmento del medio)
		const hasEntrance =
			startX <= scaledClassroom.length / 2 &&
			endX >= scaledClassroom.length / 2;

		if (hasEntrance) {
			// Empezar desde la entrada izquierda
			segmentShape.moveTo(
				Math.max(startX, scaledClassroom.length / 2 - entradaAncho / 2),
				scaledClassroom.width
			);
			segmentShape.lineTo(startX, scaledClassroom.width);
			segmentShape.lineTo(startX, 0);
			segmentShape.lineTo(endX, 0);
			segmentShape.lineTo(endX, scaledClassroom.width);
			segmentShape.lineTo(
				Math.min(endX, scaledClassroom.length / 2 + entradaAncho / 2),
				scaledClassroom.width
			);
		} else {
			// Segmentos sin entrada (izquierdo y derecho)
			segmentShape.moveTo(startX, scaledClassroom.width);
			segmentShape.lineTo(startX, 0);
			segmentShape.lineTo(endX, 0);
			segmentShape.lineTo(endX, scaledClassroom.width);
			segmentShape.closePath();
		}

		return segmentShape;
	};

	const formattedLevel =
		level.length > 15 ? level.replace(/(.{10})/g, "$1\n") : level;

	return (
		<group position={position} rotation={rotation}>
			{/* Borde */}
			<line
				position={[0, 0, scaledClassroom.width]}
				rotation={[-Math.PI / 2, 0, 0]}
				geometry={geometry}
			>
				<lineBasicMaterial linewidth={2} color={new Color(0x6d4c41)} />
			</line>

			{/* Interior - Condicionalmente renderizar segmentos o forma completa */}
			{salaMaestros || direccionAdministrativa ? (
				<>
					{/* Segmento 1 (Izquierdo) */}
					<mesh
						position={[0, -0.5, scaledClassroom.width]}
						rotation={[-Math.PI / 2, 0, 0]}
					>
						<shapeGeometry
							args={[
								createSegmentShape(
									0,
									scaledClassroom.length / 3
								),
							]}
						/>
						<meshBasicMaterial
							color={segmentColors[0]}
							transparent
							opacity={0.7}
						/>
					</mesh>

					{/* Segmento 2 (Centro) */}
					<mesh
						position={[0, -0.5, scaledClassroom.width]}
						rotation={[-Math.PI / 2, 0, 0]}
					>
						<shapeGeometry
							args={[
								createSegmentShape(
									scaledClassroom.length / 3,
									(2 * scaledClassroom.length) / 3
								),
							]}
						/>
						<meshBasicMaterial
							color={segmentColors[1]}
							transparent
							opacity={0.7}
						/>
					</mesh>

					{/* Segmento 3 (Derecho) */}
					<mesh
						position={[0, -0.5, scaledClassroom.width]}
						rotation={[-Math.PI / 2, 0, 0]}
					>
						<shapeGeometry
							args={[
								createSegmentShape(
									(2 * scaledClassroom.length) / 3,
									scaledClassroom.length
								),
							]}
						/>
						<meshBasicMaterial
							color={segmentColors[2]}
							transparent
							opacity={0.7}
						/>
					</mesh>
				</>
			) : (
				/* Interior para otros ambientes */
				<mesh
					position={[0, -0.5, scaledClassroom.width]}
					rotation={[-Math.PI / 2, 0, 0]}
				>
					<shapeGeometry args={[shape1]} />
					<meshBasicMaterial
						color={ambienteColor}
						transparent
						opacity={0.5}
					/>
				</mesh>
			)}

			{/* Borde interior */}
			<line
				position={[
					WALL_THICKNESS * 3,
					0,
					scaledClassroom.width - WALL_THICKNESS * 3,
				]}
				rotation={[-Math.PI / 2, 0, 0]}
				geometry={new BufferGeometry().setFromPoints(points)}
			>
				<lineBasicMaterial color={new Color(0x6d4c41)} />
			</line>

			{(salaMaestros || direccionAdministrativa) && (
				<>
					{/* 1era línea de división */}
					<line
						position={[0, 0.1, scaledClassroom.width]}
						rotation={[-Math.PI / 2, 0, 0]}
						geometry={new BufferGeometry().setFromPoints([
							{ x: scaledClassroom.length / 3, y: 0 },
							{
								x: scaledClassroom.length / 3,
								y: scaledClassroom.width,
							},
						])}
					>
						<lineBasicMaterial
							linewidth={4}
							color={new Color(0x333333)}
						/>
					</line>

					{/* 2da línea de división */}
					<line
						position={[0, 0.1, scaledClassroom.width]}
						rotation={[-Math.PI / 2, 0, 0]}
						geometry={new BufferGeometry().setFromPoints([
							{ x: (2 * scaledClassroom.length) / 3, y: 0 },
							{
								x: (2 * scaledClassroom.length) / 3,
								y: scaledClassroom.width,
							},
						])}
					>
						<lineBasicMaterial
							linewidth={4}
							color={new Color(0x333333)}
						/>
					</line>
				</>
			)}

			{/* Texto descriptivo */}
			{shouldShowText && (
				<Text
					position={[200, 1, 162]}
					rotation={[-Math.PI / 2, 0, 0]}
					color="#3e2723"
					anchorX={salaSum ? 0 : "center"}
					anchorY="middle"
					fontSize={55}
					maxWidth={400}
					textAlign="center"
				>
					{formattedLevel.toUpperCase()}
				</Text>
			)}
		</group>
	);
}

const createSquareShape = (width, length) => {
	const squareShape = new Shape();
	squareShape.moveTo(0, 0);
	squareShape.lineTo(length / 2 - 40, 0);
	squareShape.lineTo(0, 0);
	squareShape.lineTo(0, width);
	squareShape.lineTo(length, width);
	squareShape.lineTo(length, 0);
	squareShape.lineTo(length / 2 + 40, 0);
	return squareShape.getPoints();
};
