import React, { useState, useEffect, useCallback } from 'react';
import { Track, ProjectState, EffectType, EffectSettings } from './types';
import { TrackControls } from './components/TrackControls';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Music, 
  Mic2, 
  Layers, 
  Settings2, 
  Play, 
  Square, 
  Download, 
  Plus, 
  Trash2, 
  Volume2, 
  Activity,
  Sparkles,
  Search,
  User,
  Heart,
  ShoppingBag,
  ArrowRight,
  Facebook,
  Twitter,
  Instagram,
  Maximize2,
  Waves
} from 'lucide-react';
import { cn } from './utils';

const INITIAL_EFFECTS: Record<EffectType, EffectSettings> = {
  tuning: { enabled: false, params: { retune: 20, humanize: 50, scale: 0 } },
  eq: { enabled: true, params: { low: 0, mid: 0, high: 0 } },
  compression: { enabled: false, params: { threshold: -20, ratio: 4, makeup: 0 } },
  deesser: { enabled: false, params: { freq: 5000, threshold: -20, range: 6 } },
  cleaning: { enabled: false, params: { noise: 50, gate: -40, attack: 10 } },
  saturation: { enabled: false, params: { drive: 0, color: 50, output: 0 } },
  reverb: { enabled: false, params: { mix: 20, size: 50, decay: 2.5 } },
  delay: { enabled: false, params: { time: 500, feedback: 30, mix: 15 } },
  chorus: { enabled: false, params: { rate: 1.5, depth: 40, mix: 20 } },
  pan: { enabled: true, params: { value: 0 } },
  stereo: { enabled: false, params: { width: 100, spread: 50, pan: 0 } },
};

const createInitialEffects = (): Record<EffectType, EffectSettings> => {
  return JSON.parse(JSON.stringify(INITIAL_EFFECTS));
};

const INITIAL_TRACKS: Track[] = [
  { id: 'beat-1', name: 'Instrumental Beat', type: 'beat', volume: 0.8, pan: 0, effects: createInitialEffects(), color: '#0a0a0a' },
  { id: 'vocal-1', name: 'Vocal Principal', type: 'lead', volume: 0.7, pan: 0, effects: createInitialEffects(), color: '#e11d48' },
];

