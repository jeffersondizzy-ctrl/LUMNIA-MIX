import React from 'react';
import { Track, EffectType } from '../types';
import { Knob } from './Knob';
import { motion } from 'motion/react';
import { Power, Sliders, Waves, Activity, Zap, Wind, Radio, Maximize2, Layers } from 'lucide-react';

interface TrackControlsProps {
  track: Track;
  updateEffect: (trackId: string, effect: EffectType, params: Record<string, number>) => void;
  toggleEffect: (trackId: string, effect: EffectType) => void;
}

export const TrackControls: React.FC<TrackControlsProps> = ({ track, updateEffect, toggleEffect }) => {
  const renderEffectSection = (
    type: EffectType, 
    label: string, 
    icon: React.ReactNode, 
    controls: { label: string; param: string; min: number; max: number; unit?: string }[]
  ) => {
    const settings = track.effects[type];
    return (
      <div className={`p-5 rounded-2xl border transition-all duration-500 ${
        settings.enabled 
          ? 'bg-pink-500/5 border-pink-500/20 shadow-[0_0_30px_rgba(255,0,127,0.05)]' 
          : 'bg-white/5 border-white/5 opacity-40 grayscale'
      }`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl transition-colors ${settings.enabled ? 'bg-pink-500 text-black' : 'bg-zinc-800 text-zinc-500'}`}>
              {icon}
            </div>
            <div>
              <span className="text-xs font-black tracking-[0.2em] text-zinc-200 uppercase">{label}</span>
              {settings.enabled && (
                <p className="text-[8px] font-black text-pink-500 uppercase tracking-widest mt-0.5">AI Optimized</p>
              )}
            </div>
          </div>
          <button 
            onClick={() => toggleEffect(track.id, type)}
            className={`p-2 rounded-lg transition-all ${
              settings.enabled 
                ? 'bg-pink-500 text-black shadow-[0_0_15px_rgba(255,0,127,0.4)]' 
                : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700'
            }`}
          >
            <Power size={14} />
          </button>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          {controls.map((c) => (
            <Knob
              key={c.param}
              label={c.label}
              value={settings.params[c.param] || 0}
              min={c.min}
              max={c.max}
              unit={c.unit}
              size={45}
              onChange={(val) => updateEffect(track.id, type, { ...settings.params, [c.param]: val })}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
    >
      {renderEffectSection('tuning', 'Auto-Tune', <Activity size={16} />, [
        { label: 'Retune', param: 'retune', min: 0, max: 100, unit: 'ms' },
        { label: 'Human', param: 'humanize', min: 0, max: 100, unit: '%' },
        { label: 'Scale', param: 'scale', min: 0, max: 12 },
      ])}
      
      {renderEffectSection('eq', 'Equalizer', <Sliders size={16} />, [
        { label: 'Low', param: 'low', min: -12, max: 12, unit: 'dB' },
        { label: 'Mid', param: 'mid', min: -12, max: 12, unit: 'dB' },
        { label: 'High', param: 'high', min: -12, max: 12, unit: 'dB' },
      ])}

      {renderEffectSection('compression', 'Compressor', <Zap size={16} />, [
        { label: 'Thresh', param: 'threshold', min: -60, max: 0, unit: 'dB' },
        { label: 'Ratio', param: 'ratio', min: 1, max: 20 },
        { label: 'Gain', param: 'makeup', min: 0, max: 24, unit: 'dB' },
      ])}

      {renderEffectSection('reverb', 'Reverb', <Waves size={16} />, [
        { label: 'Mix', param: 'mix', min: 0, max: 100, unit: '%' },
        { label: 'Size', param: 'size', min: 0, max: 100, unit: '%' },
        { label: 'Decay', param: 'decay', min: 0.1, max: 10, unit: 's' },
      ])}
    </motion.div>
  );
};
