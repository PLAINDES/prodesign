import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { startCognitoLogin } from "../../redux/auth";
import LoadingBackdrop from "../components/LoadingBackdrop";

export const CallbackPage = () => {
	const dispatch = useDispatch();
	const [searchParams] = useSearchParams();

	useEffect(() => {
		const code = searchParams.get("code");
		const returnedState = searchParams.get("state");
		const error = searchParams.get("error");
		const errorDescription = searchParams.get("error_description");

		if (code && returnedState) {
			dispatch(startCognitoLogin(code, returnedState)).then(() => {
				const cleanUrl = window.location.origin + window.location.pathname;
				window.history.replaceState({}, document.title, cleanUrl);
			});
		} else if (error) {
			console.error("OIDC Error devuelto por Cognito:", error, errorDescription);
		}
	}, []);

	return <LoadingBackdrop />;
};