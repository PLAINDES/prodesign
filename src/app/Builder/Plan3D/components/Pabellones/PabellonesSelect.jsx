import PabellonSelect from "./components/PabellonSelect";

export default function PabellonesSelect({
	school,
	view,
	space,
	spaceEntrance,
	option,
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
	const laboratorio = complementaryEnvironment.find(
		(item) => item.ambienteComplementario === "Laboratorio"
	);
	const biblioteca = complementaryEnvironment.find(
		(item) => item.ambienteComplementario === "Biblioteca escolar"
	);
	const tallerCreativo = complementaryEnvironment.find(
		(item) => item.ambienteComplementario === "Taller creativo"
	);
	const aulasPorNivel = {
		secundaria: school.classrooms.filter((c) => c === "secundaria"),
		primaria: school.classrooms.filter((c) => c === "primaria"),
		inicial: school.classrooms.filter((c) => c === "inicial"),
	};

	//numero de aulas
	const espacioParaAulas = space - 3 - 3;

	let aulasPorPiso = Math.floor(espacioParaAulas / 7.8);
	//console.log("aulas:", aulasPorPiso);
	// const nivelesConPosiciones = getPosicionesDinamicas(school, screenCoords);
	const largoTerreno = spaceEntrance; // suponiendo que esto ya viene de school
	const entrance = 4;
	const _bathroom = 3;
	const aulaSecundaria = 7.2;
	const aulaPrimaria = 7.2;
	const anchoAula = 7.8;
	const espacioDeCirculacion = 3;

	const espacioDisponibleTop =
		largoTerreno -
		aulaSecundaria -
		aulaPrimaria -
		espacioDeCirculacion -
		espacioDeCirculacion -
		entrance -
		_bathroom;
	const aulasEnTop = Math.floor(espacioDisponibleTop / anchoAula);
	//console.log("aulas en top::::", aulasEnTop);

	const nivelesConPosiciones = {
		secundaria: {
			x: 0,
			y: 0,
			z: -aulasEnTop * 300,
			r: 0,
		},
		primaria: {
			x: 0,
			y: 0,
			z: aulasEnTop * 300,
			r: 0,
		},
		inicial: { x: 0, y: 0, z: 0, r: 0 }, // Puedes ajustar esta posición como desees
	};

	Object.entries(nivelesConPosiciones).forEach(([nivel, pos]) => {
		let aulas = aulasPorNivel[nivel] || [];

		const pisos = Number(numberFloors);
		let aulasRestantes = [...aulas];

		// Recalcular aulasPorPiso cada vez
		let _aulasPorPiso = Math.floor(espacioParaAulas / 9);

		// Limitar aulas del nivel inicial si deseas
		if (nivel === "inicial") {
			_aulasPorPiso = Math.min(_aulasPorPiso, aulasEnTop) - 1;
		}

		if (nivel === "secundaria" || nivel === "primaria") {
			_aulasPorPiso = Math.max(_aulasPorPiso - 1, 0); // nueva logica para el espacio
		}

		let ambientesExtraNivel = [];

		if (nivel === "secundaria") {
			if (biblioteca)
				ambientesExtraNivel.push(biblioteca.ambienteComplementario);
			if (almacen)
				ambientesExtraNivel.push(almacen.ambienteComplementario);
		}

		if (nivel === "primaria") {
			if (tallerCreativo)
				ambientesExtraNivel.push(tallerCreativo.ambienteComplementario);
			if (laboratorio)
				ambientesExtraNivel.push(laboratorio.ambienteComplementario);
		}

		if (nivel === "inicial") {
			if (psicomotricidad)
				ambientesExtraNivel.push(
					psicomotricidad.ambienteComplementario
				);
		}

		let floors = [];

		for (let i = 0; i < pisos; i++) {
			let aulasFloor = [];

			// Primer piso: agregar ambientes complementarios
			if (i === 0) {
				const espacioDisponible =
					_aulasPorPiso - ambientesExtraNivel.length;
				aulasFloor = aulasRestantes.splice(
					0,
					Math.max(espacioDisponible, 0)
				);
				floors.push({
					floor: i + 1,
					classrooms: aulasFloor,
					ambientesExtra: ambientesExtraNivel,
					baths: 1,
				});
			} else {
				const aulasEnEstePiso = aulasRestantes.splice(0, _aulasPorPiso);
				floors.push({
					floor: i + 1,
					classrooms: aulasEnEstePiso,
					ambientesExtra: [],
					baths: 0,
				});
			}
		}

		pabellones.push({
			position: [pos.x, pos.y, pos.z],
			rotation: [0, pos.r, 0],
			floors: floors,
			nivel: nivel, // Agregar identificador de nivel
		});
	});

	console.log("posicion del pabellon", pabellones);

	const aulasSecundaria = pabellones[0].floors;

	const aulasPrimaria =
		pabellones.find((p) => p.nivel === "primaria")?.floors || [];

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
					nivel={el.nivel}
					view={view}
					key={index}
					environment={complementaryEnvironment}
					length={length}
					_classrooms={aulasSecundaria}
					width={width}
					spaceEntrance={spaceEntrance}
					space={space}
					_classroomsPrimaria={aulasPrimaria}
					option={option}
					espacioDisponibleTop={espacioDisponibleTop}
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
		secundaria_8: { x: -1350, z: 1541 },
		primaria_8: { x: 1350, z: -1541 },
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
