import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  RespondToAuthChallengeCommand,
  SignUpCommand,
  ConfirmSignUpCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { setSSOCookie } from "./cookieHelper";

const client = new CognitoIdentityProviderClient({
  region: import.meta.env.VITE_COGNITO_REGION,
});

export async function loginWithCognito(username, password) {
  const command = new InitiateAuthCommand({
    AuthFlow: "USER_PASSWORD_AUTH",
    ClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
    AuthParameters: { USERNAME: username, PASSWORD: password },
  });

  const response = await client.send(command);

  if (response.ChallengeName) {
    return { challenge: response.ChallengeName, session: response.Session, username };
  }

  const { IdToken, AccessToken, RefreshToken } = response.AuthenticationResult;
  setSSOCookie("sso_id_token", IdToken);
  setSSOCookie("sso_refresh_token", RefreshToken);
  return { IdToken, AccessToken, RefreshToken };
}

export async function respondNewPasswordRequired(username, newPassword, session) {
  const command = new RespondToAuthChallengeCommand({
    ChallengeName: "NEW_PASSWORD_REQUIRED",
    ClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
    Session: session,
    ChallengeResponses: { USERNAME: username, NEW_PASSWORD: newPassword },
  });

  const response = await client.send(command);
  const { IdToken, AccessToken, RefreshToken } = response.AuthenticationResult;
  setSSOCookie("sso_id_token", IdToken);
  setSSOCookie("sso_refresh_token", RefreshToken);
  return { IdToken, AccessToken, RefreshToken };
}

export async function refreshCognitoSession(refreshToken) {
  const command = new InitiateAuthCommand({
    AuthFlow: "REFRESH_TOKEN_AUTH",
    ClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
    AuthParameters: { REFRESH_TOKEN: refreshToken },
  });

  const response = await client.send(command);
  if (response.ChallengeName) {
    throw new Error(`Unexpected challenge during token refresh: ${response.ChallengeName}`);
  }
  const { IdToken, AccessToken } = response.AuthenticationResult;
  setSSOCookie("sso_id_token", IdToken);
  return { IdToken, AccessToken };
}

export async function signUpCognito(username, password, name, lastname) {
  const command = new SignUpCommand({
    ClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
    Username: username,
    Password: password,
    UserAttributes: [
      { Name: "email", Value: username },
      { Name: "given_name", Value: name },
      { Name: "family_name", Value: lastname },
    ],
  });

  return await client.send(command);
}

export async function confirmSignUpCognito(username, code) {
  const command = new ConfirmSignUpCommand({
    ClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
    Username: username,
    ConfirmationCode: code,
  });

  return await client.send(command);
}
