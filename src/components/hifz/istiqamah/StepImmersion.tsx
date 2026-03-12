import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Check, X, BookOpen, RefreshCw } from 'lucide-react';
import { RECITERS, getAyahAudioUrl } from '@/hooks/useQuranAudio';
import HifzMushafToggle, { getMushafMode, setMushafMode, type MushafMode } from '../HifzMushafToggle';
import HifzMushafImage from '../HifzMushafImage';
import { getVersesByRange, type LocalAyah } from '@/lib/quranData';

interface Props {
  surahNumber: number;
  verseStart: number;
  verseEnd: number;
  onNext: () => void;
}

type Phase = 'listen' | 'memory' | 'error';

const TARGET_LISTENS = 3;
const TARGET_MEMORY = 3;
const FONT_FAMILY = "'Amiri Quran', 'Amiri', 'Scheherazade New', serif";

export default function StepImmersion({ surahNumber, verseStart, verseEnd, onNext }: Props) {
  const totalVerses = verseEnd - verseStart + 1;
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('listen');
  const [listenCount, setListenCount] = useState(0);
  const [memoryCount, setMemoryCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mushafMode, setMushafModeState] = useState<MushafMode>(getMushafMode);
  const [ayahs, setAyahs] = useState<LocalAyah[]>([]);
  const [loading, setLoading] = useState(true);

  const isPlayingRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [reciter] = useState(() => localStorage.getItem('quran_reciter') || 'ar.alafasy');

  const currentVerse = verseStart + currentVerseIndex;

  // Load verse texts
  useEffect(() => {
    setLoading(true);
    getVersesByRange(surahNumber, verseStart, verseEnd)
      .then(setAyahs)
      .finally(() => setLoading(false));
  }, [surahNumber, verseStart, verseEnd]);

  // Get audio URL for current verse
  const getAudioUrl = useCallback(async (verse: number): Promise<string | null> => {
    const url = getAyahAudioUrl(reciter, surahNumber, verse);
    if (url) return url;
    // Fallback: fetch from alquran.cloud API
    try {
      const res = await fetch(`https://api.alquran.cloud/v1/ayah/${surahNumber}:${verse}/${reciter}`);
      const data = await res.json();
      if (data.code === 200) return data.data.audio;
    } catch {}
    return null;
  }, [reciter, surahNumber]);

  // Play a single verse audio once
  const playOnce = useCallback(async () => {
    if (isPlayingRef.current) return;
    const url = await getAudioUrl(currentVerse);
    if (!url) return;

    isPlayingRef.current = true;
    setIsPlaying(true);
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.onended = () => {
      isPlayingRef.current = false;
      setIsPlaying(false);
      setListenCount(prev => prev + 1);
    };
    audio.onerror = () => {
      isPlayingRef.current = false;
      setIsPlaying(false);
    };
    audio.play().catch(() => {
      isPlayingRef.current = false;
      setIsPlaying(false);
    });
  }, [currentVerse, getAudioUrl]);

  // Stop audio
  const stopAudio = useCallback(() => {
    isPlayingRef.current = false;
    audioRef.current?.pause();
    audioRef.current = null;
    setIsPlaying(false);
  }, []);

  // Auto-transition from listen → memory when 3 listens done
  useEffect(() => {
    if (listenCount >= TARGET_LISTENS && phase === 'listen') {
      setPhase('memory');
    }
  }, [listenCount, phase]);

  // Cleanup
  useEffect(() => () => { stopAudio(); }, []);

  // Reset state when verse changes
  useEffect(() => {
    stopAudio();
    setListenCount(0);
    setMemoryCount(0);
    setPhase('listen');
  }, [currentVerseIndex]);

  const handleMemoryCorrect = () => {
    const next = memoryCount + 1;
    setMemoryCount(next);
    if (next >= TARGET_MEMORY) {
      // Verse memorized — move to next or finish
      if (currentVerseIndex + 1 >= totalVerses) {
        onNext();
      } else {
        setCurrentVerseIndex(prev => prev + 1);
      }
    }
  };

  const handleMemoryError = () => {
    setPhase('error');
  };

  const handleRereadDone = () => {
    // Reset listen phase for this verse
    setListenCount(0);
    setMemoryCount(0);
    setPhase('listen');
  };

  const currentAyah = ayahs.find(a => a.numberInSurah === currentVerse);

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
          <p className="text-xs italic" style={{ color: 'rgba(255,255,255,0.45)' }}>📖 Lis le verset {currentVerse} depuis ton Mushaf physique.</p>
        </div>
      );
    }
    if (mushafMode === 'image') {
      return <HifzMushafImage surahNumber={surahNumber} startVerse={currentVerse} endVerse={currentVerse} maxHeight="240px" />;
    }
    // Text mode
    if (!currentAyah) return null;
    return (
      <div className="rounded-xl px-4 py-4" dir="rtl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212,175,55,0.12)' }}>
        <div style={{ fontFamily: FONT_FAMILY, fontSize: '22px', lineHeight: '48px', color: '#e8e0d0', textAlign: 'center' }}>
          {currentAyah.text}{' '}
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#2E7D32', color: '#fff', fontSize: '10px', fontFamily: 'system-ui', fontWeight: 700, verticalAlign: 'middle' }}>
            {currentAyah.numberInSurah}
          </span>
        </div>
      </div>
    );
  };

  // Circular progress component
  const CircularCounter = ({ count, target, color }: { count: number; target: number; color: string }) => (
    <div className="relative w-28 h-28">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
        <circle
          cx="50" cy="50" r="44" fill="none"
          stroke={count >= target ? '#d4af37' : color}
          strokeWidth="6" strokeLinecap="round"
          strokeDasharray={`${(count / target) * 276} 276`}
          style={{ transition: 'stroke-dasharray 0.5s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold" style={{ color: count >= target ? '#d4af37' : color }}>{count}</span>
        <span className="text-white/40 text-[10px]">/ {target}</span>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      className="space-y-4"
    >
      {/* Verse progress pills */}
      <div className="flex items-center justify-center gap-1.5 flex-wrap">
        {Array.from({ length: totalVerses }, (_, i) => (
          <div
            key={i}
            className="h-2 rounded-full transition-all duration-300"
            style={{
              width: i === currentVerseIndex ? '24px' : '10px',
              background: i < currentVerseIndex
                ? '#d4af37'
                : i === currentVerseIndex
                  ? '#4ecdc4'
                  : 'rgba(255,255,255,0.15)',
            }}
          />
        ))}
      </div>

      {/* Verse indicator */}
      <div className="text-center">
        <span className="text-[11px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Verset {currentVerse} — {currentVerseIndex + 1}/{totalVerses}
        </span>
      </div>

      <AnimatePresence mode="wait">
        {/* ===== PHASE: LISTEN ===== */}
        {phase === 'listen' && (
          <motion.div
            key="listen"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="text-center space-y-1.5">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto"
                style={{ background: 'rgba(78,205,196,0.15)', border: '1px solid rgba(78,205,196,0.3)' }}
              >
                <Volume2 className="h-6 w-6" style={{ color: '#4ecdc4' }} />
              </div>
              <h3 className="text-sm font-bold" style={{ color: '#f0e6c8', fontFamily: "'Playfair Display', serif" }}>
                Écouter & répéter
              </h3>
              <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.45)' }}>
                Écoutez ce verset 3 fois avec le récitateur
              </p>
            </div>

            {/* Mushaf display for reference */}
            <div className="space-y-2">
              <HifzMushafToggle mode={mushafMode} onChange={m => { setMushafModeState(m); setMushafMode(m); }} />
              {renderMushaf()}
            </div>

            {/* Counter + Play */}
            <div className="flex flex-col items-center gap-3">
              <CircularCounter count={listenCount} target={TARGET_LISTENS} color="#4ecdc4" />
              {listenCount < TARGET_LISTENS && (
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={isPlaying ? stopAudio : playOnce}
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{
                    background: isPlaying ? 'rgba(78,205,196,0.2)' : 'rgba(212,175,55,0.15)',
                    border: `2px solid ${isPlaying ? 'rgba(78,205,196,0.5)' : 'rgba(212,175,55,0.4)'}`,
                  }}
                >
                  <Volume2 className="h-7 w-7" style={{ color: isPlaying ? '#4ecdc4' : '#d4af37' }} />
                </motion.button>
              )}
            </div>
          </motion.div>
        )}

        {/* ===== PHASE: MEMORY ===== */}
        {phase === 'memory' && (
          <motion.div
            key="memory"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="text-center space-y-1.5">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto"
                style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)' }}
              >
                <BookOpen className="h-6 w-6" style={{ color: '#d4af37' }} />
              </div>
              <h3 className="text-sm font-bold" style={{ color: '#f0e6c8', fontFamily: "'Playfair Display', serif" }}>
                Réciter de mémoire
              </h3>
              <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.45)' }}>
                Récitez ce verset de mémoire — sans aide
              </p>
            </div>

            <div className="flex justify-center">
              <CircularCounter count={memoryCount} target={TARGET_MEMORY} color="#d4af37" />
            </div>

            {memoryCount < TARGET_MEMORY && (
              <div className="flex items-center justify-center gap-3">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleMemoryCorrect}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm"
                  style={{ background: 'rgba(46,125,50,0.2)', border: '1px solid rgba(46,125,50,0.4)', color: '#66bb6a' }}
                >
                  <Check className="h-4 w-4" />
                  Correct
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleMemoryError}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm"
                  style={{ background: 'rgba(211,47,47,0.15)', border: '1px solid rgba(211,47,47,0.3)', color: '#ef5350' }}
                >
                  <X className="h-4 w-4" />
                  Erreur
                </motion.button>
              </div>
            )}

            <div
              className="rounded-xl px-4 py-2.5 mx-auto max-w-sm"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <p className="text-[11px] italic leading-relaxed text-center" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Récitation {memoryCount + 1}/{TARGET_MEMORY} — Fermez les yeux et récitez à voix haute
              </p>
            </div>
          </motion.div>
        )}

        {/* ===== PHASE: ERROR — Reread Mushaf ===== */}
        {phase === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="text-center space-y-1.5">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto"
                style={{ background: 'rgba(211,47,47,0.12)', border: '1px solid rgba(211,47,47,0.25)' }}
              >
                <RefreshCw className="h-6 w-6" style={{ color: '#ef5350' }} />
              </div>
              <h3 className="text-sm font-bold" style={{ color: '#f0e6c8', fontFamily: "'Playfair Display', serif" }}>
                Relire le verset
              </h3>
              <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.45)' }}>
                Pas de panique ! Relis attentivement puis recommence
              </p>
            </div>

            {/* Mushaf display */}
            <div className="space-y-2">
              <HifzMushafToggle mode={mushafMode} onChange={m => { setMushafModeState(m); setMushafMode(m); }} />
              {renderMushaf()}
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleRereadDone}
              className="w-full rounded-2xl py-3 flex items-center justify-center gap-2 font-semibold text-sm"
              style={{ background: 'rgba(78,205,196,0.15)', border: '1px solid rgba(78,205,196,0.3)', color: '#4ecdc4' }}
            >
              <RefreshCw className="h-4 w-4" />
              J'ai relu — Recommencer
            </motion.button>

            <div
              className="rounded-xl px-4 py-2.5 mx-auto max-w-sm"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <p className="text-[11px] italic leading-relaxed text-center" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Ne soyez pas trop dur avec vous-même ; les erreurs se corrigeront naturellement avec la pratique.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
