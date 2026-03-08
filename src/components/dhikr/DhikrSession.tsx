import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check } from 'lucide-react';
import DhikrCounter, { type DhikrItem } from './DhikrCounter';

interface DhikrSessionProps {
  title: string;
  items: DhikrItem[];
  onBack: () => void;
}

export default function DhikrSession({ title, items, onBack }: DhikrSessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionComplete, setSessionComplete] = useState(false);

  const handleComplete = useCallback(() => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setSessionComplete(true);
    }
  }, [currentIndex, items.length]);

  const progressPercent = sessionComplete
    ? 100
    : (currentIndex / items.length) * 100;

  return (
    <div className="flex flex-col min-h-[60vh]" style={{ background: 'var(--p-bg)' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          onClick={onBack}
          className="p-2 rounded-full"
          style={{ color: 'var(--p-primary)' }}
          aria-label="Retour"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <p className="text-sm font-semibold" style={{ color: 'var(--p-text)' }}>
            {title}
          </p>
          <p className="text-xs" style={{ color: 'var(--p-text-55)' }}>
            {sessionComplete ? 'Terminé' : `${currentIndex + 1} / ${items.length}`}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-4 pb-2">
        <div className="w-full h-1.5 rounded-full" style={{ background: 'var(--p-track)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'var(--p-accent)' }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {sessionComplete ? (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-4 py-12"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.2 }}
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: 'var(--p-track)', border: '2px solid var(--p-primary)' }}
              >
                <Check className="w-8 h-8" style={{ color: 'var(--p-primary)' }} strokeWidth={3} />
              </motion.div>
              <p className="text-lg font-semibold" style={{ color: 'var(--p-primary)' }}>
                Bârak Allâhu fîk
              </p>
              <p className="text-sm" style={{ color: 'var(--p-text-60)' }}>
                Session terminée
              </p>
              <button
                onClick={onBack}
                className="mt-4 px-6 py-2.5 rounded-xl text-sm font-medium"
                style={{
                  background: 'var(--p-primary)',
                  color: 'var(--p-bg)',
                }}
              >
                Retour aux catégories
              </button>
            </motion.div>
          ) : (
            <DhikrCounter
              key={currentIndex}
              item={items[currentIndex]}
              onComplete={handleComplete}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
