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
import { loginWithCognito, respondNewPasswordRequired } from "../../utils/Auth";
import { loginSSO } from "../../services/authService";
import { parseJwt } from "../../utils/oidc";

export const LoginPage = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [pendingChallenge, setPendingChallenge] = useState(null);
	const [newPassword, setNewPassword] = useState("");

	const onSubmit = async (evt) => {
		evt.preventDefault();
		setError("");
		setLoading(true);

		const { email, password } = Object.fromEntries(new FormData(evt.target));

		try {
			const result = await loginWithCognito(email, password);

			if (result.challenge) {
				if (result.challenge === "NEW_PASSWORD_REQUIRED") {
					setPendingChallenge({ username: email, session: result.session });
					setLoading(false);
					return;
				}
				throw new Error(`Unsupported authentication challenge: ${result.challenge}`);
			}

			const payload = parseJwt(result.IdToken);

			try {
				const ssoRes = await loginSSO({
					userId: payload.sub,
					userEmail: payload.email,
					userName: payload.given_name || payload.name || email,
					userLastname: payload.family_name || "",
				});
				if (ssoRes?.success && ssoRes?.user) {
					dispatch(login({
						uid_master: ssoRes.user.id_master || ssoRes.user.id,
						uid: ssoRes.user.id,
						email: payload.email,
						name: payload.given_name || payload.name || email,
						lastname: payload.family_name || "",
						idToken: result.IdToken,
						accessToken: result.AccessToken,
						refreshToken: result.RefreshToken,
						expiresAt: payload.exp * 1000,
					}));
				}
			} catch (ssoErr) {
				console.warn("SSO login failed, proceeding with local fallback:", ssoErr);
				dispatch(login({
					uid_master: payload.sub,
					uid: payload.sub,
					email: payload.email,
					name: payload.given_name || payload.name || email,
					lastname: payload.family_name || "",
					idToken: result.IdToken,
					accessToken: result.AccessToken,
					refreshToken: result.RefreshToken,
					expiresAt: payload.exp * 1000,
				}));
			}
			navigate("/");
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

	const onSubmitNewPassword = async (evt) => {
		evt.preventDefault();
		setError("");
		setLoading(true);

		try {
			const result = await respondNewPasswordRequired(
				pendingChallenge.username,
				newPassword,
				pendingChallenge.session
			);

			const payload = parseJwt(result.IdToken);

			try {
				const ssoRes = await loginSSO({
					userId: payload.sub,
					userEmail: payload.email,
					userName: payload.given_name || payload.name || pendingChallenge.username,
					userLastname: payload.family_name || "",
				});
				if (ssoRes?.success && ssoRes?.user) {
					dispatch(login({
						uid_master: ssoRes.user.id_master || ssoRes.user.id,
						uid: ssoRes.user.id,
						email: payload.email,
						name: payload.given_name || payload.name || pendingChallenge.username,
						lastname: payload.family_name || "",
						idToken: result.IdToken,
						accessToken: result.AccessToken,
						refreshToken: result.RefreshToken,
						expiresAt: payload.exp * 1000,
					}));
				}
			} catch (ssoErr) {
				console.warn("SSO login failed after password change, proceeding with local fallback:", ssoErr);
				dispatch(login({
					uid_master: payload.sub,
					uid: payload.sub,
					email: payload.email,
					name: payload.given_name || payload.name || pendingChallenge.username,
					lastname: payload.family_name || "",
					idToken: result.IdToken,
					accessToken: result.AccessToken,
					refreshToken: result.RefreshToken,
					expiresAt: payload.exp * 1000,
				}));
			}
			navigate("/");
		} catch (err) {
			console.error("Error al establecer nueva contraseña:", err);
			setError(err.message || "Error al cambiar la contraseña.");
		} finally {
			setLoading(false);
		}
	};

	if (pendingChallenge) {
		return (
			<Grid container spacing={{ xs: 3, sm: 5 }}>
				<Grid item xs={12}>
					<Typography variant="h3" sx={{ color: "#181C32", fontWeight: 600, fontSize: { xs: "1.25rem", lg: "1.75rem" } }}>
						Cambio de contraseña requerido
					</Typography>
				</Grid>
				<Grid item xs={12}>
					<form onSubmit={onSubmitNewPassword}>
						<Grid container rowSpacing={3} columnSpacing={2}>
							<Grid item xs={12}>
								<TextField
									label="Nueva contraseña"
									type="password"
									placeholder="Ingrese nueva contraseña"
									variant="filled"
									fullWidth
									value={newPassword}
									onChange={(e) => setNewPassword(e.target.value)}
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
									}}
								>
									{loading ? <CircularProgress size={24} color="inherit" /> : "Cambiar contraseña e iniciar sesión"}
								</Button>
							</Grid>
						</Grid>
					</form>
				</Grid>
			</Grid>
		);
	}

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
