import * as turf from "@turf/turf";

const MaxRectangleWithPriority = (verDispo, priorityVertices) => {
	// Validación del polígono
	if (!verDispo || verDispo.length < 3) {
		console.error("❌ Error: verDispo no es un polígono válido.", verDispo);
		return [];
	}

	// Validación de vértices prioritarias
	if (!priorityVertices || priorityVertices.length === 0) {
		console.error(
			"❌ Error: No hay vértices prioritarios.",
			priorityVertices
		);
		return [];
	}

	// Crear el polígono disponible usando Turf.js
	const poligonoDisponible = turf.polygon([verDispo.concat([verDispo[0]])]);

	let mejorArea = 0;
	let mejorRectangulo = null;

	// Iterar sobre cada vértice prioritario
	for (const vertice of priorityVertices) {
		console.log("📌 Probando vértice prioritario:", vertice);

		// Verificar si el vértice prioritario está en el borde del polígono
		const puntoPrioritario = turf.point(vertice);
		const estaEnElBorde = verificarSiEstaEnElBorde(
			puntoPrioritario,
			poligonoDisponible
		);

		if (!estaEnElBorde) {
			console.warn(
				"⚠️ El vértice prioritario no está en el borde del polígono:",
				vertice
			);
			continue;
		}

		// Buscar el rectángulo máximo que incluye el vértice prioritario
		const rectangulo = buscarRectanguloMaximo(vertice, poligonoDisponible);

		if (rectangulo) {
			const areaRectangulo = turf.area(rectangulo);

			// Actualizar el mejor rectángulo si el área es mayor
			if (areaRectangulo > mejorArea) {
				mejorArea = areaRectangulo;
				mejorRectangulo = rectangulo;
				console.log(
					"✅ Nuevo mejor rectángulo encontrado:",
					mejorRectangulo.geometry.coordinates[0]
				);
			}
		}
	}

	if (!mejorRectangulo) {
		console.warn("⚠️ No se pudo calcular un rectángulo válido.");
		return [];
	}

	return mejorRectangulo.geometry.coordinates[0];
};

// Función para verificar si un punto está en el borde del polígono
const verificarSiEstaEnElBorde = (punto, poligono) => {
	const lineasDelPoligono = turf.polygonToLine(poligono);
	return turf.booleanPointOnLine(punto, lineasDelPoligono);
};

// Función para buscar el rectángulo máximo que incluye el vértice prioritario
const buscarRectanguloMaximo = (vertice, poligono) => {
	let mejorRectangulo = null;
	let mejorArea = 0;

	// Definir los límites de búsqueda
	const step = 0.1; // Paso de búsqueda (ajusta según sea necesario)
	const maxIteraciones = 100; // Límite de iteraciones para evitar bucles infinitos

	// Iterar sobre posibles anchos y altos
	for (let width = step; width <= 100; width += step) {
		for (let height = step; height <= 100; height += step) {
			// Crear el rectángulo
			const rectangulo = turf.polygon([
				[
					[vertice[0], vertice[1]],
					[vertice[0] + width, vertice[1]],
					[vertice[0] + width, vertice[1] - height],
					[vertice[0], vertice[1] - height],
					[vertice[0], vertice[1]],
				],
			]);

			// Verificar si el rectángulo está dentro del polígono
			if (turf.booleanWithin(rectangulo, poligono)) {
				const areaRectangulo = turf.area(rectangulo);

				// Actualizar el mejor rectángulo si el área es mayor
				if (areaRectangulo > mejorArea) {
					mejorArea = areaRectangulo;
					mejorRectangulo = rectangulo;
				}
			}
		}
	}

	return mejorRectangulo;
};

export default MaxRectangleWithPriority;
