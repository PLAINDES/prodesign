import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar/Sidebar";
import Plan3D from "./Plan3D/Plan3D";
import Box from "@mui/material/Box";
import Grid from '@mui/material/Grid2';

import { OpenIconSpeedDial } from "./components/OpenIconSpeedDial";
import { getProjectByID } from "../../services/projectsService";
import { RenderProvider } from './RenderContext';
import zIndex from "@mui/material/styles/zIndex";
import axios from "axios";

export default function PlanIndex() {
	const [state, setState] = useState();
	const [mobileOpen, setMobileOpen] = useState(false);
	const [view, setViewState] = useState({ view: "2D", roof: true });
	const params = useParams();


	const handleViewState = (state) => {
		setViewState((prev) => ({ ...prev, ...state }));
	};

	const handleSetClassrooms = ({ inicial, primaria, secundaria }) => {
		setState({
			...state,
			aforo: {
				...state.aforo,
				aulaInicial: inicial,
				aulaPrimaria: primaria,
				aulaSecundaria: secundaria,
			},
		});
	};

	const handleDrawerToggle = () => {
		setMobileOpen((prevState) => !prevState);
	};
	
	return (
		<RenderProvider>
		<div style={{height: "100vh", border: "1px solid"}}>
			<Header
					state={state}
					view={view}
					handleViewState={handleViewState}
					handleDrawerToggle={handleDrawerToggle}
					handleSetClassrooms={handleSetClassrooms}
				/>

			<div style={{height: "90vh", display: "flex"}}>
				<div
					component="main"
					style={{ height: "90vh", width: "100%"}} // puede que esto deba cambiarse por la relacion de aspecto en perspective camera
				>
					<Plan3D state={state} view={view} height="90.7vh"/>
				</div>
				<div item>
					<Sidebar state={state} style={{height: "91vh", position : "fixed", top: 65, overflow:"hidden" ,right:30, zIndex: 100}}/>
				</div>
			</div>
			
		</div>
		</RenderProvider>
	);
}
