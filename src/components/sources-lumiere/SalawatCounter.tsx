import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Share2, Zap } from 'lucide-react';
import { DhikrItem } from '@/components/dhikr/DhikrCounter';
import { toast } from 'sonner';

interface SalawatCounterProps {
  item: DhikrItem;
  onComplete: () => void;
}

export default function SalawatCounter({ item, onComplete }: SalawatCounterProps) {
  const [count, setCount] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [tapped, setTapped] = useState(false);
  const [turboActive, setTurboActive] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const turboStartRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(count / item.target, 1);

  const increment = useCallback(() => {
    setCount(prev => {
      const next = prev + 1;
      // Haptic at milestones
      if (navigator.vibrate) {
        if (next % 10 === 0) navigator.vibrate(30);
        else navigator.vibrate(10);
      }
      if (next >= item.target) {
        setCompleted(true);
        if (navigator.vibrate) navigator.vibrate([30, 50, 30]);
      }
      return next;
    });
  }, [item.target]);

  const handleTap = useCallback(() => {
    if (completed) return;
    increment();
    setTapped(true);
    setTimeout(() => setTapped(false), 120);
  }, [completed, increment]);

  // Turbo mode: long press
  const startTurbo = useCallback(() => {
    if (completed) return;
    turboStartRef.current = setTimeout(() => {
      setTurboActive(true);
      timerRef.current = setInterval(() => {
        increment();
      }, 150);
    }, 300); // 300ms hold to activate turbo
  }, [completed, increment]);

  const stopTurbo = useCallback(() => {
    if (turboStartRef.current) {
      clearTimeout(turboStartRef.current);
      turboStartRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setTurboActive(false);
  }, []);

  // Cleanup
  useEffect(() => () => stopTurbo(), [stopTurbo]);

  // Auto-advance
  useEffect(() => {
    if (completed) {
      stopTurbo();
      const t = setTimeout(onComplete, 1800);
      return () => clearTimeout(t);
    }
  }, [completed, onComplete, stopTurbo]);

  // Reset on item change
  useEffect(() => {
    setCount(0);
    setCompleted(false);
    stopTurbo();
  }, [item.title, stopTurbo]);

  const handleShare = async () => {
    const text = `${item.arabic}\n\n${item.french}\n\n— ${item.source}\n\nDécouvre l'app Ma Khatma : https://www.makhatma.com`;
    if (navigator.share) {
      try { await navigator.share({ text }); } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(text);
      toast.success('Copié dans le presse-papier');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col items-center gap-5 px-4 py-6"
    >
      {/* Title */}
      <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--p-accent)' }}>
        {item.title}
      </p>

      {/* Arabic */}
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
      <p className="text-sm italic text-center leading-relaxed" style={{ color: 'var(--p-text-60)' }}>
        {item.phonetic}
      </p>

      {/* Translation */}
      <p className="text-sm text-center leading-relaxed max-w-xs" style={{ color: 'var(--p-text-75)' }}>
        {item.french}
      </p>

      {/* Source */}
      {item.source && (
        <p className="text-[11px] italic text-center max-w-xs" style={{ color: 'var(--p-text-55)', opacity: 0.8 }}>
          📖 {item.source}
        </p>
      )}

      {/* Turbo indicator */}
      <AnimatePresence>
        {turboActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full"
            style={{ background: '#D4AF3730', border: '1px solid #D4AF3750' }}
          >
            <Zap className="w-3.5 h-3.5" style={{ color: '#D4AF37' }} />
            <span className="text-xs font-bold" style={{ color: '#D4AF37' }}>Mode Turbo</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Counter Circle */}
      <motion.button
        className="relative w-36 h-36 flex items-center justify-center rounded-full focus:outline-none select-none"
        style={{ WebkitTapHighlightColor: 'transparent' }}
        onClick={handleTap}
        onTouchStart={startTurbo}
        onTouchEnd={stopTurbo}
        onMouseDown={startTurbo}
        onMouseUp={stopTurbo}
        onMouseLeave={stopTurbo}
        animate={tapped ? { scale: [1, 0.92, 1] } : {}}
        transition={{ duration: 0.12 }}
        aria-label={`Compter: ${count} sur ${item.target}`}
      >
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="var(--p-track)" strokeWidth="4" />
          <motion.circle
            cx="60" cy="60" r={radius}
            fill="none"
            stroke="#D4AF37"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset: circumference * (1 - progress) }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          />
        </svg>

        <div
          className="w-28 h-28 rounded-full flex flex-col items-center justify-center"
          style={{
            background: 'var(--p-bg)',
            border: turboActive ? '2px solid #D4AF37' : '2px solid var(--p-border)',
            boxShadow: turboActive ? '0 0 20px #D4AF3740' : 'var(--p-card-shadow)',
            transition: 'border-color 0.2s, box-shadow 0.2s',
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
                <Check className="w-8 h-8" style={{ color: '#D4AF37' }} strokeWidth={3} />
              </motion.div>
            ) : (
              <motion.div
                key="count"
                className="flex flex-col items-center"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.1 }}
              >
                <span className="text-2xl font-bold tabular-nums" style={{ color: '#D4AF37', fontFamily: "'Inter', sans-serif" }}>
                  {count}
                </span>
                <span className="text-[10px]" style={{ color: 'var(--p-text-55)' }}>/ {item.target}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.button>

      {!completed && (
        <p className="text-xs" style={{ color: 'var(--p-text-55)' }}>
          {turboActive ? 'Maintiens pour le mode turbo' : 'Appuie ou maintiens pour compter'}
        </p>
      )}

      {/* Share button */}
      <button
        onClick={handleShare}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-colors"
        style={{
          background: 'var(--p-track)',
          color: 'var(--p-text-75)',
          border: '1px solid var(--p-border)',
        }}
      >
        <Share2 className="w-3.5 h-3.5" />
        Partager
      </button>
    </motion.div>
  );
}
