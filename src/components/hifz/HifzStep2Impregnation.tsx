import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Headphones, Check, Play, Pause, BookOpen, RotateCcw } from 'lucide-react';
import HifzStepWrapper from './HifzStepWrapper';
import { RECITERS } from '@/hooks/useQuranAudio';
import { SURAHS } from '@/lib/surahData';

interface Props {
  surahNumber: number;
  startVerse: number;
  endVerse: number;
  onNext: () => void;
  onBack: () => void;
}

export default function HifzStep2Impregnation({ surahNumber, startVerse, endVerse, onNext, onBack }: Props) {
  const navigate = useNavigate();
  const storageKey = `hifz_listen_${surahNumber}_${startVerse}_${endVerse}`;

  const [listenCount, setListenCount] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? parseInt(saved, 10) || 0 : 0;
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [reciter, setReciter] = useState('ar.alafasy');
  const [currentAyahIndex, setCurrentAyahIndex] = useState(-1);
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

  // Calculate Mushaf page from surah data
  const mushafPage = SURAHS.find(s => s.number === surahNumber)?.startPage ?? 1;
  const mushafImageUrl = `https://cdn.jsdelivr.net/gh/QuranHub/quran-pages-images@main/easyquran.com/hafs-tajweed/${mushafPage}.jpg`;

  const fetchAudio = useCallback(async () => {
    try {
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

  const openInMushaf = () => {
    localStorage.setItem('quran_reader_page', String(mushafPage));
    navigate('/quran-reader');
  };

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
          Écoute attentivement le récitateur au moins 3 fois. Tu peux écouter autant de fois que tu le souhaites.
        </p>

        {/* Mushaf image display */}
        <div
          className="max-h-64 overflow-auto w-full rounded-xl"
          style={{ border: '1px solid rgba(212,175,55,0.25)' }}
        >
          <img
            src={mushafImageUrl}
            alt={`Page ${mushafPage} du Mushaf`}
            className="w-full h-auto"
            loading="eager"
          />
        </div>

        {/* Mushaf link */}
        <button
          onClick={openInMushaf}
          className="flex items-center justify-center gap-2 mx-auto px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-95"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(212,175,55,0.2)', color: '#d4af37' }}
        >
          <BookOpen className="h-4 w-4" />
          Ouvrir dans le Mushaf
        </button>

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
            className="w-full rounded-2xl py-4 flex items-center justify-center gap-2 font-semibold"
            style={{
              background: listenCount >= 3
                ? 'linear-gradient(135deg, #d4af37, #b8962e)'
                : 'rgba(212,175,55,0.2)',
              color: listenCount >= 3 ? '#1a2e1a' : '#d4af37',
              border: listenCount < 3 ? '1px solid rgba(212,175,55,0.3)' : 'none',
            }}
          >
            <Check className="h-5 w-5" />
            {listenCount >= 3 ? 'Passer à la mémorisation' : `Passer quand même (${listenCount}/3)`}
          </motion.button>
        )}
      </div>
    </HifzStepWrapper>
  );
}
