import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link2, Play, Pause, Eye, EyeOff, Check, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { SURAHS } from '@/lib/surahData';
import { getExactVersePage } from '@/lib/quranData';
import { useGlobalAudio } from '@/contexts/AudioContext';
import { getAyahAudioUrl } from '@/hooks/useQuranAudio';
import HifzStepWrapper from './HifzStepWrapper';
import HifzMushafImage from './HifzMushafImage';
import HifzMushafToggle, { type MushafMode, getMushafMode, setMushafMode as saveMushafMode } from './HifzMushafToggle';

interface VerseBlock {
  surah_number: number;
  verse_start: number;
  verse_end: number;
  surahName: string;
  pageStart: number;
  pageEnd: number;
}

interface Props {
  surahNumber: number;
  startVerse: number;
  endVerse: number;
  onNext: () => void;
  onBack: () => void;
  onPause?: () => void;
  phaseLabel?: string;
}

type Phase = 'listen' | 'recite' | 'confirmed';

function buildEveryayahUrl(folder: string, surah: number, ayah: number): string {
  const pad = (n: number) => n.toString().padStart(3, '0');
  return `https://everyayah.com/data/${folder}/${pad(surah)}${pad(ayah)}.mp3`;
}

export default function HifzStep5Liaison({ surahNumber, startVerse, endVerse, onNext, onBack, onPause, phaseLabel }: Props) {
  const { user } = useAuth();
  const [phase, setPhase] = useState<Phase>('listen');
  const [blocks, setBlocks] = useState<VerseBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [mushafMode, setMushafModeState] = useState<MushafMode>(getMushafMode());
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ayahIndexRef = useRef(0);
  const { registerAudio } = useGlobalAudio();

  const handleMushafChange = (mode: MushafMode) => {
    setMushafModeState(mode);
    saveMushafMode(mode);
  };

  // Fetch recent memorized blocks
  useEffect(() => {
    if (!user) { setLoading(false); return; }
    const fetchBlocks = async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data } = await supabase
        .from('hifz_memorized_verses')
        .select('surah_number, verse_start, verse_end')
        .eq('user_id', user.id)
        .gte('memorized_at', thirtyDaysAgo.toISOString())
        .order('surah_number', { ascending: true })
        .order('verse_start', { ascending: true });

      if (data && data.length > 0) {
        const mapped = await Promise.all(data.map(async b => {
          const pStart = await getExactVersePage(b.surah_number, b.verse_start);
          const pEnd = await getExactVersePage(b.surah_number, b.verse_end);
          return {
            ...b,
            surahName: SURAHS.find(s => s.number === b.surah_number)?.name || `Sourate ${b.surah_number}`,
            pageStart: pStart,
            pageEnd: pEnd,
          };
        }));
        setBlocks(mapped);
      } else {
        // Use current session block as fallback
        const pStart = await getExactVersePage(surahNumber, startVerse);
        const pEnd = await getExactVersePage(surahNumber, endVerse);
        setBlocks([{
          surah_number: surahNumber,
          verse_start: startVerse,
          verse_end: endVerse,
          surahName: SURAHS.find(s => s.number === surahNumber)?.name || `Sourate ${surahNumber}`,
          pageStart: pStart,
          pageEnd: pEnd,
        }]);
      }
      setLoading(false);
    };
    fetchBlocks();
  }, [user, surahNumber, startVerse, endVerse]);

  // Audio playback for current block
  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      try { audioRef.current.src = ''; } catch {}
      audioRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const playBlock = useCallback((blockIdx: number) => {
    if (blocks.length === 0) return;
    const block = blocks[blockIdx];
    const reciterId = localStorage.getItem('quran_reciter') || 'ar.alafasy';

    const playAyah = (surah: number, ayah: number, end: number) => {
      const url = getAyahAudioUrl(reciterId, surah, ayah);
      if (!url) {
        // alquran.cloud — fetch from API
        fetch(`https://api.alquran.cloud/v1/ayah/${surah}:${ayah}/${reciterId}`)
          .then(r => r.json())
          .then(data => {
            if (data.code === 200 && data.data?.audio) {
              playUrl(data.data.audio, surah, ayah, end);
            }
          })
          .catch(() => setIsPlaying(false));
        return;
      }
      playUrl(url, surah, ayah, end);
    };

    const playUrl = (url: string, surah: number, ayah: number, end: number) => {
      const audio = new Audio(url);
      audioRef.current = audio;
      registerAudio(audio, { label: `Liaison — ${block.surahName}`, returnPath: '/hifz' });

      audio.onended = () => {
        if (ayah < end) {
          playAyah(surah, ayah + 1, end);
        } else {
          setIsPlaying(false);
        }
      };
      audio.onerror = () => {
        if (ayah < end) playAyah(surah, ayah + 1, end);
        else setIsPlaying(false);
      };
      audio.play().catch(() => setIsPlaying(false));
    };

    setIsPlaying(true);
    setCurrentBlockIndex(blockIdx);
    ayahIndexRef.current = block.verse_start;
    playAyah(block.surah_number, block.verse_start, block.verse_end);
  }, [blocks, registerAudio]);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      stopAudio();
    } else {
      playBlock(currentBlockIndex);
    }
  }, [isPlaying, stopAudio, playBlock, currentBlockIndex]);

  // Cleanup on unmount
  useEffect(() => () => stopAudio(), [stopAudio]);

  const currentBlock = blocks[currentBlockIndex] || blocks[0];
  const showMushaf = phase === 'listen' && mushafMode !== 'physical';

  return (
    <HifzStepWrapper
      stepNumber={5}
      stepTitle="La Liaison (Ar-Rabt)"
      onBack={onBack}
      onPause={onPause}
      phaseLabel={phaseLabel}
      surahNumber={currentBlock?.surah_number}
      startVerse={currentBlock?.verse_start}
      endVerse={currentBlock?.verse_end}
    >
      <div className="space-y-4">
        {/* Phase indicator */}
        <div className="flex items-center justify-center gap-2">
          {(['listen', 'recite', 'confirmed'] as Phase[]).map((p, i) => (
            <div
              key={p}
              className="flex items-center gap-1"
            >
              <div
                className="w-2.5 h-2.5 rounded-full transition-all"
                style={{
                  background: phase === p || (['listen', 'recite', 'confirmed'].indexOf(phase) > i)
                    ? '#d4af37'
                    : 'rgba(255,255,255,0.15)',
                }}
              />
              <span className="text-[10px]" style={{ color: phase === p ? '#d4af37' : 'rgba(255,255,255,0.4)' }}>
                {p === 'listen' ? 'Écouter' : p === 'recite' ? 'Réciter' : 'Confirmé'}
              </span>
            </div>
          ))}
        </div>

        {/* Instructions */}
        <p className="text-center text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>
          {phase === 'listen'
            ? 'Écoute et suis sur le Mushaf tout ce que tu as mémorisé ces 30 derniers jours.'
            : phase === 'recite'
            ? 'Maintenant, récite de mémoire sans regarder le Mushaf.'
            : 'Récitation confirmée ! Tu peux passer à la suite.'}
        </p>

        {/* Block navigation */}
        {blocks.length > 1 && (
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {blocks.map((b, i) => (
              <button
                key={i}
                onClick={() => { setCurrentBlockIndex(i); if (isPlaying) { stopAudio(); playBlock(i); } }}
                className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: currentBlockIndex === i ? 'rgba(212,175,55,0.25)' : 'rgba(255,255,255,0.06)',
                  border: `1px solid ${currentBlockIndex === i ? 'rgba(212,175,55,0.5)' : 'rgba(255,255,255,0.1)'}`,
                  color: currentBlockIndex === i ? '#d4af37' : 'rgba(255,255,255,0.5)',
                }}
              >
                {b.surahName} {b.verse_start}–{b.verse_end}
              </button>
            ))}
          </div>
        )}

        {/* Mushaf toggle */}
        {phase === 'listen' && <HifzMushafToggle mode={mushafMode} onChange={handleMushafChange} />}

        {/* Mushaf display */}
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" style={{ color: '#d4af37' }} />
          </div>
        ) : showMushaf && currentBlock ? (
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(212,175,55,0.2)' }}>
            <HifzMushafImage
              surahNumber={currentBlock.surah_number}
              startVerse={currentBlock.verse_start}
              endVerse={currentBlock.verse_end}
            />
          </div>
        ) : phase === 'listen' && mushafMode === 'physical' ? (
          <div
            className="rounded-2xl p-6 text-center"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(212,175,55,0.15)' }}
          >
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
              📖 Ouvre ton Mushaf physique aux pages indiquées et suis la récitation.
            </p>
            {currentBlock && (
              <p className="text-xs mt-2" style={{ color: '#d4af37' }}>
                p. {currentBlock.pageStart}{currentBlock.pageEnd !== currentBlock.pageStart ? `–${currentBlock.pageEnd}` : ''}
              </p>
            )}
          </div>
        ) : phase === 'recite' ? (
          <div
            className="rounded-2xl p-8 text-center"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,175,55,0.1)' }}
          >
            <EyeOff className="h-10 w-10 mx-auto mb-3" style={{ color: 'rgba(212,175,55,0.4)' }} />
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Mushaf masqué — récite de mémoire
            </p>
          </div>
        ) : null}

        {/* Audio controls */}
        {phase !== 'confirmed' && (
          <div className="flex justify-center">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={togglePlay}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all"
              style={{
                background: isPlaying ? 'rgba(212,175,55,0.3)' : 'rgba(255,255,255,0.1)',
                border: `1px solid ${isPlaying ? '#d4af37' : 'rgba(255,255,255,0.15)'}`,
                color: isPlaying ? '#d4af37' : 'white',
              }}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isPlaying ? 'Pause' : 'Écouter'}
            </motion.button>
          </div>
        )}

        {/* Phase transitions */}
        {phase === 'listen' && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => { stopAudio(); setPhase('recite'); }}
            className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: 'white' }}
          >
            <EyeOff className="h-4 w-4" />
            Je suis prête à réciter sans regarder
          </motion.button>
        )}

        {phase === 'recite' && (
          <div className="space-y-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setPhase('confirmed')}
              className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
              style={{
                background: 'rgba(212,175,55,0.2)',
                border: '1px solid rgba(212,175,55,0.4)',
                color: '#d4af37',
              }}
            >
              <Check className="h-4 w-4" />
              J'ai récité de mémoire ✓
            </motion.button>
            <button
              onClick={() => setPhase('listen')}
              className="w-full py-2 text-xs"
              style={{ color: 'rgba(255,255,255,0.4)' }}
            >
              ← Revenir au Mushaf
            </button>
          </div>
        )}

        {phase === 'confirmed' && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.97 }}
            onClick={onNext}
            className="w-full rounded-2xl py-4 flex items-center justify-center gap-2 font-semibold"
            style={{ background: 'linear-gradient(135deg, #d4af37, #b8962e)', color: '#1a2e1a' }}
          >
            <Check className="h-5 w-5" />
            Terminer la session
          </motion.button>
        )}
      </div>
    </HifzStepWrapper>
  );
}
