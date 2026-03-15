import { createContext, useContext, useState, useRef, useCallback, type ReactNode } from 'react';

interface AudioTrackInfo {
  label: string;
  returnPath: string;
  surahNumber?: number;
  startVerse?: number;
}

interface AudioContextType {
  status: 'idle' | 'playing' | 'paused';
  trackInfo: AudioTrackInfo | null;
  registerAudio: (audio: HTMLAudioElement, info: AudioTrackInfo) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
}

const AudioCtx = createContext<AudioContextType>({
  status: 'idle',
  trackInfo: null,
  registerAudio: () => {},
  pause: () => {},
  resume: () => {},
  stop: () => {},
});

export function AudioProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<'idle' | 'playing' | 'paused'>('idle');
  const [trackInfo, setTrackInfo] = useState<AudioTrackInfo | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const endTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const registerAudio = useCallback((audio: HTMLAudioElement, info: AudioTrackInfo) => {
    // Clear previous end timeout
    if (endTimeoutRef.current) {
      clearTimeout(endTimeoutRef.current);
      endTimeoutRef.current = null;
    }

    // Clean up previous listeners
    cleanupRef.current?.();

    audioRef.current = audio;
    setTrackInfo(info);

    const onPlay = () => setStatus('playing');
    const onPause = () => {
      if (audioRef.current === audio) setStatus('paused');
    };
    const onEnded = () => {
      // Delay setting idle — component may chain to next verse
      endTimeoutRef.current = setTimeout(() => {
        if (audioRef.current === audio) {
          setStatus('idle');
          setTrackInfo(null);
        }
      }, 2000);
    };

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);

    // Sync current state
    if (!audio.paused && !audio.ended) {
      setStatus('playing');
    }

    cleanupRef.current = () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const resume = useCallback(() => {
    audioRef.current?.play().catch(() => {});
  }, []);

  const stop = useCallback(() => {
    if (endTimeoutRef.current) {
      clearTimeout(endTimeoutRef.current);
      endTimeoutRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      try { audioRef.current.src = ''; } catch {}
      audioRef.current = null;
    }
    cleanupRef.current?.();
    cleanupRef.current = null;
    setStatus('idle');
    setTrackInfo(null);
  }, []);

  return (
    <AudioCtx.Provider value={{ status, trackInfo, registerAudio, pause, resume, stop }}>
      {children}
    </AudioCtx.Provider>
  );
}

export function useGlobalAudio() {
  return useContext(AudioCtx);
}
