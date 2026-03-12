import { useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import HifzStepWrapper from '../HifzStepWrapper';
import { useIstiqamahState } from './useIstiqamahState';
import IstiqamahProgressBar from './IstiqamahProgressBar';
import IstiqamahPartIndicator from './IstiqamahPartIndicator';
import StepComprehension from './StepComprehension';
import StepImmersion from './StepImmersion';
import StepImpregnation from './StepImpregnation';
import StepAutonomie from './StepAutonomie';
import StepGravure from './StepGravure';
import StepFusion from './StepFusion';
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
  immersion: 'Préparer l\'oreille',
  comprehension: 'Comprendre le message',
  impregnation: 'Imprégnation',
  autonomie: 'Récitation assistée',
  gravure: 'Essai de mémoire',
  fusion: 'Créer le lien',
  tikrar: 'Tikrar Final',
};

export default function IstiqamahEngine({
  surahNumber, startVerse, endVerse, repetitionLevel,
  onNext, onBack, onPause,
}: Props) {
  const state = useIstiqamahState(surahNumber, startVerse, endVerse);
  const { parts, loading, currentNode, progress, next, back, currentPart, fusionParts, currentNodeIndex, totalNodes } = state;

  const completedParts = useMemo(() => {
    const set = new Set<number>();
    if (!currentNode) return set;
    for (let i = 0; i < parts.length; i++) {
      if (currentNode.partIndex > i) set.add(i);
      if (currentNode.type === 'fusion' && currentNode.fusionRange) {
        for (const idx of currentNode.fusionRange) {
          if (idx < (currentNode.fusionRange[currentNode.fusionRange.length - 1])) set.add(idx);
        }
      }
      if (currentNode.type === 'tikrar') set.add(i);
    }
    return set;
  }, [currentNode, parts]);

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

      case 'impregnation':
        return currentPart ? (
          <StepImpregnation
            key={`imp-${currentPart.partIndex}`}
            surahNumber={currentPart.surahNumber}
            verseStart={currentPart.verseStart}
            verseEnd={currentPart.verseEnd}
            verseLabel={verseLabel}
            onNext={next}
          />
        ) : null;

      case 'autonomie':
        return currentPart ? (
          <StepAutonomie
            key={`aut-${currentPart.partIndex}`}
            surahNumber={currentPart.surahNumber}
            verseStart={currentPart.verseStart}
            verseEnd={currentPart.verseEnd}
            verseLabel={verseLabel}
            onNext={next}
          />
        ) : null;

      case 'gravure':
        return currentPart ? (
          <StepGravure
            key={`grav-${currentPart.partIndex}`}
            surahNumber={currentPart.surahNumber}
            verseStart={currentPart.verseStart}
            verseEnd={currentPart.verseEnd}
            verseLabel={verseLabel}
            onNext={next}
          />
        ) : null;

      case 'fusion':
        return (
          <StepFusion
            key={`fus-${currentNodeIndex}`}
            parts={fusionParts}
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
              L'Istiqâmah désigne la constance et la persévérance. Le parcours commence par l'écoute et la compréhension du passage, puis vous guide verset par verset à travers l'imprégnation, la lecture autonome et la récitation de mémoire, en fusionnant progressivement les versets avant un compteur final de 40 répétitions.
            </PopoverContent>
          </Popover>
        </div>

        <IstiqamahProgressBar
          progress={progress}
          currentStep={currentNodeIndex + 1}
          totalSteps={totalNodes}
          label={stepLabel}
        />

        {/* Navigation arrows */}
        <div className="flex items-center justify-between px-2">
          <button
            onClick={back}
            disabled={currentNodeIndex === 0}
            className="p-2 rounded-xl transition-all active:scale-95 disabled:opacity-20"
            style={{ background: 'rgba(255,255,255,0.08)' }}
          >
            <ChevronLeft className="h-5 w-5" style={{ color: 'rgba(255,255,255,0.7)' }} />
          </button>
          <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {stepLabel}
            {currentPart ? ` — Verset ${currentPart.verseStart}` : ''}
          </span>
          <div className="w-9" /> {/* Spacer to keep label centered */}
        </div>

        {parts.length > 1 && (
          <IstiqamahPartIndicator
            parts={parts}
            activePartIndex={currentNode?.partIndex ?? -1}
            completedParts={completedParts}
          />
        )}

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
