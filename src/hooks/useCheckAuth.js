import { useDispatch, useSelector } from "react-redux";
import { login, logout, checkingCredentials } from "../redux/auth";
import { isCheckToken } from "../providers/authProvider"; // 👈 backend
import { silentLoginOnLoad } from "../redux/auth/thunks";
import { getCognitoConfig } from "../utils/oidc";

export const useAuthStore = () => {
	const { status, accessToken } = useSelector((state) => state.auth);
	const dispatch = useDispatch();

	const checkAuth = async () => {
		const config = getCognitoConfig();

		// [DOCUMENTACIÓN] Si AWS Cognito está configurado, usamos el flujo OIDC en memoria con renovación silenciosa.
		// Al recargar la página, dado que no usamos localStorage, el accessToken estará vacío e intentaremos Silent Renew.
		if (config.domain && !config.domain.includes("tu-pool-domain") && config.domain !== "") {
			if (!accessToken) {
				dispatch(silentLoginOnLoad());
			}
			return;
		}

		// [DOCUMENTACIÓN] Fallback tradicional: verificar token en localStorage en caso de no usar Cognito OIDC
		const token = localStorage.getItem("token");

		// ❌ No hay token → logout
		if (!token) {
			dispatch(logout());
			return;
		}

		try {
			dispatch(checkingCredentials());

			// ✅ Backend valida token y devuelve usuario
			const res = await isCheckToken(token);

			const { usuario } = res.data;
			const { id, id_master, name, lastname, email } = usuario;

			dispatch(
				login({
					uid: id,
					uid_master: id_master,
					name,
					lastname,
					email,
				})
			);
		} catch (error) {
			// ❌ Token inválido / expirado
			localStorage.removeItem("token");
			dispatch(logout());
		}
	};

	return { status, checkAuth };
};
