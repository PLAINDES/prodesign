import { Color, Shape } from "three";
import { Text } from "@react-three/drei";
import { WALL_THICKNESS } from "../../../Plan3D/components/Pabellones/app.settings";
// import InterBold from "../../../../../assets/font/Inter-Bold.woff";

export default function Classroom2D({
	position,
	rotation,
	classroom,
	lengthTerrain,
	level,
}) {
	// if (view.view2DModule === 1 && floor > 1) return null;
	// else if (view.view2DModule > 1 && floor === 1) return null; // este hace que las aulas del piso 1 no se muestren cuando la vista 2d esta en view2dModule > 1

	const aulaPorPiso = Math.floor((lengthTerrain - 5) / 8);

	const largoAula = aulaPorPiso === 4 ? 375 : 415;

	//const largoAula = 375;
	const shape1 = new Shape();
	shape1.moveTo(0, 0);
	shape1.lineTo(0, classroom.width); //327.5
	shape1.lineTo(largoAula, classroom.width);
	shape1.lineTo(largoAula, 0);
	shape1.closePath();

	const shape2 = new Shape();
	shape2.moveTo(0, 0);
	shape2.lineTo(0, classroom.width - WALL_THICKNESS * 6); // 282.5
	shape2.lineTo(
		largoAula - WALL_THICKNESS * 6,
		classroom.width - WALL_THICKNESS * 6
	);
	shape2.lineTo(largoAula - WALL_THICKNESS * 6, 0);
	shape2.closePath();

	const length = 30;
	const positionC = length / 2;
	const offset = positionC + 3;

	const levelColors = {
		inicial: "#FB8C00",
		primaria: "#00ACC1",
		secundaria: "#43A047",
	};

	const classroomColor = levelColors[level];

	return (
		<group position={position} rotation={rotation}>
			<line
				position={[0, 0, classroom.width]}
				rotation={[-Math.PI / 2, 0, 0]}
			>
				<shapeGeometry args={[shape1]} />
				<lineBasicMaterial linewidth={2} color={new Color(0x383838)} />
			</line>
			<mesh
				position={[0, -0.5, classroom.width]} // bajamos un poco para que no se sobreponga con el borde
				rotation={[-Math.PI / 2, 0, 0]}
			>
				<shapeGeometry args={[shape1]} />
				<meshBasicMaterial
					color={classroomColor}
					transparent
					opacity={0.6}
				/>
			</mesh>
			<line
				position={[
					WALL_THICKNESS * 3,
					0,
					classroom.width - WALL_THICKNESS * 3,
				]}
				rotation={[-Math.PI / 2, 0, 0]}
			>
				<shapeGeometry args={[shape2]} />
				<lineBasicMaterial color={new Color(0x383838)} />
			</line>

			{/* Top left */}
			<mesh position={[largoAula - offset, 0, positionC]}>
				<boxGeometry args={[length, 1, length]} />
				<pointsMaterial color={0x000000} />
			</mesh>

			{/* Top right */}
			<mesh
				position={[largoAula - offset, 0, classroom.width - positionC]}
			>
				<boxGeometry args={[length, 1, length]} />
				<pointsMaterial color={0x000000} />
			</mesh>

			{/* Bottom left */}
			<mesh position={[offset, 0, positionC]}>
				<boxGeometry args={[length, 1, length]} />
				<pointsMaterial color={0x000000} />
			</mesh>

			{/* Bottom right */}
			<mesh position={[offset, 0, classroom.width - positionC]}>
				<boxGeometry args={[length, 1, length]} />
				<pointsMaterial color={0x000000} />
			</mesh>

			{/* de los centros */}
			<mesh position={[largoAula / 2, 0, positionC]}>
				<boxGeometry args={[length, 1, length]} />
				<pointsMaterial color={0x000000} />
			</mesh>

			<mesh position={[largoAula / 2, 0, classroom.width - positionC]}>
				<boxGeometry args={[length, 1, length]} />
				<pointsMaterial color={0x000000} />
			</mesh>

			{/* <Text
				position={[200, 1, 162]}
				rotation={[-Math.PI / 2, 0, 0]}
				color="black"
				anchorX="center"
				anchorY="middle"
				fontSize={55}
				children={`SALA\nCLASES\n${level.toUpperCase()}`}
			/> */}
		</group>
	);
}
