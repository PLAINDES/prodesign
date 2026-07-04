export function extraerVerticesTerreno(data) {
    if (!data || !Array.isArray(data) || data.length === 0) {
        return [];
    }

    const verticesValidos = [];

    data.forEach(item => {
        const nombreVertice = item["VERTICES DEL TERRENO"];
        
        // Extraemos y convertimos las coordenadas X e Y
        const coordX = Number(item["__EMPTY_1"]);
        const coordY = Number(item["__EMPTY_2"]);

        // Filtro de validación:
        // 1. Debe existir un identificador de vértice.
        // 2. Debe empezar con "V" seguido de un número (ej: V1, V2...) para evitar cabeceras o totales.
        // 3. Ambos valores X e Y deben ser números válidos.
        if (
            nombreVertice && 
            /^V\d+/.test(nombreVertice.trim()) && 
            !isNaN(coordX) && 
            !isNaN(coordY)
        ) {
            verticesValidos.push({
                "vertice": nombreVertice.trim(),
                "x": coordX,
                "y": coordY
            });
        }
    });

    return verticesValidos;
}