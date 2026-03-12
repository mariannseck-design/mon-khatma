import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Check, X, BookOpen, RefreshCw, Link, ChevronRight, Headphones } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { RECITERS, getAyahAudioUrl } from '@/hooks/useQuranAudio';
import HifzMushafToggle, { getMushafMode, setMushafMode, type MushafMode } from '../HifzMushafToggle';
import HifzMushafImage from '../HifzMushafImage';
import { getVersesByRange, type LocalAyah } from '@/lib/quranData';

const BASMALA_WORDS = ['بِسْمِ', 'ٱللَّهِ', 'ٱلرَّحْمَٰنِ', 'ٱلرَّحِيمِ'];
function normalizeForComparison(s: string): string {
  return s.replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640\u06DD\u06DE\u06E9\u06DA\u06DB\u06DC\u200E\u200F\u061C\u200B-\u200D\uFEFF]/gu, '').trim();
}
const BASMALA_NORMALIZED = BASMALA_WORDS.map(normalizeForComparison);
function stripLeadingBasmala(text: string): string {
  const trimmed = text.trimStart();
  if (trimmed.startsWith('﷽')) return trimmed.slice(1).trimStart();
  const words = trimmed.split(/\s+/u);
  if (words.length < 4) return trimmed;
  const first4 = words.slice(0, 4).map(normalizeForComparison);
  if (first4.every((w, i) => w === BASMALA_NORMALIZED[i])) return words.slice(4).join(' ');
  return trimmed;
}

interface Props {
  surahNumber: number;
  verseStart: number;
  verseEnd: number;
  reciterId?: string;
  onNext: () => void;
}

type Phase = 'listen' | 'memory' | 'error' | 'liaison-listen' | 'liaison-memory' | 'liaison-error';

const TARGET_REPS = 3;
const FONT_FAMILY = "'Amiri Quran', 'Amiri', 'Scheherazade New', serif";

