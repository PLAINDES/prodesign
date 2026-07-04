import { useState } from "react";
import * as THREE from "three";
import { SelectionOutline } from "../Pabellones/components/BIM/SelectionOutline";

export default function SchoolDirection({
	position = [0, 0, 0],
	rotation = [0, 0, 0],
	dimensions = { width: 220, depth: 160, height: 90 },
	name = "Dirección",
	onSelect,
	onHover,
	onHoverEnd,
	isSelected,
	isHovered,
}) {
	const [localHovered, setLocalHovered] = useState(false);

	// Materiales
	const wallMaterial = new THREE.MeshStandardMaterial({ color: "#f4f1de" });
	const roofMaterial = new THREE.MeshStandardMaterial({ color: "#6d6875" });
	const glassMaterial = new THREE.MeshStandardMaterial({
		color: "#90e0ef",
		transparent: true,
		opacity: 0.6,
	});
	const doorMaterial = new THREE.MeshStandardMaterial({ color: "#8b5e3c" });

	const handleClick = (e) => {
		e.stopPropagation();
		onSelect?.({
			type: "school-direction",
			name,
			position,
			area: dimensions.width * dimensions.depth,
		});
	};

	const handlePointerEnter = (e) => {
		e.stopPropagation();
		setLocalHovered(true);
		document.body.style.cursor = "pointer";
		onHover?.({ type: "school-direction", name });
	};

	const handlePointerLeave = (e) => {
		e.stopPropagation();
		setLocalHovered(false);
		document.body.style.cursor = "default";
		onHoverEnd?.();
	};

	return (
		<group
			position={position}
			rotation={rotation}
			userData={{ type: "school-direction", name }}
			onClick={handleClick}
			onPointerEnter={handlePointerEnter}
			onPointerLeave={handlePointerLeave}
		>
			{/* Paredes */}
			<mesh material={wallMaterial} position={[0, 0, 0]}>
				<boxGeometry
					args={[
						dimensions.width,
						dimensions.height,
						dimensions.depth,
					]}
				/>
			</mesh>

			{/* Techo */}
			<mesh
				material={roofMaterial}
				position={[0, dimensions.height / 2 + 5, 0]}
			>
				<boxGeometry
					args={[dimensions.width + 10, 10, dimensions.depth + 10]}
				/>
			</mesh>

			{/* Puerta */}
			<mesh
				material={doorMaterial}
				position={[
					0,
					-dimensions.height / 4,
					dimensions.depth / 2 + 0.1,
				]}
			>
				<boxGeometry args={[40, 50, 4]} />
			</mesh>

			{/* Ventanas frontales */}
			<mesh
				material={glassMaterial}
				position={[
					-dimensions.width / 4,
					0,
					dimensions.depth / 2 + 0.1,
				]}
			>
				<boxGeometry args={[30, 30, 2]} />
			</mesh>
			<mesh
				material={glassMaterial}
				position={[dimensions.width / 4, 0, dimensions.depth / 2 + 0.1]}
			>
				<boxGeometry args={[30, 30, 2]} />
			</mesh>

			{/* Ventanas laterales */}
			<mesh
				material={glassMaterial}
				position={[-dimensions.width / 2 - 0.1, 0, 0]}
				rotation={[0, Math.PI / 2, 0]}
			>
				<boxGeometry args={[30, 30, 2]} />
			</mesh>
			<mesh
				material={glassMaterial}
				position={[dimensions.width / 2 + 0.1, 0, 0]}
				rotation={[0, Math.PI / 2, 0]}
			>
				<boxGeometry args={[30, 30, 2]} />
			</mesh>

			{/* Selección */}
			{isSelected && (
				<SelectionOutline
					geometry={
						new THREE.BoxGeometry(
							dimensions.width,
							dimensions.height,
							dimensions.depth
						)
					}
					color="#00ff00"
					animated
				/>
			)}

			{/* Hover */}
			{(isHovered || localHovered) && !isSelected && (
				<SelectionOutline
					geometry={
						new THREE.BoxGeometry(
							dimensions.width,
							dimensions.height,
							dimensions.depth
						)
					}
					color="#ffff00"
				/>
			)}
		</group>
	);
}
