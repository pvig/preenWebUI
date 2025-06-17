import React, { useRef } from "react";

function KnobBase({
  size = 100,
  knobRadius,
  min = 0,
  max = 100,
  value,
  onChange,
  color = "#000",
  backgroundColor = "#eee",
  strokeColor = "#ccc",
  renderLabel = (val) => val,
  label = null, // <== Nouveau
}) {
  const center = size / 2;
  const radius = knobRadius ?? (center - 10);
  const tickLength = 6;
  const isDragging = useRef(false);
  const svgRef = useRef(null);

  const START_ANGLE = -135;
  const END_ANGLE = 135;
  const ANGLE_RANGE = END_ANGLE - START_ANGLE;

  value = value.toFixed(2);

  const angleForValue = (val) => {
    const ratio = (val - min) / (max - min);
    return START_ANGLE + ratio * ANGLE_RANGE;
  };

  const valueForAngle = (angle) => {
    const clamped = Math.max(START_ANGLE, Math.min(END_ANGLE, angle));
    const ratio = (clamped - START_ANGLE) / ANGLE_RANGE;
    return min + ratio * (max - min);
  };

  const getAngleFromEvent = (e) => {
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - (rect.left + center);
    const y = e.clientY - (rect.top + center);
    let angle = Math.atan2(y, x) * (180 / Math.PI);
    angle = angle + 90;
    if (angle < -180) angle += 360;
    if (angle > 180) angle -= 360;
    return angle;
  };

  const updateFromEvent = (e) => {
    const angle = getAngleFromEvent(e);
    const clampedAngle = Math.max(START_ANGLE, Math.min(END_ANGLE, angle));
    onChange(valueForAngle(clampedAngle));
  };

  const handlePointerDown = (e) => {
    e.preventDefault();
    isDragging.current = true;
    updateFromEvent(e);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  const handlePointerMove = (e) => {
    if (!isDragging.current) return;
    updateFromEvent(e);
  };

  const handlePointerUp = () => {
    isDragging.current = false;
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
  };

  const angle = angleForValue(value);
  const angleRad = (angle - 90) * (Math.PI / 180);
  const pointerX = center + radius * Math.cos(angleRad);
  const pointerY = center + radius * Math.sin(angleRad);

  const getTick = (deg) => {
    const rad = (deg - 90) * (Math.PI / 180);
    const outerX = center + radius * Math.cos(rad);
    const outerY = center + radius * Math.sin(rad);
    const innerX = center + (radius - tickLength) * Math.cos(rad);
    const innerY = center + (radius - tickLength) * Math.sin(rad);
    return { x1: innerX, y1: innerY, x2: outerX, y2: outerY };
  };

  const tickMin = getTick(START_ANGLE);
  const tickMax = getTick(END_ANGLE);

  return (
  <div
    style={{
      position: "relative",
      width: size,
      height: size,
    }}
  >
    {/* SVG du knob */}
    <svg
      ref={svgRef}
      width={size}
      height={size}
      onPointerDown={handlePointerDown}
      style={{ userSelect: "none", cursor: "pointer" }}
    >
      <circle
        cx={center}
        cy={center}
        r={radius * 1.2}
        fill="transparent"
        onPointerDown={handlePointerDown}
      />
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill={backgroundColor}
        stroke={strokeColor}
        strokeWidth="2"
      />
      <line {...tickMin} stroke="#888" strokeWidth="2" />
      <line {...tickMax} stroke="#888" strokeWidth="2" />
      <line
        x1={center}
        y1={center}
        x2={pointerX}
        y2={pointerY}
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>

    {/* Label au-dessus */}
    {label && (
      <div
        style={{
          position: "absolute",
          top: -8,
          left: 0,
          width: "100%",
          textAlign: "center",
          fontSize: 12,
          fontWeight: "bold",
          pointerEvents: "none",
        }}
      >
        {label}
      </div>
    )}

    {/* Valeur en dessous */}
    <div
      style={{
        position: "absolute",
        bottom: -8,
        left: 0,
        width: "100%",
        textAlign: "center",
        fontSize: 12,
        color: color,
        pointerEvents: "none",
      }}
    >
      {renderLabel(value)}
    </div>
  </div>

  );
}

export default React.memo(KnobBase);
