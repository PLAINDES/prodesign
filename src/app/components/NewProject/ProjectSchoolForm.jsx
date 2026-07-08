import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useTheme } from "@mui/material/styles";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import {
	Tooltip,
	Dialog,
	DialogContent,
	DialogTitle,
	Stack,
	Card,
	CardContent,
	Paper,
	Chip,
	Fade,
	CircularProgress,
	Box,
	Typography,
	IconButton,
} from '@mui/material';
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import MaxRectangle from "../GridData/MaxRectangle";
import axios from 'axios';
import { lugares as dataLugares } from './ubigeo';
import "@glideapps/glide-data-grid/dist/index.css";
import { DataEditor } from "@glideapps/glide-data-grid";
import ButtonUploadFile from "../../../components/ButtonUploadFile"
import { extraerResumenAforo } from './extractFiles/extractAforo';
import { extraerVerticesTerreno } from './extractFiles/extractVertices';
import TerrainDataTable from "./TerrainDataTable";
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

    // [DOCUMENTACIÓN] Se agregaron estados para soportar el cálculo del rectángulo máximo, la exclusión y la prioridad de vértices
    const [maximumRectangle, setMaximumRectangle] = useState([]);
    const [exclutedVertices, setexclutedVertices] = useState([]);
    const [priorityVertices, setPriorityVertices] = useState([]); // [DOCUMENTACIÓN] Estado para los vértices seleccionados con prioridad
    const [openDialog, setOpenDialog] = useState(false);
    const [openDialogMax, setOpenDialogMax] = useState(false);

    const handleClickOpenDialog = () => setOpenDialog(true);
    const handleCloseDialog = () => setOpenDialog(false);
    const handleClickOpenDialogMax = () => setOpenDialogMax(true);
    const handleCloseDialogMax = () => setOpenDialogMax(false);
    const handlePriorityChange = (priority) => setPriorityVertices(priority); // [DOCUMENTACIÓN] Controlador para cambios de prioridad

    // [DOCUMENTACIÓN] Alterna el estado de exclusión de un vértice al tocarlo en el gráfico o vista previa.
    // Usa una comparación robusta con tolerancia para evitar problemas de coma flotante y de tipos.
    const handleToggleExcludedVertex = (vertexCoords) => {
        const exists = exclutedVertices.some(([vx, vy]) => 
            Math.abs(Number(vx) - Number(vertexCoords[0])) < 0.001 && 
            Math.abs(Number(vy) - Number(vertexCoords[1])) < 0.001
        );
        let newExclusions;
        if (exists) {
            newExclusions = exclutedVertices.filter(([vx, vy]) => 
                !(Math.abs(Number(vx) - Number(vertexCoords[0])) < 0.001 && 
                  Math.abs(Number(vy) - Number(vertexCoords[1])) < 0.001)
            );
        } else {
            newExclusions = [...exclutedVertices, vertexCoords];
        }
        setexclutedVertices(newExclusions);
    };

    // [DOCUMENTACIÓN] Se registraron los campos virtuales y extra (aforo, vertices, excluded_vertices, ambientes)
    // para que sean rastreados correctamente por React Hook Form y enviados al backend, evitando errores 422.
    useEffect(() => {
        register("width");
        register("height");
        register("vertices_rectangle");
        register("angle");
        register("excluded_vertices");
        register("aforo");
        register("vertices");
        register("ambientes");
    }, [register]);

    // [DOCUMENTACIÓN] Sincroniza el estado local de exclusiones de vértices al campo del formulario excluded_vertices
    useEffect(() => {
        setValue("excluded_vertices", exclutedVertices);
    }, [exclutedVertices, setValue]);


    // [DOCUMENTACIÓN] Sincroniza el estado local del cuadrante máximo al formulario.
    // Mapea los vértices del cuadrante (objetos con formato { east, north }) a una lista de listas [[east, north], ...]
    // para cumplir con la validación de Pydantic en el backend (List[List[float]]).
    useEffect(() => {
        if (maximumRectangle && maximumRectangle.vertices) {
            setValue("width", maximumRectangle.ancho);
            setValue("height", maximumRectangle.alto);
            
            const formattedVertices = maximumRectangle.vertices.map(v => [v.east, v.north]);
            setValue("vertices_rectangle", formattedVertices);
            
            setValue("angle", maximumRectangle.anguloGrados);
        } else {
            setValue("width", null);
            setValue("height", null);
            setValue("vertices_rectangle", null);
            setValue("angle", null);
        }
    }, [maximumRectangle, setValue]);

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

    // [DOCUMENTACIÓN] Se transforman los vértices del formulario al formato esperado por los visualizadores SVG [[x, y], ...]
    const verticesGrafic = useMemo(() => {
        return dataVertices.map(v => [Number(v.x), Number(v.y)]);
    }, [dataVertices]);

    const handleDeleteVertex = (vertexId) => {
        const newVertices = dataVertices.filter(v => v.vertice !== vertexId);
        setdataVertices(newVertices);
        setValue("vertices", newVertices);
        // [DOCUMENTACIÓN] Al modificar el terreno, se invalida el cuadrante máximo anterior para evitar inconsistencias geométricas
        setMaximumRectangle([]);
    };

    const handleUpdateVertex = (vertexId, key, value) => {
        const newVertices = dataVertices.map(v => 
            v.vertice === vertexId ? { ...v, [key]: Number(value) } : v
        );
        setdataVertices(newVertices);
        setValue("vertices", newVertices);
        // [DOCUMENTACIÓN] Al modificar el terreno, se invalida el cuadrante máximo anterior para evitar inconsistencias geométricas
        setMaximumRectangle([]);
    };

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

    // [DOCUMENTACIÓN] Sincroniza el estado local de ambientes complementarios al campo del formulario ambientes,
    // estructurando cada ambiente como un objeto { ambienteComplementario, capacidad: 0 } tal como lo espera el backend.
    // Se colocó esta declaración después de la inicialización de personName para evitar el error de referencia léxica.
    useEffect(() => {
        const listAmbientes = personName.map((name) => ({
            ambienteComplementario: name,
            capacidad: 0,
        }));
        setValue("ambientes", listAmbientes);
    }, [personName, setValue]);

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
                    {/* [DOCUMENTACIÓN] Se cambió el registro de pisos a number_floors para alinearse con el nombre esperado por la API backend */}
                    <select {...register("number_floors")} style={{ ...styleInput }}>
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
                    dataVertices.length > 0 && (
                        <>
                            <Grid item xs={12} style={{ width: "100%" }}>
                                <TerrainDataTable 
                                    vertices={dataVertices}
                                    onDeleteVertex={handleDeleteVertex}
                                    onUpdateVertex={handleUpdateVertex}
                                    excludedVertices={exclutedVertices}
                                    onExcludedChange={setexclutedVertices}
                                    priorityVertices={priorityVertices}
                                    onPriorityChange={handlePriorityChange}
                                />
                            </Grid>

                            {/* [DOCUMENTACIÓN] Se agregó la vista previa SVG en miniatura y la tarjeta informativa del cuadrante óptimo */}
                            {dataVertices.length > 0 && (
                                <Grid item xs={12} sx={{ mt: 3, mb: 2 }}>
                                    <Paper elevation={2} sx={{ p: 3 }}>
                                        <Grid container spacing={2} alignItems="center">
                                            <Grid item xs={12} sm={8}>
                                                <Typography variant="h6" gutterBottom>
                                                    Vista Previa del Terreno
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12} sm={4} sx={{ textAlign: 'right' }}>
                                                {maximumRectangle.vertices?.length > 0 && (
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        color="warning"
                                                        onClick={handleClickOpenDialogMax}
                                                    >
                                                        Cambiar Cuadrante
                                                    </Button>
                                                )}
                                            </Grid>
                                            <Grid item xs={12}>
                                                <TerrainPreview
                                                    vertices={verticesGrafic}
                                                    rectangleVertices={maximumRectangle.vertices || []}
                                                    excludedVertices={exclutedVertices}
                                                    onSelectMaxRectangle={handleClickOpenDialogMax}
                                                    maxRectangleData={maximumRectangle}
                                                    onToggleVertex={handleToggleExcludedVertex}
                                                />
                                            </Grid>

                                            {/* Card informativa con métricas del cuadrante seleccionado */}
                                            {maximumRectangle.vertices?.length > 0 && (
                                                <Grid item xs={12} sx={{ mt: 1, pt: 1, borderTop: 1, borderColor: 'divider' }}>
                                                    <Box sx={{
                                                        p: 2,
                                                        bgcolor: 'info.light',
                                                        borderRadius: 1,
                                                        border: '1px solid',
                                                        borderColor: 'info.main'
                                                    }}>
                                                        <Grid container spacing={1}>
                                                            <Grid item xs={12}>
                                                                <Typography variant="subtitle2" color="info.dark" sx={{ fontWeight: 'bold' }}>
                                                                    Cuadrante Máximo Seleccionado:
                                                                </Typography>
                                                                <Typography variant="body2" color="info.dark">
                                                                    {maximumRectangle.ancho?.toFixed(2)}m × {maximumRectangle.alto?.toFixed(2)}m
                                                                    = {new Intl.NumberFormat('es-PE', { minimumFractionDigits: 2 }).format(maximumRectangle.area)}m²
                                                                    ({maximumRectangle.anguloGrados?.toFixed(1)}°)
                                                                    {maximumRectangle.perimetro && ` | Perímetro: ${maximumRectangle.perimetro.toFixed(2)}m`}
                                                                </Typography>
                                                            </Grid>
                                                        </Grid>
                                                    </Box>
                                                </Grid>
                                            )}
                                        </Grid>
                                    </Paper>
                                </Grid>
                            )}
                            {/* [DOCUMENTACIÓN] Se eliminaron los botones redundantes 'Generación del terreno' y 'Generación del cuadrante máximo' al pie del formulario por solicitud del usuario */}

                            {/* [DOCUMENTACIÓN] Diálogo para mostrar PoligonoChart (SVG de terreno con Dark Mode) */}
                            <Dialog
                                open={openDialog}
                                onClose={handleCloseDialog}
                                maxWidth="md"
                                fullWidth
                            >
                                <DialogTitle>Datos del terreno</DialogTitle>
                                <DialogContent>
                                    <PoligonoChart
                                        verticesTotal={verticesGrafic}
                                        verticesExcluted={exclutedVertices}
                                        onToggleVertex={handleToggleExcludedVertex}
                                    />
                                </DialogContent>
                            </Dialog>

                            {/* [DOCUMENTACIÓN] Diálogo para mostrar RectangleChart (selección de rectángulo con pestañas) */}
                            <Dialog
                                open={openDialogMax}
                                onClose={handleCloseDialogMax}
                                maxWidth="md"
                                fullWidth
                            >
                                <DialogContent>
                                    <RectangleChart
                                        verDispo={verticesGrafic}
                                        verticesExcluted={exclutedVertices}
                                        setMaximumRectangle={setMaximumRectangle}
                                        close={handleCloseDialogMax}
                                        priorityVertices={priorityVertices}
                                    />
                                </DialogContent>
                            </Dialog>
                        </>
                    )
                }
                <Grid item xs={12}>
                    <span>Ambientes Complementarios:</span>
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

