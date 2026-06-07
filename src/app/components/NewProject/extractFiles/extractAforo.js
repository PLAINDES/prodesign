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