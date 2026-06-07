import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from 'axios';
import {
	setPlayCamera,
	setRoof,
	setColorWall,
	setColorForLevel,
	setClassroomsLights,
} from "../../../../redux/building/buildingSlice";
import styled from "@mui/material/styles/styled";
import MuiButton from "@mui/material/Button";
// import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import PlayIcon from "@mui/icons-material/PlayCircle";
// import DeleteIcon from "@mui/icons-material/Delete";
// import TextureIcon from "@mui/icons-material/Texture";
// import CopyIcon from "@mui/icons-material/ContentCopy";
// import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
// import CameraIcon from "@mui/icons-material/Camera";
// import DataObjectIcon from "@mui/icons-material/DataObject";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
// import AreasList from "../../Plan3D/components/AreasList";
import Button3D from "./Buttons/Button3D";
import Button2D from "./Buttons/Button2D";
// import ButtonSave from "./Buttons/ButtonSave";
import "./styles.css";
import Settings from "../Settings/Settings";
import { requestExport } from "../../../../redux/features/exportSlice";
import { useParams } from "react-router-dom";

import { useRender } from '../../RenderContext';


const BASE_URL_CALC = import.meta.env.VITE_API_BASE_URL_CALCULATE;

export default function ToolsBar({
	state,
	school,
	view,
	handleViewState,
	handleSetClassrooms,
}) {
	const dispatch = useDispatch();

	function baseFn(value) {
		dispatch(setColorWall({ color: value }));
	}

	useEffect(() => {
		x();
	}, []);

	const handleColorWall = debounce((value) => baseFn(value));
	const params = useParams();


	const handleImgPlane2D = async(projectId)=>{
		try {
			const token = localStorage.getItem('token');
			const response = await axios.get(`${BASE_URL_CALC}/api/v1/project/${Number(projectId - 1)}`, {
				headers: {
					'Authorization': `Bearer ${token}`,
					'Accept': 'text/html', // opcional, para que el servidor sepa que esperamos HTML
				}
			});

			// 🔹 Obtener el HTML como string
			const htmlContent = response.data;

			// 🔹 Insertarlo en el iframe usando srcdoc
			const iframe = document.getElementById("miIframe"); // tu iframe en el DOM
			iframe.srcdoc = htmlContent;
			
		} catch (error) {
			console.log(error);
		}
	}

	const handleDownloadDXF = async (projectId) => {
		try {
			const token = localStorage.getItem('token');
			const response = await axios.get(`${BASE_URL_CALC}/api/v1/project-export/${Number(projectId - 1)}`, {
				responseType: 'blob', // <-- ESTO ES LO MÁS IMPORTANTE
				headers: {
					// El estándar es 'Bearer ' seguido del token
					'Authorization': `Bearer ${token}`,
					'Accept': 'application/dxf'
				}
			});

			// Crear un link temporal en el DOM
			const url = window.URL.createObjectURL(new Blob([response.data]));
			const link = document.createElement('a');
			link.href = url;
			
			// Nombre del archivo que verá el usuario
			link.setAttribute('download', `Plano_Proyecto_${projectId}.dxf`);
			
			document.body.appendChild(link);
			link.click();
			
			// Limpieza
			link.parentNode.removeChild(link);
			window.URL.revokeObjectURL(url);
		} catch (error) {
			console.error("Error al descargar el DXF:", error);
		}
	};

	const handleExportChange = (event) => {
		const exportType = event.target.value; // 'json', 'excel', etc.
		console.log(exportType);
		handleDownloadDXF(params.id)

		// if (exportType) {
		// 	dispatch(requestExport(exportType));
		// }
	};

	const tipo_render = ["2d", "3d", "render ia"];
	const { renderSeleccionado, cambiarRender } = useRender();


	async function getProinvierteLink() {
		const projectId = params.id;
		// http://localhost:8001/api/v3/project/generate-proinvierte/656
		const url_api_generate =  `${BASE_URL_CALC}/api/v3/project/generate-proinvierte/${projectId}`;
		const url_proinvierte = `${import.meta.env.VITE_URL_PROINVIERTE}/?prodesign=${projectId}`;
		const response = await axios.get(url_api_generate)

		if(response.status === 200){
			window.open(url_proinvierte, '_blank');
		}

	}

	return (
		<Box
			sx={{
				display: "flex",
				alignItems: "center",
				flex: 1,
			}}
		>
			<Link to={"/"} className="toolbar-logo">
				ProDesign
			</Link>
			<select style={{ backgroundColor: "#E4E6EF", margin: "0 2.4rem" }}>
				<option>VERSION 1: HOME</option>
				<option>ESTRUCTURA</option>
			</select>
			<nav className="greedy">
				{/* width: 100% */}
				<ul className="links">
					{/* <li>
						<Button
							onClick={() =>
								dispatch(
									setPlayCamera({ isPlayCamera: "play" })
								)
							}
						>
							<PlayIcon htmlColor="#3699FF" />
							&nbsp; Play
						</Button>
					</li> */}

					{/* <li>
						<Button2D handleViewState={handleViewState} />
					</li>

					<li>
						<Button3D handleViewState={handleViewState} />
					</li> */}

					<div style={{ display: "flex", gap: "10px" }}>
						{tipo_render.map((tipo, index) => (
							<button
							key={index}
							onClick={() => cambiarRender(index)} // Cambia entre 0 (2d) y 1 (3d)
							style={{
								marginTop: "4px",
								height:"38px",
								padding: "0px 16px",
								border: "1px solid #ccc",
								backgroundColor: renderSeleccionado === index ? "#007bff" : "#fff",
								color: renderSeleccionado === index ? "#fff" : "#000",
								cursor: "pointer",
								borderRadius: "5px",
								fontWeight: "bold"
							}}
							>
							{tipo.toUpperCase()}
							</button>
						))}

						<button
							onClick={getProinvierteLink}
							style={{
								marginTop: "4px",
								height:"38px",
								padding: "0px 16px",
								border: "1px solid #ccc",
								backgroundColor: "#007bff",
								color: "#fff",
								cursor: "pointer",
								borderRadius: "5px",
								fontWeight: "bold"
							}}
							>
								Enviar a proinvierte
							</button>
					</div>

					
					<li>
						<Settings
							//state={state}
							projectData={state}
							school={school}
							handleSetClassrooms={handleSetClassrooms}
						/>
					</li>

					<li>
						<select
							id="select-export"
							style={{
								margin: "0.3rem 0.4rem",
								backgroundColor: "#E4E6EF",
							}}
							onChange={handleExportChange}
						>
							<option value="EXPORTAR">EXPORTAR</option>
							<option value="dxf">DXF (AUTOCAD)</option>
						</select>
					</li>

					{/* <li>
						<select
							id="select-view"
							style={{
								margin: "0.3rem 0.4rem",
								backgroundColor: "#E4E6EF",
							}}
							onChange={() => {
								dispatch(setRoof());
							}}
						>
							<option value="1">VISTA COMPLETA</option>
							<option value="2">VISTA MUROS</option>
						</select>
					</li> */}

					{/* <li>
						<Button id="save-obj">
							<DataObjectIcon htmlColor="#3699FF" />
						</Button>
					</li> */}

					{/* <li>
						<Button>
							<TextureIcon htmlColor="#3699FF" />
						</Button>
					</li> */}

					{/* <li>
						<Button onClick={() => dispatch(setClassroomsLights())}>
							<LightbulbOutlinedIcon htmlColor="#3699FF" />
						</Button>
					</li> */}

					{/* <li>
						<Button
							// onClick={() => dispatch(setRoof())}
							onClick={() => {
								handleViewState({ roof: !view.roof });
							}}
						>
							roof (temp)
						</Button>
					</li> */}

					{/* <li>
						<Button onClick={() => dispatch(setColorForLevel())}>
							level color (temp)
						</Button>
					</li> */}

					{/* <ButtonSave /> */}

					{/* <div style={{}}>
						<input id="color" type="color" name="color_wall" onChange={(evt) => {
							handleColorWall(evt.target.value);
						}} />
						<label htmlFor="color" style={{font: ".7rem "Fira Sans", sans-serif", color: "black"}}>(prototype)</label>
					</div> */}
				</ul>
				<IconButton className="btn-more" disableRipple>
					<MoreHorizIcon />
				</IconButton>
				<ul className="hidden-links hidden"></ul>
			</nav>
		</Box>
	);
}

