import PabellonSelect from "./components/PabellonSelect";

export default function PabellonesSelect({
	school,
	view,
	space,
	spaceEntrance,
}) {
	const {
		classroom,
		bathroom,
		terrain,
		stairs,
		corridor,
		numberFloors,
		length,
		complementaryEnvironment,
		width,
		verticesRectangle,
	} = school;

	const pabellones = [];
	const almacen = complementaryEnvironment?.find(
		(item) =>
			item.ambienteComplementario ===
			"Almacén general / Depósito de materiales"
	);
	const psicomotricidad = complementaryEnvironment.find(
		(item) => item.ambienteComplementario === "Sala de Psicomotricidad"
	);

	const aulasPorNivel = {
		secundaria: school.classrooms.filter((c) => c === "secundaria"),
		primaria: school.classrooms.filter((c) => c === "primaria"),
		inicial: school.classrooms.filter((c) => c === "inicial"),
	};

	//numero de aulas
	const espacioParaAulas = space - 3 - 2;

	let aulasPorPiso = Math.floor(espacioParaAulas / 9);
	console.log("aulas:", aulasPorPiso);
	// const nivelesConPosiciones = getPosicionesDinamicas(school, screenCoords);
	const nivelesConPosiciones = {
		secundaria: getPosicionPorNivelYAulas("secundaria", aulasPorPiso),
		primaria: getPosicionPorNivelYAulas("primaria", aulasPorPiso),
		inicial: { x: 1200 - aulasPorPiso * 200, y: 0, z: -2000, r: 0 }, // Puedes ajustar esta posición como desees
	};

	const largoTerreno = spaceEntrance; // suponiendo que esto ya viene de school
	const entrada = 5;
	const aulaSecundaria = 7.2;
	const aulaPrimaria = 7.2;
	const anchoAula = 8;
	const espacioDeCirculacion = 4;

	const espacioDisponibleTop =
		largoTerreno -
		aulaSecundaria -
		aulaPrimaria -
		espacioDeCirculacion -
		espacioDeCirculacion;
	const aulasEnTop = Math.floor(espacioDisponibleTop / anchoAula);

	Object.entries(nivelesConPosiciones).forEach(([nivel, pos]) => {
		const aulas = aulasPorNivel[nivel] || [];

		const pisos = Number(numberFloors);

		aulasPorPiso = Math.floor(espacioParaAulas / 9);

		// Puedes limitar un máximo si deseas para inicial
		if (nivel === "inicial") {
			aulasPorPiso = Math.min(aulasPorPiso, aulasEnTop); // por si quieres limitar, opcional
		}
		let floors = [];

		for (let i = 0; i < pisos; i++) {
			let inicio = i * aulasPorPiso;
			let fin = (i + 1) * aulasPorPiso;
			let aulasFloor = aulas.slice(inicio, fin);

			// SOLO para primer piso de secundaria
			if (nivel === "secundaria" && i === 0 && almacen) {
				const posicionAlmacen = aulasPorPiso - 1; // (posición 5, índice 4)

				// Insertar almacen solo si hay suficientes aulas
				if (aulasFloor.length >= posicionAlmacen) {
					aulasFloor.splice(
						posicionAlmacen,
						0,
						almacen.ambienteComplementario
					);
					// o almacen si quieres el objeto completo
					// Recorta para que no se pase del máximo
					if (aulasFloor.length > aulasPorPiso) {
						aulasFloor = aulasFloor.slice(0, aulasPorPiso);
					}
				}
			}

			// SOLO para primer piso de inicial
			if (nivel === "inicial" && i === 0 && psicomotricidad) {
				const posicionPsicometria = aulasPorPiso - 1; // lo agregamos al final

				aulasFloor.splice(
					posicionPsicometria,
					0,
					psicomotricidad.ambienteComplementario
				);

				if (aulasFloor.length > aulasPorPiso) {
					aulasFloor = aulasFloor.slice(0, aulasPorPiso);
				}
			}

			floors.push({
				floor: i + 1,
				classrooms: aulasFloor,
				baths: i === 0 ? 1 : 0,
			});
		}

		pabellones.push({
			position: [pos.x, pos.y, pos.z],
			rotation: [0, pos.r, 0],
			floors: floors,
		});
	});

	console.log("posicion del pabellon", pabellones);

	const aulasSecundaria = pabellones[0].floors;

	return (
		<group name="Pabellones">
			{pabellones.map((el, index) => (
				<PabellonSelect
					position={el.position}
					rotation={el.rotation}
					maxClassroomsForPeine={school.maxClassroomsForPeine}
					classroom={classroom}
					bathroom={bathroom}
					stairs={stairs}
					corridor={corridor}
					terrain={terrain}
					floors={el.floors}
					view={view}
					key={index}
					environment={complementaryEnvironment}
					length={length}
					_classrooms={aulasSecundaria}
					width={width}
					spaceEntrance={spaceEntrance}
				/>
			))}
		</group>
	);
}

function getPosicionPorNivelYAulas(nivel, aulasPorPiso) {
	const key = `${nivel}_${aulasPorPiso}`;

	const posicionesPredefinidas = {
		secundaria_7: { x: -1400, z: 1994.3421954040052 },
		secundaria_6: { x: -1188, z: 1584.3421954040052 },
		primaria_7: { x: 1226, z: -1694.3421954040052 },
		primaria_6: { x: 1028, z: -1584.3421954040052 },
		primaria_4: { x: 632, z: -1020.3421 },
		secundaria_4: { x: -612, z: 986.3421 },
		secundaria_8: { x: -1650, z: 1720 },
		primaria_8: { x: 1250, z: -1800 },
	};

	const base = {
		y: 0,
		r: nivel === "secundaria" ? Math.PI : 0,
	};

	const pos = posicionesPredefinidas[key];

	if (pos) {
		return { ...base, ...pos };
	}

	if (nivel === "secundaria") {
		return {
			x: -(aulasPorPiso * 9 * 22 - 180),
			y: 0,
			z: 986.3421,
			r: Math.PI,
		};
	} else if (nivel === "primaria") {
		return {
			x: aulasPorPiso * 9 * 22 - 160,
			y: 0,
			z: -1020.3421,
			r: 0,
		};
	} else {
		return {
			x: 1200 - aulasPorPiso * 200,
			y: 0,
			z: -2000,
			r: 0,
		};
	}
}
