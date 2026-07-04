import { useState, useCallback } from "react";

export function useSelection() {
	const [selectedElement, setSelectedElement] = useState(null);
	const [hoveredElement, setHoveredElement] = useState(null);

	const selectElement = useCallback((element) => {
		setSelectedElement(element);
	}, []);

	const clearSelection = useCallback(() => {
		setSelectedElement(null);
	}, []);

	const hoverElement = useCallback((element) => {
		setHoveredElement(element);
	}, []);

	const clearHover = useCallback(() => {
		setHoveredElement(null);
	}, []);

	return {
		selectedElement,
		hoveredElement,
		selectElement,
		clearSelection,
		hoverElement,
		clearHover,
	};
}
