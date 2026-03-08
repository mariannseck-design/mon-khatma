import { ReactNode, useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Clock } from 'lucide-react';
import { type HifzTheme, isLightTheme } from '@/lib/hifzTheme';

interface HifzStepWrapperProps {
  stepNumber: number;
  stepTitle: string;
  children: ReactNode;
  onBack?: () => void;
  totalSteps?: number;
  theme?: HifzTheme;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function HifzStepWrapper({ stepNumber, stepTitle, children, onBack, totalSteps = 7 }: HifzStepWrapperProps) {
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(Date.now());

  // Reset timer when step changes
  useEffect(() => {
    startRef.current = Date.now();
    setElapsed(0);
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [stepNumber]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-5"
    >
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        {onBack && (
          <button onClick={onBack} className="p-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <ChevronLeft className="h-5 w-5 text-white/70" />
          </button>
        )}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-white/50 text-xs uppercase tracking-wider">Étape {stepNumber}/{totalSteps - 1}</span>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-[11px] tabular-nums" style={{ color: 'rgba(255,255,255,0.4)' }}>
                <Clock className="h-3 w-3" />
                {formatTime(elapsed)}
              </span>
              <span className="text-xs" style={{ color: '#d4af37' }}>{stepTitle}</span>
            </div>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #d4af37, #f0d060)' }}
              initial={{ width: 0 }}
              animate={{ width: `${((stepNumber + 1) / totalSteps) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>

      {children}
    </motion.div>
  );
}
