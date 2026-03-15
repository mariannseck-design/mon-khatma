import { useState, useEffect, useRef, useCallback } from 'react';
import { getPageAyahs } from '@/lib/quranData';
import { useGlobalAudio } from '@/contexts/AudioContext';

interface ReciterEntry {
  id: string;
  name: string;
  source: 'alquran' | 'everyayah';
  folder?: string; // everyayah folder name
}

export const RECITERS: readonly ReciterEntry[] = [
  { id: 'ar.alafasy', name: 'Mishary Al-Afasy', source: 'alquran' },
  { id: 'ea.ghamidi', name: 'Saad Al-Ghamidi', source: 'everyayah', folder: 'Ghamadi_40kbps' },
  { id: 'ea.yasserdossari', name: 'Yasser Al-Dosari', source: 'everyayah', folder: 'Yasser_Ad-Dussary_128kbps' },
  { id: 'ea.nasserqatami', name: 'Nasser Al-Qatami', source: 'everyayah', folder: 'Nasser_Alqatami_128kbps' },
  { id: 'ea.mahermuaiqly', name: 'Maher Al-Muaiqly', source: 'everyayah', folder: 'MaherAlMuaiqly128kbps' },
  { id: 'ar.husary', name: 'Al-Husary', source: 'alquran' },
  { id: 'ar.abdulsamad', name: 'Abdul Samad', source: 'alquran' },
  { id: 'ar.minshawi', name: 'Al-Minshawi', source: 'alquran' },
  { id: 'ar.abdurrahmaansudais', name: 'Al-Sudais', source: 'alquran' },
  { id: 'ar.hudhaify', name: 'Al-Huthaify', source: 'alquran' },
  { id: 'ar.ibrahimakhbar', name: 'Ibrahim Al-Akhdar', source: 'alquran' },
  { id: 'ar.saoodshuraym', name: 'Saoud Al-Shuraym', source: 'alquran' },
  { id: 'ar.shaatree', name: 'Abu Bakr Al-Shatri', source: 'alquran' },
  { id: 'ar.hanirifai', name: 'Hani Ar-Rifai', source: 'alquran' },
  { id: 'ar.muhammadayyoub', name: 'Muhammad Ayyoub', source: 'alquran' },
] as const;

function getReciterConfig(id: string): ReciterEntry {
  return RECITERS.find(r => r.id === id) || RECITERS[0];
}

function pad3(n: number): string {
  return n.toString().padStart(3, '0');
}

function buildEveryayahUrl(folder: string, surah: number, ayah: number): string {
  return `https://everyayah.com/data/${folder}/${pad3(surah)}${pad3(ayah)}.mp3`;
}

interface AyahAudio {
  number: number;
  numberInSurah: number;
  surahNumber: number;
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
      playAyah(index + 1);
    };

    audio.play().catch(() => {
      setIsPlaying(false);
    });
  }, []);

  const fetchAndPlay = useCallback(async (targetPage: number, targetReciter: string) => {
    setLoading(true);
    try {
      const config = getReciterConfig(targetReciter);

      if (config.source === 'everyayah' && config.folder) {
        const localAyahs = await getPageAyahs(targetPage);
        let ayahs: AyahAudio[] = localAyahs.map(a => ({
          number: a.number,
          numberInSurah: a.numberInSurah,
          surahNumber: a.surah.number,
          audio: buildEveryayahUrl(config.folder!, a.surah.number, a.numberInSurah),
        }));

        if (startVerse || endVerse) {
          ayahs = ayahs.filter(a => {
            if (startVerse && a.numberInSurah < startVerse) return false;
            if (endVerse && a.numberInSurah > endVerse) return false;
            return true;
          });
        }

        ayahsRef.current = ayahs;
        indexRef.current = 0;
        setIsPlaying(true);
        playAyah(0);
      } else {
        const res = await fetch(`https://api.alquran.cloud/v1/page/${targetPage}/${targetReciter}`);
        const data = await res.json();
        if (data.code === 200) {
          let ayahs: AyahAudio[] = data.data.ayahs.map((a: any) => ({
            number: a.number,
            numberInSurah: a.numberInSurah,
            surahNumber: a.surah?.number || 0,
            audio: a.audio,
          }));
          if (startVerse || endVerse) {
            ayahs = ayahs.filter(a => {
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
      }
    } catch {
      setIsPlaying(false);
    } finally {
      setLoading(false);
    }
  }, [playAyah, startVerse, endVerse]);

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
  }, [page]);

  // Auto-resume on page change if was playing
  useEffect(() => {
    if (wasPlayingRef.current) {
      fetchAndPlay(page, reciter);
      wasPlayingRef.current = false;
    }
  }, [page]);

  // Stop on reciter change
  useEffect(() => {
    const wasPlaying = isPlaying;
    stopAudio();
    ayahsRef.current = [];
    if (wasPlaying) {
      fetchAndPlay(page, reciter);
    }
  }, [reciter]);

  // Re-filter on verse range change
  useEffect(() => {
    if (isPlaying) {
      stopAudio();
      ayahsRef.current = [];
      fetchAndPlay(page, reciter);
    }
  }, [startVerse, endVerse]);

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

/**
 * Build audio URL for a single ayah given a reciter ID.
 * Used by components that fetch audio independently (e.g. HifzStep2).
 */
export function getAyahAudioUrl(reciterId: string, surahNumber: number, ayahNumber: number): string | null {
  const config = getReciterConfig(reciterId);
  if (config.source === 'everyayah' && config.folder) {
    return buildEveryayahUrl(config.folder, surahNumber, ayahNumber);
  }
  // For alquran.cloud, caller must use the API
  return null;
}
