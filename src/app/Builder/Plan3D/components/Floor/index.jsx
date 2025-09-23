import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { Shape } from "three";
import Corridor from "./objects/Corridor";

export default function Floor({
	classrooms,
	bathroom,
	stairs,
	floor,
	haveCorridor,
	havePeine,
	_classroom,
	_bathroom,
	_stairs,
	view,
	pab,
	length,
	// Props de selección
	onAulaSelect,
	onAulaHover,
	onAulaHoverEnd,
	selectedAula,
	hoveredAula,
	name,
}) {
	const selectedFloor = useSelector(
		(state) => state.building["floor" + floor]
	);
	console.log("_classroom_sdadas", classrooms);

	const ref = useRef();

	const pabLength =
		415 * (classrooms.length + getBathroom(bathroom)) + getStairs(stairs);

	const corridor = new Shape();
	corridor.moveTo(0, 0);
	corridor.lineTo(0, 120);
	corridor.lineTo(-pabLength, 120);
	corridor.lineTo(-pabLength, 0);
	corridor.closePath();

	const baranda = new Shape();
	baranda.moveTo(0, 0);
	baranda.lineTo(0, 60);
	baranda.lineTo(-pabLength, 60);
	baranda.lineTo(-pabLength, 0);
	baranda.closePath();

	const barandaWhenPeine1 = new Shape();
	barandaWhenPeine1.moveTo(0, 0);
	barandaWhenPeine1.lineTo(0, 60);
	barandaWhenPeine1.lineTo(
		(-pabLength + _classroom.width) / 2 + (_classroom.width + 120),
		60
	);
	barandaWhenPeine1.lineTo(
		(-pabLength + _classroom.width) / 2 + (_classroom.width + 120),
		0
	);
	barandaWhenPeine1.closePath();

	const barandaWhenPeine2 = new Shape();
	barandaWhenPeine2.moveTo(0, 0);
	barandaWhenPeine2.lineTo(0, 60);
	barandaWhenPeine2.lineTo(
		(-pabLength + _classroom.width) / 2 + (_classroom.width + 120 * 2),
		60
	);
	barandaWhenPeine2.lineTo(
		(-pabLength + _classroom.width) / 2 + (_classroom.width + 120 * 2),
		0
	);
	barandaWhenPeine2.closePath();

	// Función para verificar si un aula está seleccionada
	const isAulaSelected = (classroom) => {
		if (!selectedAula) {
			//console.log("No hay selectedAula");
			return false;
		}

		const aulaFloor = classroom.floor || floor; // Usar floor del classroom o del prop
		// Crear IDs únicos para comparar
		// const selectedId = `${selectedAula.level}-${selectedAula.index}-${selectedAula.floor}`;
		// const classroomId = `${classroom.level}-${classroom.n}-${classroom.floor}`;
		const selectedId = `${selectedAula.level}-${selectedAula.index}-${selectedAula.floor}`;
		const classroomId = `${classroom.level}-${classroom.n}-${aulaFloor}`;

		console.log("Floor - Comparing selection:", {
			selectedAula,
			classroom: {
				level: classroom.level,
				n: classroom.n,
				floor: classroom.floor,
			},
			selectedId,
			classroomId,
			match: selectedId === classroomId,
		});

		return selectedId === classroomId;
	};

	// Función para verificar si un aula está en hover
	const isAulaHovered = (classroom) => {
		if (!hoveredAula) return false;

		const hoveredId = `${hoveredAula.level}-${hoveredAula.index}-${hoveredAula.floor}`;
		const classroomId = `${classroom.level}-${classroom.n}-${classroom.floor}`;

		return hoveredId === classroomId;
	};

	return (
		<group ref={ref} visible={selectedFloor}>
			{classrooms.map((classroom) => {
				return (
					<classroom.room
						key={classroom.n}
						position={classroom.position}
						level={classroom.level}
						classroom={_classroom}
						view={view}
						lengthTerrain={length}
						index={classroom.n}
						floor={classroom.floor || floor} // Asegurar que floor esté definido
						// Props de selección
						onSelect={onAulaSelect}
						onHover={onAulaHover}
						onHoverEnd={onAulaHoverEnd}
						isSelected={isAulaSelected(classroom)}
						isHovered={isAulaHovered(classroom)}
					/>
				);
			})}

			{bathroom && (
				<bathroom.room
					position={bathroom.position}
					baths={bathroom.baths}
					bathroom={_bathroom}
					classroom={classrooms}
					view={view}
				/>
			)}

			{stairs && (
				<stairs.room
					position={stairs.position}
					floor={stairs.floor}
					stairs={_stairs}
					view={view}
				/>
			)}

			{haveCorridor && view.view === "3D" && floor === 1 && (
				<Corridor
					_classroom={_classroom}
					_stairs={_stairs}
					floor={floor}
					corridor={corridor}
					baranda={baranda}
					barandaWhenPeine={barandaWhenPeine1}
					barandaWhenPeine2={barandaWhenPeine2}
					pabLength={pabLength}
					pab={pab}
					classrooms={classrooms}
				/>
			)}
		</group>
	);
}

