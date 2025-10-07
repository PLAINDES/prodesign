import { useState, forwardRef } from "react";
import { useDispatch } from "react-redux";
import Swal from "sweetalert2";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Slide from "@mui/material/Slide";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import CloseIcon from "@mui/icons-material/Close";
import TableSelect from "./TableSelect";
import { updateProjectCostsByIDService } from "../../../../services/projectsService";
import { updateProjectCosts } from "../../../../redux/projects/projectSlice";
import "./styles.css";

export default function TableCosts({
	project,
	categories, // ✅ Este es el nombre correcto del prop
	calculatedCosts,
	handleCosts,
	handleToggleLoading,
	onNewVersion,
}) {
	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false); // ✅ Agregar estado de loading

	const dispatch = useDispatch();

	const handleOpen = () => setOpen(true);
	const handleClose = () => setOpen(false);

	const handleSubmit = async (evt) => {
		evt.preventDefault();
		setLoading(true); // ✅ Activar loading

		console.log("🚀 Iniciando submit del formulario...");
		console.log("📋 Project:", project);
		console.log("📂 Categories:", categories);
		console.log("💰 Calculated Costs:", calculatedCosts);

		try {
			const formData = new FormData(evt.target);
			const data = Object.fromEntries(formData);

			console.log("📝 Datos del formulario:", data);

			// 1️⃣ PRIMERO: Hacer la petición y esperar la respuesta
			console.log(`🔄 Llamando API con ID: ${project.id}`);
			const res = await updateProjectCostsByIDService(project.id, data);

			console.log("✅ Respuesta del servidor:", res.data);

			// 2️⃣ SEGUNDO: Preparar los datos actualizados
			const updatedCategories = { ...categories, ...data }; // ✅ Usar 'categories'
			const updatedCalculatedCosts = {
				...res.data.calculatedProjectCosts,
			};

			console.log("📊 Categories actualizadas:", updatedCategories);
			console.log(
				"💵 Calculated Costs actualizados:",
				updatedCalculatedCosts
			);

			// 3️⃣ TERCERO: Actualizar referencias originales
			Object.assign(categories, data); // ✅ Usar 'categories'
			Object.assign(calculatedCosts, res.data.calculatedProjectCosts);

			// 4️⃣ CUARTO: AHORA SÍ llamar a onNewVersion CON LOS PARÁMETROS
			console.log("📤 Llamando a onNewVersion con:");
			console.log("  1. updatedCategories:", updatedCategories);
			console.log("  2. updatedCalculatedCosts:", updatedCalculatedCosts);
			console.log("  3. project:", project);

			onNewVersion(
				updatedCategories, // ✅ Categorías completas
				updatedCalculatedCosts, // ✅ Costos calculados del servidor
				project // ✅ Datos del proyecto
			);

			handleClose();

			Toast.fire({
				icon: "success",
				title: "Proyecto de costos guardado correctamente!",
				background: "#0d6efd",
				color: "#ffffff",
			});
		} catch (err) {
			console.error("❌ Error al guardar:", err);
			console.error("Stack:", err.stack);

			Toast.fire({
				icon: "error",
				title: "Error al guardar el proyecto",
				text: err.message || "Ocurrió un error inesperado",
				background: "#dc3545",
				color: "#ffffff",
			});
		} finally {
			setLoading(false); // ✅ Desactivar loading
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
						Tabla de Costos
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
							project={project}
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
