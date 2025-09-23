import WallSSHH from "./components/WallSSHH";
import Cubicles from "./components/Cubicles";

import Pasillo from "./components/Pasillo";
import RoofSSHH from "./components/RoofSSHH";
import { castEvenNum } from "../../../../../../lib/castEvenNumber";
import { INCREMENT_SCALE, WALL_THICKNESS } from "../Pabellones/app.settings";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { useLoader } from "@react-three/fiber";
import { useRef } from "react";

export default function SSHH({ position, bathroom, baths, classroom, view }) {
	const cubicles = castEvenNum(baths) / 2;

	// Solo llamar setCubicles si el método existe
	if (bathroom?.walls && typeof bathroom.walls.setCubicles === "function") {
		bathroom.walls.setCubicles(cubicles);
	}

	console.log("clasrroonm baño", bathroom.walls);

	return (
		<group position={position}>
			<WallSSHH walls={bathroom.walls} />

			<Cubicles
				bathroom={bathroom}
				amount={cubicles}
				increment_scale={INCREMENT_SCALE}
				wall_thickness={WALL_THICKNESS}
			/>

			{/* PASILLO DE ENTRADA */}
			<Pasillo
				args={[bathroom.entranceCorridor, classroom.length]}
				position={[
					0,
					0.3,
					WALL_THICKNESS +
						(bathroom.cubicleWidth * cubicles + (cubicles + 1) * 3),
				]}
				rotation={[Math.PI / 2, 0, 0]}
				color={0x3d3d3d}
			/>

			<RoofSSHH
				position={[0, classroom.height + 30, 0]}
				rotation={[Math.PI / 2, 0, 0]}
				length={classroom.length}
				width={classroom.width}
			/>

			<Toilet3DM />
			<Toilet3DF />
			<Sink3DM />
			<Sink3DF />
		</group>
	);
}

function Toilet3DM({
	position = [70, 50, 60],
	rotation = [0, 0, 0],
	scale = [80, 80, 80],
}) {
	// Cargar el modelo GLTF
	const { nodes, materials } = useLoader(
		GLTFLoader,
		"/models/bathroom_lavatory/scene.gltf" // Ajusta la ruta según tu estructura
	);

	const group = useRef();

	return (
		<group
			ref={group}
			position={position}
			rotation={rotation}
			scale={scale}
			dispose={null}
		>
			{/* 
        Según tu scene.gltf, solo hay un mesh llamado "Object_5" 
        con un material "material_0"
      */}
			<mesh
				geometry={nodes["Object_5"].geometry}
				material={materials["material_0"]}
				castShadow
				receiveShadow
			/>
		</group>
	);
}

function Toilet3DF({
	position = [360, 50, 60],
	rotation = [0, Math.PI, 0],
	scale = [80, 80, 80],
}) {
	// Cargar el modelo GLTF
	const { nodes, materials } = useLoader(
		GLTFLoader,
		"/models/bathroom_lavatory/scene.gltf" // Ajusta la ruta según tu estructura
	);

	const group = useRef();

	return (
		<group
			ref={group}
			position={position}
			rotation={rotation}
			scale={scale}
			dispose={null}
		>
			{/* 
        Según tu scene.gltf, solo hay un mesh llamado "Object_5" 
        con un material "material_0"
      */}
			<mesh
				geometry={nodes["Object_5"].geometry}
				material={materials["material_0"]}
				castShadow
				receiveShadow
			/>
		</group>
	);
}

function Sink3DM({
	position = [180, 50, 120],
	rotation = [0, Math.PI, 0],
	scale = [80, 80, 80],
}) {
	// Cargar el modelo GLTF
	const { nodes, materials } = useLoader(
		GLTFLoader,
		"/models/bathroom_laundry/scene.gltf" // Ajusta la ruta según tu estructura
	);

	const group = useRef();

	return (
		<group
			ref={group}
			position={position}
			rotation={rotation}
			scale={scale}
			dispose={null}
		>
			{/* 
        Según tu scene.gltf, también hay un mesh "Object_5" 
        con material "material_0" - mismo patrón que el inodoro
      */}
			<mesh
				geometry={nodes["Object_5"].geometry}
				material={materials["material_0"]}
				castShadow
				receiveShadow
			/>
		</group>
	);
}

function Sink3DF({
	position = [240, 50, 120],
	rotation = [0, Math.PI, 0],
	scale = [80, 80, 80],
}) {
	// Cargar el modelo GLTF
	const { nodes, materials } = useLoader(
		GLTFLoader,
		"/models/bathroom_laundry/scene.gltf" // Ajusta la ruta según tu estructura
	);

	const group = useRef();

	return (
		<group
			ref={group}
			position={position}
			rotation={rotation}
			scale={scale}
			dispose={null}
		>
			{/* 
        Según tu scene.gltf, también hay un mesh "Object_5" 
        con material "material_0" - mismo patrón que el inodoro
      */}
			<mesh
				geometry={nodes["Object_5"].geometry}
				material={materials["material_0"]}
				castShadow
				receiveShadow
			/>
		</group>
	);
}
