// [DOCUMENTACIÓN] Módulo helper para el intercambio seguro del token con ProBudgets.
// Intenta obtener un código de intercambio de un solo uso de vida corta (60s) desde el backend.
// Si el endpoint de intercambio no está disponible (retorna error o no está configurado),
// hace fallback a pasar el token en el fragmento de la URL (#token=...) para evitar guardarlo en logs del servidor.

export const requestExchangeCode = async (jwt) => {
	const exchangeEndpoint = import.meta.env.VITE_PROBUDGETS_EXCHANGE_ENDPOINT;

	if (!exchangeEndpoint || exchangeEndpoint.includes("PLACEHOLDER") || exchangeEndpoint === "") {
		console.warn("probudgetsExchange: Endpoint de intercambio no configurado. Utilizando fallback temporal de URL fragment (#token=...).");
		return { useFallback: true };
	}

	try {
		const response = await fetch(exchangeEndpoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${jwt}`
			},
			body: JSON.stringify({ token: jwt })
		});

		if (!response.ok) {
			throw new Error(`Servidor de intercambio respondió con status ${response.status}`);
		}

		const data = await response.json();
		// Se asume que el backend retorna { exchange_code: "..." }
		return { useFallback: false, exchangeCode: data.exchange_code };
	} catch (error) {
		console.error("probudgetsExchange: Error obteniendo código de intercambio. Usando fallback temporal (#token=...). Detalle:", error);
		return { useFallback: true };
	}
};
