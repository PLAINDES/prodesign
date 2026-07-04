// [DOCUMENTACIÓN] Se rediseñó el sistema de colores a "Modo Claro Premium" y "Modo Oscuro Elegante", se cambió la tipografía a Inter
import { createTheme } from "@mui/material/styles";

// Sombras difusas multicapa para dar sensación de flotación
const customShadows = [
  "none",
  "0px 2px 4px rgba(0, 0, 0, 0.02)",
  "0px 4px 6px -1px rgba(0, 0, 0, 0.03)",
  "0px 10px 15px -3px rgba(0, 0, 0, 0.04)",
  "0px 20px 25px -5px rgba(0, 0, 0, 0.05)",
  ...Array(20).fill("0px 25px 50px -12px rgba(0, 0, 0, 0.1)"),
];

const commonConfig = {
	typography: {
		fontFamily: [
			"'Inter'",
			"sans-serif"
		].join(","),
		button: {
			textTransform: "none", 
			fontWeight: 600,
		}
	},
	shape: {
		borderRadius: 12,
	},
	shadows: customShadows,
	components: {
		MuiButton: {
			styleOverrides: {
				root: {
					borderRadius: "8px", 
					transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
					"&:hover": {
						transform: "translateY(-2px)",
						boxShadow: "0px 6px 12px rgba(37, 99, 235, 0.2)"
					}
				}
			}
		},
		MuiPaper: {
			styleOverrides: {
				root: {
					backgroundImage: "none",
				}
			}
		},
	}
};

export const lightTheme = createTheme({
	...commonConfig,
	palette: {
		mode: 'light',
		primary: { main: '#2563eb', contrastText: '#ffffff' },
		secondary: { main: '#0f172a', contrastText: '#ffffff' },
		background: { default: '#F8FAFC', paper: '#FFFFFF' },
		text: { primary: '#0F172A', secondary: '#64748B' },
		error: { main: '#ef4444' },
		success: { main: '#10b981', contrastText: '#ffffff' }
	},
	components: {
		...commonConfig.components,
		MuiListItemText: {
			styleOverrides: {
				primary: { fontFamily: "'Inter', sans-serif", color: "#0F172A" }
			},
			variants: [
				{
					props: { variant: "project-item" },
					style: { "&:hover": { backgroundColor: "rgba(37, 99, 235, 0.05)" } }
				}
			]
		},
		MuiListItemIcon: {
			styleOverrides: { root: { color: "#64748B" } }
		},
		MuiListItemButton: {
			styleOverrides: {
				root: {
					borderRadius: '8px',
					margin: '4px 8px',
					"&.Mui-selected": {
						borderRight: "3px solid #2563eb",
						backgroundColor: "rgba(37, 99, 235, 0.08)",
						"&:hover": { backgroundColor: "rgba(37, 99, 235, 0.12)" }
					},
					"&:hover": { backgroundColor: "rgba(0, 0, 0, 0.03)" }
				}
			}
		}
	}
});

export const darkTheme = createTheme({
	...commonConfig,
	palette: {
		mode: 'dark',
		primary: { main: '#0ea5e9', contrastText: '#ffffff' },
		secondary: { main: '#6366f1', contrastText: '#ffffff' },
		background: { default: '#0F172A', paper: '#1E293B' },
		text: { primary: '#F8FAFC', secondary: '#94A3B8' },
		error: { main: '#ef4444' },
		success: { main: '#10b981', contrastText: '#ffffff' }
	},
	components: {
		...commonConfig.components,
		MuiListItemText: {
			styleOverrides: {
				primary: { fontFamily: "'Inter', sans-serif", color: "#F8FAFC" }
			},
			variants: [
				{
					props: { variant: "project-item" },
					style: { "&:hover": { backgroundColor: "rgba(14, 165, 233, 0.1)" } }
				}
			]
		},
		MuiListItemIcon: {
			styleOverrides: { root: { color: "#94A3B8" } }
		},
		MuiListItemButton: {
			styleOverrides: {
				root: {
					borderRadius: '8px',
					margin: '4px 8px',
					"&.Mui-selected": {
						borderRight: "4px solid #0ea5e9",
						backgroundColor: "rgba(14, 165, 233, 0.15)",
						"&:hover": { backgroundColor: "rgba(14, 165, 233, 0.25)" }
					},
					"&:hover": { backgroundColor: "rgba(255, 255, 255, 0.05)" }
				}
			}
		}
	}
});

// Alias for backwards compatibility where it is still explicitly imported as purpleTheme
export const purpleTheme = lightTheme;
