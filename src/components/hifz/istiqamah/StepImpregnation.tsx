import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Check, Volume2 } from 'lucide-react';
import HifzMushafToggle, { getMushafMode, setMushafMode, type MushafMode } from '../HifzMushafToggle';
import HifzMushafImage from '../HifzMushafImage';
import { getVersesByRange, type LocalAyah } from '@/lib/quranData';
import { getAyahAudioUrl } from '@/hooks/useQuranAudio';
import { SURAHS } from '@/lib/surahData';
import { useGlobalAudio } from '@/contexts/AudioContext';

interface Props {
  surahNumber: number;
  verseStart: number;
  verseEnd: number;
  verseLabel?: string;
  reciterId?: string;
  onNext: () => void;
}

const FONT_FAMILY = "'Amiri Quran', 'Amiri', 'Scheherazade New', serif";
const TARGET = 10;

export default function StepImpregnation({ surahNumber, verseStart, verseEnd, verseLabel, reciterId, onNext }: Props) {
  const [count, setCount] = useState(0);
  const [mushafMode, setMushafModeState] = useState<MushafMode>(getMushafMode);
  const [ayahs, setAyahs] = useState<LocalAyah[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAyahIndex, setCurrentAyahIndex] = useState(-1);
  const isPlayingRef = useRef(false);
  const pausedRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audiosRef = useRef<string[]>([]);
  const reciter = reciterId || localStorage.getItem('quran_reciter') || 'ar.alafasy';
  const { registerAudio: registerGlobalAudio } = useGlobalAudio();
  const registerRef = useRef(registerGlobalAudio);
  registerRef.current = registerGlobalAudio;

  useEffect(() => {
    setLoading(true);
    getVersesByRange(surahNumber, verseStart, verseEnd)
      .then(setAyahs)
      .finally(() => setLoading(false));
  }, [surahNumber, verseStart, verseEnd]);

  useEffect(() => {
    const urls: string[] = [];
    for (let v = verseStart; v <= verseEnd; v++) {
      const url = getAyahAudioUrl(reciter, surahNumber, v);
      if (url) urls.push(url);
    }
    audiosRef.current = urls;
    if (urls.length === 0) {
      fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/${reciter}`)
        .then(r => r.json())
        .then(data => {
          if (data.code === 200) {
            audiosRef.current = data.data.ayahs
              .filter((a: any) => a.numberInSurah >= verseStart && a.numberInSurah <= verseEnd)
              .map((a: any) => a.audio);
          }
        })
        .catch(() => {});
    }
  }, [surahNumber, verseStart, verseEnd, reciter]);

  const playLoop = useCallback((idx: number) => {
    if (!isPlayingRef.current) { setCurrentAyahIndex(-1); return; }
    if (idx >= audiosRef.current.length) {
      setTimeout(() => { if (isPlayingRef.current) playLoop(0); }, 600);
      return;
    }
    setCurrentAyahIndex(idx);
    const audio = new Audio(audiosRef.current[idx]);
    audioRef.current = audio;
    registerRef.current(audio, { label: `${SURAHS.find(s => s.number === surahNumber)?.name || ''} · v.${verseStart}-${verseEnd}`, returnPath: window.location.pathname });
    audio.onended = () => playLoop(idx + 1);
    audio.onerror = () => playLoop(idx + 1);
    audio.play().catch(() => { isPlayingRef.current = false; setIsPlaying(false); setCurrentAyahIndex(-1); });
  }, []);

  const toggleAudio = () => {
    if (isPlayingRef.current) {
      // Pause: keep audio element and currentAyahIndex
      isPlayingRef.current = false;
      pausedRef.current = true;
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      isPlayingRef.current = true;
      setIsPlaying(true);
      // Resume from where we paused if audio element still exists
      if (pausedRef.current && audioRef.current && !audioRef.current.ended) {
        pausedRef.current = false;
        audioRef.current.play().catch(() => { isPlayingRef.current = false; setIsPlaying(false); });
      } else {
        pausedRef.current = false;
        playLoop(0);
      }
    }
  };

  useEffect(() => {
    return () => { isPlayingRef.current = false; pausedRef.current = false; audioRef.current?.pause(); setCurrentAyahIndex(-1); };
  }, []);

  const done = count >= TARGET;

  const renderMushaf = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: '#d4af37', borderTopColor: 'transparent' }} />
        </div>
      );
    }
    if (mushafMode === 'physical') {
      return (
        <div className="rounded-xl px-4 py-6 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,175,55,0.15)' }}>
          <p className="text-xs italic" style={{ color: 'rgba(255,255,255,0.45)' }}>📖 Ouvre ton Mushaf physique et suis depuis celui-ci.</p>
        </div>
      );
    }
    if (mushafMode === 'image') {
      return <HifzMushafImage surahNumber={surahNumber} startVerse={verseStart} endVerse={verseEnd} maxHeight="280px" />;
    }
    return (
      <div className="rounded-xl overflow-auto max-h-60 px-4 py-4" dir="rtl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212,175,55,0.12)' }}>
        <div style={{ fontFamily: FONT_FAMILY, fontSize: '22px', lineHeight: '48px', color: '#e8e0d0', textAlign: 'justify', textAlignLast: 'center' }}>
          {ayahs.map((a, idx) => {
            const isActive = isPlaying && currentAyahIndex === idx;
            return (
              <span
                key={a.number}
                style={{
                  borderRadius: '6px',
                  padding: isActive ? '2px 4px' : undefined,
                  backgroundColor: isActive ? 'rgba(212,175,55,0.15)' : undefined,
                  boxShadow: isActive ? '0 0 12px rgba(212,175,55,0.2)' : undefined,
                  transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
                }}
              >
                {a.text}{' '}
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: '18px', height: '18px', borderRadius: '50%',
                  backgroundColor: isActive ? '#d4af37' : '#2E7D32',
                  color: '#fff', fontSize: '10px', fontFamily: 'system-ui', fontWeight: 700,
                  verticalAlign: 'middle', margin: '0 3px',
                  transition: 'background-color 0.3s ease',
                }}>
                  {a.numberInSurah}
                </span>{' '}
              </span>
            );
          })}
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
          style={{ background: 'rgba(69,183,170,0.15)', border: '1px solid rgba(69,183,170,0.3)' }}
        >
          <RefreshCw className="h-7 w-7" style={{ color: '#45b7aa' }} />
        </div>
        <h3 className="text-base font-bold" style={{ color: '#f0e6c8', fontFamily: "'Playfair Display', serif" }}>
          Imprégnation{verseLabel ? ` — ${verseLabel}` : ''}
        </h3>
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Écoutez et répétez 5 à 10 fois en suivant sur le Mushaf
        </p>
      </div>

      <HifzMushafToggle mode={mushafMode} onChange={m => { setMushafModeState(m); setMushafMode(m); }} />

      {renderMushaf()}

      {/* Circular counter */}
      <div className="flex items-center justify-center gap-6">
        <div className="relative w-28 h-28">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
            <circle
              cx="50" cy="50" r="44" fill="none"
              stroke={done ? '#d4af37' : '#45b7aa'}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${Math.min((count / TARGET) * 276, 276)} 276`}
              style={{ transition: 'stroke-dasharray 0.5s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold" style={{ color: done ? '#d4af37' : '#45b7aa' }}>{count}</span>
            <span className="text-white/40 text-[10px]">/ {TARGET}</span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => { setCount(c => Math.min(c + 1, TARGET)); try { navigator?.vibrate?.(40); } catch {} }}
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(212,175,55,0.15)', border: '2px solid rgba(212,175,55,0.4)' }}
          >
            <span className="text-xl font-bold" style={{ color: '#d4af37' }}>+1</span>
          </motion.button>

          <button
            onClick={toggleAudio}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
            style={{
              background: isPlaying ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.06)',
              border: `1px solid ${isPlaying ? 'rgba(212,175,55,0.4)' : 'rgba(255,255,255,0.12)'}`,
            }}
          >
            <Volume2 className="h-4 w-4" style={{ color: isPlaying ? '#d4af37' : 'rgba(255,255,255,0.4)' }} />
          </button>
        </div>
      </div>

      {done && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => { isPlayingRef.current = false; audioRef.current?.pause(); setIsPlaying(false); onNext(); }}
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