export default function App() {
  const [view, setView] = useState<'landing' | 'studio' | 'story'>('landing');
  const [activeTab, setActiveTab] = useState<'tracks' | 'master'>('tracks');
  const [state, setState] = useState<ProjectState>({
    tracks: INITIAL_TRACKS,
    activeTrackId: 'vocal-1',
    isMasteringEnabled: false,
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const activeTrack = state.tracks.find(t => t.id === state.activeTrackId) || state.tracks[0];

  const simulateAIAnalysis = (trackId: string) => {
    setState(prev => ({
      ...prev,
      tracks: prev.tracks.map(t => t.id === trackId ? { ...t, isAnalyzing: true, analysisResults: [] } : t)
    }));

    // Step 1: Clarity
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        tracks: prev.tracks.map(t => {
          if (t.id !== trackId) return t;
          const newEffects = { ...t.effects };
          newEffects.eq = { enabled: true, params: { low: -2, mid: 1, high: 4 } };
          return { ...t, effects: newEffects, analysisResults: [...(t.analysisResults || []), 'Clareza adicionada (EQ High Shelf)'] };
        })
      }));
    }, 1500);

    // Step 2: Compression
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        tracks: prev.tracks.map(t => {
          if (t.id !== trackId) return t;
          const newEffects = { ...t.effects };
          newEffects.compression = { enabled: true, params: { threshold: -24, ratio: 4, makeup: 3 } };
          return { ...t, effects: newEffects, analysisResults: [...(t.analysisResults || []), 'Dinâmica controlada (Compressor)'] };
        })
      }));
    }, 3000);

    // Step 3: Reverb & Delay
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        tracks: prev.tracks.map(t => {
          if (t.id !== trackId) return t;
          const newEffects = { ...t.effects };
          newEffects.reverb = { enabled: true, params: { mix: 15, size: 40, decay: 1.8 } };
          newEffects.delay = { enabled: true, params: { time: 400, feedback: 20, mix: 10 } };
          return { ...t, effects: newEffects, analysisResults: [...(t.analysisResults || []), 'Espacialidade aplicada (Reverb/Delay)'] };
        })
      }));
    }, 4500);

    // Final: Auto-Tune
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        tracks: prev.tracks.map(t => {
          if (t.id !== trackId) return t;
          const newEffects = { ...t.effects };
          newEffects.tuning = { enabled: true, params: { retune: 15, humanize: 40, scale: 0 } };
          return { ...t, isAnalyzing: false, effects: newEffects, analysisResults: [...(t.analysisResults || []), 'Afinação corrigida (Auto-Tune)'] };
        })
      }));
    }, 6000);
  };

  const handleFileUpload = (trackId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setState(prev => ({
        ...prev,
        tracks: prev.tracks.map(t => t.id === trackId ? { ...t, fileName: file.name } : t)
      }));
      simulateAIAnalysis(trackId);
    }
  };

  const addTrack = () => {
    const id = `vocal-${Date.now()}`;
    const newTrack: Track = {
      id,
      name: `Vocal ${state.tracks.filter(t => t.type !== 'beat').length + 1}`,
      type: 'lead',
      volume: 0.7,
      pan: 0,
      effects: createInitialEffects(),
      color: '#10b981'
    };
    setState(prev => ({ ...prev, tracks: [...prev.tracks, newTrack], activeTrackId: id }));
  };

  const updateEffect = useCallback((trackId: string, effect: EffectType, params: Record<string, number>) => {
    setState(prev => ({
      ...prev,
      tracks: prev.tracks.map(t => 
        t.id === trackId 
          ? { ...t, effects: { ...t.effects, [effect]: { ...t.effects[effect], params } } }
          : t
      )
    }));
  }, []);

  const toggleEffect = useCallback((trackId: string, effect: EffectType) => {
    setState(prev => ({
      ...prev,
      tracks: prev.tracks.map(t => 
        t.id === trackId 
          ? { ...t, effects: { ...t.effects, [effect]: { ...t.effects[effect], enabled: !t.effects[effect].enabled } } }
          : t
      )
    }));
  }, []);

  const updateTrackVolume = (trackId: string, volume: number) => {
    setState(prev => ({
      ...prev,
      tracks: prev.tracks.map(t => t.id === trackId ? { ...t, volume } : t)
    }));
  };

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert('Mixagem exportada com sucesso! (Simulação)');
    }, 3000);
  };

  if (view === 'story') {
    return (
      <div className="min-h-screen bg-zinc-50 text-black font-sans overflow-x-hidden">
        {/* Navigation Header (Simplified) */}
        <header className="border-b border-zinc-100 bg-zinc-50/80 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-[1400px] mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-4 cursor-pointer" onClick={() => setView('landing')}>
              <div className="w-10 h-10 bg-black flex items-center justify-center">
                <span className="text-white font-black text-2xl">L</span>
              </div>
              <span className="font-black text-3xl tracking-tighter uppercase">LUMNIA</span>
            </div>
            <div className="flex items-center gap-8">
              <button 
                onClick={() => setView('landing')}
                className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-black transition-colors"
              >
                VOLTAR AO INÍCIO
              </button>
              <button 
                onClick={() => setView('studio')}
                className="bg-black text-white px-8 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-colors"
              >
                IR PARA O ESTÚDIO
              </button>
            </div>
          </div>
        </header>

        <main className="relative">
          {/* Hero Story Section */}
          <section className="relative h-[80vh] flex items-center justify-center overflow-hidden bg-zinc-100">
            <img 
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2000&auto=format&fit=crop" 
              alt="Editorial Background"
              className="absolute inset-0 w-full h-full object-cover opacity-40"
              referrerPolicy="no-referrer"
            />
            <div className="relative z-10 text-center space-y-8 max-w-4xl px-6">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
              >
                <h2 className="text-7xl md:text-9xl editorial-title leading-none mb-4">
                  A Essência da <br /> <span className="font-sans font-black uppercase italic tracking-tighter">Tecnologia</span>
                </h2>
                <div className="w-24 h-1 bg-black mx-auto mt-8" />
              </motion.div>
            </div>
          </section>

          <section className="max-w-5xl mx-auto px-6 py-32 grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-24">
            <div className="space-y-8">
              <div className="sticky top-32">
                <p className="text-accent font-black text-xs uppercase tracking-[0.4em] mb-4">EST. 2016</p>
                <h3 className="text-6xl font-black tracking-tighter uppercase leading-[0.8]">JEFF <br /> DISS</h3>
                <div className="mt-12 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-[1px] bg-zinc-200" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">New York | Paris | Minas Gerais</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-12 text-zinc-800 text-xl leading-relaxed font-light">
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="first-letter:text-7xl first-letter:font-black first-letter:mr-3 first-letter:float-left first-letter:leading-none"
              >
                Jefferson Augusto, mais conhecido como <span className="font-bold">Jeff Diss</span>, é a mente por trás da Lumnia. Produtor musical desde 2016, sua jornada começou cedo, mergulhando no universo do Hip Hop aos 14 anos.
              </motion.p>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
              >
                Hoje, aos 28 anos, Jeff uniu sua vasta experiência de estúdio com o que há de mais moderno em tecnologia. Seu objetivo? Facilitar a vida de produtores e artistas com ferramentas de alta fidelidade que entregam produções vibrantes e únicas.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                className="py-12 border-y border-zinc-100 italic font-serif text-3xl text-zinc-500"
              >
                "A moda não é apenas sobre roupas, é sobre a história que você escolhe contar ao mundo todos os dias."
              </motion.div>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
              >
                Criando estéticas e sonoridades nunca vistas antes, Jeff Diss dedica cada detalhe à clareza e à inovação. Na Lumnia, acreditamos que a técnica deve servir à criatividade, e não o contrário.
              </motion.p>

              <button 
                onClick={() => setView('studio')}
                className="inline-flex items-center gap-4 bg-black text-white px-12 py-5 text-xs font-black uppercase tracking-widest hover:bg-zinc-800 transition-all group"
              >
                EXPLORE SEUS SONHOS
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </section>
        </main>

        <footer className="bg-zinc-50 py-24 border-t border-zinc-100">
          <div className="max-w-[1400px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-black flex items-center justify-center">
                <span className="text-white font-black text-sm">L</span>
              </div>
              <span className="font-black text-xl tracking-tighter uppercase">LUMNIA</span>
            </div>
            <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-[0.2em]">
              © 2026 LUMNIA FASHION GROUP. TODOS OS DIREITOS RESERVADOS.
            </p>
            <div className="flex items-center gap-8">
              <Instagram size={18} className="text-zinc-400 hover:text-black cursor-pointer transition-colors" />
              <Twitter size={18} className="text-zinc-400 hover:text-black cursor-pointer transition-colors" />
            </div>
          </div>
        </footer>
      </div>
    );
  }

  if (view === 'landing') {
    return (
      <div className="min-h-screen bg-zinc-50 text-black font-sans overflow-x-hidden">
        {/* Navigation Header */}
        <header className="border-b border-zinc-100 bg-zinc-50/80 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-[1400px] mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-black flex items-center justify-center">
                <span className="text-white font-black text-2xl">L</span>
              </div>
              <span className="font-black text-3xl tracking-tighter uppercase">LUMNIA</span>
            </div>

            <nav className="hidden lg:flex items-center gap-12 text-[11px] font-black uppercase tracking-[0.3em]">
              <a href="#" className="border-b-2 border-black pb-1">Início</a>
              <button onClick={() => setView('studio')} className="text-zinc-400 hover:text-black transition-colors">Estúdio</button>
              <button onClick={() => setView('story')} className="text-zinc-400 hover:text-black transition-colors">A História</button>
              <a href="#" className="text-zinc-400 hover:text-black transition-colors">Beats</a>
              <a href="#" className="text-accent">Sale</a>
            </nav>

            <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center bg-zinc-100 px-4 py-2 rounded-full gap-3">
                <Search size={14} className="text-zinc-400" />
                <input type="text" placeholder="Buscar produções..." className="bg-transparent text-[10px] font-bold uppercase tracking-widest outline-none w-32" />
              </div>
              <div className="flex items-center gap-4 text-zinc-400">
                <User size={20} className="hover:text-black cursor-pointer transition-colors" />
                <Heart size={20} className="hover:text-black cursor-pointer transition-colors" />
                <ShoppingBag size={20} className="hover:text-black cursor-pointer transition-colors" />
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative h-[85vh] flex items-center justify-center overflow-hidden bg-zinc-100">
          <img 
            src="https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=2000&auto=format&fit=crop" 
            alt="Editorial Hero"
            className="absolute inset-0 w-full h-full object-cover opacity-60"
            referrerPolicy="no-referrer"
          />
          <div className="relative z-10 text-center space-y-12 max-w-5xl px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              <h2 className="text-7xl md:text-[10rem] font-black leading-[0.8] uppercase tracking-tighter mb-4">
                O FUTURO DA <br /> <span className="editorial-title lowercase italic font-light">Mixagem começa aqui</span>
              </h2>
              <p className="text-xl md:text-2xl text-zinc-600 font-light tracking-wide">
                BRAZILIAN STYLE 2026
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <button
                onClick={() => setView('studio')}
                className="bg-white text-black border border-black px-16 py-5 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-black hover:text-white transition-all shadow-xl"
              >
                VER AGORA
              </button>
            </motion.div>
          </div>

          {/* Carousel Indicators */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-2">
            <div className="w-8 h-1 bg-black" />
            <div className="w-8 h-1 bg-zinc-200" />
          </div>
        </section>

        {/* Promo Bar */}
        <div className="bg-black py-4 overflow-hidden whitespace-nowrap">
          <div className="flex gap-24 animate-marquee">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-24 items-center text-[10px] font-black uppercase tracking-[0.3em] text-white">
                <span>🔥 MIXAGEM PARA TODOS OS ESTILOS 🔥</span>
                <span>🔥 MASTERIZAÇÃO DINÂMICA E LOUDNESS 🔥</span>
                <span>🔥 VOCAL ANALYSIS 🔥</span>
                <span>🔥 BEATS EXCLUSIVOS 🔥</span>
                <span>🔥 PROD. JEFF DISS 🔥</span>
              </div>
            ))}
          </div>
        </div>

        {/* Feature Grid */}
        <section className="py-32 bg-zinc-50">
          <div className="max-w-[1400px] mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="p-12 bg-zinc-100 border border-zinc-200 rounded-3xl space-y-8 group hover:shadow-2xl transition-all">
                <div className="w-16 h-16 bg-white flex items-center justify-center text-black group-hover:bg-black group-hover:text-white transition-all">
                  <Mic2 size={32} />
                </div>
                <h3 className="text-3xl editorial-title">Vocal Analysis</h3>
                <p className="text-zinc-500 leading-relaxed font-light">Nossa IA analisa cada nuance do seu vocal, corrigindo afinação e adicionando clareza instantaneamente.</p>
              </div>
              <div className="p-12 bg-zinc-100 border border-zinc-200 rounded-3xl space-y-8 group hover:shadow-2xl transition-all">
                <div className="w-16 h-16 bg-white flex items-center justify-center text-black group-hover:bg-black group-hover:text-white transition-all">
                  <Activity size={32} />
                </div>
                <h3 className="text-3xl editorial-title">Auto-Mix</h3>
                <p className="text-zinc-500 leading-relaxed font-light">Compressão, EQ, Reverb e Delay aplicados automaticamente com base no gênero e estilo da sua track.</p>
              </div>
              <div className="p-12 bg-zinc-100 border border-zinc-200 rounded-3xl space-y-8 group hover:shadow-2xl transition-all">
                <div className="w-16 h-16 bg-white flex items-center justify-center text-black group-hover:bg-black group-hover:text-white transition-all">
                  <Sparkles size={32} />
                </div>
                <h3 className="text-3xl editorial-title">Pro Master</h3>
                <p className="text-zinc-500 leading-relaxed font-light">Finalização com loudness competitivo para Spotify, Apple Music e YouTube. Qualidade de estúdio em casa.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Quote Section */}
        <section className="relative py-64 overflow-hidden bg-black flex items-center justify-center">
          <img 
            src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e12?q=80&w=2000&auto=format&fit=crop" 
            alt="Quote Background"
            className="absolute inset-0 w-full h-full object-cover opacity-20"
            referrerPolicy="no-referrer"
          />
          <div className="relative z-10 max-w-4xl mx-auto px-6 text-center space-y-12">
            <div className="w-16 h-[1px] bg-white mx-auto" />
            <h3 className="text-4xl md:text-6xl editorial-title text-white leading-tight">
              "faça do som você mesmo uma bela canção."
            </h3>
            <div className="space-y-2">
              <p className="text-zinc-400 text-xs font-black uppercase tracking-[0.4em]">LUMNIA JEFF DISS</p>
              <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">NEW YORK | PARIS | MINAS GERAIS</p>
            </div>
            <button 
              onClick={() => setView('studio')}
              className="bg-white text-black px-12 py-4 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-all"
            >
              EXPLORE SEUS SONHOS
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-[#1a1a1a] py-32 text-white">
          <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-24">
            <div className="space-y-12">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white flex items-center justify-center">
                  <span className="text-black font-black text-2xl">L</span>
                </div>
                <span className="font-black text-3xl tracking-tighter uppercase">LUMNIA</span>
              </div>
              <p className="text-zinc-400 text-sm leading-relaxed font-light">
                INSPIRADO NAS PRODUÇÕES AMERICANAS, a Lumnia traz o melhor DA ENGENHARIA MUSICAL COM A QUALIDADE PREMIUM.
              </p>
              <div className="flex gap-6">
                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-white hover:text-black transition-all cursor-pointer">
                  <Facebook size={18} />
                </div>
                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-white hover:text-black transition-all cursor-pointer">
                  <Twitter size={18} />
                </div>
                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-white hover:text-black transition-all cursor-pointer">
                  <Instagram size={18} />
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em]">SUPORTE</h4>
              <ul className="space-y-6 text-zinc-400 text-xs font-medium">
                <li className="hover:text-white cursor-pointer transition-colors">Rastrear Pedido</li>
                <li className="hover:text-white cursor-pointer transition-colors">Devoluções</li>
                <li className="hover:text-white cursor-pointer transition-colors">Guia de Tamanhos</li>
                <li className="hover:text-white cursor-pointer transition-colors">FAQ</li>
              </ul>
            </div>

            <div className="space-y-8">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em]">EMPRESA</h4>
              <ul className="space-y-6 text-zinc-400 text-xs font-medium">
                <li className="hover:text-white cursor-pointer transition-colors">Sobre Nós</li>
                <li className="hover:text-white cursor-pointer transition-colors">Carreiras</li>
                <li className="hover:text-white cursor-pointer transition-colors">Sustentabilidade</li>
                <li className="hover:text-white cursor-pointer transition-colors">Blog</li>
              </ul>
            </div>

            <div className="space-y-8">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em]">NEWSLETTER</h4>
              <p className="text-zinc-400 text-xs font-light">Receba ofertas exclusivas e novidades.</p>
              <div className="flex">
                <input type="text" placeholder="Seu e-mail" className="bg-zinc-800 border-none px-6 py-4 text-xs font-medium flex-1 outline-none" />
                <button className="bg-white text-black px-8 py-4 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-colors">OK</button>
              </div>
            </div>
          </div>
          
          <div className="max-w-[1400px] mx-auto px-6 pt-32 text-center">
            <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-[0.4em]">© 2026 LUMNIA FASHION GROUP. TODOS OS DIREITOS RESERVADOS.</p>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-black font-sans selection:bg-black selection:text-white">
      {/* Header */}
      <header className="border-b border-zinc-100 bg-zinc-50/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <button 
              onClick={() => setView('landing')}
              className="group flex items-center gap-4"
            >
              <div className="w-10 h-10 bg-black flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-white font-black text-2xl">L</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-3xl font-black uppercase tracking-tighter">LUMNIA</h1>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.2em]">Ateliê de Produção</p>
              </div>
            </button>

            <nav className="flex items-center gap-2 ml-8 bg-zinc-100 p-1 rounded-2xl">
              <button 
                onClick={() => setView('landing')}
                className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-black transition-all"
              >
                INÍCIO
              </button>
              <div className="w-[1px] h-4 bg-zinc-200 mx-2" />
              <button 
                onClick={() => setActiveTab('tracks')}
                className={cn(
                  "px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  activeTab === 'tracks' ? "bg-white text-black shadow-sm" : "text-zinc-400 hover:text-black"
                )}
              >
                TRACKS
              </button>
              <button 
                onClick={() => setActiveTab('master')}
                className={cn(
                  "px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  activeTab === 'master' ? "bg-white text-black shadow-sm" : "text-zinc-400 hover:text-black"
                )}
              >
                MASTER
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className={cn(
                "flex items-center gap-3 px-10 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all duration-300",
                isPlaying 
                  ? "bg-zinc-100 text-black border border-zinc-200" 
                  : "bg-black text-white shadow-2xl hover:scale-105"
              )}
            >
              {isPlaying ? <Square size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
              {isPlaying ? 'STOP' : 'PLAY MIX'}
            </button>
            
            <button 
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-3 px-10 py-3.5 rounded-2xl bg-white border border-zinc-200 text-black font-black text-[10px] uppercase tracking-widest hover:bg-zinc-50 transition-all disabled:opacity-50"
            >
              {isExporting ? <Activity className="animate-spin" size={16} /> : <Download size={16} />}
              {isExporting ? 'EXPORTING...' : 'EXPORT FINAL'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-6 lg:p-12">
        <AnimatePresence mode="wait">
          {activeTab === 'tracks' ? (
            <motion.div 
              key="tracks"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 xl:grid-cols-[1fr_450px] gap-16"
            >
              {/* Left Column: Track List */}
              <div className="space-y-12">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-8">
                  <h2 className="text-5xl editorial-title">Sessão de Mixagem</h2>
                  <button 
                    onClick={addTrack}
                    className="flex items-center gap-3 px-6 py-3 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-zinc-800"
                  >
                    <Plus size={16} /> Adicionar Track
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {state.tracks.map((track) => (
                    <div 
                      key={track.id}
                      onClick={() => setState(prev => ({ ...prev, activeTrackId: track.id }))}
                      className={cn(
                        "bg-zinc-100 p-8 rounded-[2.5rem] transition-all duration-500 cursor-pointer group relative overflow-hidden border",
                        state.activeTrackId === track.id ? "border-black shadow-2xl scale-[1.02]" : "border-zinc-200 hover:border-zinc-300"
                      )}
                    >
                      <div className="relative z-10 flex flex-col h-full justify-between gap-8">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-5">
                            <div 
                              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white"
                              style={{ backgroundColor: track.color }}
                            >
                              {track.type === 'beat' ? <Music size={28} /> : <Mic2 size={28} />}
                            </div>
                            <div>
                              <h3 className="text-2xl font-black uppercase tracking-tighter">{track.name}</h3>
                              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{track.type}</p>
                            </div>
                          </div>
                          {track.isAnalyzing && (
                            <div className="flex items-center gap-2 px-4 py-1.5 bg-black text-white rounded-full text-[8px] font-black uppercase tracking-widest animate-pulse">
                              AI Analisando...
                            </div>
                          )}
                        </div>

                        <div className="space-y-6">
                          {!track.fileName ? (
                            <div className="relative">
                              <input 
                                type="file" 
                                accept="audio/*"
                                onChange={(e) => handleFileUpload(track.id, e)}
                                className="absolute inset-0 opacity-0 cursor-pointer z-20"
                              />
                              <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-zinc-100 rounded-3xl bg-zinc-50 group-hover:bg-zinc-100 transition-colors">
                                <Plus className="text-zinc-300 mb-3" size={32} />
                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Adicionar Vocais</span>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                                <span className="text-zinc-400 truncate max-w-[180px]">{track.fileName}</span>
                                <span className="text-black">Mix Automática Ativa</span>
                              </div>
                              <div className="h-1 bg-zinc-100 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: track.isAnalyzing ? '60%' : '100%' }}
                                  className="h-full bg-black"
                                />
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {track.analysisResults?.map((res, i) => (
                                  <span key={i} className="px-3 py-1 bg-zinc-50 rounded-lg text-[8px] font-bold uppercase text-zinc-500 border border-zinc-100">
                                    {res}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: AI Controls */}
              <div className="space-y-8">
                <div className="bg-zinc-100 p-10 rounded-[3rem] sticky top-32 border border-zinc-200 shadow-xl">
                  <div className="flex items-center gap-5 mb-10">
                    <div className="p-4 bg-black rounded-2xl text-white">
                      <Activity size={28} />
                    </div>
                    <div>
                      <h2 className="text-3xl editorial-title">AI Mix Engine</h2>
                      <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">Processamento em Tempo Real</p>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="p-8 bg-zinc-50 rounded-3xl border border-zinc-100">
                      <div className="flex items-center justify-between mb-6">
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Status da Track Ativa</span>
                        <div className="w-2.5 h-2.5 rounded-full bg-black animate-pulse" />
                      </div>
                      <h4 className="text-2xl font-black uppercase tracking-tighter mb-4">{activeTrack.name}</h4>
                      <div className="space-y-3">
                        {Object.entries(activeTrack.effects).map(([key, effect]) => {
                          const settings = effect as EffectSettings;
                          return settings.enabled && (
                            <div key={key} className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                              <span className="text-zinc-400">{key}</span>
                              <span className="text-black">Optimized</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <TrackControls 
                      track={activeTrack} 
                      updateEffect={updateEffect} 
                      toggleEffect={toggleEffect} 
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="master"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-zinc-100 p-16 rounded-[4rem] text-center space-y-16 relative overflow-hidden border border-zinc-200 shadow-2xl">
                <div className="relative z-10 space-y-8">
                  <div className="w-24 h-24 bg-black rounded-[2rem] flex items-center justify-center text-white mx-auto shadow-2xl">
                    <Sparkles size={48} />
                  </div>
                  <h2 className="text-7xl editorial-title">Masterização AI</h2>
                  <p className="text-zinc-500 text-xl max-w-xl mx-auto font-light leading-relaxed">
                    O toque final profissional. Nossa IA analisa o equilíbrio tonal, dinâmica e loudness para deixar sua música pronta para o mundo.
                  </p>
                </div>

                <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-10">
                  <div className="p-10 bg-zinc-50 rounded-[2.5rem] border border-zinc-100 space-y-6 group hover:bg-black transition-all duration-500">
                    <Maximize2 className="text-black group-hover:text-white mx-auto transition-colors" size={40} />
                    <h4 className="text-sm font-black uppercase tracking-widest group-hover:text-white transition-colors">Loudness</h4>
                    <p className="text-[10px] text-zinc-400 uppercase font-bold group-hover:text-zinc-500 transition-colors">-14 LUFS Target</p>
                  </div>
                  <div className="p-10 bg-zinc-50 rounded-[2.5rem] border border-zinc-100 space-y-6 group hover:bg-black transition-all duration-500">
                    <Activity className="text-black group-hover:text-white mx-auto transition-colors" size={40} />
                    <h4 className="text-sm font-black uppercase tracking-widest group-hover:text-white transition-colors">Dynamic Range</h4>
                    <p className="text-[10px] text-zinc-400 uppercase font-bold group-hover:text-zinc-500 transition-colors">Balanced Compression</p>
                  </div>
                  <div className="p-10 bg-zinc-50 rounded-[2.5rem] border border-zinc-100 space-y-6 group hover:bg-black transition-all duration-500">
                    <Waves className="text-black group-hover:text-white mx-auto transition-colors" size={40} />
                    <h4 className="text-sm font-black uppercase tracking-widest group-hover:text-white transition-colors">Stereo Width</h4>
                    <p className="text-[10px] text-zinc-400 uppercase font-bold group-hover:text-zinc-500 transition-colors">Enhanced Image</p>
                  </div>
                </div>

                <div className="relative z-10 pt-12">
                  <button 
                    onClick={() => setState(prev => ({ ...prev, isMasteringEnabled: !prev.isMasteringEnabled }))}
                    className={cn(
                      "group relative px-16 py-8 rounded-2xl font-black uppercase tracking-[0.4em] text-xs transition-all duration-700",
                      state.isMasteringEnabled 
                        ? "bg-black text-white shadow-2xl scale-105" 
                        : "bg-white text-black border border-zinc-200 hover:border-black"
                    )}
                  >
                    {state.isMasteringEnabled ? 'MASTERIZAÇÃO ATIVA' : 'ATIVAR MASTERIZAÇÃO FINAL'}
                    <div className="absolute -inset-1 bg-black rounded-2xl blur opacity-0 group-hover:opacity-10 transition-opacity" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Status Bar */}
      <footer className="border-t border-zinc-100 bg-zinc-50/80 backdrop-blur-xl py-8 px-12">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">
          <div className="flex items-center gap-12">
            <div className="flex items-center gap-4">
              <div className="w-2.5 h-2.5 rounded-full bg-black animate-pulse" />
              <span className="text-black">AI Engine Online</span>
            </div>
            <span>48kHz / 32-bit Float</span>
            <span className="text-zinc-300">Lumnia v3.0.0</span>
          </div>
          <div className="flex items-center gap-12">
            <Instagram size={18} className="hover:text-black transition-colors cursor-pointer" />
            <Twitter size={18} className="hover:text-black transition-colors cursor-pointer" />
            <span className="text-zinc-400">© 2026 LUMNIA FASHION GROUP</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
