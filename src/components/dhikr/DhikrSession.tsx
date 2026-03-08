import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, ChevronLeft, ChevronRight, Minus, Plus, Info, ChevronDown } from 'lucide-react';
import DhikrCounter, { type DhikrItem } from './DhikrCounter';

const ARABIC_SIZES = ['1.3rem', '1.7rem', '2.2rem'];
const ARABIC_LABELS = ['ا', 'ا', 'ا'];
const SWIPE_THRESHOLD = 50;

interface DhikrSessionProps {
  title: string;
  items: DhikrItem[];
  onBack: () => void;
}

export default function DhikrSession({ title, items, onBack }: DhikrSessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [arabicSizeIndex, setArabicSizeIndex] = useState(() => {
    const saved = localStorage.getItem('dhikr-arabic-size');
    return saved ? parseInt(saved, 10) : 1;
  });

  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const handleComplete = useCallback(() => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setSessionComplete(true);
    }
  }, [currentIndex, items.length]);

  const goTo = useCallback((index: number) => {
    if (index >= 0 && index < items.length) {
      setCurrentIndex(index);
      setSessionComplete(false);
    }
  }, [items.length]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (sessionComplete) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dy) > Math.abs(dx)) return;

    if (dx < 0 && currentIndex < items.length - 1) {
      goTo(currentIndex + 1);
    } else if (dx > 0 && currentIndex > 0) {
      goTo(currentIndex - 1);
    }
  }, [sessionComplete, currentIndex, items.length, goTo]);

  const changeArabicSize = useCallback((delta: number) => {
    setArabicSizeIndex((prev) => {
      const next = Math.max(0, Math.min(ARABIC_SIZES.length - 1, prev + delta));
      localStorage.setItem('dhikr-arabic-size', next.toString());
      return next;
    });
  }, []);

  const progressPercent = sessionComplete
    ? 100
    : (currentIndex / items.length) * 100;

  return (
    <div
      className="flex flex-col min-h-[60vh]"
      style={{ background: 'var(--p-bg)' }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-3">
        <button
          onClick={onBack}
          className="p-2 rounded-full"
          style={{ color: 'var(--p-primary)' }}
          aria-label="Retour"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Nav arrows */}
        <button
          onClick={() => goTo(currentIndex - 1)}
          disabled={currentIndex === 0 || sessionComplete}
          className="p-1.5 rounded-full disabled:opacity-25 transition-opacity"
          style={{ color: 'var(--p-primary)' }}
          aria-label="Précédent"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex-1 text-center">
          <p className="text-sm font-semibold" style={{ color: 'var(--p-text)' }}>
            {title}
          </p>
          <p className="text-xs" style={{ color: 'var(--p-text-55)' }}>
            {sessionComplete ? 'Terminé' : `${currentIndex + 1} / ${items.length}`}
          </p>
        </div>

        <button
          onClick={() => goTo(currentIndex + 1)}
          disabled={currentIndex >= items.length - 1 || sessionComplete}
          className="p-1.5 rounded-full disabled:opacity-25 transition-opacity"
          style={{ color: 'var(--p-primary)' }}
          aria-label="Suivant"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Arabic size control */}
        <div className="flex items-center gap-1 ml-1">
          <button
            onClick={() => changeArabicSize(-1)}
            disabled={arabicSizeIndex === 0}
            className="p-1.5 rounded-full disabled:opacity-25 transition-opacity"
            style={{ color: 'var(--p-accent)' }}
            aria-label="Réduire le texte arabe"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span
            className="font-bold select-none"
            style={{
              color: 'var(--p-primary)',
              fontFamily: "'Scheherazade New', serif",
              fontSize: '1rem',
            }}
          >
            ا
          </span>
          <button
            onClick={() => changeArabicSize(1)}
            disabled={arabicSizeIndex === ARABIC_SIZES.length - 1}
            className="p-1.5 rounded-full disabled:opacity-25 transition-opacity"
            style={{ color: 'var(--p-accent)' }}
            aria-label="Agrandir le texte arabe"
          >
            <Plus className="w-4 h-4" />
          </button>
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
      <div className="flex-1 flex flex-col items-center justify-center">
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
                Qu'Allah accepte, Amine
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
              arabicFontSize={ARABIC_SIZES[arabicSizeIndex]}
            />
          )}
        </AnimatePresence>

        {/* Dot indicators */}
        {!sessionComplete && items.length > 1 && (
          <div className="flex items-center justify-center gap-1.5 py-3 flex-wrap max-w-[280px]">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Aller au dhikr ${i + 1}`}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === currentIndex ? 18 : 7,
                  height: 7,
                  background: i === currentIndex
                    ? 'var(--p-accent)'
                    : i < currentIndex
                      ? 'var(--p-primary)'
                      : 'var(--p-track)',
                  opacity: i === currentIndex ? 1 : i < currentIndex ? 0.6 : 0.4,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
