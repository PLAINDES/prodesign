import { useRef, useEffect, useMemo } from "react";
import { EdgesGeometry, LineBasicMaterial } from "three";
import { useFrame } from "@react-three/fiber";

export function SelectionOutline({
	geometry,
	color = "#00ff00",
	animated = true,
}) {
	const meshRef = useRef();
	const materialRef = useRef();

	// Crear edges geometry de manera memoizada
	const edgesGeometry = useMemo(() => {
		if (geometry) {
			try {
				return new EdgesGeometry(geometry);
			} catch (error) {
				console.warn("Error creating edges geometry:", error);
				return null;
			}
		}
		return null;
	}, [geometry]);

	// Crear material de manera memoizada
	const lineMaterial = useMemo(() => {
		return new LineBasicMaterial({
			color: color,
			linewidth: 3,
			transparent: true,
			opacity: animated ? 0.8 : 1,
			depthTest: false, // Para que siempre sea visible
			depthWrite: false,
		});
	}, [color, animated]);

	// Actualizar color cuando cambie
	useEffect(() => {
		if (materialRef.current) {
			materialRef.current.color.set(color);
		}
	}, [color]);

	// Animación de pulso para elementos seleccionados
	useFrame((state) => {
		if (animated && materialRef.current) {
			const baseOpacity = 0.7;
			const pulseAmount = 0.3;
			materialRef.current.opacity =
				baseOpacity +
				Math.sin(state.clock.elapsedTime * 4) * pulseAmount;
		} else if (!animated && materialRef.current) {
			materialRef.current.opacity = 1;
		}
	});

	// Cleanup al desmontar
	useEffect(() => {
		return () => {
			if (edgesGeometry) {
				edgesGeometry.dispose();
			}
			if (lineMaterial) {
				lineMaterial.dispose();
			}
		};
	}, [edgesGeometry, lineMaterial]);

	if (!edgesGeometry) {
		return null;
	}

	return (
		<lineSegments
			ref={meshRef}
			geometry={edgesGeometry}
			material={lineMaterial}
			renderOrder={999} // Para que se renderice por encima
		>
			<primitive ref={materialRef} object={lineMaterial} />
		</lineSegments>
	);
}
