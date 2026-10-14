import type { ProfileTheme } from '../types';

export const THEMES: ProfileTheme[] = [
  {
    id: 'burgundy_velvet',
    name: 'Burgundy Velvet (عنابي راقي)',
    background: 'bg-gradient-to-b from-[#25040d] via-[#160207] to-[#0a0104]',
    cardBg: 'bg-[#3b0817]/85 backdrop-blur-md hover:bg-[#500c21]/95',
    cardBorder: 'border-[#831835]/50 hover:border-[#be123c]',
    textColor: 'text-rose-50',
    accentColor: '#e11d48',
    buttonStyle: 'rounded-full',
    fontFamily: 'font-sans'
  },
  {
    id: 'cyber_emerald',
    name: 'Cyber Emerald',
    background: 'bg-gradient-to-b from-slate-950 via-slate-900 to-emerald-950',
    cardBg: 'bg-slate-900/80 backdrop-blur-md',
    cardBorder: 'border-emerald-500/30 hover:border-emerald-400/80',
    textColor: 'text-slate-100',
    accentColor: '#10b981',
    buttonStyle: 'rounded-full',
    fontFamily: 'font-sans'
  },
  {
    id: 'dark_onyx',
    name: 'Dark Onyx',
    background: 'bg-neutral-950',
    cardBg: 'bg-neutral-900/90',
    cardBorder: 'border-neutral-800 hover:border-neutral-600',
    textColor: 'text-neutral-100',
    accentColor: '#ffffff',
    buttonStyle: 'rounded-xl',
    fontFamily: 'font-sans'
  },
  {
    id: 'midnight_blue',
    name: 'Midnight Azure',
    background: 'bg-gradient-to-b from-slate-950 via-blue-950 to-indigo-950',
    cardBg: 'bg-blue-950/60 backdrop-blur-md',
    cardBorder: 'border-cyan-500/30 hover:border-cyan-400',
    textColor: 'text-blue-50',
    accentColor: '#06b6d4',
    buttonStyle: 'rounded-2xl',
    fontFamily: 'font-sans'
  },
  {
    id: 'sunset_gradient',
    name: 'Sunset Mirage',
    background: 'bg-gradient-to-b from-purple-950 via-rose-950 to-amber-950',
    cardBg: 'bg-slate-900/70 backdrop-blur-md',
    cardBorder: 'border-pink-500/40 hover:border-amber-400',
    textColor: 'text-rose-50',
    accentColor: '#f43f5e',
    buttonStyle: 'rounded-xl',
    fontFamily: 'font-sans'
  },
  {
    id: 'luxury_gold',
    name: 'Royal Obsidian',
    background: 'bg-gradient-to-b from-zinc-950 via-black to-zinc-900',
    cardBg: 'bg-zinc-900/90 backdrop-blur-md',
    cardBorder: 'border-amber-500/40 hover:border-amber-300',
    textColor: 'text-amber-50',
    accentColor: '#f59e0b',
    buttonStyle: 'rounded-lg',
    fontFamily: 'font-sans'
  },
  {
    id: 'minimal_clean',
    name: 'Alabaster Clean',
    background: 'bg-gradient-to-b from-slate-100 to-slate-200',
    cardBg: 'bg-white/95 shadow-sm',
    cardBorder: 'border-slate-200 hover:border-slate-400',
    textColor: 'text-slate-900',
    accentColor: '#0f172a',
    buttonStyle: 'rounded-xl',
    fontFamily: 'font-sans'
  },
  {
    id: 'neon_synth',
    name: 'Neon Synthwave',
    background: 'bg-gradient-to-b from-indigo-950 via-purple-900 to-pink-950',
    cardBg: 'bg-purple-950/70 backdrop-blur-md',
    cardBorder: 'border-fuchsia-500/50 hover:border-cyan-400',
    textColor: 'text-purple-100',
    accentColor: '#d946ef',
    buttonStyle: 'rounded-full',
    fontFamily: 'font-sans'
  },
  {
    id: 'glassmorphism',
    name: 'Frosted Glass',
    background: 'bg-gradient-to-tr from-sky-950 via-slate-900 to-teal-950',
    cardBg: 'bg-white/10 backdrop-blur-xl',
    cardBorder: 'border-white/20 hover:border-white/40',
    textColor: 'text-white',
    accentColor: '#38bdf8',
    buttonStyle: 'glass',
    fontFamily: 'font-sans'
  }
];

export const getThemeById = (id?: string): ProfileTheme => {
  return THEMES.find(t => t.id === id) || THEMES[0];
};
