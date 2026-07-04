import WallSSHH from "./components/WallSSHH";
import Cubicles from "./components/Cubicles";
import Pasillo from "./components/Pasillo";
import RoofSSHH from "./components/RoofSSHH";
import { castEvenNum } from "../../../../../../lib/castEvenNumber";
import { INCREMENT_SCALE, WALL_THICKNESS } from "../Pabellones/app.settings";

export default function SSHHPeine({
	position,
	bathroom,
	baths,
	classroom,
	view,
}) {
	const cubicles = castEvenNum(1) / 2;

	// Solo llamar setCubicles si el método existe
	if (bathroom?.walls && typeof bathroom.walls.setCubicles === "function") {
		bathroom.walls.setCubicles(cubicles);
	}

	console.log("posicion del baño!", position);

	return (
		//<group position={[680, 0, 1525]} rotation={[0, -Math.PI / 2, 0]}>
		<group position={position} rotation={[0, Math.PI / 2, 0]}>
			<WallSSHH walls={bathroom.walls} />

			<Cubicles
				bathroom={bathroom}
				amount={cubicles}
				increment_scale={INCREMENT_SCALE}
				wall_thickness={WALL_THICKNESS}
			/>

			{/* PASILLO DE ENTRADA */}
			<Pasillo
				args={[bathroom.entranceCorridor, 8]}
				position={[
					0,
					0.3,
					-(
						WALL_THICKNESS +
						(bathroom.cubicleWidth * cubicles + (cubicles + 1) * 3)
					),
				]}
				rotation={[-Math.PI / 2, 0, 0]}
				color={0x3d3d3d}
			/>

			{/* <RoofSSHH
				position={[0, classroom.height + 30, 0]}
				rotation={[Math.PI / 2, 0, 0]}
				length={classroom.length}
				width={classroom.width}
			/> */}
		</group>
	);
}
