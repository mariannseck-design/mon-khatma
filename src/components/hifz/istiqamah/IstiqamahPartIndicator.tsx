import { Check } from 'lucide-react';
import type { Part } from './partSplitter';

interface Props {
  parts: Part[];
  activePartIndex: number;
  completedParts: Set<number>;
}

export default function IstiqamahPartIndicator({ parts, activePartIndex, completedParts }: Props) {
  if (parts.length <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-1.5 flex-wrap">
      {parts.map((part, i) => {
        const isActive = i === activePartIndex;
        const isDone = completedParts.has(i);
        return (
          <div
            key={i}
            className="flex flex-col items-center gap-0.5"
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all"
              style={{
                background: isActive
                  ? 'rgba(212,175,55,0.25)'
                  : isDone
                    ? 'rgba(212,175,55,0.12)'
                    : 'rgba(255,255,255,0.06)',
                border: isActive
                  ? '2px solid rgba(212,175,55,0.6)'
                  : isDone
                    ? '1px solid rgba(212,175,55,0.3)'
                    : '1px solid rgba(255,255,255,0.1)',
                color: isActive || isDone ? '#d4af37' : 'rgba(255,255,255,0.3)',
              }}
            >
              {isDone ? <Check className="h-3 w-3" /> : `v${part.verseStart}`}
            </div>
          </div>
        );
      })}
    </div>
  );
}