// [DOCUMENTACIÓN] Se implementó el componente TerrainPreview usando SVG nativo para mostrar
// una miniatura interactiva del terreno, con soporte completo para Light/Dark Mode y mejor performance.
// [DOCUMENTACIÓN] Se agregó la prop onToggleVertex para manejar la exclusión interactiva al hacer clic sobre los vértices, y se renderizan etiquetas V1, V2, etc.
const TerrainPreview = ({
	vertices,
	rectangleVertices,
	excludedVertices,
	onSelectMaxRectangle,
	maxRectangleData,
	onToggleVertex
}) => {
	const theme = useTheme();
	const isDark = theme.palette.mode === "dark";

	// [DOCUMENTACIÓN] Se reorganizaron los hooks para declarar svgConfig y bbox antes de cualquier hook/función que los referencie, evitando la Zona Muerta Temporal (TDZ)
	const availableVertices = useMemo(() => {
		return vertices.filter(
			([x, y]) => !excludedVertices?.some(([vx, vy]) => vx === x && vy === y)
		);
	}, [vertices, excludedVertices]);

	// Calcular bounding box
	const bbox = useMemo(() => {
		if (!vertices.length) return { minX: 0, maxX: 100, minY: 0, maxY: 100, w: 100, h: 100 };
		const xs = vertices.map(p => p[0]);
		const ys = vertices.map(p => p[1]);
		const minX = Math.min(...xs);
		const maxX = Math.max(...xs);
		const minY = Math.min(...ys);
		const maxY = Math.max(...ys);
		return { minX, maxX, minY, maxY, w: maxX - minX, h: maxY - minY };
	}, [vertices]);

	// Configuración de escala
	const svgConfig = useMemo(() => {
		const pad = Math.max(bbox.w, bbox.h) * 0.15 || 10;
		const minX = bbox.minX - pad;
		const minY = bbox.minY - pad;
		const viewW = bbox.w + pad * 2;
		const viewH = bbox.h + pad * 2;
		const toSvg = ([x, y]) => ({ x: x, y: minY + viewH - (y - minY) });
		return { minX, minY, viewW, viewH, toSvg };
	}, [bbox]);

	// Estados de Zoom y Paneo
	const svgRef = useRef(null);
	const [zoom, setZoom] = useState(1);
	const [pan, setPan] = useState({ x: 0, y: 0 });
	const [isDragging, setIsDragging] = useState(false);
	const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
	const [hasMoved, setHasMoved] = useState(false);

	const zoomRef = useRef(zoom);
	useEffect(() => {
		zoomRef.current = zoom;
	}, [zoom]);

	useEffect(() => {
		const svgEl = svgRef.current;
		if (!svgEl) return;

		const handleWheelRaw = (e) => {
			e.preventDefault();
			const currentZoom = zoomRef.current;
			const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
			const nextZoom = Math.min(Math.max(currentZoom * zoomFactor, 0.5), 10);
			
			const rect = svgEl.getBoundingClientRect();
			const mouseX = (e.clientX - rect.left) / rect.width;
			const mouseY = (e.clientY - rect.top) / rect.height;
			
			const currentW = svgConfig.viewW / currentZoom;
			const currentH = svgConfig.viewH / currentZoom;
			const nextW = svgConfig.viewW / nextZoom;
			const nextH = svgConfig.viewH / nextZoom;
			
			setPan(prev => ({
				x: prev.x + (currentW - nextW) * mouseX,
				y: prev.y + (currentH - nextH) * mouseY,
			}));
			setZoom(nextZoom);
		};

		svgEl.addEventListener('wheel', handleWheelRaw, { passive: false });
		return () => {
			svgEl.removeEventListener('wheel', handleWheelRaw);
		};
	}, [svgConfig]);

	const handleMouseDown = (e) => {
		if (e.button !== 0) return;
		setIsDragging(true);
		setDragStart({ x: e.clientX, y: e.clientY });
		setHasMoved(false);
	};

	const handleMouseMove = (e) => {
		if (!isDragging || !svgRef.current) return;
		
		const dx = e.clientX - dragStart.x;
		const dy = e.clientY - dragStart.y;
		
		if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
			setHasMoved(true);
		}
		
		const rect = svgRef.current.getBoundingClientRect();
		const scaleX = (svgConfig.viewW / zoom) / rect.width;
		const scaleY = (svgConfig.viewH / zoom) / rect.height;
		
		setPan(prev => ({
			x: prev.x - dx * scaleX,
			y: prev.y - dy * scaleY,
		}));
		
		setDragStart({ x: e.clientX, y: e.clientY });
	};

	const handleMouseUp = () => {
		setIsDragging(false);
	};

	const handleZoomIn = () => {
		const nextZoom = Math.min(zoom * 1.25, 10);
		const currentW = svgConfig.viewW / zoom;
		const currentH = svgConfig.viewH / zoom;
		const nextW = svgConfig.viewW / nextZoom;
		const nextH = svgConfig.viewH / nextZoom;
		setPan(prev => ({
			x: prev.x + (currentW - nextW) * 0.5,
			y: prev.y + (currentH - nextH) * 0.5,
		}));
		setZoom(nextZoom);
	};

	const handleZoomOut = () => {
		const nextZoom = Math.max(zoom / 1.25, 0.5);
		const currentW = svgConfig.viewW / zoom;
		const currentH = svgConfig.viewH / zoom;
		const nextW = svgConfig.viewW / nextZoom;
		const nextH = svgConfig.viewH / nextZoom;
		setPan(prev => ({
			x: prev.x + (currentW - nextW) * 0.5,
			y: prev.y + (currentH - nextH) * 0.5,
		}));
		setZoom(nextZoom);
	};

	const handleZoomReset = () => {
		setZoom(1);
		setPan({ x: 0, y: 0 });
	};

	const totalPoints = useMemo(() => {
		return vertices.map(p => {
			const s = svgConfig.toSvg(p);
			return `${s.x},${s.y}`;
		}).join(" ");
	}, [vertices, svgConfig]);

	const availablePoints = useMemo(() => {
		return availableVertices.map(p => {
			const s = svgConfig.toSvg(p);
			return `${s.x},${s.y}`;
		}).join(" ");
	}, [availableVertices, svgConfig]);

	const rectPoints = useMemo(() => {
		if (!rectangleVertices || rectangleVertices.length === 0) return null;
		return rectangleVertices.map(p => {
			const pt = p.east !== undefined ? [p.east, p.north] : p;
			const s = svgConfig.toSvg(pt);
			return `${s.x},${s.y}`;
		}).join(" ");
	}, [rectangleVertices, svgConfig]);

	if (!vertices || vertices.length === 0) {
		return null;
	}

	const colors = {
		totalStroke: isDark ? "#78909c" : "#9e9e9e",
		totalFill: isDark ? "rgba(120, 144, 156, 0.1)" : "rgba(158, 158, 158, 0.15)",
		availStroke: isDark ? "#81c784" : "#4caf50",
		availFill: isDark ? "rgba(129, 199, 132, 0.15)" : "rgba(76, 175, 80, 0.15)",
		rectStroke: isDark ? "#ffa726" : "#ff9800",
		rectFill: isDark ? "rgba(255, 167, 38, 0.15)" : "rgba(255, 152, 0, 0.15)",
		svgBg: isDark ? "#1e1e1e" : "#ffffff",
	};

	const viewBoxX = svgConfig.minX + pan.x;
	const viewBoxY = svgConfig.minY + pan.y;
	const viewBoxW = svgConfig.viewW / zoom;
	const viewBoxH = svgConfig.viewH / zoom;

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%', mb: 2 }}>
			<Box
				sx={{
					position: 'relative',
					width: "100%",
					backgroundColor: isDark ? "rgba(255, 255, 255, 0.05)" : "grey.50",
					p: 2,
					borderRadius: 3,
					border: "1px solid",
					borderColor: "divider",
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					overflow: 'hidden'
				}}
			>
				{/* [DOCUMENTACIÓN] Caja de controles flotantes de zoom */}
				<Box sx={{
					position: 'absolute',
					top: 10,
					right: 10,
					display: 'flex',
					flexDirection: 'column',
					gap: 0.5,
					bgcolor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.8)',
					borderRadius: 2,
					p: 0.5,
					border: '1px solid',
					borderColor: 'divider',
					zIndex: 10
				}}>
					<Tooltip title="Acercar">
						<IconButton size="small" onClick={handleZoomIn} color="primary">
							<ZoomInIcon fontSize="small" />
						</IconButton>
					</Tooltip>
					<Tooltip title="Alejar">
						<IconButton size="small" onClick={handleZoomOut} color="primary">
							<ZoomOutIcon fontSize="small" />
						</IconButton>
					</Tooltip>
					<Tooltip title="Restablecer vista">
						<IconButton size="small" onClick={handleZoomReset} color="primary">
							<RestartAltIcon fontSize="small" />
						</IconButton>
					</Tooltip>
				</Box>

				<svg
					ref={svgRef}
					viewBox={`${viewBoxX} ${viewBoxY} ${viewBoxW} ${viewBoxH}`}
					width="100%"
					onMouseDown={handleMouseDown}
					onMouseMove={handleMouseMove}
					onMouseUp={handleMouseUp}
					onMouseLeave={handleMouseUp}
					style={{
						maxHeight: "300px",
						borderRadius: 8,
						background: colors.svgBg,
						cursor: isDragging ? 'grabbing' : 'grab',
						userSelect: 'none'
					}}
				>
					{/* Terreno Total */}
					<polygon
						points={totalPoints}
						fill={colors.totalFill}
						stroke={colors.totalStroke}
						strokeWidth={svgConfig.viewW * 0.003 || 1}
						strokeDasharray={excludedVertices?.length > 0 ? `${svgConfig.viewW * 0.008}, ${svgConfig.viewW * 0.008}` : "none"}
					/>

					{/* Terreno Disponible */}
					{availableVertices.length >= 3 && availablePoints && (
						<polygon
							points={availablePoints}
							fill={colors.availFill}
							stroke={colors.availStroke}
							strokeWidth={svgConfig.viewW * 0.004 || 1.2}
						/>
					)}

					{/* Vértices del Terreno */}
					{vertices.map((p, i) => {
						const s = svgConfig.toSvg(p);
						const isExcluded = excludedVertices?.some(([vx, vy]) => 
							Math.abs(Number(vx) - Number(p[0])) < 0.001 && 
							Math.abs(Number(vy) - Number(p[1])) < 0.001
						);
						return (
							<g
								key={i}
								onClick={(e) => {
									// [DOCUMENTACIÓN] Solo alternar exclusión si no hubo movimiento de arrastre (pan)
									if (!hasMoved) {
										onToggleVertex?.(p);
									}
								}}
								style={{ cursor: 'pointer' }}
							>
								{/* Hitbox invisible más grande para facilitar clic/toque */}
								<circle
									cx={s.x}
									cy={s.y}
									r={svgConfig.viewW * 0.02 || 6}
									fill="transparent"
								/>
								<circle
									cx={s.x}
									cy={s.y}
									r={svgConfig.viewW * 0.008 || 2.5}
									fill={isExcluded ? "#f44336" : colors.availStroke}
									style={{ transition: "fill 0.2s ease" }}
								/>
								<text
									x={s.x + (svgConfig.viewW * 0.012 || 3.5)}
									y={s.y - (svgConfig.viewW * 0.01 || 2.5)}
									fontSize={svgConfig.viewW * 0.024 || 8}
									fill={isExcluded ? "#f44336" : (isDark ? "#ffffff" : "#2e7d32")}
									fontWeight="bold"
									style={{ userSelect: "none" }}
								>
									V{i + 1}
								</text>
							</g>
						);
					})}

					{/* Rectángulo Máximo (Overlay) */}
					{rectPoints && (
						<polygon
							points={rectPoints}
							fill={colors.rectFill}
							stroke={colors.rectStroke}
							strokeWidth={svgConfig.viewW * 0.006 || 1.8}
							strokeDasharray={`${svgConfig.viewW * 0.01}, ${svgConfig.viewW * 0.01}`}
						/>
					)}
				</svg>

				{rectangleVertices?.length > 0 && (
					<Box sx={{
						position: 'absolute',
						bottom: 15,
						right: 15,
						bgcolor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.7)',
						color: 'white',
						px: 1.5,
						py: 0.5,
						borderRadius: 1,
						fontSize: '0.75rem'
					}}>
						Cuadrante: {maxRectangleData?.ancho?.toFixed(1)}m × {maxRectangleData?.alto?.toFixed(1)}m
					</Box>
				)}
			</Box>

			{!rectangleVertices?.length && vertices.length > 0 && (
				<Box sx={{
					textAlign: 'center',
					p: 2,
					bgcolor: isDark ? 'rgba(30, 30, 30, 0.5)' : 'rgba(255,255,255,0.8)',
					border: '1px dashed #ff9800',
					borderRadius: 2,
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					gap: 1
				}}>
					{/* [DOCUMENTACIÓN] Se reubicó el botón de cálculo debajo del SVG para que no tape la visualización del terreno */}
					<Typography variant="body2" color="text.secondary">
						No hay cuadrante máximo calculado
					</Typography>
					<Button
						size="medium"
						variant="contained"
						color="warning"
						onClick={onSelectMaxRectangle}
					>
						Calcular Cuadrante Máximo
					</Button>
				</Box>
			)}
		</Box>
	);
};

