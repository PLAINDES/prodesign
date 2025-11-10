import React, { useEffect, useState } from "react";
import { Building2, AlertCircle, Upload, X } from "lucide-react";
import { Box, Button, Grid, Typography } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import DxfWriter from "dxf-writer";

export default function TerrainPlanner({ school }) {
	const [coordinates, setCoordinates] = useState([]);
	const [maxRectangle, setMaxRectangle] = useState(null);
	const [isCalculating, setIsCalculating] = useState(false);

	// Configuración de aulas por nivel
	const [distribution, setDistribution] = useState(null);
	const [capacityInfo, setCapacityInfo] = useState(null);
	// ZOOM
	const [zoom, setZoom] = useState(1);
	const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
	const [isDragging, setIsDragging] = useState(false);
	const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

	// Para carga masiva
	const [showBulkInput, setShowBulkInput] = useState(false);

	const [totalFloors, setTotalFloors] = useState(1);
	const currentFloor = useSelector((state) => state.building.floor);

	const [layoutMode, setLayoutMode] = useState("horizontal");

	//estados para el hover de ambientes complementarios
	const [hoveredAmbiente, setHoveredAmbiente] = useState(null);
	const [hoveredLateral, setHoveredLateral] = useState(null);

	const CLASSROOM_WIDTH = 7.8;
	const CLASSROOM_HEIGHT = 7.2;
	let CANCHA_WIDTH = 28;
	let CANCHA_HEIGHT = 15;
	const BANO_WIDTH = 4.2;
	const BANO_HEIGHT = 7.2;
	const ESCALERA_WIDTH = 3.2;
	const ESCALERA_HEIGHT = 4.2;
	const ENTRADA_WIDTH = 5;
	const CIRCULACION_LATERAL = 5; //5
	const CIRCULACION_ENTRE_PABELLONES = 2; //10
	const RETIRO_TERRENO = 1; // Metros de separación desde el borde

	const SEPARACION_CANCHA = 5;

	const {
		vertices,
		classrooms,
		complementaryEnvironment,
		angle,
		width,
		length,
		verticesRectangle,
		partialArea,
		numberOfClassrooms,
	} = school;

	const dimensiones = {
		"Biblioteca escolar": {
			height: 7.2,
			//ancho: 12.5,
			width: 7.7,
		},
		"Sala de Psicomotricidad": {
			height: 7.2,
			width: 7.8,
		},
		"Taller EPT": {
			height: 7.5,
			width: 14,
		},
		"Sala de Usos Múltiples (SUM)": {
			height: 7.5,
			width: 15,
		},
		"Aula para EPT": {
			height: 10,
			width: 5,
		},
		"Taller creativo": {
			height: 12,
			width: 7.6,
		},
		"Cocina escolar": {
			height: 7.5,
			width: 4.4,
		},
		Comedor: {
			height: 7.5,
			width: 5.5,
		},
		"Servicios higiénicos para personal administrativo y docente": {
			height: 10,
			width: 5,
		},
		"Almacén general / Depósito de materiales": {
			height: 7.5,
			width: 15,
		},
		"Cuarto de limpieza": {
			height: 10,
			width: 5,
		},
		"Dirección administrativa": {
			height: 7.5,
			width: 7.2,
		},
		"Sala de maestros": {
			height: 7.5,
			width: 7.2, // 10.7
		},
		"Sala de reuniones": {
			height: 7.5,
			width: 7.2,
		},
		Laboratorio: {
			height: 7.5,
			//ancho: 12.5,
			width: 7.6,
		},
		Lactario: {
			height: 7.5,
			width: 3.6,
		},
		Topico: {
			height: 7.5,
			width: 3.6,
		},
	};

	const arrayTransformado = complementaryEnvironment.map((item) => ({
		nombre: item.ambienteComplementario,
		alto: dimensiones[item.ambienteComplementario].height,
		ancho: dimensiones[item.ambienteComplementario].width,
	}));

	const inicial = classrooms.filter((nivel) => nivel === "inicial");
	const secundaria = classrooms.filter((nivel) => nivel === "secundaria");
	const primaria = classrooms.filter((nivel) => nivel === "primaria");
	const classroomInicial = inicial.length;
	const classroomPrimaria = primaria.length;
	const classroomSecundaria = secundaria.length;

	// Función para cargar vertices desde array

	useEffect(() => {
		// Cuando cambie el layoutMode, recalcular capacidad
		if (maxRectangle) {
			console.log("layoutMode cambió a:", layoutMode);
			calculateCapacity();
		}
	}, [layoutMode]);

	useEffect(() => {
		try {
			const parsedCoords = vertices.map((vertex, index) => ({
				id: Date.now() + index,
				east: parseFloat(vertex[0]),
				north: parseFloat(vertex[1]),
			}));

			const parsedCoordsRectangle = {
				angle: Math.round(angle),
				//height: parseFloat(length.toFixed(2)),
				height: length,
				width: width,
				area: parseFloat(partialArea.toFixed(2)),
				corners: verticesRectangle,
			};

			console.log("parsedCoordsRectangle:::::::", parsedCoordsRectangle);

			setCoordinates(parsedCoords);
			setMaxRectangle(parsedCoordsRectangle);
			//setMaxRectangle(null);
			//setDistribution(null);
			setShowBulkInput(false);
			//setBulkInput("");
			//calculateCapacity();
		} catch (error) {
			alert("Error al procesar las coordenadas. Verifica el formato.");
		}
	}, []);

	// ✅ FUNCIONES DE ZOOM
	const handleZoomIn = () => {
		setZoom((prev) => Math.min(prev + 0.2, 3)); // Máximo 3x
	};

	const handleZoomOut = () => {
		setZoom((prev) => Math.max(prev - 0.2, 0.5)); // Mínimo 0.5x
	};

	const handleResetZoom = () => {
		setZoom(1);
		setPanOffset({ x: 0, y: 0 });
	};

	const handleMouseDown = (e) => {
		setIsDragging(true);
		setDragStart({
			x: e.clientX - panOffset.x,
			y: e.clientY - panOffset.y,
		});
	};

	const handleMouseMove = (e) => {
		if (isDragging) {
			setPanOffset({
				x: e.clientX - dragStart.x,
				y: e.clientY - dragStart.y,
			});
		}
	};

	const handleMouseUp = () => {
		setIsDragging(false);
	};

	const handleWheel = (e) => {
		e.preventDefault();
		const delta = e.deltaY * -0.001;
		setZoom((prev) => Math.max(0.5, Math.min(3, prev + delta)));
	};

	// const exportToJSON = () => {
	// 	if (!maxRectangle || !distribution) {
	// 		alert("Primero genera la distribución");
	// 		return;
	// 	}

	// 	// ============================================
	// 	// FUNCIÓN AUXILIAR PARA LIMPIAR NÚMEROS
	// 	// ============================================
	// 	const cleanNumber = (num, decimals = 2) => {
	// 		// Si el número es muy pequeño (casi cero), retornar 0
	// 		if (Math.abs(num) < 1e-6) return 0;

	// 		// Redondear al número de decimales especificado
	// 		const factor = Math.pow(10, decimals);
	// 		return Math.round(num * factor) / factor;
	// 	};

	// 	// Configuración del rectángulo y sistema de coordenadas
	// 	const rectWidth = maxRectangle.width;
	// 	const rectHeight = maxRectangle.height;
	// 	const origin = maxRectangle.corners[0]; // Esquina origen en UTM
	// 	const angle = (maxRectangle.angle * Math.PI) / 180;
	// 	const dirX = { east: Math.cos(angle), north: Math.sin(angle) };
	// 	const dirY = { east: -Math.sin(angle), north: Math.cos(angle) };

	// 	// ============================================
	// 	// FUNCIÓN PARA CONVERTIR DE UTM A RELATIVAS
	// 	// ============================================
	// 	const utmToRelative = (utmPoint) => {
	// 		const dx = utmPoint.east - origin.east;
	// 		const dy = utmPoint.north - origin.north;

	// 		// Proyectar en los ejes del rectángulo
	// 		const relX = dx * dirX.east + dy * dirX.north;
	// 		const relY = dx * dirY.east + dy * dirY.north;

	// 		return {
	// 			x: cleanNumber(relX, 2),
	// 			y: cleanNumber(relY, 2),
	// 		};
	// 	};

	// 	// ============================================
	// 	// FUNCIÓN PARA CREAR ESQUINAS EN UTM
	// 	// ============================================
	// 	const createRoomCornersUTM = (relX, relY, width, height) => {
	// 		const corners = [
	// 			{
	// 				east: origin.east + dirX.east * relX + dirY.east * relY,
	// 				north: origin.north + dirX.north * relX + dirY.north * relY,
	// 			},
	// 			{
	// 				east:
	// 					origin.east +
	// 					dirX.east * (relX + width) +
	// 					dirY.east * relY,
	// 				north:
	// 					origin.north +
	// 					dirX.north * (relX + width) +
	// 					dirY.north * relY,
	// 			},
	// 			{
	// 				east:
	// 					origin.east +
	// 					dirX.east * (relX + width) +
	// 					dirY.east * (relY + height),
	// 				north:
	// 					origin.north +
	// 					dirX.north * (relX + width) +
	// 					dirY.north * (relY + height),
	// 			},
	// 			{
	// 				east:
	// 					origin.east +
	// 					dirX.east * relX +
	// 					dirY.east * (relY + height),
	// 				north:
	// 					origin.north +
	// 					dirX.north * relX +
	// 					dirY.north * (relY + height),
	// 			},
	// 		];
	// 		return corners;
	// 	};

	// 	// ============================================
	// 	// FUNCIÓN PARA CALCULAR BOUNDS Y DIMENSIONES (CORREGIDA)
	// 	// ============================================
	// 	const calculateAmbienteData = (cornersUTM) => {
	// 		// Convertir todas las esquinas a coordenadas relativas
	// 		const cornersRel = cornersUTM.map((c) => utmToRelative(c));

	// 		const xs = cornersRel.map((c) => c.x);
	// 		const ys = cornersRel.map((c) => c.y);

	// 		let x_min = Math.min(...xs);
	// 		let x_max = Math.max(...xs);
	// 		let y_min = Math.min(...ys);
	// 		let y_max = Math.max(...ys);

	// 		// Limpiar valores muy pequeños
	// 		x_min = cleanNumber(x_min, 2);
	// 		x_max = cleanNumber(x_max, 2);
	// 		y_min = cleanNumber(y_min, 2);
	// 		y_max = cleanNumber(y_max, 2);

	// 		const ancho = cleanNumber(x_max - x_min, 2);
	// 		const largo = cleanNumber(y_max - y_min, 2);
	// 		const area = cleanNumber(ancho * largo, 2);

	// 		return {
	// 			posicion: {
	// 				x: x_min,
	// 				y: y_min,
	// 			},
	// 			dimensiones: {
	// 				ancho: ancho,
	// 				largo: largo,
	// 				area: area,
	// 			},
	// 			bounds: {
	// 				x_min: x_min,
	// 				y_min: y_min,
	// 				x_max: x_max,
	// 				y_max: y_max,
	// 			},
	// 		};
	// 	};

	// 	// ============================================
	// 	// ARRAYS PARA ORGANIZAR POR PISOS
	// 	// ============================================
	// 	const ambientesPiso1 = [];
	// 	const ambientesPiso2 = [];

	// 	// Contadores para nombres únicos
	// 	let contadorInicial = 1;
	// 	let contadorPrimaria = 1;
	// 	let contadorSecundaria = 1;
	// 	let contadorLosaDeportiva = 1;

	// 	// ============================================
	// 	// CLASIFICAR AMBIENTES COMPLEMENTARIOS
	// 	// ============================================
	// 	const { enPabellones, lateralesCancha, superiores } =
	// 		classifyAmbientes(arrayTransformado);

	// 	// ============================================
	// 	// FUNCIÓN PARA AGREGAR AMBIENTE
	// 	// ============================================
	// 	const agregarAmbiente = (nombre, cornersUTM, pabellon, piso) => {
	// 		const data = calculateAmbienteData(cornersUTM);
	// 		const ambiente = {
	// 			nombre,
	// 			...data,
	// 			pabellon,
	// 		};

	// 		if (piso === 1) {
	// 			ambientesPiso1.push(ambiente);
	// 		} else {
	// 			ambientesPiso2.push(ambiente);
	// 		}
	// 	};

	// 	// ============================================
	// 	// PROCESAR CADA PISO
	// 	// ============================================
	// 	for (let piso = 1; piso <= distribution.totalFloors; piso++) {
	// 		const floorData = distribution.floors[piso];

	// 		// ==========================================
	// 		// 1. PABELLÓN INFERIOR (INICIAL O REASIGNADO)
	// 		// ==========================================
	// 		let currentXInicial = CIRCULACION_LATERAL;
	// 		const pabellonInferiorNombre =
	// 			distribution.pabellonInferiorEs === "primaria"
	// 				? "Primaria"
	// 				: distribution.pabellonInferiorEs === "secundaria"
	// 				? "Secundaria"
	// 				: "Inicial";

	// 		for (let i = 0; i < floorData.inicial; i++) {
	// 			// Baños y escaleras intercalados
	// 			if (i === floorData.inicialBanoPos && floorData.inicial > 0) {
	// 				// BAÑO
	// 				const cornersSSHH = createRoomCornersUTM(
	// 					currentXInicial,
	// 					0,
	// 					BANO_WIDTH,
	// 					BANO_HEIGHT
	// 				);
	// 				agregarAmbiente(
	// 					`SSHH ${pabellonInferiorNombre}`,
	// 					cornersSSHH,
	// 					"Medio",
	// 					piso
	// 				);
	// 				currentXInicial += BANO_WIDTH;

	// 				// ESCALERA
	// 				const cornersEscalera = createRoomCornersUTM(
	// 					currentXInicial,
	// 					0,
	// 					ESCALERA_WIDTH,
	// 					ESCALERA_HEIGHT
	// 				);
	// 				agregarAmbiente(
	// 					`Escalera ${
	// 						pabellonInferiorNombre === "Inicial"
	// 							? "Inic"
	// 							: pabellonInferiorNombre === "Primaria"
	// 							? "Prim"
	// 							: "Sec"
	// 					} ${piso}`,
	// 					cornersEscalera,
	// 					"Medio",
	// 					piso
	// 				);
	// 				currentXInicial += ESCALERA_WIDTH;
	// 			}

	// 			// AULA
	// 			const cornersAula = createRoomCornersUTM(
	// 				currentXInicial,
	// 				0,
	// 				CLASSROOM_WIDTH,
	// 				CLASSROOM_HEIGHT
	// 			);

	// 			let nombreAula;
	// 			if (distribution.pabellonInferiorEs === "primaria") {
	// 				nombreAula = `Aulas Primaria ${contadorPrimaria++}`;
	// 			} else if (distribution.pabellonInferiorEs === "secundaria") {
	// 				nombreAula = `Aulas Secundaria ${contadorSecundaria++}`;
	// 			} else {
	// 				nombreAula = `Aulas Inicial ${contadorInicial++}`;
	// 			}

	// 			agregarAmbiente(nombreAula, cornersAula, "Medio", piso);
	// 			currentXInicial += CLASSROOM_WIDTH;
	// 		}

	// 		// ==========================================
	// 		// 2. PABELLÓN IZQUIERDO (PRIMARIA)
	// 		// ==========================================
	// 		const startYPrimaria =
	// 			CLASSROOM_HEIGHT + CIRCULACION_ENTRE_PABELLONES;
	// 		let currentYPrimaria = startYPrimaria;

	// 		const bibliotecaEnPrimaria = enPabellones.find(
	// 			(a) => a.pabellon === "primaria"
	// 		);

	// 		for (let i = 0; i < floorData.primaria; i++) {
	// 			// Baños y escaleras intercalados
	// 			if (i === floorData.primariaBanoPos && floorData.primaria > 0) {
	// 				// BAÑO
	// 				const cornersSSHH = createRoomCornersUTM(
	// 					0,
	// 					currentYPrimaria,
	// 					CLASSROOM_WIDTH,
	// 					BANO_HEIGHT
	// 				);
	// 				agregarAmbiente(
	// 					`SSHH Prim`,
	// 					cornersSSHH,
	// 					"Izquierda",
	// 					piso
	// 				);
	// 				currentYPrimaria += BANO_HEIGHT;

	// 				// ESCALERA
	// 				const cornersEscalera = createRoomCornersUTM(
	// 					0,
	// 					currentYPrimaria,
	// 					CLASSROOM_WIDTH,
	// 					ESCALERA_HEIGHT
	// 				);
	// 				agregarAmbiente(
	// 					`Escalera Prim ${piso}`,
	// 					cornersEscalera,
	// 					"Izquierda",
	// 					piso
	// 				);
	// 				currentYPrimaria += ESCALERA_HEIGHT;
	// 			}

	// 			// AULA
	// 			const cornersAula = createRoomCornersUTM(
	// 				0,
	// 				currentYPrimaria,
	// 				CLASSROOM_WIDTH,
	// 				CLASSROOM_HEIGHT
	// 			);
	// 			agregarAmbiente(
	// 				`Aulas Primaria ${contadorPrimaria++}`,
	// 				cornersAula,
	// 				"Izquierda",
	// 				piso
	// 			);
	// 			currentYPrimaria += CLASSROOM_HEIGHT;
	// 		}

	// 		// BIBLIOTECA EN PRIMARIA (solo piso 1)
	// 		if (bibliotecaEnPrimaria && piso === 1 && floorData.primaria > 0) {
	// 			const cornersBiblioteca = createRoomCornersUTM(
	// 				0,
	// 				currentYPrimaria,
	// 				bibliotecaEnPrimaria.ancho,
	// 				bibliotecaEnPrimaria.alto
	// 			);
	// 			agregarAmbiente(
	// 				bibliotecaEnPrimaria.nombre,
	// 				cornersBiblioteca,
	// 				"Izquierda",
	// 				piso
	// 			);
	// 		}

	// 		// ==========================================
	// 		// 3. PABELLÓN DERECHO (SECUNDARIA)
	// 		// ==========================================
	// 		let currentYSecundaria = startYPrimaria;
	// 		const laboratorioEnSecundaria = enPabellones.find(
	// 			(a) => a.pabellon === "secundaria"
	// 		);

	// 		for (let i = 0; i < floorData.secundaria; i++) {
	// 			// Baños y escaleras intercalados
	// 			if (
	// 				i === floorData.secundariaBanoPos &&
	// 				floorData.secundaria > 0
	// 			) {
	// 				// BAÑO
	// 				const cornersSSHH = createRoomCornersUTM(
	// 					rectWidth - CLASSROOM_WIDTH,
	// 					currentYSecundaria,
	// 					CLASSROOM_WIDTH,
	// 					BANO_HEIGHT
	// 				);
	// 				agregarAmbiente(`SSHH Sec`, cornersSSHH, "Derecha", piso);
	// 				currentYSecundaria += BANO_HEIGHT;

	// 				// ESCALERA
	// 				const cornersEscalera = createRoomCornersUTM(
	// 					rectWidth - CLASSROOM_WIDTH,
	// 					currentYSecundaria,
	// 					CLASSROOM_WIDTH,
	// 					ESCALERA_HEIGHT
	// 				);
	// 				agregarAmbiente(
	// 					`Escalera Sec ${piso}`,
	// 					cornersEscalera,
	// 					"Derecha",
	// 					piso
	// 				);
	// 				currentYSecundaria += ESCALERA_HEIGHT;
	// 			}

	// 			// AULA
	// 			const cornersAula = createRoomCornersUTM(
	// 				rectWidth - CLASSROOM_WIDTH,
	// 				currentYSecundaria,
	// 				CLASSROOM_WIDTH,
	// 				CLASSROOM_HEIGHT
	// 			);
	// 			agregarAmbiente(
	// 				`Aulas Secundaria ${contadorSecundaria++}`,
	// 				cornersAula,
	// 				"Derecha",
	// 				piso
	// 			);
	// 			currentYSecundaria += CLASSROOM_HEIGHT;
	// 		}

	// 		// LABORATORIO EN SECUNDARIA (solo piso 1)
	// 		if (
	// 			laboratorioEnSecundaria &&
	// 			piso === 1 &&
	// 			floorData.secundaria > 0
	// 		) {
	// 			const cornersLaboratorio = createRoomCornersUTM(
	// 				rectWidth - CLASSROOM_WIDTH,
	// 				currentYSecundaria,
	// 				laboratorioEnSecundaria.ancho,
	// 				laboratorioEnSecundaria.alto
	// 			);
	// 			agregarAmbiente(
	// 				laboratorioEnSecundaria.nombre,
	// 				cornersLaboratorio,
	// 				"Derecha",
	// 				piso
	// 			);
	// 		}

	// 		// ==========================================
	// 		// 4. AMBIENTES SUPERIORES (solo si hay en este piso)
	// 		// ==========================================
	// 		if (
	// 			floorData.ambientesSuperiores &&
	// 			floorData.ambientesSuperiores.length > 0
	// 		) {
	// 			const totalAmbientesWidth =
	// 				floorData.ambientesSuperiores.reduce(
	// 					(sum, amb) => sum + amb.ancho,
	// 					0
	// 				);

	// 			// Incluir entrada solo en piso 1
	// 			const anchoConEntrada =
	// 				piso === 1
	// 					? totalAmbientesWidth + ENTRADA_WIDTH
	// 					: totalAmbientesWidth;

	// 			const startXAmbientes = (rectWidth - anchoConEntrada) / 2;
	// 			let currentXAmbiente = startXAmbientes;

	// 			// ENTRADA (solo piso 1)
	// 			if (piso === 1) {
	// 				const ambienteY = rectHeight - CLASSROOM_HEIGHT;
	// 				const cornersEntrada = createRoomCornersUTM(
	// 					currentXAmbiente,
	// 					ambienteY,
	// 					ENTRADA_WIDTH,
	// 					CLASSROOM_HEIGHT
	// 				);
	// 				agregarAmbiente(
	// 					"Entrada Principal",
	// 					cornersEntrada,
	// 					"Medio",
	// 					piso
	// 				);
	// 				currentXAmbiente += ENTRADA_WIDTH;
	// 			}

	// 			// AMBIENTES SUPERIORES
	// 			floorData.ambientesSuperiores.forEach((ambiente) => {
	// 				const ambienteY = rectHeight - ambiente.alto;
	// 				const cornersAmbiente = createRoomCornersUTM(
	// 					currentXAmbiente,
	// 					ambienteY,
	// 					ambiente.ancho,
	// 					ambiente.alto
	// 				);
	// 				agregarAmbiente(
	// 					ambiente.nombre,
	// 					cornersAmbiente,
	// 					"Medio",
	// 					piso
	// 				);
	// 				currentXAmbiente += ambiente.ancho;
	// 			});
	// 		}

	// 		// ==========================================
	// 		// 5. CANCHA Y LATERALES (solo piso 1)
	// 		// ==========================================
	// 		if (piso === 1) {
	// 			const totalWidthLaterales = lateralesCancha.reduce(
	// 				(sum, amb) => sum + amb.ancho,
	// 				0
	// 			);
	// 			const maxHeightLaterales =
	// 				lateralesCancha.length > 0
	// 					? Math.max(...lateralesCancha.map((amb) => amb.alto))
	// 					: 0;

	// 			const totalBloqueHeight =
	// 				CANCHA_HEIGHT +
	// 				(lateralesCancha.length > 0
	// 					? SEPARACION_CANCHA + maxHeightLaterales
	// 					: 0);

	// 			const startY = (rectHeight - totalBloqueHeight) / 2;

	// 			// CANCHA
	// 			const canchaX = (rectWidth - CANCHA_WIDTH) / 2;
	// 			const cornersCancha = createRoomCornersUTM(
	// 				canchaX,
	// 				startY,
	// 				CANCHA_WIDTH,
	// 				CANCHA_HEIGHT
	// 			);
	// 			agregarAmbiente(
	// 				`Losa Deportiva ${contadorLosaDeportiva} ${contadorLosaDeportiva}`,
	// 				cornersCancha,
	// 				"Medio",
	// 				piso
	// 			);
	// 			contadorLosaDeportiva++;

	// 			// COCINA/COMEDOR (laterales)
	// 			if (lateralesCancha.length > 0) {
	// 				const lateralesX = (rectWidth - totalWidthLaterales) / 2;
	// 				const lateralesY =
	// 					startY + CANCHA_HEIGHT + SEPARACION_CANCHA;

	// 				let currentXLateral = lateralesX;
	// 				lateralesCancha.forEach((ambiente) => {
	// 					const cornersLateral = createRoomCornersUTM(
	// 						currentXLateral,
	// 						lateralesY,
	// 						ambiente.ancho,
	// 						ambiente.alto
	// 					);
	// 					agregarAmbiente(
	// 						ambiente.nombre,
	// 						cornersLateral,
	// 						"Medio",
	// 						piso
	// 					);
	// 					currentXLateral += ambiente.ancho;
	// 				});
	// 			}
	// 		}
	// 	}

	// 	// ============================================
	// 	// CONSTRUIR JSON FINAL
	// 	// ============================================
	// 	const jsonData = {
	// 		metadata: {
	// 			proyecto: school.name || "DATOSPRODESIGN",
	// 			fecha_generacion: new Date().toISOString(),
	// 			dimensiones_terreno: {
	// 				ancho: cleanNumber(rectWidth, 2),
	// 				largo: cleanNumber(rectHeight, 2),
	// 				area: cleanNumber(rectWidth * rectHeight, 2), // ✅ CORREGIDO
	// 			},
	// 			archivo_json_origen: "VERTICES_PRODESIGN",
	// 			total_ambientes_p1: ambientesPiso1.length,
	// 			total_ambientes_p2: ambientesPiso2.length,
	// 		},
	// 		piso_1: {
	// 			ambientes: ambientesPiso1,
	// 		},
	// 		piso_2: {
	// 			ambientes: ambientesPiso2,
	// 		},
	// 		resultados: {
	// 			alertas: [],
	// 			escaleras_alineadas: {},
	// 		},
	// 	};

	// 	// ============================================
	// 	// DESCARGAR ARCHIVO JSON
	// 	// ============================================
	// 	const blob = new Blob([JSON.stringify(jsonData, null, 4)], {
	// 		type: "application/json",
	// 	});
	// 	const url = URL.createObjectURL(blob);
	// 	const link = document.createElement("a");
	// 	link.href = url;
	// 	link.download = `DATOSPRODESIGN_distribucion_${Date.now()}.json`;
	// 	document.body.appendChild(link);
	// 	link.click();
	// 	document.body.removeChild(link);
	// 	URL.revokeObjectURL(url);

	// 	console.log("✅ JSON Exportado:", jsonData);
	// 	alert(
	// 		`✅ JSON exportado exitosamente!\n📊 Piso 1: ${ambientesPiso1.length} ambientes\n📊 Piso 2: ${ambientesPiso2.length} ambientes`
	// 	);
	// };
	// ===== FUNCIONES AUXILIARES PARA GENERAR DXF =====
	const exportToJSON = () => {
		if (!maxRectangle || !distribution) {
			alert("Primero genera la distribución");
			return;
		}

		// ============================================
		// FUNCIÓN AUXILIAR PARA LIMPIAR NÚMEROS
		// ============================================
		const cleanNumber = (num, decimals = 2) => {
			if (Math.abs(num) < 1e-6) return 0;
			const factor = Math.pow(10, decimals);
			return Math.round(num * factor) / factor;
		};

		// ============================================
		// FUNCIÓN PARA CALCULAR PERÍMETRO
		// ============================================
		const calculatePerimeter = () => {
			if (coordinates.length < 3) return 0;
			let perimeter = 0;
			for (let i = 0; i < coordinates.length; i++) {
				const j = (i + 1) % coordinates.length;
				const dx = coordinates[j].east - coordinates[i].east;
				const dy = coordinates[j].north - coordinates[i].north;
				perimeter += Math.sqrt(dx * dx + dy * dy);
			}
			return perimeter;
		};

		// Configuración del rectángulo y sistema de coordenadas
		const rectWidth = maxRectangle.width;
		const rectHeight = maxRectangle.height;
		const origin = maxRectangle.corners[0];
		const angle = (maxRectangle.angle * Math.PI) / 180;
		const dirX = { east: Math.cos(angle), north: Math.sin(angle) };
		const dirY = { east: -Math.sin(angle), north: Math.cos(angle) };

		// ============================================
		// FUNCIÓN PARA CONVERTIR DE UTM A RELATIVAS
		// ============================================
		const utmToRelative = (utmPoint) => {
			const dx = utmPoint.east - origin.east;
			const dy = utmPoint.north - origin.north;
			const relX = dx * dirX.east + dy * dirX.north;
			const relY = dx * dirY.east + dy * dirY.north;
			return {
				x: cleanNumber(relX, 2),
				y: cleanNumber(relY, 2),
			};
		};

		// ============================================
		// FUNCIÓN PARA CREAR ESQUINAS EN UTM
		// ============================================
		const createRoomCornersUTM = (relX, relY, width, height) => {
			const corners = [
				{
					east: origin.east + dirX.east * relX + dirY.east * relY,
					north: origin.north + dirX.north * relX + dirY.north * relY,
				},
				{
					east:
						origin.east +
						dirX.east * (relX + width) +
						dirY.east * relY,
					north:
						origin.north +
						dirX.north * (relX + width) +
						dirY.north * relY,
				},
				{
					east:
						origin.east +
						dirX.east * (relX + width) +
						dirY.east * (relY + height),
					north:
						origin.north +
						dirX.north * (relX + width) +
						dirY.north * (relY + height),
				},
				{
					east:
						origin.east +
						dirX.east * relX +
						dirY.east * (relY + height),
					north:
						origin.north +
						dirX.north * relX +
						dirY.north * (relY + height),
				},
			];
			return corners;
		};

		// ============================================
		// FUNCIÓN PARA CALCULAR BOUNDS Y DIMENSIONES
		// ============================================
		const calculateAmbienteData = (cornersUTM) => {
			const cornersRel = cornersUTM.map((c) => utmToRelative(c));
			const xs = cornersRel.map((c) => c.x);
			const ys = cornersRel.map((c) => c.y);

			let x_min = cleanNumber(Math.min(...xs), 2);
			let x_max = cleanNumber(Math.max(...xs), 2);
			let y_min = cleanNumber(Math.min(...ys), 2);
			let y_max = cleanNumber(Math.max(...ys), 2);

			const ancho = cleanNumber(x_max - x_min, 2);
			const largo = cleanNumber(y_max - y_min, 2);
			const area = cleanNumber(ancho * largo, 2);

			return {
				posicion: { x: x_min, y: y_min },
				dimensiones: { ancho, largo, area },
				bounds: { x_min, y_min, x_max, y_max },
			};
		};

		// ============================================
		// ARRAYS PARA ORGANIZAR POR PISOS
		// ============================================
		const ambientesPiso1 = [];
		const ambientesPiso2 = [];

		let contadorInicial = 1;
		let contadorPrimaria = 1;
		let contadorSecundaria = 1;
		let contadorLosaDeportiva = 1;

		const { enPabellones, lateralesCancha, superiores } =
			classifyAmbientes(arrayTransformado);

		// ============================================
		// FUNCIÓN PARA AGREGAR AMBIENTE
		// ============================================
		const agregarAmbiente = (nombre, cornersUTM, pabellon, piso) => {
			const data = calculateAmbienteData(cornersUTM);
			const ambiente = {
				nombre,
				...data,
				pabellon,
			};
			if (piso === 1) {
				ambientesPiso1.push(ambiente);
			} else {
				ambientesPiso2.push(ambiente);
			}
		};

		// ============================================
		// PROCESAR CADA PISO (tu código existente)
		// ============================================
		for (let piso = 1; piso <= distribution.totalFloors; piso++) {
			const floorData = distribution.floors[piso];
			let currentXInicial = CIRCULACION_LATERAL;
			const pabellonInferiorNombre =
				distribution.pabellonInferiorEs === "primaria"
					? "Primaria"
					: distribution.pabellonInferiorEs === "secundaria"
					? "Secundaria"
					: "Inicial";

			// PABELLÓN INFERIOR
			for (let i = 0; i < floorData.inicial; i++) {
				if (i === floorData.inicialBanoPos && floorData.inicial > 0) {
					const cornersSSHH = createRoomCornersUTM(
						currentXInicial,
						0,
						BANO_WIDTH,
						BANO_HEIGHT
					);
					agregarAmbiente(
						`SSHH ${pabellonInferiorNombre}`,
						cornersSSHH,
						"Medio",
						piso
					);
					currentXInicial += BANO_WIDTH;

					const cornersEscalera = createRoomCornersUTM(
						currentXInicial,
						0,
						ESCALERA_WIDTH,
						ESCALERA_HEIGHT
					);
					agregarAmbiente(
						`Escalera ${
							pabellonInferiorNombre === "Inicial"
								? "Inic"
								: pabellonInferiorNombre === "Primaria"
								? "Prim"
								: "Sec"
						} ${piso}`,
						cornersEscalera,
						"Medio",
						piso
					);
					currentXInicial += ESCALERA_WIDTH;
				}

				const cornersAula = createRoomCornersUTM(
					currentXInicial,
					0,
					CLASSROOM_WIDTH,
					CLASSROOM_HEIGHT
				);
				let nombreAula;
				if (distribution.pabellonInferiorEs === "primaria") {
					nombreAula = `Aulas Primaria ${contadorPrimaria++}`;
				} else if (distribution.pabellonInferiorEs === "secundaria") {
					nombreAula = `Aulas Secundaria ${contadorSecundaria++}`;
				} else {
					nombreAula = `Aulas Inicial ${contadorInicial++}`;
				}
				agregarAmbiente(nombreAula, cornersAula, "Medio", piso);
				currentXInicial += CLASSROOM_WIDTH;
			}

			// PABELLÓN IZQUIERDO (PRIMARIA)
			const startYPrimaria =
				CLASSROOM_HEIGHT + CIRCULACION_ENTRE_PABELLONES;
			let currentYPrimaria = startYPrimaria;
			const bibliotecaEnPrimaria = enPabellones.find(
				(a) => a.pabellon === "primaria"
			);

			for (let i = 0; i < floorData.primaria; i++) {
				if (i === floorData.primariaBanoPos && floorData.primaria > 0) {
					const cornersSSHH = createRoomCornersUTM(
						0,
						currentYPrimaria,
						CLASSROOM_WIDTH,
						BANO_HEIGHT
					);
					agregarAmbiente(
						`SSHH Prim`,
						cornersSSHH,
						"Izquierda",
						piso
					);
					currentYPrimaria += BANO_HEIGHT;

					const cornersEscalera = createRoomCornersUTM(
						0,
						currentYPrimaria,
						CLASSROOM_WIDTH,
						ESCALERA_HEIGHT
					);
					agregarAmbiente(
						`Escalera Prim ${piso}`,
						cornersEscalera,
						"Izquierda",
						piso
					);
					currentYPrimaria += ESCALERA_HEIGHT;
				}

				const cornersAula = createRoomCornersUTM(
					0,
					currentYPrimaria,
					CLASSROOM_WIDTH,
					CLASSROOM_HEIGHT
				);
				agregarAmbiente(
					`Aulas Primaria ${contadorPrimaria++}`,
					cornersAula,
					"Izquierda",
					piso
				);
				currentYPrimaria += CLASSROOM_HEIGHT;
			}

			if (bibliotecaEnPrimaria && piso === 1 && floorData.primaria > 0) {
				const cornersBiblioteca = createRoomCornersUTM(
					0,
					currentYPrimaria,
					bibliotecaEnPrimaria.ancho,
					bibliotecaEnPrimaria.alto
				);
				agregarAmbiente(
					bibliotecaEnPrimaria.nombre,
					cornersBiblioteca,
					"Izquierda",
					piso
				);
			}

			// PABELLÓN DERECHO (SECUNDARIA)
			let currentYSecundaria = startYPrimaria;
			const laboratorioEnSecundaria = enPabellones.find(
				(a) => a.pabellon === "secundaria"
			);

			for (let i = 0; i < floorData.secundaria; i++) {
				if (
					i === floorData.secundariaBanoPos &&
					floorData.secundaria > 0
				) {
					const cornersSSHH = createRoomCornersUTM(
						rectWidth - CLASSROOM_WIDTH,
						currentYSecundaria,
						CLASSROOM_WIDTH,
						BANO_HEIGHT
					);
					agregarAmbiente(`SSHH Sec`, cornersSSHH, "Derecha", piso);
					currentYSecundaria += BANO_HEIGHT;

					const cornersEscalera = createRoomCornersUTM(
						rectWidth - CLASSROOM_WIDTH,
						currentYSecundaria,
						CLASSROOM_WIDTH,
						ESCALERA_HEIGHT
					);
					agregarAmbiente(
						`Escalera Sec ${piso}`,
						cornersEscalera,
						"Derecha",
						piso
					);
					currentYSecundaria += ESCALERA_HEIGHT;
				}

				const cornersAula = createRoomCornersUTM(
					rectWidth - CLASSROOM_WIDTH,
					currentYSecundaria,
					CLASSROOM_WIDTH,
					CLASSROOM_HEIGHT
				);
				agregarAmbiente(
					`Aulas Secundaria ${contadorSecundaria++}`,
					cornersAula,
					"Derecha",
					piso
				);
				currentYSecundaria += CLASSROOM_HEIGHT;
			}

			if (
				laboratorioEnSecundaria &&
				piso === 1 &&
				floorData.secundaria > 0
			) {
				const cornersLaboratorio = createRoomCornersUTM(
					rectWidth - CLASSROOM_WIDTH,
					currentYSecundaria,
					laboratorioEnSecundaria.ancho,
					laboratorioEnSecundaria.alto
				);
				agregarAmbiente(
					laboratorioEnSecundaria.nombre,
					cornersLaboratorio,
					"Derecha",
					piso
				);
			}

			// AMBIENTES SUPERIORES
			if (
				floorData.ambientesSuperiores &&
				floorData.ambientesSuperiores.length > 0
			) {
				const totalAmbientesWidth =
					floorData.ambientesSuperiores.reduce(
						(sum, amb) => sum + amb.ancho,
						0
					);
				const anchoConEntrada =
					piso === 1
						? totalAmbientesWidth + ENTRADA_WIDTH
						: totalAmbientesWidth;
				const startXAmbientes = (rectWidth - anchoConEntrada) / 2;
				let currentXAmbiente = startXAmbientes;

				if (piso === 1) {
					const ambienteY = rectHeight - CLASSROOM_HEIGHT;
					const cornersEntrada = createRoomCornersUTM(
						currentXAmbiente,
						ambienteY,
						ENTRADA_WIDTH,
						CLASSROOM_HEIGHT
					);
					agregarAmbiente(
						"Entrada Principal",
						cornersEntrada,
						"Medio",
						piso
					);
					currentXAmbiente += ENTRADA_WIDTH;
				}

				floorData.ambientesSuperiores.forEach((ambiente) => {
					const ambienteY = rectHeight - ambiente.alto;
					const cornersAmbiente = createRoomCornersUTM(
						currentXAmbiente,
						ambienteY,
						ambiente.ancho,
						ambiente.alto
					);
					agregarAmbiente(
						ambiente.nombre,
						cornersAmbiente,
						"Medio",
						piso
					);
					currentXAmbiente += ambiente.ancho;
				});
			}

			// CANCHA Y LATERALES
			if (piso === 1) {
				const totalWidthLaterales = lateralesCancha.reduce(
					(sum, amb) => sum + amb.ancho,
					0
				);
				const maxHeightLaterales =
					lateralesCancha.length > 0
						? Math.max(...lateralesCancha.map((amb) => amb.alto))
						: 0;
				const totalBloqueHeight =
					CANCHA_HEIGHT +
					(lateralesCancha.length > 0
						? SEPARACION_CANCHA + maxHeightLaterales
						: 0);
				const startY = (rectHeight - totalBloqueHeight) / 2;

				const canchaX = (rectWidth - CANCHA_WIDTH) / 2;
				const cornersCancha = createRoomCornersUTM(
					canchaX,
					startY,
					CANCHA_WIDTH,
					CANCHA_HEIGHT
				);
				agregarAmbiente(
					`Losa Deportiva ${contadorLosaDeportiva} ${contadorLosaDeportiva}`,
					cornersCancha,
					"Medio",
					piso
				);
				contadorLosaDeportiva++;

				if (lateralesCancha.length > 0) {
					const lateralesX = (rectWidth - totalWidthLaterales) / 2;
					const lateralesY =
						startY + CANCHA_HEIGHT + SEPARACION_CANCHA;
					let currentXLateral = lateralesX;
					lateralesCancha.forEach((ambiente) => {
						const cornersLateral = createRoomCornersUTM(
							currentXLateral,
							lateralesY,
							ambiente.ancho,
							ambiente.alto
						);
						agregarAmbiente(
							ambiente.nombre,
							cornersLateral,
							"Medio",
							piso
						);
						currentXLateral += ambiente.ancho;
					});
				}
			}
		}

		// ============================================
		// ✨ CONSTRUIR JSON FINAL CON TERRENO
		// ============================================
		const jsonData = {
			metadata: {
				proyecto: school.name || "DATOSPRODESIGN",
				fecha_generacion: new Date().toISOString(),
				dimensiones_terreno: {
					ancho: cleanNumber(rectWidth, 2),
					largo: cleanNumber(rectHeight, 2),
					area: cleanNumber(rectWidth * rectHeight, 2),
				},
				archivo_json_origen: "VERTICES_PRODESIGN",
				total_ambientes_p1: ambientesPiso1.length,
				total_ambientes_p2: ambientesPiso2.length,
			},

			// ✨ NUEVO: TERRENO COMPLETO
			terreno: {
				// Polígono del terreno original (coordenadas UTM absolutas)
				poligono_utm: coordinates.map((coord) => ({
					east: cleanNumber(coord.east, 2),
					north: cleanNumber(coord.north, 2),
				})),

				// Polígono del terreno en coordenadas relativas (desde origen 0,0)
				poligono_relativo: coordinates.map((coord) => {
					const rel = utmToRelative(coord);
					return { x: rel.x, y: rel.y };
				}),

				// Estadísticas del terreno
				area_total: cleanNumber(calculateArea(), 2),
				perimetro: cleanNumber(calculatePerimeter(), 2),
				num_vertices: coordinates.length,
			},

			// ✨ NUEVO: RECTÁNGULO INSCRITO (donde están las aulas)
			rectangulo_inscrito: {
				// Ángulo de rotación en grados
				angulo_rotacion: cleanNumber(maxRectangle.angle, 2),

				// Esquinas del rectángulo en coordenadas UTM
				vertices_utm: maxRectangle.corners.map((corner) => ({
					east: cleanNumber(corner.east, 2),
					north: cleanNumber(corner.north, 2),
				})),

				// Esquinas del rectángulo en coordenadas relativas
				vertices_relativos: [
					{ x: 0, y: 0 },
					{ x: cleanNumber(rectWidth, 2), y: 0 },
					{
						x: cleanNumber(rectWidth, 2),
						y: cleanNumber(rectHeight, 2),
					},
					{ x: 0, y: cleanNumber(rectHeight, 2) },
				],

				// Dimensiones
				ancho: cleanNumber(rectWidth, 2),
				largo: cleanNumber(rectHeight, 2),
				area: cleanNumber(rectWidth * rectHeight, 2),
			},

			piso_1: {
				ambientes: ambientesPiso1,
			},
			piso_2: {
				ambientes: ambientesPiso2,
			},
			resultados: {
				alertas: [],
				escaleras_alineadas: {},
			},
		};

		// ============================================
		// DESCARGAR ARCHIVO JSON
		// ============================================
		const blob = new Blob([JSON.stringify(jsonData, null, 4)], {
			type: "application/json",
		});
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = `${
			school.name || "PROYECTO"
		}_distribucion_${Date.now()}.json`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);

		console.log("✅ JSON Exportado:", jsonData);
		alert(
			`✅ JSON exportado exitosamente con terreno!\n` +
				`📊 Piso 1: ${ambientesPiso1.length} ambientes\n` +
				`📊 Piso 2: ${ambientesPiso2.length} ambientes\n` +
				`🗺️ Terreno: ${coordinates.length} vértices\n` +
				`📐 Área terreno: ${cleanNumber(calculateArea(), 2)} m²`
		);
	};

	const exportToDXF = (include3D = false) => {
		if (!maxRectangle || !distribution) {
			alert("Primero debes calcular la distribución del terreno");
			return;
		}

		// ✅ NUEVO: Calcular offset para normalizar coordenadas
		const easts = coordinates.map((c) => c.east);
		const norths = coordinates.map((c) => c.north);
		const offsetEast = Math.min(...easts);
		const offsetNorth = Math.min(...norths);

		console.log(`📍 Normalizando coordenadas:`);
		console.log(`   Offset East: ${offsetEast.toFixed(2)}`);
		console.log(`   Offset North: ${offsetNorth.toFixed(2)}`);

		// ✅ Función auxiliar para normalizar coordenadas
		const normalizeCoord = (coord) => ({
			east: coord.east - offsetEast,
			north: coord.north - offsetNorth,
		});

		// ✅ Normalizar corners del rectángulo
		const normalizedRectangle = {
			...maxRectangle,
			corners: maxRectangle.corners.map(normalizeCoord),
		};

		// ✅ Función modificada que normaliza coordenadas
		const obtenerElementosPiso = (numeroPiso) => {
			if (!distribution.floors[numeroPiso]) {
				return null;
			}

			let elementos = {
				inicial: [],
				primaria: [],
				secundaria: [],
				ambientes: [],
				banos: [],
				escaleras: [],
				laterales: [],
				entrada: null,
				cancha: null,
			};

			const floorData = distribution.floors[numeroPiso];
			const rectWidth = normalizedRectangle.width;
			const rectHeight = normalizedRectangle.height;
			const origin = normalizedRectangle.corners[0]; // ✅ Ya normalizado
			const angle = (normalizedRectangle.angle * Math.PI) / 180;
			const dirX = { east: Math.cos(angle), north: Math.sin(angle) };
			const dirY = { east: -Math.sin(angle), north: Math.cos(angle) };

			const createRoomCorners = (x, y, w, h) => {
				const realCorners = [
					{ east: x, north: y },
					{ east: x + dirX.east * w, north: y + dirX.north * w },
					{
						east: x + dirX.east * w + dirY.east * h,
						north: y + dirX.north * w + dirY.north * h,
					},
					{ east: x + dirY.east * h, north: y + dirY.north * h },
				];

				return {
					realCorners: realCorners,
				};
			};

			// [TODO EL CÓDIGO DE DISTRIBUCIÓN IGUAL QUE ANTES]
			// ENTRADA
			if (numeroPiso === 1 && floorData.ambientesSuperiores) {
				const totalAmbientesWidth =
					floorData.ambientesSuperiores.reduce(
						(sum, amb) => sum + amb.ancho,
						0
					);
				const startXAmbientes =
					(rectWidth - totalAmbientesWidth - ENTRADA_WIDTH) / 2;

				let currentXAmbiente = startXAmbientes;
				const ambienteY = rectHeight - CLASSROOM_HEIGHT;
				const xEnt =
					origin.east +
					dirX.east * currentXAmbiente +
					dirY.east * ambienteY;
				const yEnt =
					origin.north +
					dirX.north * currentXAmbiente +
					dirY.north * ambienteY;

				const entradaData = createRoomCorners(
					xEnt,
					yEnt,
					ENTRADA_WIDTH,
					CLASSROOM_HEIGHT
				);
				elementos.entrada = {
					realCorners: entradaData.realCorners,
				};
				currentXAmbiente += ENTRADA_WIDTH;

				floorData.ambientesSuperiores.forEach((ambiente) => {
					const x =
						origin.east +
						dirX.east * currentXAmbiente +
						dirY.east * (rectHeight - ambiente.alto);
					const y =
						origin.north +
						dirX.north * currentXAmbiente +
						dirY.north * (rectHeight - ambiente.alto);

					const ambienteData = createRoomCorners(
						x,
						y,
						ambiente.ancho,
						ambiente.alto
					);
					elementos.ambientes.push({
						nombre: ambiente.nombre,
						tipo: "superior",
						realCorners: ambienteData.realCorners,
					});
					currentXAmbiente += ambiente.ancho;
				});
			} else if (
				numeroPiso === 2 &&
				floorData.ambientesSuperiores &&
				floorData.ambientesSuperiores.length > 0
			) {
				const totalAmbientesWidth =
					floorData.ambientesSuperiores.reduce(
						(sum, amb) => sum + amb.ancho,
						0
					);
				const startXAmbientes = (rectWidth - totalAmbientesWidth) / 2;
				let currentXAmbiente = startXAmbientes;

				floorData.ambientesSuperiores.forEach((ambiente) => {
					const x =
						origin.east +
						dirX.east * currentXAmbiente +
						dirY.east * (rectHeight - ambiente.alto);
					const y =
						origin.north +
						dirX.north * currentXAmbiente +
						dirY.north * (rectHeight - ambiente.alto);

					const ambienteData = createRoomCorners(
						x,
						y,
						ambiente.ancho,
						ambiente.alto
					);
					elementos.ambientes.push({
						nombre: ambiente.nombre,
						tipo: "superior",
						realCorners: ambienteData.realCorners,
					});
					currentXAmbiente += ambiente.ancho;
				});
			}

			// INICIAL
			const pabellonInferiorColor =
				distribution.pabellonInferiorEs === "primaria"
					? "primaria"
					: distribution.pabellonInferiorEs === "secundaria"
					? "secundaria"
					: "inicial";

			let currentXInicial = CIRCULACION_LATERAL;

			for (let i = 0; i < floorData.inicial; i++) {
				if (i === floorData.inicialBanoPos && floorData.inicial > 0) {
					const xBano = origin.east + dirX.east * currentXInicial;
					const yBano = origin.north + dirX.north * currentXInicial;

					const banoData = createRoomCorners(
						xBano,
						yBano,
						BANO_WIDTH,
						BANO_HEIGHT
					);
					elementos.banos.push({
						nivel: "Inicial",
						realCorners: banoData.realCorners,
					});
					currentXInicial += BANO_WIDTH;

					const xEsc = origin.east + dirX.east * currentXInicial;
					const yEsc = origin.north + dirX.north * currentXInicial;

					const escaleraData = createRoomCorners(
						xEsc,
						yEsc,
						ESCALERA_WIDTH,
						ESCALERA_HEIGHT
					);
					elementos.escaleras.push({
						nivel: "Inicial",
						realCorners: escaleraData.realCorners,
					});
					currentXInicial += ESCALERA_WIDTH;
				}

				const x = origin.east + dirX.east * currentXInicial;
				const y = origin.north + dirX.north * currentXInicial;

				const aulaData = createRoomCorners(
					x,
					y,
					CLASSROOM_WIDTH,
					CLASSROOM_HEIGHT
				);

				if (pabellonInferiorColor === "inicial") {
					elementos.inicial.push({
						realCorners: aulaData.realCorners,
					});
				} else if (pabellonInferiorColor === "primaria") {
					elementos.primaria.push({
						realCorners: aulaData.realCorners,
					});
				} else if (pabellonInferiorColor === "secundaria") {
					elementos.secundaria.push({
						realCorners: aulaData.realCorners,
					});
				}

				currentXInicial += CLASSROOM_WIDTH;
			}

			// PRIMARIA
			const startYPrimaria =
				CLASSROOM_HEIGHT + CIRCULACION_ENTRE_PABELLONES;
			let currentYPrimaria = startYPrimaria;
			const bibliotecaEnPrimaria =
				distribution.ambientesEnPabellones.find(
					(a) => a.pabellon === "primaria"
				);

			for (let i = 0; i < floorData.primaria; i++) {
				if (i === floorData.primariaBanoPos && floorData.primaria > 0) {
					const xBano = origin.east + dirY.east * currentYPrimaria;
					const yBano = origin.north + dirY.north * currentYPrimaria;

					const banoData = createRoomCorners(
						xBano,
						yBano,
						CLASSROOM_WIDTH,
						BANO_HEIGHT
					);
					elementos.banos.push({
						nivel: "Primaria",
						realCorners: banoData.realCorners,
					});
					currentYPrimaria += BANO_HEIGHT;

					const xEsc = origin.east + dirY.east * currentYPrimaria;
					const yEsc = origin.north + dirY.north * currentYPrimaria;

					const escaleraData = createRoomCorners(
						xEsc,
						yEsc,
						CLASSROOM_WIDTH,
						ESCALERA_HEIGHT
					);
					elementos.escaleras.push({
						nivel: "Primaria",
						realCorners: escaleraData.realCorners,
					});
					currentYPrimaria += ESCALERA_HEIGHT;
				}

				const x = origin.east + dirY.east * currentYPrimaria;
				const y = origin.north + dirY.north * currentYPrimaria;

				const aulaData = createRoomCorners(
					x,
					y,
					CLASSROOM_WIDTH,
					CLASSROOM_HEIGHT
				);
				elementos.primaria.push({
					realCorners: aulaData.realCorners,
				});
				currentYPrimaria += CLASSROOM_HEIGHT;
			}

			if (
				bibliotecaEnPrimaria &&
				numeroPiso === 1 &&
				floorData.primaria > 0
			) {
				const x = origin.east + dirY.east * currentYPrimaria;
				const y = origin.north + dirY.north * currentYPrimaria;

				const bibliotecaData = createRoomCorners(
					x,
					y,
					bibliotecaEnPrimaria.ancho,
					bibliotecaEnPrimaria.alto
				);
				elementos.ambientes.push({
					nombre: bibliotecaEnPrimaria.nombre,
					tipo: "pabellon",
					realCorners: bibliotecaData.realCorners,
				});
			}

			// SECUNDARIA
			let currentYSecundaria = startYPrimaria;
			const laboratorioEnSecundaria =
				distribution.ambientesEnPabellones.find(
					(a) => a.pabellon === "secundaria"
				);

			for (let i = 0; i < floorData.secundaria; i++) {
				if (
					i === floorData.secundariaBanoPos &&
					floorData.secundaria > 0
				) {
					const xBano =
						origin.east +
						dirX.east * (rectWidth - CLASSROOM_WIDTH) +
						dirY.east * currentYSecundaria;
					const yBano =
						origin.north +
						dirX.north * (rectWidth - CLASSROOM_WIDTH) +
						dirY.north * currentYSecundaria;

					const banoData = createRoomCorners(
						xBano,
						yBano,
						CLASSROOM_WIDTH,
						BANO_HEIGHT
					);
					elementos.banos.push({
						nivel: "Secundaria",
						realCorners: banoData.realCorners,
					});
					currentYSecundaria += BANO_HEIGHT;

					const xEsc =
						origin.east +
						dirX.east * (rectWidth - CLASSROOM_WIDTH) +
						dirY.east * currentYSecundaria;
					const yEsc =
						origin.north +
						dirX.north * (rectWidth - CLASSROOM_WIDTH) +
						dirY.north * currentYSecundaria;

					const escaleraData = createRoomCorners(
						xEsc,
						yEsc,
						CLASSROOM_WIDTH,
						ESCALERA_HEIGHT
					);
					elementos.escaleras.push({
						nivel: "Secundaria",
						realCorners: escaleraData.realCorners,
					});
					currentYSecundaria += ESCALERA_HEIGHT;
				}

				const x =
					origin.east +
					dirX.east * (rectWidth - CLASSROOM_WIDTH) +
					dirY.east * currentYSecundaria;
				const y =
					origin.north +
					dirX.north * (rectWidth - CLASSROOM_WIDTH) +
					dirY.north * currentYSecundaria;

				const aulaData = createRoomCorners(
					x,
					y,
					CLASSROOM_WIDTH,
					CLASSROOM_HEIGHT
				);
				elementos.secundaria.push({
					realCorners: aulaData.realCorners,
				});
				currentYSecundaria += CLASSROOM_HEIGHT;
			}

			if (
				laboratorioEnSecundaria &&
				numeroPiso === 1 &&
				floorData.secundaria > 0
			) {
				const x =
					origin.east +
					dirX.east * (rectWidth - CLASSROOM_WIDTH) +
					dirY.east * currentYSecundaria;
				const y =
					origin.north +
					dirX.north * (rectWidth - CLASSROOM_WIDTH) +
					dirY.north * currentYSecundaria;

				const laboratorioData = createRoomCorners(
					x,
					y,
					laboratorioEnSecundaria.ancho,
					laboratorioEnSecundaria.alto
				);
				elementos.ambientes.push({
					nombre: laboratorioEnSecundaria.nombre,
					tipo: "pabellon",
					realCorners: laboratorioData.realCorners,
				});
			}

			// CANCHA Y LATERALES
			if (numeroPiso === 1) {
				const lateralesCancha =
					distribution.ambientesLateralesCancha || [];

				const totalWidthLaterales = lateralesCancha.reduce(
					(sum, amb) => sum + amb.ancho,
					0
				);
				const maxHeightLaterales =
					lateralesCancha.length > 0
						? Math.max(...lateralesCancha.map((amb) => amb.alto))
						: 0;

				const totalBloqueHeight =
					CANCHA_HEIGHT +
					(lateralesCancha.length > 0
						? SEPARACION_CANCHA + maxHeightLaterales
						: 0);

				const startY = (rectHeight - totalBloqueHeight) / 2;

				const canchaX = (rectWidth - CANCHA_WIDTH) / 2;
				const canchaOrigin = {
					east:
						origin.east + dirX.east * canchaX + dirY.east * startY,
					north:
						origin.north +
						dirX.north * canchaX +
						dirY.north * startY,
				};

				const canchaData = createRoomCorners(
					canchaOrigin.east,
					canchaOrigin.north,
					CANCHA_WIDTH,
					CANCHA_HEIGHT
				);
				elementos.cancha = canchaData.realCorners;

				if (lateralesCancha.length > 0) {
					const lateralesX = (rectWidth - totalWidthLaterales) / 2;
					const lateralesY =
						startY + CANCHA_HEIGHT + SEPARACION_CANCHA;

					let currentXLateral = lateralesX;
					lateralesCancha.forEach((ambiente) => {
						const x =
							origin.east +
							dirX.east * currentXLateral +
							dirY.east * lateralesY;
						const y =
							origin.north +
							dirX.north * currentXLateral +
							dirY.north * lateralesY;

						const lateralData = createRoomCorners(
							x,
							y,
							ambiente.ancho,
							ambiente.alto
						);
						elementos.laterales.push({
							nombre: ambiente.nombre,
							realCorners: lateralData.realCorners,
						});
						currentXLateral += ambiente.ancho;
					});
				}
			}

			return elementos;
		};

		// [RESTO DEL CÓDIGO IGUAL - recopilar pisos, generar DXF, etc.]
		const todosPisos = [];

		if (distribution.floors[1]) {
			const elementos1 = obtenerElementosPiso(1);
			console.log("✅ Piso 1 - Inicial:", elementos1.inicial?.length);
			todosPisos.push({
				piso: 1,
				elementos: elementos1,
				altura: 3.0,
			});
		}

		if (distribution.floors[2] && distribution.totalFloors >= 2) {
			const elementos2 = obtenerElementosPiso(2);
			console.log("✅ Piso 2 - Inicial:", elementos2.inicial?.length);
			todosPisos.push({
				piso: 2,
				elementos: elementos2,
				altura: 3.0,
			});
		}

		// Generar DXF
		let dxfContent = generateDXFHeader();
		const layers = {
			Inicial: 1,
			Primaria: 5,
			Secundaria: 1,
			Servicios: 6,
			Circulación: 8,
			Superior: 4,
			Medio: 30,
			Acceso: 8,
		};
		dxfContent += generateLayers(layers);
		dxfContent += generateBlockDefinitions(include3D);

		// [TODO EL CÓDIGO DE INSERCIÓN IGUAL]
		todosPisos.forEach(({ piso, elementos, altura }) => {
			const elevacion = (piso - 1) * altura;

			let contadores = { inicial: 1, primaria: 1, secundaria: 1 };

			// ✅ NUEVO: Función para insertar BLOQUE en lugar de geometría directa
			const insertarBloque = (
				realCorners,
				nombreBloque,
				nombreInstancia,
				layer,
				ancho,
				largo
			) => {
				if (!realCorners || realCorners.length < 4) {
					console.log(
						`⚠️ Skipping ${nombreInstancia} - no realCorners`
					);
					return;
				}

				// Calcular centro para el texto
				const centerX = (realCorners[0].east + realCorners[2].east) / 2;
				const centerY =
					(realCorners[0].north + realCorners[2].north) / 2;

				// Calcular ángulo de rotación
				const dx = realCorners[1].east - realCorners[0].east;
				const dy = realCorners[1].north - realCorners[0].north;
				const rotacion = (Math.atan2(dy, dx) * 180) / Math.PI;

				// ✅ Insertar el BLOQUE
				dxfContent += generateBlockInsert(
					nombreBloque,
					realCorners[0].east,
					realCorners[0].north,
					elevacion,
					rotacion,
					layer
				);

				// Agregar texto separado (no forma parte del bloque, para editarlo independiente)
				dxfContent += generateText(
					nombreInstancia,
					centerX,
					centerY,
					elevacion + 0.5,
					0.5,
					layer
				);

				// Dimensiones como texto
				const dimText = `${ancho.toFixed(1)}x${largo.toFixed(1)}m`;
				dxfContent += generateText(
					dimText,
					centerX,
					centerY - 0.8,
					elevacion + 0.5,
					0.3,
					layer
				);

				console.log(
					`   ✅ Insertado ${nombreBloque}: ${nombreInstancia}`
				);
			};

			// Aulas Inicial
			elementos.inicial?.forEach((aula) => {
				insertarBloque(
					aula.realCorners,
					"AULA_INICIAL",
					`Aula Inicial ${contadores.inicial++} - P${piso}`,
					"Inicial",
					CLASSROOM_WIDTH,
					CLASSROOM_HEIGHT
				);
			});

			// Aulas Primaria
			elementos.primaria?.forEach((aula) => {
				insertarBloque(
					aula.realCorners,
					"AULA_PRIMARIA",
					`Aula Primaria ${contadores.primaria++} - P${piso}`,
					"Primaria",
					CLASSROOM_WIDTH,
					CLASSROOM_HEIGHT
				);
			});

			// Aulas Secundaria
			elementos.secundaria?.forEach((aula) => {
				insertarBloque(
					aula.realCorners,
					"AULA_SECUNDARIA",
					`Aula Secundaria ${contadores.secundaria++} - P${piso}`,
					"Secundaria",
					CLASSROOM_WIDTH,
					CLASSROOM_HEIGHT
				);
			});

			// Baños
			elementos.banos?.forEach((bano) => {
				insertarBloque(
					bano.realCorners,
					"BANO",
					`SSHH ${bano.nivel} - P${piso}`,
					"Servicios",
					BANO_WIDTH,
					BANO_HEIGHT
				);
			});

			// Escaleras
			elementos.escaleras?.forEach((esc) => {
				insertarBloque(
					esc.realCorners,
					"ESCALERA",
					`Escalera ${esc.nivel} - P${piso}`,
					"Circulación",
					ESCALERA_WIDTH,
					ESCALERA_HEIGHT
				);
			});

			// Ambientes complementarios
			elementos.ambientes?.forEach((amb) => {
				const dim = dimensiones[amb.nombre];
				if (dim) {
					insertarBloque(
						amb.realCorners,
						"AMBIENTE_COMP",
						`${amb.nombre} - P${piso}`,
						"Superior",
						dim.width,
						dim.height
					);
				}
			});

			// Laterales
			elementos.laterales?.forEach((lat) => {
				const dim = dimensiones[lat.nombre];
				if (dim) {
					insertarBloque(
						lat.realCorners,
						"LATERAL",
						`${lat.nombre} - P${piso}`,
						"Medio",
						dim.width,
						dim.height
					);
				}
			});

			// Entrada (solo piso 1)
			if (piso === 1 && elementos.entrada) {
				insertarBloque(
					elementos.entrada.realCorners,
					"ENTRADA",
					"Entrada Principal",
					"Acceso",
					ENTRADA_WIDTH,
					CLASSROOM_HEIGHT
				);
			}

			// Cancha (solo piso 1)
			if (piso === 1 && elementos.cancha) {
				insertarBloque(
					elementos.cancha,
					"CANCHA",
					"Losa Deportiva",
					"Medio",
					CANCHA_WIDTH,
					CANCHA_HEIGHT
				);
			}
		});

		// ✅ Terreno normalizado
		if (coordinates.length >= 3) {
			const terrainCorners = coordinates.map((c) => normalizeCoord(c));
			dxfContent += generatePolyline(terrainCorners, "0", 0, true);
			dxfContent += generateText(
				"LÍMITE DEL TERRENO",
				terrainCorners[0].east,
				terrainCorners[0].north + 2,
				0,
				1.0,
				"0"
			);
		}

		dxfContent += generateDXFFooter();

		// Descargar
		const blob = new Blob([dxfContent], { type: "application/dxf" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		const tipo = include3D ? "3D" : "2D";
		a.download = `distribucion_${
			school.nombre || "colegio"
		}_NORMALIZADO_${tipo}_${Date.now()}.dxf`;
		a.click();
		URL.revokeObjectURL(url);

		console.log(`✅ DXF NORMALIZADO ${tipo} exportado`);
		console.log(
			`📍 Coordenadas trasladadas ${offsetEast.toFixed(
				2
			)} este, ${offsetNorth.toFixed(2)} norte al origen`
		);
	};

	function generateDXFHeader() {
		return `0
SECTION
2
HEADER
9
$ACADVER
1
AC1015
9
$INSUNITS
70
6
0
ENDSEC
0
SECTION
2
TABLES
0
TABLE
2
LTYPE
70
1
0
LTYPE
2
CONTINUOUS
70
0
3
Solid line
72
65
73
0
40
0.0
0
ENDTAB
`;
	}

	function generateLayers(layers) {
		let layerSection = `0
TABLE
2
LAYER
70
${Object.keys(layers).length}
`;

		for (const [name, color] of Object.entries(layers)) {
			layerSection += `0
LAYER
2
${name}
70
0
62
${color}
6
CONTINUOUS
`;
		}

		layerSection += `0
ENDTAB
0
ENDSEC
`;

		return layerSection;
	}

	// ✅ NUEVA FUNCIÓN: Definir todos los bloques
	function generateBlockDefinitions(include3D) {
		const alturaBloque = 3.0;

		let blocks = `0
SECTION
2
BLOCKS
`;

		const bloquesDef = [
			{
				nombre: "AULA_INICIAL",
				ancho: CLASSROOM_WIDTH,
				alto: CLASSROOM_HEIGHT,
				color: 1,
				layer: "Inicial",
			},
			{
				nombre: "AULA_PRIMARIA",
				ancho: CLASSROOM_WIDTH,
				alto: CLASSROOM_HEIGHT,
				color: 5,
				layer: "Primaria",
			},
			{
				nombre: "AULA_SECUNDARIA",
				ancho: CLASSROOM_WIDTH,
				alto: CLASSROOM_HEIGHT,
				color: 1,
				layer: "Secundaria",
			},
			{
				nombre: "BANO",
				ancho: BANO_WIDTH,
				alto: BANO_HEIGHT,
				color: 6,
				layer: "Servicios",
			},
			{
				nombre: "ESCALERA",
				ancho: ESCALERA_WIDTH,
				alto: ESCALERA_HEIGHT,
				color: 8,
				layer: "Circulación",
			},
			{
				nombre: "AMBIENTE_COMP",
				ancho: 7.8,
				alto: 7.5,
				color: 4,
				layer: "Superior",
			},
			{
				nombre: "LATERAL",
				ancho: 5,
				alto: 7.5,
				color: 30,
				layer: "Medio",
			},
			{
				nombre: "ENTRADA",
				ancho: ENTRADA_WIDTH,
				alto: CLASSROOM_HEIGHT,
				color: 8,
				layer: "Acceso",
			},
			{
				nombre: "CANCHA",
				ancho: CANCHA_WIDTH,
				alto: CANCHA_HEIGHT,
				color: 3,
				layer: "Medio",
			},
		];

		console.log(
			"🔨 Definiendo bloques:",
			bloquesDef.map((b) => b.nombre).join(", ")
		);

		bloquesDef.forEach(({ nombre, ancho, alto, color, layer }) => {
			blocks += `0
BLOCK
8
0
2
${nombre}
70
0
10
0.0
20
0.0
30
0.0
`;

			if (include3D) {
				// Piso
				blocks += `0
3DFACE
8
${layer}
62
${color}
10
0.000000
20
0.000000
30
0.000000
11
${ancho.toFixed(6)}
21
0.000000
31
0.000000
12
${ancho.toFixed(6)}
22
${alto.toFixed(6)}
32
0.000000
13
0.000000
23
${alto.toFixed(6)}
33
0.000000
`;

				// Techo
				blocks += `0
3DFACE
8
${layer}
62
${color}
10
0.000000
20
0.000000
30
${alturaBloque.toFixed(6)}
11
${ancho.toFixed(6)}
21
0.000000
31
${alturaBloque.toFixed(6)}
12
${ancho.toFixed(6)}
22
${alto.toFixed(6)}
32
${alturaBloque.toFixed(6)}
13
0.000000
23
${alto.toFixed(6)}
33
${alturaBloque.toFixed(6)}
`;

				// Pared 1
				blocks += `0
3DFACE
8
${layer}
62
${color}
10
0.000000
20
0.000000
30
0.000000
11
${ancho.toFixed(6)}
21
0.000000
31
0.000000
12
${ancho.toFixed(6)}
22
0.000000
32
${alturaBloque.toFixed(6)}
13
0.000000
23
0.000000
33
${alturaBloque.toFixed(6)}
`;

				// Pared 2
				blocks += `0
3DFACE
8
${layer}
62
${color}
10
${ancho.toFixed(6)}
20
0.000000
30
0.000000
11
${ancho.toFixed(6)}
21
${alto.toFixed(6)}
31
0.000000
12
${ancho.toFixed(6)}
22
${alto.toFixed(6)}
32
${alturaBloque.toFixed(6)}
13
${ancho.toFixed(6)}
23
0.000000
33
${alturaBloque.toFixed(6)}
`;

				// Pared 3
				blocks += `0
3DFACE
8
${layer}
62
${color}
10
${ancho.toFixed(6)}
20
${alto.toFixed(6)}
30
0.000000
11
0.000000
21
${alto.toFixed(6)}
31
0.000000
12
0.000000
22
${alto.toFixed(6)}
32
${alturaBloque.toFixed(6)}
13
${ancho.toFixed(6)}
23
${alto.toFixed(6)}
33
${alturaBloque.toFixed(6)}
`;

				// Pared 4
				blocks += `0
3DFACE
8
${layer}
62
${color}
10
0.000000
20
${alto.toFixed(6)}
30
0.000000
11
0.000000
21
0.000000
31
0.000000
12
0.000000
22
0.000000
32
${alturaBloque.toFixed(6)}
13
0.000000
23
${alto.toFixed(6)}
33
${alturaBloque.toFixed(6)}
`;
			} else {
				// VERSIÓN 2D
				blocks += `0
LWPOLYLINE
8
${layer}
62
${color}
90
4
70
1
10
0.0
20
0.0
10
${ancho.toFixed(3)}
20
0.0
10
${ancho.toFixed(3)}
20
${alto.toFixed(3)}
10
0.0
20
${alto.toFixed(3)}
`;
			}

			blocks += `0
ENDBLK
8
0
`;
		});

		blocks += `0
ENDSEC
0
SECTION
2
ENTITIES
`;

		return blocks;
	}

	// ✅ NUEVA FUNCIÓN: Insertar instancia de bloque
	function generateBlockInsert(blockName, x, y, z, rotation, layer) {
		return `0
INSERT
8
${typeof layer === "string" ? layer : "0"}
2
${blockName}
10
${x.toFixed(6)}
20
${y.toFixed(6)}
30
${z.toFixed(6)}
50
${rotation.toFixed(6)}
`;
	}

	function generatePolyline(corners, layer, elevation = 0, isClosed = true) {
		let polyline = `0
LWPOLYLINE
8
${typeof layer === "string" ? layer : "0"}
62
${typeof layer === "number" ? layer : 7}
90
${corners.length}
70
${isClosed ? 1 : 0}
38
${elevation.toFixed(3)}
`;

		corners.forEach((corner) => {
			polyline += `10
${corner.east.toFixed(6)}
20
${corner.north.toFixed(6)}
`;
		});

		return polyline;
	}

	function generateText(text, x, y, z, height, layer) {
		return `0
TEXT
8
${typeof layer === "string" ? layer : "0"}
62
${typeof layer === "number" ? layer : 7}
10
${x.toFixed(6)}
20
${y.toFixed(6)}
30
${z.toFixed(6)}
40
${height.toFixed(3)}
1
${text}
72
1
73
2
`;
	}

	function generateDXFFooter() {
		return `0
ENDSEC
0
EOF
`;
	}

	const classifyAmbientes = (ambientes) => {
		const enPabellones = [];
		const lateralesCancha = [];
		const superiores = [];

		ambientes.forEach((amb) => {
			const nombre = amb.nombre.toLowerCase();

			// ✅ AMBIENTES QUE VAN EN PABELLONES ESPECÍFICOS (únicos)
			if (nombre.includes("laboratorio")) {
				enPabellones.push({ ...amb, pabellon: "secundaria" });
			} else if (nombre.includes("biblioteca escolar")) {
				enPabellones.push({ ...amb, pabellon: "primaria" });
			} else if (
				nombre.includes("sala de psicomotricidad") ||
				nombre.includes("psicomotricidad")
			) {
				enPabellones.push({ ...amb, pabellon: "inicial" });
			}
			// ✅ AMBIENTES QUE SE DUPLICAN PARA PRIMARIA Y SECUNDARIA
			else if (nombre.includes("taller creativo")) {
				// Duplicar: uno para primaria y otro para secundaria
				enPabellones.push({
					...amb,
					pabellon: "primaria",
					nombre: amb.nombre + " (Primaria)",
				});
				enPabellones.push({
					...amb,
					pabellon: "secundaria",
					nombre: amb.nombre + " (Secundaria)",
				});
			} else if (
				nombre.includes("aula de innovación") ||
				nombre.includes("aula para ept") ||
				nombre.includes("innovación")
			) {
				// Duplicar: uno para primaria y otro para secundaria
				enPabellones.push({
					...amb,
					pabellon: "primaria",
					nombre: amb.nombre + " (Primaria)",
				});
				enPabellones.push({
					...amb,
					pabellon: "secundaria",
					nombre: amb.nombre + " (Secundaria)",
				});
			}
			// ✅ AMBIENTES QUE VAN EN LATERALES DE CANCHA
			else if (
				nombre.includes("cocina escolar") ||
				nombre.includes("comedor") ||
				nombre.includes("sala de usos múltiples") ||
				nombre.includes("sum") ||
				nombre.includes("topico") ||
				nombre.includes("lactario") ||
				nombre.includes("taller ept")
			) {
				lateralesCancha.push(amb);
			}
			// ✅ EL RESTO VA EN PABELLÓN SUPERIOR
			else {
				superiores.push(amb);
			}
		});

		// ✅ AJUSTAR DIMENSIONES SEGÚN MODO
		if (layoutMode === "vertical") {
			// En modo vertical, primaria y secundaria son HORIZONTALES → INVERTIR
			console.log("en pabellones :::", enPabellones);
			enPabellones.forEach((ambiente) => {
				if (
					ambiente.pabellon === "primaria" ||
					ambiente.pabellon === "secundaria"
				) {
					const anchoOriginal = ambiente.ancho;
					const altoOriginal = ambiente.alto;

					// Invertir dimensiones
					ambiente.ancho = altoOriginal;
					ambiente.alto = anchoOriginal;

					console.log(
						`🔄 ${ambiente.nombre}: ${anchoOriginal.toFixed(
							1
						)}x${altoOriginal.toFixed(
							1
						)} → ${ambiente.ancho.toFixed(
							1
						)}x${ambiente.alto.toFixed(1)}`
					);
				}

				// Inicial queda vertical → NO invertir
			});

			superiores.forEach((ambiente) => {
				const anchoOriginal = ambiente.ancho;
				const altoOriginal = ambiente.alto;

				// Invertir dimensiones
				ambiente.ancho = altoOriginal;
				ambiente.alto = anchoOriginal;

				console.log(
					`🔄 Superior: ${ambiente.nombre}: ${anchoOriginal.toFixed(
						1
					)}x${altoOriginal.toFixed(1)} → ${ambiente.ancho.toFixed(
						1
					)}x${ambiente.alto.toFixed(1)}`
				);
			});

			// Ambientes superiores ahora van a la derecha (vertical) → NO invertir
			// Laterales de cancha → NO invertir (se ajustan automáticamente)
		}

		return { enPabellones, lateralesCancha, superiores };
	};

	// const classifyAmbientes = (ambientes) => {
	// 	const enPabellones = [];
	// 	const lateralesCancha = [];
	// 	const superiores = [];

	// 	ambientes.forEach((amb) => {
	// 		const nombre = amb.nombre.toLowerCase();

	// 		// ✅ AMBIENTES QUE VAN EN PABELLONES ESPECÍFICOS (únicos)
	// 		if (nombre.includes("laboratorio")) {
	// 			enPabellones.push({
	// 				...amb,
	// 				pabellon: "secundaria",
	// 				ancho: amb.width,  // ✅ Inicializar ancho/alto
	// 				alto: amb.height
	// 			});
	// 		} else if (nombre.includes("biblioteca escolar")) {
	// 			enPabellones.push({
	// 				...amb,
	// 				pabellon: "primaria",
	// 				ancho: amb.width,  // ✅ Inicializar ancho/alto
	// 				alto: amb.height
	// 			});
	// 		} else if (
	// 			nombre.includes("sala de psicomotricidad") ||
	// 			nombre.includes("psicomotricidad")
	// 		) {
	// 			enPabellones.push({
	// 				...amb,
	// 				pabellon: "inicial",
	// 				ancho: amb.width,  // ✅ Inicializar ancho/alto
	// 				alto: amb.height
	// 			});
	// 		}
	// 		// ✅ AMBIENTES QUE SE DUPLICAN PARA PRIMARIA Y SECUNDARIA
	// 		else if (nombre.includes("taller creativo")) {
	// 			enPabellones.push({
	// 				...amb,
	// 				pabellon: "primaria",
	// 				nombre: amb.nombre + " (Primaria)",
	// 				ancho: amb.width,  // ✅ Inicializar ancho/alto
	// 				alto: amb.height
	// 			});
	// 			enPabellones.push({
	// 				...amb,
	// 				pabellon: "secundaria",
	// 				nombre: amb.nombre + " (Secundaria)",
	// 				ancho: amb.width,  // ✅ Inicializar ancho/alto
	// 				alto: amb.height
	// 			});
	// 		} else if (
	// 			nombre.includes("aula de innovación") ||
	// 			nombre.includes("aula para ept") ||
	// 			nombre.includes("innovación")
	// 		) {
	// 			enPabellones.push({
	// 				...amb,
	// 				pabellon: "primaria",
	// 				nombre: amb.nombre + " (Primaria)",
	// 				ancho: amb.width,  // ✅ Inicializar ancho/alto
	// 				alto: amb.height
	// 			});
	// 			enPabellones.push({
	// 				...amb,
	// 				pabellon: "secundaria",
	// 				nombre: amb.nombre + " (Secundaria)",
	// 				ancho: amb.width,  // ✅ Inicializar ancho/alto
	// 				alto: amb.height
	// 			});
	// 		}
	// 		// ✅ AMBIENTES QUE VAN EN LATERALES DE CANCHA
	// 		else if (
	// 			nombre.includes("cocina escolar") ||
	// 			nombre.includes("comedor") ||
	// 			nombre.includes("sala de usos múltiples") ||
	// 			nombre.includes("sum") ||
	// 			nombre.includes("topico") ||
	// 			nombre.includes("lactario") ||
	// 			nombre.includes("taller ept")
	// 		) {
	// 			lateralesCancha.push({
	// 				...amb,
	// 				ancho: amb.width,  // ✅ Inicializar ancho/alto
	// 				alto: amb.height
	// 			});
	// 		}
	// 		// ✅ EL RESTO VA EN PABELLÓN SUPERIOR
	// 		else {
	// 			superiores.push({
	// 				...amb,
	// 				ancho: amb.width,  // ✅ Inicializar ancho/alto
	// 				alto: amb.height
	// 			});
	// 		}
	// 	});

	// 	// ✅ AHORA SÍ INVERTIR (porque ancho/alto ya existen)
	// 	if (layoutMode === "vertical") {
	// 		// Invertir primaria y secundaria
	// 		enPabellones.forEach((ambiente) => {
	// 			if (ambiente.pabellon === "primaria" || ambiente.pabellon === "secundaria") {
	// 				const temp = ambiente.ancho;
	// 				ambiente.ancho = ambiente.alto;
	// 				ambiente.alto = temp;

	// 				//console.log(`🔄 Pabellón: ${ambiente.nombre}: ${temp.toFixed(1)}x${ambiente.alto.toFixed(1)} → ${ambiente.ancho.toFixed(1)}x${ambiente.alto.toFixed(1)}`);
	// 			}
	// 		});

	// 		// Invertir ambientes superiores
	// 		superiores.forEach((ambiente) => {
	// 			const temp = ambiente.ancho;
	// 			ambiente.ancho = ambiente.alto;
	// 			ambiente.alto = temp;

	// 			console.log(`🔄 Superior: ${ambiente.nombre}: ${temp.toFixed(1)}x${ambiente.alto.toFixed(1)} → ${ambiente.ancho.toFixed(1)}x${ambiente.alto.toFixed(1)}`);
	// 		});
	// 	}

	// 	return { enPabellones, lateralesCancha, superiores };
	// };

	const distribuirEnCuadranteInterior = (cuadrante, lateralesCancha) => {
		const resultado = {
			cancha: null,
			ambientesTop: [],
			ambientesBottom: [],
			ambientesLeft: [],
			ambientesRight: [],
		};

		if (lateralesCancha.length === 0) {
			return resultado;
		}

		// ✅ CANCHA SIEMPRE HORIZONTAL (28 ancho x 15 alto)
		const CANCHA_IDEAL_ANCHO = 28;
		const CANCHA_IDEAL_ALTO = 15;
		const CANCHA_MIN_WIDTH = 15;
		const CANCHA_MIN_HEIGHT = 10;
		const RATIO_CANCHA = CANCHA_IDEAL_ALTO / CANCHA_IDEAL_ANCHO; // 0.536
		const SEPARACION_CANCHA_REDUCIDA = 3.0;

		let mejorOrientacionCancha = null;

		// ✅ CALCULAR TAMAÑO AJUSTADO MANTENIENDO SIEMPRE HORIZONTAL
		let anchoDisponible = cuadrante.width * 0.65; // Usar más espacio
		let altoDisponible = cuadrante.height * 0.65;

		// Intentar desde el ancho (prioridad)
		let anchoAjustado = Math.min(CANCHA_IDEAL_ANCHO, anchoDisponible);
		let altoAjustado = anchoAjustado * RATIO_CANCHA;

		// Si el alto no cabe, ajustar proporcionalmente PERO mantener horizontal
		if (altoAjustado > altoDisponible) {
			altoAjustado = altoDisponible;
			anchoAjustado = altoAjustado / RATIO_CANCHA;
		}

		// ✅ VERIFICACIÓN CRÍTICA: Asegurar que SIEMPRE ancho > alto
		if (anchoAjustado < altoAjustado) {
			console.warn(
				"⚠️ Cancha se iba a voltear. Ajustando para mantener horizontal."
			);
			// Forzar horizontal usando el espacio disponible más pequeño
			if (anchoDisponible >= altoDisponible * (1 / RATIO_CANCHA)) {
				// Hay más espacio horizontal, ajustar desde el alto
				altoAjustado = Math.min(CANCHA_IDEAL_ALTO, altoDisponible);
				anchoAjustado = altoAjustado / RATIO_CANCHA;
			} else {
				// Hay más espacio vertical, ajustar desde el ancho
				anchoAjustado = Math.min(CANCHA_IDEAL_ANCHO, anchoDisponible);
				altoAjustado = anchoAjustado * RATIO_CANCHA;
			}
		}

		// ✅ VERIFICAR LÍMITES MÍNIMOS
		const cumpleMinimos =
			anchoAjustado >= CANCHA_MIN_WIDTH &&
			altoAjustado >= CANCHA_MIN_HEIGHT &&
			anchoAjustado > altoAjustado; // ✅ FORZAR horizontal

		if (cumpleMinimos) {
			mejorOrientacionCancha = {
				width: anchoAjustado,
				height: altoAjustado,
				rotada: false,
				x: cuadrante.x + (cuadrante.width - anchoAjustado) / 2,
				y: cuadrante.y + (cuadrante.height - altoAjustado) / 2,
			};

			console.log("✅ Cancha HORIZONTAL:", {
				cuadrante: `${cuadrante.width.toFixed(
					1
				)} x ${cuadrante.height.toFixed(1)}`,
				cancha: `${anchoAjustado.toFixed(1)} x ${altoAjustado.toFixed(
					1
				)}`,
				esHorizontal: anchoAjustado > altoAjustado,
				ratio: (altoAjustado / anchoAjustado).toFixed(3),
			});
		} else {
			console.warn("❌ Cancha NO CABE o no cumple horizontal:", {
				cuadrante: `${cuadrante.width.toFixed(
					1
				)} x ${cuadrante.height.toFixed(1)}`,
				intentoCancha: `${anchoAjustado.toFixed(
					1
				)} x ${altoAjustado.toFixed(1)}`,
				cumpleMinimos: `ancho >= ${CANCHA_MIN_WIDTH}: ${
					anchoAjustado >= CANCHA_MIN_WIDTH
				}, alto >= ${CANCHA_MIN_HEIGHT}: ${
					altoAjustado >= CANCHA_MIN_HEIGHT
				}, horizontal: ${anchoAjustado > altoAjustado}`,
			});
		}

		resultado.cancha = mejorOrientacionCancha;

		// ✅ CALCULAR ESPACIOS DISPONIBLES
		const espaciosDisponibles = mejorOrientacionCancha
			? {
					top: {
						x: cuadrante.x,
						y: cuadrante.y,
						width: cuadrante.width,
						height:
							mejorOrientacionCancha.y -
							cuadrante.y -
							SEPARACION_CANCHA_REDUCIDA,
						ocupado: 0,
					},
					bottom: {
						x: cuadrante.x,
						y:
							mejorOrientacionCancha.y +
							mejorOrientacionCancha.height +
							SEPARACION_CANCHA_REDUCIDA,
						width: cuadrante.width,
						height:
							cuadrante.y +
							cuadrante.height -
							(mejorOrientacionCancha.y +
								mejorOrientacionCancha.height) -
							SEPARACION_CANCHA_REDUCIDA,
						ocupado: 0,
					},
					left: {
						x: cuadrante.x,
						y: mejorOrientacionCancha.y,
						width:
							mejorOrientacionCancha.x -
							cuadrante.x -
							SEPARACION_CANCHA_REDUCIDA,
						height: mejorOrientacionCancha.height,
						ocupado: 0,
					},
					right: {
						x:
							mejorOrientacionCancha.x +
							mejorOrientacionCancha.width +
							SEPARACION_CANCHA_REDUCIDA,
						y: mejorOrientacionCancha.y,
						width:
							cuadrante.x +
							cuadrante.width -
							(mejorOrientacionCancha.x +
								mejorOrientacionCancha.width) -
							SEPARACION_CANCHA_REDUCIDA,
						height: mejorOrientacionCancha.height,
						ocupado: 0,
					},
			  }
			: {
					bottom: {
						x: cuadrante.x,
						y: cuadrante.y,
						width: cuadrante.width,
						height: cuadrante.height,
						ocupado: 0,
					},
					top: { x: 0, y: 0, width: 0, height: 0, ocupado: 0 },
					left: { x: 0, y: 0, width: 0, height: 0, ocupado: 0 },
					right: { x: 0, y: 0, width: 0, height: 0, ocupado: 0 },
			  };

		// ✅ DISTRIBUIR AMBIENTES
		// ✅ PASO 1: AGRUPAR COCINA Y COMEDOR
		const ambientesAgrupados = [];
		const cocina = lateralesCancha.find((a) =>
			a.nombre.toLowerCase().includes("cocina")
		);
		const comedor = lateralesCancha.find((a) =>
			a.nombre.toLowerCase().includes("comedor")
		);

		// Si hay cocina Y comedor, agruparlos
		if (cocina && comedor) {
			ambientesAgrupados.push({
				tipo: "grupo_cocina_comedor",
				ambientes: [cocina, comedor],
				// El ancho total es la suma (van uno al lado del otro)
				ancho: cocina.ancho + comedor.ancho,
				alto: Math.max(cocina.alto, comedor.alto),
				nombre: "Cocina + Comedor",
			});

			// Agregar el resto de ambientes (excepto cocina y comedor)
			lateralesCancha.forEach((ambiente) => {
				if (ambiente !== cocina && ambiente !== comedor) {
					ambientesAgrupados.push({
						tipo: "individual",
						ambientes: [ambiente],
						ancho: ambiente.ancho,
						alto: ambiente.alto,
						nombre: ambiente.nombre,
					});
				}
			});
		} else {
			// Si no hay grupo, todos son individuales
			lateralesCancha.forEach((ambiente) => {
				ambientesAgrupados.push({
					tipo: "individual",
					ambientes: [ambiente],
					ancho: ambiente.ancho,
					alto: ambiente.alto,
					nombre: ambiente.nombre,
				});
			});
		}

		// Ordenar por área (más grandes primero)
		ambientesAgrupados.sort((a, b) => b.ancho * b.alto - a.ancho * a.alto);

		// ✅ PASO 2: DISTRIBUIR POR LADO Y CALCULAR POSICIONES
		const ambientesPorLado = {
			bottom: [],
			top: [],
			left: [],
			right: [],
		};

		ambientesAgrupados.forEach((grupo) => {
			let mejorLado = null;
			let mejorPuntuacion = -1;

			["bottom", "top", "left", "right"].forEach((nombreLado) => {
				const espacio = espaciosDisponibles[nombreLado];
				let cabe = false;
				let puntuacion = 0;

				if (nombreLado === "bottom" || nombreLado === "top") {
					// Lados horizontales
					const espacioRestante = espacio.width - espacio.ocupado;
					cabe =
						grupo.ancho <= espacioRestante &&
						grupo.alto <= espacio.height;

					if (cabe) {
						puntuacion = espacioRestante - grupo.ancho;
						// Preferencia: bottom > top
						if (nombreLado === "bottom") puntuacion += 100;
						if (nombreLado === "top") puntuacion += 80;
					}
				} else {
					// Lados verticales
					const espacioRestante = espacio.height - espacio.ocupado;
					cabe =
						grupo.ancho <= espacio.width &&
						grupo.alto <= espacioRestante;

					if (cabe) {
						puntuacion = espacioRestante - grupo.alto;
						// Preferencia: left > right (para cocina/comedor cerca de entrada)
						if (nombreLado === "left") puntuacion += 90;
						if (nombreLado === "right") puntuacion += 60;
					}
				}

				if (cabe && puntuacion > mejorPuntuacion) {
					mejorPuntuacion = puntuacion;
					mejorLado = nombreLado;
				}
			});

			if (mejorLado) {
				const espacio = espaciosDisponibles[mejorLado];
				ambientesPorLado[mejorLado].push(grupo);

				// Marcar espacio ocupado
				if (mejorLado === "bottom" || mejorLado === "top") {
					espacio.ocupado += grupo.ancho;
				} else {
					espacio.ocupado += grupo.alto;
				}
			} else {
				console.warn("⚠️ Grupo sin espacio:", grupo.nombre);
			}
		});

		// ✅ PASO 3: CALCULAR POSICIONES CENTRADAS Y PEGADAS A LA CANCHA

		Object.keys(ambientesPorLado).forEach((nombreLado) => {
			const grupos = ambientesPorLado[nombreLado];
			if (grupos.length === 0) return;

			const espacio = espaciosDisponibles[nombreLado];

			if (nombreLado === "bottom" || nombreLado === "top") {
				// ===================================
				// HORIZONTAL
				// ===================================
				const anchoTotal = grupos.reduce((sum, g) => sum + g.ancho, 0);

				let posicionInicialX, posicionY;

				if (mejorOrientacionCancha) {
					// ✅ CON CANCHA: Centrar alrededor de la cancha
					posicionInicialX =
						mejorOrientacionCancha.x +
						(mejorOrientacionCancha.width - anchoTotal) / 2;

					if (nombreLado === "bottom") {
						posicionY =
							mejorOrientacionCancha.y +
							mejorOrientacionCancha.height +
							SEPARACION_CANCHA_REDUCIDA;
					} else {
						const altoMaximo = Math.max(
							...grupos.map((g) => g.alto)
						);
						posicionY =
							mejorOrientacionCancha.y -
							SEPARACION_CANCHA_REDUCIDA -
							altoMaximo;
					}
				} else {
					// ✅ SIN CANCHA: Centrar en el cuadrante completo
					posicionInicialX =
						espacio.x + (espacio.width - anchoTotal) / 2;

					if (nombreLado === "bottom") {
						posicionY = espacio.y;
					} else {
						const altoMaximo = Math.max(
							...grupos.map((g) => g.alto)
						);
						posicionY = espacio.y + espacio.height - altoMaximo;
					}
				}

				// Colocar grupos
				grupos.forEach((grupo) => {
					const AJUSTE_PEGADO = 0.1;

					if (grupo.tipo === "grupo_cocina_comedor") {
						const [cocina, comedor] = grupo.ambientes;

						if (nombreLado === "bottom") {
							resultado.ambientesBottom.push({
								...cocina,
								x: posicionInicialX,
								y: posicionY,
							});

							resultado.ambientesBottom.push({
								...comedor,
								x:
									posicionInicialX +
									cocina.ancho -
									AJUSTE_PEGADO,
								y: posicionY,
							});
						} else {
							resultado.ambientesTop.push({
								...cocina,
								x: posicionInicialX,
								y: posicionY,
							});

							resultado.ambientesTop.push({
								...comedor,
								x:
									posicionInicialX +
									cocina.ancho -
									AJUSTE_PEGADO,
								y: posicionY,
							});
						}
					} else {
						const ambiente = grupo.ambientes[0];

						if (nombreLado === "bottom") {
							resultado.ambientesBottom.push({
								...ambiente,
								x: posicionInicialX,
								y: posicionY,
							});
						} else {
							resultado.ambientesTop.push({
								...ambiente,
								x: posicionInicialX,
								y: posicionY,
							});
						}
					}

					posicionInicialX += grupo.ancho;
				});
			} else {
				// ===================================
				// VERTICAL
				// ===================================
				const altoTotal = grupos.reduce((sum, g) => sum + g.alto, 0);

				let posicionInicialY, posicionX;

				if (mejorOrientacionCancha) {
					// ✅ CON CANCHA: Centrar alrededor de la cancha
					posicionInicialY =
						mejorOrientacionCancha.y +
						(mejorOrientacionCancha.height - altoTotal) / 2;

					if (nombreLado === "left") {
						const anchoMaximo = Math.max(
							...grupos.map((g) => g.ancho)
						);
						posicionX =
							mejorOrientacionCancha.x -
							SEPARACION_CANCHA_REDUCIDA -
							anchoMaximo;
					} else {
						posicionX =
							mejorOrientacionCancha.x +
							mejorOrientacionCancha.width +
							SEPARACION_CANCHA_REDUCIDA;
					}
				} else {
					// ✅ SIN CANCHA: Centrar en el cuadrante completo
					posicionInicialY =
						espacio.y + (espacio.height - altoTotal) / 2;

					if (nombreLado === "left") {
						const anchoMaximo = Math.max(
							...grupos.map((g) => g.ancho)
						);
						posicionX = espacio.x + espacio.width - anchoMaximo;
					} else {
						posicionX = espacio.x;
					}
				}

				// Colocar grupos
				grupos.forEach((grupo) => {
					const AJUSTE_PEGADO = 0.1;

					if (grupo.tipo === "grupo_cocina_comedor") {
						const [cocina, comedor] = grupo.ambientes;

						if (nombreLado === "left") {
							resultado.ambientesLeft.push({
								...cocina,
								x: posicionX,
								y: posicionInicialY,
							});

							resultado.ambientesLeft.push({
								...comedor,
								x: posicionX,
								y:
									posicionInicialY +
									cocina.alto -
									AJUSTE_PEGADO,
							});
						} else {
							resultado.ambientesRight.push({
								...cocina,
								x: posicionX,
								y: posicionInicialY,
							});

							resultado.ambientesRight.push({
								...comedor,
								x: posicionX,
								y:
									posicionInicialY +
									cocina.alto -
									AJUSTE_PEGADO,
							});
						}
					} else {
						const ambiente = grupo.ambientes[0];

						if (nombreLado === "left") {
							resultado.ambientesLeft.push({
								...ambiente,
								x: posicionX,
								y: posicionInicialY,
							});
						} else {
							resultado.ambientesRight.push({
								...ambiente,
								x: posicionX,
								y: posicionInicialY,
							});
						}
					}

					posicionInicialY += grupo.alto;
				});
			}
		});

		console.log("📐 Distribución de ambientes:", {
			bottom: ambientesPorLado.bottom.map((g) => g.nombre),
			top: ambientesPorLado.top.map((g) => g.nombre),
			left: ambientesPorLado.left.map((g) => g.nombre),
			right: ambientesPorLado.right.map((g) => g.nombre),
		});

		return resultado;
	};

	const calcularCuadranteInterior = (floorData, rectWidth, rectHeight) => {
		// Calcular espacio ocupado por cada pabellón

		// PABELLÓN INFERIOR (Inicial) - horizontal
		const altoInferior = CLASSROOM_HEIGHT;

		// PABELLÓN SUPERIOR - horizontal
		const altoSuperior = CLASSROOM_HEIGHT;

		// PABELLÓN PRIMARIA - vertical (izquierda)
		const inicioPrimaria = CLASSROOM_HEIGHT + CIRCULACION_ENTRE_PABELLONES;
		const anchoPrimaria = CLASSROOM_WIDTH;

		// PABELLÓN SECUNDARIA - vertical (derecha)
		const inicioSecundaria =
			CLASSROOM_HEIGHT + CIRCULACION_ENTRE_PABELLONES;
		const anchoSecundaria = CLASSROOM_WIDTH;

		// CUADRANTE INTERIOR = espacio entre todos los pabellones
		const cuadranteInterior = {
			// Posición relativa al rectángulo
			x: anchoPrimaria + CIRCULACION_LATERAL, // Después del pabellón primaria
			y: altoInferior + CIRCULACION_ENTRE_PABELLONES, // Después del pabellón inferior
			width:
				rectWidth -
				anchoPrimaria -
				anchoSecundaria -
				CIRCULACION_LATERAL * 2,
			height:
				rectHeight -
				altoInferior -
				altoSuperior -
				CIRCULACION_ENTRE_PABELLONES * 2,
		};

		return cuadranteInterior;
	};

	const isPointInPolygon = (point, polygon) => {
		let inside = false;
		for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
			const xi = polygon[i].east,
				yi = polygon[i].north;
			const xj = polygon[j].east,
				yj = polygon[j].north;

			const intersect =
				yi > point.north !== yj > point.north &&
				point.east < ((xj - xi) * (point.north - yi)) / (yj - yi) + xi;
			if (intersect) inside = !inside;
		}
		return inside;
	};

	const rotatePoint = (point, angle, center) => {
		const cos = Math.cos(angle);
		const sin = Math.sin(angle);
		const dx = point.east - center.east;
		const dy = point.north - center.north;

		return {
			east: cos * dx - sin * dy + center.east,
			north: sin * dx + cos * dy + center.north,
		};
	};

	const findMaxRectangleAtAngle = (polygon, angle) => {
		const center = {
			east: polygon.reduce((sum, p) => sum + p.east, 0) / polygon.length,
			north:
				polygon.reduce((sum, p) => sum + p.north, 0) / polygon.length,
		};

		const rotatedPolygon = polygon.map((p) =>
			rotatePoint(p, -angle, center)
		);

		const easts = rotatedPolygon.map((p) => p.east);
		const norths = rotatedPolygon.map((p) => p.north);
		const minE = Math.min(...easts);
		const maxE = Math.max(...easts);
		const minN = Math.min(...norths);
		const maxN = Math.max(...norths);

		let maxArea = 0;
		let bestRect = null;

		const step = (maxE - minE) / 20;

		for (let x1 = minE; x1 < maxE; x1 += step) {
			for (let y1 = minN; y1 < maxN; y1 += step) {
				for (let x2 = x1 + step; x2 <= maxE; x2 += step) {
					for (let y2 = y1 + step; y2 <= maxN; y2 += step) {
						const corners = [
							{ east: x1, north: y1 },
							{ east: x2, north: y1 },
							{ east: x2, north: y2 },
							{ east: x1, north: y2 },
						];

						const allInside = corners.every((corner) =>
							isPointInPolygon(corner, rotatedPolygon)
						);

						if (allInside) {
							const area = (x2 - x1) * (y2 - y1);
							if (area > maxArea) {
								maxArea = area;
								bestRect = { x1, y1, x2, y2 };
							}
						}
					}
				}
			}
		}

		if (!bestRect) return null;

		const rectCorners = [
			{ east: bestRect.x1, north: bestRect.y1 },
			{ east: bestRect.x2, north: bestRect.y1 },
			{ east: bestRect.x2, north: bestRect.y2 },
			{ east: bestRect.x1, north: bestRect.y2 },
		].map((p) => rotatePoint(p, angle, center));

		return {
			corners: rectCorners,
			area: maxArea,
			width: Math.abs(bestRect.x2 - bestRect.x1),
			height: Math.abs(bestRect.y2 - bestRect.y1),
			angle: (angle * 180) / Math.PI,
		};
	};

	const calculateMaxRectangle = () => {
		if (coordinates.length < 3) return;

		setIsCalculating(true);

		setTimeout(() => {
			let bestRectangle = null;
			let maxArea = 0;

			for (let degrees = 0; degrees < 180; degrees += 5) {
				const angle = (degrees * Math.PI) / 180;
				const rect = findMaxRectangleAtAngle(coordinates, angle);

				if (rect && rect.area > maxArea) {
					maxArea = rect.area;
					bestRectangle = rect;
				}
			}

			if (bestRectangle) {
				const bestAngle = (bestRectangle.angle * Math.PI) / 180;
				for (let offset = -5; offset <= 5; offset += 0.5) {
					const angle = bestAngle + (offset * Math.PI) / 180;
					const rect = findMaxRectangleAtAngle(coordinates, angle);

					if (rect && rect.area > maxArea) {
						maxArea = rect.area;
						bestRectangle = rect;
					}
				}
			}
			//console.log("best rectangle:::", bestRectangle);

			setMaxRectangle(bestRectangle);
			setIsCalculating(false);
			//console.log("maximo rectangulo::::", maxRectangle);
			calculateCapacity();
		}, 100);
	};

	const calculateCapacityForRectangle = (rect) => {
		const rectWidth = rect.width - RETIRO_TERRENO * 2;
		const rectHeight = rect.height - RETIRO_TERRENO * 2;
		const verticalSpace = rectHeight - CIRCULACION_LATERAL;
		const horizontalSpace = rectWidth - CIRCULACION_LATERAL * 2;

		// Clasificar ambientes
		const { enPabellones, superiores } =
			classifyAmbientes(arrayTransformado);

		// ✅ CALCULAR ESPACIO TOTAL DE AMBIENTES
		const ambientesPrimariaTotal = enPabellones
			.filter((a) => a.pabellon === "primaria")
			.reduce((sum, amb) => sum + amb.alto, 0);

		const ambientesSecundariaTotal = enPabellones
			.filter((a) => a.pabellon === "secundaria")
			.reduce((sum, amb) => sum + amb.alto, 0);

		const ambientesInicialTotal = enPabellones
			.filter((a) => a.pabellon === "inicial")
			.reduce((sum, amb) => sum + amb.ancho, 0);

		const hayAmbientesEnPrimaria = enPabellones.some(
			(a) => a.pabellon === "primaria"
		);
		const hayAmbientesEnSecundaria = enPabellones.some(
			(a) => a.pabellon === "secundaria"
		);

		// Calcular espacio ocupado por ambientes superiores
		const totalAmbientesSuperioresWidth = superiores.reduce(
			(sum, amb) => sum + amb.ancho,
			0
		);
		const maxAmbientesSuperioresHeight =
			superiores.length > 0
				? Math.max(...superiores.map((amb) => amb.alto))
				: 0;

		// ✅ CALCULAR CAPACIDADES SEGÚN EL MODO ACTUAL
		let maxInicialClassrooms,
			maxPrimariaClassrooms,
			maxSecundariaClassrooms;

		if (layoutMode === "horizontal") {
			// MODO HORIZONTAL: Inicial abajo (horizontal), Primaria/Secundaria laterales (vertical)

			// INICIAL - horizontal, restar entrada
			const inicialSpace = horizontalSpace - ENTRADA_WIDTH;
			const inicialNeedsServices = BANO_WIDTH + ESCALERA_WIDTH;
			const inicialAvailableForClassrooms =
				inicialSpace - inicialNeedsServices - ambientesInicialTotal;
			maxInicialClassrooms = Math.floor(
				inicialAvailableForClassrooms / CLASSROOM_WIDTH
			);

			// PRIMARIA - vertical, reducir por ambientes
			const primariaSpace =
				verticalSpace - CLASSROOM_HEIGHT - CIRCULACION_ENTRE_PABELLONES;
			const primariaNeedsServices = BANO_HEIGHT + ESCALERA_HEIGHT;
			const primariaAvailableForClassrooms =
				primariaSpace - primariaNeedsServices - ambientesPrimariaTotal;
			maxPrimariaClassrooms = Math.floor(
				primariaAvailableForClassrooms / CLASSROOM_HEIGHT
			);

			// SECUNDARIA - vertical, reducir por ambientes
			const secundariaSpace =
				verticalSpace - CLASSROOM_HEIGHT - CIRCULACION_ENTRE_PABELLONES;
			const secundariaNeedsServices = BANO_HEIGHT + ESCALERA_HEIGHT;
			const secundariaAvailableForClassrooms =
				secundariaSpace -
				secundariaNeedsServices -
				ambientesSecundariaTotal;
			maxSecundariaClassrooms = Math.floor(
				secundariaAvailableForClassrooms / CLASSROOM_HEIGHT
			);
		} else {
			// MODO VERTICAL: Primaria abajo (horizontal), Secundaria arriba (horizontal), Inicial lateral (vertical)

			// PRIMARIA - horizontal, reducir por ambientes (convertir alto a ancho)
			const primariaSpace = horizontalSpace;
			const primariaNeedsServices = BANO_WIDTH + ESCALERA_WIDTH;
			// En modo vertical, los ambientes de primaria van horizontalmente
			const ambientesPrimariaHorizontal = enPabellones
				.filter((a) => a.pabellon === "primaria")
				.reduce((sum, amb) => sum + amb.ancho, 0);
			const primariaAvailableForClassrooms =
				primariaSpace -
				primariaNeedsServices -
				ambientesPrimariaHorizontal;
			maxPrimariaClassrooms = Math.floor(
				primariaAvailableForClassrooms / CLASSROOM_WIDTH
			);

			// SECUNDARIA - horizontal, reducir por ambientes
			const secundariaSpace = horizontalSpace;
			const secundariaNeedsServices = BANO_WIDTH + ESCALERA_WIDTH;
			const ambientesSecundariaHorizontal = enPabellones
				.filter((a) => a.pabellon === "secundaria")
				.reduce((sum, amb) => sum + amb.ancho, 0);
			const secundariaAvailableForClassrooms =
				secundariaSpace -
				secundariaNeedsServices -
				ambientesSecundariaHorizontal;
			maxSecundariaClassrooms = Math.floor(
				secundariaAvailableForClassrooms / CLASSROOM_WIDTH
			);

			// INICIAL - vertical, reducir por ambientes
			const inicialSpace =
				verticalSpace -
				CLASSROOM_HEIGHT * 2 -
				CIRCULACION_ENTRE_PABELLONES * 2;
			const inicialNeedsServices = BANO_HEIGHT + ESCALERA_HEIGHT;
			// En modo vertical, los ambientes de inicial van verticalmente
			const ambientesInicialVertical = enPabellones
				.filter((a) => a.pabellon === "inicial")
				.reduce((sum, amb) => sum + amb.alto, 0);
			const inicialAvailableForClassrooms =
				inicialSpace - inicialNeedsServices - ambientesInicialVertical;
			maxInicialClassrooms = Math.floor(
				inicialAvailableForClassrooms / CLASSROOM_HEIGHT
			);
		}

		const capacityData = {
			inicial: { max: maxInicialClassrooms },
			primaria: {
				max: maxPrimariaClassrooms,
				hasBiblioteca: hayAmbientesEnPrimaria,
			},
			secundaria: {
				max: maxSecundariaClassrooms,
				hasLaboratorio: hayAmbientesEnSecundaria,
			},
			ambientesSuperiores: {
				totalWidth: totalAmbientesSuperioresWidth,
				maxHeight: maxAmbientesSuperioresHeight,
				availableWidth: rectWidth - CIRCULACION_LATERAL * 2,
			},
		};
		// ✅ SETEAR EL ESTADO (para que se muestre en la UI si lo necesitas)
		setCapacityInfo(capacityData);

		// ✅ RETORNAR EL OBJETO (para usarlo inmediatamente)
		return capacityData;
	};

	const calculateCapacity = () => {
		console.log("Calculando capacidad en modo:", layoutMode);
		if (maxRectangle) {
			return calculateCapacityForRectangle(maxRectangle);
		}
		return null;
	};

	const calculateHorizontalDistribution = (
		inicialTotal,
		primariaTotal,
		secundariaTotal,
		enPabellones,
		lateralesCancha,
		superiores,
		currentCapacity
	) => {
		// ✅ CALCULAR ESPACIO TOTAL DE AMBIENTES
		const ambientesPrimariaTotal = enPabellones
			.filter((a) => a.pabellon === "primaria")
			.reduce((sum, amb) => sum + amb.alto, 0);

		const ambientesSecundariaTotal = enPabellones
			.filter((a) => a.pabellon === "secundaria")
			.reduce((sum, amb) => sum + amb.alto, 0);

		const ambientesInicialTotal = enPabellones
			.filter((a) => a.pabellon === "inicial")
			.reduce((sum, amb) => sum + amb.ancho, 0);

		// LÓGICA: Si no hay inicial, usar ese pabellón para el nivel con más aulas
		let usarPabellonInferiorPara = "inicial";
		let aulasEnPabellonInferior = inicialTotal;

		if (inicialTotal === 0) {
			if (primariaTotal > secundariaTotal) {
				usarPabellonInferiorPara = "primaria";
				aulasEnPabellonInferior = Math.min(
					primariaTotal,
					currentCapacity.inicial.max
				);
			} else if (secundariaTotal > 0) {
				usarPabellonInferiorPara = "secundaria";
				aulasEnPabellonInferior = Math.min(
					secundariaTotal,
					currentCapacity.inicial.max
				);
			}
		}

		// Calcular distribución según el caso
		let inicialFloor1 = 0,
			inicialFloor2 = 0;
		let primariaFloor1 = 0,
			primariaFloor2 = 0;
		let secundariaFloor1 = 0,
			secundariaFloor2 = 0;

		if (usarPabellonInferiorPara === "inicial") {
			inicialFloor1 = Math.min(inicialTotal, currentCapacity.inicial.max);
			inicialFloor2 = inicialTotal - inicialFloor1;
			primariaFloor1 = Math.min(
				primariaTotal,
				currentCapacity.primaria.max
			);
			primariaFloor2 = primariaTotal - primariaFloor1;
			secundariaFloor1 = Math.min(
				secundariaTotal,
				currentCapacity.secundaria.max
			);
			secundariaFloor2 = secundariaTotal - secundariaFloor1;
		} else if (usarPabellonInferiorPara === "primaria") {
			const primariaEnInferior = Math.min(
				primariaTotal,
				currentCapacity.inicial.max
			);
			const primariaRestante = primariaTotal - primariaEnInferior;
			inicialFloor1 = primariaEnInferior;
			primariaFloor1 = Math.min(
				primariaRestante,
				currentCapacity.primaria.max
			);
			primariaFloor2 = primariaRestante - primariaFloor1;
			secundariaFloor1 = Math.min(
				secundariaTotal,
				currentCapacity.secundaria.max
			);
			secundariaFloor2 = secundariaTotal - secundariaFloor1;
		} else if (usarPabellonInferiorPara === "secundaria") {
			const secundariaEnInferior = Math.min(
				secundariaTotal,
				currentCapacity.inicial.max
			);
			const secundariaRestante = secundariaTotal - secundariaEnInferior;
			inicialFloor1 = secundariaEnInferior;
			secundariaFloor1 = Math.min(
				secundariaRestante,
				currentCapacity.secundaria.max
			);
			secundariaFloor2 = secundariaRestante - secundariaFloor1;
			primariaFloor1 = Math.min(
				primariaTotal,
				currentCapacity.primaria.max
			);
			primariaFloor2 = primariaTotal - primariaFloor1;
		}

		const POSICION_ESCALERA = 1;

		// DISTRIBUCIÓN DE AMBIENTES SUPERIORES
		const superioresFloor1 = [];
		const superioresFloor2 = [];
		const ambientesInicialLibre = [];
		const ambientesPrimariaLibre = [];
		const ambientesSecundariaLibre = [];

		const anchoDisponibleSuperior =
			maxRectangle.width - CIRCULACION_LATERAL * 2 - ENTRADA_WIDTH;

		let anchoAcumuladoFloor1 = 0;

		superiores.forEach((amb) => {
			if (anchoAcumuladoFloor1 + amb.ancho <= anchoDisponibleSuperior) {
				superioresFloor1.push(amb);
				anchoAcumuladoFloor1 += amb.ancho;
			} else {
				superioresFloor2.push(amb);
			}
		});

		// Calcular espacios libres
		const espaciosLibresFloor1 = {
			inicial: Math.max(
				0,
				maxRectangle.width -
					CIRCULACION_LATERAL * 2 -
					ENTRADA_WIDTH -
					inicialFloor1 * CLASSROOM_WIDTH -
					(inicialFloor1 > 0 ? BANO_WIDTH + ESCALERA_WIDTH : 0) -
					ambientesInicialTotal
			),
			primaria: Math.max(
				0,
				maxRectangle.height -
					CLASSROOM_HEIGHT -
					CIRCULACION_ENTRE_PABELLONES -
					primariaFloor1 * CLASSROOM_HEIGHT -
					(primariaFloor1 > 0 ? BANO_HEIGHT + ESCALERA_HEIGHT : 0) -
					ambientesPrimariaTotal
			),
			secundaria: Math.max(
				0,
				maxRectangle.height -
					CLASSROOM_HEIGHT -
					CIRCULACION_ENTRE_PABELLONES -
					secundariaFloor1 * CLASSROOM_HEIGHT -
					(secundariaFloor1 > 0 ? BANO_HEIGHT + ESCALERA_HEIGHT : 0) -
					ambientesSecundariaTotal
			),
		};

		// Intentar colocar ambientes sobrantes en espacios libres
		const ambientesRestantes = [];
		superioresFloor2.forEach((amb) => {
			if (
				espaciosLibresFloor1.inicial >= amb.ancho &&
				CLASSROOM_HEIGHT >= amb.alto
			) {
				ambientesInicialLibre.push(amb);
				espaciosLibresFloor1.inicial -= amb.ancho;
			} else if (
				espaciosLibresFloor1.primaria >= amb.alto &&
				CLASSROOM_WIDTH >= amb.ancho
			) {
				ambientesPrimariaLibre.push(amb);
				espaciosLibresFloor1.primaria -= amb.alto;
			} else if (
				espaciosLibresFloor1.secundaria >= amb.alto &&
				CLASSROOM_WIDTH >= amb.ancho
			) {
				ambientesSecundariaLibre.push(amb);
				espaciosLibresFloor1.secundaria -= amb.alto;
			} else {
				ambientesRestantes.push(amb);
			}
		});

		const superioresFloor2Final = ambientesRestantes;

		// Calcular cuadrante interior
		const cuadranteInterior = {
			x: CLASSROOM_WIDTH + CIRCULACION_LATERAL,
			y: CLASSROOM_HEIGHT + CIRCULACION_ENTRE_PABELLONES,
			width:
				maxRectangle.width -
				CLASSROOM_WIDTH * 2 -
				CIRCULACION_LATERAL * 2,
			height:
				maxRectangle.height -
				CLASSROOM_HEIGHT * 2 -
				CIRCULACION_ENTRE_PABELLONES * 2,
		};

		const distribucionCuadrante = distribuirEnCuadranteInterior(
			cuadranteInterior,
			lateralesCancha
		);

		const needsSecondFloor =
			inicialFloor2 +
				primariaFloor2 +
				secundariaFloor2 +
				superioresFloor2Final.length >
			0;
		const floors = needsSecondFloor ? 2 : 1;

		setTotalFloors(floors);

		setDistribution({
			floors: {
				1: {
					inicial: inicialFloor1,
					primaria: primariaFloor1,
					secundaria: secundariaFloor1,
					inicialBanoPos: POSICION_ESCALERA,
					primariaBanoPos: POSICION_ESCALERA,
					secundariaBanoPos: POSICION_ESCALERA,
					ambientesSuperiores: superioresFloor1,
					ambientesInicialLibre: ambientesInicialLibre,
					ambientesPrimariaLibre: ambientesPrimariaLibre,
					ambientesSecundariaLibre: ambientesSecundariaLibre,
					cuadranteInterior: cuadranteInterior,
					distribucionCuadrante: distribucionCuadrante,
				},
				2: {
					inicial: inicialFloor2,
					primaria: primariaFloor2,
					secundaria: secundariaFloor2,
					inicialBanoPos: POSICION_ESCALERA,
					primariaBanoPos: POSICION_ESCALERA,
					secundariaBanoPos: POSICION_ESCALERA,
					ambientesSuperiores: superioresFloor2Final,
					ambientesInicialLibre: [],
					ambientesPrimariaLibre: [],
					ambientesSecundariaLibre: [],
					tieneBanos: false,
				},
			},
			totalFloors: floors,
			ambientesEnPabellones: enPabellones,
			ambientesLateralesCancha: lateralesCancha,
			pabellonInferiorEs: usarPabellonInferiorPara,
			layoutMode: "horizontal", // ✅ IMPORTANTE: Guardar el modo
		});
	};

	const calculateVerticalDistribution = (
		inicialTotal,
		primariaTotal,
		secundariaTotal,
		enPabellones,
		lateralesCancha,
		superiores,
		currentCapacity
	) => {
		console.log("Capacidades disponibles:", capacityInfo);

		// ✅ LÓGICA: Si no hay inicial, usar ese pabellón para el nivel con más aulas
		let usarPabellonIzquierdaPara = "inicial"; // Por defecto

		if (inicialTotal === 0) {
			// Decidir qué nivel usa el pabellón izquierdo (vertical)
			if (primariaTotal > secundariaTotal) {
				usarPabellonIzquierdaPara = "primaria";
			} else if (secundariaTotal > 0) {
				usarPabellonIzquierdaPara = "secundaria";
			}
		}

		// Calcular distribución según el caso
		let inicialFloor1 = 0,
			inicialFloor2 = 0;
		let primariaFloor1 = 0,
			primariaFloor2 = 0;
		let secundariaFloor1 = 0,
			secundariaFloor2 = 0;

		if (usarPabellonIzquierdaPara === "inicial") {
			// Caso normal: hay aulas de inicial
			inicialFloor1 = Math.min(inicialTotal, currentCapacity.inicial.max);
			inicialFloor2 = inicialTotal - inicialFloor1;

			primariaFloor1 = Math.min(
				primariaTotal,
				currentCapacity.primaria.max
			);
			primariaFloor2 = primariaTotal - primariaFloor1;

			secundariaFloor1 = Math.min(
				secundariaTotal,
				currentCapacity.secundaria.max
			);
			secundariaFloor2 = secundariaTotal - secundariaFloor1;
		} else if (usarPabellonIzquierdaPara === "primaria") {
			// No hay inicial, primaria usa el pabellón izquierdo (vertical)
			const primariaEnIzquierda = Math.min(
				primariaTotal,
				currentCapacity.inicial.max
			);
			const primariaRestante = primariaTotal - primariaEnIzquierda;

			inicialFloor1 = primariaEnIzquierda; // Se dibuja en zona inicial pero son aulas de primaria
			primariaFloor1 = Math.min(
				primariaRestante,
				currentCapacity.primaria.max
			);
			primariaFloor2 = primariaRestante - primariaFloor1;

			secundariaFloor1 = Math.min(
				secundariaTotal,
				currentCapacity.secundaria.max
			);
			secundariaFloor2 = secundariaTotal - secundariaFloor1;
		} else if (usarPabellonIzquierdaPara === "secundaria") {
			// No hay inicial, secundaria usa el pabellón izquierdo (vertical)
			const secundariaEnIzquierda = Math.min(
				secundariaTotal,
				currentCapacity.inicial.max
			);
			const secundariaRestante = secundariaTotal - secundariaEnIzquierda;

			inicialFloor1 = secundariaEnIzquierda; // Se dibuja en zona inicial pero son aulas de secundaria
			secundariaFloor1 = Math.min(
				secundariaRestante,
				currentCapacity.secundaria.max
			);
			secundariaFloor2 = secundariaRestante - secundariaFloor1;

			primariaFloor1 = Math.min(
				primariaTotal,
				currentCapacity.primaria.max
			);
			primariaFloor2 = primariaTotal - primariaFloor1;
		}

		const POSICION_ESCALERA = 1;

		// Distribuir ambientes superiores (derecha, vertical)
		const superioresFloor1 = [];
		const superioresFloor2 = [];
		const ambientesInicialLibre = [];
		const ambientesPrimariaLibre = [];
		const ambientesSecundariaLibre = [];

		const altoDisponibleDerecha =
			maxRectangle.height -
			CLASSROOM_HEIGHT * 2 -
			CIRCULACION_ENTRE_PABELLONES * 2;
		let altoAcumuladoFloor1 = 0;

		superiores.forEach((amb) => {
			if (altoAcumuladoFloor1 + amb.alto <= altoDisponibleDerecha) {
				superioresFloor1.push(amb);
				altoAcumuladoFloor1 += amb.alto;
			} else {
				superioresFloor2.push(amb);
			}
		});

		// Calcular espacios libres
		const ambientesPrimariaTotal = enPabellones
			.filter((a) => a.pabellon === "primaria")
			.reduce((sum, amb) => sum + amb.ancho, 0);

		const ambientesSecundariaTotal = enPabellones
			.filter((a) => a.pabellon === "secundaria")
			.reduce((sum, amb) => sum + amb.ancho, 0);

		const ambientesInicialTotal = enPabellones
			.filter((a) => a.pabellon === "inicial")
			.reduce((sum, amb) => sum + amb.alto, 0);

		const espaciosLibresFloor1 = {
			inicial: Math.max(
				0,
				maxRectangle.height -
					CLASSROOM_HEIGHT * 2 -
					CIRCULACION_ENTRE_PABELLONES * 2 -
					inicialFloor1 * CLASSROOM_HEIGHT -
					(inicialFloor1 > 0 ? BANO_HEIGHT + ESCALERA_HEIGHT : 0) -
					ambientesInicialTotal
			),
			primaria: Math.max(
				0,
				maxRectangle.width -
					CIRCULACION_LATERAL * 2 -
					primariaFloor1 * CLASSROOM_WIDTH -
					(primariaFloor1 > 0 ? BANO_WIDTH + ESCALERA_WIDTH : 0) -
					ambientesPrimariaTotal
			),
			secundaria: Math.max(
				0,
				maxRectangle.width -
					CIRCULACION_LATERAL * 2 -
					secundariaFloor1 * CLASSROOM_WIDTH -
					(secundariaFloor1 > 0 ? BANO_WIDTH + ESCALERA_WIDTH : 0) -
					ambientesSecundariaTotal
			),
		};

		// Intentar colocar ambientes sobrantes
		const ambientesRestantes = [];
		superioresFloor2.forEach((amb) => {
			if (
				espaciosLibresFloor1.inicial >= amb.alto &&
				CLASSROOM_WIDTH >= amb.ancho
			) {
				ambientesInicialLibre.push(amb);
				espaciosLibresFloor1.inicial -= amb.alto;
			} else if (
				espaciosLibresFloor1.primaria >= amb.ancho &&
				CLASSROOM_HEIGHT >= amb.alto
			) {
				ambientesPrimariaLibre.push(amb);
				espaciosLibresFloor1.primaria -= amb.ancho;
			} else if (
				espaciosLibresFloor1.secundaria >= amb.ancho &&
				CLASSROOM_HEIGHT >= amb.alto
			) {
				ambientesSecundariaLibre.push(amb);
				espaciosLibresFloor1.secundaria -= amb.ancho;
			} else {
				ambientesRestantes.push(amb);
			}
		});

		const superioresFloor2Final = ambientesRestantes;

		// Cuadrante interior
		const cuadranteInterior = {
			x: CLASSROOM_WIDTH + CIRCULACION_LATERAL,
			y: CLASSROOM_HEIGHT + CIRCULACION_ENTRE_PABELLONES,
			width:
				maxRectangle.width -
				CLASSROOM_WIDTH * 2 -
				CIRCULACION_LATERAL * 2,
			height:
				maxRectangle.height -
				CLASSROOM_HEIGHT * 2 -
				CIRCULACION_ENTRE_PABELLONES * 2,
		};

		const distribucionCuadrante = distribuirEnCuadranteInterior(
			cuadranteInterior,
			lateralesCancha
		);

		const needsSecondFloor =
			inicialFloor2 +
				primariaFloor2 +
				secundariaFloor2 +
				superioresFloor2Final.length >
			0;
		const floors = needsSecondFloor ? 2 : 1;

		setTotalFloors(floors);

		console.log("Distribución vertical calculada:", {
			usandoPabellonIzquierdoPara: usarPabellonIzquierdaPara,
			inicial: `${inicialFloor1} + ${inicialFloor2} = ${inicialTotal}`,
			primaria: `${primariaFloor1} + ${primariaFloor2} = ${primariaTotal}`,
			secundaria: `${secundariaFloor1} + ${secundariaFloor2} = ${secundariaTotal}`,
		});

		setDistribution({
			floors: {
				1: {
					inicial: inicialFloor1,
					primaria: primariaFloor1,
					secundaria: secundariaFloor1,
					inicialBanoPos: POSICION_ESCALERA,
					primariaBanoPos: POSICION_ESCALERA,
					secundariaBanoPos: POSICION_ESCALERA,
					ambientesSuperiores: superioresFloor1,
					ambientesInicialLibre: ambientesInicialLibre,
					ambientesPrimariaLibre: ambientesPrimariaLibre,
					ambientesSecundariaLibre: ambientesSecundariaLibre,
					cuadranteInterior: cuadranteInterior,
					distribucionCuadrante: distribucionCuadrante,
				},
				2: {
					inicial: inicialFloor2,
					primaria: primariaFloor2,
					secundaria: secundariaFloor2,
					inicialBanoPos: POSICION_ESCALERA,
					primariaBanoPos: POSICION_ESCALERA,
					secundariaBanoPos: POSICION_ESCALERA,
					ambientesSuperiores: superioresFloor2Final,
					ambientesInicialLibre: [],
					ambientesPrimariaLibre: [],
					ambientesSecundariaLibre: [],
					tieneBanos: false,
				},
			},
			totalFloors: floors,
			ambientesEnPabellones: enPabellones,
			ambientesLateralesCancha: lateralesCancha,
			pabellonInferiorEs: usarPabellonIzquierdaPara, // ✅ CAMBIADO: ahora refleja qué nivel usa el pabellón izquierdo
			layoutMode: "vertical",
		});
	};

	const calculateDistribution = () => {
		const currentCapacity = calculateCapacity();
		if (!maxRectangle) return;
		console.log("maxRectangle:::::::", maxRectangle);
		console.log("capacidad info:::::", currentCapacity);

		console.log("Modo seleccionado:", layoutMode);

		const inicialTotal = parseInt(classroomInicial) || 0;
		const primariaTotal = parseInt(classroomPrimaria) || 0;
		const secundariaTotal = parseInt(classroomSecundaria) || 0;

		if (inicialTotal + primariaTotal + secundariaTotal === 0) {
			alert("Debes ingresar al menos una cantidad de aulas");
			return;
		}

		const { enPabellones, lateralesCancha, superiores } =
			classifyAmbientes(arrayTransformado);

		// ✅ VALIDAR ESPACIO PARA AMBIENTES SUPERIORES
		const totalSuperioresWidth = superiores.reduce(
			(sum, amb) => sum + amb.ancho,
			0
		);

		// ✅ LLAMAR A LA FUNCIÓN SEGÚN EL MODO
		if (layoutMode === "horizontal") {
			// Tu distribución actual
			calculateHorizontalDistribution(
				inicialTotal,
				primariaTotal,
				secundariaTotal,
				enPabellones,
				lateralesCancha,
				superiores,
				currentCapacity
			);
		} else {
			calculateVerticalDistribution(
				inicialTotal,
				primariaTotal,
				secundariaTotal,
				enPabellones,
				lateralesCancha,
				superiores,
				currentCapacity
			);
		}
	};

	const renderLayoutHorizontal = (
		floorData,
		origin,
		dirX,
		dirY,
		rectWidth,
		rectHeight,
		createRoomCorners,
		elementos
	) => {
		// ========================================
		// AMBIENTES SUPERIORES + ENTRADA (arriba, horizontal)
		// ========================================
		if (
			currentFloor === 1 &&
			floorData.ambientesSuperiores &&
			floorData.ambientesSuperiores.length > 0
		) {
			const totalAmbientes = floorData.ambientesSuperiores.length;
			const totalAmbientesWidth = floorData.ambientesSuperiores.reduce(
				(sum, amb) => sum + amb.ancho,
				0
			);

			const posicionEntrada = Math.floor(totalAmbientes / 2);
			const totalWidth = totalAmbientesWidth + ENTRADA_WIDTH;
			const startXAmbientes = (rectWidth - totalWidth) / 2;

			let currentXAmbiente = startXAmbientes;
			const ambienteY = rectHeight - CLASSROOM_HEIGHT;

			// Ambientes ANTES de la entrada
			floorData.ambientesSuperiores
				.slice(0, posicionEntrada)
				.forEach((ambiente) => {
					const x =
						origin.east +
						dirX.east * currentXAmbiente +
						dirY.east * (rectHeight - ambiente.alto);
					const y =
						origin.north +
						dirX.north * currentXAmbiente +
						dirY.north * (rectHeight - ambiente.alto);

					const ambienteData = createRoomCorners(
						x,
						y,
						ambiente.ancho,
						ambiente.alto
					);
					elementos.ambientes.push({
						nombre: ambiente.nombre,
						tipo: "superior",
						corners: ambienteData.corners,
						realCorners: ambienteData.realCorners,
					});
					currentXAmbiente += ambiente.ancho;
				});

			// ENTRADA AL MEDIO
			const xEnt =
				origin.east +
				dirX.east * currentXAmbiente +
				dirY.east * ambienteY;
			const yEnt =
				origin.north +
				dirX.north * currentXAmbiente +
				dirY.north * ambienteY;

			const entradaData = createRoomCorners(
				xEnt,
				yEnt,
				ENTRADA_WIDTH,
				CLASSROOM_HEIGHT
			);
			elementos.entrada = {
				corners: entradaData.corners,
				realCorners: entradaData.realCorners,
			};
			currentXAmbiente += ENTRADA_WIDTH;

			// Ambientes DESPUÉS de la entrada
			floorData.ambientesSuperiores
				.slice(posicionEntrada)
				.forEach((ambiente) => {
					const x =
						origin.east +
						dirX.east * currentXAmbiente +
						dirY.east * (rectHeight - ambiente.alto);
					const y =
						origin.north +
						dirX.north * currentXAmbiente +
						dirY.north * (rectHeight - ambiente.alto);

					const ambienteData = createRoomCorners(
						x,
						y,
						ambiente.ancho,
						ambiente.alto
					);
					elementos.ambientes.push({
						nombre: ambiente.nombre,
						tipo: "superior",
						corners: ambienteData.corners,
						realCorners: ambienteData.realCorners,
					});
					currentXAmbiente += ambiente.ancho;
				});
		} else if (
			currentFloor === 2 &&
			floorData.ambientesSuperiores &&
			floorData.ambientesSuperiores.length > 0
		) {
			// Piso 2: solo ambientes (sin entrada)
			const totalAmbientesWidth = floorData.ambientesSuperiores.reduce(
				(sum, amb) => sum + amb.ancho,
				0
			);
			const startXAmbientes = (rectWidth - totalAmbientesWidth) / 2;
			let currentXAmbiente = startXAmbientes;

			floorData.ambientesSuperiores.forEach((ambiente) => {
				const x =
					origin.east +
					dirX.east * currentXAmbiente +
					dirY.east * (rectHeight - ambiente.alto);
				const y =
					origin.north +
					dirX.north * currentXAmbiente +
					dirY.north * (rectHeight - ambiente.alto);

				const ambienteData = createRoomCorners(
					x,
					y,
					ambiente.ancho,
					ambiente.alto
				);
				elementos.ambientes.push({
					nombre: ambiente.nombre,
					tipo: "superior",
					corners: ambienteData.corners,
					realCorners: ambienteData.realCorners,
				});
				currentXAmbiente += ambiente.ancho;
			});
		}

		// ========================================
		// PABELLÓN INICIAL (abajo, horizontal)
		// ========================================
		const pabellonInferiorColor =
			distribution.pabellonInferiorEs === "primaria"
				? "primaria"
				: distribution.pabellonInferiorEs === "secundaria"
				? "secundaria"
				: "inicial";

		// ✅ CALCULAR ANCHO TOTAL DEL PABELLÓN INICIAL
		let anchoTotalInicial = floorData.inicial * CLASSROOM_WIDTH;

		// Agregar escalera y baño si hay más de un piso
		if (floorData.inicial > 0 && totalFloors > 1) {
			anchoTotalInicial += ESCALERA_WIDTH;
			if (currentFloor === 1) {
				anchoTotalInicial += BANO_WIDTH;
			}
		}

		// Agregar psicomotricidad si existe
		const psicomotricidadEnInicial =
			distribution.ambientesEnPabellones.find(
				(a) => a.pabellon === "inicial"
			);
		if (
			psicomotricidadEnInicial &&
			currentFloor === 1 &&
			floorData.inicial > 0
		) {
			anchoTotalInicial += psicomotricidadEnInicial.ancho;
		}

		// Agregar ambientes libres
		if (
			floorData.ambientesInicialLibre &&
			floorData.ambientesInicialLibre.length > 0
		) {
			floorData.ambientesInicialLibre.forEach((ambiente) => {
				anchoTotalInicial += ambiente.ancho;
			});
		}

		// ✅ CENTRAR EN EL RECTÁNGULO (descontando entrada)
		const espacioDisponibleInicial =
			rectWidth - CIRCULACION_LATERAL * 2 - ENTRADA_WIDTH;
		let currentXInicial =
			CIRCULACION_LATERAL +
			(espacioDisponibleInicial - anchoTotalInicial) / 2;

		// console.log("📍 Inicial centrado:", {
		// 	anchoTotal: anchoTotalInicial.toFixed(1),
		// 	espacioDisponible: espacioDisponibleInicial.toFixed(1),
		// 	posicionInicio: currentXInicial.toFixed(1),
		// });

		// Renderizar aulas
		for (let i = 0; i < floorData.inicial; i++) {
			const x = origin.east + dirX.east * currentXInicial;
			const y = origin.north + dirX.north * currentXInicial;

			const aulaData = createRoomCorners(
				x,
				y,
				CLASSROOM_WIDTH,
				CLASSROOM_HEIGHT
			);

			if (pabellonInferiorColor === "inicial") {
				elementos.inicial.push({
					corners: aulaData.corners,
					realCorners: aulaData.realCorners,
				});
			} else if (pabellonInferiorColor === "primaria") {
				elementos.primaria.push({
					corners: aulaData.corners,
					realCorners: aulaData.realCorners,
				});
			} else if (pabellonInferiorColor === "secundaria") {
				elementos.secundaria.push({
					corners: aulaData.corners,
					realCorners: aulaData.realCorners,
				});
			}

			currentXInicial += CLASSROOM_WIDTH;

			// Escalera y baño después de la primera aula
			if (i === 0 && floorData.inicial > 0 && totalFloors > 1) {
				// Escalera
				const xEsc = origin.east + dirX.east * currentXInicial;
				const yEsc = origin.north + dirX.north * currentXInicial;

				const escaleraData = createRoomCorners(
					xEsc,
					yEsc,
					ESCALERA_WIDTH,
					ESCALERA_HEIGHT
				);
				elementos.escaleras.push({
					nivel: "Inicial",
					corners: escaleraData.corners,
					realCorners: escaleraData.realCorners,
				});
				currentXInicial += ESCALERA_WIDTH;

				// Baño (solo piso 1)
				if (currentFloor === 1) {
					const xBano = origin.east + dirX.east * currentXInicial;
					const yBano = origin.north + dirX.north * currentXInicial;

					const banoData = createRoomCorners(
						xBano,
						yBano,
						BANO_WIDTH,
						BANO_HEIGHT
					);
					elementos.banos.push({
						nivel: "Inicial",
						corners: banoData.corners,
						realCorners: banoData.realCorners,
					});
					currentXInicial += BANO_WIDTH;
				}
			}
		}

		// Psicomotricidad
		if (
			psicomotricidadEnInicial &&
			currentFloor === 1 &&
			floorData.inicial > 0
		) {
			const x = origin.east + dirX.east * currentXInicial;
			const y = origin.north + dirX.north * currentXInicial;

			const psicomotricidadData = createRoomCorners(
				x,
				y,
				psicomotricidadEnInicial.ancho,
				psicomotricidadEnInicial.alto
			);
			elementos.ambientes.push({
				nombre: psicomotricidadEnInicial.nombre,
				tipo: "pabellon",
				corners: psicomotricidadData.corners,
				realCorners: psicomotricidadData.realCorners,
			});
			currentXInicial += psicomotricidadEnInicial.ancho;
		}

		// Ambientes libres
		if (
			floorData.ambientesInicialLibre &&
			floorData.ambientesInicialLibre.length > 0
		) {
			floorData.ambientesInicialLibre.forEach((ambiente) => {
				const x = origin.east + dirX.east * currentXInicial;
				const y = origin.north + dirX.north * currentXInicial;

				const ambienteData = createRoomCorners(
					x,
					y,
					ambiente.ancho,
					ambiente.alto
				);
				elementos.ambientes.push({
					nombre: ambiente.nombre,
					tipo: "pabellon_libre",
					corners: ambienteData.corners,
					realCorners: ambienteData.realCorners,
				});
				currentXInicial += ambiente.ancho;
			});
		}
		// ========================================
		// PABELLÓN PRIMARIA (izquierda, vertical)
		// ========================================
		const startYPrimaria = CLASSROOM_HEIGHT + CIRCULACION_ENTRE_PABELLONES;
		let currentYPrimaria = startYPrimaria;

		for (let i = 0; i < floorData.primaria; i++) {
			const x = origin.east + dirY.east * currentYPrimaria;
			const y = origin.north + dirY.north * currentYPrimaria;

			const aulaData = createRoomCorners(
				x,
				y,
				CLASSROOM_WIDTH,
				CLASSROOM_HEIGHT
			);
			elementos.primaria.push({
				corners: aulaData.corners,
				realCorners: aulaData.realCorners,
			});
			currentYPrimaria += CLASSROOM_HEIGHT;

			if (i === 0 && floorData.primaria > 0 && totalFloors > 1) {
				// Escalera
				const xEsc = origin.east + dirY.east * currentYPrimaria;
				const yEsc = origin.north + dirY.north * currentYPrimaria;

				const escaleraData = createRoomCorners(
					xEsc,
					yEsc,
					CLASSROOM_WIDTH,
					ESCALERA_HEIGHT
				);
				elementos.escaleras.push({
					nivel: "Primaria",
					corners: escaleraData.corners,
					realCorners: escaleraData.realCorners,
				});
				currentYPrimaria += ESCALERA_HEIGHT;

				// Baño (solo piso 1)
				if (currentFloor === 1) {
					const xBano = origin.east + dirY.east * currentYPrimaria;
					const yBano = origin.north + dirY.north * currentYPrimaria;

					const banoData = createRoomCorners(
						xBano,
						yBano,
						CLASSROOM_WIDTH,
						BANO_HEIGHT
					);
					elementos.banos.push({
						nivel: "Primaria",
						corners: banoData.corners,
						realCorners: banoData.realCorners,
					});
					currentYPrimaria += BANO_HEIGHT;
				}
			}
		}

		// Ambientes en pabellón primaria
		const ambientesPrimariaEnPabellon =
			distribution.ambientesEnPabellones.filter(
				(a) => a.pabellon === "primaria"
			);

		if (
			ambientesPrimariaEnPabellon.length > 0 &&
			currentFloor === 1 &&
			floorData.primaria > 0
		) {
			ambientesPrimariaEnPabellon.forEach((ambiente) => {
				const x = origin.east + dirY.east * currentYPrimaria;
				const y = origin.north + dirY.north * currentYPrimaria;

				const ambienteData = createRoomCorners(
					x,
					y,
					ambiente.ancho,
					ambiente.alto
				);
				elementos.ambientes.push({
					nombre: ambiente.nombre,
					tipo: "pabellon",
					corners: ambienteData.corners,
					realCorners: ambienteData.realCorners,
				});
				currentYPrimaria += ambiente.alto;
			});
		}

		// Ambientes en espacio libre de primaria
		if (
			floorData.ambientesPrimariaLibre &&
			floorData.ambientesPrimariaLibre.length > 0
		) {
			floorData.ambientesPrimariaLibre.forEach((ambiente) => {
				const x = origin.east + dirY.east * currentYPrimaria;
				const y = origin.north + dirY.north * currentYPrimaria;

				const ambienteData = createRoomCorners(
					x,
					y,
					ambiente.ancho,
					ambiente.alto
				);
				elementos.ambientes.push({
					nombre: ambiente.nombre,
					tipo: "pabellon_libre",
					corners: ambienteData.corners,
					realCorners: ambienteData.realCorners,
				});
				currentYPrimaria += ambiente.alto;
			});
		}

		// ========================================
		// PABELLÓN SECUNDARIA (derecha, vertical)
		// ========================================
		let currentYSecundaria = startYPrimaria;

		for (let i = 0; i < floorData.secundaria; i++) {
			const x =
				origin.east +
				dirX.east * (rectWidth - CLASSROOM_WIDTH) +
				dirY.east * currentYSecundaria;
			const y =
				origin.north +
				dirX.north * (rectWidth - CLASSROOM_WIDTH) +
				dirY.north * currentYSecundaria;

			const aulaData = createRoomCorners(
				x,
				y,
				CLASSROOM_WIDTH,
				CLASSROOM_HEIGHT
			);
			elementos.secundaria.push({
				corners: aulaData.corners,
				realCorners: aulaData.realCorners,
			});
			currentYSecundaria += CLASSROOM_HEIGHT;

			if (i === 0 && floorData.secundaria > 0 && totalFloors > 1) {
				// Escalera
				const xEsc =
					origin.east +
					dirX.east * (rectWidth - CLASSROOM_WIDTH) +
					dirY.east * currentYSecundaria;
				const yEsc =
					origin.north +
					dirX.north * (rectWidth - CLASSROOM_WIDTH) +
					dirY.north * currentYSecundaria;

				const escaleraData = createRoomCorners(
					xEsc,
					yEsc,
					CLASSROOM_WIDTH,
					ESCALERA_HEIGHT
				);
				elementos.escaleras.push({
					nivel: "Secundaria",
					corners: escaleraData.corners,
					realCorners: escaleraData.realCorners,
				});
				currentYSecundaria += ESCALERA_HEIGHT;

				// Baño (solo piso 1)
				if (currentFloor === 1) {
					const xBano =
						origin.east +
						dirX.east * (rectWidth - CLASSROOM_WIDTH) +
						dirY.east * currentYSecundaria;
					const yBano =
						origin.north +
						dirX.north * (rectWidth - CLASSROOM_WIDTH) +
						dirY.north * currentYSecundaria;

					const banoData = createRoomCorners(
						xBano,
						yBano,
						CLASSROOM_WIDTH,
						BANO_HEIGHT
					);
					elementos.banos.push({
						nivel: "Secundaria",
						corners: banoData.corners,
						realCorners: banoData.realCorners,
					});
					currentYSecundaria += BANO_HEIGHT;
				}
			}
		}

		// Ambientes en pabellón secundaria
		const ambientesSecundariaEnPabellon =
			distribution.ambientesEnPabellones.filter(
				(a) => a.pabellon === "secundaria"
			);

		if (
			ambientesSecundariaEnPabellon.length > 0 &&
			currentFloor === 1 &&
			floorData.secundaria > 0
		) {
			ambientesSecundariaEnPabellon.forEach((ambiente) => {
				const x =
					origin.east +
					dirX.east * (rectWidth - CLASSROOM_WIDTH) +
					dirY.east * currentYSecundaria;
				const y =
					origin.north +
					dirX.north * (rectWidth - CLASSROOM_WIDTH) +
					dirY.north * currentYSecundaria;

				const ambienteData = createRoomCorners(
					x,
					y,
					ambiente.ancho,
					ambiente.alto
				);
				elementos.ambientes.push({
					nombre: ambiente.nombre,
					tipo: "pabellon",
					corners: ambienteData.corners,
					realCorners: ambienteData.realCorners,
				});
				currentYSecundaria += ambiente.alto;
			});
		}

		// Ambientes en espacio libre de secundaria
		if (
			floorData.ambientesSecundariaLibre &&
			floorData.ambientesSecundariaLibre.length > 0
		) {
			floorData.ambientesSecundariaLibre.forEach((ambiente) => {
				const x =
					origin.east +
					dirX.east * (rectWidth - CLASSROOM_WIDTH) +
					dirY.east * currentYSecundaria;
				const y =
					origin.north +
					dirX.north * (rectWidth - CLASSROOM_WIDTH) +
					dirY.north * currentYSecundaria;

				const ambienteData = createRoomCorners(
					x,
					y,
					ambiente.ancho,
					ambiente.alto
				);
				elementos.ambientes.push({
					nombre: ambiente.nombre,
					tipo: "pabellon_libre",
					corners: ambienteData.corners,
					realCorners: ambienteData.realCorners,
				});
				currentYSecundaria += ambiente.alto;
			});
		}
	};

	const renderLayoutVertical = (
		floorData,
		origin,
		dirX,
		dirY,
		rectWidth,
		rectHeight,
		createRoomCorners,
		elementos
	) => {
		// ========================================
		// AMBIENTES SUPERIORES + ENTRADA (derecha, vertical)
		// ========================================
		if (
			currentFloor === 1 &&
			floorData.ambientesSuperiores &&
			floorData.ambientesSuperiores.length > 0
		) {
			const totalAmbientes = floorData.ambientesSuperiores.length;
			const totalAmbientesHeight = floorData.ambientesSuperiores.reduce(
				(sum, amb) => sum + amb.alto,
				0
			);

			const posicionEntrada = Math.floor(totalAmbientes / 2);
			const totalHeight = totalAmbientesHeight + ENTRADA_WIDTH;
			const startYAmbientes = (rectHeight - totalHeight) / 2;

			let currentYAmbiente = startYAmbientes;

			// Ambientes ANTES de la entrada
			floorData.ambientesSuperiores
				.slice(0, posicionEntrada)
				.forEach((ambiente) => {
					const x =
						origin.east +
						dirX.east * (rectWidth - ambiente.ancho) +
						dirY.east * currentYAmbiente;
					const y =
						origin.north +
						dirX.north * (rectWidth - ambiente.ancho) +
						dirY.north * currentYAmbiente;

					const ambienteData = createRoomCorners(
						x,
						y,
						ambiente.ancho,
						ambiente.alto
					);
					elementos.ambientes.push({
						nombre: ambiente.nombre,
						tipo: "superior",
						corners: ambienteData.corners,
						realCorners: ambienteData.realCorners,
					});
					currentYAmbiente += ambiente.alto;
				});

			// ENTRADA (rotada)
			const xEnt =
				origin.east +
				dirX.east * (rectWidth - CLASSROOM_HEIGHT) +
				dirY.east * currentYAmbiente;
			const yEnt =
				origin.north +
				dirX.north * (rectWidth - CLASSROOM_HEIGHT) +
				dirY.north * currentYAmbiente;

			const entradaData = createRoomCorners(
				xEnt,
				yEnt,
				CLASSROOM_HEIGHT,
				ENTRADA_WIDTH
			);
			elementos.entrada = {
				corners: entradaData.corners,
				realCorners: entradaData.realCorners,
			};
			currentYAmbiente += ENTRADA_WIDTH;

			// Ambientes DESPUÉS de la entrada
			floorData.ambientesSuperiores
				.slice(posicionEntrada)
				.forEach((ambiente) => {
					const x =
						origin.east +
						dirX.east * (rectWidth - ambiente.ancho) +
						dirY.east * currentYAmbiente;
					const y =
						origin.north +
						dirX.north * (rectWidth - ambiente.ancho) +
						dirY.north * currentYAmbiente;

					const ambienteData = createRoomCorners(
						x,
						y,
						ambiente.ancho,
						ambiente.alto
					);
					elementos.ambientes.push({
						nombre: ambiente.nombre,
						tipo: "superior",
						corners: ambienteData.corners,
						realCorners: ambienteData.realCorners,
					});
					currentYAmbiente += ambiente.alto;
				});
		} else if (
			currentFloor === 2 &&
			floorData.ambientesSuperiores &&
			floorData.ambientesSuperiores.length > 0
		) {
			// Piso 2: solo ambientes
			const totalAmbientesHeight = floorData.ambientesSuperiores.reduce(
				(sum, amb) => sum + amb.alto,
				0
			);
			const startYAmbientes = (rectHeight - totalAmbientesHeight) / 2;
			let currentYAmbiente = startYAmbientes;

			floorData.ambientesSuperiores.forEach((ambiente) => {
				const x =
					origin.east +
					dirX.east * (rectWidth - ambiente.ancho) +
					dirY.east * currentYAmbiente;
				const y =
					origin.north +
					dirX.north * (rectWidth - ambiente.ancho) +
					dirY.north * currentYAmbiente;

				const ambienteData = createRoomCorners(
					x,
					y,
					ambiente.ancho,
					ambiente.alto
				);
				elementos.ambientes.push({
					nombre: ambiente.nombre,
					tipo: "superior",
					corners: ambienteData.corners,
					realCorners: ambienteData.realCorners,
				});
				currentYAmbiente += ambiente.alto;
			});
		}

		// ========================================
		// PABELLÓN PRIMARIA (abajo, horizontal)
		// ========================================
		let currentXPrimaria = CIRCULACION_LATERAL;

		for (let i = 0; i < floorData.primaria; i++) {
			const x = origin.east + dirX.east * currentXPrimaria;
			const y = origin.north + dirX.north * currentXPrimaria;

			const aulaData = createRoomCorners(
				x,
				y,
				CLASSROOM_WIDTH,
				CLASSROOM_HEIGHT
			);
			elementos.primaria.push({
				corners: aulaData.corners,
				realCorners: aulaData.realCorners,
			});
			currentXPrimaria += CLASSROOM_WIDTH;

			if (i === 0 && floorData.primaria > 0 && totalFloors > 1) {
				// Escalera
				const xEsc = origin.east + dirX.east * currentXPrimaria;
				const yEsc = origin.north + dirX.north * currentXPrimaria;

				const escaleraData = createRoomCorners(
					xEsc,
					yEsc,
					ESCALERA_WIDTH,
					ESCALERA_HEIGHT
				);
				elementos.escaleras.push({
					nivel: "Primaria",
					corners: escaleraData.corners,
					realCorners: escaleraData.realCorners,
				});
				currentXPrimaria += ESCALERA_WIDTH;

				// Baño (solo piso 1)
				if (currentFloor === 1) {
					const xBano = origin.east + dirX.east * currentXPrimaria;
					const yBano = origin.north + dirX.north * currentXPrimaria;

					const banoData = createRoomCorners(
						xBano,
						yBano,
						BANO_WIDTH,
						BANO_HEIGHT
					);
					elementos.banos.push({
						nivel: "Primaria",
						corners: banoData.corners,
						realCorners: banoData.realCorners,
					});
					currentXPrimaria += BANO_WIDTH;
				}
			}
		}

		// Ambientes en pabellón primaria
		const ambientesPrimariaEnPabellon =
			distribution.ambientesEnPabellones.filter(
				(a) => a.pabellon === "primaria"
			);

		if (
			ambientesPrimariaEnPabellon.length > 0 &&
			currentFloor === 1 &&
			floorData.primaria > 0
		) {
			ambientesPrimariaEnPabellon.forEach((ambiente) => {
				const x = origin.east + dirX.east * currentXPrimaria;
				const y = origin.north + dirX.north * currentXPrimaria;

				const ambienteData = createRoomCorners(
					x,
					y,
					ambiente.ancho,
					ambiente.alto
				);
				elementos.ambientes.push({
					nombre: ambiente.nombre,
					tipo: "pabellon",
					corners: ambienteData.corners,
					realCorners: ambienteData.realCorners,
				});
				currentXPrimaria += ambiente.ancho;
			});
		}

		// Ambientes en espacio libre de primaria
		if (
			floorData.ambientesPrimariaLibre &&
			floorData.ambientesPrimariaLibre.length > 0
		) {
			floorData.ambientesPrimariaLibre.forEach((ambiente) => {
				const x = origin.east + dirX.east * currentXPrimaria;
				const y = origin.north + dirX.north * currentXPrimaria;

				const ambienteData = createRoomCorners(
					x,
					y,
					ambiente.ancho,
					ambiente.alto
				);
				elementos.ambientes.push({
					nombre: ambiente.nombre,
					tipo: "pabellon_libre",
					corners: ambienteData.corners,
					realCorners: ambienteData.realCorners,
				});
				currentXPrimaria += ambiente.ancho;
			});
		}

		// ========================================
		// PABELLÓN SECUNDARIA (arriba, horizontal)
		// ========================================
		let currentXSecundaria = CIRCULACION_LATERAL;

		for (let i = 0; i < floorData.secundaria; i++) {
			const x =
				origin.east +
				dirX.east * currentXSecundaria +
				dirY.east * (rectHeight - CLASSROOM_HEIGHT);
			const y =
				origin.north +
				dirX.north * currentXSecundaria +
				dirY.north * (rectHeight - CLASSROOM_HEIGHT);

			const aulaData = createRoomCorners(
				x,
				y,
				CLASSROOM_WIDTH,
				CLASSROOM_HEIGHT
			);
			elementos.secundaria.push({
				corners: aulaData.corners,
				realCorners: aulaData.realCorners,
			});
			currentXSecundaria += CLASSROOM_WIDTH;

			if (i === 0 && floorData.secundaria > 0 && totalFloors > 1) {
				// Escalera
				const xEsc =
					origin.east +
					dirX.east * currentXSecundaria +
					dirY.east * (rectHeight - CLASSROOM_HEIGHT);
				const yEsc =
					origin.north +
					dirX.north * currentXSecundaria +
					dirY.north * (rectHeight - CLASSROOM_HEIGHT);

				const escaleraData = createRoomCorners(
					xEsc,
					yEsc,
					ESCALERA_WIDTH,
					ESCALERA_HEIGHT
				);
				elementos.escaleras.push({
					nivel: "Secundaria",
					corners: escaleraData.corners,
					realCorners: escaleraData.realCorners,
				});
				currentXSecundaria += ESCALERA_WIDTH;

				// Baño (solo piso 1)
				if (currentFloor === 1) {
					const xBano =
						origin.east +
						dirX.east * currentXSecundaria +
						dirY.east * (rectHeight - CLASSROOM_HEIGHT);
					const yBano =
						origin.north +
						dirX.north * currentXSecundaria +
						dirY.north * (rectHeight - CLASSROOM_HEIGHT);

					const banoData = createRoomCorners(
						xBano,
						yBano,
						BANO_WIDTH,
						BANO_HEIGHT
					);
					elementos.banos.push({
						nivel: "Secundaria",
						corners: banoData.corners,
						realCorners: banoData.realCorners,
					});
					currentXSecundaria += BANO_WIDTH;
				}
			}
		}

		// Ambientes en pabellón secundaria
		const ambientesSecundariaEnPabellon =
			distribution.ambientesEnPabellones.filter(
				(a) => a.pabellon === "secundaria"
			);

		if (
			ambientesSecundariaEnPabellon.length > 0 &&
			currentFloor === 1 &&
			floorData.secundaria > 0
		) {
			ambientesSecundariaEnPabellon.forEach((ambiente) => {
				const x =
					origin.east +
					dirX.east * currentXSecundaria +
					dirY.east * (rectHeight - CLASSROOM_HEIGHT);
				const y =
					origin.north +
					dirX.north * currentXSecundaria +
					dirY.north * (rectHeight - CLASSROOM_HEIGHT);

				const ambienteData = createRoomCorners(
					x,
					y,
					ambiente.ancho,
					ambiente.alto
				);
				elementos.ambientes.push({
					nombre: ambiente.nombre,
					tipo: "pabellon",
					corners: ambienteData.corners,
					realCorners: ambienteData.realCorners,
				});
				currentXSecundaria += ambiente.ancho;
			});
		}

		// Ambientes en espacio libre de secundaria
		if (
			floorData.ambientesSecundariaLibre &&
			floorData.ambientesSecundariaLibre.length > 0
		) {
			floorData.ambientesSecundariaLibre.forEach((ambiente) => {
				const x =
					origin.east +
					dirX.east * currentXSecundaria +
					dirY.east * (rectHeight - CLASSROOM_HEIGHT);
				const y =
					origin.north +
					dirX.north * currentXSecundaria +
					dirY.north * (rectHeight - CLASSROOM_HEIGHT);

				const ambienteData = createRoomCorners(
					x,
					y,
					ambiente.ancho,
					ambiente.alto
				);
				elementos.ambientes.push({
					nombre: ambiente.nombre,
					tipo: "pabellon_libre",
					corners: ambienteData.corners,
					realCorners: ambienteData.realCorners,
				});
				currentXSecundaria += ambiente.ancho;
			});
		}

		// ========================================
		// PABELLÓN INICIAL (izquierda, vertical)
		// ========================================

		const pabellonIzquierdaColor =
			distribution.pabellonInferiorEs === "primaria"
				? "primaria"
				: distribution.pabellonInferiorEs === "secundaria"
				? "secundaria"
				: "inicial";

		// ✅ CALCULAR ALTO TOTAL DEL PABELLÓN INICIAL
		let altoTotalInicial = floorData.inicial * CLASSROOM_HEIGHT;

		// Agregar escalera y baño si hay más de un piso
		if (floorData.inicial > 0 && totalFloors > 1) {
			altoTotalInicial += ESCALERA_HEIGHT;
			if (currentFloor === 1) {
				altoTotalInicial += BANO_HEIGHT;
			}
		}

		// Agregar psicomotricidad si existe
		const psicomotricidadEnInicial =
			distribution.ambientesEnPabellones.find(
				(a) => a.pabellon === "inicial"
			);
		if (
			psicomotricidadEnInicial &&
			currentFloor === 1 &&
			floorData.inicial > 0
		) {
			altoTotalInicial += psicomotricidadEnInicial.alto;
		}

		// Agregar ambientes libres
		if (
			floorData.ambientesInicialLibre &&
			floorData.ambientesInicialLibre.length > 0
		) {
			floorData.ambientesInicialLibre.forEach((ambiente) => {
				altoTotalInicial += ambiente.alto;
			});
		}

		// ✅ CENTRAR EN EL RECTÁNGULO
		const startYInicial = CLASSROOM_HEIGHT + CIRCULACION_ENTRE_PABELLONES;
		const espacioDisponibleInicial =
			rectHeight -
			CLASSROOM_HEIGHT * 2 -
			CIRCULACION_ENTRE_PABELLONES * 2;
		let currentYInicial =
			startYInicial + (espacioDisponibleInicial - altoTotalInicial) / 2;

		// console.log("📍 Inicial centrado (vertical):", {
		// 	altoTotal: altoTotalInicial.toFixed(1),
		// 	espacioDisponible: espacioDisponibleInicial.toFixed(1),
		// 	posicionInicio: currentYInicial.toFixed(1),
		// });

		// Renderizar aulas
		for (let i = 0; i < floorData.inicial; i++) {
			const x = origin.east + dirY.east * currentYInicial;
			const y = origin.north + dirY.north * currentYInicial;

			const aulaData = createRoomCorners(
				x,
				y,
				CLASSROOM_WIDTH,
				CLASSROOM_HEIGHT
			);

			if (pabellonIzquierdaColor === "inicial") {
				elementos.inicial.push({
					corners: aulaData.corners,
					realCorners: aulaData.realCorners,
				});
			} else if (pabellonIzquierdaColor === "primaria") {
				elementos.primaria.push({
					corners: aulaData.corners,
					realCorners: aulaData.realCorners,
				});
			} else if (pabellonIzquierdaColor === "secundaria") {
				elementos.secundaria.push({
					corners: aulaData.corners,
					realCorners: aulaData.realCorners,
				});
			}

			currentYInicial += CLASSROOM_HEIGHT;

			// Escalera y baño después de la primera aula
			if (i === 0 && floorData.inicial > 0 && totalFloors > 1) {
				// Escalera
				const xEsc = origin.east + dirY.east * currentYInicial;
				const yEsc = origin.north + dirY.north * currentYInicial;

				const escaleraData = createRoomCorners(
					xEsc,
					yEsc,
					CLASSROOM_WIDTH,
					ESCALERA_HEIGHT
				);
				elementos.escaleras.push({
					nivel: "Inicial",
					corners: escaleraData.corners,
					realCorners: escaleraData.realCorners,
				});
				currentYInicial += ESCALERA_HEIGHT;

				// Baño (solo piso 1)
				if (currentFloor === 1) {
					const xBano = origin.east + dirY.east * currentYInicial;
					const yBano = origin.north + dirY.north * currentYInicial;

					const banoData = createRoomCorners(
						xBano,
						yBano,
						CLASSROOM_WIDTH,
						BANO_HEIGHT
					);
					elementos.banos.push({
						nivel: "Inicial",
						corners: banoData.corners,
						realCorners: banoData.realCorners,
					});
					currentYInicial += BANO_HEIGHT;
				}
			}
		}

		// Psicomotricidad
		if (
			psicomotricidadEnInicial &&
			currentFloor === 1 &&
			floorData.inicial > 0
		) {
			const x = origin.east + dirY.east * currentYInicial;
			const y = origin.north + dirY.north * currentYInicial;

			const psicomotricidadData = createRoomCorners(
				x,
				y,
				psicomotricidadEnInicial.ancho,
				psicomotricidadEnInicial.alto
			);
			elementos.ambientes.push({
				nombre: psicomotricidadEnInicial.nombre,
				tipo: "pabellon",
				corners: psicomotricidadData.corners,
				realCorners: psicomotricidadData.realCorners,
			});
			currentYInicial += psicomotricidadEnInicial.alto;
		}

		// Ambientes libres
		if (
			floorData.ambientesInicialLibre &&
			floorData.ambientesInicialLibre.length > 0
		) {
			floorData.ambientesInicialLibre.forEach((ambiente) => {
				const x = origin.east + dirY.east * currentYInicial;
				const y = origin.north + dirY.north * currentYInicial;

				const ambienteData = createRoomCorners(
					x,
					y,
					ambiente.ancho,
					ambiente.alto
				);
				elementos.ambientes.push({
					nombre: ambiente.nombre,
					tipo: "pabellon_libre",
					corners: ambienteData.corners,
					realCorners: ambienteData.realCorners,
				});
				currentYInicial += ambiente.alto;
			});
		}
	};

	const convertToSVG = () => {
		if (coordinates.length < 3) return { points: [], bounds: null };

		const easts = coordinates.map((c) => c.east);
		const norths = coordinates.map((c) => c.north);
		const minEast = Math.min(...easts);
		const maxEast = Math.max(...easts);
		const minNorth = Math.min(...norths);
		const maxNorth = Math.max(...norths);

		const width = 600;
		const height = 600;
		const padding = 50;
		const rangeEast = maxEast - minEast || 1;
		const rangeNorth = maxNorth - minNorth || 1;
		const scale = Math.min(
			(width - 2 * padding) / rangeEast,
			(height - 2 * padding) / rangeNorth
		);

		const points = coordinates.map((coord) => ({
			x: (coord.east - minEast) * scale + padding,
			y: height - ((coord.north - minNorth) * scale + padding),
			east: coord.east,
			north: coord.north,
		}));

		let rectangleSVG = null;
		let elementos = {
			inicial: [],
			primaria: [],
			secundaria: [],
			ambientes: [],
			banos: [],
			escaleras: [],
			laterales: [],
			entrada: null,
		};
		let canchaSVG = null;

		if (maxRectangle) {
			rectangleSVG = maxRectangle.corners.map((corner) => ({
				x: (corner.east - minEast) * scale + padding,
				y: height - ((corner.north - minNorth) * scale + padding),
			}));

			if (!distribution) {
				return {
					points,
					rectangleSVG,
					elementos,
					canchaSVG,
					bounds: { minEast, maxEast, minNorth, maxNorth, scale },
				};
			}

			// const floorData = distribution.floors[currentFloor];
			// const layoutMode = distribution.layoutMode || "horizontal";
			// const rectWidth = maxRectangle.width;
			// const rectHeight = maxRectangle.height;
			// const origin = maxRectangle.corners[0];
			// const angle = (maxRectangle.angle * Math.PI) / 180;
			// const dirX = { east: Math.cos(angle), north: Math.sin(angle) };
			// const dirY = { east: -Math.sin(angle), north: Math.cos(angle) };
			const floorData = distribution.floors[currentFloor];
			const layoutMode = distribution.layoutMode || "horizontal";

			// ✅ RETIRO DESDE EL BORDE DEL TERRENO
			const RETIRO_TERRENO = 0.5;
			const rectWidth = maxRectangle.width - RETIRO_TERRENO * 2;
			const rectHeight = maxRectangle.height - RETIRO_TERRENO * 2;

			// Calcular ángulo y direcciones
			const angle = (maxRectangle.angle * Math.PI) / 180;
			const dirX = { east: Math.cos(angle), north: Math.sin(angle) };
			const dirY = { east: -Math.sin(angle), north: Math.cos(angle) };

			// ✅ ORIGEN AJUSTADO (con retiro aplicado)
			const origin = {
				east:
					maxRectangle.corners[0].east +
					dirX.east * RETIRO_TERRENO +
					dirY.east * RETIRO_TERRENO,
				north:
					maxRectangle.corners[0].north +
					dirX.north * RETIRO_TERRENO +
					dirY.north * RETIRO_TERRENO,
			};

			const createRoomCorners = (x, y, w, h) => {
				const realCorners = [
					{ east: x, north: y },
					{ east: x + dirX.east * w, north: y + dirX.north * w },
					{
						east: x + dirX.east * w + dirY.east * h,
						north: y + dirX.north * w + dirY.north * h,
					},
					{ east: x + dirY.east * h, north: y + dirY.north * h },
				];

				return {
					corners: realCorners.map((c) => ({
						x: (c.east - minEast) * scale + padding,
						y: height - ((c.north - minNorth) * scale + padding),
					})),
					realCorners: realCorners,
				};
			};

			// ✅ RENDERIZAR SEGÚN EL MODO
			console.log("Renderizando en modo:", layoutMode);

			if (layoutMode === "horizontal") {
				renderLayoutHorizontal(
					floorData,
					origin,
					dirX,
					dirY,
					rectWidth,
					rectHeight,
					createRoomCorners,
					elementos
				);
			} else {
				renderLayoutVertical(
					floorData,
					origin,
					dirX,
					dirY,
					rectWidth,
					rectHeight,
					createRoomCorners,
					elementos
				);
			}

			// ✅ CUADRANTE INTERIOR (funciona para ambos modos)
			if (currentFloor === 1 && floorData.distribucionCuadrante) {
				const dist = floorData.distribucionCuadrante;

				// Renderizar cancha
				if (dist.cancha) {
					const canchaX = dist.cancha.x;
					const canchaY = dist.cancha.y;

					const canchaOrigin = {
						east:
							origin.east +
							dirX.east * canchaX +
							dirY.east * canchaY,
						north:
							origin.north +
							dirX.north * canchaX +
							dirY.north * canchaY,
					};

					const canchaData = createRoomCorners(
						canchaOrigin.east,
						canchaOrigin.north,
						dist.cancha.width,
						dist.cancha.height
					);
					canchaSVG = canchaData.corners;
					elementos.cancha = {
						realCorners: canchaData.realCorners,
						rotada: dist.cancha.rotada,
					};
				}

				// Renderizar ambientes alrededor de la cancha
				const renderAmbientes = (ambientesList) => {
					ambientesList.forEach((ambiente) => {
						const x =
							origin.east +
							dirX.east * ambiente.x +
							dirY.east * ambiente.y;
						const y =
							origin.north +
							dirX.north * ambiente.x +
							dirY.north * ambiente.y;

						const ambienteData = createRoomCorners(
							x,
							y,
							ambiente.ancho,
							ambiente.alto
						);
						elementos.laterales.push({
							nombre: ambiente.nombre,
							corners: ambienteData.corners,
							realCorners: ambienteData.realCorners,
							posicion: ambiente.posicion || "center",
						});
					});
				};

				if (dist.ambientesBottom?.length > 0)
					renderAmbientes(dist.ambientesBottom);
				if (dist.ambientesTop?.length > 0)
					renderAmbientes(dist.ambientesTop);
				if (dist.ambientesLeft?.length > 0)
					renderAmbientes(dist.ambientesLeft);
				if (dist.ambientesRight?.length > 0)
					renderAmbientes(dist.ambientesRight);
			}
		}

		return {
			points,
			rectangleSVG,
			elementos,
			canchaSVG,
			bounds: { minEast, maxEast, minNorth, maxNorth, scale },
		};
	};

	// const convertToSVG = () => {
	// 	if (coordinates.length < 3) return { points: [], bounds: null };

	// 	const easts = coordinates.map((c) => c.east);
	// 	const norths = coordinates.map((c) => c.north);
	// 	const minEast = Math.min(...easts);
	// 	const maxEast = Math.max(...easts);
	// 	const minNorth = Math.min(...norths);
	// 	const maxNorth = Math.max(...norths);

	// 	const width = 600;
	// 	const height = 600;
	// 	const padding = 50;
	// 	const rangeEast = maxEast - minEast || 1;
	// 	const rangeNorth = maxNorth - minNorth || 1;
	// 	const scale = Math.min(
	// 		(width - 2 * padding) / rangeEast,
	// 		(height - 2 * padding) / rangeNorth
	// 	);

	// 	const points = coordinates.map((coord) => ({
	// 		x: (coord.east - minEast) * scale + padding,
	// 		y: height - ((coord.north - minNorth) * scale + padding),
	// 		east: coord.east,
	// 		north: coord.north,
	// 	}));

	// 	let rectangleSVG = null;
	// 	let elementos = {
	// 		inicial: [],
	// 		primaria: [],
	// 		secundaria: [],
	// 		ambientes: [],
	// 		banos: [],
	// 		escaleras: [],
	// 		laterales: [],
	// 		entrada: null,
	// 	};
	// 	let canchaSVG = null;

	// 	if (maxRectangle) {
	// 		rectangleSVG = maxRectangle.corners.map((corner) => ({
	// 			x: (corner.east - minEast) * scale + padding,
	// 			y: height - ((corner.north - minNorth) * scale + padding),
	// 		}));

	// 		if (!distribution) {
	// 			return {
	// 				points,
	// 				rectangleSVG,
	// 				elementos,
	// 				canchaSVG,
	// 				bounds: { minEast, maxEast, minNorth, maxNorth, scale },
	// 			};
	// 		}

	// 		const floorData = distribution.floors[currentFloor];
	// 		const rectWidth = maxRectangle.width;
	// 		const rectHeight = maxRectangle.height;
	// 		const origin = maxRectangle.corners[0];
	// 		const angle = (maxRectangle.angle * Math.PI) / 180;
	// 		const dirX = { east: Math.cos(angle), north: Math.sin(angle) };
	// 		const dirY = { east: -Math.sin(angle), north: Math.cos(angle) };

	// 		// ✅ FUNCIÓN MODIFICADA: Retorna coordenadas SVG y REALES
	// 		const createRoomCorners = (x, y, w, h) => {
	// 			const realCorners = [
	// 				{ east: x, north: y },
	// 				{ east: x + dirX.east * w, north: y + dirX.north * w },
	// 				{
	// 					east: x + dirX.east * w + dirY.east * h,
	// 					north: y + dirX.north * w + dirY.north * h,
	// 				},
	// 				{ east: x + dirY.east * h, north: y + dirY.north * h },
	// 			];

	// 			return {
	// 				corners: realCorners.map((c) => ({
	// 					x: (c.east - minEast) * scale + padding,
	// 					y: height - ((c.north - minNorth) * scale + padding),
	// 				})),
	// 				realCorners: realCorners, // ✅ Coordenadas REALES
	// 			};
	// 		};

	// 		// ENTRADA - al medio de ambientes complementarios
	// 		if (
	// 			currentFloor === 1 &&
	// 			floorData.ambientesSuperiores &&
	// 			floorData.ambientesSuperiores.length > 0
	// 		) {
	// 			const totalAmbientes = floorData.ambientesSuperiores.length;
	// 			const totalAmbientesWidth =
	// 				floorData.ambientesSuperiores.reduce(
	// 					(sum, amb) => sum + amb.ancho,
	// 					0
	// 				);

	// 			// ✅ CALCULAR POSICIÓN MEDIA (entre ambiente 2 y 3 si hay 4)
	// 			const posicionEntrada = Math.floor(totalAmbientes / 2);

	// 			// Calcular ancho de ambientes ANTES de la entrada
	// 			const widthAntesEntrada = floorData.ambientesSuperiores
	// 				.slice(0, posicionEntrada)
	// 				.reduce((sum, amb) => sum + amb.ancho, 0);

	// 			// Centrar todo el bloque (ambientes + entrada)
	// 			const totalWidth = totalAmbientesWidth + ENTRADA_WIDTH;
	// 			const startXAmbientes = (rectWidth - totalWidth) / 2;

	// 			let currentXAmbiente = startXAmbientes;
	// 			const ambienteY = rectHeight - CLASSROOM_HEIGHT;

	// 			// Dibujar ambientes ANTES de la entrada
	// 			floorData.ambientesSuperiores
	// 				.slice(0, posicionEntrada)
	// 				.forEach((ambiente) => {
	// 					const x =
	// 						origin.east +
	// 						dirX.east * currentXAmbiente +
	// 						dirY.east * (rectHeight - ambiente.alto);
	// 					const y =
	// 						origin.north +
	// 						dirX.north * currentXAmbiente +
	// 						dirY.north * (rectHeight - ambiente.alto);

	// 					const ambienteData = createRoomCorners(
	// 						x,
	// 						y,
	// 						ambiente.ancho,
	// 						ambiente.alto
	// 					);
	// 					elementos.ambientes.push({
	// 						nombre: ambiente.nombre,
	// 						tipo: "superior",
	// 						corners: ambienteData.corners,
	// 						realCorners: ambienteData.realCorners,
	// 					});
	// 					currentXAmbiente += ambiente.ancho;
	// 				});

	// 			// ✅ ENTRADA AL MEDIO
	// 			const xEnt =
	// 				origin.east +
	// 				dirX.east * currentXAmbiente +
	// 				dirY.east * ambienteY;
	// 			const yEnt =
	// 				origin.north +
	// 				dirX.north * currentXAmbiente +
	// 				dirY.north * ambienteY;

	// 			const entradaData = createRoomCorners(
	// 				xEnt,
	// 				yEnt,
	// 				ENTRADA_WIDTH,
	// 				CLASSROOM_HEIGHT
	// 			);
	// 			elementos.entrada = {
	// 				corners: entradaData.corners,
	// 				realCorners: entradaData.realCorners,
	// 			};
	// 			currentXAmbiente += ENTRADA_WIDTH;

	// 			// Dibujar ambientes DESPUÉS de la entrada
	// 			floorData.ambientesSuperiores
	// 				.slice(posicionEntrada)
	// 				.forEach((ambiente) => {
	// 					const x =
	// 						origin.east +
	// 						dirX.east * currentXAmbiente +
	// 						dirY.east * (rectHeight - ambiente.alto);
	// 					const y =
	// 						origin.north +
	// 						dirX.north * currentXAmbiente +
	// 						dirY.north * (rectHeight - ambiente.alto);

	// 					const ambienteData = createRoomCorners(
	// 						x,
	// 						y,
	// 						ambiente.ancho,
	// 						ambiente.alto
	// 					);
	// 					elementos.ambientes.push({
	// 						nombre: ambiente.nombre,
	// 						tipo: "superior",
	// 						corners: ambienteData.corners,
	// 						realCorners: ambienteData.realCorners,
	// 					});
	// 					currentXAmbiente += ambiente.ancho;
	// 				});
	// 		}

	// 		// INICIAL (o pabellón que ocupa ese lugar)
	// 		const pabellonInferiorColor =
	// 			distribution.pabellonInferiorEs === "primaria"
	// 				? "primaria"
	// 				: distribution.pabellonInferiorEs === "secundaria"
	// 				? "secundaria"
	// 				: "inicial";

	// 		let currentXInicial = CIRCULACION_LATERAL;

	// 		for (let i = 0; i < floorData.inicial; i++) {
	// 			// ✅ DIBUJAR AULA PRIMERO
	// 			const x = origin.east + dirX.east * currentXInicial;
	// 			const y = origin.north + dirX.north * currentXInicial;

	// 			const aulaData = createRoomCorners(
	// 				x,
	// 				y,
	// 				CLASSROOM_WIDTH,
	// 				CLASSROOM_HEIGHT
	// 			);

	// 			if (pabellonInferiorColor === "inicial") {
	// 				elementos.inicial.push({
	// 					corners: aulaData.corners,
	// 					realCorners: aulaData.realCorners,
	// 				});
	// 			} else if (pabellonInferiorColor === "primaria") {
	// 				elementos.primaria.push({
	// 					corners: aulaData.corners,
	// 					realCorners: aulaData.realCorners,
	// 				});
	// 			} else if (pabellonInferiorColor === "secundaria") {
	// 				elementos.secundaria.push({
	// 					corners: aulaData.corners,
	// 					realCorners: aulaData.realCorners,
	// 				});
	// 			}

	// 			currentXInicial += CLASSROOM_WIDTH;

	// 			// ✅ DESPUÉS DE LA PRIMERA AULA: ESCALERA → BAÑO
	// 			if (i === 0 && floorData.inicial > 0 && totalFloors > 1) {
	// 				// ESCALERA PRIMERO (ambos pisos)
	// 				const xEsc = origin.east + dirX.east * currentXInicial;
	// 				const yEsc = origin.north + dirX.north * currentXInicial;

	// 				const escaleraData = createRoomCorners(
	// 					xEsc,
	// 					yEsc,
	// 					ESCALERA_WIDTH,
	// 					ESCALERA_HEIGHT
	// 				);
	// 				elementos.escaleras.push({
	// 					nivel: "Inicial",
	// 					corners: escaleraData.corners,
	// 					realCorners: escaleraData.realCorners,
	// 				});
	// 				currentXInicial += ESCALERA_WIDTH;

	// 				// BAÑO DESPUÉS (solo piso 1)
	// 				if (currentFloor === 1) {
	// 					const xBano = origin.east + dirX.east * currentXInicial;
	// 					const yBano =
	// 						origin.north + dirX.north * currentXInicial;

	// 					const banoData = createRoomCorners(
	// 						xBano,
	// 						yBano,
	// 						BANO_WIDTH,
	// 						BANO_HEIGHT
	// 					);
	// 					elementos.banos.push({
	// 						nivel: "Inicial",
	// 						corners: banoData.corners,
	// 						realCorners: banoData.realCorners,
	// 					});
	// 					currentXInicial += BANO_WIDTH;
	// 				}
	// 			}
	// 		}

	// 		// ✅ NUEVO: Sala de Psicomotricidad al final del pabellón inicial
	// 		const psicomotricidadEnInicial =
	// 			distribution.ambientesEnPabellones.find(
	// 				(a) => a.pabellon === "inicial"
	// 			);

	// 		if (
	// 			psicomotricidadEnInicial &&
	// 			currentFloor === 1 &&
	// 			floorData.inicial > 0
	// 		) {
	// 			const x = origin.east + dirX.east * currentXInicial;
	// 			const y = origin.north + dirX.north * currentXInicial;

	// 			const psicomotricidadData = createRoomCorners(
	// 				x,
	// 				y,
	// 				psicomotricidadEnInicial.ancho,
	// 				psicomotricidadEnInicial.alto
	// 			);
	// 			elementos.ambientes.push({
	// 				nombre: psicomotricidadEnInicial.nombre,
	// 				tipo: "pabellon",
	// 				corners: psicomotricidadData.corners,
	// 				realCorners: psicomotricidadData.realCorners,
	// 			});
	// 		}

	// 		// ✅ NUEVO: Ambientes en espacio libre de INICIAL
	// 		if (
	// 			floorData.ambientesInicialLibre &&
	// 			floorData.ambientesInicialLibre.length > 0
	// 		) {
	// 			floorData.ambientesInicialLibre.forEach((ambiente) => {
	// 				const x = origin.east + dirX.east * currentXInicial;
	// 				const y = origin.north + dirX.north * currentXInicial;

	// 				const ambienteData = createRoomCorners(
	// 					x,
	// 					y,
	// 					ambiente.ancho,
	// 					ambiente.alto
	// 				);
	// 				elementos.ambientes.push({
	// 					nombre: ambiente.nombre,
	// 					tipo: "pabellon_libre",
	// 					corners: ambienteData.corners,
	// 					realCorners: ambienteData.realCorners,
	// 				});
	// 				currentXInicial += ambiente.ancho;
	// 			});
	// 		}

	// 		// PRIMARIA
	// 		const startYPrimaria =
	// 			CLASSROOM_HEIGHT + CIRCULACION_ENTRE_PABELLONES;
	// 		let currentYPrimaria = startYPrimaria;
	// 		const bibliotecaEnPrimaria =
	// 			distribution.ambientesEnPabellones.find(
	// 				(a) => a.pabellon === "primaria"
	// 			);

	// 		for (let i = 0; i < floorData.primaria; i++) {
	// 			// ✅ DIBUJAR AULA PRIMERO
	// 			const x = origin.east + dirY.east * currentYPrimaria;
	// 			const y = origin.north + dirY.north * currentYPrimaria;

	// 			const aulaData = createRoomCorners(
	// 				x,
	// 				y,
	// 				CLASSROOM_WIDTH,
	// 				CLASSROOM_HEIGHT
	// 			);
	// 			elementos.primaria.push({
	// 				corners: aulaData.corners,
	// 				realCorners: aulaData.realCorners,
	// 			});
	// 			currentYPrimaria += CLASSROOM_HEIGHT;

	// 			// ✅ DESPUÉS DE LA PRIMERA AULA: ESCALERA → BAÑO
	// 			if (i === 0 && floorData.primaria > 0 && totalFloors > 1) {
	// 				// ESCALERA PRIMERO (ambos pisos)
	// 				const xEsc = origin.east + dirY.east * currentYPrimaria;
	// 				const yEsc = origin.north + dirY.north * currentYPrimaria;

	// 				const escaleraData = createRoomCorners(
	// 					xEsc,
	// 					yEsc,
	// 					CLASSROOM_WIDTH,
	// 					ESCALERA_HEIGHT
	// 				);
	// 				elementos.escaleras.push({
	// 					nivel: "Primaria",
	// 					corners: escaleraData.corners,
	// 					realCorners: escaleraData.realCorners,
	// 				});
	// 				currentYPrimaria += ESCALERA_HEIGHT;

	// 				// BAÑO DESPUÉS (solo piso 1)
	// 				if (currentFloor === 1) {
	// 					const xBano =
	// 						origin.east + dirY.east * currentYPrimaria;
	// 					const yBano =
	// 						origin.north + dirY.north * currentYPrimaria;

	// 					const banoData = createRoomCorners(
	// 						xBano,
	// 						yBano,
	// 						CLASSROOM_WIDTH,
	// 						BANO_HEIGHT
	// 					);
	// 					elementos.banos.push({
	// 						nivel: "Primaria",
	// 						corners: banoData.corners,
	// 						realCorners: banoData.realCorners,
	// 					});
	// 					currentYPrimaria += BANO_HEIGHT;
	// 				}
	// 			}
	// 		}
	// 		// Biblioteca y otros ambientes al final del pabellón primaria
	// 		const ambientesPrimariaEnPabellon =
	// 			distribution.ambientesEnPabellones.filter(
	// 				(a) => a.pabellon === "primaria"
	// 			);

	// 		if (
	// 			ambientesPrimariaEnPabellon.length > 0 &&
	// 			currentFloor === 1 &&
	// 			floorData.primaria > 0
	// 		) {
	// 			ambientesPrimariaEnPabellon.forEach((ambiente) => {
	// 				const x = origin.east + dirY.east * currentYPrimaria;
	// 				const y = origin.north + dirY.north * currentYPrimaria;

	// 				const ambienteData = createRoomCorners(
	// 					x,
	// 					y,
	// 					ambiente.ancho,
	// 					ambiente.alto
	// 				);
	// 				elementos.ambientes.push({
	// 					nombre: ambiente.nombre,
	// 					tipo: "pabellon",
	// 					corners: ambienteData.corners,
	// 					realCorners: ambienteData.realCorners,
	// 				});
	// 				currentYPrimaria += ambiente.alto;
	// 			});
	// 		}

	// 		// ✅ NUEVO: Ambientes en espacio libre de PRIMARIA
	// 		if (
	// 			floorData.ambientesPrimariaLibre &&
	// 			floorData.ambientesPrimariaLibre.length > 0
	// 		) {
	// 			floorData.ambientesPrimariaLibre.forEach((ambiente) => {
	// 				const x = origin.east + dirY.east * currentYPrimaria;
	// 				const y = origin.north + dirY.north * currentYPrimaria;

	// 				const ambienteData = createRoomCorners(
	// 					x,
	// 					y,
	// 					ambiente.ancho,
	// 					ambiente.alto
	// 				);
	// 				elementos.ambientes.push({
	// 					nombre: ambiente.nombre,
	// 					tipo: "pabellon_libre",
	// 					corners: ambienteData.corners,
	// 					realCorners: ambienteData.realCorners,
	// 				});
	// 				currentYPrimaria += ambiente.alto;
	// 			});
	// 		}

	// 		// SECUNDARIA
	// 		let currentYSecundaria = startYPrimaria;
	// 		const laboratorioEnSecundaria =
	// 			distribution.ambientesEnPabellones.find(
	// 				(a) => a.pabellon === "secundaria"
	// 			);

	// 		for (let i = 0; i < floorData.secundaria; i++) {
	// 			// ✅ DIBUJAR AULA PRIMERO
	// 			const x =
	// 				origin.east +
	// 				dirX.east * (rectWidth - CLASSROOM_WIDTH) +
	// 				dirY.east * currentYSecundaria;
	// 			const y =
	// 				origin.north +
	// 				dirX.north * (rectWidth - CLASSROOM_WIDTH) +
	// 				dirY.north * currentYSecundaria;

	// 			const aulaData = createRoomCorners(
	// 				x,
	// 				y,
	// 				CLASSROOM_WIDTH,
	// 				CLASSROOM_HEIGHT
	// 			);
	// 			elementos.secundaria.push({
	// 				corners: aulaData.corners,
	// 				realCorners: aulaData.realCorners,
	// 			});
	// 			currentYSecundaria += CLASSROOM_HEIGHT;

	// 			// ✅ DESPUÉS DE LA PRIMERA AULA: ESCALERA → BAÑO
	// 			if (i === 0 && floorData.secundaria > 0 && totalFloors > 1) {
	// 				// ESCALERA PRIMERO (ambos pisos)
	// 				const xEsc =
	// 					origin.east +
	// 					dirX.east * (rectWidth - CLASSROOM_WIDTH) +
	// 					dirY.east * currentYSecundaria;
	// 				const yEsc =
	// 					origin.north +
	// 					dirX.north * (rectWidth - CLASSROOM_WIDTH) +
	// 					dirY.north * currentYSecundaria;

	// 				const escaleraData = createRoomCorners(
	// 					xEsc,
	// 					yEsc,
	// 					CLASSROOM_WIDTH,
	// 					ESCALERA_HEIGHT
	// 				);
	// 				elementos.escaleras.push({
	// 					nivel: "Secundaria",
	// 					corners: escaleraData.corners,
	// 					realCorners: escaleraData.realCorners,
	// 				});
	// 				currentYSecundaria += ESCALERA_HEIGHT;

	// 				// BAÑO DESPUÉS (solo piso 1)
	// 				if (currentFloor === 1) {
	// 					const xBano =
	// 						origin.east +
	// 						dirX.east * (rectWidth - CLASSROOM_WIDTH) +
	// 						dirY.east * currentYSecundaria;
	// 					const yBano =
	// 						origin.north +
	// 						dirX.north * (rectWidth - CLASSROOM_WIDTH) +
	// 						dirY.north * currentYSecundaria;

	// 					const banoData = createRoomCorners(
	// 						xBano,
	// 						yBano,
	// 						CLASSROOM_WIDTH,
	// 						BANO_HEIGHT
	// 					);
	// 					elementos.banos.push({
	// 						nivel: "Secundaria",
	// 						corners: banoData.corners,
	// 						realCorners: banoData.realCorners,
	// 					});
	// 					currentYSecundaria += BANO_HEIGHT;
	// 				}
	// 			}
	// 		}

	// 		// Laboratorio y otros ambientes al final del pabellón secundaria
	// 		const ambientesSecundariaEnPabellon =
	// 			distribution.ambientesEnPabellones.filter(
	// 				(a) => a.pabellon === "secundaria"
	// 			);

	// 		if (
	// 			ambientesSecundariaEnPabellon.length > 0 &&
	// 			currentFloor === 1 &&
	// 			floorData.secundaria > 0
	// 		) {
	// 			ambientesSecundariaEnPabellon.forEach((ambiente) => {
	// 				const x =
	// 					origin.east +
	// 					dirX.east * (rectWidth - CLASSROOM_WIDTH) +
	// 					dirY.east * currentYSecundaria;
	// 				const y =
	// 					origin.north +
	// 					dirX.north * (rectWidth - CLASSROOM_WIDTH) +
	// 					dirY.north * currentYSecundaria;

	// 				const ambienteData = createRoomCorners(
	// 					x,
	// 					y,
	// 					ambiente.ancho,
	// 					ambiente.alto
	// 				);
	// 				elementos.ambientes.push({
	// 					nombre: ambiente.nombre,
	// 					tipo: "pabellon",
	// 					corners: ambienteData.corners,
	// 					realCorners: ambienteData.realCorners,
	// 				});
	// 				currentYSecundaria += ambiente.alto;
	// 			});
	// 		}
	// 		// ✅ NUEVO: Ambientes en espacio libre de SECUNDARIA
	// 		if (
	// 			floorData.ambientesSecundariaLibre &&
	// 			floorData.ambientesSecundariaLibre.length > 0
	// 		) {
	// 			floorData.ambientesSecundariaLibre.forEach((ambiente) => {
	// 				const x =
	// 					origin.east +
	// 					dirX.east * (rectWidth - CLASSROOM_WIDTH) +
	// 					dirY.east * currentYSecundaria;
	// 				const y =
	// 					origin.north +
	// 					dirX.north * (rectWidth - CLASSROOM_WIDTH) +
	// 					dirY.north * currentYSecundaria;

	// 				const ambienteData = createRoomCorners(
	// 					x,
	// 					y,
	// 					ambiente.ancho,
	// 					ambiente.alto
	// 				);
	// 				elementos.ambientes.push({
	// 					nombre: ambiente.nombre,
	// 					tipo: "pabellon_libre",
	// 					corners: ambienteData.corners,
	// 					realCorners: ambienteData.realCorners,
	// 				});
	// 				currentYSecundaria += ambiente.alto;
	// 			});
	// 		}

	// 		// BLOQUE CENTRAL: Cancha (con rotación automática si no cabe) + Cocina/Comedor - solo piso 1
	// 		// ✅ RENDERIZAR CUADRANTE INTERIOR CON DISTRIBUCIÓN INTELIGENTE (solo piso 1)
	// 		if (currentFloor === 1 && floorData.distribucionCuadrante) {
	// 			const dist = floorData.distribucionCuadrante;
	// 			const cuadrante = floorData.cuadranteInterior;

	// 			// ✅ RENDERIZAR CANCHA (centrada en el cuadrante)
	// 			if (dist.cancha) {
	// 				const canchaX = dist.cancha.x;
	// 				const canchaY = dist.cancha.y;

	// 				const canchaOrigin = {
	// 					east:
	// 						origin.east +
	// 						dirX.east * canchaX +
	// 						dirY.east * canchaY,
	// 					north:
	// 						origin.north +
	// 						dirX.north * canchaX +
	// 						dirY.north * canchaY,
	// 				};

	// 				const canchaData = createRoomCorners(
	// 					canchaOrigin.east,
	// 					canchaOrigin.north,
	// 					dist.cancha.width,
	// 					dist.cancha.height
	// 				);
	// 				canchaSVG = canchaData.corners;
	// 				elementos.cancha = {
	// 					realCorners: canchaData.realCorners,
	// 					rotada: dist.cancha.rotada,
	// 				};
	// 			}

	// 			// ✅ RENDERIZAR AMBIENTES BOTTOM (con posiciones calculadas)
	// 			if (dist.ambientesBottom.length > 0) {
	// 				dist.ambientesBottom.forEach((ambiente) => {
	// 					const x =
	// 						origin.east +
	// 						dirX.east * ambiente.x +
	// 						dirY.east * ambiente.y;
	// 					const y =
	// 						origin.north +
	// 						dirX.north * ambiente.x +
	// 						dirY.north * ambiente.y;

	// 					const ambienteData = createRoomCorners(
	// 						x,
	// 						y,
	// 						ambiente.ancho,
	// 						ambiente.alto
	// 					);
	// 					elementos.laterales.push({
	// 						nombre: ambiente.nombre,
	// 						corners: ambienteData.corners,
	// 						realCorners: ambienteData.realCorners,
	// 						posicion: "bottom",
	// 					});
	// 				});
	// 			}

	// 			// ✅ RENDERIZAR AMBIENTES TOP (con posiciones calculadas)
	// 			if (dist.ambientesTop.length > 0) {
	// 				dist.ambientesTop.forEach((ambiente) => {
	// 					const x =
	// 						origin.east +
	// 						dirX.east * ambiente.x +
	// 						dirY.east * ambiente.y;
	// 					const y =
	// 						origin.north +
	// 						dirX.north * ambiente.x +
	// 						dirY.north * ambiente.y;

	// 					const ambienteData = createRoomCorners(
	// 						x,
	// 						y,
	// 						ambiente.ancho,
	// 						ambiente.alto
	// 					);
	// 					elementos.laterales.push({
	// 						nombre: ambiente.nombre,
	// 						corners: ambienteData.corners,
	// 						realCorners: ambienteData.realCorners,
	// 						posicion: "top",
	// 					});
	// 				});
	// 			}

	// 			// ✅ RENDERIZAR AMBIENTES LEFT (con posiciones calculadas)
	// 			if (dist.ambientesLeft.length > 0) {
	// 				dist.ambientesLeft.forEach((ambiente) => {
	// 					const x =
	// 						origin.east +
	// 						dirX.east * ambiente.x +
	// 						dirY.east * ambiente.y;
	// 					const y =
	// 						origin.north +
	// 						dirX.north * ambiente.x +
	// 						dirY.north * ambiente.y;

	// 					const ambienteData = createRoomCorners(
	// 						x,
	// 						y,
	// 						ambiente.ancho,
	// 						ambiente.alto
	// 					);
	// 					elementos.laterales.push({
	// 						nombre: ambiente.nombre,
	// 						corners: ambienteData.corners,
	// 						realCorners: ambienteData.realCorners,
	// 						posicion: "left",
	// 					});
	// 				});
	// 			}

	// 			// ✅ RENDERIZAR AMBIENTES RIGHT (con posiciones calculadas)
	// 			if (dist.ambientesRight.length > 0) {
	// 				dist.ambientesRight.forEach((ambiente) => {
	// 					const x =
	// 						origin.east +
	// 						dirX.east * ambiente.x +
	// 						dirY.east * ambiente.y;
	// 					const y =
	// 						origin.north +
	// 						dirX.north * ambiente.x +
	// 						dirY.north * ambiente.y;

	// 					const ambienteData = createRoomCorners(
	// 						x,
	// 						y,
	// 						ambiente.ancho,
	// 						ambiente.alto
	// 					);
	// 					elementos.laterales.push({
	// 						nombre: ambiente.nombre,
	// 						corners: ambienteData.corners,
	// 						realCorners: ambienteData.realCorners,
	// 						posicion: "right",
	// 					});
	// 				});
	// 			}
	// 		}
	// 	}

	// 	return {
	// 		points,
	// 		rectangleSVG,
	// 		elementos,
	// 		canchaSVG,
	// 		bounds: { minEast, maxEast, minNorth, maxNorth, scale },
	// 	};
	// };

	const { points, rectangleSVG, elementos, pabellones, bounds, canchaSVG } =
		convertToSVG();

	const calculateArea = () => {
		if (coordinates.length < 3) return 0;

		let area = 0;
		for (let i = 0; i < coordinates.length; i++) {
			const j = (i + 1) % coordinates.length;
			area += coordinates[i].east * coordinates[j].north;
			area -= coordinates[j].east * coordinates[i].north;
		}
		return Math.abs(area / 2);
	};

	const area = calculateArea();

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
			<div className="lg:col-span-1 space-y-6">
				{maxRectangle && (
					<Grid
						container
						spacing={40}
						sx={{
							padding: 5,
						}}
					>
						{/* Primera columna - Niveles educativos */}
						<Grid item xs={6}>
							<Grid
								container
								direction="column"
								spacing={1.5}
								alignItems="flex-start"
								sx={{ paddingLeft: 4 }}
							>
								<Grid item>
									<div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
										<Typography variant="h5">
											🟨 Inicial
										</Typography>
									</div>
								</Grid>
								<Grid item>
									<div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
										<Typography variant="h5">
											🟦 Primaria
										</Typography>
									</div>
								</Grid>
								<Grid item>
									<div className="p-3 bg-red-50 border border-red-200 rounded-lg">
										<Typography variant="h5">
											🟥 Secundaria
										</Typography>
									</div>
								</Grid>
							</Grid>
						</Grid>

						{/* Segunda columna - Botones */}
						<Grid item xs={6}>
							<Grid
								container
								direction="column"
								spacing={2}
								sx={{ paddingTop: 5 }}
							>
								{/* Fila de botones Horizontal y Vertical */}
								<Grid item>
									<Grid container direction="row" spacing={2}>
										<Grid item>
											<Button
												variant={
													layoutMode === "horizontal"
														? "contained"
														: "outlined"
												}
												onClick={() =>
													setLayoutMode("horizontal")
												}
												size="small"
												sx={{
													textTransform: "none",
												}}
											>
												<Building2 size={20} />
												Modelo 1
											</Button>
										</Grid>
										<Grid item>
											<Button
												variant={
													layoutMode === "vertical"
														? "contained"
														: "outlined"
												}
												onClick={() =>
													setLayoutMode("vertical")
												}
												size="small"
												sx={{
													textTransform: "none",
												}}
											>
												<Building2 size={20} />
												Modelo 2
											</Button>
										</Grid>
									</Grid>
								</Grid>

								{/* Botón de Generar Distribución debajo */}
								<Grid item>
									<Button
										onClick={calculateDistribution}
										variant="contained"
									>
										Generar Distribución
									</Button>
								</Grid>
								{/* <Button
												//onClick={() => exportToJSON()}
												onClick={() =>
													exportToDXFWithLibrary(
														false
													)
												}
												disabled={
													!maxRectangle ||
													!distribution
												}
												className="flex items-center gap-2 px-4 py-2 bg-green-600..."
											>
												<Upload className="w-4 h-4" />
												Exportar DXF 2D
											</Button> */}
								{/* <Button
									// onClick={() =>
									// 	exportToDXF(true)
									// }
									onClick={exportToJSON}
									disabled={!maxRectangle || !distribution}
									className="flex items-center gap-2 px-4 py-2 bg-green-600..."
								>
									<Upload className="w-4 h-4" />
									Exportar 3D
								</Button> */}
							</Grid>
						</Grid>
					</Grid>
				)}
			</div>

			<div className="border-2 border-slate-200 rounded-lg bg-slate-50 overflow-hidden relative">
				<svg
					width="100%"
					height="600"
					viewBox="0 0 600 600"
					className="bg-white cursor-grab active:cursor-grabbing"
					onMouseDown={handleMouseDown}
					onMouseMove={handleMouseMove}
					onMouseUp={handleMouseUp}
					onMouseLeave={handleMouseUp}
					onWheel={handleWheel}
					style={{
						cursor: isDragging ? "grabbing" : "grab",
					}}
				>
					<defs>
						<pattern
							id="grid"
							width="50"
							height="50"
							patternUnits="userSpaceOnUse"
						>
							<path
								d="M 50 0 L 0 0 0 50"
								fill="none"
								stroke="#e2e8f0"
								strokeWidth="1"
							/>
						</pattern>
					</defs>

					{/* ✅ GRUPO CON TRANSFORMACIÓN DE ZOOM Y PAN */}
					<g
						transform={`translate(${panOffset.x / zoom}, ${
							panOffset.y / zoom
						}) scale(${zoom})`}
					>
						<rect width="600" height="600" fill="url(#grid)" />

						{points.length >= 3 && (
							<>
								<polygon
									points={points
										.map((p) => `${p.x},${p.y}`)
										.join(" ")}
									fill="rgba(59, 130, 246, 0.1)"
									stroke="#3b82f6"
									strokeWidth="2"
								/>
								{points.map((point, index) => (
									<circle
										key={index}
										cx={point.x}
										cy={point.y}
										r="4"
										fill="#1e40af"
										stroke="white"
										strokeWidth="2"
									/>
								))}
							</>
						)}

						{rectangleSVG && (
							<>
								<polygon
									points={rectangleSVG
										.map((p) => `${p.x},${p.y}`)
										.join(" ")}
									fill="rgba(255, 255, 255, 0.95)"
									stroke="#10b981"
									strokeWidth="3"
								/>

								{!distribution && (
									<text
										x={
											(rectangleSVG[0].x +
												rectangleSVG[2].x) /
											2
										}
										y={
											(rectangleSVG[0].y +
												rectangleSVG[2].y) /
											2
										}
										textAnchor="middle"
										className="text-base font-semibold fill-emerald-700"
									>
										Rectángulo calculado
									</text>
								)}

								{/* Entrada */}
								{elementos.entrada && (
									<g>
										<polygon
											points={elementos.entrada.corners
												.map((p) => `${p.x},${p.y}`)
												.join(" ")}
											fill="none"
											stroke="#64748b"
											strokeWidth="2"
											strokeDasharray="4,4"
										/>
										<text
											x={
												(elementos.entrada.corners[0]
													.x +
													elementos.entrada.corners[2]
														.x) /
												2
											}
											y={
												(elementos.entrada.corners[0]
													.y +
													elementos.entrada.corners[2]
														.y) /
												2
											}
											textAnchor="middle"
											className="text-sm font-bold fill-slate-700"
										>
											⬇️ ENTRADA
										</text>
									</g>
								)}

								{elementos.inicial.map((aula, idx) => (
									<polygon
										key={`ini-${idx}`}
										points={aula.corners
											.map((p) => `${p.x},${p.y}`)
											.join(" ")}
										fill="rgba(234, 179, 8, 0.6)"
										stroke="#ca8a04"
										strokeWidth="1.5"
									/>
								))}
								{elementos.primaria.map((aula, idx) => (
									<polygon
										key={`pri-${idx}`}
										points={aula.corners
											.map((p) => `${p.x},${p.y}`)
											.join(" ")}
										fill="rgba(59, 130, 246, 0.6)"
										stroke="#2563eb"
										strokeWidth="1.5"
									/>
								))}
								{elementos.secundaria.map((aula, idx) => (
									<polygon
										key={`sec-${idx}`}
										points={aula.corners
											.map((p) => `${p.x},${p.y}`)
											.join(" ")}
										fill="rgba(239, 68, 68, 0.6)"
										stroke="#dc2626"
										strokeWidth="1.5"
									/>
								))}
								{elementos.banos.map((bano, idx) => (
									<g key={`bano-${idx}`}>
										<polygon
											points={bano.corners
												.map((p) => `${p.x},${p.y}`)
												.join(" ")}
											fill="rgba(168, 85, 247, 0.7)"
											stroke="#7c3aed"
											strokeWidth="2"
										/>
										<text
											x={
												(bano.corners[0].x +
													bano.corners[2].x) /
												2
											}
											y={
												(bano.corners[0].y +
													bano.corners[2].y) /
												2
											}
											textAnchor="middle"
											className="text-xs font-bold fill-purple-900"
										>
											🚻
										</text>
									</g>
								))}
								{elementos.escaleras.map((esc, idx) => (
									<g key={`esc-${idx}`}>
										<polygon
											points={esc.corners
												.map((p) => `${p.x},${p.y}`)
												.join(" ")}
											fill="rgba(107, 114, 128, 0.7)"
											stroke="#4b5563"
											strokeWidth="2"
										/>
										<text
											x={
												(esc.corners[0].x +
													esc.corners[2].x) /
												2
											}
											y={
												(esc.corners[0].y +
													esc.corners[2].y) /
												2
											}
											textAnchor="middle"
											className="text-xs font-bold fill-gray-900"
										>
											🪜
										</text>
									</g>
								))}
								{/* AMBIENTES CON HOVER */}
								{elementos.ambientes.map((ambiente, idx) => {
									const centerX =
										(ambiente.corners[0].x +
											ambiente.corners[2].x) /
										2;
									const centerY =
										(ambiente.corners[0].y +
											ambiente.corners[2].y) /
										2;

									return (
										<g key={`amb-${idx}`}>
											<polygon
												points={ambiente.corners
													.map((p) => `${p.x},${p.y}`)
													.join(" ")}
												fill={
													ambiente.tipo === "pabellon"
														? hoveredAmbiente ===
														  idx
															? "rgba(236, 72, 153, 0.8)"
															: "rgba(236, 72, 153, 0.6)"
														: hoveredAmbiente ===
														  idx
														? "rgba(20, 184, 166, 0.8)"
														: "rgba(20, 184, 166, 0.6)"
												}
												stroke={
													ambiente.tipo === "pabellon"
														? "#be185d"
														: "#0d9488"
												}
												strokeWidth={
													hoveredAmbiente === idx
														? "3"
														: "2"
												}
												onMouseEnter={() =>
													setHoveredAmbiente(idx)
												}
												onMouseLeave={() =>
													setHoveredAmbiente(null)
												}
												style={{
													cursor: "pointer",
													transition: "all 0.2s",
												}}
											/>

											{/* Texto solo visible en hover */}
											{hoveredAmbiente === idx && (
												<>
													{/* Fondo blanco para mejor legibilidad */}
													<rect
														x={
															centerX -
															ambiente.nombre
																.length *
																3
														}
														y={centerY - 10}
														width={
															ambiente.nombre
																.length * 6
														}
														height={20}
														fill="white"
														fillOpacity="0.9"
														rx="4"
														style={{
															pointerEvents:
																"none",
														}}
													/>
													<text
														x={centerX}
														y={centerY + 4}
														textAnchor="middle"
														className="text-xs font-bold fill-slate-900"
														style={{
															pointerEvents:
																"none",
														}}
													>
														{ambiente.nombre}
													</text>
												</>
											)}
										</g>
									);
								})}

								{/* AMBIENTES LATERALES CON HOVER */}
								{elementos.laterales.map((lateral, idx) => {
									const centerX =
										(lateral.corners[0].x +
											lateral.corners[2].x) /
										2;
									const centerY =
										(lateral.corners[0].y +
											lateral.corners[2].y) /
										2;

									return (
										<g key={`lat-${idx}`}>
											<polygon
												points={lateral.corners
													.map((p) => `${p.x},${p.y}`)
													.join(" ")}
												fill={
													hoveredLateral === idx
														? "rgba(251, 146, 60, 0.9)"
														: "rgba(251, 146, 60, 0.7)"
												}
												stroke="#ea580c"
												strokeWidth={
													hoveredLateral === idx
														? "3"
														: "2"
												}
												onMouseEnter={() =>
													setHoveredLateral(idx)
												}
												onMouseLeave={() =>
													setHoveredLateral(null)
												}
												style={{
													cursor: "pointer",
													transition: "all 0.2s",
												}}
											/>

											{/* Texto solo visible en hover */}
											{hoveredLateral === idx && (
												<>
													{/* Fondo blanco para mejor legibilidad */}
													<rect
														x={
															centerX -
															lateral.nombre
																.length *
																3
														}
														y={centerY - 10}
														width={
															lateral.nombre
																.length * 6
														}
														height={20}
														fill="white"
														fillOpacity="0.9"
														rx="4"
														style={{
															pointerEvents:
																"none",
														}}
													/>
													<text
														x={centerX}
														y={centerY + 4}
														textAnchor="middle"
														className="text-sm font-bold fill-orange-900"
														style={{
															pointerEvents:
																"none",
														}}
													>
														{lateral.nombre}
													</text>
												</>
											)}
										</g>
									);
								})}
								{canchaSVG && (
									<>
										<polygon
											points={canchaSVG
												.map((p) => `${p.x},${p.y}`)
												.join(" ")}
											fill="rgba(34, 197, 94, 0.4)"
											stroke="#16a34a"
											strokeWidth="2"
											strokeDasharray="5,3"
										/>
										<text
											x={
												(canchaSVG[0].x +
													canchaSVG[2].x) /
												2
											}
											y={
												(canchaSVG[0].y +
													canchaSVG[2].y) /
												2
											}
											textAnchor="middle"
											className="text-sm font-bold fill-green-700"
										>
											⚽ CANCHA
										</text>
									</>
								)}
							</>
						)}

						{points.length < 3 && (
							<text
								x="300"
								y="300"
								textAnchor="middle"
								className="text-sm fill-slate-400"
							>
								Carga vertices para comenzar
							</text>
						)}

						{points.length >= 3 && !rectangleSVG && (
							<text
								x="300"
								y="300"
								textAnchor="middle"
								className="text-sm fill-slate-400"
							>
								Presiona "Calcular" para obtener el rectángulo
								máximo
							</text>
						)}
					</g>

					{/* ✅ ROSA DE LOS VIENTOS FIJA (Norte geográfico real) */}
					{/* ✅ ROSA DE LOS VIENTOS FIJA (Norte geográfico real) */}
					{points.length >= 3 && (
						<g transform={`translate(${50}, ${50})`}>
							{/* Fondo */}
							<circle
								cx="0"
								cy="0"
								r="35"
								fill="rgba(255, 255, 255, 0.95)"
								stroke="#334155"
								strokeWidth="2"
								filter="drop-shadow(0px 2px 4px rgba(0,0,0,0.2))"
							/>

							{/* Líneas cardinales de fondo */}
							<line
								x1="0"
								y1="-30"
								x2="0"
								y2="30"
								stroke="#e2e8f0"
								strokeWidth="1"
							/>
							<line
								x1="-30"
								y1="0"
								x2="30"
								y2="0"
								stroke="#e2e8f0"
								strokeWidth="1"
							/>

							{/* Norte (rojo, siempre hacia arriba) */}
							<path
								d="M 0,-25 L -5,-10 L 0,-15 L 5,-10 Z"
								fill="#ef4444"
								stroke="#991b1b"
								strokeWidth="1"
							/>
							<text
								x="0"
								y="-28"
								textAnchor="middle"
								className="text-xs font-bold"
								fill="#ef4444"
							>
								N
							</text>

							{/* Sur */}
							<path
								d="M 0,25 L -5,10 L 0,15 L 5,10 Z"
								fill="#94a3b8"
								stroke="#475569"
								strokeWidth="1"
							/>
							<text
								x="0"
								y="33"
								textAnchor="middle"
								className="text-xs font-semibold"
								fill="#64748b"
							>
								S
							</text>

							{/* Este */}
							<text
								x="28"
								y="4"
								textAnchor="middle"
								className="text-xs"
								fill="#64748b"
							>
								E
							</text>

							{/* Oeste */}
							<text
								x="-28"
								y="4"
								textAnchor="middle"
								className="text-xs"
								fill="#64748b"
							>
								O
							</text>

							{/* Centro */}
							<circle cx="0" cy="0" r="3" fill="#334155" />

							{/* Texto explicativo */}
							<text
								x="0"
								y="48"
								textAnchor="middle"
								className="text-xs"
								fill="#64748b"
								fontSize="9"
							>
								Norte geográfico
							</text>
						</g>
					)}

					{/* ✅ INDICADOR DE ORIENTACIÓN DEL EDIFICIO (mejorado) */}
					{maxRectangle && (
						<g transform={`translate(${530}, ${40})`}>
							{/* Fondo */}
							<rect
								x="-60"
								y="-25"
								width="120"
								height="50"
								rx="8"
								fill="rgba(59, 130, 246, 0.1)"
								stroke="#3b82f6"
								strokeWidth="2"
								filter="drop-shadow(0px 2px 4px rgba(0,0,0,0.1))"
							/>

							{/* Título */}
							<text
								x="0"
								y="-8"
								textAnchor="middle"
								className="text-xs font-medium"
								fill="#475569"
							>
								Fachada Principal
							</text>

							{/* Orientación */}
							<text
								x="0"
								y="10"
								textAnchor="middle"
								className="text-base font-bold"
								fill="#2563eb"
							>
								{(() => {
									const angle = maxRectangle.angle;
									const normalizedAngle =
										((angle % 360) + 360) % 360;

									if (
										normalizedAngle >= 337.5 ||
										normalizedAngle < 22.5
									)
										return "Norte";
									if (
										normalizedAngle >= 22.5 &&
										normalizedAngle < 67.5
									)
										return "Noreste";
									if (
										normalizedAngle >= 67.5 &&
										normalizedAngle < 112.5
									)
										return "Este";
									if (
										normalizedAngle >= 112.5 &&
										normalizedAngle < 157.5
									)
										return "Sureste";
									if (
										normalizedAngle >= 157.5 &&
										normalizedAngle < 202.5
									)
										return "Sur";
									if (
										normalizedAngle >= 202.5 &&
										normalizedAngle < 247.5
									)
										return "Suroeste";
									if (
										normalizedAngle >= 247.5 &&
										normalizedAngle < 292.5
									)
										return "Oeste";
									if (
										normalizedAngle >= 292.5 &&
										normalizedAngle < 337.5
									)
										return "Noroeste";
									return "N/A";
								})()}
							</text>

							{/* Ángulo exacto */}
							<text
								x="0"
								y="25"
								textAnchor="middle"
								className="text-xs"
								fill="#64748b"
								fontSize="10"
							>
								({Math.round(maxRectangle.angle)}
								°)
							</text>
						</g>
					)}
				</svg>
			</div>
		</div>
	);
}
