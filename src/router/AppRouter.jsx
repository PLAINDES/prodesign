import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuthStore } from "./../hooks/useCheckAuth";
import { CheckingAuth } from "../ui";
import { AuthRoutes } from "../auth/routes/AuthRouthes";
import { ArqPlataformRouter } from "./../app/router/ArqPlataformRouter";
import PlanIndex from "../app/Builder/PlanIndex";
import { toggleDoor, toggleWindow } from "../redux/projects/projectSlice";

export const AppRouter = () => {
	const { status, checkAuth } = useAuthStore();
	const dispatch = useDispatch();

	useEffect(() => {
		const x = JSON.parse(localStorage.getItem("load")) || [];
		console.log(x);

		for (let value of x) {
			if (value === "door") dispatch(toggleDoor());
			if (value === "window") dispatch(toggleWindow());
		}

		checkAuth();
	}, []);

	if (status === "checking") return <CheckingAuth />;


	return (
		<Routes>
			{status === "authenticated" ? (
				<Route>
					<Route
						path="/*"
						element={<ArqPlataformRouter />}
					/>
					<Route
						path="/proyecto/:slug/:id"
						element={<PlanIndex />}
					/>
				</Route>
			) : (
				<Route path="/auth/*" element={<AuthRoutes />} />
			)}
			<Route path="/*" element={<Navigate to="/auth" />} />
		</Routes>
	);
};
