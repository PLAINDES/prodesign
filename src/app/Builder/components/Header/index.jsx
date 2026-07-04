import { useContext } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import ToolsBarComponent from "../ToolsBar/ToolsBar";
import { UserPopover } from "../../../components";
import { useTheme } from "@mui/material/styles";
import { ColorModeContext } from "../../../../theme/ThemeContext";

// [DOCUMENTACIÓN] Se aplicó Glassmorphism dinámico y se añadió el botón de Theme Toggle global
export default function Header({
	state, school, view, handleViewState, handleSetClassrooms
}) {
	const theme = useTheme();
	const colorMode = useContext(ColorModeContext);

	return (
		<AppBar
			component="header"
			position="relative"
			sx={{
				backgroundColor: theme.palette.mode === 'light' ? "rgba(255, 255, 255, 0.75)" : "rgba(30, 41, 59, 0.7)",
				backdropFilter: "blur(16px)",
				WebkitBackdropFilter: "blur(16px)",
				boxShadow: theme.palette.mode === 'light' ? "0 1px 2px rgba(0, 0, 0, 0.05)" : "0 4px 30px rgba(0, 0, 0, 0.1)",
				borderBottom: theme.palette.mode === 'light' ? "1px solid rgba(0, 0, 0, 0.08)" : "1px solid rgba(255, 255, 255, 0.05)",
				zIndex: 50,
			}}
		>
			<Toolbar sx={{ px: "5px" }}>
				{/* ================== ON DESKTOP ================== */}
				<Box
					sx={{
						display: {
							xs: "none",
							sm: "flex"
						},
						justifyContent: "space-between",
						alignItems: "center",
						width: "100%"
					}}
				>
					<ToolsBarComponent
						view={view}
						state={state}
						school={school}
						handleViewState={handleViewState}
						handleSetClassrooms={handleSetClassrooms}
					/>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
						<IconButton onClick={colorMode.toggleColorMode} color="inherit">
							{theme.palette.mode === 'dark' ? <LightModeIcon sx={{color: "#F8FAFC"}} /> : <DarkModeIcon sx={{color: "#0F172A"}}/>}
						</IconButton>
						<UserPopover />
					</Box>
				</Box>
			</Toolbar>
		</AppBar>
	)
}