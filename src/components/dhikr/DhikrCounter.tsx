import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';

export interface DhikrItem {
  arabic: string;
  phonetic: string;
  french: string;
  target: number;
  title: string;
  source?: string;
}

interface DhikrCounterProps {
  item: DhikrItem;
  onComplete: () => void;
}

export default function DhikrCounter({ item, onComplete }: DhikrCounterProps) {
  const [count, setCount] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [tapped, setTapped] = useState(false);

  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const progress = count / item.target;

  const handleTap = useCallback(() => {
    if (completed) return;
    const next = count + 1;
    setCount(next);
    setTapped(true);
    setTimeout(() => setTapped(false), 150);

    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(15);
    }

    if (next >= item.target) {
      setCompleted(true);
      if (navigator.vibrate) {
        navigator.vibrate([30, 50, 30]);
      }
    }
  }, [count, completed, item.target]);

  // Auto-advance after completion
  useEffect(() => {
    if (completed) {
      const timer = setTimeout(onComplete, 1500);
      return () => clearTimeout(timer);
    }
  }, [completed, onComplete]);

  // Reset when item changes
  useEffect(() => {
    setCount(0);
    setCompleted(false);
  }, [item.title]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col items-center gap-6 px-4 py-6"
    >
      {/* Title */}
      <p
        className="text-xs font-semibold tracking-widest uppercase"
        style={{ color: 'var(--p-accent)' }}
      >
        {item.title}
      </p>

      {/* Arabic text */}
      <p
        className="text-2xl font-bold leading-relaxed text-center px-2"
        style={{
          color: 'var(--p-primary)',
          fontFamily: "'Scheherazade New', 'Traditional Arabic', serif",
          direction: 'rtl',
          lineHeight: '2.2',
        }}
      >
        {item.arabic}
      </p>

      {/* Phonetic */}
      <p
        className="text-sm italic text-center leading-relaxed"
        style={{ color: 'var(--p-text-60)' }}
      >
        {item.phonetic}
      </p>

      {/* Translation */}
      <p
        className="text-sm text-center leading-relaxed max-w-xs"
        style={{ color: 'var(--p-text-75)' }}
      >
        {item.french}
      </p>

      {/* Source reference */}
      {item.source && (
        <p
          className="text-[11px] italic text-center max-w-xs"
          style={{ color: 'var(--p-text-55)', opacity: 0.8 }}
        >
          📖 {item.source}
        </p>
      )}

      {/* Counter Circle */}
      <motion.button
        className="relative w-32 h-32 flex items-center justify-center rounded-full focus:outline-none"
        style={{ WebkitTapHighlightColor: 'transparent' }}
        onClick={handleTap}
        animate={tapped ? { scale: [1, 0.92, 1] } : {}}
        transition={{ duration: 0.15 }}
        aria-label={`Compter: ${count} sur ${item.target}`}
      >
        {/* SVG Ring */}
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 120 120">
          {/* Track */}
          <circle
            cx="60" cy="60" r={radius}
            fill="none"
            stroke="var(--p-track)"
            strokeWidth="4"
          />
          {/* Progress */}
          <motion.circle
            cx="60" cy="60" r={radius}
            fill="none"
            stroke="var(--p-accent)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset: circumference * (1 - progress) }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </svg>

        {/* Inner content */}
        <div
          className="w-24 h-24 rounded-full flex flex-col items-center justify-center"
          style={{
            background: 'var(--p-bg)',
            border: '2px solid var(--p-border)',
            boxShadow: 'var(--p-card-shadow)',
          }}
        >
          <AnimatePresence mode="wait">
            {completed ? (
              <motion.div
                key="check"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              >
                <Check className="w-8 h-8" style={{ color: 'var(--p-primary)' }} strokeWidth={3} />
              </motion.div>
            ) : (
              <motion.div
                key="count"
                className="flex flex-col items-center"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <span
                  className="text-2xl font-bold tabular-nums"
                  style={{ color: 'var(--p-primary)', fontFamily: "'Inter', sans-serif" }}
                >
                  {count}
                </span>
                <span className="text-[10px]" style={{ color: 'var(--p-text-55)' }}>
                  / {item.target}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.button>

      {!completed && (
        <p className="text-xs" style={{ color: 'var(--p-text-55)' }}>
          Appuie pour compter
        </p>
      )}
    </motion.div>
  );
}
