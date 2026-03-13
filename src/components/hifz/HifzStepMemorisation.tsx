import HifzStepWrapper from './HifzStepWrapper';
import StepImmersion from './istiqamah/StepImmersion';

interface Props {
  surahNumber: number;
  startVerse: number;
  endVerse: number;
  onNext: () => void;
  onBack: () => void;
  onPause?: () => void;
}

export default function HifzStepMemorisation({ surahNumber, startVerse, endVerse, onNext, onBack, onPause }: Props) {
  const reciterId = localStorage.getItem('quran_reciter') || 'ar.alafasy';

  return (
    <HifzStepWrapper stepNumber={4} stepTitle="Mémorisation" onBack={onBack} onPause={onPause} totalSteps={5} surahNumber={surahNumber} startVerse={startVerse} endVerse={endVerse}>
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
