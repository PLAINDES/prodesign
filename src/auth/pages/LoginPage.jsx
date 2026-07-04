import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { startLoginWithEmailPassword, setAuthView } from "../../redux/auth";
import { useSnackbar } from "notistack";
import Grid from "@mui/material/Grid";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useState } from "react";
import { useTheme } from "@mui/material/styles";

// [DOCUMENTACIÓN] Refactorizado LoginPage para limpiar estilos hardcodeados y adaptarse al modo dinámico
export const LoginPage = () => {
	const dispatch = useDispatch();
	const theme = useTheme();

	const { enqueueSnackbar } = useSnackbar();
	const { status } = useSelector((state) => state.auth);

	const isAutheticate = useMemo(() => status === "authenticated", [status]);

	const handleBackdrop = ({ message, variant }) => {
		enqueueSnackbar(message, { variant });
	};

	const onSubmit = (evt) => {
		evt.preventDefault();
		var { email, password } = Object.fromEntries(new FormData(evt.target));
		dispatch(startLoginWithEmailPassword(email, password, handleBackdrop));
	};

	return (
		<form onSubmit={onSubmit}>
			<Grid container spacing={3} justifyContent="center">
				<Grid item xs={12}>
					<TextField
						label="Correo electrónico"
						type="email"
						placeholder="ejemplo@dominio.com"
						variant="outlined"
						fullWidth
						name="email"
						sx={{
							"& .MuiOutlinedInput-root": {
								borderRadius: "10px",
							}
						}}
					/>
				</Grid>
				
				<Grid item xs={12}>
					<PasswordInput />
					<div style={{ textAlign: "right", marginTop: "8px" }}>
						<a
							href="#"
							style={{
								color: theme.palette.primary.main,
								fontSize: "0.9rem",
								fontWeight: "600",
								textDecoration: "none"
							}}
							onClick={(e) => {
								e.preventDefault();
								dispatch(setAuthView({ authView: "register" }))
							}}
						>
							¿Olvidaste tu contraseña?
						</a>
					</div>
				</Grid>

				<Grid item xs={12} mt={2}>
					<Button
						type="submit"
						variant="contained"
						fullWidth
						size="large"
						sx={{
							padding: "0.8rem",
							borderRadius: "10px",
							fontSize: "1rem",
							boxShadow: theme.palette.mode === 'light' ? "0px 4px 12px rgba(37, 99, 235, 0.2)" : "0px 4px 12px rgba(14, 165, 233, 0.4)",
						}}
						disabled={isAutheticate}
					>
						Ingresar
					</Button>
				</Grid>
				<Grid item xs={12} textAlign={"center"}>
					<Link
						to="/auth/register"
						style={{
							color: theme.palette.primary.main,
							fontSize: "0.95rem",
							fontWeight: "600",
							textDecoration: "none"
						}}
					>
						¿No tienes cuenta? Regístrate aquí.
					</Link>
				</Grid>
			</Grid>
		</form>
	);
};

function PasswordInput() {
	const [show, setShow] = useState(false);
	const theme = useTheme();

	const handleMouseDownPassword = (event) => {
		event.preventDefault();
	};
	const handleClickShow = () => setShow((show) => !show);

	return (
		<FormControl fullWidth variant="outlined" sx={{
			"& .MuiOutlinedInput-root": {
				borderRadius: "10px",
			}
		}}>
			<TextField
				label="Contraseña"
				name="password"
				autoComplete="off"
				type={show ? "text" : "password"}
				variant="outlined"
				InputProps={{
					endAdornment: (
						<InputAdornment position="end">
							<IconButton
								aria-label="toggle password visibility"
								onClick={handleClickShow}
								onMouseDown={handleMouseDownPassword}
								edge="end"
							>
								{show ? <VisibilityOff /> : <Visibility />}
							</IconButton>
						</InputAdornment>
					)
				}}
			/>
		</FormControl>
	);
}
