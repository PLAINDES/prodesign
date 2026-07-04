import { useEffect, useRef } from "react";

export default function CompassHUD({ rotationRef }) {
	const compassRef = useRef();

	useEffect(() => {
		let frameId;

		const update = () => {
			if (compassRef.current) {
				compassRef.current.style.transform = `rotate(${-rotationRef.current}deg)`;
			}
			frameId = requestAnimationFrame(update);
		};

		update();
		return () => cancelAnimationFrame(frameId);
	}, [rotationRef]);

	return (
		<div
			ref={compassRef}
			style={{
				position: "absolute",
				top: 20,
				left: 20,
				width: 80,
				height: 80,
				borderRadius: "50%",
				border: "2px solid #fff",
				background: "#222",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				zIndex: 2147483647,
				pointerEvents: "none",
				userSelect: "none",
			}}
		>
			<svg width="60" height="60" viewBox="0 0 60 60">
				<circle
					cx="30"
					cy="30"
					r="28"
					stroke="#fff"
					strokeWidth="3"
					fill="#222"
				/>
				<text x="26" y="18" fontSize="12" fill="#fff" fontWeight="bold">
					N
				</text>
				<text x="26" y="56" fontSize="10" fill="#fff">
					S
				</text>
				<text x="48" y="34" fontSize="10" fill="#fff">
					E
				</text>
				<text x="6" y="34" fontSize="10" fill="#fff">
					O
				</text>
				<polygon points="30,8 34,30 30,26 26,30" fill="#f00" />
			</svg>
		</div>
	);
}
