import { useState } from "react";

// Hook para manejar las cotas
export function useDimensions() {
	const [dimensionsVisible, setDimensionsVisible] = useState(false);
	const [selectedAulaDimensions, setSelectedAulaDimensions] = useState(false);
	const [buildingDistances, setBuildingDistances] = useState(false);
	const [heightDimensions, setHeightDimensions] = useState(false);

	const toggleDimensions = () => setDimensionsVisible(!dimensionsVisible);
	const toggleSelectedAula = () =>
		setSelectedAulaDimensions(!selectedAulaDimensions);
	const toggleBuildingDistances = () =>
		setBuildingDistances(!buildingDistances);
	const toggleHeightDimensions = () => setHeightDimensions(!heightDimensions);

	return {
		dimensionsVisible,
		selectedAulaDimensions,
		buildingDistances,
		heightDimensions,
		toggleDimensions,
		toggleSelectedAula,
		toggleBuildingDistances,
		toggleHeightDimensions,
	};
}

// Componente de panel de control para las cotas
export function DimensionControls({
	dimensionsVisible,
	selectedAulaDimensions,
	buildingDistances,
	heightDimensions,
	onToggleDimensions,
	onToggleSelectedAula,
	onToggleBuildingDistances,
	onToggleHeightDimensions,
}) {
	return (
		<div
			style={{
				position: "absolute",
				top: "20px",
				left: "20px",
				background: "rgba(255, 255, 255, 0.95)",
				padding: "15px",
				borderRadius: "8px",
				boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
				zIndex: 1000,
				minWidth: "200px",
			}}
		>
			<h4 style={{ margin: "0 0 15px 0", color: "#333" }}>
				Sistema de Cotas
			</h4>

			<div
				style={{
					display: "flex",
					flexDirection: "column",
					gap: "10px",
				}}
			>
				<label
					style={{
						display: "flex",
						alignItems: "center",
						gap: "8px",
					}}
				>
					<input
						type="checkbox"
						checked={dimensionsVisible}
						onChange={onToggleDimensions}
					/>
					<span>Mostrar todas las cotas</span>
				</label>

				<label
					style={{
						display: "flex",
						alignItems: "center",
						gap: "8px",
					}}
				>
					<input
						type="checkbox"
						checked={selectedAulaDimensions}
						onChange={onToggleSelectedAula}
					/>
					<span>Cotas del aula seleccionada</span>
				</label>

				<label
					style={{
						display: "flex",
						alignItems: "center",
						gap: "8px",
					}}
				>
					<input
						type="checkbox"
						checked={buildingDistances}
						onChange={onToggleBuildingDistances}
					/>
					<span>Distancias entre edificios</span>
				</label>

				<label
					style={{
						display: "flex",
						alignItems: "center",
						gap: "8px",
					}}
				>
					<input
						type="checkbox"
						checked={heightDimensions}
						onChange={onToggleHeightDimensions}
					/>
					<span>Cotas de altura</span>
				</label>
			</div>

			<div
				style={{
					marginTop: "15px",
					padding: "10px",
					background: "#f8f9fa",
					borderRadius: "4px",
					fontSize: "12px",
					color: "#666",
				}}
			>
				💡 Tip: Selecciona un aula para ver sus dimensiones específicas
			</div>
		</div>
	);
}
