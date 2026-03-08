import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SWIPE_THRESHOLD = 50;
import { ArrowLeft, Check, Share2, Heart } from 'lucide-react';
import DhikrCounter, { type DhikrItem } from '@/components/dhikr/DhikrCounter';
import { toast } from 'sonner';

interface DouasSessionProps {
  title: string;
  items: DhikrItem[];
  onBack: () => void;
  categoryId: string;
  subthemeId: string;
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (id: string, item: DhikrItem) => void;
  makeId: (itemTitle: string) => string;
}

const GOLD = '#D4AF37';

export default function DouasSession({
  title, items, onBack, categoryId, subthemeId,
  isFavorite, onToggleFavorite, makeId,
}: DouasSessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [heartPulse, setHeartPulse] = useState(false);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const handleComplete = useCallback(() => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setSessionComplete(true);
    }
  }, [currentIndex, items.length]);

  const progressPercent = sessionComplete ? 100 : (currentIndex / items.length) * 100;
  const currentItem = items[currentIndex];
  const currentId = currentItem ? makeId(currentItem.title) : '';
  const isCurrentFav = currentId ? isFavorite(currentId) : false;

  const handleShare = async () => {
    if (!currentItem) return;
    const text = `${currentItem.arabic}\n\n${currentItem.french}\n\n— ${currentItem.source}\n\nDécouvre l'app Ma Khatma : https://www.makhatma.com`;
    if (navigator.share) {
      try { await navigator.share({ text }); } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(text);
      toast.success('Copié dans le presse-papier');
    }
  };

  const handleToggleFav = () => {
    if (!currentItem) return;
    onToggleFavorite(currentId, currentItem);
    if (!isCurrentFav) {
      setHeartPulse(true);
      setTimeout(() => setHeartPulse(false), 600);
    }
    toast.success(isCurrentFav ? 'Retiré des favoris' : 'Ajouté aux favoris ❤️');
  };

  return (
    <div className="flex flex-col min-h-[60vh]" style={{ background: 'var(--p-bg)' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <button onClick={onBack} className="p-2 rounded-full" style={{ color: GOLD }} aria-label="Retour">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: 'var(--p-text)' }}>{title}</p>
          <p className="text-xs" style={{ color: 'var(--p-text-55)' }}>
            {sessionComplete ? 'Terminé' : `${currentIndex + 1} / ${items.length}`}
          </p>
        </div>
        {!sessionComplete && (
          <div className="flex items-center gap-1">
            <button onClick={handleToggleFav} className="p-2 rounded-full" aria-label="Favori">
              <motion.div
                animate={heartPulse ? { scale: [1, 1.5, 0.9, 1.2, 1] } : { scale: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              >
                <Heart
                  className="w-4 h-4 transition-colors"
                  style={{ color: isCurrentFav ? '#e74c3c' : GOLD }}
                  fill={isCurrentFav ? '#e74c3c' : 'none'}
                />
              </motion.div>
            </button>
            <button onClick={handleShare} className="p-2 rounded-full" style={{ color: GOLD }} aria-label="Partager">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="px-4 pb-2">
        <div className="w-full h-1.5 rounded-full" style={{ background: 'var(--p-track)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: GOLD }}
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
                style={{ background: `${GOLD}20`, border: `2px solid ${GOLD}` }}
              >
                <Check className="w-8 h-8" style={{ color: GOLD }} strokeWidth={3} />
              </motion.div>
              <p className="text-lg font-semibold" style={{ color: GOLD }}>
                Qu'Allah accepte, Amine
              </p>
              <p className="text-sm" style={{ color: 'var(--p-text-60)' }}>Session terminée</p>
              <button
                onClick={onBack}
                className="mt-4 px-6 py-2.5 rounded-xl text-sm font-medium"
                style={{ background: GOLD, color: '#1a1a0a' }}
              >
                Retour aux Douas
              </button>
            </motion.div>
          ) : (
            <DhikrCounter key={currentIndex} item={currentItem} onComplete={handleComplete} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
