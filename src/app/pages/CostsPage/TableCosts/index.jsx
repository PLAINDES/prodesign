import CloseIcon from "@mui/icons-material/Close";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Slide from "@mui/material/Slide";
import axios from "axios";
import { forwardRef, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import Swal from "sweetalert2";
import "./styles.css";
import TableSelect from "./TableSelect";

export default function TableCosts({
	project,
	categories, // ✅ Este es el nombre correcto del prop
	calculatedCosts,
	handleCosts,
	handleToggleLoading,
	onNewVersion,
}) {

	const BASE_URL_CALC = import.meta.env.VITE_API_BASE_URL_CALCULATE;

	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false); // ✅ Agregar estado de loading

	const dispatch = useDispatch();

	const handleOpen = () => setOpen(true);
	const handleClose = () => setOpen(false);

	const [dataProject, setdataProject] = useState({});
	const [regionProject, setregionProject] = useState("");

	const getDataProject = async () => {
		try {
			const project_id = project.id;

			const response = await axios.get(
				BASE_URL_CALC + "/api/v3/project/" + project_id
			);

			if (response.status === 200) {
				const data = response.data.data
				console.log("guardando region");
				
				setdataProject(data);
				console.log(data["region"]);
				
				setregionProject(data["region"])
				// setregionProject("LIMA METROPOLITANA Y PROVINCIA CONSTITUCIONAL DEL CALLAO")
			}
		} catch (e) {
			console.log(e);
		}
	};

	useEffect(() => {
		getDataProject();
	}, [ project?.id]);


	async function FetchDataCostos(project_id, data){
		setLoading(true);
		const response = await axios.post(
				BASE_URL_CALC + "/api/v3/project/costos/" + project_id,
				data
			);

		if (response.status == 200){
			console.log(response.data["data"]);
			handleClose();
			setLoading(false);
			window.location.reload()
		}else{
			setLoading(false);
		}
	}

	const handleSubmit = async (evt) => {
		evt.preventDefault();
		setLoading(true);

		console.log("🚀 Iniciando submit del formulario...");
		try {
			const formData = new FormData(evt.target);
			const data = Object.fromEntries(formData);

			// DATA PARA ENVIAR AL BACK EN COSTOS
			console.log("📝 Datos del formulario:", data);

			// 1️⃣ PRIMERO: Hacer la petición y esperar la respuesta
			console.log(`🔄 Llamando API con ID: ${project.id}`);
			FetchDataCostos(project.id, data)

			// Toast.fire({
			// 	icon: "success",
			// 	title: "Proyecto de costos guardando",
			// 	background: "#0d6efd",
			// 	color: "#ffffff",
			// });
		} catch (err) {
			console.error("❌ Error al guardar:", err);
			console.error("Stack:", err.stack);
			setLoading(false);
			Toast.fire({
				icon: "error",
				title: "Error al guardar el proyecto",
				text: err.message || "Ocurrió un error inesperado",
				background: "#dc3545",
				color: "#ffffff",
			});
		} finally {
			console.log("🏁 Submit finalizado");
		}
	};

	return (
		<div style={{ alignSelf: "start" }}>
			<Chip
				color="primary"
				size="small"
				label="Añadir Nuevo costeo"
				onClick={handleOpen}
				sx={{ mx: 0.5, p: 1 }}
			/>
			<Dialog
				open={open}
				TransitionComponent={Transition}
				maxWidth="lg"
				onClose={handleClose}
				PaperProps={{ sx: { margin: 1.5 } }}
			>
				<form onSubmit={handleSubmit}>
					<DialogTitle
						textAlign="center"
						sx={{ py: { xs: "10px", sm: "12px" } }}
					>
						Tabla de Costos {regionProject}
						<IconButton
							onClick={handleClose}
							sx={{
								position: "absolute",
								right: { xs: 2, sm: 20 },
								top: { xs: 2, sm: 8 },
								color: "gray",
							}}
							disabled={loading}
						>
							<CloseIcon />
						</IconButton>
					</DialogTitle>
					<DialogContent
						sx={{
							p: {
								xs: "0 12px 10px 12px",
								sm: "0 24px 12px 24px",
							},
						}}
					>
						<TableSelect
							regionProject={regionProject}
							categories={categories}
						/>
					</DialogContent>
					<DialogActions
						sx={{ p: { xs: "15px 10px", sm: "15px 24px" } }}
					>
						<Button
							variant="text"
							color="secondary"
							onClick={handleClose}
							disabled={loading}
						>
							Cancelar
						</Button>
						<Button
							variant="contained"
							color="primary"
							type="submit"
							disabled={loading}
						>
							{loading ? "Guardando..." : "Aceptar"}
						</Button>
					</DialogActions>
				</form>
			</Dialog>
		</div>
	);
}

const Transition = forwardRef(function Transition(props, ref) {
	return <Slide direction="up" ref={ref} {...props} />;
});

// sweet alert
const Toast = Swal.mixin({
	toast: true,
	position: "top-end",
	showConfirmButton: false,
	timer: 3000,
	timerProgressBar: true,
	didOpen: (toast) => {
		toast.addEventListener("mouseenter", Swal.stopTimer);
		toast.addEventListener("mouseleave", Swal.resumeTimer);
	},
});
