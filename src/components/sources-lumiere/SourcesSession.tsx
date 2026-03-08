import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, Share2 } from 'lucide-react';
import DhikrCounter, { type DhikrItem } from '@/components/dhikr/DhikrCounter';
import SalawatCounter from './SalawatCounter';
import { toast } from 'sonner';

interface SourcesSessionProps {
  title: string;
  items: DhikrItem[];
  onBack: () => void;
  useSalawatCounter?: boolean;
}

export default function SourcesSession({ title, items, onBack, useSalawatCounter = false }: SourcesSessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionComplete, setSessionComplete] = useState(false);

  const handleComplete = useCallback(() => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setSessionComplete(true);
    }
  }, [currentIndex, items.length]);

  const progressPercent = sessionComplete ? 100 : (currentIndex / items.length) * 100;

  const currentItem = items[currentIndex];

  const handleShareCurrent = async () => {
    if (!currentItem) return;
    const text = `${currentItem.arabic}\n\n${currentItem.french}\n\n— ${currentItem.source}\n\nDécouvre l'app Ma Khatma : https://www.makhatma.com`;
    if (navigator.share) {
      try { await navigator.share({ text }); } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(text);
      toast.success('Copié dans le presse-papier');
    }
  };

  return (
    <div className="flex flex-col min-h-[60vh]" style={{ background: 'var(--p-bg)' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <button onClick={onBack} className="p-2 rounded-full" style={{ color: '#D4AF37' }} aria-label="Retour">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <p className="text-sm font-semibold" style={{ color: 'var(--p-text)' }}>{title}</p>
          <p className="text-xs" style={{ color: 'var(--p-text-55)' }}>
            {sessionComplete ? 'Terminé' : `${currentIndex + 1} / ${items.length}`}
          </p>
        </div>
        {!sessionComplete && !useSalawatCounter && (
          <button onClick={handleShareCurrent} className="p-2 rounded-full" style={{ color: '#D4AF37' }} aria-label="Partager">
            <Share2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div className="px-4 pb-2">
        <div className="w-full h-1.5 rounded-full" style={{ background: 'var(--p-track)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: '#D4AF37' }}
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
                style={{ background: '#D4AF3720', border: '2px solid #D4AF37' }}
              >
                <Check className="w-8 h-8" style={{ color: '#D4AF37' }} strokeWidth={3} />
              </motion.div>
              <p className="text-lg font-semibold" style={{ color: '#D4AF37' }}>
                Qu'Allah <span className="honorific">(عز وجل)</span> accepte, Amine
              </p>
              <p className="text-sm" style={{ color: 'var(--p-text-60)' }}>Session terminée</p>
              <button
                onClick={onBack}
                className="mt-4 px-6 py-2.5 rounded-xl text-sm font-medium"
                style={{ background: '#D4AF37', color: '#1a1a0a' }}
              >
                Retour aux Sources de Lumière
              </button>
            </motion.div>
          ) : useSalawatCounter ? (
            <SalawatCounter key={currentIndex} item={currentItem} onComplete={handleComplete} />
          ) : (
            <DhikrCounter key={currentIndex} item={currentItem} onComplete={handleComplete} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
