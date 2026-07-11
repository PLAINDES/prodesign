import { useDispatch, useSelector } from "react-redux";
import { login, logout, checkingCredentials } from "../redux/auth";
import { getSSOCookie, setSSOCookie } from "../utils/cookieHelper";
import { parseJwt } from "../utils/oidc";
import { fetchAuthSession, getCurrentUser, signOut } from "aws-amplify/auth";
import axios from "axios";

export const useAuthStore = () => {
	const { status } = useSelector((state) => state.auth);
	const dispatch = useDispatch();

	const checkAuth = async () => {
		dispatch(checkingCredentials());

		try {
			let token = null;
			try {
				const session = await fetchAuthSession();
				token = session.tokens?.idToken?.toString();
			} catch {}

			if (token) {
				const payload = parseJwt(token);

				setSSOCookie("sso_id_token", token);

				const user = await getCurrentUser();

				localStorage.setItem("token", token);

				const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/loginSSO`, {
					userId: user.userId || payload.sub,
					userEmail: payload.email,
					userName: payload.given_name || payload.name,
					userLastname: payload.family_name || "",
				});

				const { user: localUser } = response.data;

				dispatch(login({
					uid_master: payload.sub,
					uid: localUser?.id || payload.sub,
					email: payload.email,
					name: payload.given_name || payload.name || "Usuario",
					lastname: payload.family_name || "",
					idToken: token,
					accessToken: token,
					refreshToken: null,
					expiresAt: payload.exp * 1000,
				}));
				return;
			}

			const localToken = getSSOCookie("sso_id_token") || localStorage.getItem("token");
			if (localToken) {
				const payload = parseJwt(localToken);
				if (payload && payload.exp * 1000 > Date.now()) {
					localStorage.setItem("token", localToken);
					const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/loginSSO`, {
						userId: payload.sub,
						userEmail: payload.email,
						userName: payload.given_name || payload.name,
						userLastname: payload.family_name || "",
					});
					const { user: localUser } = response.data;
					dispatch(login({
						uid_master: payload.sub,
						uid: localUser?.id || payload.sub,
						email: payload.email,
						name: payload.given_name || payload.name || "Usuario",
						lastname: payload.family_name || "",
						idToken: localToken,
						accessToken: localToken,
						refreshToken: null,
						expiresAt: payload.exp * 1000,
					}));
					return;
				}
			}

			dispatch(logout());
		} catch (error) {
			console.error("Error en validación SSO:", error);
			localStorage.removeItem("token");
			dispatch(logout());
		}
	};

	return { status, checkAuth };
};