// [DOCUMENTACIÓN] Se portó el componente PoligonoChart desde NewProjectForm para renderizar el terreno.
// [DOCUMENTACIÓN] Se agregó la prop onToggleVertex para manejar la exclusión interactiva al hacer clic sobre los vértices.
const PoligonoChart = ({ verticesTotal, verticesExcluted, onToggleVertex }) => {
	const theme = useTheme();
	const isDark = theme.palette.mode === "dark";

	const availableVertices = useMemo(() => {
		return verticesTotal.filter(
			([x, y]) => !verticesExcluted.some(([vx, vy]) => vx === x && vy === y)
		);
	}, [verticesTotal, verticesExcluted]);

	// Calcular bounding box del terreno
	const bbox = useMemo(() => {
		if (!verticesTotal.length) return { minX: 0, maxX: 100, minY: 0, maxY: 100, w: 100, h: 100 };
		const xs = verticesTotal.map(p => p[0]);
		const ys = verticesTotal.map(p => p[1]);
		const minX = Math.min(...xs);
		const maxX = Math.max(...xs);
		const minY = Math.min(...ys);
		const maxY = Math.max(...ys);
		return { minX, maxX, minY, maxY, w: maxX - minX, h: maxY - minY };
	}, [verticesTotal]);

	// Configuración SVG de escala y conversión
	const svgConfig = useMemo(() => {
		const pad = Math.max(bbox.w, bbox.h) * 0.15 || 10;
		const minX = bbox.minX - pad;
		const minY = bbox.minY - pad;
		const viewW = bbox.w + pad * 2;
		const viewH = bbox.h + pad * 2;
		// Flip Y para que el eje vertical positivo suba
		const toSvg = ([x, y]) => ({ x: x, y: minY + viewH - (y - minY) });
		return { minX, minY, viewW, viewH, toSvg };
	}, [bbox]);

	if (!verticesTotal || verticesTotal.length === 0) {
		return (
			<Box sx={{ p: 4, textAlign: "center" }}>
				<Typography color="text.secondary">
					No hay vértices cargados para mostrar.
				</Typography>
			</Box>
		);
	}

	const totalPoints = verticesTotal.map(p => {
		const s = svgConfig.toSvg(p);
		return `${s.x},${s.y}`;
	}).join(" ");

	const availablePoints = availableVertices.map(p => {
		const s = svgConfig.toSvg(p);
		return `${s.x},${s.y}`;
	}).join(" ");

	// Definir paleta de colores según tema (Dark Mode vs Light Mode)
	const colors = {
		totalFill: isDark ? "rgba(120, 144, 156, 0.15)" : "rgba(158, 158, 158, 0.2)",
		totalStroke: isDark ? "#78909c" : "#9e9e9e",
		availFill: isDark ? "rgba(129, 199, 132, 0.2)" : "rgba(124, 252, 0, 0.2)",
		availStroke: isDark ? "#81c784" : "#4caf50",
		textFill: isDark ? "#ffffff" : "#2e7d32",
		textBg: isDark ? "#121212" : "#ffffff",
	};

	return (
		<Box
			sx={{
				width: "100%",
				backgroundColor: isDark ? "rgba(255, 255, 255, 0.05)" : "grey.50",
				p: 2,
				borderRadius: 3,
				border: "1px solid",
				borderColor: "divider",
				display: "flex",
				justifyContent: "center",
				alignItems: "center"
			}}
		>
			<svg
				viewBox={`${svgConfig.minX} ${svgConfig.minY} ${svgConfig.viewW} ${svgConfig.viewH}`}
				width="100%"
				style={{
					maxHeight: "380px",
					borderRadius: 8,
					background: isDark ? "#1e1e1e" : "#ffffff"
				}}
			>
				{/* Polígono de Área Total */}
				<polygon
					points={totalPoints}
					fill={colors.totalFill}
					stroke={colors.totalStroke}
					strokeWidth={svgConfig.viewW * 0.003 || 1}
					strokeDasharray={verticesExcluted?.length > 0 ? `${svgConfig.viewW * 0.008}, ${svgConfig.viewW * 0.008}` : "none"}
				/>

				{/* Polígono de Área Disponible */}
				{availableVertices.length >= 3 && availablePoints && (
					<polygon
						points={availablePoints}
						fill={colors.availFill}
						stroke={colors.availStroke}
						strokeWidth={svgConfig.viewW * 0.005 || 1.5}
					/>
				)}

				{/* Vértices con Etiquetas */}
				{verticesTotal.map((p, i) => {
					const s = svgConfig.toSvg(p);
					const isExcluded = verticesExcluted.some(([vx, vy]) => 
						Math.abs(Number(vx) - Number(p[0])) < 0.001 && 
						Math.abs(Number(vy) - Number(p[1])) < 0.001
					);
					return (
						<g 
							key={i}
							onClick={() => onToggleVertex?.(p)}
							style={{ cursor: "pointer" }}
						>
							{/* Hitbox invisible más grande para facilitar clic/toque */}
							<circle
								cx={s.x}
								cy={s.y}
								r={svgConfig.viewW * 0.02 || 6}
								fill="transparent"
							/>
							<circle
								cx={s.x}
								cy={s.y}
								r={svgConfig.viewW * 0.008 || 2}
								fill={isExcluded ? colors.totalStroke : colors.availStroke}
								style={{ transition: "fill 0.2s ease" }}
							/>
							<text
								x={s.x + (svgConfig.viewW * 0.012 || 3)}
								y={s.y - (svgConfig.viewW * 0.01 || 2)}
								fontSize={svgConfig.viewW * 0.026 || 8}
								fill={isExcluded ? colors.totalStroke : colors.textFill}
								fontWeight="bold"
								style={{ userSelect: "none" }}
							>
								V{i + 1}
							</text>
						</g>
					);
				})}
			</svg>
		</Box>
	);
};

