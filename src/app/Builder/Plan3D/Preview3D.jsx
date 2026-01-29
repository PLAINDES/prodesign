import { useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Pabellones from "./components/Pabellones/Pabellones";
import Pasillo from "./components/Pasillo/Pasillo";
import SoccerField from "./components/SoccerField/SoccerField";
import Terrain from "./components/Terrain/Terrain";
import { updateProjectService } from "../../../services/projectsService";

export default function Preview3D({ isNew, school, state }) {
	const parsedData = JSON.parse(state.build_data);
	const parsedAforoData = JSON.parse(state.aforo);

	school.setProjectData({
		levels: JSON.parse(state.level).map((level) => level.toLowerCase()),
		points: JSON.parse(state.puntos),
		zone: state.zone,
		type: state.sublevel,
		classroom: {
			length: parsedData.classroom_measurements.muro_horizontal,
			width: parsedData.classroom_measurements.muro_vertical,
			column: parsedData.classroom_measurements.columna,
		},
		numberOfStudents: {
			inicial: parsedAforoData.aforoInicial,
			primaria: parsedAforoData.aforoPrimaria,
			secundaria: parsedAforoData.aforoSecundaria,
		},
		numberOfClassrooms: {
			inicial: parsedAforoData.aulaInicial,
			primaria: parsedAforoData.aulaPrimaria,
			secundaria: parsedAforoData.aulaSecundaria,
		},
		maxCapacity: parsedData.result_data.aforo_maximo,
		partialArea: parsedData.result_data.area_parcial,
		totalArea: parsedData.result_data.aforo_maximo,
		circulationArea: parsedData.result_data.circulacion,
		generalArea: parsedData.construction_info.area_general,
	});

	const { soccerField, corridor, terrain } = school;

	return (
		<Canvas
			camera={{
				fov: 50,
				aspect: 1,
				position: [
					3202.3188734998785, 858.758291437268, -42.78855655034773,
				],
				rotation: [
					"-1.6205812315008037",
					"1.3084828063007592",
					"1.6223414925263104",
					"XYZ",
				],
				far: 7000,
				near: 5,
				zoom: 0.6,
			}}
		>
			<primitive object={school.sky} />
			<color attach="background" args={["#e6e6e6"]} />

			<ambientLight intensity={0.2} />

			<directionalLight
				args={[0xffffff, 0.5]}
				position={[10, 19, 50]}
				shadow-mapSize={[2048, 2048]}
			/>
			<OrbitControls
				rotateSpeed={0.5}
				zoomSpeed={1}
				panSpeed={0.5}
				enableRotate
				minZoom={0.17066106572499624}
			/>

			<Pabellones school={school} view={{ view: "3D", roof: true }} />

			<SoccerField
				position={soccerField.position} // [-terrain.width / 7.5, 0, 0]
				rotation={soccerField.rotation} // [-Math.PI / 2, 0, Math.PI / 2]
				length={soccerField.length}
				width={soccerField.width}
				color={soccerField.color}
			/>

			<Pasillo
				position={corridor.position} // [0, 0, (terrain.width / 2) - classroom.width - (pasillo.width / 2)]
				rotation={corridor.rotation}
				length={corridor}
				width={corridor.width}
				color={corridor.color}
			/>

			<Terrain
				position={terrain.position}
				rotation={terrain.rotation}
				width={terrain.length}
				length={terrain.length}
				color={terrain.color}
			/>
			{/* {isNew && <SaveThumbnail projectId={state.id} />} */}
			{/* <gridHelper position={[0, -1, 0]} args={[terrain.width + 3348, 20, "black", "gray"]} /> */}
		</Canvas>
	);
}
