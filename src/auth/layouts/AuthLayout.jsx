import React, { useContext } from "react";
import styled from '@mui/material/styles/styled';
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import AppsIcon from '@mui/icons-material/AppsRounded';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import banner from "../../assets/images/Pro-design-banner-01.jpg";
import logoNormal from "../../assets/images/logo-normal.png";
import logoHover from "../../assets/images/logo-hover.png";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import { ColorModeContext } from "../../theme/ThemeContext";

const HoverLogo = ({ size = '40px' }) => (
	<Box sx={{
		display: 'flex',
		position: 'relative',
		alignItems: 'center',
		justifyContent: 'center',
		cursor: 'pointer',
		'& .logo-hover': { opacity: 0 },
		'&:hover': {
			'& .logo-normal': { opacity: 0 },
			'& .logo-hover': { opacity: 1 }
		}
	}}>
		<img src={logoNormal} alt="Pro Design" className="logo-normal" style={{ height: size, objectFit: 'contain', transition: 'opacity 0.3s ease' }} />
		<img src={logoHover} alt="Pro Design Hover" className="logo-hover" style={{ position: 'absolute', height: size, objectFit: 'contain', transition: 'opacity 0.3s ease' }} />
	</Box>
);

// [DOCUMENTACIÓN] Modificación 2026-07-03: Ajuste menor para forzar despliegue y reconstrucción de la compilación en producción.
export const AuthLayout = ({ children }) => {
	const theme = useTheme();
	const colorMode = useContext(ColorModeContext);

	return (
		<Grid container sx={{ minHeight: "100vh", bgcolor: "background.default" }}> 
			{/* Lado Izquierdo: Banner Edge-to-Edge con contenido dinámico */}
			<Grid
				item
				xs={12}
				lg={7}
				xl={8}
				sx={{
					boxShadow: "none",
					backgroundImage: `url(${banner})`,
					backgroundSize: "cover",
					backgroundPosition: "left center",
					width: "100%",
					display: {
						xs: "none",
						lg: "flex" 
					},
					position: "relative",
					alignItems: "center",
					justifyContent: "flex-end", // Alineamos a la derecha para que no tape el plano
					p: { lg: 6, xl: 8 } // Padding responsivo
				}}
			>
				{/* Filtro oscuro sutil sobre la imagen si el tema es oscuro */}
				{theme.palette.mode === 'dark' && (
					<Box sx={{
						position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
						backgroundColor: 'rgba(15, 23, 42, 0.5)' 
					}} />
				)}
				
				{/* Logo Dinámico con Hover (Esquina superior izquierda) */}
				<Box sx={{ 
					position: "absolute", left: "2rem", top: "2rem", zIndex: 1,
					cursor: "pointer",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					width: "200px", // Ajustar según el tamaño real de los logos
					height: "60px",
					'& .logo-hover': { opacity: 0 },
					'&:hover': {
						'& .logo-normal': { opacity: 0 },
						'& .logo-hover': { opacity: 1 }
					}
				}}>
					{/* Usamos un Box con sombra sutil opcional o simplemente las imágenes */}
					<Box sx={{
						p: 1.5,
						borderRadius: '16px',
						bgcolor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.4)' : 'rgba(255, 255, 255, 0.8)',
						backdropFilter: 'blur(8px)',
						boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
						display: 'flex',
						position: 'relative'
					}}>
						<HoverLogo size="40px" />
					</Box>
				</Box>

				{/* Panel Editable de Información */}
				<Box sx={{
					position: "relative",
					zIndex: 2,
					width: "100%",
					maxWidth: "520px", 
					backgroundColor: theme.palette.mode === 'dark' ? "rgba(18, 18, 18, 0.75)" : "rgba(255, 255, 255, 0.75)",
					backdropFilter: "blur(10px)", // Efecto desenfoque estilo iOS
					borderRadius: "16px",
					p: 4,
					boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.1)",
					border: "1px solid",
					borderColor: theme.palette.mode === 'dark' ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.3)"
				}}>
					{/* Logo y Bienvenida */}
					<Stack direction="row" alignItems="center" spacing={2} mb={3}>
						<Box sx={{ 
							width: 52, height: 52, borderRadius: '12px', 
							bgcolor: theme.palette.mode === 'light' ? 'rgba(37, 99, 235, 0.1)' : 'rgba(14, 165, 233, 0.15)',
							display: 'flex', alignItems: 'center', justifyContent: 'center'
						}}>
							<HoverLogo size="32px" />
						</Box>
						<Box>
							<Typography variant="h5" fontWeight={800} color="text.primary" sx={{ letterSpacing: "-0.5px", lineHeight: 1.2 }}>
								BIENVENID@ a
							</Typography>
							<Typography variant="h5" fontWeight={900} color="primary" sx={{ letterSpacing: "-0.5px", lineHeight: 1 }}>
								PRO DESIGN
							</Typography>
						</Box>
					</Stack>

					{/* Sección: Quiénes Somos */}
					<Box sx={{ mb: 4 }}>
						<Typography variant="subtitle2" fontWeight={800} color="primary" sx={{ mb: 1, textTransform: "uppercase", letterSpacing: "1px", fontSize: "0.75rem" }}>
							Conoce más de nosotros
						</Typography>
						<Typography variant="h6" fontWeight={700} color="text.primary" sx={{ mb: 1.5, lineHeight: 1.2 }}>
							¿Quiénes Somos?
						</Typography>
						<Typography variant="body1" color="text.secondary" fontWeight={500} sx={{ lineHeight: 1.6 }}>
							Somos una plataforma de arquitectura online innovadora que facilita el desarrollo de prototipos y planos digitales para proyectos tanto privados como públicos, siempre en perfecta armonía con las políticas y planes de desarrollo nacional, regional y local.
						</Typography>
					</Box>

					<Typography variant="subtitle1" fontWeight={700} color="text.primary" sx={{ mb: 2 }}>
						Beneficios principales:
					</Typography>

					<Stack spacing={2} mb={5}>
						{[
							"Accesibilidad al proyecto desde cualquier dispositivo",
							"Diseño de la estructura en plano y 3D",
							"Consideración de parámetros establecidos por el gobierno",
							"Genera un reporte de dimensiones e irregularidades del terreno"
						].map((text, index) => (
							<Stack direction="row" alignItems="flex-start" spacing={1.5} key={index}>
								<Box sx={{ 
									mt: 0.7, 
									width: 8, 
									height: 8, 
									borderRadius: "50%", 
									bgcolor: theme.palette.primary.main, 
									flexShrink: 0 
								}} />
								<Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ lineHeight: 1.5 }}>
									{text}
								</Typography>
							</Stack>
						))}
					</Stack>

					{/* [DOCUMENTACIÓN] Se actualizó el botón de WhatsApp con el número de Brittney (+51 998 951 597) sin prefijo en pantalla y con un diseño más redondeado y minimalista (outlined, sin sombras pronunciadas, bordes circulares y flat look) */}
					<Button 
						variant="outlined" 
						fullWidth
						href="https://wa.me/51998951597?text=Hola,%20quiero%20saber%20m%C3%A1s%20sobre%20Pro%20Design"
						target="_blank"
						sx={{ 
							py: 1.2, 
							borderRadius: "50px",
							fontWeight: 500,
							fontSize: "0.95rem",
							borderColor: theme.palette.primary.main,
							color: theme.palette.primary.main,
							textTransform: "none",
							boxShadow: "none",
							'&:hover': {
								borderColor: theme.palette.primary.main,
								bgcolor: theme.palette.mode === 'light' ? 'rgba(37, 99, 235, 0.04)' : 'rgba(14, 165, 233, 0.08)',
								transform: "translateY(-1px)",
								boxShadow: "none",
								transition: "all 0.2s ease-in-out"
							}
						}}
					>
						Conversemos sobre tu proyecto: 998 951 597
					</Button>
				</Box>
			</Grid>

			{/* Lado Derecho: Panel de Autenticación */}
			<Grid
				item
				xs={12}
				lg={5}
				xl={4}
				sx={{
					bgcolor: "background.paper",
					display: "flex",
					flexDirection: "column",
					justifyContent: "center",
					position: "relative",
					boxShadow: theme.palette.mode === 'light' ? "-10px 0 30px rgba(0,0,0,0.05)" : "-10px 0 30px rgba(0,0,0,0.3)",
					zIndex: 10
				}}
			>
				{/* Toggle de Tema */}
				<Box sx={{ position: "absolute", top: 20, right: 30 }}>
					<IconButton onClick={colorMode.toggleColorMode} color="inherit">
						{theme.palette.mode === 'dark' ? <LightModeIcon sx={{color: "#F8FAFC"}} /> : <DarkModeIcon sx={{color: "#0F172A"}}/>}
					</IconButton>
				</Box>

				<Grid container justifyContent="center">
					<Grid item xs={12} sx={{ p: { xs: "2rem", sm: "3rem 4rem" } }}>
						<Stack spacing={1} mb={6} textAlign="center" alignItems="center">
							<Box sx={{ 
								width: 60, height: 60, borderRadius: '16px', 
								bgcolor: theme.palette.mode === 'light' ? 'rgba(37, 99, 235, 0.1)' : 'rgba(14, 165, 233, 0.15)',
								display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2
							}}>
								<HoverLogo size="36px" />
							</Box>
							<TitleAuth color="text.primary">
								<b>PRO DESIGN</b>
							</TitleAuth>
							<Typography variant="body1" color="text.secondary" fontWeight={500}>
								Plataforma de Arquitectura
							</Typography>
						</Stack>

						{/* Formulario inyectado */}
						{children}

						<div style={{ textAlign: "center", paddingTop: "3rem" }}>
							<Typography variant="body2" color="text.secondary">
								Al crear tu cuenta aceptas nuestros&nbsp;
								<a href='#' style={{ color: theme.palette.primary.main, textDecoration: "none", fontWeight: 600 }}>Términos y Condiciones</a>
								&nbsp;-&nbsp;
								<a href='#' style={{ color: theme.palette.primary.main, textDecoration: "none", fontWeight: 600 }}>Política de Privacidad</a>.
							</Typography>
						</div>

						<Stack spacing={0.5} textAlign="center" mt={4}>
							<Typography variant="caption" color="text.secondary">
								Diseño Web: <a href='#' style={{ color: "inherit", textDecoration: "underline" }}>Creative Marketing Ideas S.A.C.</a>
							</Typography>
							<Typography variant="caption" color="text.secondary">
								Programación Web: <a href='#' style={{ color: "inherit", textDecoration: "underline" }}>Sotdynamic S.A.C</a>
							</Typography>
						</Stack>
					</Grid>
				</Grid>
			</Grid>
		</Grid>
	)
}

const ColorButton = styled(Button)({
  backgroundColor: '#fff',
  boxShadow: '0 0.5rem 1.5rem 0.5rem rgb(0 0 0 / 8%)',
  borderRadius: '16px', // Rounded square like modern apps
  minWidth: 'auto',
  '&:hover': {
    backgroundColor: '#f8fafc',
  },
});

const TitleAuth = styled(Typography)({
	lineHeight: "1.2",
	fontSize: "1.75rem",
	letterSpacing: "-0.5px"
})
