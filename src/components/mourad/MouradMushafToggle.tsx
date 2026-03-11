import { Image, Type, BookOpen } from 'lucide-react';

export type MushafMode = 'image' | 'text' | 'physical';

const STORAGE_KEY = 'mourad_mushaf_mode';

export function getMouradMushafMode(): MushafMode {
  return (localStorage.getItem(STORAGE_KEY) as MushafMode) || 'text';
}

export function setMouradMushafMode(mode: MushafMode) {
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

export default function MouradMushafToggle({ mode, onChange }: Props) {
  return (
    <div className="flex items-center justify-center gap-1 mx-auto" style={{ width: 'fit-content' }}>
      {BUTTONS.map(({ id, label, Icon }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"
          style={{
            background: mode === id ? 'rgba(5,150,105,0.15)' : 'rgba(0,0,0,0.04)',
            border: `1px solid ${mode === id ? 'rgba(5,150,105,0.4)' : 'rgba(0,0,0,0.08)'}`,
            color: mode === id ? '#059669' : 'rgba(0,0,0,0.4)',
          }}
        >
          <Icon className="h-3.5 w-3.5" />
          {label}
        </button>
      ))}
    </div>
  );
}
