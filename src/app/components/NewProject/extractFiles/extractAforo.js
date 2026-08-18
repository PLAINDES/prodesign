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
    // --- Celdas B (Filas 1 a 19) ---
    const b4 = obtenerValor(data[2], COL_B); // Fila 4
    const b5 = obtenerValor(data[3], COL_B); // Fila 5
    const b6 = obtenerValor(data[4], COL_B); // Fila 6

    const b7 = obtenerValor(data[5], COL_B); // Fila 7
    const b8 = obtenerValor(data[6], COL_B); // Fila 8
    const b9 = obtenerValor(data[7], COL_B); // Fila 9
    const b10 = obtenerValor(data[8], COL_B); // Fila 10
    const b11 = obtenerValor(data[9], COL_B); // Fila 11
    const b12 = obtenerValor(data[10], COL_B); // Fila 12
    const b13 = obtenerValor(data[11], COL_B); // Fila 13
    const b14 = obtenerValor(data[12], COL_B); // Fila 14
    const b15 = obtenerValor(data[13], COL_B); // Fila 15
    const b16 = obtenerValor(data[14], COL_B); // Fila 16
    const b17 = obtenerValor(data[15], COL_B); // Fila 17
    const b18 = obtenerValor(data[16], COL_B); // Fila 18
    const b19 = obtenerValor(data[17], COL_B); // Fila 19

    const cantidad_inicial = calcularCantidadAulas(b5, e4) + calcularCantidadAulas(b6, e4)
    const cantidad_primaria = calcularCantidadAulas(b8, e5) +
        calcularCantidadAulas(b9, e5) +
        calcularCantidadAulas(b10, e5) +
        calcularCantidadAulas(b11, e5) +
        calcularCantidadAulas(b12, e5) +
        calcularCantidadAulas(b13, e5);


    const cantidad_sec = calcularCantidadAulas(b15, e6) +
        calcularCantidadAulas(b16, e6) +
        calcularCantidadAulas(b17, e6) +
        calcularCantidadAulas(b18, e6) +
        calcularCantidadAulas(b19, e6);

    return [
        {
            "grado": "INICIAL",
            "aforo_por_grado": b5,
            "cantidad_aulas": cantidad_inicial,
            "capacidad_x_aula": e4,
            "aulas":{
                "aula_ciclo_i" : b5,
                "aula_ciclo_ii" : b6
            }
        },
        {
            "grado": "PRIMARIA",
            "aforo_por_grado": b8,
            "cantidad_aulas": cantidad_primaria,
            "capacidad_x_aula": e5,
            "aulas":{
                "aula_1_prim" : b8,
                "aula_2_prim" : b9,
                "aula_3_prim" : b10,
                "aula_4_prim" : b11,
                "aula_5_prim" : b12,
                "aula_6_prim" : b13,
            }
        },
        {
            "grado": "SECUNDARIA",
            "aforo_por_grado": b15,
            "cantidad_aulas": cantidad_sec,
            "capacidad_x_aula": e6,
            "aulas":{
                "aula_1_sec" : b15,
                "aula_2_sec" : b16,
                "aula_3_sec" : b17,
                "aula_4_sec" : b18,
                "aula_5_sec" : b19,
            }
        }
    ];
}