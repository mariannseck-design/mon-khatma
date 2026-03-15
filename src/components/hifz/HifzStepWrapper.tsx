import { ReactNode, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, BookOpen, ExternalLink, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getExactVersePage } from '@/lib/quranData';
import { SURAHS } from '@/lib/surahData';
import { Sheet, SheetContent } from '@/components/ui/sheet';

interface HifzStepWrapperProps {
  stepNumber: number;
  stepTitle: string;
  children: ReactNode;
  onBack?: () => void;
  onPause?: () => void;
  totalSteps?: number;
  phaseLabel?: string;
  surahNumber?: number;
  startVerse?: number;
  endVerse?: number;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function HifzStepWrapper({ stepNumber, stepTitle, children, onBack, onPause, totalSteps = 5, phaseLabel, surahNumber, startVerse, endVerse }: HifzStepWrapperProps) {
  const [elapsed, setElapsed] = useState(0);
  const [pageLabel, setPageLabel] = useState('');
  const [mushafPage, setMushafPage] = useState<number | null>(null);
  const [mushafOpen, setMushafOpen] = useState(false);
  const startRef = useRef(Date.now());
  const navigate = useNavigate();

  useEffect(() => {
    startRef.current = Date.now();
    setElapsed(0);
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [stepNumber]);

  useEffect(() => {
    if (!surahNumber || !startVerse || !endVerse) { setPageLabel(''); setMushafPage(null); return; }
    (async () => {
      const pStart = await getExactVersePage(surahNumber, startVerse);
      const pEnd = await getExactVersePage(surahNumber, endVerse);
      setPageLabel(pStart === pEnd ? `p. ${pStart}` : `p. ${pStart}–${pEnd}`);
      setMushafPage(pStart);
    })();
  }, [surahNumber, startVerse, endVerse]);

  const surahName = surahNumber ? SURAHS.find(s => s.number === surahNumber)?.name : null;
  const verseInfo = surahName && startVerse && endVerse
    ? `${surahName} · v.${startVerse}–${endVerse}${pageLabel ? ` · ${pageLabel}` : ''}`
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-5 relative"
    >
      {onBack && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={onBack}
          className="absolute -top-1 left-0 p-1.5 transition-all active:scale-90 hover:opacity-60"
          style={{ color: 'rgba(255,255,255,0.25)' }}
        >
          <ChevronLeft className="h-4 w-4" />
        </motion.button>
      )}
      {verseInfo && (
        <div className="flex justify-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full"
               style={{ background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.25)' }}>
            <span className="text-xs" style={{ color: '#d4af37' }}>📖</span>
            <span className="text-xs font-medium" style={{ color: 'rgba(212,175,55,0.85)' }}>
              {verseInfo}
            </span>
          </div>
          {mushafPage && (
            <button
              onClick={() => setMushafOpen(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full transition-all active:scale-95"
              style={{ background: 'rgba(5,150,105,0.12)', border: '1px solid rgba(5,150,105,0.25)' }}
            >
              <BookOpen className="h-3 w-3" style={{ color: '#059669' }} />
              <span className="text-[10px] font-medium" style={{ color: 'rgba(5,150,105,0.85)' }}>Mushaf</span>
            </button>
          )}
        </div>
      )}

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2">
        <span className="text-xs font-semibold tracking-wide" style={{ color: 'rgba(212,175,55,0.85)' }}>
          {phaseLabel || `Étape ${stepNumber}/${totalSteps}`}
        </span>
        <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>—</span>
        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>
          {stepTitle}
        </span>
      </div>

      {children}

      {/* Return to home — discreet, bottom-right */}
      {onPause && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="flex justify-end pt-2"
        >
          <button
            onClick={onPause}
            className="text-[10px] tracking-wide transition-all active:scale-95"
            style={{ color: 'rgba(255,255,255,0.25)' }}
          >
            ← Retourner à l'accueil
          </button>
        </motion.div>
      )}

      {/* Floating Mushaf FAB — bottom-left, always visible */}
      <AnimatePresence>
        {mushafPage && (
          <motion.button
            key="mushaf-fab"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ delay: 0.8 }}
            onClick={() => window.open(`/quran-reader?page=${mushafPage}`, '_blank')}
            className="fixed bottom-24 left-4 z-50 flex items-center gap-1.5 px-3 py-2.5 rounded-full shadow-lg transition-all active:scale-95"
            style={{
              background: 'linear-gradient(135deg, rgba(5,150,105,0.9), rgba(4,120,87,0.95))',
              border: '1px solid rgba(255,255,255,0.15)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <BookOpen className="h-4 w-4" style={{ color: 'rgba(255,255,255,0.9)' }} />
            <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.9)' }}>
              Mushaf
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
