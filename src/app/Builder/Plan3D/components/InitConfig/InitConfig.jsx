import { OBJExporter } from "three/examples/jsm/exporters/OBJExporter";
import { useThree } from "@react-three/fiber";
import CameraControls from "./CameraControls";


import "./styles.css";

export default function InitConfig({ view, sky }) {
	const gl = useThree((state) => state.gl);
	const scene = useThree((state) => state.scene);
	const camera = useThree((state) => state.camera);
	const viewport = useThree((state) => state.viewport);

	const link = document.createElement("a");

	document.getElementById("select-export").onchange = (evt) => {
		const value = evt.target.value;

		if (value === "obj") {
			const exporter = new OBJExporter();
			const data = exporter.parse(scene.getObjectByName("Pabellones"));

			const blobURL = URL.createObjectURL(
				new Blob([data], { type: "text/plain" })
			);

			link.setAttribute("href", blobURL);
			link.setAttribute("download", "test.obj");
			link.click();

			URL.revokeObjectURL(blobURL);

			evt.target.value = "EXPORTAR";
		} else if (value === "jpeg") {
			gl.render(scene, camera);

			const dataURL = gl.domElement.toDataURL("image/jpeg");

			link.setAttribute("href", dataURL);
			link.setAttribute("download", "canvas.jpeg");
			link.click();

			evt.target.value = "EXPORTAR";
		} else if (value === "json") {
			const data = scene.getObjectByName("Pabellones").toJSON();
			const str = JSON.stringify(data);

			link.setAttribute("href", "data:application/json," + str);
			link.setAttribute("download", "canvas.json");
			link.click();

			evt.target.value = "EXPORTAR";
		} 
	};

	if (view.view === "2D") gl.domElement.classList.add("cursor-cross");
	else gl.domElement.classList.remove("cursor-cross");

	return (
		<>
			<color attach="background" args={[0xebebeb]} />

			{view.view === "3D" && <primitive object={sky} />}

			<ambientLight intensity={0.5} />

			<directionalLight
				args={[0xffffff, 0.3]}
				position={[1000, 500, 2000]}
				// shadow-mapSize={[2048, 2048]}
			></directionalLight>

			<CameraControls view={view.view} />
		</>
	);
}