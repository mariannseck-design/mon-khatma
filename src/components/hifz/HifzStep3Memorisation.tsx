import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Check, Play, Pause, Eye, EyeOff, RotateCcw } from 'lucide-react';
import HifzStepWrapper from './HifzStepWrapper';
import { SURAHS } from '@/lib/surahData';

interface Props {
  surahNumber: number;
  startVerse: number;
  endVerse: number;
  repetitionLevel: number;
  onNext: () => void;
  onBack: () => void;
}

// Persist ancrage to avoid losing progress
function getStorageKey(surah: number, start: number, end: number) {
  return `hifz_ancrage_${surah}_${start}_${end}`;
}

export default function HifzStep3Memorisation({ surahNumber, startVerse, endVerse, repetitionLevel, onNext, onBack }: Props) {
  const navigate = useNavigate();
  const storageKey = getStorageKey(surahNumber, startVerse, endVerse);

  const [ancrage, setAncrage] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? Math.min(parseInt(saved, 10) || 0, repetitionLevel) : 0;
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [showMushaf, setShowMushaf] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ayahsRef = useRef<{ audio: string }[]>([]);
  const indexRef = useRef(0);
  const reciter = localStorage.getItem('quran_reciter') || 'ar.alafasy';

  // Mushaf image
  const mushafPage = SURAHS.find(s => s.number === surahNumber)?.startPage ?? 1;
  const mushafImageUrl = `https://cdn.jsdelivr.net/gh/QuranHub/quran-pages-images@main/easyquran.com/hafs-tajweed/${mushafPage}.jpg`;

  // Persist ancrage
  useEffect(() => {
    localStorage.setItem(storageKey, String(ancrage));
  }, [ancrage, storageKey]);

  // Clear persisted ancrage when completed
  useEffect(() => {
    if (ancrage >= repetitionLevel) {
      localStorage.removeItem(storageKey);
    }
  }, [ancrage, repetitionLevel, storageKey]);

  useEffect(() => {
    const fetchAyahs = async () => {
      try {
        const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/${reciter}`);
        const data = await res.json();
        if (data.code === 200) {
          ayahsRef.current = data.data.ayahs
            .filter((a: any) => a.numberInSurah >= startVerse && a.numberInSurah <= endVerse)
            .map((a: any) => ({ audio: a.audio }));
        }
      } catch { /* ignore */ }
    };
    fetchAyahs();
  }, [surahNumber, startVerse, endVerse, reciter]);

  const playNextAyah = useCallback((idx: number) => {
    if (idx >= ayahsRef.current.length) {
      setIsPlaying(false);
      setAncrage(prev => prev + 1);
      indexRef.current = 0;
      return;
    }
    indexRef.current = idx;
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
      playNextAyah(0);
    }
  };

  useEffect(() => {
    return () => { audioRef.current?.pause(); };
  }, []);

  const openInMushaf = () => {
    localStorage.setItem('quran_reader_page', String(mushafPage));
    navigate('/quran-reader');
  };

  const progress = Math.min((ancrage / repetitionLevel) * 100, 100);

  return (
    <HifzStepWrapper stepNumber={3} stepTitle="Mémorisation Active" onBack={onBack}>
      <div className="text-center space-y-5">
        <div
          className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center"
          style={{ background: 'rgba(212,175,55,0.2)', border: '1px solid rgba(212,175,55,0.3)' }}
        >
          <BookOpen className="h-8 w-8" style={{ color: '#d4af37' }} />
        </div>

        <p className="text-white/80 text-sm leading-relaxed px-2">
          C'est le moment de l'ancrage. Répète ce passage {repetitionLevel} fois avec une concentration totale.
          Que la paix soit sur les prophètes (aleyhi salam) qui ont porté ce message avant nous.
        </p>

        {/* Big counter */}
        <div className="relative w-32 h-32 mx-auto">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
            <circle
              cx="50" cy="50" r="44" fill="none"
              stroke="#d4af37" strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${progress * 2.76} 276`}
              style={{ transition: 'stroke-dasharray 0.5s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold" style={{ color: '#d4af37' }}>{ancrage}</span>
            <span className="text-white/40 text-xs">/ {repetitionLevel}</span>
          </div>
        </div>
        <p className="text-white/50 text-xs uppercase tracking-wider">Ancrage {ancrage}/{repetitionLevel}</p>

        {ancrage > 0 && ancrage < repetitionLevel && (
          <button
            onClick={() => { setAncrage(0); localStorage.removeItem(storageKey); audioRef.current?.pause(); setIsPlaying(false); }}
            className="flex items-center justify-center gap-1.5 mx-auto px-3 py-1.5 rounded-lg text-xs transition-all active:scale-95"
            style={{ color: 'rgba(255,255,255,0.4)' }}
          >
            <RotateCcw className="h-3 w-3" />
            Recommencer
          </button>
        )}

        <div className="relative">
          <button
            onClick={() => setShowMushaf(!showMushaf)}
            className="flex items-center justify-center gap-2 mx-auto px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-95 mb-3"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(212,175,55,0.2)', color: '#d4af37' }}
          >
            {showMushaf ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showMushaf ? 'Masquer le passage' : 'Voir le passage'}
          </button>

          {showMushaf && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3"
            >
              <div
                className="max-h-56 overflow-auto w-full rounded-xl"
                style={{ border: '1px solid rgba(212,175,55,0.25)' }}
              >
                <img
                  src={mushafImageUrl}
                  alt={`Page ${mushafPage} du Mushaf`}
                  className="w-full h-auto"
                  loading="eager"
                />
              </div>
              <button
                onClick={openInMushaf}
                className="flex items-center justify-center gap-2 mx-auto px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-95"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(212,175,55,0.2)', color: '#d4af37' }}
              >
                <BookOpen className="h-4 w-4" />
                Ouvrir dans le Mushaf
              </button>
            </motion.div>
          )}
        </div>

        {/* Play button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={togglePlay}
          disabled={ancrage >= repetitionLevel}
          className="w-20 h-20 rounded-full mx-auto flex items-center justify-center"
          style={{
            background: isPlaying ? 'rgba(212,175,55,0.3)' : 'rgba(255,255,255,0.1)',
            border: `2px solid ${isPlaying ? '#d4af37' : 'rgba(255,255,255,0.2)'}`,
            opacity: ancrage >= repetitionLevel ? 0.4 : 1,
          }}
        >
          {isPlaying
            ? <Pause className="h-8 w-8" style={{ color: '#d4af37' }} />
            : <Play className="h-8 w-8 ml-1" style={{ color: '#d4af37' }} />
          }
        </motion.button>

        {ancrage >= repetitionLevel && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.97 }}
            onClick={onNext}
            className="w-full rounded-2xl py-4 flex items-center justify-center gap-2 font-semibold"
            style={{ background: 'linear-gradient(135deg, #d4af37, #b8962e)', color: '#1a2e1a' }}
          >
            <Check className="h-5 w-5" />
            Passer au test de validation
          </motion.button>
        )}
      </div>
    </HifzStepWrapper>
  );
}
