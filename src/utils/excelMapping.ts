interface AmbienteComplementario {
	ambienteComplementario: string;
	capacidad: number;
	cantidad?: number; // Nueva propiedad para la cantidad de ambientes
}

interface FormData {
	dataExcel?: any;
	rowsAC?: AmbienteComplementario[]; // Array de ambientes complementarios
	aulaInicial?: boolean;
	aulaPrimaria?: boolean;
	aulaSecundaria?: boolean;
}

interface ExcelProjectData {
	aulas_inicial_ciclo1?: number;
	aulas_inicial_ciclo2?: number;
	aulas_primaria?: number;
	aulas_secundaria?: number;
	aula_psicomotricidad?: number;
	sum_inicial?: number;
	biblioteca?: number;
	innovacion_primaria?: number;
	innovacion_secundaria?: number;
	taller_creativo_primaria?: number;
	taller_creativo_secundaria?: number;
	taller_ept?: number;
	laboratorio?: number;
	sum_prim_sec?: number;
	direccion_admin?: number;
	sala_reuniones?: number;
	sala_profesores?: number;
	sshh_admin?: number;
	cocina?: number;
	sshh_cocina?: number;
	depositos?: number;
	canchas_deportivas?: number;
	quiosco?: number;
	topico?: number;
	lactario?: number;
}

export const mapFormDataToExcel = (formData: FormData): ExcelProjectData => {
	const { dataExcel, rowsAC } = formData;

	// Obtener cantidad de aulas por nivel
	const aulasInicial = dataExcel?.levels?.inicial?.aulas || 0;
	const aulasPrimaria = dataExcel?.levels?.primaria?.aulas || 0;
	const aulasSecundaria = dataExcel?.levels?.secundaria?.aulas || 0;

	// Dividir aulas de inicial en ciclo I y ciclo II
	const aulasCicloI = Math.floor(aulasInicial / 2);
	const aulasCicloII = Math.ceil(aulasInicial / 2);

	return {
		// Aulas por nivel
		aulas_inicial_ciclo1: aulasCicloI,
		aulas_inicial_ciclo2: aulasCicloII,
		aulas_primaria: aulasPrimaria,
		aulas_secundaria: aulasSecundaria,

		// Ambientes especializados - busca en rowsAC por nombre
		aula_psicomotricidad: getAmbienteQuantity(rowsAC, [
			"AULA PSICOMOTRICIDAD",
			"PSICOMOTRICIDAD",
			"SALA PSICOMOTRIZ",
		]),
		sum_inicial: getAmbienteQuantity(rowsAC, [
			"SUM INICIAL",
			"SUM",
			"SALA DE USOS MULTIPLES",
		]),
		biblioteca: getAmbienteQuantity(rowsAC, [
			"BIBLIOTECA",
			"BIBLIOTECA ESCOLAR",
		]),

		// Innovación
		innovacion_primaria:
			getAmbienteQuantity(rowsAC, [
				"INNOVACION PRIMARIA",
				"AULA DE INNOVACION PRIMARIA",
			]) ||
			Math.floor(
				getAmbienteQuantity(rowsAC, [
					"INNOVACION",
					"AULA DE INNOVACION",
				]) / 2
			),

		innovacion_secundaria:
			getAmbienteQuantity(rowsAC, [
				"INNOVACION SECUNDARIA",
				"AULA DE INNOVACION SECUNDARIA",
			]) ||
			Math.ceil(
				getAmbienteQuantity(rowsAC, [
					"INNOVACION",
					"AULA DE INNOVACION",
				]) / 2
			),

		// Talleres creativos
		taller_creativo_primaria:
			getAmbienteQuantity(rowsAC, ["TALLER CREATIVO PRIMARIA"]) ||
			Math.floor(
				getAmbienteQuantity(rowsAC, [
					"TALLER CREATIVO",
					"TALLER DE ARTE",
				]) / 2
			),

		taller_creativo_secundaria:
			getAmbienteQuantity(rowsAC, ["TALLER CREATIVO SECUNDARIA"]) ||
			Math.ceil(
				getAmbienteQuantity(rowsAC, [
					"TALLER CREATIVO",
					"TALLER DE ARTE",
				]) / 2
			),

		taller_ept: getAmbienteQuantity(rowsAC, [
			"TALLER EPT",
			"TALLER DE EPT",
			"EDUCACION PARA EL TRABAJO",
		]),

		// Laboratorio y SUM
		laboratorio: getAmbienteQuantity(rowsAC, [
			"LABORATORIO",
			"LABORATORIO DE CIENCIAS",
		]),
		sum_prim_sec: getAmbienteQuantity(rowsAC, [
			"SUM PRIMARIA SECUNDARIA",
			"SUM PRIM SEC",
		]),

		// Ambientes administrativos (si no están en rowsAC, usa valores por defecto)
		direccion_admin:
			getAmbienteQuantity(rowsAC, [
				"DIRECCION",
				"DIRECCION ADMINISTRATIVA",
				"OFICINA DIRECCION",
			]) || 1,

		sala_reuniones:
			getAmbienteQuantity(rowsAC, [
				"SALA DE REUNIONES",
				"SALA REUNIONES",
			]) || 1,

		sala_profesores:
			getAmbienteQuantity(rowsAC, [
				"SALA DE PROFESORES",
				"SALA PROFESORES",
			]) || 1,

		sshh_admin:
			getAmbienteQuantity(rowsAC, [
				"SSHH ADMINISTRACION",
				"SSHH ADM",
				"BAÑO ADMINISTRATIVO",
			]) || 1,

		cocina: getAmbienteQuantity(rowsAC, ["COCINA", "COMEDOR"]) || 1,

		sshh_cocina:
			getAmbienteQuantity(rowsAC, ["SSHH COCINA", "BAÑO COCINA"]) || 1,

		depositos:
			getAmbienteQuantity(rowsAC, ["DEPOSITOS", "DEPOSITO", "ALMACEN"]) ||
			1,

		canchas_deportivas:
			getAmbienteQuantity(rowsAC, [
				"CANCHAS DEPORTIVAS",
				"CANCHA DEPORTIVA",
				"LOSA DEPORTIVA",
			]) || 2,

		quiosco: getAmbienteQuantity(rowsAC, ["QUIOSCO", "KIOSCO"]) || 1,

		topico: getAmbienteQuantity(rowsAC, ["TOPICO", "ENFERMERIA"]) || 1,

		lactario: getAmbienteQuantity(rowsAC, ["LACTARIO"]) || 1,
	};
};

