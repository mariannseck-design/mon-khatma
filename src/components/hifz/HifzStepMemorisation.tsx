import { useState } from 'react';
import { Volume2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import HifzStepWrapper from './HifzStepWrapper';
import StepImmersion from './istiqamah/StepImmersion';
import { RECITERS } from '@/hooks/useQuranAudio';

interface Props {
  surahNumber: number;
  startVerse: number;
  endVerse: number;
  onNext: () => void;
  onBack: () => void;
  onPause?: () => void;
  phaseLabel?: string;
}

export default function HifzStepMemorisation({ surahNumber, startVerse, endVerse, onNext, onBack, onPause, phaseLabel }: Props) {
  const [reciterId, setReciterId] = useState(() => localStorage.getItem('quran_reciter') || RECITERS[0].id);

  const handleReciterChange = (id: string) => {
    setReciterId(id);
    localStorage.setItem('quran_reciter', id);
  };

  return (
    <HifzStepWrapper stepNumber={4} stepTitle="Mémorisation" onBack={onBack} onPause={onPause} totalSteps={5} phaseLabel={phaseLabel} surahNumber={surahNumber} startVerse={startVerse} endVerse={endVerse} disableMushafOverlay>
      {/* Sélecteur de récitateur */}
      <div className="flex items-center justify-center gap-2 -mt-2 mb-2">
        <Volume2 className="h-3.5 w-3.5 shrink-0" style={{ color: 'rgba(212,175,55,0.6)' }} />
        <Select value={reciterId} onValueChange={handleReciterChange}>
          <SelectTrigger
            className="h-7 w-auto min-w-[140px] max-w-[200px] border-none bg-transparent text-xs px-2 py-0 focus:ring-0 focus:ring-offset-0"
            style={{ color: 'rgba(212,175,55,0.8)' }}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent
            className="max-h-60"
            style={{ background: '#1a2e1a', border: '1px solid rgba(212,175,55,0.3)' }}
          >
            {RECITERS.map(r => (
              <SelectItem key={r.id} value={r.id} className="text-xs" style={{ color: 'rgba(255,255,255,0.85)' }}>
                {r.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <StepImmersion
        surahNumber={surahNumber}
        verseStart={startVerse}
        verseEnd={endVerse}
        reciterId={reciterId}
        onNext={onNext}
      />
    </HifzStepWrapper>
  );
}
