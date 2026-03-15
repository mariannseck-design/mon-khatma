import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Headphones, Check, Play, Pause } from 'lucide-react';
import { SURAHS } from '@/lib/surahData';
import { RECITERS } from '@/hooks/useQuranAudio';
import { useGlobalAudio } from '@/contexts/AudioContext';
import MouradMushafToggle, { type MushafMode, getMouradMushafMode, setMouradMushafMode } from './MouradMushafToggle';
import MouradPhysicalView from './MouradPhysicalView';
import HifzMushafImage from '@/components/hifz/HifzMushafImage';
import MouradVerseTextView from './MouradVerseTextView';

interface Props {
  surahNumber: number;
  startVerse: number;
  endVerse: number;
  listenCount: number;
  reciterId: string;
  onListenComplete: () => void;
  onReciterChange: (id: string) => void;
  onValidate: () => void;
}

export default function MouradPhase2({ surahNumber, startVerse, endVerse, listenCount, reciterId, onListenComplete, onReciterChange, onValidate }: Props) {
  const [mushafMode, setMushafModeState] = useState<MushafMode>(getMouradMushafMode());
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioEl, setAudioEl] = useState<HTMLAudioElement | null>(null);
  const pausedRef = useRef(false);
  const [showReciters, setShowReciters] = useState(false);
  const { registerAudio: registerGlobalAudio } = useGlobalAudio();
  const registerRef = useRef(registerGlobalAudio);
  registerRef.current = registerGlobalAudio;

  const surah = SURAHS.find(s => s.number === surahNumber);
  const minListens = 5;
  const canValidate = listenCount >= minListens;


  const handleModeChange = (mode: MushafMode) => {
    setMushafModeState(mode);
    setMouradMushafMode(mode);
  };

  // Build audio URLs for the verse range
  const playAudio = useCallback(async () => {
    // Pause
    if (isPlaying && audioEl) {
      audioEl.pause();
      pausedRef.current = true;
      setIsPlaying(false);
      return;
    }

    // Resume from pause
    if (pausedRef.current && audioEl && !audioEl.ended) {
      pausedRef.current = false;
      setIsPlaying(true);
      audioEl.play().catch(() => setIsPlaying(false));
      return;
    }

    pausedRef.current = false;

    const reciter = RECITERS.find(r => r.id === reciterId) || RECITERS[0];
    let urls: string[] = [];

    if (reciter.source === 'everyayah' && reciter.folder) {
      for (let v = startVerse; v <= endVerse; v++) {
        urls.push(`https://everyayah.com/data/${reciter.folder}/${String(surahNumber).padStart(3, '0')}${String(v).padStart(3, '0')}.mp3`);
      }
    } else {
      try {
        const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/${reciterId}`);
        const data = await res.json();
        if (data.code === 200) {
          urls = data.data.ayahs
            .filter((a: any) => a.numberInSurah >= startVerse && a.numberInSurah <= endVerse)
            .map((a: any) => a.audio);
        }
      } catch { return; }
    }

    if (!urls.length) return;

    let idx = 0;
    const playNext = () => {
      if (idx >= urls.length) {
        setIsPlaying(false);
        setAudioEl(null);
        onListenComplete();
        return;
      }
      const audio = new Audio(urls[idx]);
      setAudioEl(audio);
      registerRef.current(audio, { label: `${surah?.name || ''} · v.${startVerse}-${endVerse}`, returnPath: '/methode-mourad' });
      audio.onended = () => { idx++; playNext(); };
      audio.onerror = () => { idx++; playNext(); };
      audio.play().catch(() => setIsPlaying(false));
    };

    setIsPlaying(true);
    playNext();
  }, [isPlaying, audioEl, reciterId, surahNumber, startVerse, endVerse, onListenComplete]);

  // Audio persists via global context — don't pause on unmount
  useEffect(() => {
    return () => { /* handled by global context */ };
  }, [audioEl]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium" style={{ background: 'rgba(5,150,105,0.1)', color: '#059669' }}>
          <Headphones className="h-3.5 w-3.5" />
          Phase 2 — Imprégnation
        </div>
        <h2 className="text-lg font-bold text-gray-800">
          {surah?.name} · v.{startVerse}-{endVerse}
        </h2>
        <p className="text-gray-500 text-xs">
          Écoute les versets au moins 5 fois en suivant sur le Mushaf
        </p>
      </div>

      {/* Listen counter */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 text-center">
        <p className="text-gray-400 text-xs mb-1">Écoutes complétées</p>
        <p className="text-3xl font-bold" style={{ color: canValidate ? '#059669' : '#6B7280' }}>
          {listenCount}<span className="text-lg text-gray-400">/{minListens}</span>
        </p>
        <div className="w-full h-2 rounded-full mt-2" style={{ background: 'rgba(5,150,105,0.1)' }}>
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${Math.min(100, (listenCount / minListens) * 100)}%`, background: '#059669' }}
          />
        </div>
      </div>

      {/* Reciter selector */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <button
          className="w-full px-4 py-3 flex items-center justify-between text-sm"
          onClick={() => setShowReciters(!showReciters)}
        >
          <span className="text-gray-500">Récitateur :</span>
          <span className="font-medium text-gray-800">
            {RECITERS.find(r => r.id === reciterId)?.name || reciterId}
          </span>
        </button>
        {showReciters && (
          <div className="border-t border-gray-100 max-h-40 overflow-y-auto">
            {RECITERS.map(r => (
              <button
                key={r.id}
                className="w-full text-left px-4 py-2 text-sm hover:bg-emerald-50 transition-colors"
                style={{ color: r.id === reciterId ? '#059669' : '#374151', fontWeight: r.id === reciterId ? 600 : 400 }}
                onClick={() => { onReciterChange(r.id); setShowReciters(false); }}
              >
                {r.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Play button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={playAudio}
        className="w-full rounded-2xl py-3 flex items-center justify-center gap-2 font-semibold text-white"
        style={{ background: isPlaying ? '#6B7280' : '#059669' }}
      >
        {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        {isPlaying ? 'Pause' : 'Écouter'}
      </motion.button>

      {/* Mushaf toggle */}
      <MouradMushafToggle mode={mushafMode} onChange={handleModeChange} />

      {/* Mushaf display */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {mushafMode === 'image' && (
          <HifzMushafImage surahNumber={surahNumber} startVerse={startVerse} endVerse={endVerse} maxHeight="280px" />
        )}
        {mushafMode === 'text' && (
          <MouradVerseTextView surahNumber={surahNumber} startVerse={startVerse} endVerse={endVerse} fontSize={22} maxHeight="280px" />
        )}
        {mushafMode === 'physical' && (
          <MouradPhysicalView surahNumber={surahNumber} startVerse={startVerse} endVerse={endVerse} />
        )}
      </div>

      {/* Validate */}
      {canValidate && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileTap={{ scale: 0.97 }}
          onClick={onValidate}
          className="w-full rounded-2xl py-4 flex items-center justify-center gap-3 font-bold text-white"
          style={{
            background: 'linear-gradient(135deg, #059669, #10B981)',
            boxShadow: '0 4px 20px rgba(5,150,105,0.3)',
          }}
        >
          <Check className="h-5 w-5" />
          Valider la phase d'imprégnation
        </motion.button>
      )}
    </div>
  );
}
