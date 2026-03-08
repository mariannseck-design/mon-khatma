import { Image, Type } from 'lucide-react';

export type MushafMode = 'image' | 'text';

const STORAGE_KEY = 'hifz_mushaf_mode';

export function getMushafMode(): MushafMode {
  return (localStorage.getItem(STORAGE_KEY) as MushafMode) || 'text';
}

export function setMushafMode(mode: MushafMode) {
  localStorage.setItem(STORAGE_KEY, mode);
}

interface Props {
  mode: MushafMode;
  onChange: (mode: MushafMode) => void;
}

export default function HifzMushafToggle({ mode, onChange }: Props) {
  return (
    <div className="flex items-center justify-center gap-1 mx-auto" style={{ width: 'fit-content' }}>
      <button
        onClick={() => onChange('image')}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
        style={{
          background: mode === 'image' ? 'rgba(212,175,55,0.25)' : 'rgba(255,255,255,0.06)',
          border: `1px solid ${mode === 'image' ? 'rgba(212,175,55,0.5)' : 'rgba(255,255,255,0.1)'}`,
          color: mode === 'image' ? '#d4af37' : 'rgba(255,255,255,0.4)',
        }}
      >
        <Image className="h-3.5 w-3.5" />
        Image
      </button>
      <button
        onClick={() => onChange('text')}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
        style={{
          background: mode === 'text' ? 'rgba(212,175,55,0.25)' : 'rgba(255,255,255,0.06)',
          border: `1px solid ${mode === 'text' ? 'rgba(212,175,55,0.5)' : 'rgba(255,255,255,0.1)'}`,
          color: mode === 'text' ? '#d4af37' : 'rgba(255,255,255,0.4)',
        }}
      >
        <Type className="h-3.5 w-3.5" />
        Texte
      </button>
    </div>
  );
}
