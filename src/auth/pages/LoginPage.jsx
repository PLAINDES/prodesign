import { useTheme } from "@mui/material/styles";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import { redirectToCognitoLogin } from "../../utils/oidc";

export const LoginPage = () => {
	const theme = useTheme();

	const onCognitoLogin = async () => {
		try {
			await redirectToCognitoLogin();
		} catch (error) {
			console.error("Error redirecting to Cognito Hosted UI:", error);
		}
	};

	return (
		<Grid container spacing={3} justifyContent="center">
			<Grid item xs={12}>
				<Button
					variant="outlined"
					fullWidth
					size="large"
					onClick={onCognitoLogin}
					sx={{
						padding: "0.8rem",
						borderRadius: "10px",
						fontSize: "0.95rem",
						fontWeight: "bold",
						textTransform: "none",
						borderWidth: "2px",
						borderColor: theme.palette.primary.main,
						color: theme.palette.primary.main,
						"&:hover": {
							borderWidth: "2px",
							backgroundColor: theme.palette.primary.main + "0a",
						},
					}}
				>
					🔑 Iniciar sesión con ProBudgets SSO
				</Button>
			</Grid>
		</Grid>
	);
};
