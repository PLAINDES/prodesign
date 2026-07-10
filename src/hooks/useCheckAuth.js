import { useDispatch, useSelector } from "react-redux";
import { login, logout, checkingCredentials } from "../redux/auth";
import { getSSOCookie, setSSOCookie } from "../utils/cookieHelper";
import { parseJwt, refreshCognitoTokens } from "../utils/oidc";
import axios from "axios";

export const useAuthStore = () => {
	const { status } = useSelector((state) => state.auth);
	const dispatch = useDispatch();

	const checkAuth = async () => {
		dispatch(checkingCredentials());

		let idToken = getSSOCookie("sso_id_token");
		let refreshToken = getSSOCookie("sso_refresh_token");

		if (!idToken) {
			const localToken = localStorage.getItem("token");
			if (!localToken) {
				return dispatch(logout());
			}
			idToken = localToken;
		}

		try {
			const payload = parseJwt(idToken);
			if (!payload) throw new Error("ID Token inválido");

			const isExpired = payload.exp * 1000 < Date.now();

			if (isExpired && refreshToken) {
				console.log("SSO Token expirado. Intentando renovación...");
				const refreshed = await refreshCognitoTokens(refreshToken);
				idToken = refreshed.id_token;
				setSSOCookie("sso_id_token", refreshed.id_token);
				if (refreshed.refresh_token) {
					setSSOCookie("sso_refresh_token", refreshed.refresh_token);
				}
			} else if (isExpired && !refreshToken) {
				throw new Error("Sesión expirada y sin Refresh Token disponible.");
			}

			const userPayload = parseJwt(idToken);
			const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/loginSSO`, {
				userId: userPayload.sub,
				userEmail: userPayload.email,
				userName: userPayload.given_name || userPayload.name,
				userLastname: userPayload.family_name || "",
			});

			const { user, data } = response.data;

			localStorage.setItem("token", idToken);

			dispatch(login({
				uid_master: userPayload.sub,
				uid: user?.id || userPayload.sub,
				email: userPayload.email,
				name: userPayload.given_name || userPayload.name || "Usuario",
				lastname: userPayload.family_name || "",
				idToken,
				accessToken: idToken,
				refreshToken,
				expiresAt: userPayload.exp * 1000
			}));

		} catch (error) {
			console.error("Error en validación SSO:", error);
			localStorage.removeItem("token");
			dispatch(logout());
		}
	};

	return { status, checkAuth };
};
