import React, { useState, useRef } from "react";
import { Html, Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

export default function CostOverlay({
	position = [0, 0, 0],
	totalCost,
	totalArea,
	pabellonName,
	desglose = {},
	visible = true,
	interactive = true,
	currency = "USD",
}) {
	const [expanded, setExpanded] = useState(false);
	const [hovering, setHovering] = useState(false);
	const groupRef = useRef();

	// Animación sutil
	useFrame((state) => {
		if (groupRef.current && interactive) {
			groupRef.current.position.y =
				position[1] + Math.sin(state.clock.elapsedTime) * 2;
		}
	});

	if (!visible) return null;

	const costPerM2 = totalArea > 0 ? totalCost / totalArea : 0;

	return (
		<group ref={groupRef} position={position}>
			{/* Panel principal de costos */}
			<Html center>
				<div
					className={`
						bg-gradient-to-br from-green-500 via-green-600 to-green-700 
						text-white rounded-xl shadow-2xl border-2 border-white/20
						transition-all duration-300 transform
						${hovering ? "scale-105" : "scale-100"}
						${expanded ? "w-80" : "w-64"}
					`}
					onMouseEnter={() => setHovering(true)}
					onMouseLeave={() => setHovering(false)}
				>
					{/* Header */}
					<div className="p-4 border-b border-white/20">
						<div className="flex items-center justify-between">
							<div>
								<h3 className="font-bold text-lg">
									{pabellonName}
								</h3>
								<p className="text-green-100 text-sm">
									Análisis de Costos
								</p>
							</div>
							<div className="text-3xl">💰</div>
						</div>
					</div>

					{/* Costo principal */}
					<div className="p-4">
						<div className="text-center mb-4">
							<div className="text-3xl font-bold mb-1">
								${totalCost?.toLocaleString()} {currency}
							</div>
							<div className="text-green-100 text-sm">
								{totalArea?.toFixed(1)}m² • $
								{costPerM2?.toFixed(0)}/m²
							</div>
						</div>

						{/* Métricas rápidas */}
						<div className="grid grid-cols-2 gap-2 mb-3">
							<MetricCard
								icon="📐"
								label="Área Total"
								value={`${totalArea?.toFixed(1)}m²`}
							/>
							<MetricCard
								icon="💵"
								label="Por m²"
								value={`$${costPerM2?.toFixed(0)}`}
							/>
						</div>

						{/* Botón expandir */}
						{interactive && (
							<button
								onClick={() => setExpanded(!expanded)}
								className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
							>
								{expanded
									? "Ocultar Desglose ↑"
									: "Ver Desglose ↓"}
							</button>
						)}
					</div>

					{/* Desglose expandido */}
					{expanded && (
						<div className="p-4 border-t border-white/20 bg-black/10">
							<h4 className="font-semibold mb-3 text-center">
								Desglose por Tipo
							</h4>
							<div className="space-y-2">
								{Object.entries(desglose).map(
									([tipo, datos]) => (
										<CostBreakdownItem
											key={tipo}
											tipo={tipo}
											datos={datos}
											currency={currency}
										/>
									)
								)}
							</div>
						</div>
					)}
				</div>
			</Html>

			{/* Indicadores 3D flotantes */}
			{interactive && (
				<FloatingIndicators
					totalCost={totalCost}
					totalArea={totalArea}
					currency={currency}
				/>
			)}
		</group>
	);
}

// Tarjeta de métrica pequeña
function MetricCard({ icon, label, value }) {
	return (
		<div className="bg-white/10 rounded-lg p-2 text-center">
			<div className="text-lg mb-1">{icon}</div>
			<div className="text-xs text-green-100">{label}</div>
			<div className="font-semibold text-sm">{value}</div>
		</div>
	);
}

// Item del desglose de costos
function CostBreakdownItem({ tipo, datos, currency }) {
	const getTypeIcon = (tipo) => {
		const icons = {
			aula: "🏫",
			laboratorio: "🔬",
			biblioteca: "📚",
			taller: "🔨",
			bano: "🚻",
			cocina: "👨‍🍳",
			sum: "🎭",
			escalera: "🏗️",
			muros: "🧱",
			otros: "🏛️",
		};
		return icons[tipo] || "📦";
	};

	const percentage =
		datos.costo && datos.costo > 0
			? (datos.costo /
					Object.values(arguments[2] || {}).reduce(
						(sum, d) => sum + (d.costo || 0),
						0
					)) *
			  100
			: 0;

	return (
		<div className="flex items-center justify-between bg-white/5 rounded-lg p-2">
			<div className="flex items-center gap-2">
				<span className="text-lg">{getTypeIcon(tipo)}</span>
				<div>
					<div className="font-medium text-sm capitalize">{tipo}</div>
					<div className="text-xs text-green-100">
						{datos.cantidad || 0} × {datos.area?.toFixed(1) || 0}m²
					</div>
				</div>
			</div>
			<div className="text-right">
				<div className="font-semibold text-sm">
					${datos.costo?.toLocaleString() || 0}
				</div>
				<div className="text-xs text-green-100">
					{percentage.toFixed(1)}%
				</div>
			</div>
		</div>
	);
}

// Indicadores flotantes en 3D
function FloatingIndicators({ totalCost, totalArea, currency }) {
	const indicators = [
		{
			position: [-50, 20, 0],
			label: "Costo Total",
			value: `$${totalCost?.toLocaleString()}`,
			color: "#10b981",
		},
		{
			position: [50, 20, 0],
			label: "Área Total",
			value: `${totalArea?.toFixed(1)}m²`,
			color: "#3b82f6",
		},
		{
			position: [0, 40, 0],
			label: "Costo/m²",
			value: `$${(totalCost / totalArea)?.toFixed(0)}`,
			color: "#8b5cf6",
		},
	];

	return (
		<group>
			{indicators.map((indicator, index) => (
				<FloatingIndicator
					key={index}
					position={indicator.position}
					label={indicator.label}
					value={indicator.value}
					color={indicator.color}
				/>
			))}
		</group>
	);
}

// Indicador flotante individual
function FloatingIndicator({ position, label, value, color }) {
	const meshRef = useRef();

	useFrame((state) => {
		if (meshRef.current) {
			meshRef.current.position.y =
				position[1] +
				Math.sin(state.clock.elapsedTime + position[0] * 0.1) * 3;
		}
	});

	return (
		<group ref={meshRef} position={[position[0], position[1], position[2]]}>
			{/* Texto 3D */}
			<Text
				fontSize={12}
				color={color}
				anchorX="center"
				anchorY="middle"
				outlineWidth={2}
				outlineColor="white"
			>
				{value}
			</Text>

			{/* Etiqueta HTML */}
			<Html position={[0, -15, 0]} center>
				<div
					className="px-2 py-1 rounded text-xs font-medium text-white shadow-lg"
					style={{ backgroundColor: color }}
				>
					{label}
				</div>
			</Html>
		</group>
	);
}

// Componente compacto para la esquina
export function CompactCostOverlay({ totalCost, totalArea, currency = "USD" }) {
	return (
		<Html position={[0, 0, 0]}>
			<div className="fixed top-4 right-4 bg-green-500 text-white p-3 rounded-lg shadow-lg z-50">
				<div className="font-bold text-lg">
					${totalCost?.toLocaleString()} {currency}
				</div>
				<div className="text-sm opacity-90">
					{totalArea?.toFixed(1)}m² • $
					{(totalCost / totalArea)?.toFixed(0)}/m²
				</div>
			</div>
		</Html>
	);
}

// Hook para gestionar overlays de costo
export function useCostOverlay(initialData = {}) {
	const [costData, setCostData] = useState(initialData);
	const [visible, setVisible] = useState(true);
	const [expanded, setExpanded] = useState(false);

	const updateCosts = (newData) => {
		setCostData((prev) => ({ ...prev, ...newData }));
	};

	const toggleVisibility = () => {
		setVisible(!visible);
	};

	const toggleExpanded = () => {
		setExpanded(!expanded);
	};

	const calculateTotals = (elementos) => {
		const total = elementos.reduce((sum, elemento) => {
			return sum + (elemento.bim?.costo || 0);
		}, 0);

		const area = elementos.reduce((sum, elemento) => {
			return sum + (elemento.bim?.area || 0);
		}, 0);

		return { totalCost: total, totalArea: area };
	};

	return {
		costData,
		visible,
		expanded,
		updateCosts,
		toggleVisibility,
		toggleExpanded,
		calculateTotals,
	};
}
