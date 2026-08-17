export function extraerResumenAforo(data) {
    if (!data || !Array.isArray(data) || data.length === 0) {
        console.error("ALERTA: La función recibió un array vacío o inválido:", data);
        return [
            { "grado": "INICIAL", "aforo_por_grado": 0, "cantidad_aulas": 0 },
            { "grado": "PRIMARIA", "aforo_por_grado": 0, "cantidad_aulas": 0 },
            { "grado": "SECUNDARIA", "aforo_por_grado": 0, "cantidad_aulas": 0 }
        ];
    }

    const resumen = {
        "INICIAL": { aforo: 0, cantidad: 0 },
        "PRIMARIA": { aforo: 0, cantidad: 0 },
        "SECUNDARIA": { aforo: 0, cantidad: 0 }
    };

    data.forEach((item) => {
        const claveAmbiente = Object.keys(item).find(key => key !== "__EMPTY");
        if (!claveAmbiente) return;

        const nombreAmbiente = item[claveAmbiente];
        const valorNumeric = Number(item["__EMPTY"]);

        if (!nombreAmbiente || isNaN(valorNumeric)) return;

        const ambienteUpper = String(nombreAmbiente).toUpperCase().trim();

        // Condición clave: Solo procesamos si realmente es un ambiente de tipo AULA
        if (ambienteUpper.startsWith("AULA")) {
            if (ambienteUpper.includes("AULA DE CICLO")) {
                resumen["INICIAL"].aforo = valorNumeric;
                resumen["INICIAL"].cantidad += 1;
            } 
            else if (ambienteUpper.includes("PRIM")) {
                resumen["PRIMARIA"].aforo = valorNumeric;
                resumen["PRIMARIA"].cantidad += 1;
            } 
            else if (ambienteUpper.includes("SEC")) {
                resumen["SECUNDARIA"].aforo = valorNumeric;
                resumen["SECUNDARIA"].cantidad += 1;
            }
        }
    });

    return Object.keys(resumen).map(grado => ({
        "grado": grado,
        "aforo_por_grado": resumen[grado].aforo,
        "cantidad_aulas": resumen[grado].cantidad
    }));
}

export function extraerResumenAforoPorPosicion(data) {
    if (!data || !Array.isArray(data) || data.length === 0) {
        return [
            { "grado": "INICIAL", "aforo_por_grado": 0, "cantidad_aulas": 0 },
            { "grado": "PRIMARIA", "aforo_por_grado": 0, "cantidad_aulas": 0 },
            { "grado": "SECUNDARIA", "aforo_por_grado": 0, "cantidad_aulas": 0 }
        ];
    }

    // Helper para extraer un valor numérico seguro indicando la clave/columna
    const obtenerValor = (row, colKey) => {
        if (!row) return 0;
        const val = Number(row[colKey]);
        return isNaN(val) ? 0 : val;
    };

    // Helper con redondeo de enteros
    const calcularCantidadAulas = (aforo, divisor) => {
        if (!divisor || divisor === 0) return 0;
        return Math.round(aforo / divisor); // Redondea al entero más cercano (ej: 3.2 -> 3, 3.6 -> 4)
    };

    // Claves del objeto según la parseación de SheetJS
    const COL_E = "__EMPTY_3"; // Columna E
    const COL_B = "__EMPTY";   // Columna B

    // --- Celdas E ---
    const e4 = obtenerValor(data[2], COL_E);
    const e5 = obtenerValor(data[3], COL_E);
    const e6 = obtenerValor(data[4], COL_E);

    // --- Celdas B ---
    const b5  = obtenerValor(data[3], COL_B);  // Fila 5
    const b8  = obtenerValor(data[6], COL_B);  // Fila 8
    const b15 = obtenerValor(data[13], COL_B); // Fila 15

    return [
        {
            "grado": "INICIAL",
            "aforo_por_grado": b5,
            "cantidad_aulas": calcularCantidadAulas(b5, e4)
        },
        {
            "grado": "PRIMARIA",
            "aforo_por_grado": b8,
            "cantidad_aulas": calcularCantidadAulas(b8, e5)
        },
        {
            "grado": "SECUNDARIA",
            "aforo_por_grado": b15,
            "cantidad_aulas": calcularCantidadAulas(b15, e6)
        }
    ];
}