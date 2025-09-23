import { BufferGeometry, Shape } from "three";
import { Text } from "@react-three/drei";
import { WALL_THICKNESS } from "../../../Plan3D/components/Pabellones/app.settings";
// import InterBold from "../../../../../assets/font/Inter-Bold.woff";

export default function SSHH2D2({
	position,
	bathroom,
	classroom,
	baths,
	view,
	floor,
}) {
	const width = 220;
	let largoBaño = 0;
	if (classroom.length === 4) {
		largoBaño = 380;
	} else {
		largoBaño = 415;
	}

	const trackShape = new Shape();
	trackShape.moveTo(167.5, 0); // (415 / 2) - (80 / 2)
	trackShape.lineTo(0, 0);
	trackShape.lineTo(0, width);
	trackShape.lineTo(largoBaño, width);
	trackShape.lineTo(largoBaño, 0);
	trackShape.lineTo(247.5, 0); // (415 / 2) + (80 / 2)
	trackShape.lineTo(247.5, 22.5);

	const geometry = new BufferGeometry().setFromPoints(trackShape.getPoints());
	// const geometry = new ShapeGeometry(trackShape);

	const points = createSquareShape(
		width - WALL_THICKNESS * 6,
		largoBaño - WALL_THICKNESS * 6
	);

	return (
		<group position={position} rotation={[0, Math.PI / 2, 0]}>
			<line
				position={[0, 0, width]}
				rotation={[-Math.PI / 2, 0, 0]}
				geometry={geometry}
			>
				<lineBasicMaterial color={0x383838} />
			</line>

			<line
				position={[WALL_THICKNESS * 3, 0, width - WALL_THICKNESS * 3]}
				rotation={[-Math.PI / 2, 0, 0]}
				geometry={new BufferGeometry().setFromPoints(points)}
			>
				<lineBasicMaterial color={0x383838} />
			</line>

			<Text
				position={[200, 1, 118]}
				rotation={[Math.PI / -2, 0, 0]}
				color="black"
				// font={InterBold}
				anchorX="center"
				anchorY="middle"
				fontSize={55}
				children={"SSHH"}
			/>
		</group>
	);
}

const createSquareShape = (width, length) => {
	const squareShape = new Shape();
	// squareShape.moveTo(20, 20);
	squareShape.moveTo(length / 2 - 40, -22.5); // 80
	squareShape.lineTo(length / 2 - 40, 0);
	squareShape.lineTo(0, 0);
	squareShape.lineTo(0, width);
	squareShape.lineTo(length, width);
	squareShape.lineTo(length, 0);
	squareShape.lineTo(length / 2 + 40, 0);
	// squareShape.lineTo(0, 20);

	// squareShape.closePath();
	return squareShape.getPoints();
};
