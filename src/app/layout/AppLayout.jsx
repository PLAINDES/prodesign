import { useState } from "react";
import useMediaQuery from "@mui/material/useMediaQuery";
import Box from "@mui/material/Box";
import Grid from '@mui/material/Grid2';
import Header from "./Header/Header";
import Drawer from "./Drawer";
import { Footer } from "./Footer";

export const AppLayout = ({ children }) => {
	const [open, setOpen] = useState(true);
	const matchMobile = useMediaQuery("(max-width:600px)");
	
	const handleDrawerOpen = () => setOpen(true);
	const handleDrawerClose = () => setOpen(false);

	return (
		<Grid container>
				<Header open={open} handleDrawerOpen={handleDrawerOpen} handleDrawerClose={handleDrawerClose} />
				<Box sx={{display: "flex"}}>
					<Drawer open={open} handleDrawerOpen={handleDrawerOpen} handleDrawerClose={handleDrawerClose} matchMobile={matchMobile}  />
					<Box
						component="main"
						sx={{
							width: "100%",
							padding: { xs: 2, sm: 3 },
							marginTop: 8
						}}
					>
						{children}
					</Box>
				</Box>
				
					{/* <Footer open={open} /> */}
		</Grid>
	)
}
