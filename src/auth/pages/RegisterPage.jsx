import { useState } from "react";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import { Link as RouterLink } from "react-router-dom";
import { signUp, confirmSignUp } from "aws-amplify/auth";

export const RegisterPage = () => {
	const [step, setStep] = useState("form");
	const [email, setEmail] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState("");

	const onSubmit = async (evt) => {
		evt.preventDefault();
		setError("");
		setLoading(true);

		const data = Object.fromEntries(new FormData(evt.target));
		const { name, lastname, email: mail, password } = data;

		try {
			const result = await signUp({
				username: mail,
				password,
				options: {
					userAttributes: {
						email: mail,
						given_name: name,
						family_name: lastname,
					},
				},
			});

			if (result.nextStep?.signUpStep === "CONFIRM_SIGN_UP") {
				setEmail(mail);
				setStep("confirm");
				setMessage(`Se envió un código de verificación a ${mail}`);
			}
		} catch (err) {
			console.error("Cognito signUp error:", err);
			if (err.name === "UsernameExistsException") {
				setError("El correo ya está registrado.");
			} else if (err.name === "InvalidPasswordException") {
				setError("La contraseña debe tener al menos 8 caracteres, mayúsculas, minúsculas y símbolos.");
			} else if (err.name === "InvalidParameterException") {
				setError(err.message || "Datos inválidos.");
			} else {
				setError(err.message || "Error al registrarse.");
			}
		} finally {
			setLoading(false);
		}
	};

	const onConfirm = async (evt) => {
		evt.preventDefault();
		setError("");
		setLoading(true);

		const { code } = Object.fromEntries(new FormData(evt.target));

		try {
			await confirmSignUp({
				username: email,
				confirmationCode: code,
			});
			setStep("done");
		} catch (err) {
			console.error("Cognito confirm error:", err);
			if (err.name === "CodeMismatchException") {
				setError("El código ingresado es incorrecto.");
			} else if (err.name === "ExpiredCodeException") {
				setError("El código ha expirado. Solicita uno nuevo.");
			} else {
				setError(err.message || "Error al confirmar el código.");
			}
		} finally {
			setLoading(false);
		}
	};

	if (step === "confirm") {
		return (
			<Grid container spacing={{ xs: 3, sm: 5 }}>
				<Grid item xs={12}>
					<Typography variant="h3" sx={{ color: "#181C32", fontWeight: 600, fontSize: { xs: "1.25rem", lg: "1.75rem" } }}>
						Verificar correo
					</Typography>
				</Grid>
				{message && (
					<Grid item xs={12}>
						<Alert severity="info">{message}</Alert>
					</Grid>
				)}
				<Grid item xs={12}>
					<form onSubmit={onConfirm}>
						<Grid container rowSpacing={3} columnSpacing={2}>
							<Grid item xs={12}>
								<TextField
									label="Código de verificación"
									type="text"
									placeholder="000000"
									variant="filled"
									fullWidth
									name="code"
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
									{loading ? <CircularProgress size={24} color="inherit" /> : "Confirmar código"}
								</Button>
							</Grid>
						</Grid>
					</form>
				</Grid>
			</Grid>
		);
	}

	if (step === "done") {
		return (
			<Grid container spacing={3} justifyContent="center">
				<Grid item xs={12}>
					<Alert severity="success">
						Cuenta creada correctamente. Revisa tu correo para confirmar tu dirección de email.
					</Alert>
				</Grid>
				<Grid item xs={"auto"}>
					<RouterLink to="/auth/login" style={{ textDecoration: "none" }}>
						<Button variant="contained" sx={{
							padding: ".85rem",
							borderRadius: "0.42rem",
							textTransform: "unset",
							fontSize: "1rem",
							fontWeight: "600",
						}}>
							Iniciar sesión
						</Button>
					</RouterLink>
				</Grid>
			</Grid>
		);
	}

	return (
		<Grid container spacing={{ xs: 3, sm: 5 }}>
			<Grid item xs={12}>
				<Typography variant="h3" sx={{
					color: "#181C32",
					fontWeight: 600,
					fontSize: { xs: "1.25rem", lg: "1.75rem" }
				}}>
					Registrate
				</Typography>
			</Grid>
			<Grid item xs={12}>
				<form onSubmit={onSubmit}>
					<Grid container rowSpacing={3} columnSpacing={2}>
						<Grid item xs={12}>
							<TextField
								label="Nombre"
								type="text"
								placeholder="Nombre"
								variant="filled"
								fullWidth
								name="name"
								required
								InputLabelProps={{ required: false }}
							/>
						</Grid>
						<Grid item xs={12}>
							<TextField
								label="Apellido"
								type="text"
								placeholder="Apellido"
								variant="filled"
								fullWidth
								name="lastname"
								required
								InputLabelProps={{ required: false }}
							/>
						</Grid>
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
								}}
							>
								{loading ? <CircularProgress size={24} color="inherit" /> : "Crear cuenta"}
							</Button>
						</Grid>
						<Grid item xs={12} sx={{ textAlign: "center" }}>
							<Typography variant="body2" color="text.secondary">
								¿Ya tienes cuenta?&nbsp;
								<RouterLink to="/auth/login" style={{ textDecoration: "none", fontWeight: 600 }}>
									Iniciar sesión
								</RouterLink>
							</Typography>
						</Grid>
					</Grid>
				</form>
			</Grid>
		</Grid>
	);
};
