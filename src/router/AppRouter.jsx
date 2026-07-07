import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuthStore } from "./../hooks/useCheckAuth";
import { CheckingAuth } from "../ui";
import { AuthRoutes } from "../auth/routes/AuthRouthes";
import { ArqPlataformRouter } from "./../app/router/ArqPlataformRouter";
import PlanIndex from "../app/Builder/PlanIndex";
import { RenderProvider } from "../app/Builder/RenderContext"; // NUEVO
import { toggleDoor, toggleWindow } from "../redux/projects/projectSlice";
import { logout, startCognitoLogin } from "../redux/auth";

export const AppRouter = () => {
	const { status, checkAuth } = useAuthStore();
	const dispatch = useDispatch();

	useEffect(() => {
		const x = JSON.parse(localStorage.getItem("load")) || [];
		console.log(x);

		for (let value of x) {
			if (value === "door") dispatch(toggleDoor());
			if (value === "window") dispatch(toggleWindow());
		}

		// [DOCUMENTACIÓN] Interceptar el callback de Cognito OIDC (code + state)
		const params = new URLSearchParams(window.location.search);
		const code = params.get("code");
		const returnedState = params.get("state");
		const error = params.get("error");
		const errorDescription = params.get("error_description");

		if (code && returnedState) {
			console.log("OIDC: Callback detectado, iniciando canje de tokens...");
			dispatch(startCognitoLogin(code, returnedState)).then(() => {
				// Limpiar parámetros sensibles de la URL
				const cleanUrl = window.location.origin + window.location.pathname;
				window.history.replaceState({}, document.title, cleanUrl);
			});
			return;
		}

		if (error) {
			console.error("OIDC Error devuelto por Cognito:", error, errorDescription);
			const cleanUrl = window.location.origin + window.location.pathname;
			window.history.replaceState({}, document.title, cleanUrl);
			
			// Si falló el silent renew, limpiamos flag de sesión para evitar loops e ir al login
			sessionStorage.removeItem("silent_renew_attempted");
			dispatch(logout({ errorMessage: errorDescription || "Error en la autenticación federada SSO." }));
			return;
		}

		checkAuth();
	}, []);

	if (status === "checking") return <CheckingAuth />;


	return (
		<Routes>
			{status === "authenticated" ? (
				<Route>
					<Route
						path="/*"
						element={<ArqPlataformRouter />}
					/>
					<Route
						path="/proyecto/:slug/:id"
						element={
							<RenderProvider>
								<PlanIndex />
							</RenderProvider>
						}
					/>
				</Route>
			) : (
				<Route path="/auth/*" element={<AuthRoutes />} />
			)}
			<Route path="/*" element={<Navigate to="/auth" />} />
		</Routes>
	);
};