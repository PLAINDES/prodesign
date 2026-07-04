import * as THREE from "three";

export function getRectFromCoords(coords) {
	if (!coords || coords.length !== 4) {
		throw new Error("Se requieren 4 coordenadas");
	}

	const pts = coords.map(([x, y]) => new THREE.Vector2(x, y));
	const center = pts
		.reduce((acc, p) => acc.add(p.clone()), new THREE.Vector2())
		.divideScalar(4);

	// calcular vectores entre consecutivos y longitudes
	const edges = pts.map((p, i) => {
		const next = pts[(i + 1) % pts.length];
		const vec = next.clone().sub(p);
		return { vec, len: vec.length(), i };
	});

	const lensSorted = edges
		.map((e) => e.len)
		.slice()
		.sort((a, b) => a - b);
	const width = lensSorted[0]; // lado corto
	const length = lensSorted[3] || lensSorted[2]; // lado largo (mayor)

	// tomar la arista más larga para la dirección/rotación
	let longEdge = edges[0];
	for (let e of edges) if (e.len > longEdge.len) longEdge = e;
	const rotation = Math.atan2(longEdge.vec.y, longEdge.vec.x); // radianes

	return {
		center: { x: center.x, y: center.y },
		width,
		length,
		rotation,
	};
}
