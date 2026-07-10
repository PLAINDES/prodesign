import { useState } from "react";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../../redux/auth";
import { signIn, fetchAuthSession } from "aws-amplify/auth";
import { loginSSO } from "../../services/authService";
import { parseJwt } from "../../utils/oidc";
import { setSSOCookie } from "../../utils/cookieHelper";

export const LoginPage = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const onSubmit = async (evt) => {
		evt.preventDefault();
		setError("");
		setLoading(true);

		const { email, password } = Object.fromEntries(new FormData(evt.target));

		try {
			await signIn({ username: email, password });

			const session = await fetchAuthSession();
			const token = session.tokens?.idToken?.toString();

			if (!token) {
				setError("No se pudo obtener el token de sesión.");
				setLoading(false);
				return;
			}

			const payload = parseJwt(token);

			setSSOCookie("sso_id_token", token);
			setSSOCookie("sso_refresh_token", token);

			try {
				const ssoRes = await loginSSO({
					userId: payload.sub,
					userEmail: payload.email,
					userName: payload.given_name || payload.name || email,
					userLastname: payload.family_name || "",
				});
				if (ssoRes?.success && ssoRes?.user) {
					localStorage.setItem("token", token);
					dispatch(login({
						uid_master: ssoRes.user.id_master || ssoRes.user.id,
						uid: ssoRes.user.id,
						email: payload.email,
						name: payload.given_name || payload.name || email,
						lastname: payload.family_name || "",
						idToken: token,
						accessToken: token,
						refreshToken: token,
						expiresAt: payload.exp * 1000,
					}));
					navigate("/");
				}
			} catch {
				localStorage.setItem("token", token);
				dispatch(login({
					uid_master: payload.sub,
					uid: payload.sub,
					email: payload.email,
					name: payload.given_name || payload.name || email,
					lastname: payload.family_name || "",
					idToken: token,
					accessToken: token,
					refreshToken: token,
					expiresAt: payload.exp * 1000,
				}));
				navigate("/");
			}
		} catch (err) {
			console.error("Cognito login error:", err);
			if (err.name === "UserNotFoundException") {
				setError("El usuario no existe en Cognito.");
			} else if (err.name === "NotAuthorizedException") {
				setError("Contraseña incorrecta.");
			} else if (err.name === "UserNotConfirmedException") {
				setError("El usuario no ha confirmado su correo electrónico.");
			} else {
				setError(err.message || "Error al iniciar sesión.");
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<Grid container spacing={{ xs: 3, sm: 5 }}>
			<Grid item xs={12}>
				<Typography
					variant="h3"
					sx={{
						color: "#181C32",
						fontWeight: 600,
						fontSize: { xs: "1.25rem", lg: "1.75rem" }
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
						{error && (
							<Grid item xs={12}>
								<Alert severity="error">{error}</Alert>
							</Grid>
						)}
						<Grid item xs={12}>
							<Button
								type="submit"
								variant="contained"
								fullWidth
								disabled={loading}
								sx={{
									padding: ".85rem",
									borderRadius: "0.42rem",
									textTransform: "unset",
									fontSize: "1rem",
									fontWeight: "600",
									letterSpacing: ".7px",
									minWidth: "160px",
								}}
							>
								{loading ? <CircularProgress size={24} color="inherit" /> : "Iniciar sesión"}
							</Button>
						</Grid>
						<Grid item xs={12} sx={{ textAlign: "center" }}>
							<Typography variant="body2" color="text.secondary">
								¿No tienes cuenta?&nbsp;
								<RouterLink to="/auth/register" style={{ textDecoration: "none", fontWeight: 600 }}>
									Registrarme
								</RouterLink>
							</Typography>
						</Grid>
					</Grid>
				</form>
			</Grid>
		</Grid>
	);
};
