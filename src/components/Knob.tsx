// src/components/Knob.jsx
import React from 'react';

export const Knob = ({ 
  label, 
  value, 
  onChange, 
  min = 0, 
  max = 127 
}) => {
  return (
    <div className="knob-container">
      <label>{label}</label>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="knob"
      />
      <span>{value}</span>
    </div>
  );
};