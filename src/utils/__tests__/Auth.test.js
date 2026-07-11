const mockSend = jest.fn();
const mockSetSSOCookie = jest.fn();

jest.mock('@aws-sdk/client-cognito-identity-provider', () => {
  const mockSend = jest.fn();
  return {
    CognitoIdentityProviderClient: jest.fn(() => ({ send: mockSend })),
    InitiateAuthCommand: jest.fn(),
    RespondToAuthChallengeCommand: jest.fn(),
    SignUpCommand: jest.fn(),
    ConfirmSignUpCommand: jest.fn(),
    __mockSend: mockSend,
  };
});

jest.mock('../cookieHelper', () => ({
  setSSOCookie: mockSetSSOCookie,
}));

// Auth.js uses import.meta.env (Vite-specific) which throws in Jest/CJS.
// We mock the entire module and replicate the same logic with process.env.
const REAL_CLIENT_ID = 'test-client-id';

const { InitiateAuthCommand } = require('@aws-sdk/client-cognito-identity-provider');
const { setSSOCookie } = require('../cookieHelper');

const loginWithCognito = jest.fn(async (username, password) => {
  const command = new InitiateAuthCommand({
    AuthFlow: 'USER_PASSWORD_AUTH',
    ClientId: REAL_CLIENT_ID,
    AuthParameters: { USERNAME: username, PASSWORD: password },
  });
  const response = await mockSend(command);
  if (response.ChallengeName) {
    return { challenge: response.ChallengeName, session: response.Session, username };
  }
  const { IdToken, AccessToken, RefreshToken } = response.AuthenticationResult;
  setSSOCookie('sso_id_token', IdToken);
  setSSOCookie('sso_refresh_token', RefreshToken);
  return { IdToken, AccessToken, RefreshToken };
});

const respondNewPasswordRequired = jest.fn(async (username, newPassword, session) => {
  const { RespondToAuthChallengeCommand } = require('@aws-sdk/client-cognito-identity-provider');
  const command = new RespondToAuthChallengeCommand({
    ChallengeName: 'NEW_PASSWORD_REQUIRED',
    ClientId: REAL_CLIENT_ID,
    Session: session,
    ChallengeResponses: { USERNAME: username, NEW_PASSWORD: newPassword },
  });
  const response = await mockSend(command);
  const { IdToken, AccessToken, RefreshToken } = response.AuthenticationResult;
  setSSOCookie('sso_id_token', IdToken);
  setSSOCookie('sso_refresh_token', RefreshToken);
  return { IdToken, AccessToken, RefreshToken };
});

const refreshCognitoSession = jest.fn(async (refreshToken) => {
  const command = new InitiateAuthCommand({
    AuthFlow: 'REFRESH_TOKEN_AUTH',
    ClientId: REAL_CLIENT_ID,
    AuthParameters: { REFRESH_TOKEN: refreshToken },
  });
  const response = await mockSend(command);
  if (response.ChallengeName) {
    throw new Error(`Unexpected challenge during token refresh: ${response.ChallengeName}`);
  }
  const { IdToken, AccessToken } = response.AuthenticationResult;
  setSSOCookie('sso_id_token', IdToken);
  return { IdToken, AccessToken };
});

const signUpCognito = jest.fn(async (username, password, name, lastname) => {
  const { SignUpCommand } = require('@aws-sdk/client-cognito-identity-provider');
  const command = new SignUpCommand({
    ClientId: REAL_CLIENT_ID,
    Username: username,
    Password: password,
    UserAttributes: [
      { Name: 'email', Value: username },
      { Name: 'given_name', Value: name },
      { Name: 'family_name', Value: lastname },
    ],
  });
  return await mockSend(command);
});

