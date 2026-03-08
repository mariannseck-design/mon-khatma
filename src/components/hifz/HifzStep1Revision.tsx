import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Check } from 'lucide-react';
import HifzStepWrapper from './HifzStepWrapper';

interface Props {
  onNext: () => void;
  onBack: () => void;
  onPause?: () => void;
}

export default function HifzStep1Revision({ onNext, onBack, onPause }: Props) {
  const [count, setCount] = useState(0);
  const [timer, setTimer] = useState(300);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    startTimer();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const handleReset = () => {
    setCount(0);
    setTimer(300);
    startTimer();
  };

  const mins = Math.floor(timer / 60);
  const secs = timer % 60;

  return (
    <HifzStepWrapper stepNumber={1} stepTitle="Le Réveil de la Veille" onBack={onBack}>
      <div className="text-center space-y-6">
        <button
          onClick={handleReset}
          className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center active:scale-95 transition-transform"
          style={{ background: 'rgba(212,175,55,0.2)', border: '1px solid rgba(212,175,55,0.3)' }}
        >
          <RotateCcw className="h-8 w-8" style={{ color: '#d4af37' }} />
        </button>

        <p className="text-white/80 text-sm leading-relaxed px-2">
          Avant d'avancer, consolidons tes acquis. Récite de mémoire, 5 fois, la partie apprise hier.
        </p>

        {/* Timer */}
        <div className="text-3xl font-bold text-white/90 font-mono">
          {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
        </div>

        {/* Counter */}
        <div className="space-y-3">
          <p className="text-white/50 text-xs uppercase tracking-wider">Récitations</p>
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map(n => (
              <div
                key={n}
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all"
                style={{
                  background: n <= count ? 'rgba(212,175,55,0.3)' : 'rgba(255,255,255,0.06)',
                  border: `2px solid ${n <= count ? '#d4af37' : 'rgba(255,255,255,0.1)'}`,
                  color: n <= count ? '#d4af37' : 'rgba(255,255,255,0.3)',
                }}
              >
                {n}
              </div>
            ))}
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setCount(prev => Math.min(prev + 1, 5))}
            disabled={count >= 5}
            className="px-6 py-2 rounded-xl font-semibold text-sm"
            style={{
              background: count >= 5 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            {count >= 5 ? 'Terminé ✓' : 'Récitation terminée'}
          </motion.button>
        </div>

        {count >= 5 && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.97 }}
            onClick={onNext}
            className="w-full rounded-2xl py-4 flex items-center justify-center gap-2 font-semibold"
            style={{ background: 'linear-gradient(135deg, #d4af37, #b8962e)', color: '#1a2e1a' }}
          >
            <Check className="h-5 w-5" />
            Passer à l'étape suivante
          </motion.button>
        )}
      </div>
    </HifzStepWrapper>
  );
}
