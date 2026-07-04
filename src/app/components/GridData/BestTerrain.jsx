import {
	polygon,
	bbox,
	booleanContains,
	centroid,
	transformRotate,
} from "@turf/turf";
//COMPONENTE DE GRAFICA DE AREA DEL TERRENO
const BestTerrain = (verDispo, resolucion = 15, rotacionMaxima = 35) => {
	const poligonoDisponible = polygon([verDispo]);

	const [minx, miny, maxx, maxy] = bbox(poligonoDisponible);
	const stepX = (maxx - minx) / resolucion;
	const stepY = (maxy - miny) / resolucion;

	let mejorRectangulo = null;
	let mejorArea = 0;

	for (let x = minx; x <= maxx; x += stepX) {
		for (let y = miny; y <= maxy; y += stepY) {
			for (
				let angle = -rotacionMaxima;
				angle <= rotacionMaxima;
				angle += 5
			) {
				for (let width = stepX; width <= maxx - minx; width += stepX) {
					for (
						let height = stepY;
						height <= maxy - miny;
						height += stepY
					) {
						const rect = polygon([
							[
								[x - width / 2, y - height / 2],
								[x - width / 2, y + height / 2],
								[x + width / 2, y + height / 2],
								[x + width / 2, y - height / 2],
								[x - width / 2, y - height / 2],
							],
						]);

						console.log("result:", rect);
						const rectRotado = transformRotate(rect, angle, {
							pivot: centroid(rect),
						});

						if (booleanContains(poligonoDisponible, rectRotado)) {
							const area = turf.area(rectRotado);
							if (area > mejorArea) {
								mejorArea = area;
								mejorRectangulo =
									rectRotado.geometry.coordinates[0];
							}
						}
					}
				}
			}
		}
	}

	return mejorRectangulo ? [mejorRectangulo] : [];
};

export default BestTerrain;
