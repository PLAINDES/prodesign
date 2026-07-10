import { LoginWithEmailPassword, registerUser } from "../../providers";

import { checkingCredentials, login, logout, loginFail } from "./authSlice";
import axios from "axios";
import sha1 from "sha1";
import { geolocationService } from "../../services/utilsService";
import { loginSSO } from "../../services/authService";
import { HOSTNAME } from "../../../constants";
import { 
	exchangeCodeForTokens, 
	parseJwt, 
	validateOidcState, 
	validateOidcNonce, 
	redirectToCognitoLogin, 
	logoutFromCognito 
} from "../../utils/oidc";

export const checkingAuthentication = (email, password) => {
	return async (dispatch) => {
		dispatch(checkingCredentials());
	};
};

// export const startGoogleSignIn = () => {
//   return async (dispatch) => {
//     dispatch(checkingCredentials());

//     //const result = await singInWithGoogle();

//     if (!result.ok) return dispatch(logout(result.errorMessage));

//     dispatch(login(result));
//   };
// };

export const startCreateUserWithEmailPassword = ({
	name,
	lastname,
	email,
	password,
	handleBackdrop,
}) => {
	return async (dispatch) => {
		dispatch(checkingCredentials());
		const res = await registerUser(name, lastname, email, password);

		if (res.status === 201) {
			handleBackdrop({ message: res.data.message, variant: "success" });
			dispatch(
				startLoginWithEmailPassword(email, password, handleBackdrop)
			);
		} else {
			console.log(res);
			handleBackdrop({
				message: res.response.data.error.message,
				variant: "error",
			});
			res.response.data.error.info?.forEach((el) => {
				handleBackdrop({
					message: "Error: " + el.msg,
					variant: "error",
				});
			});
			dispatch(loginFail());
		}

		// const { ok, uid, photoURL, errorMessage } =
		// await registerUserWithEmailPassword({ email, password, displayName });

		// if (!ok) return dispatch(logout({ errorMessage }));

		// dispatch(login({ uid, photoURL, displayName, email }));
	};
};

export const startLoginWithEmailPassword = (
	email,
	password,
	handleBackdrop
) => {
	return async (dispatch, getState) => {
		dispatch(checkingCredentials());

		const res = await LoginWithEmailPassword(email, password);

		if (res.status === 200) {
			const { data, message } = res.data;
			//const { user } = res.data;
			const { token, usuario } = data;
			const { id, id_master, email, name, lastname } = usuario;
			
			localStorage.setItem("token", token);
			console.log("token...", token);
			
			localStorage.setItem("SESS_ID", id_master);

			//const { clientIP } = await geolocationService();

			// await loginSSO({
			// 	userId: id_master,
			// 	userEmail: email,
			// 	browserId: sha1(window.navigator.userAgent),
			// 	browserIp: sha1(clientIP),
			// 	browserAud: sha1(
			// 		clientIP + window.navigator.userAgent + HOSTNAME
			// 	),
			// 	productId: "pro-design",
			// });

			handleBackdrop({ message: message, variant: "success" });

			dispatch(
				login({
					uid_master: data.id_master,
					uid: id,
					email,
					name,
					lastname,
				})
			);
		} else if (res.response && res.response.status > 0) {
			// [DOCUMENTACIÓN] Se añade validación para evitar error cuando res.response es undefined (por falla de red o servidor apagado)
			handleBackdrop({
				message: "Error: " + (res.response.data?.error?.message || "Error de conexión con el servidor"),
				variant: "error",
			});
			dispatch(loginFail());
		} else {
			// [DOCUMENTACIÓN] Mensaje alternativo genérico en caso de que no haya respuesta del servidor
			handleBackdrop({
				message: "Internal server error, please report it.",
				variant: "error",
			});
			dispatch(loginFail());
		}
	};
};

export const startLogoutAuth = () => {
	return async (dispatch, getState) => {
		const { idToken } = getState().auth;
		sessionStorage.removeItem("silent_renew_attempted");
		dispatch(logout());
		logoutFromCognito(idToken);
	};
};

