import { useState, useCallback, useEffect } from "react";

export function useBIMData(initialConfig = {}) {
	// Estados principales del sistema BIM
	const [bimEnabled, setBimEnabled] = useState(
		initialConfig.enabled || false
	);
	const [selectedElement, setSelectedElement] = useState(null);
	const [editMode, setEditMode] = useState(false);
	const [showDimensions, setShowDimensions] = useState(true);
	const [showCosts, setShowCosts] = useState(false);
	const [northAngle, setNorthAngle] = useState(initialConfig.northAngle || 0);
	const [history, setHistory] = useState([]);
	const [historyIndex, setHistoryIndex] = useState(-1);

	// Base de datos de costos (configurable)
	const [costDatabase] = useState({
		aula: { costoM2: 850, moneda: "USD" },
		laboratorio: { costoM2: 1200, moneda: "USD" },
		biblioteca: { costoM2: 950, moneda: "USD" },
		bano: { costoM2: 1200, moneda: "USD" },
		escalera: { costoM2: 1500, moneda: "USD" },
		pasillo: { costoM2: 450, moneda: "USD" },
		taller: { costoM2: 900, moneda: "USD" },
		almacen: { costoM2: 600, moneda: "USD" },
		cocina: { costoM2: 1400, moneda: "USD" },
		sum: { costoM2: 1100, moneda: "USD" },
		ept: { costoM2: 950, moneda: "USD" },
		psicomotricidad: { costoM2: 1000, moneda: "USD" },
		muro: { costoM2: 180, moneda: "USD" },
	});

	// Manejar selección de elementos
	const handleElementSelect = useCallback((element) => {
		setSelectedElement(element);
		console.log("🏗️ Elemento seleccionado:", element);
	}, []);

	// Alternar modo de edición
	const toggleEditMode = useCallback(() => {
		setEditMode((prev) => !prev);
		if (!editMode) {
			setSelectedElement(null); // Limpiar selección al salir del modo edición
		}
	}, [editMode]);

	// Rotar norte magnético
	const rotateNorth = useCallback((angle) => {
		setNorthAngle(angle % 360);
	}, []);

	// Guardar en historial para undo/redo
	const saveToHistory = useCallback(
		(data) => {
			const newHistory = history.slice(0, historyIndex + 1);
			newHistory.push(JSON.parse(JSON.stringify(data)));
			setHistory(newHistory);
			setHistoryIndex(newHistory.length - 1);
		},
		[history, historyIndex]
	);

	// Undo
	const undo = useCallback(() => {
		if (historyIndex > 0) {
			setHistoryIndex(historyIndex - 1);
			return history[historyIndex - 1];
		}
		return null;
	}, [history, historyIndex]);

	// Redo
	const redo = useCallback(() => {
		if (historyIndex < history.length - 1) {
			setHistoryIndex(historyIndex + 1);
			return history[historyIndex + 1];
		}
		return null;
	}, [history, historyIndex]);

	// Exportar datos BIM
	const exportBIMData = useCallback(
		(format = "json") => {
			const bimData = {
				proyecto: "Colegio BIM",
				fecha: new Date().toISOString(),
				configuracion: {
					bimEnabled,
					editMode,
					showDimensions,
					showCosts,
					northAngle,
				},
				elementoSeleccionado: selectedElement,
				costDatabase,
				version: "1.0.0",
			};

			switch (format) {
				case "json":
					const blob = new Blob([JSON.stringify(bimData, null, 2)], {
						type: "application/json",
					});
					const url = URL.createObjectURL(blob);
					const a = document.createElement("a");
					a.href = url;
					a.download = `proyecto_bim_${
						new Date().toISOString().split("T")[0]
					}.json`;
					a.click();
					URL.revokeObjectURL(url);
					break;

				case "csv":
					// Implementar exportación CSV si es necesario
					console.log("Exportación CSV en desarrollo");
					break;

				default:
					console.log("Formato no soportado:", format);
			}
		},
		[
			bimEnabled,
			editMode,
			showDimensions,
			showCosts,
			northAngle,
			selectedElement,
			costDatabase,
		]
	);

	// Calcular costos totales de elementos
	const calculateTotalCosts = useCallback((elementos = []) => {
		let costoTotal = 0;
		let areaTotal = 0;
		let desglose = {};

		elementos.forEach((elemento) => {
			if (elemento.bim && elemento.bim.activo) {
				costoTotal += elemento.bim.costo || 0;
				areaTotal += elemento.bim.area || 0;

				const tipo = elemento.bim.tipo;
				if (!desglose[tipo]) {
					desglose[tipo] = { cantidad: 0, area: 0, costo: 0 };
				}
				desglose[tipo].cantidad++;
				desglose[tipo].area += elemento.bim.area || 0;
				desglose[tipo].costo += elemento.bim.costo || 0;
			}
		});

		return { costoTotal, areaTotal, desglose };
	}, []);

	// Configurar herramientas CAD
	const cadTools = {
		measure: false,
		dimension: showDimensions,
		cost: showCosts,
		north: true,
	};

	// Log de cambios para debugging
	useEffect(() => {
		if (selectedElement) {
			console.log("📊 BIM Info:", {
				elemento: selectedElement.nombre,
				tipo: selectedElement.tipo,
				area: selectedElement.area,
				costo: selectedElement.costo,
			});
		}
	}, [selectedElement]);

	// Estado del panel de control BIM
	const [panelVisible, setPanelVisible] = useState(false);

	return {
		// Estados principales
		bimEnabled,
		setBimEnabled,
		selectedElement,
		setSelectedElement,
		editMode,
		setEditMode,
		showDimensions,
		setShowDimensions,
		showCosts,
		setShowCosts,
		northAngle,
		setNorthAngle,

		// Base de datos
		costDatabase,

		// Funciones de control
		handleElementSelect,
		toggleEditMode,
		rotateNorth,

		// Historial
		saveToHistory,
		undo,
		redo,
		canUndo: historyIndex > 0,
		canRedo: historyIndex < history.length - 1,

		// Herramientas
		cadTools,

		// Utilidades
		exportBIMData,
		calculateTotalCosts,

		// Panel de control
		panelVisible,
		setPanelVisible,
	};
}

// Hook simplificado para casos básicos
// export function useBasicBIM() {
// 	const [selectedElement, setSelectedElement] = useState(null);
// 	const [editMode, setEditMode] = useState(false);

// 	const handleElementSelect = useCallback((element) => {
// 		setSelectedElement(element);
// 	}, []);

// 	const toggleEditMode = useCallback(() => {
// 		setEditMode(prev => !prev);
// 		if (!editMode) setSelectedElement(null);
// 	}, [editMode]);

// 	return {
// 		selectedElement,
// 		editMode,
// 		handleElementSelect,
// 		toggleEditMode
// 	};
// }
