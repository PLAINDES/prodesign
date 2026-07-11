// [DOCUMENTACIÓN] Middleware de Redux para interceptar acciones y renovar automáticamente el token JWT
// de AWS Cognito si está a punto de expirar (menos de 2 minutos restantes).
// Esto garantiza que el token en memoria siempre sea válido durante la interacción del usuario.

import { refreshCognitoSession } from '../../utils/Auth';
import { parseJwt } from '../../utils/oidc';
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
				
				refreshPromise = refreshCognitoSession(refreshToken)
					.then(data => {
						const payload = parseJwt(data.IdToken);
						const calculatedExpiresAt = payload ? payload.exp * 1000 : Date.now() + (3600 * 1000);

						store.dispatch(refreshTokens({
							idToken: data.IdToken,
							accessToken: data.AccessToken,
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

			return refreshPromise
				.then(() => next(action))
				.catch(() => {
					console.warn("tokenRefreshMiddleware: No se pudo renovar el token. La acción no se procesó.");
				});
		}
	}

	return next(action);
};
