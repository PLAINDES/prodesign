import * as turf from "@turf/turf";

/**
 * Encuentra los 3 mejores rectángulos máximos dentro de un polígono con rotación optimizada
 * @param {Array} verDispo - Array de vértices UTM del polígono disponible
 * @returns {Array} - Array de 3 rectángulos con sus coordenadas
 */
const MaxRectangle = (verDispo) => {
	// Crear polígono desde los vértices, asegurándose de cerrar el anillo
	const poligonoDisponible = turf.polygon([verDispo.concat([verDispo[0]])]);

	// Obtener los límites del polígono
	const bbox = turf.bbox(poligonoDisponible);
	const [minx, miny, maxx, maxy] = bbox;
	const centroPoligono = [(minx + maxx) / 2, (miny + maxy) / 2];

	// Array para guardar los 3 mejores rectángulos
	const mejoresRectangulos = [];

	// Probar diferentes ángulos de rotación (de 0 a 180 grados)
	// Incremento de 5 grados para un buen balance entre precisión y rendimiento
	for (let angulo = 0; angulo < Math.PI; angulo += Math.PI / 36) {
		// Puntos centrales de prueba (malla más fina)
		const pasoX = Math.max(1, (maxx - minx) / 15);
		const pasoY = Math.max(1, (maxy - miny) / 15);

		for (let x = minx; x <= maxx; x += pasoX) {
			for (let y = miny; y <= maxy; y += pasoY) {
				const centro = [x, y];

				// Búsqueda binaria para encontrar el tamaño óptimo del rectángulo
				let minWidth = 0;
				let maxWidth = 2 * Math.max(maxx - minx, maxy - miny);
				let minHeight = 0;
				let maxHeight = 2 * Math.max(maxx - minx, maxy - miny);

				// Optimizar anchura
				for (let i = 0; i < 10; i++) {
					const width = (minWidth + maxWidth) / 2;
					let isValid = false;

					// Optimizar altura para esta anchura
					let optimalHeight = 0;
					let lowHeight = minHeight;
					let highHeight = maxHeight;

					for (let j = 0; j < 10; j++) {
						const height = (lowHeight + highHeight) / 2;

						const rectVertices = crearRectanguloRotado(
							centro,
							width,
							height,
							angulo
						);
						const rectangulo = turf.polygon([rectVertices]);

						if (
							turf.booleanContains(poligonoDisponible, rectangulo)
						) {
							isValid = true;
							optimalHeight = height;
							lowHeight = height;
						} else {
							highHeight = height;
						}
					}

					if (isValid) {
						minWidth = width;
						const area = minWidth * optimalHeight;

						// Insertar el rectángulo en el array de mejores rectángulos
						insertarRectanguloEnMejores(mejoresRectangulos, {
							vertices: crearRectanguloRotado(
								centro,
								minWidth,
								optimalHeight,
								angulo
							),
							area: area,
							angulo: angulo,
						});
					} else {
						maxWidth = width;
					}
				}
			}
		}
	}

	//Devolver los vertices de los 3 mejores rectángulos (o menos si no se encuentran 3)
	// return mejoresRectangulos
	// 	.slice(0, 3)
	// 	.map((rectangulo) => rectangulo.vertices);
	return mejoresRectangulos.slice(0, 3).map((rectangulo) => ({
		vertices: rectangulo.vertices,
		angulo: rectangulo.angulo,
	}));
};

/**
 * Inserta un rectángulo en el array de mejores rectángulos
 * @param {Array} mejoresRectangulos - Array de mejores rectángulos
 * @param {Object} nuevoRectangulo - Nuevo rectángulo a insertar
 */
function insertarRectanguloEnMejores(mejoresRectangulos, nuevoRectangulo) {
	// Si hay menos de 3 rectángulos, agregar directamente
	if (mejoresRectangulos.length < 3) {
		mejoresRectangulos.push(nuevoRectangulo);
		mejoresRectangulos.sort((a, b) => b.area - a.area);
		return;
	}

	// Si el nuevo rectángulo es más grande que el más pequeño de los 3
	if (nuevoRectangulo.area > mejoresRectangulos[2].area) {
		// Reemplazar el más pequeño
		mejoresRectangulos[2] = nuevoRectangulo;
		// Reordenar
		mejoresRectangulos.sort((a, b) => b.area - a.area);
	}
}

/**
 * Crea los vértices de un rectángulo rotado
 * @param {Array} centro - Coordenadas del centro del rectángulo [x, y]
 * @param {Number} width - Ancho del rectángulo
 * @param {Number} height - Alto del rectángulo
 * @param {Number} angulo - Ángulo de rotación en radianes
 * @returns {Array} - Array de vértices del rectángulo rotado
 */
function crearRectanguloRotado(centro, width, height, angulo) {
	const halfWidth = width / 2;
	const halfHeight = height / 2;

	// Vértices del rectángulo sin rotar (relativo al centro)
	const vertices = [
		[-halfWidth, -halfHeight],
		[-halfWidth, halfHeight],
		[halfWidth, halfHeight],
		[halfWidth, -halfHeight],
	];

	// Rotar y trasladar los vértices
	const verticesRotados = vertices.map(([x, y]) => {
		const rotatedX = x * Math.cos(angulo) - y * Math.sin(angulo);
		const rotatedY = x * Math.sin(angulo) + y * Math.cos(angulo);

		return [centro[0] + rotatedX, centro[1] + rotatedY];
	});

	// Cerrar el polígono repitiendo el primer vértice
	verticesRotados.push(verticesRotados[0]);

	return verticesRotados;
}

export default MaxRectangle;
