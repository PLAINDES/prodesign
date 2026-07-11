import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const BASE_URL_CALC = import.meta.env.VITE_API_BASE_URL_CALCULATE;

export const arqPlataformAxios = axios.create({
	baseURL: BASE_URL,
});

/**
 *
 * @param {import("axios").AxiosRequestConfig } param0
 * @returns
 */
export const request = async ({ ...options }) => {
	const token = localStorage.getItem("token");
	if (token) {
		arqPlataformAxios.defaults.headers.common.Authorization = `Bearer ${token}`;
	}

	const onSuccess = (response) => response;
	const onError = (error) => {
		error.error = true;
		return error;
	};

	try {
		const response = await arqPlataformAxios(options);
		return onSuccess(response);
	} catch (error) {
		return onError(error);
	}
};

export const arqPlataformAxiosCalc = axios.create({
	baseURL: BASE_URL_CALC,
});

/**
 *
 * @param {import("axios").AxiosRequestConfig } param0
 * @returns
 */
export const requestCalc = async (options) => {
    const token = localStorage.getItem("token");

    const config = {
        ...options,
        headers: {
            ...options?.headers,
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    };

    const onSuccess = (response) => response;
    const onError = (error) => {
        console.error("Error en la petición:", error.response || error);
        error.error = true;
        return error;
    };

    try {
        const response = await arqPlataformAxiosCalc(config);
        return onSuccess(response);
    } catch (error) {
        return onError(error);
    }

    // Nota: Se eliminó la mutación de arqPlataformAxiosCalc.defaults.headers.common
    // para evitar condiciones de carrera con tokens caducados/renovados.
};
