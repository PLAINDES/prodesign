import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { Link as RouterLink } from "react-router-dom";
import { useSnackbar } from "notistack";
import { useDispatch } from "react-redux";
import { startLoginWithEmailPassword } from "../../redux/auth";

export const LoginPage = () => {
	const { enqueueSnackbar } = useSnackbar();
	const dispatch = useDispatch();

	const handleBackdrop = ({ message, variant }) => {
		enqueueSnackbar(message, { variant });
	};

	const onSubmit = (evt) => {
		evt.preventDefault();
		const { email, password } = Object.fromEntries(new FormData(evt.target));
		dispatch(startLoginWithEmailPassword(email, password, handleBackdrop));
	};

	return (
		<Grid container spacing={{ xs: 3, sm: 5 }}>
			<Grid item xs={12}>
				<Typography
					variant="h3"
					sx={{
						color: "#181C32",
						fontWeight: 600,
						fontSize: {
							xs: "1.25rem",
							lg: "1.75rem"
						}
					}}
				>
					Iniciar Sesión
				</Typography>
			</Grid>
			<Grid item xs={12}>
				<form onSubmit={onSubmit}>
					<Grid container rowSpacing={3} columnSpacing={2}>
						<Grid item xs={12}>
							<TextField
								label="Correo electrónico"
								type="email"
								placeholder="email@domain.com"
								variant="filled"
								fullWidth
								name="email"
								required
								InputLabelProps={{ required: false }}
							/>
						</Grid>
						<Grid item xs={12}>
							<TextField
								label="Contraseña"
								type="password"
								placeholder="Contraseña"
								variant="filled"
								fullWidth
								name="password"
								required
								InputLabelProps={{ required: false }}
							/>
						</Grid>
						<Grid item xs={"auto"}>
							<Button
								type="submit"
								variant="contained"
								sx={{
									padding: ".85rem",
									backgroundColor: "#1BC5BD",
									borderRadius: "0.42rem",
									textTransform: "unset",
									fontSize: "1rem",
									color: "#ffffff",
									letterSpacing: ".7px",
									fontWeight: "600",
									"&:hover": {
										backgroundColor: "#19b4ac"
									},
								}}
							>
								Iniciar sesión
							</Button>
						</Grid>
						<Grid item xs={"auto"}>
							<RouterLink to="/auth/register">
								<Button
									type="submit"
									variant="contained"
									sx={{
										padding: ".85rem",
										borderRadius: "0.42rem",
										backgroundColor: "#E1F0FF",
										color: "#3699FF",
										fontSize: "1rem",
										textTransform: "unset",
										letterSpacing: ".7px",
										fontWeight: "600",
										"&:hover": {
											color: "#E1F0FF",
											backgroundColor: "#3699FF"
										}
									}}
								>
									Registrarme
								</Button>
							</RouterLink>
						</Grid>
					</Grid>
				</form>
			</Grid>
		</Grid>
	);
};
