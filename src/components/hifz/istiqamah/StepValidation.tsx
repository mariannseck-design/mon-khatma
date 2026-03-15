import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ShieldCheck, RotateCcw } from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import MiniRecorder from './MiniRecorder';
import HifzStepWrapper from '../HifzStepWrapper';

interface Props {
  surahNumber: number;
  verseStart: number;
  verseEnd: number;
  onNext: () => void;
  onBack?: () => void;
  onPause?: () => void;
}

const REQUIRED = 5;

export default function StepValidation({ surahNumber, verseStart, verseEnd, onNext, onBack, onPause }: Props) {
  const [count, setCount] = useState(0);
  const done = count >= REQUIRED;

  const increment = () => {
    if (count < REQUIRED) {
      setCount(c => c + 1);
      if (navigator.vibrate) navigator.vibrate(30);
    }
  };

  return (
    <HifzStepWrapper
      stepNumber={5}
      stepTitle="Validation"
      onBack={onBack}
      onPause={onPause}
      totalSteps={6}
      phaseLabel="Étape 5/6 · Validation"
      surahNumber={surahNumber}
      startVerse={verseStart}
      endVerse={verseEnd}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="space-y-6 py-4"
      >
        {/* Title */}
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2">
            <ShieldCheck className="h-5 w-5" style={{ color: '#d4af37' }} />
            <h3 className="text-lg font-bold" style={{ color: '#d4af37' }}>
              Validation
            </h3>
          </div>
          <p className="text-xs leading-relaxed mx-auto max-w-[280px]" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Récitez <strong style={{ color: 'rgba(255,255,255,0.85)' }}>5 fois sans faute</strong>, sans audio ni mushaf.
            Enregistrez-vous pour vous réécouter si besoin.
          </p>
        </div>

        {/* Circular counter */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-28 h-28">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
              <motion.circle
                cx="50" cy="50" r="42"
                fill="none"
                stroke="#d4af37"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 42}
                initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - count / REQUIRED) }}
                transition={{ type: 'spring', stiffness: 100, damping: 15 }}
                style={{ filter: 'drop-shadow(0 0 6px rgba(212,175,55,0.4))' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold" style={{ color: '#d4af37' }}>{count}</span>
              <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>/ {REQUIRED}</span>
            </div>
          </div>

          {!done ? (
            <div className="flex flex-col items-center gap-3">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={increment}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: 'rgba(212,175,55,0.15)',
                  border: '1px solid rgba(212,175,55,0.4)',
                  color: '#d4af37',
                  touchAction: 'manipulation',
                }}
              >
                <CheckCircle2 className="h-4 w-4" />
                J'ai récité sans faute ✓
              </motion.button>
              {count > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs transition-all"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        color: 'rgba(255,255,255,0.5)',
                        touchAction: 'manipulation',
                      }}
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Recommencer
                    </motion.button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="max-w-[320px] rounded-2xl border-none" style={{ background: '#1a2e1a' }}>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-center text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.9)' }}>
                        Recommencer le compteur ?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-center text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                        Votre progression ({count}/{REQUIRED}) sera remise à zéro.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-row gap-2 sm:justify-center">
                      <AlertDialogCancel
                        className="flex-1 rounded-xl border-none text-xs"
                        style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)' }}
                      >
                        Annuler
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => setCount(0)}
                        className="flex-1 rounded-xl border-none text-xs font-semibold"
                        style={{ background: 'rgba(239,68,68,0.2)', color: '#f87171' }}
                      >
                        Recommencer
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          ) : (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-3 flex flex-col items-center"
              >
                <p className="text-xs font-medium" style={{ color: 'rgba(212,175,55,0.8)' }}>
                  Mâ shâ Allâh ! Validation réussie 🎉
                </p>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={onNext}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold"
                  style={{
                    background: 'linear-gradient(135deg, #d4af37, #b8962e)',
                    color: '#1a2e1a',
                    touchAction: 'manipulation',
                  }}
                >
                  Continuer →
                </motion.button>
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        {/* Mini recorder */}
        <div className="pt-2">
          <MiniRecorder />
        </div>
      </motion.div>
    </HifzStepWrapper>
  );
}
