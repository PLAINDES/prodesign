import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import MenuOpenOutlinedIcon from "@mui/icons-material/MenuOpenOutlined";
import styled from "@mui/material/styles/styled";
import Search from "./HeaderContent/Search";
import { UserPopover } from "../../components";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { useContext } from "react";
import { useTheme } from "@mui/material/styles";
import { ColorModeContext } from "../../../theme/ThemeContext";

// import { drawerWidth } from 'config';
const drawerWidth = 265;

export default function Header({ open, handleDrawerOpen, handleDrawerClose }) {
	const theme = useTheme();
	const colorMode = useContext(ColorModeContext);

	return (
		<AppBar // Appbar === Header
			open={open}
			// position="fixed"
			sx={{
				backgroundColor: theme.palette.background.paper,
				color: theme.palette.text.primary,
				boxShadow: theme.palette.mode === 'light' ? "0px 0px 40px 0px rgb(82 63 105 / 10%)" : "0px 0px 40px 0px rgba(0,0,0,0.5)",
				WebkitBoxShadow: theme.palette.mode === 'light' ? "0px 0px 40px 0px rgb(82 63 105 / 10%)" : "0px 0px 40px 0px rgba(0,0,0,0.5)",
			}}
		>
			<Toolbar sx={{ justifyContent: "space-between" }}>
				<IconButton
					onClick={() =>
						open ? handleDrawerClose() : handleDrawerOpen()
					}
					sx={{
						backgroundColor: theme.palette.mode === 'light' ? "#f0f0f0" : "rgba(255,255,255,0.1)",
						borderRadius: "4px",
						marginRight: 5,
					}}
				>
					<MenuOpenOutlinedIcon
						sx={{
							transform: open ? "none" : "rotate(180deg)",
							transition: "0.5s",
							color: theme.palette.text.primary
						}}
					/>
				</IconButton>
				
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
					<IconButton onClick={colorMode.toggleColorMode} color="inherit">
						{theme.palette.mode === 'dark' ? <LightModeIcon sx={{color: "#F8FAFC"}} /> : <DarkModeIcon sx={{color: "#0F172A"}}/>}
					</IconButton>
					<UserPopover />
				</Box>
				{/* <Search /> */}
			</Toolbar>
		</AppBar>
	);
}

// ==============================|| HEADER - APP BAR STYLED ||============================== //

const AppBar = styled(MuiAppBar, {
	shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
	zIndex: theme.zIndex.drawer + 1,
	transition: theme.transitions.create(["width", "margin"], {
		easing: theme.transitions.easing.sharp,
		duration: theme.transitions.duration.leavingScreen,
	}),
	[theme.breakpoints.up("sm")]: {
		...(open && styleOnOpen(theme)),
	},
}));

const styleOnOpen = (theme) => ({
	marginLeft: drawerWidth,
	width: `calc(100% - ${drawerWidth}px)`,
	transition: theme.transitions.create(["width", "margin"], {
		easing: theme.transitions.easing.sharp,
		duration: theme.transitions.duration.enteringScreen,
	}),
});
