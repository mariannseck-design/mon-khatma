import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Loader2, Play, Pause, RotateCcw } from 'lucide-react';
import type { VerseLineInfo } from './ImageVerseOverlay';

interface TranslationData {
  arabic: string;
  translation: string;
}

interface Props {
  verseKey: string | null;
  allVerses: VerseLineInfo[];
  onClose: () => void;
  onNavigate: (verseKey: string) => void;
}

export default function VerseTranslationDrawer({ verseKey, allVerses, onClose, onNavigate }: Props) {
  const [data, setData] = useState<TranslationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!verseKey) { setData(null); return; }
    let cancelled = false;
    setLoading(true);
    setError(false);

    const fetchTranslation = async () => {
      try {
        const res = await fetch(
          `https://api.quran.com/api/v4/verses/by_key/${verseKey}?language=fr&words=true&translations=136&word_fields=text_uthmani`
        );
        if (!res.ok) throw new Error('API error');
        const json = await res.json();
        if (cancelled) return;

        const verse = json.verse;
        const arabic = verse.words
          .filter((w: any) => w.char_type_name !== 'end')
          .map((w: any) => w.text_uthmani)
          .join(' ');
        const translation = verse.translations?.[0]?.text?.replace(/<[^>]*>/g, '') || '';

        setData({ arabic, translation });
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchTranslation();
    return () => { cancelled = true; };
  }, [verseKey]);

  const currentIdx = allVerses.findIndex(v => v.verseKey === verseKey);
  const canPrev = currentIdx > 0;
  const canNext = currentIdx < allVerses.length - 1;

  const handlePrev = () => {
    if (canPrev) onNavigate(allVerses[currentIdx - 1].verseKey);
  };
  const handleNext = () => {
    if (canNext) onNavigate(allVerses[currentIdx + 1].verseKey);
  };

  return (
    <AnimatePresence>
      {verseKey && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-40 rounded-t-2xl shadow-2xl"
          style={{
            background: '#faf8f2',
            borderTop: '1px solid rgba(122,139,111,0.15)',
            maxHeight: '55vh',
          }}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
        >
          {/* Handle */}
          <div className="flex justify-center pt-2 pb-1">
            <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(122,139,111,0.25)' }} />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-4 pb-2">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                disabled={!canPrev}
                className="w-7 h-7 rounded-full flex items-center justify-center disabled:opacity-25"
                style={{ color: '#5e6e54' }}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <span className="text-sm font-semibold" style={{ color: '#2d3a25' }}>
                {verseKey && `Verset ${verseKey.replace(':', ' : ')}`}
              </span>
              <button
                onClick={handleNext}
                disabled={!canNext}
                className="w-7 h-7 rounded-full flex items-center justify-center disabled:opacity-25"
                style={{ color: '#5e6e54' }}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full flex items-center justify-center"
              style={{ color: '#5e6e54' }}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Content */}
          <div className="px-4 pb-6 overflow-y-auto" style={{ maxHeight: 'calc(55vh - 70px)' }}>
            {loading && (
              <div className="flex justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin" style={{ color: '#7a8b6f' }} />
              </div>
            )}
            {error && (
              <p className="text-center text-sm py-4" style={{ color: '#8a6d1b' }}>
                Impossible de charger la traduction
              </p>
            )}
            {data && !loading && (
              <>
                {/* Arabic */}
                <p
                  className="text-right leading-loose mb-4 font-arabic"
                  style={{ fontSize: '24px', color: '#2d3a25', fontFamily: "'Scheherazade New', 'Amiri', serif" }}
                  dir="rtl"
                >
                  {data.arabic}
                </p>
                {/* Translation */}
                <p className="text-sm leading-relaxed" style={{ color: '#5e6e54' }}>
                  {data.translation}
                </p>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
