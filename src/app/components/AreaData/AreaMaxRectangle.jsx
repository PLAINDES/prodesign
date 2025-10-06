const AreaMaxRectangle = (vertices) => {
	const xs = vertices.map((v) => v[0]);
	const ys = vertices.map((v) => v[1]);

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
