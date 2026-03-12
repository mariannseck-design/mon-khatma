import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Volume2, Eye, EyeOff, Check } from 'lucide-react';
import HifzMushafToggle, { getMushafMode, setMushafMode, type MushafMode } from '../HifzMushafToggle';
import HifzMushafImage from '../HifzMushafImage';
import { getVersesByRange, type LocalAyah } from '@/lib/quranData';
import { getAyahAudioUrl } from '@/hooks/useQuranAudio';
import type { Part } from './partSplitter';

interface Props {
  parts: Part[];
  onNext: () => void;
}

type FusionPhase = 'listen' | 'read' | 'recite';

const FONT_FAMILY = "'Amiri Quran', 'Amiri', 'Scheherazade New', serif";

export default function StepFusion({ parts, onNext }: Props) {
  const [phase, setPhase] = useState<FusionPhase>('listen');
  const [ayahs, setAyahs] = useState<LocalAyah[]>([]);
  const [loading, setLoading] = useState(true);
  const [mushafMode, setMushafModeState] = useState<MushafMode>(getMushafMode);
  const [peekMode, setPeekMode] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const isPlayingRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audiosRef = useRef<string[]>([]);
  const [reciter] = useState(() => localStorage.getItem('quran_reciter') || 'ar.alafasy');

  const globalStart = Math.min(...parts.map(p => p.verseStart));
  const globalEnd = Math.max(...parts.map(p => p.verseEnd));
  const surahNumber = parts[0]?.surahNumber ?? 1;

  useEffect(() => {
    setLoading(true);
    getVersesByRange(surahNumber, globalStart, globalEnd)
      .then(setAyahs)
      .finally(() => setLoading(false));
  }, [surahNumber, globalStart, globalEnd]);

  useEffect(() => {
    const urls: string[] = [];
    for (let v = globalStart; v <= globalEnd; v++) {
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
              .filter((a: any) => a.numberInSurah >= globalStart && a.numberInSurah <= globalEnd)
              .map((a: any) => a.audio);
          }
        })
        .catch(() => {});
    }
  }, [surahNumber, globalStart, globalEnd, reciter]);

  const playSequence = useCallback((idx: number) => {
    if (!isPlayingRef.current) return;
    if (idx >= audiosRef.current.length) {
      isPlayingRef.current = false;
      setIsPlaying(false);
      return;
    }
    const audio = new Audio(audiosRef.current[idx]);
    audioRef.current = audio;
    audio.onended = () => playSequence(idx + 1);
    audio.onerror = () => playSequence(idx + 1);
    audio.play().catch(() => { isPlayingRef.current = false; setIsPlaying(false); });
  }, []);

  const toggleAudio = () => {
    if (isPlayingRef.current) {
      isPlayingRef.current = false;
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      isPlayingRef.current = true;
      setIsPlaying(true);
      playSequence(0);
    }
  };

  useEffect(() => {
    return () => { isPlayingRef.current = false; audioRef.current?.pause(); };
  }, []);

  useEffect(() => {
    if (peekMode) {
      const timer = setTimeout(() => setPeekMode(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [peekMode]);

  const phaseLabels: Record<FusionPhase, { title: string; desc: string }> = {
    listen: { title: 'Écoute fusionnée', desc: `Écoutez les ${parts.length} parties enchaînées` },
    read: { title: 'Lecture fusionnée', desc: 'Lisez le passage complet avec le Mushaf' },
    recite: { title: 'Récitation fusionnée', desc: 'Récitez de mémoire le passage complet' },
  };

  const showMushaf = phase === 'read' || (phase === 'recite' && peekMode);

  const renderMushaf = () => {
    if (loading) return <div className="flex items-center justify-center py-6"><div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: '#d4af37', borderTopColor: 'transparent' }} /></div>;
    if (mushafMode === 'physical') return <div className="rounded-xl px-4 py-4 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,175,55,0.15)' }}><p className="text-xs italic" style={{ color: 'rgba(255,255,255,0.45)' }}>📖 Ouvre ton Mushaf physique.</p></div>;
    if (mushafMode === 'image') return <HifzMushafImage surahNumber={surahNumber} startVerse={globalStart} endVerse={globalEnd} maxHeight="280px" />;
    return (
      <div className="rounded-xl overflow-auto max-h-56 px-4 py-4" dir="rtl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212,175,55,0.12)' }}>
        <div style={{ fontFamily: FONT_FAMILY, fontSize: '20px', lineHeight: '44px', color: '#e8e0d0', textAlign: 'justify', textAlignLast: 'center' }}>
          {ayahs.map(a => (
            <span key={a.number}>{a.text}{' '}<span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#2E7D32', color: '#fff', fontSize: '9px', fontFamily: 'system-ui', fontWeight: 700, verticalAlign: 'middle', margin: '0 2px' }}>{a.numberInSurah}</span>{' '}</span>
          ))}
        </div>
      </div>
    );
  };

  const advancePhase = () => {
    isPlayingRef.current = false;
    audioRef.current?.pause();
    setIsPlaying(false);
    if (phase === 'listen') setPhase('read');
    else if (phase === 'read') setPhase('recite');
    else onNext();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      className="space-y-5"
    >
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto" style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)' }}>
          <Layers className="h-7 w-7" style={{ color: '#d4af37' }} />
        </div>
        <h3 className="text-base font-bold" style={{ color: '#f0e6c8', fontFamily: "'Playfair Display', serif" }}>
          Créer le lien — Versets {globalStart} à {globalEnd}
        </h3>
      </div>

      {/* Phase tabs */}
      <div className="flex justify-center gap-1">
        {(['listen', 'read', 'recite'] as FusionPhase[]).map((p, i) => (
          <div
            key={p}
            className="px-3 py-1.5 rounded-lg text-[10px] font-medium"
            style={{
              background: phase === p ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${phase === p ? 'rgba(212,175,55,0.4)' : 'rgba(255,255,255,0.08)'}`,
              color: phase === p ? '#d4af37' : 'rgba(255,255,255,0.35)',
            }}
          >
            {i + 1}. {p === 'listen' ? 'Écoute' : p === 'read' ? 'Lecture' : 'Récitation'}
          </div>
        ))}
      </div>

      <div className="rounded-xl px-4 py-3" style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)' }}>
        <p className="text-xs font-medium text-center" style={{ color: '#d4af37' }}>
          {phaseLabels[phase].desc}
        </p>
      </div>

      {phase === 'listen' && (
        <div className="flex justify-center">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggleAudio}
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{
              background: isPlaying ? 'rgba(212,175,55,0.2)' : 'rgba(212,175,55,0.1)',
              border: `2px solid ${isPlaying ? 'rgba(212,175,55,0.5)' : 'rgba(212,175,55,0.3)'}`,
            }}
          >
            <Volume2 className="h-8 w-8" style={{ color: '#d4af37' }} />
          </motion.button>
        </div>
      )}

      {phase === 'recite' && (
        <button
          onClick={() => setPeekMode(p => !p)}
          className="flex items-center justify-center gap-2 mx-auto px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-95"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(212,175,55,0.2)', color: '#d4af37' }}
        >
          {peekMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {peekMode ? 'Masquer' : 'Vérifier'}
        </button>
      )}

      <AnimatePresence>
        {showMushaf && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <HifzMushafToggle mode={mushafMode} onChange={m => { setMushafModeState(m); setMushafMode(m); }} />
            <div className="mt-2">{renderMushaf()}</div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={advancePhase}
        className="w-full rounded-2xl py-3.5 flex items-center justify-center gap-2 font-semibold text-sm"
        style={{ background: 'linear-gradient(135deg, #d4af37, #b8962e)', color: '#1a2e1a' }}
      >
        <Check className="h-4 w-4" />
        {phase === 'recite' ? 'Terminer la fusion' : 'Suivant'}
      </motion.button>
    </motion.div>
  );
}
