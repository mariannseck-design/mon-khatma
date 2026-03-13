import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Info, Volume2 } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import HifzStepWrapper from '../HifzStepWrapper';
import { useIstiqamahState } from './useIstiqamahState';
import StepComprehension from './StepComprehension';
import StepImmersion from './StepImmersion';
import StepTikrarFinal from './StepTikrarFinal';
import { RECITERS } from '@/hooks/useQuranAudio';

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
  const [reciterId, setReciterId] = useState(() => localStorage.getItem('quran_reciter') || RECITERS[0].id);
  const state = useIstiqamahState(surahNumber, startVerse, endVerse);
  const { parts, loading, currentNode, next, back, currentPart, fusionParts, immersionCompleted } = state;

  const handleReciterChange = (id: string) => {
    setReciterId(id);
    localStorage.setItem('quran_reciter', id);
  };

  if (loading) {
    return (
      <HifzStepWrapper stepNumber={3} stepTitle="Istiqâmah" onBack={onBack} onPause={onPause}>
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: '#d4af37', borderTopColor: 'transparent' }} />
        </div>
      </HifzStepWrapper>
    );
  }

  const globalProps = { surahNumber, verseStart: startVerse, verseEnd: endVerse };

  const renderStep = () => {
    if (!currentNode) {
      console.log('[IstiqamahEngine] ⚠️ currentNode is null');
      return null;
    }

    console.log(`[IstiqamahEngine] 🎯 Rendering step: ${currentNode.type} (index=${state.currentNodeIndex}, immersionCompleted=${immersionCompleted})`);

    // DEFENSE IN DEPTH: If tikrar is requested but immersion wasn't completed, force immersion
    if (currentNode.type === 'tikrar' && !immersionCompleted) {
      console.warn('[IstiqamahEngine] Rendering guard: tikrar requested but immersion not completed, forcing immersion');
      return (
        <StepImmersion
          key="immersion-guard"
          {...globalProps}
          reciterId={reciterId}
          onNext={() => next('immersion')}
        />
      );
    }

    switch (currentNode.type) {
      case 'comprehension':
        return (
          <StepComprehension
            key="comprehension-global"
            {...globalProps}
            onNext={() => next('comprehension')}
          />
        );

      case 'immersion':
        return (
          <StepImmersion
            key="immersion-global"
            {...globalProps}
            reciterId={reciterId}
            onNext={() => next('immersion')}
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

  // Determine effective step for breadcrumb (accounts for rendering guard)
  const effectiveStep = (currentNode?.type === 'tikrar' && !immersionCompleted) ? 'immersion' : currentNode?.type;

  return (
    <HifzStepWrapper stepNumber={3} stepTitle="Istiqâmah" onBack={onBack} onPause={onPause}>
      <div className="text-center space-y-4">
        {/* Breadcrumb */}
        <div className="flex items-center justify-center gap-1.5">
          {(['comprehension', 'immersion', 'tikrar'] as const).map((step, i, arr) => {
            const labels = { immersion: 'Mémorisation', comprehension: 'Compréhension', tikrar: 'Tikrar' };
            const isCurrent = effectiveStep === step;
            const stepOrder = arr.indexOf(effectiveStep ?? 'comprehension');
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
                  {isCurrent && (
                    <motion.span
                      className="inline-block w-1.5 h-1.5 rounded-full mr-1 align-middle"
                      style={{ background: '#d4af37', boxShadow: '0 0 6px rgba(212,175,55,0.8)' }}
                      animate={{ opacity: [1, 0.4, 1], scale: [1, 1.3, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  )}
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
              <button className="rounded-full p-1 transition-colors hover:bg-white/10 ml-1" style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)' }}>
                <Info className="h-4 w-4" style={{ color: '#d4af37' }} />
              </button>
            </PopoverTrigger>
            <PopoverContent
              className="text-xs leading-relaxed"
              style={{ background: '#1a2e1a', border: '1px solid rgba(212,175,55,0.3)', color: 'rgba(255,255,255,0.85)' }}
            >
              L'Istiqâmah désigne la constance et la persévérance. Le parcours commence par la compréhension du sens (traduction), puis la mémorisation verset par verset (écoute, récitation de mémoire et liaison progressive), avant un compteur final de 40 répétitions.
            </PopoverContent>
          </Popover>
        </div>

        {/* Sélecteur de récitateur */}
        <div className="flex items-center justify-center gap-2">
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
                <SelectItem
                  key={r.id}
                  value={r.id}
                  className="text-xs"
                  style={{ color: 'rgba(255,255,255,0.85)' }}
                >
                  {r.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>

      </div>
    </HifzStepWrapper>
  );
}