// [DOCUMENTACIÓN] Se portó el componente RectangleChart desde NewProjectForm para renderizar el selector
// de rectángulo máximo por pestañas en SVG en el modal de creación de escuelas, con memoización estricta,
// Dark Mode, control de estados vacío/error, y formato regional 'es-PE'.
const RectangleChart = ({
	verDispo,
	verticesExcluted,
	setMaximumRectangle,
	close,
	priorityVertices = [], // [DOCUMENTACIÓN] Se agregó la prop priorityVertices para pasar las coordenadas de prioridad seleccionadas
}) => {
	const theme = useTheme();
	const isDark = theme.palette.mode === "dark";

	const [selectedOption, setSelectedOption] = useState(0);
	const [rectangulosData, setRectangulosData] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// Formateador regional para áreas
	const numberFormatter = useMemo(() => {
		return new Intl.NumberFormat("es-PE", {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		});
	}, []);

	// Filtrar vértices excluidos
	const availableVertices = useMemo(() => {
		return verDispo.filter(
			([x, y]) => !verticesExcluted.some(([vx, vy]) => vx === x && vy === y)
		);
	}, [verDispo, verticesExcluted]);

	const calcularRectangulos = useCallback(async () => {
		if (availableVertices.length === 0) {
			setLoading(false);
			return;
		}
		setLoading(true);
		setError(null);
		try {
			// [DOCUMENTACIÓN] Se envían las coordenadas de prioridad al cálculo del cuadrante
			const opciones = await MaxRectangle(availableVertices, priorityVertices);
			setRectangulosData(opciones);
		} catch (err) {
			console.error("Error al calcular rectángulos:", err);
			setError("Ocurrió un error al calcular los rectángulos máximos inscritos. Por favor, valide que los vértices del terreno no formen autointersecciones.");
		} finally {
			setLoading(false);
		}
	}, [availableVertices, priorityVertices]);

	useEffect(() => {
		calcularRectangulos();
	}, [calcularRectangulos]);

	// Coordenadas mundiales de los rectángulos
	const rectangulos = useMemo(() => {
		return rectangulosData.map((rectangulo) =>
			rectangulo.vertices.map((vertex) => [vertex.east, vertex.north])
		);
	}, [rectangulosData]);

	// Bounding Box memoizado
	const bbox = useMemo(() => {
		if (!availableVertices.length) {
			return { minX: 0, maxX: 100, minY: 0, maxY: 100, w: 100, h: 100 };
		}
		const xs = availableVertices.map((p) => p[0]);
		const ys = availableVertices.map((p) => p[1]);
		const minX = Math.min(...xs);
		const maxX = Math.max(...xs);
		const minY = Math.min(...ys);
		const maxY = Math.max(...ys);
		return { minX, maxX, minY, maxY, w: maxX - minX, h: maxY - minY };
	}, [availableVertices]);

	// Transformación a coordenadas SVG memoizada
	const svgConfig = useMemo(() => {
		const pad = Math.max(bbox.w, bbox.h) * 0.15 || 10;
		const minX = bbox.minX - pad;
		const minY = bbox.minY - pad;
		const viewW = bbox.w + pad * 2;
		const viewH = bbox.h + pad * 2;
		const toSvg = ([x, y]) => ({ x: x, y: minY + viewH - (y - minY) });
		return { minX, minY, viewW, viewH, toSvg };
	}, [bbox]);

	// Convertir polígono disponible a puntos de SVG
	const polyPoints = useMemo(() => {
		return availableVertices.map((p) => {
			const s = svgConfig.toSvg(p);
			return `${s.x},${s.y}`;
		}).join(" ");
	}, [availableVertices, svgConfig]);

	// Convertir el rectángulo activo a puntos de SVG
	const rectPoints = useMemo(() => {
		const activeRect = rectangulos[selectedOption];
		if (!activeRect || !activeRect.length) return null;
		return activeRect.map((p) => {
			const s = svgConfig.toSvg(p);
			return `${s.x},${s.y}`;
		}).join(" ");
	}, [rectangulos, selectedOption, svgConfig]);

	const handleConfirm = () => {
		if (rectangulosData.length === 0) return;
		const { vertices, anguloGrados, alto, ancho, area, perimetro } =
			rectangulosData[selectedOption];
		setMaximumRectangle({
			vertices,
			anguloGrados,
			alto,
			ancho,
			area,
			perimetro,
		});
		close();
	};

	const handleOptionSelect = (index) => {
		setSelectedOption(index);
	};

	// Manejo de Estado Vacío
	if (availableVertices.length === 0) {
		return (
			<Box sx={{ p: 4, textAlign: "center" }}>
				<Typography variant="h6" color="text.secondary" gutterBottom>
					Terreno sin vértices
				</Typography>
				<Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
					Por favor, primero cargue un Excel válido de vértices del terreno antes de calcular el rectángulo máximo.
				</Typography>
				<Button variant="contained" onClick={close}>
					Cerrar
				</Button>
			</Box>
		);
	}

	// Manejo de Carga
	if (loading) {
		return (
			<Fade in={loading}>
				<Box
					sx={{
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						justifyContent: "center",
						minHeight: "400px",
						gap: 3,
					}}
				>
					<CircularProgress size={60} thickness={4} />
					<Typography variant="h6" color="text.secondary">
						Calculando rectángulos óptimos...
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Analizando {availableVertices.length} vértices disponibles
					</Typography>
				</Box>
			</Fade>
		);
	}

	// Manejo de Error
	if (error) {
		return (
			<Box sx={{ p: 4, textAlign: "center" }}>
				<Typography variant="h6" color="error" gutterBottom>
					Error de cálculo
				</Typography>
				<Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
					{error}
				</Typography>
				<Stack direction="row" spacing={2} justifyContent="center">
					<Button variant="outlined" onClick={close}>
						Cancelar
					</Button>
					<Button variant="contained" onClick={calcularRectangulos}>
						Reintentar
					</Button>
				</Stack>
			</Box>
		);
	}

	const activeInfo = rectangulosData[selectedOption] || {};

	// Paleta de colores según Dark Mode
	const colors = {
		availFill: isDark ? "rgba(25, 118, 210, 0.15)" : "rgba(25, 118, 210, 0.05)",
		availStroke: isDark ? "#90caf9" : "#1976d2",
		rectFill: isDark ? "rgba(255, 183, 77, 0.25)" : "rgba(255, 167, 38, 0.25)",
		rectStroke: isDark ? "#ffa726" : "#f57c00",
		textFill: isDark ? "#ffffff" : "#0d47a1",
		svgBg: isDark ? "#1e1e1e" : "#ffffff",
	};

	return (
		<Box sx={{ p: 3 }}>
			<Typography
				variant="h5"
				gutterBottom
				align="center"
				sx={{ mb: 4, fontWeight: 600 }}
			>
				Seleccione la mejor opción de rectángulo
			</Typography>

			{/* Tabs de Selección */}
			<Stack
				direction="row"
				spacing={2}
				justifyContent="center"
				sx={{ mb: 4 }}
			>
				{rectangulos.map((_, index) => {
					const area = rectangulosData[index]?.area || 0;
					return (
						<Button
							key={index}
							variant={selectedOption === index ? "contained" : "outlined"}
							onClick={() => handleOptionSelect(index)}
							sx={{
								minWidth: 140,
								py: 1.5,
								transition: "all 0.3s ease",
								"&:hover": {
									transform: "translateY(-2px)",
									boxShadow: 2,
								},
							}}
						>
							<Box
								sx={{
									display: "flex",
									flexDirection: "column",
									alignItems: "flex-start",
								}}
							>
								<Typography variant="button">
									Opción {index + 1}
								</Typography>
								<Typography variant="caption" sx={{ opacity: 0.8 }}>
									{numberFormatter.format(area)} m²
								</Typography>
							</Box>
						</Button>
					);
				})}
			</Stack>

			{/* Gráfico SVG Unificado */}
			<Box
				sx={{
					width: "100%",
					backgroundColor: isDark ? "rgba(255, 255, 255, 0.05)" : "grey.50",
					p: 2,
					borderRadius: 3,
					border: "1px solid",
					borderColor: "divider",
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					mb: 3
				}}
			>
				<svg
					viewBox={`${svgConfig.minX} ${svgConfig.minY} ${svgConfig.viewW} ${svgConfig.viewH}`}
					width="100%"
					style={{
						maxHeight: "450px",
						borderRadius: 8,
						background: colors.svgBg
					}}
				>
					{/* Polígono de Área Disponible */}
					<polygon
						points={polyPoints}
						fill={colors.availFill}
						stroke={colors.availStroke}
						strokeWidth={svgConfig.viewW * 0.004 || 1}
					/>
					
					{/* Vértices con Etiquetas */}
					{availableVertices.map((p, i) => {
						const s = svgConfig.toSvg(p);
						return (
							<g key={i}>
								<circle
									cx={s.x}
									cy={s.y}
									r={svgConfig.viewW * 0.008 || 2}
									fill={colors.availStroke}
								/>
								<text
									x={s.x + (svgConfig.viewW * 0.012 || 3)}
									y={s.y - (svgConfig.viewW * 0.01 || 2)}
									fontSize={svgConfig.viewW * 0.024 || 8}
									fill={colors.textFill}
									fontWeight="bold"
								>
									V{i + 1}
								</text>
							</g>
						);
					})}

					{/* Rectángulo Máximo Inscrito (Overlay) */}
					{rectPoints && (
						<polygon
							points={rectPoints}
							fill={colors.rectFill}
							stroke={colors.rectStroke}
							strokeWidth={svgConfig.viewW * 0.005 || 1.2}
						/>
					)}
				</svg>
			</Box>

			{/* Detalles de la opción seleccionada */}
			{activeInfo.area && (
				<Box
					sx={{
						display: "flex",
						justifyContent: "center",
						gap: 2,
						mb: 4,
						flexWrap: "wrap"
					}}
				>
					<Chip
						label={`Área: ${numberFormatter.format(activeInfo.area)} m²`}
						color="primary"
						variant="filled"
					/>
					{activeInfo.alto && (
						<Chip
							label={`Alto: ${activeInfo.alto.toFixed(2)} m`}
							variant="outlined"
						/>
					)}
					{activeInfo.ancho && (
						<Chip
							label={`Ancho: ${activeInfo.ancho.toFixed(2)} m`}
							variant="outlined"
						/>
					)}
					{activeInfo.anguloGrados !== undefined && (
						<Chip
							label={`Rotación: ${activeInfo.anguloGrados.toFixed(1)}°`}
							variant="outlined"
						/>
					)}
				</Box>
			)}

			{/* Botones de acción */}
			<Box
				sx={{
					display: "flex",
					justifyContent: "center",
					gap: 2,
				}}
			>
				<Button
					variant="outlined"
					onClick={close}
					size="large"
					sx={{ minWidth: 120 }}
				>
					Cancelar
				</Button>
				<Button
					variant="contained"
					onClick={handleConfirm}
					size="large"
					sx={{ minWidth: 120 }}
				>
					Confirmar Selección
				</Button>
			</Box>
		</Box>
	);
};