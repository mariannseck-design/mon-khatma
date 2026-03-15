import { Image, Type, BookOpen } from 'lucide-react';

export type MushafMode = 'image' | 'text' | 'physical';

const STORAGE_KEY = 'hifz_mushaf_mode';

export function getMushafMode(): MushafMode {
  return (localStorage.getItem(STORAGE_KEY) as MushafMode) || 'image';
}

export function setMushafMode(mode: MushafMode) {
  localStorage.setItem(STORAGE_KEY, mode);
}

interface Props {
  mode: MushafMode;
  onChange: (mode: MushafMode) => void;
}

const BUTTONS: { id: MushafMode; label: string; Icon: typeof Image }[] = [
  { id: 'image', label: 'Image', Icon: Image },
  { id: 'text', label: 'Texte', Icon: Type },
  { id: 'physical', label: 'Mon Mushaf', Icon: BookOpen },
];

export default function HifzMushafToggle({ mode, onChange }: Props) {
  return (
    <div className="flex items-center justify-center gap-1 mx-auto" style={{ width: 'fit-content' }}>
      {BUTTONS.map(({ id, label, Icon }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"
          style={{
            background: mode === id ? 'rgba(212,175,55,0.25)' : 'rgba(255,255,255,0.06)',
            border: `1px solid ${mode === id ? 'rgba(212,175,55,0.5)' : 'rgba(255,255,255,0.1)'}`,
            color: mode === id ? '#d4af37' : 'rgba(255,255,255,0.4)',
          }}
        >
          <Icon className="h-3.5 w-3.5" />
          {label}
        </button>
      ))}
    </div>
  );
}