export default function StepImmersion({ surahNumber, verseStart, verseEnd, reciterId, onNext }: Props) {
  const { isAdmin } = useAuth();
  const minReps = isAdmin ? 1 : TARGET_REPS;
  const totalVerses = verseEnd - verseStart + 1;
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('listen');
  const [listenCount, setListenCount] = useState(0);
  const [memoryCount, setMemoryCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mushafMode, setMushafModeState] = useState<MushafMode>(getMushafMode);
  const [ayahs, setAyahs] = useState<LocalAyah[]>([]);
  const [loading, setLoading] = useState(true);

  // Liaison state
  const [liaisonVerses, setLiaisonVerses] = useState<number[]>([]);

  const isPlayingRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sequenceAbortRef = useRef(false);
  const reciter = reciterId || localStorage.getItem('quran_reciter') || 'ar.alafasy';

  const currentVerse = verseStart + currentVerseIndex;
  const isLiaison = phase.startsWith('liaison');
  const minReached = isLiaison
    ? (phase === 'liaison-listen' ? listenCount >= TARGET_REPS : memoryCount >= TARGET_REPS)
    : (phase === 'listen' ? listenCount >= TARGET_REPS : memoryCount >= TARGET_REPS);

  useEffect(() => {
    setLoading(true);
    getVersesByRange(surahNumber, verseStart, verseEnd)
      .then(setAyahs)
      .finally(() => setLoading(false));
  }, [surahNumber, verseStart, verseEnd]);

  const getAudioUrl = useCallback(async (verse: number): Promise<string | null> => {
    const url = getAyahAudioUrl(reciter, surahNumber, verse);
    if (url) return url;
    try {
      const res = await fetch(`https://api.alquran.cloud/v1/ayah/${surahNumber}:${verse}/${reciter}`);
      const data = await res.json();
      if (data.code === 200) return data.data.audio;
    } catch {}
    return null;
  }, [reciter, surahNumber]);

  const stopAudio = useCallback(() => {
    sequenceAbortRef.current = true;
    isPlayingRef.current = false;
    audioRef.current?.pause();
    audioRef.current = null;
    setIsPlaying(false);
  }, []);

  // Play a single verse
  const playSingleVerse = useCallback(async (verse: number) => {
    if (isPlayingRef.current) return;
    const url = await getAudioUrl(verse);
    if (!url) return;
    isPlayingRef.current = true;
    setIsPlaying(true);
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.onended = () => {
      isPlayingRef.current = false;
      setIsPlaying(false);
      setListenCount(prev => prev + 1);
    };
    audio.onerror = () => { isPlayingRef.current = false; setIsPlaying(false); };
    audio.play().catch(() => { isPlayingRef.current = false; setIsPlaying(false); });
  }, [getAudioUrl]);

  // Play a sequence of verses (for liaison)
  const playSequence = useCallback(async (verses: number[]) => {
    if (isPlayingRef.current) return;
    isPlayingRef.current = true;
    sequenceAbortRef.current = false;
    setIsPlaying(true);

    for (const verse of verses) {
      if (sequenceAbortRef.current) break;
      const url = await getAudioUrl(verse);
      if (!url) continue;

      await new Promise<void>((resolve) => {
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.onended = () => resolve();
        audio.onerror = () => resolve();
        audio.play().catch(() => resolve());
      });
    }

    isPlayingRef.current = false;
    setIsPlaying(false);
    if (!sequenceAbortRef.current) {
      setListenCount(prev => prev + 1);
    }
  }, [getAudioUrl]);

  const handlePlay = useCallback(() => {
    if (isPlaying) { stopAudio(); return; }
    if (isLiaison) {
      playSequence(liaisonVerses);
    } else {
      playSingleVerse(currentVerse);
    }
  }, [isPlaying, isLiaison, liaisonVerses, currentVerse, stopAudio, playSequence, playSingleVerse]);

  // Hint replay — plays audio once without incrementing any counter
  const playHint = useCallback(() => {
    if (isPlayingRef.current) return;
    if (isLiaison) {
      (async () => {
        isPlayingRef.current = true;
        sequenceAbortRef.current = false;
        setIsPlaying(true);
        for (const verse of liaisonVerses) {
          if (sequenceAbortRef.current) break;
          const url = await getAudioUrl(verse);
          if (!url) continue;
          await new Promise<void>((resolve) => {
            const audio = new Audio(url);
            audioRef.current = audio;
            audio.onended = () => resolve();
            audio.onerror = () => resolve();
            audio.play().catch(() => resolve());
          });
        }
        isPlayingRef.current = false;
        setIsPlaying(false);
      })();
    } else {
      (async () => {
        const url = await getAudioUrl(currentVerse);
        if (!url) return;
        isPlayingRef.current = true;
        setIsPlaying(true);
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.onended = () => { isPlayingRef.current = false; setIsPlaying(false); };
        audio.onerror = () => { isPlayingRef.current = false; setIsPlaying(false); };
        audio.play().catch(() => { isPlayingRef.current = false; setIsPlaying(false); });
      })();
    }
  }, [isLiaison, liaisonVerses, currentVerse, getAudioUrl]);

  useEffect(() => () => { stopAudio(); }, []);

  // Reset on verse change
  useEffect(() => {
    stopAudio();
    setListenCount(0);
    setMemoryCount(0);
    setPhase('listen');
  }, [currentVerseIndex]);

  // After memory validated for a verse
  const advanceAfterMemory = useCallback(() => {
    // If index >= 1, enter liaison before moving to next verse
    if (currentVerseIndex >= 1) {
      const verses = Array.from({ length: currentVerseIndex + 1 }, (_, i) => verseStart + i);
      setLiaisonVerses(verses);
      setListenCount(0);
      setMemoryCount(0);
      setPhase('liaison-listen');
    } else {
      // First verse done, go to next
      if (currentVerseIndex + 1 >= totalVerses) {
        onNext();
      } else {
        setCurrentVerseIndex(prev => prev + 1);
      }
    }
  }, [currentVerseIndex, verseStart, totalVerses, onNext]);

  // After liaison validated
  const advanceAfterLiaison = useCallback(() => {
    if (currentVerseIndex + 1 >= totalVerses) {
      onNext();
    } else {
      setCurrentVerseIndex(prev => prev + 1);
    }
  }, [currentVerseIndex, totalVerses, onNext]);

  const handleContinueListen = () => {
    stopAudio();
    if (isLiaison) setPhase('liaison-memory');
    else setPhase('memory');
    setMemoryCount(0);
  };

  const handleMemoryCorrect = () => {
    setMemoryCount(prev => prev + 1);
  };

  const handleContinueMemory = () => {
    if (isLiaison) advanceAfterLiaison();
    else advanceAfterMemory();
  };

  const handleMemoryError = () => {
    setPhase(isLiaison ? 'liaison-error' : 'error');
  };

  const handleRereadDone = () => {
    setListenCount(0);
    setMemoryCount(0);
    setPhase(isLiaison ? 'liaison-listen' : 'listen');
  };

  // Mushaf rendering
  const renderMushaf = (verseRange?: number[]) => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-4">
          <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: '#d4af37', borderTopColor: 'transparent' }} />
        </div>
      );
    }
    const versesToShow = verseRange || [currentVerse];
    const startV = Math.min(...versesToShow);
    const endV = Math.max(...versesToShow);

    if (mushafMode === 'physical') {
      return (
        <div className="rounded-xl px-4 py-4 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,175,55,0.15)' }}>
          <p className="text-xs italic" style={{ color: 'rgba(255,255,255,0.45)' }}>
            📖 Lis {versesToShow.length > 1 ? `les versets ${startV}–${endV}` : `le verset ${startV}`} depuis ton Mushaf physique.
          </p>
        </div>
      );
    }
    if (mushafMode === 'image') {
      return <HifzMushafImage surahNumber={surahNumber} startVerse={startV} endVerse={endV} maxHeight="240px" />;
    }
    // Text mode
    const shownAyahs = ayahs.filter(a => versesToShow.includes(a.numberInSurah));
    if (!shownAyahs.length) return null;
    const showBasmala = surahNumber !== 1 && surahNumber !== 9 && versesToShow.includes(1);
    return (
      <div className="rounded-xl px-4 py-4" dir="rtl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212,175,55,0.12)' }}>
        {showBasmala && (
          <p className="text-center mb-3" style={{ fontFamily: FONT_FAMILY, fontSize: '20px', color: '#2E7D32', lineHeight: 2 }}>
            بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
          </p>
        )}
        <div style={{ fontFamily: FONT_FAMILY, fontSize: '22px', lineHeight: '48px', color: '#e8e0d0', textAlign: 'center' }}>
          {shownAyahs.map((a, i) => {
            const text = showBasmala && a.numberInSurah === 1 ? stripLeadingBasmala(a.text) : a.text;
            return (
              <span key={a.numberInSurah}>
                {text}{' '}
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#2E7D32', color: '#fff', fontSize: '10px', fontFamily: 'system-ui', fontWeight: 700, verticalAlign: 'middle' }}>
                  {a.numberInSurah}
                </span>
                {i < shownAyahs.length - 1 ? ' ' : ''}
              </span>
            );
          })}
        </div>
      </div>
    );
  };

  // Circular progress
  const CircularCounter = ({ count, target, color }: { count: number; target: number; color: string }) => {
    const pct = Math.min(count / target, 1);
    const done = count >= target;
    return (
      <div className="relative w-28 h-28">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
          <circle cx="50" cy="50" r="44" fill="none" stroke={done ? '#d4af37' : color} strokeWidth="6" strokeLinecap="round"
            strokeDasharray={`${pct * 276} 276`} style={{ transition: 'stroke-dasharray 0.5s ease' }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold" style={{ color: done ? '#d4af37' : color }}>{count}</span>
          <span className="text-white/40 text-[10px]">/ {target}+</span>
        </div>
      </div>
    );
  };

  // Continue button (appears after min reps)
  const ContinueButton = ({ onClick, label }: { onClick: () => void; label: string }) => (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm mx-auto"
      style={{ background: 'rgba(212,175,55,0.2)', border: '1px solid rgba(212,175,55,0.5)', color: '#d4af37' }}
    >
      <ChevronRight className="h-4 w-4" />
      {label}
    </motion.button>
  );

  // Header for each phase
  const PhaseHeader = ({ icon: Icon, iconColor, iconBg, title, subtitle }: { icon: any; iconColor: string; iconBg: string; title: string; subtitle: string }) => (
    <div className="text-center space-y-1.5">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto" style={{ background: iconBg, border: `1px solid ${iconColor}40` }}>
        <Icon className="h-6 w-6" style={{ color: iconColor }} />
      </div>
      <h3 className="text-sm font-bold" style={{ color: '#f0e6c8', fontFamily: "'Playfair Display', serif" }}>{title}</h3>
      <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.45)' }}>{subtitle}</p>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="space-y-4">
      {/* Global progress bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
          <span>Progression</span>
          <span>{currentVerseIndex}/{totalVerses} verset{totalVerses > 1 ? 's' : ''}</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #d4af37, #f0d060)' }}
            initial={false}
            animate={{ width: `${(currentVerseIndex / totalVerses) * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Verse progress pills — hidden when too many */}
      {totalVerses <= 10 && (
        <div className="flex items-center justify-center gap-1.5 flex-wrap">
          {Array.from({ length: totalVerses }, (_, i) => (
            <div key={i} className="h-2 rounded-full transition-all duration-300"
              style={{
                width: i === currentVerseIndex ? '24px' : '10px',
                background: i < currentVerseIndex ? '#d4af37' : i === currentVerseIndex ? '#4ecdc4' : 'rgba(255,255,255,0.15)',
              }}
            />
          ))}
        </div>
      )}

      {/* Verse/liaison indicator */}
      <div className="text-center">
        <span className="text-[11px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>
          {isLiaison
            ? `Liaison — Versets ${liaisonVerses[0]}–${liaisonVerses[liaisonVerses.length - 1]}`
            : `Verset ${currentVerse} — ${currentVerseIndex + 1}/${totalVerses}`
          }
        </span>
      </div>

      <AnimatePresence mode="wait">
        {/* ===== LISTEN PHASE (single verse or liaison) ===== */}
        {(phase === 'listen' || phase === 'liaison-listen') && (
          <motion.div key={phase} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
            <PhaseHeader
              icon={isLiaison ? Link : Volume2}
              iconColor={isLiaison ? '#a78bfa' : '#4ecdc4'}
              iconBg={isLiaison ? 'rgba(167,139,250,0.15)' : 'rgba(78,205,196,0.15)'}
              title={isLiaison ? 'Liaison — Écouter' : 'Écouter, lire & répéter'}
              subtitle={isLiaison
                ? `Écoutez les versets ${liaisonVerses[0]}–${liaisonVerses[liaisonVerses.length - 1]} enchaînés`
                : 'Écoute le récitateur en suivant sur le Mushaf, puis répète en même temps'
              }
            />

            {/* Mushaf in listen phase for reference */}
            <div className="space-y-2">
              <HifzMushafToggle mode={mushafMode} onChange={m => { setMushafModeState(m); setMushafMode(m); }} />
              {renderMushaf(isLiaison ? liaisonVerses : undefined)}
            </div>

            <div className="flex flex-col items-center gap-3">
              <CircularCounter count={listenCount} target={TARGET_REPS} color={isLiaison ? '#a78bfa' : '#4ecdc4'} />
              <motion.button whileTap={{ scale: 0.9 }} onClick={handlePlay}
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  background: isPlaying ? 'rgba(78,205,196,0.2)' : 'rgba(212,175,55,0.15)',
                  border: `2px solid ${isPlaying ? 'rgba(78,205,196,0.5)' : 'rgba(212,175,55,0.4)'}`,
                }}
              >
                <Volume2 className="h-7 w-7" style={{ color: isPlaying ? '#4ecdc4' : '#d4af37' }} />
              </motion.button>
              {minReached && (
                <ContinueButton onClick={handleContinueListen} label="Passer à la récitation" />
              )}
            </div>
          </motion.div>
        )}

        {/* ===== MEMORY PHASE (single verse or liaison) ===== */}
        {(phase === 'memory' || phase === 'liaison-memory') && (
          <motion.div key={phase} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
            <PhaseHeader
              icon={isLiaison ? Link : BookOpen}
              iconColor={isLiaison ? '#a78bfa' : '#d4af37'}
              iconBg={isLiaison ? 'rgba(167,139,250,0.15)' : 'rgba(212,175,55,0.15)'}
              title={isLiaison ? 'Liaison — Réciter' : 'Réciter de mémoire'}
              subtitle={isLiaison
                ? `Récitez les versets ${liaisonVerses[0]}–${liaisonVerses[liaisonVerses.length - 1]} enchaînés`
                : 'Récitez ce verset de mémoire — sans aide'
              }
            />

            <div className="flex justify-center">
              <CircularCounter count={memoryCount} target={TARGET_REPS} color={isLiaison ? '#a78bfa' : '#d4af37'} />
            </div>

            <div className="flex items-center justify-center gap-3">
              <motion.button whileTap={{ scale: 0.95 }} onClick={handleMemoryCorrect}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm"
                style={{ background: 'rgba(46,125,50,0.2)', border: '1px solid rgba(46,125,50,0.4)', color: '#66bb6a' }}
              >
                <Check className="h-4 w-4" /> Correct
              </motion.button>
              <motion.button whileTap={{ scale: 0.95 }} onClick={handleMemoryError}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm"
                style={{ background: 'rgba(211,47,47,0.15)', border: '1px solid rgba(211,47,47,0.3)', color: '#ef5350' }}
              >
                <X className="h-4 w-4" /> Erreur
              </motion.button>
            </div>

            {/* Hint: replay audio once without resetting counter */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={isPlaying ? stopAudio : playHint}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs mx-auto"
              style={{ background: 'rgba(78,205,196,0.1)', border: '1px solid rgba(78,205,196,0.25)', color: '#4ecdc4' }}
            >
              <Headphones className="h-3.5 w-3.5" />
              {isPlaying ? 'Écoute en cours…' : 'Réécouter une fois'}
            </motion.button>

            {minReached && (
              <ContinueButton onClick={handleContinueMemory} label="Continuer ✓" />
            )}

            <div className="rounded-xl px-4 py-2.5 mx-auto max-w-sm"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-[11px] italic leading-relaxed text-center" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Récitation {memoryCount + 1} — Récitez de mémoire, sans regarder le Mushaf ni écouter l'audio
              </p>
            </div>
          </motion.div>
        )}

        {/* ===== ERROR PHASE (single verse or liaison) ===== */}
        {(phase === 'error' || phase === 'liaison-error') && (
          <motion.div key={phase} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
            <PhaseHeader
              icon={RefreshCw}
              iconColor="#ef5350"
              iconBg="rgba(211,47,47,0.12)"
              title={isLiaison ? 'Relire les versets' : 'Relire le verset'}
              subtitle="Pas de panique ! Relis attentivement puis recommence"
            />

            <div className="space-y-2">
              <HifzMushafToggle mode={mushafMode} onChange={m => { setMushafModeState(m); setMushafMode(m); }} />
              {renderMushaf(isLiaison ? liaisonVerses : undefined)}
            </div>

            <motion.button whileTap={{ scale: 0.97 }} onClick={handleRereadDone}
              className="w-full rounded-2xl py-3 flex items-center justify-center gap-2 font-semibold text-sm"
              style={{ background: 'rgba(78,205,196,0.15)', border: '1px solid rgba(78,205,196,0.3)', color: '#4ecdc4' }}
            >
              <RefreshCw className="h-4 w-4" /> J'ai relu — Recommencer
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
