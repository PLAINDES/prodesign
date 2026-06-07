import * as XLSX from 'xlsx';

/**
 * Función que recibe un archivo de tipo File (.xlsx) y retorna una Promesa con los datos extraídos
 * @param {File} archivo 
 * @returns {Promise<Array>} Array de objetos con los datos del Excel
 */
export const xlsxToJson = (archivo) => {
    return new Promise((resolve, reject) => {
        const lector = new FileReader();

        lector.onload = (evento) => {
            try {
                const datosBinarios = evento.target.result;
                
                const libro = XLSX.read(datosBinarios, { type: 'binary' });

                const nombrePrimeraHoja = libro.SheetNames[0];
                const hoja = libro.Sheets[nombrePrimeraHoja];

                const datosFormateados = XLSX.utils.sheet_to_json(hoja);

                resolve(datosFormateados);
            } catch (error) {
                reject("Error al procesar el archivo Excel: " + error.message);
            }
        };

        lector.onerror = (error) => reject(error);

        lector.readAsBinaryString(archivo);
    });
};