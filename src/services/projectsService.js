import { request } from "../utils/arqPlataformAxios";

export const getAllProjects = () => {
	return request({
		method: "GET",
		url: "/api/v1/projects",
	});
};

export const createProjectService = (body) => {
	return request({
		method: "POST",
		url: "/api/v1/projects",
		data: body,
	});
};

export const updateProjectService = (id, body) => {
	return request({
		method: "PUT",
		url: `/api/v1/projects/${id}`,
		data: body,
	});
};

export const deleteProjectService = (id, parentID) => {
	return request({
		method: "DELETE",
		url: `/api/v1/projects/${id}`,
		data: { parentID },
	});
};

export const getProjectByID = (id) => {
	return request({
		method: "GET",
		url: `/api/v1/projects/id/${id}`,
	}).then((response) => {
		console.log(response.data);
		// Verificar si existe el atributo vertices en response.data.project
		if (
			response.data &&
			response.data.project &&
			response.data.project.vertices
		) {
			// Convertir vertices a array si no lo es
			try {
				if (typeof response.data.project.vertices === "string") {
					response.data.project.vertices = JSON.parse(
						response.data.project.vertices
					);
				}
				// Asegurar que sea un array
				if (!Array.isArray(response.data.project.vertices)) {
					response.data.project.vertices = [];
				}
			} catch (error) {
				console.error("Error al procesar vertices:", error);
				response.data.project.vertices = [];
			}
		} else {
			// Si no existe vertices, inicializar como array vacío
			if (response.data && response.data.project) {
				response.data.project.vertices = [];
			}
		}

		// También procesar vertices_rectangle si existe
		if (
			response.data &&
			response.data.project &&
			response.data.project.vertices_rectangle
		) {
			try {
				if (
					typeof response.data.project.vertices_rectangle === "string"
				) {
					response.data.project.vertices_rectangle = JSON.parse(
						response.data.project.vertices_rectangle
					);
				}
				if (!Array.isArray(response.data.project.vertices_rectangle)) {
					response.data.project.vertices_rectangle = [];
				}
			} catch (error) {
				console.error("Error al procesar vertices_rectangle:", error);
				response.data.project.vertices_rectangle = [];
			}
		} else {
			if (response.data && response.data.project) {
				response.data.project.vertices_rectangle = [];
			}
		}

		// También procesar ambientes si existe
		if (
			response.data &&
			response.data.project &&
			response.data.project.ambientes
		) {
			try {
				if (typeof response.data.project.ambientes === "string") {
					response.data.project.ambientes = JSON.parse(
						response.data.project.ambientes
					);
				}
				if (!Array.isArray(response.data.project.ambientes)) {
					response.data.project.ambientes = [];
				}
			} catch (error) {
				console.error("Error al procesar ambientes:", error);
				response.data.project.ambientes = [];
			}
		} else {
			if (response.data && response.data.project) {
				response.data.project.ambientes = [];
			}
		}

		console.log(response.data);
		return response;
	});
};

export const getProjectsByUserID = (id, slug) => {
	return request({
		url: `/api/v1/projects/${id}`,
		method: "GET",
		params: {
			type_project: slug,
		},
	});
};

export const getTypeProjects = () => {
	return request({
		method: "GET",
		url: "/api/v1/typeProject",
	});
};

export const getProjectsCosts = (id) => {
	return request({
		method: "GET",
		url: `/api/v1/projects/costs/${id}`,
	});
};

export const updateProjectCostsByIDService = (id, body) => {
	return request({
		method: "PUT",
		url: `/api/v1/projects/costs/${id}`,
		data: body,
	});
};

export const createThumbnailService = (id, body) => {
	return request({
		method: "POST",
		url: `/api/v1/projects/thumbnail/${id}`,
		headers: {
			"Content-Type": "multipart/form-data",
		},
		data: body,
	});
};

export const updateCostsReference = (file) => {
	const formData = new FormData();
	formData.append("file", file);
	formData.append("data", "a");

	return request({
		method: "PUT",
		url: "/api/v1/admin/costsReference",
		headers: {
			"Content-Type": "multipart/form-data",
		},
		data: formData,
	});
};
