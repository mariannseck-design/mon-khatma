import { AnimatePresence } from 'framer-motion';
import { Info } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import HifzStepWrapper from '../HifzStepWrapper';
import { useIstiqamahState } from './useIstiqamahState';
import StepComprehension from './StepComprehension';
import StepImmersion from './StepImmersion';
import StepTikrarFinal from './StepTikrarFinal';

interface Props {
  surahNumber: number;
  startVerse: number;
  endVerse: number;
  repetitionLevel: number;
  onNext: () => void;
  onBack: () => void;
  onPause?: () => void;
}

const STEP_LABELS: Record<string, string> = {
  immersion: 'Mémorisation',
  comprehension: 'Comprendre le message',
  tikrar: 'Tikrar Final',
};

export default function IstiqamahEngine({
  surahNumber, startVerse, endVerse, repetitionLevel,
  onNext, onBack, onPause,
}: Props) {
  const state = useIstiqamahState(surahNumber, startVerse, endVerse);
  const { parts, loading, currentNode, next, back, currentPart, fusionParts } = state;

  if (loading) {
    return (
      <HifzStepWrapper stepNumber={3} stepTitle="Istiqâmah" onBack={onBack} onPause={onPause}>
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: '#d4af37', borderTopColor: 'transparent' }} />
        </div>
      </HifzStepWrapper>
    );
  }

  const stepLabel = currentNode ? STEP_LABELS[currentNode.type] || '' : '';

  // For global steps (immersion/comprehension), pass the full range
  const globalProps = { surahNumber, verseStart: startVerse, verseEnd: endVerse };

  // Verse label for per-verse steps
  const verseLabel = currentPart ? `Verset ${currentPart.verseStart}` : '';

  const renderStep = () => {
    if (!currentNode) return null;

    switch (currentNode.type) {
      case 'immersion':
        return (
          <StepImmersion
            key="immersion-global"
            {...globalProps}
            onNext={next}
          />
        );

      case 'comprehension':
        return (
          <StepComprehension
            key="comprehension-global"
            {...globalProps}
            onNext={next}
          />
        );

      case 'tikrar':
        return (
          <StepTikrarFinal
            key="tikrar"
            surahNumber={surahNumber}
            verseStart={startVerse}
            verseEnd={endVerse}
            onNext={onNext}
          />
        );

      default:
        return null;
    }
  };

  return (
    <HifzStepWrapper stepNumber={3} stepTitle="Istiqâmah" onBack={onBack} onPause={onPause}>
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <p className="text-sm font-semibold" style={{ color: '#d4af37' }}>Istiqâmah</p>
          <Popover>
            <PopoverTrigger asChild>
              <button className="rounded-full p-0.5 transition-colors hover:bg-white/10">
                <Info className="h-4 w-4" style={{ color: '#d4af37' }} />
              </button>
            </PopoverTrigger>
            <PopoverContent
              className="text-xs leading-relaxed"
              style={{ background: '#1a2e1a', border: '1px solid rgba(212,175,55,0.3)', color: 'rgba(255,255,255,0.85)' }}
            >
              L'Istiqâmah désigne la constance et la persévérance. Le parcours vous guide verset par verset : écoute, récitation de mémoire et liaison progressive, puis compréhension du sens, avant un compteur final de 40 répétitions.
            </PopoverContent>
          </Popover>
        </div>

        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>

        <p className="text-xs italic leading-relaxed" style={{ color: 'rgba(212,175,55,0.6)' }}>
          Bismillah, qu'Allah{' '}
          <span style={{ fontFamily: "'Amiri', serif", fontWeight: 'bold', fontSize: '1.1em' }}>(عز وجل)</span>
          {' '}facilite, amine.
        </p>
      </div>
    </HifzStepWrapper>
  );
}
