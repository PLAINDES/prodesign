import { useState } from "react";

export function PropertiesPanel({ selectedElement, onUpdate, onDelete }) {
	const [isEditing, setIsEditing] = useState(false);
	const [editedName, setEditedName] = useState(selectedElement?.level || "");

	if (!selectedElement) return null;

	const handleNameSave = () => {
		onUpdate?.("name", editedName);
		setIsEditing(false);
	};

	const handleNameCancel = () => {
		setEditedName(selectedElement.level);
		setIsEditing(false);
	};

	return (
		<div
			style={{
				position: "absolute",
				top: "20px",
				right: "20px",
				width: "300px",
				background: "white",
				border: "1px solid #ddd",
				borderRadius: "8px",
				padding: "16px",
				boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
				zIndex: 1000,
			}}
		>
			<h3 style={{ margin: "0 0 16px 0", color: "#333" }}>
				Propiedades del Aula
			</h3>

			{/* Nombre editable */}
			<div style={{ marginBottom: "12px" }}>
				<label
					style={{
						display: "block",
						marginBottom: "4px",
						fontWeight: "bold",
					}}
				>
					Nombre:
				</label>
				{isEditing ? (
					<div style={{ display: "flex", gap: "8px" }}>
						<input
							type="text"
							value={editedName}
							onChange={(e) => setEditedName(e.target.value)}
							style={{
								flex: 1,
								padding: "4px 8px",
								border: "1px solid #ddd",
								borderRadius: "4px",
							}}
							autoFocus
						/>
						<button
							onClick={handleNameSave}
							style={{
								padding: "4px 8px",
								background: "#007bff",
								color: "white",
								border: "none",
								borderRadius: "4px",
							}}
						>
							✓
						</button>
						<button
							onClick={handleNameCancel}
							style={{
								padding: "4px 8px",
								background: "#6c757d",
								color: "white",
								border: "none",
								borderRadius: "4px",
							}}
						>
							✕
						</button>
					</div>
				) : (
					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
						}}
					>
						<span>{selectedElement.level}</span>
						<button
							onClick={() => setIsEditing(true)}
							style={{
								padding: "4px 8px",
								background: "#f8f9fa",
								border: "1px solid #ddd",
								borderRadius: "4px",
							}}
						>
							Editar
						</button>
					</div>
				)}
			</div>

			{/* Información del aula */}
			<div style={{ marginBottom: "12px" }}>
				<div
					style={{
						display: "flex",
						justifyContent: "space-between",
						marginBottom: "8px",
					}}
				>
					<span>
						<strong>Área:</strong>
					</span>
					<span>{selectedElement.area?.toFixed(2) || "N/A"} m²</span>
				</div>
				<div
					style={{
						display: "flex",
						justifyContent: "space-between",
						marginBottom: "8px",
					}}
				>
					<span>
						<strong>Posición:</strong>
					</span>
					<span>
						x: {selectedElement.position[0].toFixed(1)}, z:{" "}
						{selectedElement.position[2].toFixed(1)}
					</span>
				</div>
				<div
					style={{
						display: "flex",
						justifyContent: "space-between",
						marginBottom: "8px",
					}}
				>
					<span>
						<strong>Costo estimado:</strong>
					</span>
					<span>
						${selectedElement.cost?.toLocaleString() || "N/A"}
					</span>
				</div>
			</div>

			{/* Acciones */}
			<div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
				<button
					onClick={() => onUpdate?.("duplicate", selectedElement)}
					style={{
						flex: 1,
						padding: "8px",
						background: "#28a745",
						color: "white",
						border: "none",
						borderRadius: "4px",
					}}
				>
					Duplicar
				</button>
				<button
					onClick={() => onDelete?.(selectedElement)}
					style={{
						flex: 1,
						padding: "8px",
						background: "#dc3545",
						color: "white",
						border: "none",
						borderRadius: "4px",
					}}
				>
					Eliminar
				</button>
			</div>
		</div>
	);
}