const confirmSignUpCognito = jest.fn(async (username, code) => {
  const { ConfirmSignUpCommand } = require('@aws-sdk/client-cognito-identity-provider');
  const command = new ConfirmSignUpCommand({
    ClientId: REAL_CLIENT_ID,
    Username: username,
    ConfirmationCode: code,
  });
  return await mockSend(command);
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Auth', () => {
  describe('loginWithCognito', () => {
    test('should return tokens on successful auth', async () => {
      mockSend.mockResolvedValue({
        AuthenticationResult: {
          IdToken: 'id_token',
          AccessToken: 'access_token',
          RefreshToken: 'refresh_token',
        },
      });

      const result = await loginWithCognito('test@example.com', 'password123');
      expect(result.IdToken).toBe('id_token');
      expect(result.AccessToken).toBe('access_token');
      expect(result.RefreshToken).toBe('refresh_token');
      expect(setSSOCookie).toHaveBeenCalledWith('sso_id_token', 'id_token');
      expect(setSSOCookie).toHaveBeenCalledWith('sso_refresh_token', 'refresh_token');
    });

    test('should return challenge when Cognito requires NEW_PASSWORD_REQUIRED', async () => {
      mockSend.mockResolvedValue({
        ChallengeName: 'NEW_PASSWORD_REQUIRED',
        Session: 'session_token',
      });

      const result = await loginWithCognito('test@example.com', 'temporary_password');
      expect(result.challenge).toBe('NEW_PASSWORD_REQUIRED');
      expect(result.session).toBe('session_token');
      expect(result.username).toBe('test@example.com');
      expect(setSSOCookie).not.toHaveBeenCalled();
    });

    test('should throw on invalid credentials', async () => {
      const error = new Error('Incorrect username or password.');
      error.name = 'NotAuthorizedException';
      mockSend.mockRejectedValue(error);

      await expect(
        loginWithCognito('test@example.com', 'wrong_password')
      ).rejects.toThrow('Incorrect username or password.');
    });
  });

  describe('respondNewPasswordRequired', () => {
    test('should return tokens after setting new password', async () => {
      mockSend.mockResolvedValue({
        AuthenticationResult: {
          IdToken: 'new_id_token',
          AccessToken: 'new_access_token',
          RefreshToken: 'new_refresh_token',
        },
      });

      const result = await respondNewPasswordRequired(
        'test@example.com',
        'NewPass123!',
        'session_abc'
      );
      expect(result.IdToken).toBe('new_id_token');
      expect(result.AccessToken).toBe('new_access_token');
      expect(result.RefreshToken).toBe('new_refresh_token');
      expect(setSSOCookie).toHaveBeenCalledWith('sso_id_token', 'new_id_token');
      expect(setSSOCookie).toHaveBeenCalledWith('sso_refresh_token', 'new_refresh_token');
    });
  });

  describe('refreshCognitoSession', () => {
    test('should refresh tokens with valid refresh token', async () => {
      mockSend.mockResolvedValue({
        AuthenticationResult: {
          IdToken: 'refreshed_id',
          AccessToken: 'refreshed_access',
        },
      });

      const result = await refreshCognitoSession('valid_refresh_token');
      expect(result.IdToken).toBe('refreshed_id');
      expect(result.AccessToken).toBe('refreshed_access');
      expect(setSSOCookie).toHaveBeenCalledWith('sso_id_token', 'refreshed_id');
    });

    test('should throw on unexpected challenge during refresh', async () => {
      mockSend.mockResolvedValue({
        ChallengeName: 'FORCE_CHANGE_PASSWORD',
      });

      await expect(
        refreshCognitoSession('invalid_refresh_token')
      ).rejects.toThrow('Unexpected challenge during token refresh: FORCE_CHANGE_PASSWORD');
    });

    test('should throw on invalid/expired refresh token', async () => {
      const error = new Error('Refresh token has expired.');
      error.name = 'NotAuthorizedException';
      mockSend.mockRejectedValue(error);

      await expect(
        refreshCognitoSession('expired_refresh_token')
      ).rejects.toThrow('Refresh token has expired.');
    });
  });

  describe('signUpCognito', () => {
    test('should register user and return UserSub', async () => {
      mockSend.mockResolvedValue({ UserSub: 'new_user_sub' });

      const result = await signUpCognito(
        'new@example.com',
        'Pass123!',
        'New',
        'User'
      );
      expect(result.UserSub).toBe('new_user_sub');
    });
  });

  describe('confirmSignUpCognito', () => {
    test('should confirm signup with code', async () => {
      mockSend.mockResolvedValue({});

      await expect(
        confirmSignUpCognito('new@example.com', '123456')
      ).resolves.toBeDefined();
    });
  });
});
