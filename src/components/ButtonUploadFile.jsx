import React from 'react';
import { Button } from '@mui/material';
import { xlsxToJson } from './tools/xlsxToJson';

export default function ButtonUploadFile({setDataFile, children}) {

    const manejarSubidaArchivo = async (evento) => {
        const archivo = evento.target.files[0]; // Aquí está tu archivo

        if (archivo) {
            const data_json_file = await xlsxToJson(archivo)
            setDataFile(data_json_file)
        }
    };

    return (
        <Button
            variant="contained"
            color="primary"
            component="label"
        >
            {children}
            <input
                type="file"
                accept=".csv, .xlsx, .xls"
                onChange={manejarSubidaArchivo}
                // 🔥 ESTO BORRA EL INPUT DE LA VISTA POR COMPLETO:
                style={{ display: 'none' }} 
            />
        </Button>
    );
}