/**
 * Helper para obtener la cantidad de un ambiente específico
 * Busca por múltiples nombres posibles (variaciones)
 */
function getAmbienteQuantity(
	rowsAC: AmbienteComplementario[] | undefined,
	possibleNames: string[]
): number {
	if (!rowsAC || !Array.isArray(rowsAC)) return 0;

	// Buscar el ambiente por cualquiera de los nombres posibles
	const ambiente = rowsAC.find((row) => {
		const ambienteNombre =
			row.ambienteComplementario?.toUpperCase().trim() || "";
		return possibleNames.some(
			(name) =>
				ambienteNombre === name.toUpperCase() ||
				ambienteNombre.includes(name.toUpperCase()) ||
				name.toUpperCase().includes(ambienteNombre)
		);
	});

	if (!ambiente) return 0;

	// Prioridad: cantidad > 1 si existe > 0 si no existe
	// Si tiene campo cantidad definido, usarlo
	if (ambiente.cantidad !== undefined && ambiente.cantidad !== null) {
		return ambiente.cantidad;
	}

	// Si el ambiente existe en el array, significa que el usuario lo seleccionó = 1
	return 1;
}

/**
 * Si necesitas contar cuántas veces aparece un ambiente (sin campo cantidad)
 */
function countAmbienteOccurrences(
	rowsAC: AmbienteComplementario[] | undefined,
	possibleNames: string[]
): number {
	if (!rowsAC || !Array.isArray(rowsAC)) return 0;

	// Contar cuántos ambientes coinciden con los nombres
	const count = rowsAC.filter((row) => {
		const ambienteNombre =
			row.ambienteComplementario?.toUpperCase().trim() || "";
		return possibleNames.some(
			(name) =>
				ambienteNombre === name.toUpperCase() ||
				ambienteNombre.includes(name.toUpperCase())
		);
	}).length;

	return count;
}
