import { createSlice } from '@reduxjs/toolkit'

const initialState = {
	status: 'checking', //'checking','not-authenticated', 'authenticated'
	uid_master: null,
	uid: null,
	name: null,
	lastname: null,
	email: null,
	password: null,
	photoUrl: null,
	errorMessage: null,
	successMessage: "",
	authView: "login",
	authModal: false,
	// [DOCUMENTACIÓN] Campos en memoria para tokens Cognito OIDC
	idToken: null,
	accessToken: null,
	refreshToken: null,
	expiresAt: null
}

export const  authSlice = createSlice({
	name: 'auth',
	initialState,

	reducers: {
		login: (state, { payload }) => {
			state.status = "authenticated";
			state.uid_master = payload.uid_master;
			state.uid = payload.uid;
			state.name = payload.name;
			state.lastname = payload.lastname;
			state.email = payload.email;
			state.password = "";
			state.photoUrl = null;
			state.errorMessage = null;
			state.successMessage = "";
			
			// [DOCUMENTACIÓN] Guardar tokens en memoria
			state.idToken = payload.idToken || null;
			state.accessToken = payload.accessToken || null;
			state.refreshToken = payload.refreshToken || state.refreshToken || null;
			state.expiresAt = payload.expiresAt || null;
		},

		logout: (state, { payload } ) => {
			state.status = "not-authenticate";
			state.authModal = false;
			state.uid_master = null;
			state.uid = null;
			state.name = null;
			state.lastname = null;
			state.email = null;
			state.password = "";
			state.photoUrl = null;
			state.errorMessage = payload?.errorMessage;

			// [DOCUMENTACIÓN] Limpiar tokens en memoria al cerrar sesión
			state.idToken = null;
			state.accessToken = null;
			state.refreshToken = null;
			state.expiresAt = null;
		},

		updatePerfil: (state, { payload }) => {
			state.successMessage =  payload.successMessage
		},

		checkingCredentials: (state) => {
			state.status = "checking";
		},

		loginFail: (state) => {
			state.status = "not-authenticate";
			state.authModal = false;
		},

		setAuthView: (state, { payload }) => {
			state.authView = payload.authView;
		},

		setAuthModal: (state, { payload }) => {
			state.authModal = payload.authModal;
		},

		refreshTokens: (state, { payload }) => {
			// [DOCUMENTACIÓN] Actualizar tokens en memoria tras renovación exitosa (refresh token o silent renew)
			state.idToken = payload.idToken;
			state.accessToken = payload.accessToken;
			state.expiresAt = payload.expiresAt;
		}
	},
})

export const {
	login,
	logout,
	checkingCredentials,
	setAuthView,
	setAuthModal,
	loginFail,
	updatePerfil,
	refreshTokens } = authSlice.actions;
