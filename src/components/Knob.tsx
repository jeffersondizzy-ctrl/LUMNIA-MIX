import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';

interface KnobProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  unit?: string;
  size?: number;
}

export const Knob: React.FC<KnobProps> = ({ 
  label, 
  value = 0, 
  min, 
  max, 
  onChange, 
  unit = '', 
  size = 60 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);
  const startValue = useRef(0);

  const rotation = ((value - min) / (max - min)) * 270 - 135;

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    startY.current = e.clientY;
    startValue.current = value;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    const deltaY = startY.current - e.clientY;
    const range = max - min;
    const sensitivity = 0.005;
    const newValue = Math.min(max, Math.max(min, startValue.current + deltaY * range * sensitivity));
    onChange(newValue);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className="flex flex-col items-center gap-2 select-none">
      <div 
        className="relative cursor-ns-resize group"
        onMouseDown={handleMouseDown}
        style={{ width: size, height: size }}
      >
        {/* Outer Ring */}
        <div className="absolute inset-0 rounded-full border border-white/5 bg-zinc-900 shadow-inner group-hover:border-pink-500/30 transition-colors" />
        
        {/* Indicator Track */}
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            strokeDasharray="264"
            strokeDashoffset={264 - (264 * (value - min)) / (max - min)}
            className="text-pink-500 transition-all duration-300 drop-shadow-[0_0_8px_rgba(255,0,127,0.6)]"
          />
        </svg>

        {/* Knob Body */}
        <motion.div 
          className="absolute inset-3 rounded-full bg-zinc-800 shadow-xl flex items-center justify-center border border-white/5"
          style={{ rotate: rotation }}
        >
          <div className="w-1 h-2 bg-blue-500 rounded-full -translate-y-2 shadow-[0_0_10px_rgba(0,242,255,0.8)]" />
        </motion.div>
      </div>
      
      <div className="flex flex-col items-center">
        <span className="text-[8px] uppercase tracking-[0.2em] text-zinc-500 font-black">{label}</span>
        <span className="text-[10px] font-mono text-zinc-300 font-bold">
          {value.toFixed(0)}{unit}
        </span>
      </div>
    </div>
  );
};
