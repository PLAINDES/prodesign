import {
	useEffect,
	Suspense,
	useMemo,
	useState,
	useCallback,
	useRef,
} from "react";
import TerrainPlanner from "./TerrainPlanner";

export default function Plan3D({ state, view, aspect, height }) {
	
	return (
		<>
			{/* <div
				ref={containerRef}
				style={{ width: "100%", height: "100vh" }}
			/> */}
			<TerrainPlanner state={state} height={height} />
		</>
	)
}
