import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Eye, EyeOff, Check } from 'lucide-react';
import HifzMushafToggle, { getMushafMode, setMushafMode, type MushafMode } from '../HifzMushafToggle';
import HifzMushafImage from '../HifzMushafImage';
import { getVersesByRange, type LocalAyah } from '@/lib/quranData';

interface Props {
  surahNumber: number;
  verseStart: number;
  verseEnd: number;
  onNext: () => void;
}

const FONT_FAMILY = "'Amiri Quran', 'Amiri', 'Scheherazade New', serif";
const TARGET = 5;

export default function StepGravure({ surahNumber, verseStart, verseEnd, onNext }: Props) {
  const [count, setCount] = useState(0);
  const [peekMode, setPeekMode] = useState(false);
  const [mushafMode, setMushafModeState] = useState<MushafMode>(getMushafMode);
  const [ayahs, setAyahs] = useState<LocalAyah[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getVersesByRange(surahNumber, verseStart, verseEnd)
      .then(setAyahs)
      .finally(() => setLoading(false));
  }, [surahNumber, verseStart, verseEnd]);

  // Auto-hide peek after 5 seconds
  useEffect(() => {
    if (peekMode) {
      const timer = setTimeout(() => setPeekMode(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [peekMode]);

  const done = count >= TARGET;

  const renderMushaf = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-4">
          <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: '#d4af37', borderTopColor: 'transparent' }} />
        </div>
      );
    }
    if (mushafMode === 'physical') {
      return (
        <div className="rounded-xl px-4 py-4 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,175,55,0.15)' }}>
          <p className="text-xs italic" style={{ color: 'rgba(255,255,255,0.45)' }}>📖 Vérifie depuis ton Mushaf physique.</p>
        </div>
      );
    }
    if (mushafMode === 'image') {
      return <HifzMushafImage surahNumber={surahNumber} startVerse={verseStart} endVerse={verseEnd} maxHeight="260px" />;
    }
    return (
      <div className="rounded-xl overflow-auto max-h-52 px-4 py-4" dir="rtl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212,175,55,0.12)' }}>
        <div style={{ fontFamily: FONT_FAMILY, fontSize: '20px', lineHeight: '44px', color: '#e8e0d0', textAlign: 'justify', textAlignLast: 'center' }}>
          {ayahs.map(a => (
            <span key={a.number}>
              {a.text}{' '}
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#2E7D32', color: '#fff', fontSize: '9px', fontFamily: 'system-ui', fontWeight: 700, verticalAlign: 'middle', margin: '0 2px' }}>
                {a.numberInSurah}
              </span>{' '}
            </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      className="space-y-5"
    >
      <div className="text-center space-y-2">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto"
          style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)' }}
        >
          <Brain className="h-7 w-7" style={{ color: '#d4af37' }} />
        </div>
        <h3 className="text-base font-bold" style={{ color: '#f0e6c8', fontFamily: "'Playfair Display', serif" }}>
          Gravure par le cœur
        </h3>
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Récitez de mémoire — sans Mushaf ni audio
        </p>
      </div>

      {/* Verify button */}
      <button
        onClick={() => setPeekMode(p => !p)}
        className="flex items-center justify-center gap-2 mx-auto px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-95"
        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(212,175,55,0.2)', color: '#d4af37' }}
      >
        {peekMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        {peekMode ? 'Masquer' : 'Vérifier'}
      </button>

      <AnimatePresence>
        {peekMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <HifzMushafToggle mode={mushafMode} onChange={m => { setMushafModeState(m); setMushafMode(m); }} />
            <div className="mt-2">{renderMushaf()}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {!peekMode && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl px-4 py-3 mx-auto max-w-xs"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <p className="text-xs italic leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Fermez les yeux et récitez de mémoire. En cas de doute, appuyez sur « Vérifier » pour un bref aperçu (5s).
          </p>
        </motion.div>
      )}

      {/* Interactive circular counter */}
      <div className="flex justify-center">
        <div className="relative w-36 h-36">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
            {/* Segments */}
            {Array.from({ length: TARGET }).map((_, i) => {
              const segmentAngle = 276 / TARGET;
              const gap = 4;
              const filled = i < count;
              return (
                <circle
                  key={i}
                  cx="50" cy="50" r="44" fill="none"
                  stroke={filled ? '#d4af37' : 'rgba(255,255,255,0.12)'}
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={`${segmentAngle - gap} ${276 - segmentAngle + gap}`}
                  strokeDashoffset={`${-i * segmentAngle}`}
                  style={{ transition: 'stroke 0.3s ease' }}
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold" style={{ color: done ? '#d4af37' : '#f0e6c8' }}>
              {count}
            </span>
            <span className="text-white/40 text-[10px]">/ {TARGET}</span>
          </div>
        </div>
      </div>

      {!done && (
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={() => { setCount(c => Math.min(c + 1, TARGET)); try { navigator?.vibrate?.(40); } catch {} }}
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
          style={{ background: 'rgba(212,175,55,0.15)', border: '2px solid rgba(212,175,55,0.4)' }}
        >
          <span className="text-2xl font-bold" style={{ color: '#d4af37' }}>+1</span>
        </motion.button>
      )}

      {done && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileTap={{ scale: 0.97 }}
          onClick={onNext}
          className="w-full rounded-2xl py-3.5 flex items-center justify-center gap-2 font-semibold text-sm"
          style={{ background: 'linear-gradient(135deg, #d4af37, #b8962e)', color: '#1a2e1a' }}
        >
          <Check className="h-4 w-4" />
          Continuer
        </motion.button>
      )}
    </motion.div>
  );
}
