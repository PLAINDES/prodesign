import axios from "axios";

// ENVIO DE ARCHIVOS Y DATOS ADICIONALES A UN SERVIDOR
export const readMatrizExcel = (file, data) => {
	let form = new FormData();
	form.append("file", file);
	form.append("data", data);

	return axios.post(
		// import.meta.env.VITE_API_BASE_URL + "/api/v1/admin/readMatriz",
		import.meta.env.VITE_READ_EXCEL + "/admin/readMatriz",
		form,
		{
			headers: {
				"Content-Type": "multipart/form-data",
			},
		}
	);
};
