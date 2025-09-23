export function calculateArea(classroom) {
	// Asumiendo dimensiones estándar, puedes ajustar según tus datos reales
	const width = classroom.walls?.width || 8; // metros
	const length = classroom.walls?.length || 7.2; // metros
	return width * length;
}

export function calculateCost(classroom) {
	const area = calculateArea(classroom);
	const costPerM2 = 800; // USD por m², ajustable
	return area * costPerM2;
}

// Ejemplo de uso en tu componente principal
export function ExampleUsage() {
	const { selectedElement, selectElement, clearSelection } = useSelection();

	const handleUpdate = (field, value) => {
		console.log("Actualizando:", field, value);
		// Aquí actualizarías el estado de tu aplicación
	};

	const handleDelete = (element) => {
		if (confirm(`¿Estás seguro de eliminar el aula "${element.level}"?`)) {
			console.log("Eliminando:", element);
			clearSelection();
			// Aquí eliminarías el elemento del estado
		}
	};

	return (
		<>
			{/* Tu Canvas y escena 3D */}
			<Canvas>
				{/* Tus pabellones con InteractiveClassroom en lugar de ClassroomGroup */}
			</Canvas>

			{/* Panel de propiedades */}
			<PropertiesPanel
				selectedElement={selectedElement}
				onUpdate={handleUpdate}
				onDelete={handleDelete}
			/>
		</>
	);
}
