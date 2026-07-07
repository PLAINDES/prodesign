// [DOCUMENTACIÓN] Middleware de Redux para interceptar acciones y renovar automáticamente el token JWT
// de AWS Cognito si está a punto de expirar (menos de 2 minutos restantes).
// Esto garantiza que el token en memoria siempre sea válido durante la interacción del usuario.

import { refreshCognitoTokens } from '../../utils/oidc';
import { refreshTokens, logout } from './authSlice';

let isRefreshing = false;
let refreshPromise = null;

export const tokenRefreshMiddleware = store => next => action => {
	// Evitar interceptar acciones propias del estado de autenticación para prevenir bucles
	if (
		action.type === 'auth/refreshTokens' || 
		action.type === 'auth/logout' ||
		action.type === 'auth/checkingCredentials' ||
		action.type === 'auth/loginFail'
	) {
		return next(action);
	}

	const state = store.getState();
	const { status, refreshToken, expiresAt } = state.auth;

	if (status === 'authenticated' && refreshToken && expiresAt) {
		const now = Date.now();
		const timeUntilExpiry = expiresAt - now;

		// Si el token expira en menos de 2 minutos (120,000 ms), iniciamos el refresco
		if (timeUntilExpiry < 120000) {
			if (!isRefreshing) {
				isRefreshing = true;
				console.log('tokenRefreshMiddleware: El token de acceso expira pronto. Renovando sesión en segundo plano...');
				
				refreshPromise = refreshCognitoTokens(refreshToken)
					.then(data => {
						const { id_token, access_token, expires_in } = data;
						const calculatedExpiresAt = Date.now() + (expires_in * 1000);
						
						store.dispatch(refreshTokens({
							idToken: id_token,
							accessToken: access_token,
							expiresAt: calculatedExpiresAt
						}));
						
						isRefreshing = false;
						return data;
					})
					.catch(err => {
						console.error('tokenRefreshMiddleware: Error crítico al renovar el token de Cognito:', err);
						isRefreshing = false;
						
						store.dispatch(logout({ 
							errorMessage: 'Tu sesión ha expirado y no se pudo renovar automáticamente. Por favor, inicia sesión de nuevo.' 
						}));
						
						throw err;
					});
			}

			// Pausar y esperar a que la renovación de tokens se complete antes de despachar la acción original
			return refreshPromise
				.then(() => next(action))
				.catch(() => {
					// Si falla, la sesión se limpia y no se procesa la acción original
				});
		}
	}

	return next(action);
};
