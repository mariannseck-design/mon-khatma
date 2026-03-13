import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { RotateCw, Check, Clock } from 'lucide-react';
import HifzStepWrapper from './HifzStepWrapper';
import TikrarInstructionsModal from './TikrarInstructionsModal';
import PomodoroTimer from './PomodoroTimer';

const TOTAL_REPS = 40;

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

  const [inputValue, setInputValue] = useState<string>(String(saved || ''));
  const [startedAt, setStartedAt] = useState<number>(savedStart);
  const [remaining, setRemaining] = useState('');
  const [expired, setExpired] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  const count = Math.max(0, Math.min(parseInt(inputValue) || 0, TOTAL_REPS));
  const balance = TOTAL_REPS - count;
  const progress = (count / TOTAL_REPS) * 100;
  const isComplete = count >= TOTAL_REPS;

  const [urgentWarning, setUrgentWarning] = useState(false);

  // Countdown timer
  useEffect(() => {
    const tick = () => {
      const deadline = startedAt + 24 * 3600 * 1000;
      const diff = deadline - Date.now();
      if (diff <= 0 && count < TOTAL_REPS) {
        setExpired(true);
        setRemaining('0h 00min');
        setUrgentWarning(false);
      } else {
        setExpired(false);
        setRemaining(formatCountdown(diff));
        setUrgentWarning(diff > 0 && diff <= 6 * 3600 * 1000 && count < TOTAL_REPS);
      }
    };
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [startedAt, count]);

  // Schedule browser notification 6h before expiry (18h after start)
  useEffect(() => {
    if (isComplete || expired) return;

    const notifyAt = startedAt + 18 * 3600 * 1000; // 18h after start = 6h before expiry
    const delay = notifyAt - Date.now();

    if (delay <= 0) return; // Already past the notification time

    const timeoutId = setTimeout(() => {
      if ('Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification('⏰ Tikrar — Plus que 6h !', {
            body: `Il te reste ${TOTAL_REPS - count} récitation(s) à compléter avant l'expiration. Qu'Allah (عز وجل) te facilite !`,
            icon: '/pwa-192x192.png',
            tag: 'tikrar-expiry-warning',
          });
        } catch (e) {
          // Notification API may not be available in all contexts
        }
      }
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [startedAt, isComplete, expired, count]);

  // Persist count
  useEffect(() => {
    onUpdateStatus?.({
      ...stepStatus,
      tikrar_count: count,
      tikrar_started_at: startedAt,
    });
  }, [count]);

  const handleInputChange = useCallback((value: string) => {
    setInputValue(value);
  }, []);

  const handleReset = useCallback(() => {
    const now = Date.now();
    setInputValue('');
    setStartedAt(now);
    setExpired(false);
    onUpdateStatus?.({
      ...stepStatus,
      tikrar_count: 0,
      tikrar_started_at: now,
    });
  }, [stepStatus, onUpdateStatus]);

  // Circular progress
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (progress / 100) * circumference;

  return (
    <HifzStepWrapper
      stepNumber={5}
      stepTitle="Tikrâr"
      onBack={onBack}
      onPause={onPause}
      totalSteps={5}
      surahNumber={surahNumber}
      startVerse={startVerse}
      endVerse={endVerse}
    >
      <PomodoroTimer />
      <div className="text-center space-y-5">
        <div className="flex flex-col items-center gap-0.5 -mt-2">
          <div className="flex items-center gap-3">
            <div className="h-[1px] w-10 bg-gradient-to-r from-transparent to-[rgba(212,175,55,0.4)]" />
            <span className="text-4xl" style={{ color: '#d4af37', fontFamily: "'Amiri', serif" }}>تِكْرَار</span>
            <div className="h-[1px] w-10 bg-gradient-to-l from-transparent to-[rgba(212,175,55,0.4)]" />
          </div>
          <span className="text-xs tracking-[0.2em] uppercase font-medium" style={{ color: 'rgba(212,175,55,0.6)' }}>
            Tikrâr
          </span>
        </div>
        <p className="text-xs leading-relaxed" style={{ color: 'rgba(240,230,200,0.7)' }}>
          Récitez cette portion <strong style={{ color: '#d4af37' }}>40 fois</strong> pour sceller votre mémorisation.
        </p>

        {/* Instructions link */}
        <button
          onClick={() => setShowInstructions(true)}
          className="text-xs underline underline-offset-2 transition-colors"
          style={{ color: 'rgba(212,175,55,0.7)' }}
        >
          💡 Cliquez ici pour lire les instructions avant de commencer
        </button>

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

        {/* Input field */}
        <div className="space-y-2">
          <label className="block text-xs font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Combien de répétitions avez-vous effectuées ?
          </label>
          <input
            type="number"
            inputMode="numeric"
            min="0"
            max={TOTAL_REPS}
            value={inputValue}
            onChange={e => handleInputChange(e.target.value)}
            onFocus={e => e.target.select()}
            placeholder="0"
            disabled={expired}
            className="w-full rounded-xl px-4 py-3 text-center text-lg font-bold outline-none disabled:opacity-50"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(212,175,55,0.3)',
              color: '#f0e6c8',
              fontSize: '16px',
            }}
          />
        </div>

        {/* Balance */}
        <p className="text-sm" style={{ color: 'rgba(240,230,200,0.6)' }}>
          Solde restant : <strong style={{ color: isComplete ? '#d4af37' : '#f0e6c8' }}>{balance}</strong> récitation{balance !== 1 ? 's' : ''}
        </p>

        {/* Urgent warning banner */}
        {urgentWarning && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl px-4 py-3 text-center"
            style={{ background: 'rgba(251,146,60,0.15)', border: '1px solid rgba(251,146,60,0.3)' }}
          >
            <p className="text-xs font-semibold" style={{ color: '#fb923c' }}>
              ⚠️ Plus que {remaining} avant l'expiration ! Complétez vos {balance} récitation{balance !== 1 ? 's' : ''} restante{balance !== 1 ? 's' : ''}.
            </p>
          </motion.div>
        )}

        {/* Countdown */}
        <div className="flex items-center justify-center gap-1.5 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
          <Clock className="h-3.5 w-3.5" />
          <span>Temps restant : {remaining}</span>
        </div>

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
        ) : isComplete ? (
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
              Valider votre Tikrar
            </motion.button>
          </motion.div>
        ) : null}
      </div>

      {/* Instructions modal */}
      <TikrarInstructionsModal
        open={showInstructions}
        onClose={() => setShowInstructions(false)}
      />
    </HifzStepWrapper>
  );
}
