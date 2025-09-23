declare module "three-dxf" {
	import * as THREE from "three";
	export default class ThreeDXF {
		constructor(scene: THREE.Object3D);
		export(): string;
	}
}
