// Prueba unitaria para la lógica de transformaciones geométricas y escalado de SVG
// Usado en los componentes PoligonoChart y RectangleChart de NewProjectForm.jsx

describe("Pruebas Unitarias de Bounding Box y Proyección SVG", () => {
	// Función pura equivalente a la del componente
	const calculateBBox = (vertices) => {
		if (!vertices.length) return { minX: 0, maxX: 100, minY: 0, maxY: 100, w: 100, h: 100 };
		const xs = vertices.map((p) => p[0]);
		const ys = vertices.map((p) => p[1]);
		const minX = Math.min(...xs);
		const maxX = Math.max(...xs);
		const minY = Math.min(...ys);
		const maxY = Math.max(...ys);
		return { minX, maxX, minY, maxY, w: maxX - minX, h: maxY - minY };
	};

	// Función pura equivalente a la de proyección SVG
	const createSvgConfig = (bbox) => {
		const pad = Math.max(bbox.w, bbox.h) * 0.15 || 10;
		const minX = bbox.minX - pad;
		const minY = bbox.minY - pad;
		const viewW = bbox.w + pad * 2;
		const viewH = bbox.h + pad * 2;
		const toSvg = ([x, y]) => ({ x: x, y: minY + viewH - (y - minY) });
		return { minX, minY, viewW, viewH, toSvg };
	};

	test("Debe calcular correctamente el Bounding Box de un polígono irregular", () => {
		const vertices = [
			[10, 90],
			[50, 100],
			[90, 80],
			[80, 20],
			[20, 30],
		];
		const bbox = calculateBBox(vertices);

		expect(bbox.minX).toBe(10);
		expect(bbox.maxX).toBe(90);
		expect(bbox.minY).toBe(20);
		expect(bbox.maxY).toBe(100);
		expect(bbox.w).toBe(80); // 90 - 10
		expect(bbox.h).toBe(80); // 100 - 20
	});

	test("Debe invertir el eje Y y proyectar correctamente las coordenadas en el SVG", () => {
		const vertices = [
			[10, 90],
			[90, 20],
		];
		const bbox = calculateBBox(vertices);
		const svgConfig = createSvgConfig(bbox);

		// Calcular el padding esperado
		const pad = 80 * 0.15; // 12
		expect(svgConfig.minX).toBe(10 - pad);
		expect(svgConfig.minY).toBe(20 - pad);
		expect(svgConfig.viewW).toBe(80 + pad * 2);
		expect(svgConfig.viewH).toBe(70 + pad * 2);

		// Proyectar un punto
		const p1 = [10, 90];
		const s1 = svgConfig.toSvg(p1);

		// El eje X se proyecta igual
		expect(s1.x).toBe(10);
		// El eje Y debe ser invertido: minY + viewH - (y - minY)
		// minY = 8, viewH = 94, y = 90
		// 8 + 94 - (90 - 8) = 102 - 82 = 20
		expect(s1.y).toBe(20);
	});

	test("Debe retornar valores por defecto si no se le pasan vértices", () => {
		const bbox = calculateBBox([]);
		expect(bbox.w).toBe(100);
		expect(bbox.h).toBe(100);
	});
});
