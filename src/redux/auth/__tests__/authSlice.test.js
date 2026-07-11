import { authSlice } from '../authSlice';
const { reducer: authReducer } = authSlice;
const { login, logout, checkingCredentials, loginFail, updatePerfil, refreshTokens } = authSlice.actions;

const initialState = {
  status: 'checking',
  uid_master: null,
  uid: null,
  name: null,
  lastname: null,
  email: null,
  password: null,
  photoUrl: null,
  errorMessage: null,
  successMessage: '',
  authView: 'login',
  authModal: false,
  idToken: null,
  accessToken: null,
  refreshToken: null,
  expiresAt: null,
};

describe('authSlice', () => {
  test('should return initial state', () => {
    const state = authReducer(undefined, { type: 'unknown' });
    expect(state.status).toBe('checking');
  });

  describe('login reducer', () => {
    test('should set authenticated status with user data', () => {
      const payload = {
        uid_master: 'abc123',
        uid: 456,
        name: 'Test',
        lastname: 'User',
        email: 'test@example.com',
        idToken: 'id_token_123',
        accessToken: 'access_token_456',
        refreshToken: 'refresh_token_789',
        expiresAt: 9999999999000,
      };
      const state = authReducer(initialState, login(payload));
      expect(state.status).toBe('authenticated');
      expect(state.uid_master).toBe('abc123');
      expect(state.uid).toBe(456);
      expect(state.name).toBe('Test');
      expect(state.lastname).toBe('User');
      expect(state.email).toBe('test@example.com');
      expect(state.idToken).toBe('id_token_123');
      expect(state.accessToken).toBe('access_token_456');
      expect(state.refreshToken).toBe('refresh_token_789');
    });

    test('should set empty password on login', () => {
      const state = authReducer(initialState, login({ name: 'Test', email: 'test@example.com' }));
      expect(state.password).toBe('');
    });

    test('should preserve existing refreshToken if payload does not provide one', () => {
      const stateWithRefresh = authReducer(initialState, login({ refreshToken: 'existing_refresh' }));
      const updated = authReducer(stateWithRefresh, login({ name: 'New' }));
      expect(updated.refreshToken).toBe('existing_refresh');
    });
  });

  describe('logout reducer', () => {
    test('should reset to not-authenticated and clear all data', () => {
      const authenticatedState = authReducer(initialState, login({
        uid_master: 'abc',
        uid: 1,
        name: 'Test',
        lastname: 'User',
        email: 'test@example.com',
        idToken: 'token',
      }));
      const state = authReducer(authenticatedState, logout());
      expect(state.status).toBe('not-authenticated');
      expect(state.uid).toBeNull();
      expect(state.name).toBeNull();
      expect(state.email).toBeNull();
      expect(state.idToken).toBeNull();
      expect(state.accessToken).toBeNull();
      expect(state.refreshToken).toBeNull();
    });

    test('should store errorMessage from payload', () => {
      const state = authReducer(initialState, logout({ errorMessage: 'Session expired' }));
      expect(state.errorMessage).toBe('Session expired');
    });
  });

  describe('checkingCredentials reducer', () => {
    test('should set status to checking', () => {
      const state = authReducer({ ...initialState, status: 'authenticated' }, checkingCredentials());
      expect(state.status).toBe('checking');
    });
  });

  describe('loginFail reducer', () => {
    test('should set status to not-authenticated', () => {
      const state = authReducer({ ...initialState, status: 'checking' }, loginFail());
      expect(state.status).toBe('not-authenticated');
    });
  });

  describe('updatePerfil reducer', () => {
    test('should update user fields and successMessage', () => {
      const currentState = authReducer(initialState, login({
        uid: 1,
        uid_master: 'master1',
        name: 'Old',
        lastname: 'Name',
        email: 'old@example.com',
      }));
      const state = authReducer(currentState, updatePerfil({
        uid: 2,
        uid_master: 'master2',
        name: 'New',
        lastname: 'Name2',
        email: 'new@example.com',
        successMessage: 'Updated successfully',
      }));
      expect(state.uid).toBe(2);
      expect(state.uid_master).toBe('master2');
      expect(state.name).toBe('New');
      expect(state.lastname).toBe('Name2');
      expect(state.email).toBe('new@example.com');
      expect(state.successMessage).toBe('Updated successfully');
    });

    test('should not overwrite fields with undefined', () => {
      const currentState = authReducer(initialState, login({
        uid: 1,
        name: 'Keep',
        email: 'keep@example.com',
      }));
      const state = authReducer(currentState, updatePerfil({ successMessage: 'OK' }));
      expect(state.uid).toBe(1);
      expect(state.name).toBe('Keep');
      expect(state.email).toBe('keep@example.com');
    });
  });

  describe('refreshTokens reducer', () => {
    test('should update idToken, accessToken and expiresAt', () => {
      const currentState = authReducer(initialState, login({
        idToken: 'old_id',
        accessToken: 'old_access',
        expiresAt: 1000,
      }));
      const state = authReducer(currentState, refreshTokens({
        idToken: 'new_id',
        accessToken: 'new_access',
        expiresAt: 9999999999000,
      }));
      expect(state.idToken).toBe('new_id');
      expect(state.accessToken).toBe('new_access');
      expect(state.expiresAt).toBe(9999999999000);
    });
  });
});
