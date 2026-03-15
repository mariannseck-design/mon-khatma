import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Headphones, Check, Play, Pause, RotateCcw } from 'lucide-react';
import HifzStepWrapper from './HifzStepWrapper';
import HifzMushafImage from './HifzMushafImage';
import { RECITERS, getAyahAudioUrl } from '@/hooks/useQuranAudio';
import { SURAHS } from '@/lib/surahData';
import { useGlobalAudio } from '@/contexts/AudioContext';

interface Props {
  surahNumber: number;
  startVerse: number;
  endVerse: number;
  onNext: () => void;
  onBack: () => void;
  onPause?: () => void;
  phaseLabel?: string;
}


export default function HifzStepImpregnationTajweed({ surahNumber, startVerse, endVerse, onNext, onBack, onPause, phaseLabel }: Props) {
  const { registerAudio: registerGlobalAudio, stop: stopGlobal } = useGlobalAudio();
  const registerRef = useRef(registerGlobalAudio);
  registerRef.current = registerGlobalAudio;
  const generationRef = useRef(0);
  const isPlayingRef = useRef(false);
  const pausedRef = useRef<HTMLAudioElement | null>(null);

  // Hard-stop helper: fully kills current audio, clears handlers, prevents stale callbacks
  const hardStopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current.pause();
      try { audioRef.current.src = ''; } catch {}
    }
    audioRef.current = null;
  }, []);

  const storageKey = `hifz_listen_${surahNumber}_${startVerse}_${endVerse}`;
  const surahName = SURAHS.find(s => s.number === surahNumber)?.name || '';

  const [listenCount, setListenCount] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? parseInt(saved, 10) || 0 : 0;
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [reciter, setReciter] = useState(() => localStorage.getItem('quran_reciter') || 'ar.alafasy');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ayahsRef = useRef<{ audio: string; numberInSurah: number }[]>([]);
  const indexRef = useRef(0);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      generationRef.current++;
      isPlayingRef.current = false;
      if (audioRef.current) {
        audioRef.current.onended = null;
        audioRef.current.onerror = null;
        audioRef.current.pause();
        try { audioRef.current.src = ''; } catch {}
        audioRef.current = null;
      }
      pausedRef.current = null;
      stopGlobal();
    };
  }, [stopGlobal]);

  // Visibility sync
  useEffect(() => {
    const handler = () => {
      if (document.visibilityState === 'visible') {
        const audio = audioRef.current;
        const actuallyPlaying = audio && !audio.paused && !audio.ended;
        if (actuallyPlaying) {
          isPlayingRef.current = true;
          setIsPlaying(true);
        } else if (audio && audio.paused && !audio.ended && isPlayingRef.current) {
          audio.play().catch(() => {
            isPlayingRef.current = false;
            setIsPlaying(false);
          });
        } else if (!audio || audio.ended) {
          isPlayingRef.current = false;
          setIsPlaying(false);
          
        }
      }
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, []);

  useEffect(() => {
    localStorage.setItem(storageKey, String(listenCount));
  }, [listenCount, storageKey]);

  useEffect(() => {
    if (listenCount >= 3) {
      localStorage.removeItem(storageKey);
    }
  }, [listenCount, storageKey]);



  const fetchAudio = useCallback(async () => {
    try {
      const testUrl = getAyahAudioUrl(reciter, surahNumber, startVerse);
      if (testUrl) {
        const items = [];
        for (let v = startVerse; v <= endVerse; v++) {
          items.push({ audio: getAyahAudioUrl(reciter, surahNumber, v)!, numberInSurah: v });
        }
        ayahsRef.current = items;
        return;
      }
      const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/${reciter}`);
      const data = await res.json();
      if (data.code === 200) {
        ayahsRef.current = data.data.ayahs
          .filter((a: any) => a.numberInSurah >= startVerse && a.numberInSurah <= endVerse)
          .map((a: any) => ({ audio: a.audio, numberInSurah: a.numberInSurah }));
      } else {
        console.warn('[HifzTajweed] API returned non-200:', data.code);
      }
    } catch (err) {
      console.warn('[HifzTajweed] fetchAudio error:', err);
    }
  }, [surahNumber, startVerse, endVerse, reciter]);

  useEffect(() => { fetchAudio(); }, [fetchAudio]);

  const playNextAyah = useCallback((idx: number, gen: number) => {
    // Strict guards: bail if generation stale OR playback was stopped
    if (generationRef.current !== gen || !isPlayingRef.current) return;
    if (!ayahsRef.current.length) {
      console.warn('[HifzTajweed] No audio loaded yet');
      setIsPlaying(false);
      isPlayingRef.current = false;
      return;
    }
    if (idx >= ayahsRef.current.length) {
      setListenCount(prev => prev + 1);
      indexRef.current = 0;
      setTimeout(() => {
        if (generationRef.current !== gen || !isPlayingRef.current) return;
        playNextAyah(0, gen);
      }, 400);
      return;
    }
    indexRef.current = idx;
    

    // Kill previous audio element completely before creating new one
    if (audioRef.current) {
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current.pause();
      try { audioRef.current.src = ''; } catch {}
    }

    const audio = new Audio(ayahsRef.current[idx].audio);
    audioRef.current = audio;
    pausedRef.current = null;
    registerRef.current(audio, {
      label: `${surahName} · v.${startVerse}-${endVerse}`,
      returnPath: window.location.pathname + window.location.search,
      surahNumber,
      startVerse,
    });
    audio.onended = () => {
      if (generationRef.current !== gen || !isPlayingRef.current) return;
      if (audioRef.current !== audio) return; // stale callback
      playNextAyah(idx + 1, gen);
    };
    audio.onerror = () => {
      if (generationRef.current !== gen || !isPlayingRef.current) return;
      if (audioRef.current !== audio) return;
      console.warn('[HifzTajweed] Audio error for ayah', idx);
      setTimeout(() => {
        if (generationRef.current !== gen || !isPlayingRef.current) return;
        playNextAyah(idx + 1, gen);
      }, 300);
    };
    audio.play().catch(() => {
      if (generationRef.current !== gen) return;
      setIsPlaying(false);
      isPlayingRef.current = false;
    });
  }, []);

  const togglePlay = () => {
    if (isPlaying) {
      // Pause — keep audio element for resume
      pausedRef.current = audioRef.current;
      if (audioRef.current) {
        audioRef.current.onended = null;
        audioRef.current.onerror = null;
        audioRef.current.pause();
      }
      audioRef.current = null;
      generationRef.current++;
      setIsPlaying(false);
      isPlayingRef.current = false;
    } else {
      const gen = ++generationRef.current;
      setIsPlaying(true);
      isPlayingRef.current = true;

      if (pausedRef.current && pausedRef.current.src) {
        // Resume from where we left off — don't destroy the paused audio
        const audio = pausedRef.current;
        pausedRef.current = null;
        audioRef.current = audio;
        registerRef.current(audio, {
          label: `${surahName} · v.${startVerse}-${endVerse}`,
          returnPath: window.location.pathname + window.location.search,
          surahNumber,
          startVerse,
        });
        audio.onended = () => {
          if (generationRef.current !== gen || !isPlayingRef.current) return;
          if (audioRef.current !== audio) return;
          playNextAyah(indexRef.current + 1, gen);
        };
        audio.onerror = () => {
          if (generationRef.current !== gen || !isPlayingRef.current) return;
          if (audioRef.current !== audio) return;
          playNextAyah(indexRef.current + 1, gen);
        };
        audio.play().catch(() => {
          if (generationRef.current !== gen) return;
          setIsPlaying(false);
          isPlayingRef.current = false;
        });
      } else {
        // Fresh start — kill any lingering audio
        hardStopAudio();
        stopGlobal();
        playNextAyah(indexRef.current, gen);
      }
    }
  };

  return (
    <HifzStepWrapper stepNumber={3} stepTitle="Imprégnation de la Prononciation et du Tajweed" onBack={onBack} onPause={onPause} totalSteps={5} phaseLabel={phaseLabel} surahNumber={surahNumber} startVerse={startVerse} endVerse={endVerse} disableMushafOverlay>
      {/* Mushaf inline — full width, outside padded container */}
      <div className="-mx-4">
        <HifzMushafImage surahNumber={surahNumber} startVerse={startVerse} endVerse={endVerse} maxHeight="55vh" fullWidth />
      </div>

      <div className="text-center space-y-3">

        {/* Audio section */}
        <div className="space-y-3">
          <select
            value={reciter}
            onChange={e => { generationRef.current++; setReciter(e.target.value); localStorage.setItem('quran_reciter', e.target.value); audioRef.current?.pause(); setIsPlaying(false); isPlayingRef.current = false; pausedRef.current = null; }}
            className="w-full rounded-xl px-4 py-3 text-sm outline-none"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(212,175,55,0.2)', color: 'white', fontSize: '16px' }}
          >
            {RECITERS.map(r => (
              <option key={r.id} value={r.id} style={{ background: '#0d4f4f' }}>{r.name}</option>
            ))}
          </select>

          <div className="flex items-center justify-center">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={togglePlay}
              className="w-14 h-14 rounded-full flex items-center justify-center transition-all"
              style={{
                background: isPlaying ? 'rgba(212,175,55,0.25)' : 'rgba(255,255,255,0.1)',
                border: `2px solid ${isPlaying ? '#d4af37' : 'rgba(255,255,255,0.2)'}`,
              }}
            >
              {isPlaying ? <Pause className="h-5 w-5" style={{ color: '#d4af37' }} /> : <Play className="h-5 w-5 ml-0.5" style={{ color: '#d4af37' }} />}
            </motion.button>
          </div>

          {/* Listen count */}
          <div className="flex items-center justify-center gap-3">
            {[1, 2, 3].map(n => (
              <div
                key={n}
                className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all"
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
                  generationRef.current++; setListenCount(0); localStorage.removeItem(storageKey); audioRef.current?.pause(); setIsPlaying(false); isPlayingRef.current = false; pausedRef.current = null;
                }
              }}
              className="flex items-center justify-center gap-1.5 mx-auto px-3 py-1.5 rounded-lg text-xs transition-all active:scale-95"
              style={{ color: 'rgba(255,255,255,0.4)' }}
            >
              <RotateCcw className="h-3 w-3" />
              Recommencer
            </button>
          )}
        </div>

        {/* CTA button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => { generationRef.current++; audioRef.current?.pause(); setIsPlaying(false); isPlayingRef.current = false; pausedRef.current = null; onNext(); }}
          className="w-full rounded-2xl py-2.5 text-sm flex items-center justify-center gap-2"
          style={{
            background: 'linear-gradient(135deg, #d4af37, #b8962e)',
            color: '#1a2e1a',
          }}
        >
          <Check className="h-5 w-5" />
          Je suis prêt(e) — Bismillah
        </motion.button>
      </div>
    </HifzStepWrapper>
  );
}
