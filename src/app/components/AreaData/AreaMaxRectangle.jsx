const AreaMaxRectangle = (vertices) => {
	// Add safety check to ensure vertices is an array
	const safeVertices = Array.isArray(vertices) ? vertices : [];

	// If no valid vertices, return default values
	if (safeVertices.length === 0) {
		return {
			width: 0,
			length: 0,
			areaMax: 0,
			perimetro: 0,
		};
	}

	// Extraer coordenadas X e Y por separado
	const xs = safeVertices.map((v) => v[0]);
	const ys = safeVertices.map((v) => v[1]);

	const minX = Math.min(...xs);
	const maxX = Math.max(...xs);
	const minY = Math.min(...ys);
	const maxY = Math.max(...ys);

	const width = Math.abs(maxX - minX);
	const length = Math.abs(maxY - minY);
	const areaMax = width * length;
	const perimetro = 2 * (width + length);

	return {
		width,
		length,
		areaMax,
		perimetro,
	};
};

export default AreaMaxRectangle;
