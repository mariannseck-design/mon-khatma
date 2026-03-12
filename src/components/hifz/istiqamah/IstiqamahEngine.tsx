import { AnimatePresence, motion } from 'framer-motion';
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
        {/* Breadcrumb */}
        <div className="flex items-center justify-center gap-1.5">
          {(['immersion', 'comprehension', 'tikrar'] as const).map((step, i, arr) => {
            const labels = { immersion: 'Mémorisation', comprehension: 'Compréhension', tikrar: 'Tikrar' };
            const isCurrent = currentNode?.type === step;
            const stepOrder = arr.indexOf(currentNode?.type ?? 'immersion');
            const isDone = i < stepOrder;
            return (
              <span key={step} className="flex items-center gap-1.5">
                <motion.span
                  layout
                  initial={false}
                  animate={{
                    scale: isCurrent ? 1.15 : 1,
                    textShadow: isCurrent ? '0 0 8px rgba(212,175,55,0.6)' : '0 0 0px transparent',
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="relative text-[11px] font-semibold tracking-wide pb-1"
                  style={{
                    color: isCurrent ? '#d4af37' : isDone ? 'rgba(212,175,55,0.5)' : 'rgba(255,255,255,0.25)',
                    textDecoration: isDone ? 'line-through' : 'none',
                  }}
                >
                  {labels[step]}
                  <motion.span
                    className="absolute bottom-0 left-0 h-[2px] rounded-full"
                    style={{ background: 'linear-gradient(90deg, rgba(212,175,55,0.8), rgba(212,175,55,0.3))' }}
                    initial={false}
                    animate={{ width: isCurrent ? '100%' : '0%', opacity: isCurrent ? 1 : 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  />
                </motion.span>
                {i < arr.length - 1 && (
                  <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>›</span>
                )}
              </span>
            );
          })}
          <Popover>
            <PopoverTrigger asChild>
              <button className="rounded-full p-0.5 transition-colors hover:bg-white/10 ml-1">
                <Info className="h-3.5 w-3.5" style={{ color: 'rgba(212,175,55,0.5)' }} />
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
