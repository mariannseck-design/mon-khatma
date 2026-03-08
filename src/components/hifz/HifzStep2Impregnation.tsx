import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Headphones, Check, Play, Pause, RotateCcw, ZoomIn, ZoomOut, BookOpen, ChevronDown } from 'lucide-react';
import HifzStepWrapper from './HifzStepWrapper';
import { RECITERS, getAyahAudioUrl } from '@/hooks/useQuranAudio';
import { SURAHS, getApproxVersePage } from '@/lib/surahData';

interface Props {
  surahNumber: number;
  startVerse: number;
  endVerse: number;
  onNext: () => void;
  onBack: () => void;
}

const MUSHAF_ZOOM_LEVELS = ['Petit', 'Moyen', 'Grand'] as const;
const MUSHAF_SCALES = [1, 1.5, 2.2];
const MUSHAF_CONTAINER_HEIGHTS = ['max-h-48', 'max-h-72', 'max-h-[500px]'];

export default function HifzStep2Impregnation({ surahNumber, startVerse, endVerse, onNext, onBack }: Props) {
  const storageKey = `hifz_listen_${surahNumber}_${startVerse}_${endVerse}`;
  const surahName = SURAHS.find(s => s.number === surahNumber)?.name || '';

  const [listenCount, setListenCount] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? parseInt(saved, 10) || 0 : 0;
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [reciter, setReciter] = useState('ar.alafasy');
  const [currentAyahIndex, setCurrentAyahIndex] = useState(-1);
  const [mushafZoom, setMushafZoom] = useState(1);
  const [translation, setTranslation] = useState<string[]>([]);
  const [translationLoading, setTranslationLoading] = useState(true);
  const [showTranslation, setShowTranslation] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ayahsRef = useRef<{ audio: string; numberInSurah: number }[]>([]);
  const indexRef = useRef(0);

  // Persist listen count
  useEffect(() => {
    localStorage.setItem(storageKey, String(listenCount));
  }, [listenCount, storageKey]);

  // Clear when moving to next step (3+ listens achieved)
  useEffect(() => {
    if (listenCount >= 3) {
      localStorage.removeItem(storageKey);
    }
  }, [listenCount, storageKey]);

  // Fetch Hamidullah translation
  useEffect(() => {
    const fetchTranslation = async () => {
      setTranslationLoading(true);
      try {
        const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/fr.hamidullah`);
        const data = await res.json();
        if (data.code === 200) {
          const ayahs = data.data.ayahs
            .filter((a: any) => a.numberInSurah >= startVerse && a.numberInSurah <= endVerse)
            .map((a: any) => `${a.numberInSurah}. ${a.text}`);
          setTranslation(ayahs);
        }
      } catch {
        setTranslation(['Traduction non disponible.']);
      } finally {
        setTranslationLoading(false);
      }
    };
    fetchTranslation();
  }, [surahNumber, startVerse, endVerse]);

  // Calculate exact Mushaf page from surah + verse number
  const mushafPage = getApproxVersePage(surahNumber, startVerse);
  const mushafImageUrl = `https://cdn.jsdelivr.net/gh/QuranHub/quran-pages-images@main/easyquran.com/hafs-tajweed/${mushafPage}.jpg`;

  const fetchAudio = useCallback(async () => {
    try {
      // Check if this reciter uses everyayah (direct URLs)
      const testUrl = getAyahAudioUrl(reciter, surahNumber, startVerse);
      if (testUrl) {
        // Build direct URLs for each ayah
        const ayahs = [];
        for (let v = startVerse; v <= endVerse; v++) {
          ayahs.push({
            audio: getAyahAudioUrl(reciter, surahNumber, v)!,
            numberInSurah: v,
          });
        }
        ayahsRef.current = ayahs;
        return;
      }

      // Fallback: alquran.cloud API
      const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/${reciter}`);
      const data = await res.json();
      if (data.code === 200) {
        const filtered = data.data.ayahs
          .filter((a: any) => a.numberInSurah >= startVerse && a.numberInSurah <= endVerse)
          .map((a: any) => ({ audio: a.audio, numberInSurah: a.numberInSurah }));
        ayahsRef.current = filtered;
      }
    } catch { /* ignore */ }
  }, [surahNumber, startVerse, endVerse, reciter]);

  useEffect(() => { fetchAudio(); }, [fetchAudio]);

  const playNextAyah = useCallback((idx: number) => {
    if (idx >= ayahsRef.current.length) {
      setIsPlaying(false);
      setCurrentAyahIndex(-1);
      setListenCount(prev => prev + 1);
      indexRef.current = 0;
      return;
    }
    indexRef.current = idx;
    setCurrentAyahIndex(idx);
    const audio = new Audio(ayahsRef.current[idx].audio);
    audioRef.current = audio;
    audio.onended = () => playNextAyah(idx + 1);
    audio.onerror = () => playNextAyah(idx + 1);
    audio.play().catch(() => setIsPlaying(false));
  }, []);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      playNextAyah(indexRef.current);
    }
  };

  useEffect(() => {
    return () => { audioRef.current?.pause(); };
  }, []);

  return (
    <HifzStepWrapper stepNumber={2} stepTitle="Imprégnation & Sens" onBack={onBack}>
      <div className="text-center space-y-5">
        <div
          className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center"
          style={{ background: 'rgba(212,175,55,0.2)', border: '1px solid rgba(212,175,55,0.3)' }}
        >
          <Headphones className="h-8 w-8" style={{ color: '#d4af37' }} />
        </div>

        <p className="text-white/80 text-sm leading-relaxed px-2">
          Écoute attentivement le récitateur. L'idéal est d'écouter 3 fois, mais tu peux passer dès la 1ère écoute.
        </p>

        {/* Mushaf image display with zoom controls */}
        <div className="space-y-2">
          <div className="flex items-center justify-end gap-1.5 px-1">
            <button
              onClick={() => setMushafZoom(z => Math.max(0, z - 1))}
              disabled={mushafZoom === 0}
              className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-30 transition-all active:scale-95"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(212,175,55,0.15)' }}
            >
              <ZoomOut className="h-3.5 w-3.5" style={{ color: '#d4af37' }} />
            </button>
            <span className="text-xs px-2" style={{ color: 'rgba(255,255,255,0.5)' }}>{MUSHAF_ZOOM_LEVELS[mushafZoom]}</span>
            <button
              onClick={() => setMushafZoom(z => Math.min(2, z + 1))}
              disabled={mushafZoom === 2}
              className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-30 transition-all active:scale-95"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(212,175,55,0.15)' }}
            >
              <ZoomIn className="h-3.5 w-3.5" style={{ color: '#d4af37' }} />
            </button>
          </div>
          <div
            className={`${MUSHAF_CONTAINER_HEIGHTS[mushafZoom]} overflow-auto w-full rounded-xl transition-all duration-300`}
            style={{ border: '1px solid rgba(212,175,55,0.25)' }}
          >
            <img
              src={mushafImageUrl}
              alt={`Page ${mushafPage} du Mushaf`}
              className="h-auto origin-top-left transition-all duration-300"
              style={{ width: `${MUSHAF_SCALES[mushafZoom] * 100}%` }}
              loading="eager"
            />
          </div>
        </div>

        {/* Hamidullah Translation - collapsible */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(212,175,55,0.15)' }}
        >
          <button
            onClick={() => setShowTranslation(v => !v)}
            className="w-full flex items-center justify-between px-4 py-3 text-left transition-all active:scale-[0.99]"
          >
            <span className="flex items-center gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
              <BookOpen className="h-4 w-4" style={{ color: '#d4af37' }} />
              Traduction — {surahName} (v.{startVerse}-{endVerse})
            </span>
            <ChevronDown
              className="h-4 w-4 transition-transform duration-200"
              style={{ color: 'rgba(255,255,255,0.4)', transform: showTranslation ? 'rotate(180deg)' : 'rotate(0deg)' }}
            />
          </button>
          <AnimatePresence>
            {showTranslation && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4">
                  {translationLoading ? (
                    <div className="flex items-center justify-center py-6">
                      <div className="w-6 h-6 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto text-left">
                      {translation.map((verse, i) => (
                        <p key={i} className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>{verse}</p>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Reciter selector */}
        <select
          value={reciter}
          onChange={e => { setReciter(e.target.value); audioRef.current?.pause(); setIsPlaying(false); }}
          className="w-full rounded-xl px-4 py-3 text-sm outline-none"
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(212,175,55,0.2)',
            color: 'white',
            fontSize: '16px',
          }}
        >
          {RECITERS.map(r => (
            <option key={r.id} value={r.id} style={{ background: '#0d4f4f' }}>{r.name}</option>
          ))}
        </select>

        {/* Play button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={togglePlay}
          className="w-20 h-20 rounded-full mx-auto flex items-center justify-center"
          style={{
            background: isPlaying ? 'rgba(212,175,55,0.3)' : 'rgba(255,255,255,0.1)',
            border: `2px solid ${isPlaying ? '#d4af37' : 'rgba(255,255,255,0.2)'}`,
          }}
        >
          {isPlaying
            ? <Pause className="h-8 w-8" style={{ color: '#d4af37' }} />
            : <Play className="h-8 w-8 ml-1" style={{ color: '#d4af37' }} />
          }
        </motion.button>

        {/* Listen count */}
        <div className="flex items-center justify-center gap-3">
          {[1, 2, 3].map(n => (
            <div
              key={n}
              className="w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all"
              style={{
                background: n <= listenCount ? 'rgba(212,175,55,0.3)' : 'rgba(255,255,255,0.06)',
                border: `2px solid ${n <= listenCount ? '#d4af37' : 'rgba(255,255,255,0.1)'}`,
                color: n <= listenCount ? '#d4af37' : 'rgba(255,255,255,0.3)',
              }}
            >
              {n <= listenCount ? '✓' : n}
            </div>
          ))}
        </div>
        <p className="text-white/40 text-xs">
          Écoute {listenCount}/3{listenCount > 3 ? ` (${listenCount} au total)` : ''}
        </p>

        {listenCount > 0 && (
          <button
            onClick={() => {
              if (window.confirm('Réinitialiser le compteur d\'écoute ? Ta progression sera perdue.')) {
                setListenCount(0); localStorage.removeItem(storageKey); audioRef.current?.pause(); setIsPlaying(false);
              }
            }}
            className="flex items-center justify-center gap-1.5 mx-auto px-3 py-1.5 rounded-lg text-xs transition-all active:scale-95"
            style={{ color: 'rgba(255,255,255,0.4)' }}
          >
            <RotateCcw className="h-3 w-3" />
            Recommencer
          </button>
        )}

        {listenCount >= 1 && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.97 }}
            onClick={onNext}
            className="w-full rounded-2xl py-4 font-semibold flex items-center justify-center gap-2"
            style={{
              background: 'linear-gradient(135deg, #d4af37, #b8962e)',
              color: '#1a2e1a',
            }}
          >
            <Check className="h-5 w-5" />
            Passer à la mémorisation
          </motion.button>
        )}
      </div>
    </HifzStepWrapper>
  );
}
