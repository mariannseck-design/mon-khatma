import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Headphones, Check, Play, Pause } from 'lucide-react';
import HifzStepWrapper from './HifzStepWrapper';
import { RECITERS } from '@/hooks/useQuranAudio';

interface Props {
  surahNumber: number;
  startVerse: number;
  endVerse: number;
  onNext: () => void;
  onBack: () => void;
}

export default function HifzStep2Impregnation({ surahNumber, startVerse, endVerse, onNext, onBack }: Props) {
  const [listenCount, setListenCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [reciter, setReciter] = useState('ar.alafasy');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ayahsRef = useRef<{ audio: string }[]>([]);
  const indexRef = useRef(0);

  const fetchAyahs = useCallback(async () => {
    try {
      const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/${reciter}`);
      const data = await res.json();
      if (data.code === 200) {
        ayahsRef.current = data.data.ayahs
          .filter((a: any) => a.numberInSurah >= startVerse && a.numberInSurah <= endVerse)
          .map((a: any) => ({ audio: a.audio }));
      }
    } catch { /* ignore */ }
  }, [surahNumber, startVerse, endVerse, reciter]);

  useEffect(() => { fetchAyahs(); }, [fetchAyahs]);

  const playNextAyah = useCallback((idx: number) => {
    if (idx >= ayahsRef.current.length) {
      setIsPlaying(false);
      setListenCount(prev => prev + 1);
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
      playNextAyah(indexRef.current);
    }
  };

  useEffect(() => {
    return () => { audioRef.current?.pause(); };
  }, []);

  return (
    <HifzStepWrapper stepNumber={2} stepTitle="Imprégnation & Sens" onBack={onBack}>
      <div className="text-center space-y-6">
        <div
          className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center"
          style={{ background: 'rgba(212,175,55,0.2)', border: '1px solid rgba(212,175,55,0.3)' }}
        >
          <Headphones className="h-8 w-8" style={{ color: '#d4af37' }} />
        </div>

        <p className="text-white/80 text-sm leading-relaxed px-2">
          Écoute attentivement le récitateur 3 fois. La mémorisation est plus forte quand le cœur comprend.
        </p>

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
        <p className="text-white/40 text-xs">Écoute {listenCount}/3</p>

        {listenCount >= 3 && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.97 }}
            onClick={onNext}
            className="w-full rounded-2xl py-4 flex items-center justify-center gap-2 font-semibold"
            style={{ background: 'linear-gradient(135deg, #d4af37, #b8962e)', color: '#1a2e1a' }}
          >
            <Check className="h-5 w-5" />
            Passer à la mémorisation
          </motion.button>
        )}
      </div>
    </HifzStepWrapper>
  );
}
