import ClassroomGroup from "../../ClassroomGroup/ClassroomGroup";
import Entrance from "../../Entrance/Entrance";
import SSHH from "../../SSHH/SSHH";
import Stairs from "../../Stairs/Stairs";
import Classroom2D from "../../../../PlanFloor/components/Classroom2D/Classroom2D";
import Entrance2D from "../../../../PlanFloor/components/Entrance2D/Entrance2D";
import SSHH2D from "../../../../PlanFloor/components/SSHH2D/SSHH2D";
import Stairs2D from "../../../../PlanFloor/components/Stairs2D/Stairs2D";
import Floor from "../../Floor";
import FloorPeine from "../../FloorPeine";
import ComplementaryEnvironment2D from "../../../../PlanFloor/components/ComplementaryEnvironment2D/ComplementaryEnvironment2D";

export default function PabellonSelect({
	position,
	rotation,
	environment,
	classroom,
	bathroom,
	stairs,
	corridor,
	floors,
	length,
	view,
	_classrooms,
	width,
	spaceEntrance,
}) {
	const _floors = [];
	const _floorsPeine = [];
	const _floorsPeine2 = [];

	const ordenarEnvironment = (environment, ambientesPorPiso) => {
		const prioridadEntrada = [
			"dirección administrativa",
			"sala de reuniones",
		];
		const ambientesEntrada = [];
		const laboratorios = [];
		const otrosAmbientes = [];

		for (const ambiente of environment) {
			const nombre = ambiente.ambienteComplementario?.toLowerCase();

			if (
				prioridadEntrada.some((p) => nombre?.includes(p.toLowerCase()))
			) {
				ambientesEntrada.push(ambiente);
			} else if (nombre?.includes("laboratorio de ciencias")) {
				laboratorios.push(ambiente);
			} else {
				otrosAmbientes.push(ambiente);
			}
		}

		// 🧠 Ahora distribuimos en pisos:
		const environmentByFloor = [];

		// Piso 1: Dirección + Sala de Profesores + otros si queda espacio
		let primerPiso = [...ambientesEntrada];

		// ¿Queda espacio en primer piso para más ambientes?
		const espacioDisponible = ambientesPorPiso - primerPiso.length;

		if (espacioDisponible > 0) {
			primerPiso = primerPiso.concat(
				otrosAmbientes.splice(0, espacioDisponible)
			);
		}

		environmentByFloor.push(primerPiso);

		// Piso 2 y más: otrosAmbientes + laboratorios
		const restantes = [...otrosAmbientes, ...laboratorios];

		if (ambientesPorPiso > 0) {
			for (let i = 0; i < restantes.length; i += ambientesPorPiso) {
				environmentByFloor.push(
					restantes.slice(i, i + ambientesPorPiso)
				);
			}
		}

		return environmentByFloor;
	};

	const buildPeine2 = ({ classrooms, floor, environment, length }) => {
		const posicionesPorAulas = {
			7: { top: -1450, bottom: 1150 },
			6: { top: -1550, bottom: 760 },
			4: { top: -1350, bottom: -60 },

			8: { top: -1620, bottom: 1380 },
		};

		const aulasLaterales = _classrooms[0].classrooms.length;

		const posX = posicionesPorAulas[aulasLaterales] || {
			top: -1350,
			bottom: -60,
		};

		const posY = (floor - 1) * 140;
		const sides = { top: [], bottom: [] };

		const createSide = (side, elements, isEnv = false) => {
			let currentZ;

			if (side === "top") {
				currentZ =
					elements.length < 3
						? 1370
						: elements.length === 6
						? 700
						: 700;
			} else {
				currentZ = elements.length < 3 ? 2000 : 2800;
			}

			for (let i = 0; i < elements.length; i++) {
				const el = elements[i];
				let room,
					level,
					isEntrance = false;

				if (el?.isEntrance) {
					// ✅ Entrada aunque estemos en isEnv
					room = el.component;
					level = "entrance";
					isEntrance = true;
				} else if (isEnv) {
					// Ambiente complementario
					room =
						view.view === "3D"
							? ClassroomGroup
							: ComplementaryEnvironment2D;
					level = el.ambienteComplementario || "ambiente";
				} else if (typeof el === "string") {
					// Aula
					const esAmbienteEspecial = el
						.toLowerCase()
						.includes("sala de psicomotricidad");
					room =
						view.view === "3D"
							? ClassroomGroup
							: esAmbienteEspecial
							? ComplementaryEnvironment2D
							: Classroom2D;
					level = el;
				}

				const aulasPorPiso = elements.length;
				const posX = elements.length <= 6 ? -40 : -140;

				sides[side].push({
					position: [side === "top" ? posX : 350, 0, currentZ],
					rotation: [0, Math.PI / 2, 0],
					room,
					floor,
					level,
					n: isEntrance ? "entrance" : i,
				});

				const longitudAula =
					side === "top"
						? aulasPorPiso === 5
							? classroom.length - 40
							: classroom.length
						: classroom.length + 10;

				currentZ += side === "top" ? longitudAula : -longitudAula;
			}

			// if (Array.isArray(classrooms) && classrooms.length > 0) {
			// 	const hasBathroom = floors[floor - 1]?.baths;
			// 	if (hasBathroom) {
			// 		sides.bottom.push({
			// 			position: [350, 0, currentZ],
			// 			rotation: [0, Math.PI / 2, 0],
			// 			room: view.view === "3D" ? SSHH : SSHH2D,
			// 			floor,
			// 			level: "sshh",
			// 			n: "baño",
			// 		});
			// 	}
			// }
		};

		// 👉 Lado top: ambientes complementarios + entrada
		let envWithEntrance = [...environment];

		const needsEntranceTop = floor === 1 && envWithEntrance.length >= 1;
		if (needsEntranceTop) {
			const index = Math.floor(envWithEntrance.length / 2);
			const obj = view.view === "3D" ? Entrance : Entrance2D;
			envWithEntrance.splice(index, 0, {
				isEntrance: true,
				component: obj,
			});
		}

		createSide("top", envWithEntrance, true);

		// 👉 Lado bottom: aulas del nivel inicial
		if (Array.isArray(classrooms) && classrooms.length > 0) {
			createSide("bottom", classrooms);
		}
		// if (Array.isArray(classrooms) && classrooms.length > 0) {
		// 	const hasBathroom = floors[floor - 1]?.baths;
		// 	if (hasBathroom) {
		// 		sides.bottom.push({
		// 			position: [350, 0, 0],
		// 			rotation: [0, Math.PI / 2, 0],
		// 			room: view.view === "3D" ? SSHH : SSHH2D,
		// 			floor,
		// 			level: "sshh",
		// 			n: "baño",
		// 		});
		// 	}
		// }

		// Agregar al arreglo general
		_floorsPeine2.push({
			sides: [
				{
					side: "top",
					classrooms: sides.top,
					position: [
						posX.top,
						posY,
						classroom.width + corridor.width,
					],
					room: view.view === "3D" ? SSHH : SSHH2D,
				},
				{
					side: "bottom",
					classrooms: sides.bottom,
					position: [
						posX.bottom,
						posY,
						classroom.width + corridor.width,
					],
				},
			],
			floor,
		});
	};

	const actualSize = spaceEntrance - 7.2 - 7.2 - 4 - 4 - 5;

	const aulasPorPisoMax = Math.floor(actualSize / 8);

	const ambientesPorPiso = aulasPorPisoMax; // Número máximo de ambientes complementarios por piso

	const filteredEnvironment = environment?.filter(
		(a) =>
			![
				"Sala de Psicomotricidad",
				"Almacén general / Depósito de materiales",
			].includes(a.ambienteComplementario)
	);

	const environmentByFloor = ordenarEnvironment(
		filteredEnvironment,
		ambientesPorPiso
	);

	console.log("peijne2", _floorsPeine2);

	const buildFloor = (data, aulasPorNivel) => {
		const classrooms = [];
		let bathroom = null;
		let stairs = null;

		let x = 0;
		let y = (data.floor - 1) * 60; //140 para vista 3d

		let z = 0;

		const totalAulas = data.classrooms.length;

		let classroomIndex = 0;
		const isNotLastFloor = data.floor < floors.length;

		const side1 = Math.ceil(data.classrooms.length / 2);

		const side2 = data.classrooms.length - side1;

		/* SIDE 1 */
		for (let i = 0; i < side1; i++) {
			const nombreAula = data.classrooms[classroomIndex];

			const esAmbienteComplementario =
				nombreAula === "Almacén general / Depósito de materiales";

			classrooms.push({
				position: [x, y, z],
				floor: data.floor,
				level: data.classrooms[classroomIndex],
				//room: view.view === "3D" ? ClassroomGroup : Classroom2D,
				room:
					view.view === "3D"
						? ClassroomGroup
						: esAmbienteComplementario
						? ComplementaryEnvironment2D
						: Classroom2D,
				n: classroomIndex,
			});
			x = addClassroomPosition(x, totalAulas);
			classroomIndex++;
		}

		/* STAIRS */

		const hasMoreThanOneFloor = floors.length > 1;
		const isLastFloor = data.floor === floors.length;
		if (hasMoreThanOneFloor && !isLastFloor && data.floor) {
			x = stairsOffset(x, totalAulas);

			if (data.floor) {
				stairs = {
					position: [x, y, z],
					room: view.view === "3D" ? Stairs : Stairs2D,
					extraRoofWidth: isNotLastFloor,
					floor: data.floor,
				};
			}

			x = addClassroomPosition(x, totalAulas);
		}

		/* BATHROOM */

		if (floors[data.floor - 1].baths) {
			bathroom = {
				position: [x, y, z],
				room: view.view === "3D" ? SSHH : SSHH2D,
				baths: data.baths,
				floor: data.floor,
			};

			x = addClassroomPosition(x, totalAulas);
		}

		/* SIDE 2 */
		for (let i = 0; i < side2; i++) {
			const nombreAula = data.classrooms[classroomIndex];
			const esAmbienteComplementario =
				nombreAula === "Almacén general / Depósito de materiales";

			classrooms.push({
				position: [x, y, z],
				//room: view.view === "3D" ? ClassroomGroup : Classroom2D,
				room:
					view.view === "3D"
						? ClassroomGroup
						: esAmbienteComplementario
						? ComplementaryEnvironment2D
						: Classroom2D,
				level: data.classrooms[classroomIndex],
				extraRoofWidth: true,
				floor: data.floor,
				n: classroomIndex,
			});
			x = addClassroomPosition(x, totalAulas);
			classroomIndex++;
		}

		if (data.classrooms[0] === "inicial") {
			buildPeine2({
				classrooms: data.classrooms,
				floor: data.floor,
				environment: environmentByFloor[data.floor - 1] || [],
				length: length,
			});
		} else {
			_floors.push({
				classrooms,
				bathroom,
				stairs,
				floor: data.floor,
				pab: data.pab,
			});
		}
	};

	for (let i = 0; i < floors.length; i++) {
		buildFloor(floors[i]);
	}

	console.log("_floors x select: ", _floors);
	console.log("data florrs[i]", floors);

	return (
		<group position={position} rotation={rotation}>
			{/* Pabellon floors */}
			{_floors.map((floor, index) => (
				<Floor
					key={index}
					classrooms={floor.classrooms}
					bathroom={floor.bathroom}
					stairs={floor.stairs}
					floor={floor.floor}
					view={view}
					haveCorridor={floor.floor < _floors.length}
					havePeine={_floorsPeine[index + 1]}
					_classroom={classroom}
					_bathroom={bathroom}
					_stairs={stairs}
					pab={floor.pab}
					length={length}
				/>
			))}
			{_floorsPeine2.map((floor, index) => (
				<FloorPeine
					key={index}
					sides={floor.sides}
					floor={floor.floor}
					_classroom={classroom}
					floorsLength={_floorsPeine2.length}
					view={view}
					environment={floor.environment}
				/>
			))}
		</group>
	);
}
const addClassroomPosition = (x, nAulas) => {
	if (nAulas === 4) return x - 375;
	if (nAulas === 6 || nAulas === 7) return x - 415;
	return x - 400; // valor por defecto si necesitas
};

const stairsOffset = (x, nAulas) => {
	if (nAulas === 4) return x + 415 - 155;
	if (nAulas === 6 || nAulas === 7) return x + 415 - 120;
	return x + 415 - 130; // valor por defecto si necesitas
};
