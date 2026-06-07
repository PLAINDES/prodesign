import React, { useEffect, useState, useCallback } from 'react';
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import { Tooltip } from '@mui/material';
import axios from 'axios';
import { lugares as dataLugares } from './ubigeo';
import "@glideapps/glide-data-grid/dist/index.css";
import { DataEditor } from "@glideapps/glide-data-grid";
import ButtonUploadFile from "../../../components/ButtonUploadFile"
import { extraerResumenAforo } from './extractFiles/extractAforo';
import { extraerVerticesTerreno } from './extractFiles/extractVertices';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import OutlinedInput from '@mui/material/OutlinedInput';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    slotProps: {
        paper: {
            style: {
                maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
                width: 250,
            },
        },
    },
};

function ProjectSchoolForm({ useForm }) {

    const { register, handleSubmit, setValue, formState: { errors } } = useForm

    const onSubmit = (data) => {};
    const options_ambientes_complementarios = [
        "Sala de Usos Múltiples (SUM)",
        "Cocina escolar",
        "Comedor",
        "Dirección administrativa",
        "Patio Inicial",
        "Auditorio multiusos",
        "Sala de reuniones",
        "Lactario",
        "Topico",
        "Sala de Psicomotricidad",
        "Sala de maestros"
    ];

    const [departamentoSelected, setdepartamentoSelected] = useState("");
    const [provinciaSelected, setprovinciaSelected] = useState("");
    const [distritoSelected, setdistritoSelected] = useState("");

    const [optionsProvincias, setoptionsProvincias] = useState([]);
    const [optionsDistritos, setoptionsDistritos] = useState([]);

    // files
    const [dataFileAforo, setdataFileAforo] = useState(null);
    const [dataFileVertices, setdataFileVertices] = useState(null);

    // data
    const [dataAforo, setdataAforo] = useState([])
    const [dataVertices, setdataVertices] = useState([])

    function selectedLugar(tipo_selected, value) {
        if ("departamento" == tipo_selected) {
            setdepartamentoSelected(value)
            setoptionsProvincias(Object.keys(dataLugares[value]))
        }
        else if ("provincia" == tipo_selected) {

            setprovinciaSelected(value)
            setoptionsDistritos(Object.keys(dataLugares[departamentoSelected][value]))

        }
        else if ("distrito" == tipo_selected) {
            setdistritoSelected(value)
        }
    }

    useEffect(() => {
        if (dataFileAforo) {
            console.log(dataFileAforo);
            const data_aforo_extracted = extraerResumenAforo(dataFileAforo)
            setdataAforo(data_aforo_extracted)
            register()
            console.log(data_aforo_extracted);
            setValue("aforo", data_aforo_extracted);
        }

    }, [dataFileAforo])

    useEffect(() => {
        if (dataFileVertices) {
            console.log(dataFileVertices);
            const data_v_extracted = extraerVerticesTerreno(dataFileVertices)
            setdataVertices(data_v_extracted)
            console.log(data_v_extracted);
            setValue("vertices", data_v_extracted);
        }

    }, [dataFileVertices])

    const columns = [
        {
            title: "GRADO",
            id: "grado",
            grow: 1,
        },
        {
            title: "AFORO POR GRADO",
            id: "aforo_por_grado",
            grow: 1,
        },
        {
            title: "CANTIDAD DE AULAS",
            id: "cantidad_aulas",
            grow: 1,
        },
    ]

    const columnsVertices = [
        {
            title: "Vertice",
            id: "vertice",
            grow: 1,
        },
        {
            title: "X",
            id: "x",
            grow: 1,
        },
        {
            title: "y",
            id: "y",
            grow: 1,
        },
    ]

    const obtenerCeldaVertices = useCallback(([columna, fila]) => {
        if (!dataVertices || !dataVertices[fila]) {
            return {
                kind: "text",
                allowOverlay: false,
                displayData: "",
                data: "",
            };
        }

        const vertice = dataVertices[fila];

        let valor = "";
        if (columna === 0) valor = vertice.vertice;
        if (columna === 1) valor = vertice.x;
        if (columna === 2) valor = vertice.y;

        return {
            kind: "text",
            allowOverlay: false,
            displayData: String(valor ?? ""),
            data: valor
        };
    }, [dataVertices]);

    const obtenerCelda = useCallback(([columna, fila]) => {
        if (!dataAforo || !dataAforo[fila]) {
            return {
                kind: "text",
                allowOverlay: false,
                displayData: "",
                data: "",
            };
        }

        const aforo = dataAforo[fila];

        let valor = "";
        if (columna === 0) valor = aforo.grado;
        if (columna === 1) valor = aforo.aforo_por_grado;
        if (columna === 2) valor = aforo.cantidad_aulas;

        return {
            kind: "text",
            allowOverlay: false,
            displayData: String(valor ?? ""),
            data: valor
        };
    }, [dataAforo]);

    const [personName, setPersonName] = useState([]);

    const handleChange = (event) => {
        const {
            target: { value },
        } = event;
        setPersonName(
            typeof value === 'string' ? value.split(',') : value,
        );
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={{ xs: 2, sm: 3 }}>
                <Grid item xs={12}>
                    <span>NOMBRE:</span>
                    <input
                        type="text"
                        {...register("name", { required: true })}
                        autoComplete="off"
                        placeholder='Ingrese nombre del proyecto'
                    />
                    {errors.name && <span style={{ color: 'red' }}>This field is required</span>}
                </Grid>
                <Grid item xs={12} sm={6}>
                    <span>TIPOLOGIA:</span>
                    <select {...register("tipologia")} style={{ ...styleInput }}>
                        <option value="Educación">Educación</option>
                        <option value="Salud">Salud</option>
                    </select>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <span>ZONA:</span>
                    <select {...register("zone")} style={{ ...styleInput }}>
                        <option value="Urbano">Urbano</option>
                        <option value="Rural">Rural</option>
                        <option value="Aislada">Aislada</option>
                    </select>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <span>TIPO:</span>
                    <select {...register("tipo")} style={{ ...styleInput }}>
                        <option value="UNIDOCENTE">UNIDOCENTE</option>
                        <option value="POLIDOCENTE MULTIGRADO">POLIDOCENTE MULTIGRADO</option>
                        <option value="POLIDOCENTE COMPLETO">POLIDOCENTE COMPLETO</option>
                    </select>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <span>N° PISOS:</span>
                    <select {...register("pisos")} style={{ ...styleInput }}>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                    </select>
                </Grid>
                <Grid item xs={12}>
                    <span>AFORO:</span><br />
                    <p style={{ fontSize: "11px", marginBottom: "3px" }}>
                        Descargue e ingrese la informacion de su aforo
                    </p>
                    <ButtonUploadFile setDataFile={setdataFileAforo}>INGRESO DE AFORO</ButtonUploadFile>
                    <Tooltip describeChild title="Descargar Plantilla" placement="top">
                        <a href="/templates/PLANTILLA_AFORO.xlsx" download="PLANTILLA_AFORO.xlsx" style={{ textDecoration: 'none' }}>
                            <Button>Plantilla</Button>
                        </a>
                    </Tooltip>
                </Grid>
                {
                    dataAforo.length > 1 && (
                        <Grid item xs={12} style={{ width: "100%", height: "170px" }}>
                            <DataEditor
                                width="100%"
                                height="100%"
                                columns={columns}
                                rows={dataAforo.length}
                                getCellContent={obtenerCelda}
                                rowMarkers="none"
                                onCellEdited={undefined}
                                isDraggable={false}
                                fillWidth={true}
                                freezeColumns={0}
                                getCellsForSelection={true}
                                showTrailingBlankRow={false}
                                preventScrollY={true}
                                preventScrollX={true}
                            />
                        </Grid>
                    )
                }
                <Grid item xs={12}>
                    <span>TERRENO:</span><br />
                    <p style={{ fontSize: "11px", marginBottom: "3px" }}>
                        Descargue e ingrese la informacion de su terreno
                    </p>
                    <ButtonUploadFile setDataFile={setdataFileVertices}>VERTICES DEL TERRENO</ButtonUploadFile>
                    <Tooltip describeChild title="Descargar Plantilla" placement="top">
                        <a href="/templates/PLANTILLA_TERRENO.xlsx" download="PLANTILLA_TERRENO.xlsx" style={{ textDecoration: 'none' }}>
                            <Button>Plantilla</Button>
                        </a>
                    </Tooltip>
                </Grid>
                {
                    dataVertices.length > 1 && (
                        <Grid item xs={12} style={{ width: "100%", height: "200px" }}>
                            <DataEditor
                                width="100%"
                                height="100%"
                                columns={columnsVertices}
                                rows={dataVertices.length}
                                getCellContent={obtenerCeldaVertices}
                                rowMarkers="none"
                                onCellEdited={undefined}
                                isDraggable={false}
                                fillWidth={true}
                                freezeColumns={0}
                                getCellsForSelection={true}
                                showTrailingBlankRow={false}
                                preventScrollY={true}
                                preventScrollX={true}
                            />
                        </Grid>
                    )
                }
                <Grid item xs={12}>
                    <span>Ambientes Complementarios:</span>
                    {/* <select {...register("ambientes_complementarios")} style={{ ...styleInput }}>
                        {
                            options_ambientes_complementarios.map((item, i) => {
                                return <option value={item} key={i}>{item}</option>
                            })
                        }
                    </select> */}
                    <br />
                    <FormControl sx={{ m: 1, width: "100%" }}>
                        <InputLabel id="demo-multiple-checkbox-label">Seleccione</InputLabel>
                        <Select
                            labelId="demo-multiple-checkbox-label"
                            id="demo-multiple-checkbox"
                            multiple
                            value={personName}
                            onChange={handleChange}
                            input={<OutlinedInput label="Tag" />}
                            renderValue={(selected) => selected.join(', ')}
                            MenuProps={MenuProps}
                            variant='outlined'
                        >
                            {options_ambientes_complementarios.map((name) => {
                                const selected = personName.includes(name);
                                const SelectionIcon = selected ? CheckBoxIcon : CheckBoxOutlineBlankIcon;

                                return (
                                    <MenuItem key={name} value={name}>
                                        <SelectionIcon
                                            fontSize="small"
                                            style={{ marginRight: 8, padding: 9, boxSizing: 'content-box' }}
                                        />
                                        <ListItemText primary={name} />
                                    </MenuItem>
                                );
                            })}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <span>DEPARTAMENTO:</span>
                    <select {...register("departamento")} style={{ ...styleInput }} onChange={(e) => selectedLugar("departamento", e.target.value)}>
                        {
                            Object.keys(dataLugares).map((item, i) => (
                                <option value={item} key={i} >{item}</option>
                            ))
                        }
                    </select>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <span>PROVINCIA:</span>
                    <select {...register("provincia")} style={{ ...styleInput }} onClick={(e) => selectedLugar("provincia", e.target.value)}>
                        {
                            optionsProvincias.map((item, i) => (
                                <option value={item} key={i} >{item}</option>
                            ))
                        }
                    </select>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <span>DISTRITO:</span>
                    <select {...register("distrito")} style={{ ...styleInput }} onClick={(e) => selectedLugar("distrito", e.target.value)}>
                        {
                            optionsDistritos.map((item, i) => (
                                <option value={item} key={i}>{item}</option>
                            ))
                        }
                    </select>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <span>RESPONSABLE:</span>
                    <input
                        type="text"
                        {...register("responsable", { required: true })}
                        autoComplete="off"
                    />
                    {errors.responsable && <span style={{ color: 'red' }}>This field is required</span>}
                </Grid>
                <Grid item xs={12}>
                    <span>CLIENTE:</span>
                    <input
                        type="text"
                        {...register("cliente", { required: true })}
                        autoComplete="off"
                    />
                    {errors.cliente && <span style={{ color: 'red' }}>This field is required</span>}
                </Grid>
            </Grid>
        </form>
    );
}

export default ProjectSchoolForm;

export const styleInput = {
    width: "100%",
};