const getBathroom = (bathroom) => Number(!!bathroom);
const getStairs = (stairs) => (stairs ? 120 : 0);
// import { useEffect, useRef } from "react";
// import { useSelector } from "react-redux";
// import { Shape } from "three";
// import Corridor from "./objects/Corridor";

// export default function Floor({
// 	classrooms,
// 	bathroom,
// 	stairs,
// 	floor,
// 	haveCorridor,
// 	havePeine,
// 	_classroom,
// 	_bathroom,
// 	_stairs,
// 	view,
// 	pab,
// 	length,
// }) {
// 	const selectedFloor = useSelector(
// 		(state) => state.building["floor" + floor]
// 	);
// 	console.log("_classroom_", classrooms);

// 	const ref = useRef();

// 	const pabLength =
// 		415 * (classrooms.length + getBathroom(bathroom)) + getStairs(stairs);

// 	const corridor = new Shape();
// 	corridor.moveTo(0, 0);
// 	corridor.lineTo(0, 120);
// 	corridor.lineTo(-pabLength, 120);
// 	corridor.lineTo(-pabLength, 0);
// 	corridor.closePath();

// 	const baranda = new Shape();
// 	baranda.moveTo(0, 0);
// 	baranda.lineTo(0, 60);
// 	baranda.lineTo(-pabLength, 60);
// 	baranda.lineTo(-pabLength, 0);
// 	baranda.closePath();

// 	const barandaWhenPeine1 = new Shape();
// 	barandaWhenPeine1.moveTo(0, 0);
// 	barandaWhenPeine1.lineTo(0, 60); // se le quita el ancho de un aula (la del medio (para ops math))
// 	barandaWhenPeine1.lineTo(
// 		(-pabLength + _classroom.width) / 2 + (_classroom.width + 120),
// 		60
// 	); // -(pabLength - ((_classroom.width + _stairs.width) * 3)) / 2
// 	barandaWhenPeine1.lineTo(
// 		(-pabLength + _classroom.width) / 2 + (_classroom.width + 120),
// 		0
// 	);
// 	barandaWhenPeine1.closePath();

// 	const barandaWhenPeine2 = new Shape();
// 	barandaWhenPeine2.moveTo(0, 0);
// 	barandaWhenPeine2.lineTo(0, 60); // se le quita el ancho de un aula (la del medio (para ops math))
// 	barandaWhenPeine2.lineTo(
// 		(-pabLength + _classroom.width) / 2 + (_classroom.width + 120 * 2),
// 		60
// 	); // -(pabLength - ((_classroom.width + _stairs.width) * 3)) / 2
// 	barandaWhenPeine2.lineTo(
// 		(-pabLength + _classroom.width) / 2 + (_classroom.width + 120 * 2),
// 		0
// 	);
// 	barandaWhenPeine2.closePath();

// 	return (
// 		<group ref={ref} visible={selectedFloor}>
// 			{classrooms.map((classroom) => (
// 				<classroom.room
// 					key={classroom.n}
// 					position={classroom.position}
// 					level={classroom.level}
// 					classroom={_classroom}
// 					view={view}
// 					lengthTerrain={length}
// 				/>
// 			))}

// 			{bathroom && (
// 				// <SSHH
// 				<bathroom.room
// 					position={bathroom.position}
// 					baths={bathroom.baths}
// 					bathroom={_bathroom}
// 					classroom={classrooms}
// 					view={view}
// 				/>
// 			)}

// 			{stairs && (
// 				// <Stairs
// 				<stairs.room
// 					position={stairs.position}
// 					floor={stairs.floor}
// 					stairs={_stairs}
// 					view={view}
// 				/>
// 			)}

// 			{haveCorridor && view.view === "3D" && (
// 				<Corridor
// 					_classroom={_classroom}
// 					_stairs={_stairs}
// 					floor={floor}
// 					corridor={corridor}
// 					baranda={baranda}
// 					barandaWhenPeine={barandaWhenPeine1}
// 					barandaWhenPeine2={barandaWhenPeine2}
// 					pabLength={pabLength}
// 					//havePeine={havePeine}
// 					pab={pab}
// 					// buscar otra manera
// 					classrooms={classrooms}
// 				/>
// 			)}
// 		</group>
// 	);
// }

// const getBathroom = (bathroom) => Number(!!bathroom);
// const getStairs = (stairs) => (stairs ? 120 : 0);
