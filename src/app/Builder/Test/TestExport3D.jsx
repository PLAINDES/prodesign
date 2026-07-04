// exportColegioDXF.js
import * as THREE from "three";
import { DxfWriter, point3d } from "@tarikjabiri/dxf";

/**
 * Exporta las aulas como BLOQUES DXF tomando *solo* una malla por aula:
 * - selecciona el mesh con mayor volumen de bounding box dentro del group "classroom"
 * - crea un BLOCK con las 3DFACE trianguladas (relativas al punto de inserción)
 * - realiza un INSERT en la posición mundial del aula
 */
export function TestExport3D(scene, filename = "colegio_prueba1.dxf") {
	if (!scene) {
		console.error("exportColegioDXF: scene inválida");
		return;
	}

	const dxf = new DxfWriter();
	scene.updateMatrixWorld(true);

	const tmpV1 = new THREE.Vector3();
	const tmpV2 = new THREE.Vector3();
	const tmpV3 = new THREE.Vector3();
	const worldV = new THREE.Vector3();
	const box = new THREE.Box3();

	// sanitizar nombre para DXF (sin espacios ni chars raros)
	const sanitizeName = (s = "") =>
		String(s)
			.replace(/\s+/g, "_")
			.replace(/[^0-9A-Za-z_\-]/g, "")
			.slice(0, 64) || "AULA";

	// Encuentra todos los groups que son aulas
	const aulas = [];
	scene.traverse((obj) => {
		if (obj.type === "Group" && obj.userData?.type === "classroom") {
			aulas.push(obj);
		}
	});

	if (aulas.length === 0) {
		console.warn(
			"exportColegioDXF: no encontré groups con userData.type === 'classroom'"
		);
	}

	// Helper: encuentra el mesh representativo dentro del grupo (el de mayor volumen)
	function findRepresentativeMesh(group) {
		const meshes = [];
		group.traverse((c) => {
			if (
				c.isMesh &&
				c.geometry &&
				c.geometry.attributes &&
				c.geometry.attributes.position
			) {
				meshes.push(c);
			}
		});
		if (meshes.length === 0) return null;

		let best = meshes[0];
		let bestVol = 0;

		for (const m of meshes) {
			// obtener bounding box en coordenadas WORLD
			box.setFromObject(m);
			const size = new THREE.Vector3();
			box.getSize(size);
			const vol = Math.abs(size.x * size.y * size.z);
			if (vol > bestVol) {
				bestVol = vol;
				best = m;
			}
		}
		return best;
	}

	// Procesar cada aula
	aulas.forEach((aulaGroup, idx) => {
		const repMesh = findRepresentativeMesh(aulaGroup);
		if (!repMesh) {
			console.warn(
				"Aula sin mesh exportable:",
				aulaGroup.userData?.id || aulaGroup.name || idx
			);
			return;
		}

		// nombre del bloque desde userData.id o nombre
		const blockName = sanitizeName(
			aulaGroup.userData?.id || repMesh.name || `Aula_${idx}`
		);

		// obtenemos posición de inserción (centro del mesh en mundo)
		const insertPos = new THREE.Vector3();
		repMesh.getWorldPosition(insertPos);

		// crear bloque y añadir caras en coordenadas *relativas* al insertPos
		const block = dxf.addBlock(blockName);

		const geom = repMesh.geometry;
		const posAttr = geom.attributes.position;
		const idxAttr = geom.index;
		const meshMatrixWorld = repMesh.matrixWorld;

		// función para obtener coordenada local al insert (world - insertPos)
		const getLocalFromIndex = (i, outV) => {
			outV.fromBufferAttribute(posAttr, i).applyMatrix4(meshMatrixWorld);
			outV.sub(insertPos); // local coords
			return outV;
		};

		if (idxAttr) {
			// indexado (usar los indices)
			for (let i = 0; i < idxAttr.count; i += 3) {
				const a = idxAttr.getX(i);
				const b = idxAttr.getX(i + 1);
				const c = idxAttr.getX(i + 2);

				getLocalFromIndex(a, tmpV1);
				getLocalFromIndex(b, tmpV2);
				getLocalFromIndex(c, tmpV3);

				// DXF 3DFACE puede aceptar 3 o 4 vertices; repetimos el tercero como cuarto
				try {
					block.add3DFace(
						point3d(tmpV1.x, tmpV1.y, tmpV1.z),
						point3d(tmpV2.x, tmpV2.y, tmpV2.z),
						point3d(tmpV3.x, tmpV3.y, tmpV3.z),
						point3d(tmpV3.x, tmpV3.y, tmpV3.z)
					);
				} catch (e) {
					// fallback: algunas versiones aceptan add3dFace (minúsculas)
					if (typeof block.add3dFace === "function") {
						block.add3dFace(
							point3d(tmpV1.x, tmpV1.y, tmpV1.z),
							point3d(tmpV2.x, tmpV2.y, tmpV2.z),
							point3d(tmpV3.x, tmpV3.y, tmpV3.z),
							point3d(tmpV3.x, tmpV3.y, tmpV3.z)
						);
					} else {
						console.error(
							"No se pudo añadir 3DFace en block (API distinta).",
							e
						);
					}
				}
			}
		} else {
			// no indexado - asumir lista secuencial de triángulos
			for (let i = 0; i < posAttr.count; i += 3) {
				getLocalFromIndex(i, tmpV1);
				getLocalFromIndex(i + 1, tmpV2);
				getLocalFromIndex(i + 2, tmpV3);
				try {
					block.add3DFace(
						point3d(tmpV1.x, tmpV1.y, tmpV1.z),
						point3d(tmpV2.x, tmpV2.y, tmpV2.z),
						point3d(tmpV3.x, tmpV3.y, tmpV3.z),
						point3d(tmpV3.x, tmpV3.y, tmpV3.z)
					);
				} catch (e) {
					if (typeof block.add3dFace === "function") {
						block.add3dFace(
							point3d(tmpV1.x, tmpV1.y, tmpV1.z),
							point3d(tmpV2.x, tmpV2.y, tmpV2.z),
							point3d(tmpV3.x, tmpV3.y, tmpV3.z),
							point3d(tmpV3.x, tmpV3.y, tmpV3.z)
						);
					} else {
						console.error(
							"No se pudo añadir 3DFace en block (API distinta).",
							e
						);
					}
				}
			}
		}

		// insertar el bloque en la posición mundial
		dxf.addInsert(
			blockName,
			point3d(insertPos.x, insertPos.y, insertPos.z)
		);
	});

	// stringify y descarga
	let content;
	try {
		content = dxf.stringify();
	} catch (e) {
		// algunas versiones usan toDxfString
		if (typeof dxf.toDxfString === "function") {
			content = dxf.toDxfString();
		} else {
			console.error(
				"No pude obtener string DXF (dxf.stringify/toDxfString no existe).",
				e
			);
			return;
		}
	}

	const blob = new Blob([content], { type: "application/dxf" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	a.remove();
	URL.revokeObjectURL(url);
}
