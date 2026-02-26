export type EffectType = 
  | 'tuning' 
  | 'eq' 
  | 'compression' 
  | 'deesser' 
  | 'cleaning' 
  | 'saturation' 
  | 'reverb' 
  | 'delay' 
  | 'chorus' 
  | 'pan' 
  | 'stereo';

export interface EffectSettings {
  enabled: boolean;
  params: Record<string, number>;
}

export interface Track {
  id: string;
  name: string;
  type: 'lead' | 'double' | 'beat' | 'master';
  volume: number;
  pan: number;
  effects: Record<EffectType, EffectSettings>;
  audioBuffer?: AudioBuffer;
  color: string;
  isAnalyzing?: boolean;
  analysisResults?: string[];
  fileName?: string;
}

export interface ProjectState {
  tracks: Track[];
  activeTrackId: string;
  isMasteringEnabled: boolean;
}
