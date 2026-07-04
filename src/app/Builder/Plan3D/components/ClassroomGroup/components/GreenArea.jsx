import { useMemo } from "react";
import { Shape, Path } from "three";

export default function GreenArea({
	vertices = [],
	rectangleVertices = [],
	centerEasting,
	centerNorthing,
	SCALE_FACTOR = 80,
}) {
	// polígono del terreno
	const shapeCoords = vertices.map(([e, n]) => [
		(e - centerEasting) * SCALE_FACTOR,
		(n - centerNorthing) * SCALE_FACTOR,
	]);

	// rectángulo del colegio
	const rectCoords = rectangleVertices.map(([e, n]) => [
		(e - centerEasting) * SCALE_FACTOR,
		(n - centerNorthing) * SCALE_FACTOR,
	]);

	const greenShape = useMemo(() => {
		const shape = new Shape();

		// polígono principal (terreno)
		shape.moveTo(shapeCoords[0][0], shapeCoords[0][1]);
		shapeCoords.forEach(([x, y]) => shape.lineTo(x, y));
		shape.lineTo(shapeCoords[0][0], shapeCoords[0][1]);

		// agujero: rectángulo del colegio
		const holePath = new Path();
		holePath.moveTo(rectCoords[0][0], rectCoords[0][1]);
		rectCoords.forEach(([x, y]) => holePath.lineTo(x, y));
		holePath.lineTo(rectCoords[0][0], rectCoords[0][1]);

		shape.holes.push(holePath);

		return shape;
	}, [shapeCoords, rectCoords]);

	return (
		<mesh rotation={[0, 0, 0]}>
			<shapeGeometry args={[greenShape]} />
			<meshStandardMaterial color="#3b7a3b" /> {/* césped verde */}
		</mesh>
	);
}
