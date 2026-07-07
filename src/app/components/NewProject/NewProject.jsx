"use client"
import { useState, useRef, useEffect } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import styled from "@mui/material/styles/styled";
import ProjectSchoolForm from "./ProjectSchoolForm";
import { useForm } from 'react-hook-form';

import MuiDialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";

import IconButton from "@mui/material/IconButton";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import CloseIcon from "@mui/icons-material/Close";
import Swal from "sweetalert2";
import axios from "axios";

const BASE_URL_CALC = import.meta.env.VITE_API_BASE_URL_CALCULATE;

const NewProject = ({ onRow, data, school }) => {
	const [open, setOpen] = useState(false);
	const [newProject, setShow] = useState({ show: true });
	const formRef = useRef(null);
	const navigate = useNavigate();

	const handleShow = (value) => {
		setShow(value);
	};

	const handleOpen = () => setOpen(true);
	const handleClose = () => setOpen(false);
	const [createdProject, setCreatedProject] = useState(false);

	useEffect(() => {
		if (!newProject.show && newProject.id) {

			setCreatedProject(true);

			Swal.fire({
				title: "Éxito",
				text: "El proyecto ha sido creado",
				icon: "success",
				showCancelButton: true,
				confirmButtonText: "Ir al proyecto",
				cancelButtonText: "Cerrar",
				confirmButtonColor: "#1976d2",
				cancelButtonColor: "#d32f2f",
			}).then((result) => {
				if (result.isConfirmed) {
					navigate(`/proyecto/colegios/${newProject.id}`);
				}
			});
		}
	}, [newProject, navigate]);

	const useFormProject = useForm();
	const { register, handleSubmit, formState: { errors } } = useFormProject
	const onSubmit = (data) => {
		sendDataForm(data)
	};

	const [jobId, setjobId] = useState(null)
	const [projectId, setprojectId] = useState(null)
	const [statusJobForm, setStatusJobForm] = useState(null)

	// [DOCUMENTACIÓN] Se envolvió la petición Axios en un bloque try/catch para capturar los errores 422
	// de validación de Pydantic, reportando el detalle en la consola y mostrando un modal informativo al usuario.
	async function sendDataForm(data) {
		try {
			const response = await axios.post(BASE_URL_CALC + "/api/v3/generate-project", data);
			if (response.status == 200) {
				navigate('/proyecto/colegios/' + response.data.project_id);
			}
		} catch (error) {
			console.error("Error al enviar el formulario del proyecto:", error);
			if (error.response) {
				console.error("Detalles de validación del backend:", error.response.data);
				Swal.fire({
					title: "Error de Validación",
					text: JSON.stringify(error.response.data.detail || error.response.data),
					icon: "error",
				});
			} else {
				Swal.fire({
					title: "Error",
					text: "No se pudo conectar con el servidor",
					icon: "error",
				});
			}
		}
	}

	// useEffect(() => {
	// 	if (statusJobForm !== null) {
	// 		console.log("Tarea terminada", statusJobForm);
	// 	}
	// }, [statusJobForm])

	// async function verifJob(id, setStatusJob) {
	// 	try {
	// 		const responseJob = await axios.get(BASE_URL_CALC + "/api/v3/jobs/" + id);
	// 		console.log(responseJob.data);

	// 		const status = responseJob.data.status;

	// 		if ("finished" === status) {
	// 			setStatusJob(status);
	// 		} else {
	// 			setTimeout(() => {
	// 				verifJob(id, setStatusJob);
	// 			}, 1000);
	// 		}
	// 	} catch (error) {
	// 		console.error("Error en la verificación:", error);
	// 		setTimeout(() => {
	// 			verifJob(id, setStatusJob);
	// 		}, 2000);
	// 	}
	// }

	return (
		<>
			{onRow ? (
				<AddOutlinedIcon
					onClick={handleOpen}
					sx={{ cursor: "pointer" }}
				/>
			) : (
				<ColorButton
					variant="contained"
					sx={{ fontWeight: 500 }}
					onClick={handleOpen}
					size="large"
				>
					<AddOutlinedIcon />
					&nbsp; Nuevo
				</ColorButton>
			)}
			<Dialog
				open={open}
				scroll="body"
				maxWidth="md"
				transitionDuration={{ enter: 400, appear: 300, exit: 400 }}
				PaperProps={{
					sx: {
						margin: {
							xs: "12px",
							sm: 3,
							md: 4,
						},
						overflowY: newProject.show ? "hidden" : "unset",
					},
				}}
				onClose={handleClose}
			>
				{!createdProject ? (
					<DialogTitle
						sx={{
							m: 0,
							p: {
								xs: "8px 16px",
								sm: 2,
							},
						}}
					>
						Crear proyecto nuevo

						<IconButton
							onClick={handleClose}
							sx={{
								position: "absolute",
								right: 8,
								top: { xs: 2, sm: 8 },
								color: "gray",
							}}
						>
							<CloseIcon />
						</IconButton>
					</DialogTitle>
				) : (
					<Box
						sx={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							p: 2,
							borderBottom: "1px solid #e0e0e0",
						}}
					>
						<Button onClick={handleClose} color="error">
							Cerrar
						</Button>

						<RouterLink
							to={`/proyecto/colegios/${newProject.id}`}
							style={{ textDecoration: "none" }}
						>
							<Button variant="contained" color="primary">
								Ir al proyecto
							</Button>
						</RouterLink>
					</Box>
				)}
				<DialogContent
					dividers
					sx={{
						padding: {
							xs: "12px 16px",
							sm: "1.5rem 3.5rem",
						},
					}}
				>
					<ProjectSchoolForm useForm={useFormProject} />
				</DialogContent>
				<DialogActions sx={{ py: "1.2rem" }}>
					<Button
						color="secondary"
						variant="contained"
						onClick={handleClose}
					>
						Cancelar
					</Button>
					<Button
						variant="contained"
						onClick={handleSubmit(onSubmit)}
					>
						Guardar
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
};

const Dialog = styled(MuiDialog)(({ theme }) => ({
	".MuiDialog-paper.MuiDialog-paperScrollBody": {
		[theme.breakpoints.down(964)]: {
			maxWidth: "calc(100% - 10px)",
		},
	},
}));

const ColorButton = styled(Button)({
	borderRadius: ".42rem",
	color: "#ffffff",
	padding: ".60rem 1rem",
	fontFamily: "inherit",
	textTransform: "none",
	border: "1px solid #1BC5BD",
	boxShadow: "none",
	backgroundColor: "#1BC5BD",
	"&:hover": {
		backgroundColor: "#2cb4ad",
		boxShadow: "none",
	},
});

export default NewProject;
