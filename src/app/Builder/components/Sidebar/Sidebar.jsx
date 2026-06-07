import { useEffect } from "react";
import "./styles.css";
import {
	Accordion,
	AccordionDetails,
	AccordionSummary,
	Box,
	Typography,
} from "@mui/material";
import { ChevronDown, Home } from "lucide-react";
import { useRender } from '../../RenderContext';

export default function Sidebar({ state, school, ...props}) {

	const { dataProject } = useRender();

	useEffect(() => {
		Array.from(document.getElementsByClassName("sidebar-item")).forEach(
			(el) => {
				el.className = "sidebar-item active";
			}
		);
	}, []);

	return (
		<div className="sidebar" {...props}>
			<ul className="sidebar-list">
				<li className="sidebar-item">
					<span className="sidebar-anchor">
						Informacion del Proyecto{" "}
					</span>
					<p style={{ marginTop: ".4rem" }}>Nombre: {dataProject?.name}</p>
					<p>Versión: VERSIÓN 1</p>
					<p>Zona: {dataProject?.zone}</p>
					<p>
						Niveles:&nbsp;
						{new Intl.ListFormat("es", {
							style: "long",
							type: "conjunction",
						}).format(state?.level)}
					</p>
					<p>Tipo: {state?.sublevel}</p>
					<p>Aforo Estudiantil: {school?.maxCapacity}</p>
				</li>
				<li className="sidebar-item">
					<span className="sidebar-anchor">Terreno </span>
					<p>
						Area total: {school?.totalArea}m
						<span style={{ fontSize: "1.5rem" }}>²</span>
					</p>
					<p>Perimetro: 5345m</p>
				</li>
				<li className="sidebar-item">
					<span className="sidebar-anchor">Area Disponible</span>
					<p style={{ marginTop: "10px" }}>
						Area : {school?.generalArea}m
					</p>
					<p>Perimetro : 3500m</p>
					<p>Ancho: {school?.width}m</p>
					<p>Largo: {school?.length}m</p>
				</li>
				<li className="sidebar-item">
					{/* <a href="#" className="sidebar-anchor">Cantidad: </a> */}
					<span className="sidebar-anchor">Cantidad</span>
					<Accordion
						sx={{
							boxShadow: "none",
							"&:before": { display: "none" },
							backgroundColor: "transparent",
						}}
					>
						<AccordionSummary
							expandIcon={<ChevronDown />}
							sx={{
								padding: 0,
								minHeight: "auto",
								"& .MuiAccordionSummary-content": {
									margin: "8px 0",
									display: "flex",
									alignItems: "center",
									gap: 1,
								},
							}}
						>
							{/* <SchoolIcon
								sx={{ fontSize: 20, color: "primary.main" }}
							/> */}
							<Typography
								variant="body3"
								sx={{ fontWeight: 600 }}
							>
								Aulas: {school?.numberOfClassrooms?.getTotal?.()}
							</Typography>
						</AccordionSummary>

						<AccordionDetails sx={{ padding: "0 0 0 5px" }}>
							<Box
								sx={{
									display: "flex",
									flexDirection: "column",
									gap: 0.5,
								}}
							>
								<Typography
									variant="body2"
									sx={{ color: "text.secondary" }}
								>
									📚 Inicial:{" "}
									{school?.numberOfClassrooms?.inicial}
								</Typography>
								<Typography
									variant="body2"
									sx={{ color: "text.secondary" }}
								>
									📘 Primaria:{" "}
									{school?.numberOfClassrooms?.primaria}
								</Typography>
								<Typography
									variant="body2"
									sx={{ color: "text.secondary" }}
								>
									📕 Secundaria:{" "}
									{school?.numberOfClassrooms?.secundaria}
								</Typography>
							</Box>
						</AccordionDetails>
					</Accordion>
					<p>Baños : {school?.bathrooms.length}</p>
					<Accordion
						sx={{
							boxShadow: "none",
							"&:before": { display: "none" },
							backgroundColor: "transparent",
						}}
					>
						<AccordionSummary
							expandIcon={<ChevronDown />}
							sx={{
								padding: 0,
								minHeight: "auto",
								"& .MuiAccordionSummary-content": {
									margin: "4px 0",
									display: "flex",
									alignItems: "center",
									gap: 1,
								},
							}}
						>
							{/* <SchoolIcon
								sx={{ fontSize: 20, color: "primary.main" }}
							/> */}
							<Typography
								variant="body3"
								sx={{ fontWeight: 600 }}
							>
								Ambientes :{" "}
								{school?.complementaryEnvironment.length}
							</Typography>
						</AccordionSummary>

						<AccordionDetails sx={{ padding: "0 0 0 5px" }}>
							{school?.complementaryEnvironment.map((ambiente) => (
								<Box
									sx={{
										display: "flex",
										flexDirection: "column",
										gap: 10.5,
									}}
								>
									<Typography
										variant="body3"
										sx={{ color: "text.secondary" }}
									>
										{/* <Home sx={{}}/>{" "} */}
										{ambiente?.ambienteComplementario}
									</Typography>
								</Box>
							))}
						</AccordionDetails>
					</Accordion>
				</li>
			</ul>
		</div>
	);
}
