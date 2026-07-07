// [DOCUMENTACIÓN] Módulo helper para implementar el flujo OIDC con Authorization Code + PKCE,
// protección anti-CSRF (state), protección anti-replay (nonce), renovación silenciosa y logout centralizado con AWS Cognito.

/**
 * Genera una cadena aleatoria criptográficamente segura.
 */
export const generateRandomString = (length = 32) => {
	const array = new Uint32Array(length);
	window.crypto.getRandomValues(array);
	return Array.from(array, dec => ('0' + dec.toString(16)).slice(-2)).join('').substring(0, length);
};

/**
 * Genera el code challenge correspondiente a partir del code verifier (SHA-256 + Base64URL).
 */
export const generateCodeChallenge = async (verifier) => {
	const encoder = new TextEncoder();
	const data = encoder.encode(verifier);
	const digest = await window.crypto.subtle.digest('SHA-256', data);
	
	// Convertir ArrayBuffer a string binario
	let binary = '';
	const bytes = new Uint8Array(digest);
	const len = bytes.byteLength;
	for (let i = 0; i < len; i++) {
		binary += String.fromCharCode(bytes[i]);
	}
	
	// Convertir a Base64URL
	return btoa(binary)
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=+$/, '');
};

/**
 * Obtiene la configuración de Cognito desde las variables de entorno.
 */
export const getCognitoConfig = () => {
	return {
		domain: import.meta.env.VITE_COGNITO_DOMAIN || '',
		clientId: import.meta.env.VITE_COGNITO_CLIENT_ID || '',
		redirectUri: import.meta.env.VITE_COGNITO_REDIRECT_URI || '',
		logoutUri: import.meta.env.VITE_COGNITO_LOGOUT_URI || '',
		scope: 'openid email profile',
	};
};

/**
 * Inicia el redireccionamiento al Hosted UI de Cognito.
 * Si promptNone es true, se intenta una renovación silenciosa.
 */
export const redirectToCognitoLogin = async (promptNone = false) => {
	const { domain, clientId, redirectUri, scope } = getCognitoConfig();
	if (!domain || !clientId || !redirectUri) {
		console.warn('OIDC: Configuración de Cognito incompleta.');
		return;
	}

	const codeVerifier = generateRandomString(64);
	const state = generateRandomString(16);
	const nonce = generateRandomString(16);

	// Almacenar en sessionStorage para validarlos a la vuelta
	sessionStorage.setItem('oidc_code_verifier', codeVerifier);
	sessionStorage.setItem('oidc_state', state);
	sessionStorage.setItem('oidc_nonce', nonce);

	const codeChallenge = await generateCodeChallenge(codeVerifier);

	let authUrl = `${domain}/oauth2/authorize?` +
		`response_type=code` +
		`&client_id=${encodeURIComponent(clientId)}` +
		`&redirect_uri=${encodeURIComponent(redirectUri)}` +
		`&scope=${encodeURIComponent(scope)}` +
		`&state=${encodeURIComponent(state)}` +
		`&nonce=${encodeURIComponent(nonce)}` +
		`&code_challenge=${encodeURIComponent(codeChallenge)}` +
		`&code_challenge_method=S256`;

	if (promptNone) {
		authUrl += '&prompt=none';
		// Para silent renew, se suele renderizar en un iframe oculto
		return authUrl;
	}

	window.location.href = authUrl;
};

/**
 * Intercambia el código de autorización por tokens de Cognito.
 */
export const exchangeCodeForTokens = async (code, codeVerifier) => {
	const { domain, clientId, redirectUri } = getCognitoConfig();
	
	const tokenUrl = `${domain}/oauth2/token`;
	const body = new URLSearchParams({
		grant_type: 'authorization_code',
		client_id: clientId,
		redirect_uri: redirectUri,
		code: code,
		code_verifier: codeVerifier
	});

	const response = await fetch(tokenUrl, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: body.toString()
	});

	if (!response.ok) {
		const err = await response.json();
		throw new Error(err.error_description || err.error || 'Error al intercambiar el código por tokens.');
	}

	return await response.json(); // Devuelve { id_token, access_token, refresh_token, expires_in }
};

/**
 * Renueva el access_token utilizando el refresh_token.
 */
export const refreshCognitoTokens = async (refreshToken) => {
	const { domain, clientId } = getCognitoConfig();
	
	const tokenUrl = `${domain}/oauth2/token`;
	const body = new URLSearchParams({
		grant_type: 'refresh_token',
		client_id: clientId,
		refresh_token: refreshToken
	});

	const response = await fetch(tokenUrl, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: body.toString()
	});

	if (!response.ok) {
		const err = await response.json();
		throw new Error(err.error_description || err.error || 'Error al renovar tokens.');
	}

	return await response.json(); // Devuelve { id_token, access_token, expires_in }
};

/**
 * Valida que el state devuelto coincida con el almacenado (Anti-CSRF).
 */
export const validateOidcState = (returnedState) => {
	const savedState = sessionStorage.getItem('oidc_state');
	return savedState && savedState === returnedState;
};

/**
 * Valida que el nonce devuelto en el ID Token coincida con el almacenado (Anti-Replay).
 */
export const validateOidcNonce = (decodedIdTokenNonce) => {
	const savedNonce = sessionStorage.getItem('oidc_nonce');
	return savedNonce && savedNonce === decodedIdTokenNonce;
};

/**
 * Desconecta la sesión en el Hosted UI de Cognito y limpia tokens locales.
 */
export const logoutFromCognito = () => {
	const { domain, clientId, logoutUri } = getCognitoConfig();
	
	// Limpieza del sessionStorage
	sessionStorage.removeItem('oidc_code_verifier');
	sessionStorage.removeItem('oidc_state');
	sessionStorage.removeItem('oidc_nonce');

	if (!domain || !clientId || !logoutUri) {
		console.warn('OIDC: Configuración de Cognito incompleta para logout.');
		window.location.href = '/auth/login';
		return;
	}

	// Redirección al endpoint de logout de Cognito
	window.location.href = `${domain}/logout?client_id=${encodeURIComponent(clientId)}&logout_uri=${encodeURIComponent(logoutUri)}`;
};

/**
 * Decodifica de forma segura el payload de un token JWT.
 */
export const parseJwt = (token) => {
	try {
		const base64Url = token.split('.')[1];
		const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
		const jsonPayload = decodeURIComponent(
			atob(base64)
				.split('')
				.map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
				.join('')
		);
		return JSON.parse(jsonPayload);
	} catch (e) {
		console.error('Error al decodificar JWT:', e);
		return null;
	}
};
