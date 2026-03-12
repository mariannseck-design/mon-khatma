import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Volume2, Check } from 'lucide-react';
import { RECITERS, getAyahAudioUrl } from '@/hooks/useQuranAudio';

interface Props {
  surahNumber: number;
  verseStart: number;
  verseEnd: number;
  onNext: () => void;
}

const TARGET_LISTENS = 3;

export default function StepImmersion({ surahNumber, verseStart, verseEnd, onNext }: Props) {
  const [listenCount, setListenCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const isPlayingRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [reciter] = useState(() => localStorage.getItem('quran_reciter') || 'ar.alafasy');
  const audiosRef = useRef<string[]>([]);

  useEffect(() => {
    const urls: string[] = [];
    for (let v = verseStart; v <= verseEnd; v++) {
      const url = getAyahAudioUrl(reciter, surahNumber, v);
      if (url) urls.push(url);
    }
    audiosRef.current = urls;

    if (urls.length === 0) {
      // For alquran.cloud reciters, fetch from API
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

  const playSequence = useCallback((idx: number) => {
    if (!isPlayingRef.current) return;
    if (idx >= audiosRef.current.length) {
      setListenCount(prev => {
        const next = prev + 1;
        if (next >= TARGET_LISTENS) {
          isPlayingRef.current = false;
          setIsPlaying(false);
        } else {
          setTimeout(() => { if (isPlayingRef.current) playSequence(0); }, 800);
        }
        return next;
      });
      return;
    }
    const audio = new Audio(audiosRef.current[idx]);
    audioRef.current = audio;
    audio.onended = () => playSequence(idx + 1);
    audio.onerror = () => playSequence(idx + 1);
    audio.play().catch(() => { isPlayingRef.current = false; setIsPlaying(false); });
  }, []);

  const startListening = () => {
    if (isPlayingRef.current) {
      isPlayingRef.current = false;
      audioRef.current?.pause();
      setIsPlaying(false);
      return;
    }
    isPlayingRef.current = true;
    setIsPlaying(true);
    playSequence(0);
  };

  useEffect(() => {
    return () => { isPlayingRef.current = false; audioRef.current?.pause(); };
  }, []);

  const done = listenCount >= TARGET_LISTENS;

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
          style={{ background: 'rgba(78,205,196,0.15)', border: '1px solid rgba(78,205,196,0.3)' }}
        >
          <Volume2 className="h-7 w-7" style={{ color: '#4ecdc4' }} />
        </div>
        <h3 className="text-base font-bold" style={{ color: '#f0e6c8', fontFamily: "'Playfair Display', serif" }}>
          Préparer l'oreille
        </h3>
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Écoutez le passage 3 fois attentivement pour sécuriser votre prononciation et votre Tajwid
        </p>
      </div>

      {/* Circular counter */}
      <div className="flex justify-center">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
            <circle
              cx="50" cy="50" r="44" fill="none"
              stroke={done ? '#d4af37' : '#4ecdc4'}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${(listenCount / TARGET_LISTENS) * 276} 276`}
              style={{ transition: 'stroke-dasharray 0.5s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold" style={{ color: done ? '#d4af37' : '#4ecdc4' }}>
              {listenCount}
            </span>
            <span className="text-white/40 text-[10px]">/ {TARGET_LISTENS}</span>
          </div>
        </div>
      </div>

      {/* Play/Pause button */}
      {!done && (
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={startListening}
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
          style={{
            background: isPlaying ? 'rgba(78,205,196,0.2)' : 'rgba(212,175,55,0.15)',
            border: `2px solid ${isPlaying ? 'rgba(78,205,196,0.5)' : 'rgba(212,175,55,0.4)'}`,
          }}
        >
          <Volume2 className="h-8 w-8" style={{ color: isPlaying ? '#4ecdc4' : '#d4af37' }} />
        </motion.button>
      )}

      {/* Encouragement note */}
      <div
        className="rounded-xl px-4 py-3 mx-auto max-w-sm"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <p className="text-xs italic leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Ne soyez pas trop dur avec vous-même ; les erreurs se corrigeront naturellement avec le temps et la pratique.
        </p>
      </div>

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
