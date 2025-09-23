import { useSelector } from "react-redux";
import Side from "./objects/Side";

export default function FloorPeine({
	sides,
	floor,
	_classroom,
	floorsLength,
	view,
	environment,
	_bathroom,
	// Props de selección
	onAulaSelect,
	onAulaHover,
	onAulaHoverEnd,
	selectedAula,
	hoveredAula,
}) {
	const selectedFloor = useSelector(
		(state) => state.building["floor" + floor]
	);

	return (
		<group visible={selectedFloor}>
			{sides.map((side, index) => (
				<Side
					key={index}
					position={side.position}
					classrooms={side.classrooms}
					floor={floor}
					side={side.side}
					_classroom={_classroom}
					floorsLength={floorsLength}
					view={view}
					environment={environment}
					_bathroom={_bathroom}
					// Props de selección
					onAulaSelect={onAulaSelect}
					onAulaHover={onAulaHover}
					onAulaHoverEnd={onAulaHoverEnd}
					selectedAula={selectedAula}
					hoveredAula={hoveredAula}
				/>
			))}
		</group>
	);
}
