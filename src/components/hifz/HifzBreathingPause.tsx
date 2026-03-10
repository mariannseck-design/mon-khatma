import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface HifzBreathingPauseProps {
  onComplete: () => void;
}

const DURATION = 180; // 3 minutes
const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const MESSAGES = [
  "Respire profondément…",
  "Prends un moment pour te recentrer.",
  "Détends tes épaules.",
  "Invoque Allah dans ton cœur.",
  "Tu as fourni un bel effort, maa shaa Allah.",
  "Prépare-toi pour la validation…",
];

export default function HifzBreathingPause({ onComplete }: HifzBreathingPauseProps) {
  const [remaining, setRemaining] = useState(DURATION);
  const startRef = useRef(Date.now());
  const messageIndex = Math.min(
    Math.floor(((DURATION - remaining) / DURATION) * MESSAGES.length),
    MESSAGES.length - 1
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startRef.current) / 1000);
      const left = Math.max(0, DURATION - elapsed);
      setRemaining(left);
      if (left <= 0) {
        clearInterval(interval);
        onComplete();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [onComplete]);

  const progress = (DURATION - remaining) / DURATION;
  const dashOffset = CIRCUMFERENCE * (1 - progress);
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8"
    >
      <motion.p
        className="text-sm font-medium uppercase tracking-widest"
        style={{ color: 'rgba(212,175,55,0.7)' }}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Décompression
      </motion.p>

      {/* SVG Circle Timer */}
      <div className="relative">
        <svg width="140" height="140" viewBox="0 0 120 120">
          <circle
            cx="60" cy="60" r={RADIUS}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="6"
          />
          <motion.circle
            cx="60" cy="60" r={RADIUS}
            fill="none"
            stroke="#d4af37"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 60 60)"
            initial={{ strokeDashoffset: CIRCUMFERENCE }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 0.5 }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="text-2xl font-bold tabular-nums"
            style={{ color: '#f0e6c8', fontFamily: "'Inter', sans-serif" }}
          >
            {minutes}:{seconds.toString().padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Rotating message */}
      <motion.p
        key={messageIndex}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="text-base font-medium max-w-xs"
        style={{ color: '#f0e6c8', fontFamily: "'Playfair Display', serif" }}
      >
        {MESSAGES[messageIndex]}
      </motion.p>

      {/* Skip button */}
      <button
        onClick={onComplete}
        className="px-5 py-2.5 rounded-xl text-xs font-medium transition-all active:scale-95"
        style={{
          background: 'rgba(255,255,255,0.08)',
          color: 'rgba(240,230,200,0.5)',
          border: '1px solid rgba(240,230,200,0.12)',
        }}
      >
        Passer →
      </button>
    </motion.div>
  );
}
