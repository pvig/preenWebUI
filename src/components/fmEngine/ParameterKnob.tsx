// components/fmEngine/ParameterKnob.tsx

import React from 'react';
import { cn } from '../../utils/cn';

interface ParameterKnobProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  label: string;
  unit?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple';
  onChange: (value: number) => void;
  disabled?: boolean;
}

const ParameterKnob: React.FC<ParameterKnobProps> = ({
  value,
  min,
  max,
  step = 0.01,
  label,
  unit = '',
  size = 'md',
  color = 'blue',
  onChange,
  disabled = false
}) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0, value: 0 });
  const knobRef = React.useRef<HTMLDivElement>(null);

  const normalizedValue = (value - min) / (max - min);
  const angle = -140 + (normalizedValue * 280); // -140° à +140°

  const formatValue = (val: number): string => {
    if (unit === 'Hz' && val >= 1000) {
      return `${(val / 1000).toFixed(1)}k${unit}`;
    }
    if (step >= 1) {
      return `${Math.round(val)}${unit}`;
    }
    return `${val.toFixed(2)}${unit}`;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      value: value
    });
  };

  const handleMouseMove = React.useCallback((e: MouseEvent) => {
    if (!isDragging) return;

    const sensitivity = 0.5;
    const deltaY = (dragStart.y - e.clientY) * sensitivity;
    const range = max - min;
    const newValue = Math.max(min, Math.min(max, dragStart.value + (deltaY / 100) * range));
    
    const steppedValue = Math.round(newValue / step) * step;
    onChange(steppedValue);
  }, [isDragging, dragStart, min, max, step, onChange]);

  const handleMouseUp = React.useCallback(() => {
    setIsDragging(false);
  }, []);

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20'
  };

  const colorClasses = {
    blue: 'bg-blue-500 shadow-blue-500/50',
    green: 'bg-green-500 shadow-green-500/50',
    orange: 'bg-orange-500 shadow-orange-500/50',
    red: 'bg-red-500 shadow-red-500/50',
    purple: 'bg-purple-500 shadow-purple-500/50'
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <div 
        ref={knobRef}
        className={cn(
          'relative rounded-full border-2 border-gray-600 bg-gray-800 cursor-pointer select-none',
          sizeClasses[size],
          isDragging && 'scale-110',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        onMouseDown={handleMouseDown}
      >
        {/* Graduated circle */}
        <div className="absolute inset-0 rounded-full">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 40 40">
            <circle
              cx="20"
              cy="20"
              r="16"
              fill="none"
              stroke="rgb(75, 85, 99)"
              strokeWidth="2"
              strokeDasharray="2 4"
            />
          </svg>
        </div>
        
        {/* Value arc */}
        <div className="absolute inset-0 rounded-full">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 40 40">
            <circle
              cx="20"
              cy="20"
              r="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray={`${normalizedValue * 87.96} 87.96`}
              strokeLinecap="round"
              className={cn('transition-all duration-150', colorClasses[color])}
            />
          </svg>
        </div>
        
        {/* Knob indicator */}
        <div 
          className="absolute inset-2 rounded-full bg-gray-700 shadow-inner"
          style={{
            transform: `rotate(${angle}deg)`
          }}
        >
          <div className="absolute top-1 left-1/2 w-0.5 h-3 bg-white rounded-full transform -translate-x-1/2" />
        </div>
      </div>
      
      <div className="text-center">
        <div className="text-xs text-gray-400 font-medium">{label}</div>
        <div className="text-sm text-white font-mono">{formatValue(value)}</div>
      </div>
    </div>
  );
};

export default ParameterKnob;