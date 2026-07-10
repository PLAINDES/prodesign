import { Amplify } from "aws-amplify";

Amplify.configure({
	Auth: {
		Cognito: {
			userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || "us-east-2_czzB7rah2",
			userPoolClientId: import.meta.env.VITE_COGNITO_CLIENT_ID || "2dicm2fsk9li5cc7o73mo5kj2s",
			loginWith: {
				email: true,
			},
		},
	},
});
