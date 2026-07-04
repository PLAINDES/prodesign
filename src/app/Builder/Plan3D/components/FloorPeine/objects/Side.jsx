import { Shape } from "three";

export default function Side({
	position,
	classrooms,
	floor,
	side,
	_classroom,
	floorsLength,
	view,
	environment,
	// Props de selección
	onAulaSelect,
	onAulaHover,
	onAulaHoverEnd,
	selectedAula,
	hoveredAula,
	_bathroom,
}) {
	const isTop = side === "top";
	const length = classrooms.length * 415;

	console.log("classrom para ambientes :::", classrooms);

	const corridor = new Shape();
	corridor.moveTo(0, 0);
	corridor.lineTo(0, length);
	corridor.lineTo(120, length);
	corridor.lineTo(120, 0);
	corridor.closePath();

	const baranda = new Shape();
	baranda.moveTo(0, 0);
	baranda.lineTo(0, length);
	baranda.lineTo(60, length);
	baranda.lineTo(60, 0);
	baranda.closePath();

	// Función para verificar si un aula está seleccionada
	const isAulaSelected = (classroom) => {
		if (!selectedAula) return false;

		const selectedId = `${selectedAula.level}-${selectedAula.index}-${selectedAula.floor}`;
		const classroomId = `${classroom.level}-${classroom.n}-${classroom.floor}`;

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
		<group position={position}>
			{classrooms.map((x) => {
				// Verificar si es un aula que puede ser seleccionada
				const isClassroom =
					x.room &&
					x.level !== "baño" &&
					x.level !== "entrance" &&
					!x.level?.includes("Psicomotricidad");

				return (
					<x.room
						key={x.n}
						position={x.position}
						rotation={x.rotation}
						level={x.level}
						classroom={_classroom}
						view={view}
						environment={environment}
						index={x.n}
						floor={x.floor}
						bathroom={_bathroom} // ← Prop adicional para SSHH
						// Solo pasar props de selección si es un aula
						{...(isClassroom && {
							onSelect: onAulaSelect,
							onHover: onAulaHover,
							onHoverEnd: onAulaHoverEnd,
							isSelected: isAulaSelected(x),
							isHovered: isAulaHovered(x),
						})}
					/>
				);
			})}

			{/* Barandas y pasillos del peine */}
			{view.view === "3D" &&
				false && ( // Cambiado a false para eliminar barandas
					<group
						position={[
							isTop ? _classroom.width : -_classroom.width - 120,
							0,
							0,
						]}
						rotation={[Math.PI / 2, 0, 0]}
					>
						{/* Pasillo */}
						<mesh>
							<extrudeGeometry
								args={[
									corridor,
									{
										depth: 7.5,
										bevelEnabled: false,
									},
								]}
							/>
							<meshStandardMaterial color="gray" />
						</mesh>

						{/* Baranda */}
						<group
							position={[isTop ? 112.5 : 0, 0, 0]}
							rotation={[0, Math.PI / 2, 0]}
						>
							<mesh>
								<extrudeGeometry
									args={[
										baranda,
										{ depth: 7.5, bevelEnabled: false },
									]}
								/>
								<meshStandardMaterial />
							</mesh>
							<mesh
								position={[0, length, 0]}
								rotation={[
									isTop ? Math.PI / -2 : Math.PI / 2,
									0,
									0,
								]}
							>
								<extrudeGeometry
									args={[
										closePeine,
										{ depth: 7.5, bevelEnabled: false },
									]}
								/>
								<meshStandardMaterial />
							</mesh>
						</group>
					</group>
				)}
		</group>
	);
}

const closePeine = new Shape();
closePeine.moveTo();
closePeine.lineTo(0, 120);
closePeine.lineTo(60, 120);
closePeine.lineTo(60, 0);
closePeine.closePath();

// import { Shape } from "three";

// export default function Side({
// 	position,
// 	classrooms,
// 	floor,
// 	side,
// 	_classroom,
// 	floorsLength,
// 	view,
// 	environment,
// 	_bathroom,
// }) {
// 	const isTop = side === "top";
// 	const length = classrooms.length * 415;

// 	const corridor = new Shape();
// 	corridor.moveTo(0, 0);
// 	corridor.lineTo(0, length);
// 	corridor.lineTo(120, length);
// 	corridor.lineTo(120, 0);
// 	corridor.closePath();

// 	const baranda = new Shape();
// 	baranda.moveTo(0, 0);
// 	baranda.lineTo(0, length);
// 	baranda.lineTo(60, length);
// 	baranda.lineTo(60, 0);
// 	baranda.closePath();

// 	return (
// 		<group position={position}>
// 			{classrooms.map((x) => (
// 				// <ClassroomGroup
// 				<x.room
// 					key={x.n}
// 					position={x.position}
// 					rotation={x.rotation}
// 					level={x.level}
// 					classroom={_classroom}
// 					view={view}
// 					environment={environment}
// 					bathroom={_bathroom} // ← Prop adicional para SSHH
// 				/>
// 			))}

// 			{/* Barandas y pasillos del peine */}
// 			{view.view === "3D" &&
// 				false && ( // floor.floor < _floors.length
// 					<group
// 						position={[
// 							isTop ? _classroom.width : -_classroom.width - 120,
// 							0,
// 							0,
// 						]}
// 						rotation={[Math.PI / 2, 0, 0]}
// 					>
// 						{/* Pasillo */}
// 						<mesh>
// 							<extrudeGeometry
// 								args={[
// 									corridor,
// 									{
// 										depth: 7.5 /* 7.5 */,
// 										bevelEnabled: false,
// 									},
// 								]}
// 							/>
// 							<meshStandardMaterial color="gray" />
// 						</mesh>

// 						{/* Baranda */}
// 						<group
// 							position={[isTop ? 112.5 : 0, 0, 0]}
// 							rotation={[0, Math.PI / 2, 0]}
// 						>
// 							<mesh>
// 								<extrudeGeometry
// 									args={[
// 										baranda,
// 										{ depth: 7.5, bevelEnabled: false },
// 									]}
// 								/>
// 								<meshStandardMaterial />
// 							</mesh>
// 							{/**
// 							 * Cerrar
// 							 *
// 							 * Note: Solo se cierra de un lado
// 							 */}
// 							<mesh
// 								position={[0, length, 0]}
// 								rotation={[
// 									isTop ? Math.PI / -2 : Math.PI / 2,
// 									0,
// 									0,
// 								]}
// 							>
// 								<extrudeGeometry
// 									args={[
// 										closePeine,
// 										{ depth: 7.5, bevelEnabled: false },
// 									]}
// 								/>
// 								<meshStandardMaterial />
// 							</mesh>
// 						</group>
// 					</group>
// 				)}
// 		</group>
// 	);
// }

// const closePeine = new Shape();
// closePeine.moveTo();
// closePeine.lineTo(0, 120);
// closePeine.lineTo(60, 120);
// closePeine.lineTo(60, 0);
// closePeine.closePath();
