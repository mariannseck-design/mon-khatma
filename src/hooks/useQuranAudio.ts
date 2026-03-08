import { useState, useEffect, useRef, useCallback } from 'react';

export const RECITERS = [
  { id: 'ar.alafasy', name: 'Mishary Al-Afasy' },
  { id: 'ar.husary', name: 'Al-Husary' },
  { id: 'ar.abdulsamad', name: 'Abdul Samad' },
  { id: 'ar.minshawi', name: 'Al-Minshawi' },
  { id: 'ar.mahermuaiqly', name: 'Maher Al-Muaiqly' },
  { id: 'ar.abdurrahmaansudais', name: 'Al-Sudais' },
  { id: 'ar.hudhaify', name: 'Al-Huthaify' },
  { id: 'ar.ibrahimakhbar', name: 'Ibrahim Al-Akhdar' },
  { id: 'ar.saoodshuraym', name: 'Saoud Al-Shuraym' },
  { id: 'ar.shaatree', name: 'Abu Bakr Al-Shatri' },
  { id: 'ar.hanirifai', name: 'Hani Ar-Rifai' },
  { id: 'ar.muhammadayyoub', name: 'Muhammad Ayyoub' },
] as const;

interface AyahAudio {
  number: number;
  numberInSurah: number;
  audio: string;
}

export function useQuranAudio(page: number, onPageFinished?: () => void, startVerse?: number, endVerse?: number) {
  const [reciter, setReciter] = useState(() => {
    return localStorage.getItem('quran_reciter') || 'ar.alafasy';
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAyahNumber, setCurrentAyahNumber] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ayahsRef = useRef<AyahAudio[]>([]);
  const indexRef = useRef(0);
  const wasPlayingRef = useRef(false);

  // Save reciter preference
  useEffect(() => {
    localStorage.setItem('quran_reciter', reciter);
  }, [reciter]);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute('src');
      audioRef.current = null;
    }
    setIsPlaying(false);
    setCurrentAyahNumber(null);
    indexRef.current = 0;
  }, []);

  const playAyah = useCallback((index: number) => {
    const ayahs = ayahsRef.current;
    if (index >= ayahs.length) {
      setIsPlaying(false);
      setCurrentAyahNumber(null);
      onPageFinished?.();
      return;
    }

    indexRef.current = index;
    const ayah = ayahs[index];
    setCurrentAyahNumber(ayah.number);

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(ayah.audio);
    audioRef.current = audio;

    audio.onended = () => {
      playAyah(index + 1);
    };

    audio.onerror = () => {
      // Skip to next on error
      playAyah(index + 1);
    };

    audio.play().catch(() => {
      setIsPlaying(false);
    });
  }, []);

  const fetchAndPlay = useCallback(async (targetPage: number, targetReciter: string) => {
    setLoading(true);
    try {
      const res = await fetch(`https://api.alquran.cloud/v1/page/${targetPage}/${targetReciter}`);
      const data = await res.json();
      if (data.code === 200) {
        let ayahs = data.data.ayahs.map((a: any) => ({
          number: a.number,
          numberInSurah: a.numberInSurah,
          audio: a.audio,
        }));
        // Filter by verse range if specified
        if (startVerse || endVerse) {
          ayahs = ayahs.filter((a: AyahAudio) => {
            if (startVerse && a.numberInSurah < startVerse) return false;
            if (endVerse && a.numberInSurah > endVerse) return false;
            return true;
          });
        }
        ayahsRef.current = ayahs;
        indexRef.current = 0;
        setIsPlaying(true);
        playAyah(0);
      }
    } catch {
      setIsPlaying(false);
    } finally {
      setLoading(false);
    }
  }, [playAyah]);

  const play = useCallback(() => {
    if (ayahsRef.current.length > 0 && indexRef.current < ayahsRef.current.length) {
      setIsPlaying(true);
      playAyah(indexRef.current);
    } else {
      fetchAndPlay(page, reciter);
    }
  }, [page, reciter, fetchAndPlay, playAyah]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, pause, play]);

  // Stop and reload on page change
  useEffect(() => {
    wasPlayingRef.current = isPlaying;
    stopAudio();
    ayahsRef.current = [];
  }, [page]); // intentionally exclude stopAudio/isPlaying

  // Auto-resume on page change if was playing
  useEffect(() => {
    if (wasPlayingRef.current) {
      fetchAndPlay(page, reciter);
      wasPlayingRef.current = false;
    }
  }, [page]); // intentionally minimal deps

  // Stop on reciter change
  useEffect(() => {
    const wasPlaying = isPlaying;
    stopAudio();
    ayahsRef.current = [];
    if (wasPlaying) {
      fetchAndPlay(page, reciter);
    }
  }, [reciter]); // intentionally minimal deps

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return {
    isPlaying,
    currentAyahNumber,
    loading,
    reciter,
    setReciter,
    togglePlay,
    stop: stopAudio,
  };
}
