import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { RotateCw, Check, Clock } from 'lucide-react';
import HifzStepWrapper from './HifzStepWrapper';

const TOTAL_REPS = 40;

const MOTIVATIONAL: Record<number, string> = {
  10: '10 déjà ! Continue, tu es sur la bonne voie 💪',
  20: 'Mi-chemin atteint ! La moitié est faite ✨',
  30: 'Plus que 10 ! Le Tikrar scelle ta mémoire 🔒',
  39: 'Dernière récitation ! Allahoumma bârik 🤲',
};

function formatCountdown(ms: number): string {
  if (ms <= 0) return '0h 00min';
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return `${h}h ${m.toString().padStart(2, '0')}min`;
}

interface Props {
  surahNumber: number;
  startVerse: number;
  endVerse: number;
  onNext: () => void;
  onBack?: () => void;
  onPause?: () => void;
  stepStatus?: Record<string, any>;
  onUpdateStatus?: (status: Record<string, any>) => void;
}

export default function HifzStep5Tikrar({
  surahNumber, startVerse, endVerse,
  onNext, onBack, onPause,
  stepStatus, onUpdateStatus,
}: Props) {
  const saved = stepStatus?.tikrar_count ?? 0;
  const savedStart = stepStatus?.tikrar_started_at ?? Date.now();

  const [count, setCount] = useState<number>(saved);
  const [startedAt, setStartedAt] = useState<number>(savedStart);
  const [remaining, setRemaining] = useState('');
  const [motivMsg, setMotivMsg] = useState<string | null>(null);
  const [showMotiv, setShowMotiv] = useState(false);
  const [expired, setExpired] = useState(false);

  // Countdown timer
  useEffect(() => {
    const tick = () => {
      const deadline = startedAt + 24 * 3600 * 1000;
      const diff = deadline - Date.now();
      if (diff <= 0 && count < TOTAL_REPS) {
        setExpired(true);
        setRemaining('0h 00min');
      } else {
        setExpired(false);
        setRemaining(formatCountdown(diff));
      }
    };
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [startedAt, count]);

  // Persist count
  useEffect(() => {
    onUpdateStatus?.({
      ...stepStatus,
      tikrar_count: count,
      tikrar_started_at: startedAt,
    });
  }, [count]);

  const handleRecite = useCallback(() => {
    if (count >= TOTAL_REPS || expired) return;
    const next = count + 1;
    setCount(next);

    if (navigator.vibrate) navigator.vibrate(30);

    const msg = MOTIVATIONAL[next];
    if (msg) {
      setMotivMsg(msg);
      setShowMotiv(true);
      setTimeout(() => setShowMotiv(false), 3000);
    }
  }, [count, expired]);

  const handleReset = useCallback(() => {
    const now = Date.now();
    setCount(0);
    setStartedAt(now);
    setExpired(false);
    onUpdateStatus?.({
      ...stepStatus,
      tikrar_count: 0,
      tikrar_started_at: now,
    });
  }, [stepStatus, onUpdateStatus]);

  const balance = TOTAL_REPS - count;
  const progress = (count / TOTAL_REPS) * 100;
  const isComplete = count >= TOTAL_REPS;

  // Circular progress
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (progress / 100) * circumference;

  return (
    <HifzStepWrapper
      stepNumber={5}
      stepTitle="Tikrar"
      onBack={onBack}
      onPause={onPause}
      totalSteps={6}
    >
      <div className="text-center space-y-5">
        <h2
          className="text-lg font-bold"
          style={{ color: '#f0e6c8', fontFamily: "'Playfair Display', serif" }}
        >
          Tikrar Final
        </h2>
        <p className="text-xs leading-relaxed" style={{ color: 'rgba(240,230,200,0.7)' }}>
          Récitez cette portion <strong style={{ color: '#d4af37' }}>40 fois</strong> dans les 24h
          pour sceller votre mémorisation.
        </p>

        {/* Circular counter */}
        <div className="relative w-40 h-40 mx-auto">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
            <motion.circle
              cx="60" cy="60" r={radius} fill="none"
              stroke="url(#goldGrad)" strokeWidth="8" strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: strokeOffset }}
              transition={{ duration: 0.4 }}
            />
            <defs>
              <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#d4af37" />
                <stop offset="100%" stopColor="#f0d060" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold tabular-nums" style={{ color: '#d4af37' }}>
              {count}
            </span>
            <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.5)' }}>/ {TOTAL_REPS}</span>
          </div>
        </div>

        {/* Balance */}
        <p className="text-sm" style={{ color: 'rgba(240,230,200,0.6)' }}>
          Solde restant : <strong style={{ color: '#f0e6c8' }}>{balance}</strong> récitation{balance !== 1 ? 's' : ''}
        </p>

        {/* Countdown */}
        <div className="flex items-center justify-center gap-1.5 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
          <Clock className="h-3.5 w-3.5" />
          <span>Temps restant : {remaining}</span>
        </div>

        {/* Motivational message */}
        {showMotiv && motivMsg && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-sm font-medium px-4"
            style={{ color: '#f0d060' }}
          >
            {motivMsg}
          </motion.p>
        )}

        {/* Action buttons */}
        {expired && !isComplete ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <p className="text-sm leading-relaxed px-4" style={{ color: '#f87171' }}>
              ⏰ Les 24h sont écoulées. Tu avais atteint <strong>{count}/{TOTAL_REPS}</strong> récitations. Recommence pour sceller ta mémorisation.
            </p>
            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={handleReset}
              className="mx-auto flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-sm transition-all"
              style={{
                background: 'linear-gradient(135deg, #d4af37, #c9a030)',
                color: '#1a2e1a',
                boxShadow: '0 6px 20px rgba(212,175,55,0.35)',
              }}
            >
              <RotateCw className="h-5 w-5" />
              Recommencer le Tikrar
            </motion.button>
          </motion.div>
        ) : !isComplete ? (
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={handleRecite}
            className="mx-auto flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-sm transition-all"
            style={{
              background: 'linear-gradient(135deg, #d4af37, #c9a030)',
              color: '#1a2e1a',
              boxShadow: '0 6px 20px rgba(212,175,55,0.35)',
            }}
          >
            <RotateCw className="h-5 w-5" />
            J'ai récité ✓
          </motion.button>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-3"
          >
            <p className="text-sm font-semibold" style={{ color: '#d4af37' }}>
              🎉 40 récitations atteintes !
            </p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onNext}
              className="mx-auto flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-sm"
              style={{
                background: 'linear-gradient(135deg, #d4af37, #b8962e)',
                color: '#1a2e1a',
                boxShadow: '0 6px 20px rgba(212,175,55,0.4)',
              }}
            >
              <Check className="h-5 w-5" />
              Valider le Tikrar
            </motion.button>
          </motion.div>
        )}
      </div>
    </HifzStepWrapper>
  );
}