const Button = styled(MuiButton)({
	borderRadius: ".42rem",
	color: "#3F4254",
	padding: ".60rem 1rem",
	fontFamily: "inherit",
	textTransform: "none",
	border: "1px solid #E4E6EF",
	margin: ".3rem .4rem",
	boxShadow: "none",
	backgroundColor: "#E4E6EF",
	"&:hover": {
		backgroundColor: "#d8dbe8",
		// boxShadow: "none"
	},
});

function debounce(func, timeout = 300) {
	let timer;
	return (...args) => {
		clearTimeout(timer);
		timer = setTimeout(() => {
			func.apply(this, args);
		}, timeout);
	};
}

function x() {
	var $nav = $("nav.greedy");
	var $btn = $("nav.greedy .btn-more");
	var $vlinks = $("nav.greedy .links");
	var $hlinks = $("nav.greedy .hidden-links");

	var numOfItems = 0;
	var totalSpace = 0;
	var breakWidths = [];

	// Get initial state
	$vlinks.children().outerWidth(function (i, w) {
		totalSpace += w;
		numOfItems += 1;
		breakWidths.push(totalSpace);
	});

	var availableSpace, numOfVisibleItems, requiredSpace;

	function check() {
		// Get instant state
		availableSpace = $vlinks.width() - 10;
		numOfVisibleItems = $vlinks.children().length;
		requiredSpace = breakWidths[numOfVisibleItems - 1];

		// There is not enought space
		if (requiredSpace > availableSpace) {
			$vlinks.children().last().prependTo($hlinks);
			numOfVisibleItems -= 1;
			check();
			// There is more than enough space
		} else if (availableSpace > breakWidths[numOfVisibleItems]) {
			$hlinks.children().first().appendTo($vlinks);
			numOfVisibleItems += 1;
		}

		// Update the button accordingly
		$btn.attr("count", numOfItems - numOfVisibleItems);
		if (numOfVisibleItems === numOfItems) {
			$btn.addClass("hidden");
		} else {
			$btn.removeClass("hidden");
		}
	}

	// Window listeners
	// $(window).resize(function() {
	// 	check();
	// });

	window.addEventListener("resize", function () {
		check();
	});

	$btn.on("click", function () {
		$hlinks.toggleClass("hidden");
	});

	check();
}
