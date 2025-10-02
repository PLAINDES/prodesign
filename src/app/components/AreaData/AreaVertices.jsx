const AreaVertices = (vertices) => {
	// Add safety check to ensure vertices is an array
	const safeVertices = Array.isArray(vertices) ? vertices : [];

	if (!safeVertices || safeVertices.length < 3) {
		return { area: 0, perimetro: 0, largo: 0, ancho: 0 };
	}

	const closedVertices =
		safeVertices[0][0] === safeVertices[safeVertices.length - 1][0] &&
		safeVertices[0][1] === safeVertices[safeVertices.length - 1][1]
			? safeVertices
			: [...safeVertices, safeVertices[0]];

	// Calcular Área (fórmula del polígono de Shoelace)
	let area = 0;
	const n = safeVertices.length;
	for (let i = 0; i < n; i++) {
		const [x1, y1] = safeVertices[i];
		const [x2, y2] = safeVertices[(i + 1) % n];
		area += x1 * y2 - x2 * y1;
	}
	const areaAbs = Math.abs(area / 2);
	const areaRedondeada = Math.round(areaAbs * 100) / 100;

	// Calcular Perímetro
	let perimetro = 0;
	for (let i = 0; i < closedVertices.length - 1; i++) {
		const [x1, y1] = closedVertices[i];
		const [x2, y2] = closedVertices[i + 1];
		const distancia = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
		perimetro += distancia;
	}
	const perimetroRedondeado = Math.round(perimetro * 100) / 100;

	// Calcular largo y ancho del bounding box
	const xs = safeVertices.map(([x]) => x);
	const ys = safeVertices.map(([, y]) => y);
	const ancho = Math.round((Math.max(...xs) - Math.min(...xs)) * 100) / 100;
	const largo = Math.round((Math.max(...ys) - Math.min(...ys)) * 100) / 100;

	return {
		area: areaRedondeada,
		perimetro: perimetroRedondeado,
		largo,
		ancho,
	};
};
export default AreaVertices;