// [DOCUMENTACIÓN] Thunk para completar el inicio de sesión OIDC con código de autorización y PKCE
export const startCognitoLogin = (code, returnedState, handleBackdrop) => {
	return async (dispatch) => {
		dispatch(checkingCredentials());

		// 1. Validar State (Anti-CSRF)
		if (!validateOidcState(returnedState)) {
			console.error("OIDC Callback Error: El parámetro state devuelto no coincide. Abortando flujo por seguridad.");
			if (handleBackdrop) {
				handleBackdrop({ message: "Error de seguridad: verificación de estado fallida (CSRF).", variant: "error" });
			}
			dispatch(logout({ errorMessage: "Falla de verificación de estado anti-CSRF." }));
			return;
		}

		// Recuperar el code_verifier desde sessionStorage
		const codeVerifier = sessionStorage.getItem("oidc_code_verifier");
		if (!codeVerifier) {
			console.error("OIDC Callback Error: No se encontró el code_verifier en la sesión.");
			dispatch(logout({ errorMessage: "Falta verifier de autenticación PKCE." }));
			return;
		}

		try {
			// 2. Intercambio de code por tokens JWT
			const tokenData = await exchangeCodeForTokens(code, codeVerifier);
			const { id_token, access_token, refresh_token, expires_in } = tokenData;

			// 3. Validar token y Nonce (Anti-Replay)
			const payload = parseJwt(id_token);
			if (!payload) {
				throw new Error("El ID token devuelto por Cognito no se pudo parsear.");
			}

			if (!validateOidcNonce(payload.nonce)) {
				console.error("OIDC Callback Error: El nonce en el id_token no coincide. Posible ataque Replay.");
				dispatch(logout({ errorMessage: "Falla de verificación de token anti-replay." }));
				return;
			}

			// Limpieza de parámetros de un solo uso
			sessionStorage.removeItem("oidc_code_verifier");
			sessionStorage.removeItem("oidc_state");
			sessionStorage.removeItem("oidc_nonce");
			
			// Registrar que ya se intentó renovación para evitar bucles en recargas futuras
			sessionStorage.setItem("silent_renew_attempted", "true");

			const calculatedExpiresAt = Date.now() + (expires_in * 1000);

			// Extraer información del usuario según OIDC standard claims en Cognito
			const cognitoUid = payload.sub || payload["cognito:username"];
			const email = payload.email || "";
			const name = payload.given_name || payload.name || email.split("@")[0] || "Usuario";
			const lastname = payload.family_name || "";

			// Registrar/autenticar al usuario en el backend via SSO
			let localIdMaster = cognitoUid;
			try {
				const ssoRes = await loginSSO({
					userId: cognitoUid,
					userEmail: email,
					userName: name,
					userLastname: lastname,
					browserId: sha1(window.navigator.userAgent),
					browserIp: sha1("0.0.0.0"),
					browserAud: sha1("0.0.0.0" + window.navigator.userAgent + HOSTNAME),
					productId: "pro-design",
				});
				if (ssoRes?.success && ssoRes?.user) {
					localIdMaster = ssoRes.user.id_master || ssoRes.user.id;
				}
			} catch (e) {
				console.warn("SSO: No se pudo registrar usuario en backend, usando fallback:", e);
			}

			dispatch(login({
				uid_master: localIdMaster,
				uid: localIdMaster,
				email,
				name,
				lastname,
				idToken: id_token,
				accessToken: access_token,
				refreshToken: refresh_token,
				expiresAt: calculatedExpiresAt
			}));

			if (handleBackdrop) {
				handleBackdrop({ message: "Sesión iniciada correctamente con Cognito SSO.", variant: "success" });
			}
		} catch (error) {
			console.error("Error al autenticar contra Cognito:", error);
			dispatch(logout({ errorMessage: error.message || "Error al completar el login OIDC." }));
			if (handleBackdrop) {
				handleBackdrop({ message: error.message || "Falla en el inicio de sesión SSO.", variant: "error" });
			}
		}
	};
};

// [DOCUMENTACIÓN] Thunk para intentar renovación silenciosa de sesión contra Cognito usando prompt=none
export const silentLoginOnLoad = () => {
	return async (dispatch) => {
		const attempted = sessionStorage.getItem("silent_renew_attempted");
		if (attempted) {
			// Si ya se intentó, pasamos directamente a no autenticado para mostrar el formulario de login normal
			dispatch(logout());
			return;
		}

		console.log("OIDC Silent Renew: Intentando inicio de sesión silencioso...");
		dispatch(checkingCredentials());

		// Marcar intento en sessionStorage para prevenir un bucle infinito en caso de redirecciones rápidas
		sessionStorage.setItem("silent_renew_attempted", "true");

		const silentUrl = await redirectToCognitoLogin(true);
		if (silentUrl) {
			window.location.href = silentUrl;
		} else {
			dispatch(logout());
		}
	};
};
