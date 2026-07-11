import { useDispatch, useSelector } from "react-redux";
import { login, logout, checkingCredentials } from "../redux/auth";
import { getSSOCookie, setSSOCookie, removeSSOCookie } from "../utils/cookieHelper";
import { parseJwt } from "../utils/oidc";
import { refreshCognitoSession } from "../utils/Auth";
import { loginSSO } from "../services/authService";

export const useAuthStore = () => {
	const { status } = useSelector((state) => state.auth);
	const dispatch = useDispatch();

	const checkAuth = async () => {
		dispatch(checkingCredentials());

		try {
			let idToken = getSSOCookie("sso_id_token");
			let accessToken = null;
			let refreshToken = getSSOCookie("sso_refresh_token");

			if (!idToken) {
				idToken = localStorage.getItem("token");
			}

			if (idToken) {
				const payload = parseJwt(idToken);
				if (payload) {
					const isExpired = payload.exp * 1000 <= Date.now();

					if (isExpired && refreshToken) {
						try {
							const refreshed = await refreshCognitoSession(refreshToken);
							idToken = refreshed.IdToken;
							accessToken = refreshed.AccessToken;
							localStorage.setItem("token", idToken);
						} catch (refreshErr) {
							console.error("Error al renovar token:", refreshErr);
							removeSSOCookie("sso_id_token");
							removeSSOCookie("sso_refresh_token");
							localStorage.removeItem("token");
							dispatch(logout());
							return;
						}
					} else if (isExpired) {
						removeSSOCookie("sso_id_token");
						removeSSOCookie("sso_refresh_token");
						localStorage.removeItem("token");
						dispatch(logout());
						return;
					}

					const currentPayload = parseJwt(idToken);
					localStorage.setItem("token", idToken);

					try {
						const ssoRes = await loginSSO({
							userId: currentPayload.sub,
							userEmail: currentPayload.email,
							userName: currentPayload.given_name || currentPayload.name || "Usuario",
							userLastname: currentPayload.family_name || "",
						});
						if (ssoRes?.success && ssoRes?.user) {
							dispatch(login({
								uid_master: ssoRes.user.id_master || ssoRes.user.id,
								uid: ssoRes.user.id,
								email: currentPayload.email,
								name: currentPayload.given_name || currentPayload.name || "Usuario",
								lastname: currentPayload.family_name || "",
								idToken,
								accessToken: accessToken || idToken,
								refreshToken,
								expiresAt: currentPayload.exp * 1000,
							}));
							return;
						}
					} catch {
						dispatch(login({
							uid_master: currentPayload.sub,
							uid: currentPayload.sub,
							email: currentPayload.email,
							name: currentPayload.given_name || currentPayload.name || "Usuario",
							lastname: currentPayload.family_name || "",
							idToken,
							accessToken: accessToken || idToken,
							refreshToken,
							expiresAt: currentPayload.exp * 1000,
						}));
						return;
					}
				}
			}

			removeSSOCookie("sso_id_token");
			removeSSOCookie("sso_refresh_token");
			localStorage.removeItem("token");
			dispatch(logout());
		} catch (error) {
			console.error("Error en validación SSO:", error);
			removeSSOCookie("sso_id_token");
			removeSSOCookie("sso_refresh_token");
			localStorage.removeItem("token");
			dispatch(logout());
		}
	};

	return { status, checkAuth };
};
