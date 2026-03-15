import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Check, Eye, EyeOff, RotateCcw, Volume2, Star, Info, ChevronRight, ChevronLeft, Brain } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import HifzStepWrapper from './HifzStepWrapper';
import HifzMushafToggle, { getMushafMode, setMushafMode, type MushafMode } from './HifzMushafToggle';
import HifzMushafImage from './HifzMushafImage';
import { getVersesByRange, getExactVersePage, type LocalAyah } from '@/lib/quranData';
import { useNavigate } from 'react-router-dom';
import { RECITERS, getAyahAudioUrl } from '@/hooks/useQuranAudio';
import { SURAHS } from '@/lib/surahData';
import { useGlobalAudio } from '@/contexts/AudioContext';
import {
  getTajweedAnnotations,
  TAJWEED_COLORS,
  type TajweedAnnotation,
} from '@/lib/tajweedData';

interface Props {
  surahNumber: number;
  startVerse: number;
  endVerse: number;
  repetitionLevel: number;
  onNext: () => void;
  onBack: () => void;
  onPause?: () => void;
}

const FONT_FAMILY = "'Amiri Quran', 'Amiri', 'Scheherazade New', serif";
const BASMALA_WORDS = ['بِسْمِ', 'ٱللَّهِ', 'ٱلرَّحْمَٰنِ', 'ٱلرَّحِيمِ'];

function stripLeadingBasmala(text: string): { stripped: string; offset: number } {
  const trimmed = text.trimStart();
  if (!trimmed) return { stripped: trimmed, offset: 0 };
  if (trimmed.startsWith('﷽')) {
    const after = trimmed.slice(1).trimStart();
    return { stripped: after, offset: text.length - after.length };
  }
  const words = trimmed.split(/\s+/u);
  if (words.length < 4) return { stripped: trimmed, offset: text.length - trimmed.length };
  const first4 = words.slice(0, 4);
  const isBasmala = first4.every((word, i) => {
    const clean = word.replace(/[\u06DD\u06DE\u06E9\u06DA\u06DB\u06DC\u200E\u200F\u061C]/gu, '');
    return clean === BASMALA_WORDS[i];
  });
  if (!isBasmala) return { stripped: trimmed, offset: text.length - trimmed.length };
  if (words.length <= 4) return { stripped: '', offset: text.length };
  const remaining = words.slice(4).join(' ').trimStart();
  return { stripped: remaining, offset: text.length - remaining.length };
}

function renderTajweedText(
  text: string,
  annotations: TajweedAnnotation[],
  charOffset: number = 0,
): React.ReactNode[] {
  if (!annotations.length) return [text];
  const colors = TAJWEED_COLORS;
  const segments: React.ReactNode[] = [];
  let pos = 0;
  for (const ann of annotations) {
    const start = ann.start - charOffset;
    const end = ann.end - charOffset;
    if (end <= 0 || start >= text.length) continue;
    const effectiveStart = Math.max(start, 0);
    const effectiveEnd = Math.min(end, text.length);
    if (effectiveStart > pos) segments.push(text.slice(pos, effectiveStart));
    const color = colors[ann.rule];
    if (color) {
      segments.push(
        <span key={`${ann.rule}-${effectiveStart}`} style={{ color }}>{text.slice(effectiveStart, effectiveEnd)}</span>
      );
    } else {
      segments.push(text.slice(effectiveStart, effectiveEnd));
    }
    pos = effectiveEnd;
  }
  if (pos < text.length) segments.push(text.slice(pos));
  return segments;
}

interface AyahWithAnnotations extends LocalAyah {
  tajweed?: TajweedAnnotation[];
}

function getStorageKey(surah: number, start: number, end: number) {
  return `hifz_ancrage_${surah}_${start}_${end}`;
}

// Phase definitions
const PHASES = [
  {
    id: 1,
    emoji: '📖',
    title: 'Écoute & Répétition',
    consigne: 'Regardez le Mushaf, écoutez l\'audio et répétez en même temps.',
    color: '#4ecdc4',
    minRep: 0,
    maxRep: 4,
    showText: true,
    audioProminent: true,
    audioAvailable: true,
  },
  {
    id: 2,
    emoji: '📖',
    title: 'Mémorisation autonome',
    consigne: 'Mémorisez seul(e), utilisez l\'audio en aide si besoin.',
    color: '#45b7aa',
    minRep: 4,
    maxRep: 8,
    showText: true,
    audioProminent: false,
    audioAvailable: true,
  },
  {
    id: 3,
    emoji: '📖',
    title: 'Récitation guidée',
    consigne: 'Regardez le Mushaf et récitez de mémoire, sans audio.',
    color: '#f0d060',
    minRep: 8,
    maxRep: 12,
    showText: true,
    audioProminent: false,
    audioAvailable: false,
  },
  {
    id: 4,
    emoji: '🧠',
    title: 'Ancrage final',
    consigne: 'Texte masqué — récitez de mémoire. Appuyez sur "Vérifier" en cas de doute.',
    color: '#d4af37',
    minRep: 12,
    maxRep: Infinity,
    showText: false,
    audioProminent: false,
    audioAvailable: false,
  },
];

function getPhaseForAncrage(ancrage: number): number {
  if (ancrage < 4) return 0;
  if (ancrage < 8) return 1;
  if (ancrage < 12) return 2;
  return 3;
}

export default function HifzStep3Memorisation({ surahNumber, startVerse, endVerse, repetitionLevel, onNext, onBack, onPause }: Props) {
  const navigate = useNavigate();
  const { registerAudio: registerGlobalAudio, stop: stopGlobal } = useGlobalAudio();
  const registerRef = useRef(registerGlobalAudio);
  registerRef.current = registerGlobalAudio;
  const generationRef = useRef(0);

  const surahName = SURAHS.find(s => s.number === surahNumber)?.name || '';
  const tikrarTarget = repetitionLevel || 40;
  const storageKey = getStorageKey(surahNumber, startVerse, endVerse);
  const [ancrage, setAncrage] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? Math.min(parseInt(saved, 10) || 0, tikrarTarget) : 0;
  });
  const ancrageRef = useRef(ancrage);
  useEffect(() => { ancrageRef.current = ancrage; }, [ancrage]);
  const [currentPhase, setCurrentPhase] = useState(() => getPhaseForAncrage(
    (() => { const s = localStorage.getItem(getStorageKey(surahNumber, startVerse, endVerse)); return s ? Math.min(parseInt(s, 10) || 0, repetitionLevel || 40) : 0; })()
  ));
  const [slideDirection, setSlideDirection] = useState(1);
  const [ayahs, setAyahs] = useState<AyahWithAnnotations[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const isPlayingRef = useRef(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [peekMode, setPeekMode] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ayahAudiosRef = useRef<{ audio: string }[]>([]);
  const [reciter, setReciter] = useState(() => localStorage.getItem('quran_reciter') || 'ar.alafasy');
  const [mushafMode, setMushafModeState] = useState<MushafMode>(getMushafMode);

  const phase = PHASES[currentPhase];
  const phaseLocalMin = phase.minRep;
  const phaseLocalMax = Math.min(phase.maxRep, tikrarTarget);
  const phaseLocalCount = Math.max(0, Math.min(ancrage, phaseLocalMax) - phaseLocalMin);
  const phaseLocalTarget = phaseLocalMax - phaseLocalMin;
  const phaseComplete = ancrage >= phaseLocalMax;
  const isComplete = ancrage >= tikrarTarget;

  // Auto-advance phase when threshold reached
  useEffect(() => {
    const naturalPhase = getPhaseForAncrage(ancrage);
    if (naturalPhase > currentPhase) {
      setSlideDirection(1);
      setCurrentPhase(naturalPhase);
    }
  }, [ancrage, currentPhase]);

  // Stop audio when entering phase without audio
  useEffect(() => {
    if (!phase.audioAvailable && isPlayingRef.current) {
      isPlayingRef.current = false;
      audioRef.current?.pause();
      setIsPlaying(false);
    }
  }, [currentPhase, phase.audioAvailable]);

  // Reset peek when phase changes
  useEffect(() => {
    setPeekMode(false);
  }, [currentPhase]);

  // Load local text + tajweed
  useEffect(() => {
    setLoading(true);
    getVersesByRange(surahNumber, startVerse, endVerse)
      .then(async (data) => {
        const withAnnotations = await Promise.all(
          data.map(async (ayah) => {
            const tajweed = await getTajweedAnnotations(ayah.surah.number, ayah.numberInSurah);
            return { ...ayah, tajweed };
          })
        );
        setAyahs(withAnnotations);
      })
      .finally(() => setLoading(false));
  }, [surahNumber, startVerse, endVerse]);

  // Load audio URLs
  useEffect(() => {
    const fetchAudio = async () => {
      try {
        const testUrl = getAyahAudioUrl(reciter, surahNumber, startVerse);
        if (testUrl) {
          const audios = [];
          for (let v = startVerse; v <= endVerse; v++) {
            audios.push({ audio: getAyahAudioUrl(reciter, surahNumber, v)! });
          }
          ayahAudiosRef.current = audios;
          return;
        }
        const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/${reciter}`);
        const data = await res.json();
        if (data.code === 200) {
          ayahAudiosRef.current = data.data.ayahs
            .filter((a: any) => a.numberInSurah >= startVerse && a.numberInSurah <= endVerse)
            .map((a: any) => ({ audio: a.audio }));
        }
      } catch { /* ignore */ }
    };
    fetchAudio();
  }, [surahNumber, startVerse, endVerse, reciter]);

  // Persist ancrage
  useEffect(() => {
    localStorage.setItem(storageKey, String(ancrage));
  }, [ancrage, storageKey]);

  useEffect(() => {
    if (ancrage >= tikrarTarget) {
      localStorage.removeItem(storageKey);
      setShowCelebration(true);
    }
  }, [ancrage, tikrarTarget, storageKey]);

  // Peek timeout
  useEffect(() => {
    if (peekMode) {
      const timer = setTimeout(() => setPeekMode(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [peekMode]);

  const playNextAyah = useCallback((idx: number, gen: number) => {
    if (generationRef.current !== gen) return;
    if (!isPlayingRef.current && idx > 0) return;
    if (idx >= ayahAudiosRef.current.length) {
      const current = ancrageRef.current;
      const next = Math.min(current + 1, tikrarTarget);
      ancrageRef.current = next;
      setAncrage(next);
      localStorage.setItem(storageKey, String(next));
      try { navigator?.vibrate?.(40); } catch {}
      if (next >= tikrarTarget) {
        isPlayingRef.current = false;
        setIsPlaying(false);
        return;
      }
      setTimeout(() => { if (isPlayingRef.current && generationRef.current === gen) playNextAyah(0, gen); }, 600);
      return;
    }
    const audio = new Audio(ayahAudiosRef.current[idx].audio);
    audioRef.current = audio;
    registerRef.current(audio, {
      label: `${surahName} · v.${startVerse}-${endVerse}`,
      returnPath: window.location.pathname + window.location.search,
      surahNumber,
      startVerse,
    });
    audio.onended = () => { if (isPlayingRef.current && generationRef.current === gen) playNextAyah(idx + 1, gen); };
    audio.onerror = () => { if (isPlayingRef.current && generationRef.current === gen) playNextAyah(idx + 1, gen); };
    audio.play().catch(() => { isPlayingRef.current = false; setIsPlaying(false); });
  }, [tikrarTarget, storageKey]);

  const toggleAudioHelp = () => {
    if (isPlayingRef.current) {
      isPlayingRef.current = false;
      audioRef.current?.pause();
      setIsPlaying(false);
    } else if (ayahAudiosRef.current.length > 0) {
      generationRef.current++;
      stopGlobal();
      isPlayingRef.current = true;
      setIsPlaying(true);
      playNextAyah(0, generationRef.current);
    }
  };

  useEffect(() => {
    return () => { /* audio persists globally via AudioContext */ };
  }, []);

  const progress = Math.min((ancrage / tikrarTarget) * 100, 100);
  const textVisible = phase.showText || peekMode;

  const goToPhase = (idx: number) => {
    if (idx < 0 || idx > 3) return;
    // Can only go back, or forward if current phase is complete
    if (idx > currentPhase && !phaseComplete) return;
    setSlideDirection(idx > currentPhase ? 1 : -1);
    setCurrentPhase(idx);
    // Stop audio on phase change
    if (isPlayingRef.current) {
      isPlayingRef.current = false;
      audioRef.current?.pause();
      setIsPlaying(false);
    }
  };

  // Render the Quran text block
  const renderedText = useMemo(() => {
    if (!ayahs.length) return null;
    return (
      <div
        dir="rtl"
        style={{
          fontFamily: FONT_FAMILY,
          fontSize: '24px',
          lineHeight: '52px',
          textAlign: 'justify',
          textAlignLast: 'center',
          color: '#e8e0d0',
          wordSpacing: '0.12em',
          fontVariantLigatures: 'common-ligatures',
          fontFeatureSettings: '"liga" 1, "calt" 1, "kern" 1',
          textRendering: 'optimizeLegibility',
        }}
      >
        {ayahs.map((ayah) => {
          const needsStrip = ayah.numberInSurah === 1 && surahNumber !== 1 && surahNumber !== 9;
          let displayText = ayah.text;
          let charOffset = 0;
          if (needsStrip) {
            const result = stripLeadingBasmala(ayah.text);
            displayText = result.stripped;
            charOffset = result.offset;
          }
          const textContent = ayah.tajweed?.length
            ? renderTajweedText(displayText, ayah.tajweed, charOffset)
            : displayText;

          return (
            <span key={ayah.number}>
              {textContent}
              {' '}
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  backgroundColor: '#2E7D32',
                  color: '#ffffff',
                  fontSize: '10px',
                  fontFamily: 'system-ui, sans-serif',
                  fontWeight: 700,
                  lineHeight: 1,
                  verticalAlign: 'middle',
                  margin: '0 3px',
                  userSelect: 'none',
                  flexShrink: 0,
                }}
              >
                {ayah.numberInSurah}
              </span>
              {' '}
            </span>
          );
        })}
      </div>
    );
  }, [ayahs, surahNumber]);

  // Stepper component
  const Stepper = () => (
    <div className="flex items-center justify-center gap-1 mb-5">
      {PHASES.map((p, idx) => {
        const isActive = idx === currentPhase;
        const isDone = ancrage >= p.maxRep || (idx < 3 && ancrage >= PHASES[idx].maxRep);
        const isAccessible = idx <= getPhaseForAncrage(ancrage);
        return (
          <button
            key={p.id}
            onClick={() => isAccessible ? goToPhase(idx) : undefined}
            className="flex flex-col items-center transition-all"
            style={{ opacity: isAccessible ? 1 : 0.35, cursor: isAccessible ? 'pointer' : 'default' }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all"
              style={{
                background: isActive ? p.color : isDone ? `${p.color}40` : 'rgba(255,255,255,0.08)',
                border: isActive ? `2px solid ${p.color}` : isDone ? `1px solid ${p.color}60` : '1px solid rgba(255,255,255,0.15)',
                color: isActive || isDone ? '#fff' : 'rgba(255,255,255,0.4)',
                boxShadow: isActive ? `0 0 12px ${p.color}40` : 'none',
              }}
            >
              {isDone && !isActive ? <Check className="h-3.5 w-3.5" /> : p.id}
            </div>
            <span
              className="text-[9px] mt-1 font-medium leading-tight text-center max-w-[60px]"
              style={{ color: isActive ? p.color : 'rgba(255,255,255,0.4)' }}
            >
              {idx === 0 ? 'Écoute' : idx === 1 ? 'Mémorisation' : idx === 2 ? 'Récitation' : 'Ancrage'}
            </span>
          </button>
        );
      })}
    </div>
  );

  return (
    <HifzStepWrapper stepNumber={3} stepTitle="Istiqâmah" onBack={onBack} onPause={onPause} surahNumber={surahNumber} startVerse={startVerse} endVerse={endVerse}>
      <div className="text-center space-y-4">
        {/* Info button */}
        <div className="flex items-center justify-center gap-2">
          <p className="text-sm font-semibold" style={{ color: '#d4af37' }}>Istiqâmah</p>
          <Popover>
            <PopoverTrigger asChild>
              <button className="rounded-full p-0.5 transition-colors hover:bg-white/10">
                <Info className="h-4 w-4" style={{ color: '#d4af37' }} />
              </button>
            </PopoverTrigger>
            <PopoverContent className="text-xs leading-relaxed" style={{ background: '#1a2e1a', border: '1px solid rgba(212,175,55,0.3)', color: 'rgba(255,255,255,0.85)' }}>
              L'Istiqâmah désigne la constance, la droiture et la persévérance. Nous avons choisi ce nom car la régularité et l'effort continu sont les véritables clés pour graver ces versets dans votre cœur.
            </PopoverContent>
          </Popover>
        </div>

        {/* Stepper */}
        <Stepper />

        {/* Phase content with slide animation */}
        <AnimatePresence mode="wait" custom={slideDirection}>
          <motion.div
            key={currentPhase}
            custom={slideDirection}
            initial={{ opacity: 0, x: slideDirection * 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: slideDirection * -60 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="space-y-4"
          >
            {/* Phase icon + title */}
            <div className="flex flex-col items-center gap-2">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: `${phase.color}20`, border: `1px solid ${phase.color}40` }}
              >
                {phase.id === 4 ? (
                  <Brain className="h-7 w-7" style={{ color: phase.color }} />
                ) : (
                  <BookOpen className="h-7 w-7" style={{ color: phase.color }} />
                )}
              </div>
              <div>
                <p className="text-base font-bold" style={{ color: phase.color }}>
                  {phase.emoji} {phase.title}
                </p>
                <p className="text-white/50 text-xs mt-0.5">
                  Palier {phase.id}/4 · Objectif global : {tikrarTarget} rép.
                </p>
              </div>
            </div>

            {/* Consigne */}
            <div
              className="rounded-xl px-4 py-3 mx-auto max-w-sm"
              style={{ background: `${phase.color}12`, border: `1px solid ${phase.color}30` }}
            >
              <p className="text-xs font-medium leading-relaxed" style={{ color: phase.color }}>
                {phase.consigne}
              </p>
            </div>

            {/* Celebration */}
            <AnimatePresence>
              {showCelebration && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-2xl p-5 space-y-3"
                  style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.4)' }}
                >
                  <div className="flex justify-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <motion.div key={i} initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.1 }}>
                        <Star className="h-5 w-5 fill-current" style={{ color: '#d4af37' }} />
                      </motion.div>
                    ))}
                  </div>
                  <p className="text-white text-sm leading-relaxed">
                    Félicitations ! Votre ancrage est terminé par la grâce d'Allah{' '}
                    <span style={{ fontFamily: "'Amiri', serif", fontWeight: 'bold', fontSize: '1.1em' }}>(عز وجل)</span>.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Counters: local + global */}
            <div className="flex items-center justify-center gap-6">
              {/* Local phase counter */}
              <div className="relative w-28 h-28">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
                  <circle
                    cx="50" cy="50" r="44" fill="none"
                    stroke={phaseComplete ? '#d4af37' : phase.color}
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${Math.min((phaseLocalCount / phaseLocalTarget) * 276, 276)} 276`}
                    style={{ transition: 'stroke-dasharray 0.5s ease, stroke 0.3s ease' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold" style={{ color: phase.color }}>{phaseLocalCount}</span>
                  <span className="text-white/40 text-[10px]">/ {phaseLocalTarget}</span>
                </div>
              </div>

              {/* Global mini counter */}
              <div className="flex flex-col items-center gap-1">
                <div className="relative w-12 h-12">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                    <circle
                      cx="50" cy="50" r="44" fill="none"
                      stroke={isComplete ? '#d4af37' : 'rgba(212,175,55,0.5)'}
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${progress * 2.76} 276`}
                      style={{ transition: 'stroke-dasharray 0.5s ease' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[10px] font-bold" style={{ color: '#d4af37' }}>{ancrage}</span>
                  </div>
                </div>
                <span className="text-[9px] text-white/30">/ {tikrarTarget} total</span>
              </div>
            </div>

            {/* Quran text block */}
            {!isComplete && (
              <div className="relative">
                {/* Phase 4: Verify button */}
                {!phase.showText && (
                  <button
                    onClick={() => setPeekMode(p => !p)}
                    className="flex items-center justify-center gap-2 mx-auto px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-95 mb-3"
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(212,175,55,0.2)', color: '#d4af37' }}
                  >
                    {peekMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    {peekMode ? 'Masquer' : 'Vérifier'}
                  </button>
                )}

                {/* Mushaf mode toggle */}
                {textVisible && (
                  <div className="mb-3">
                    <HifzMushafToggle mode={mushafMode} onChange={(m) => { setMushafModeState(m); setMushafMode(m); }} />
                  </div>
                )}

                {/* Content container */}
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: '#d4af37', borderTopColor: 'transparent' }} />
                  </div>
                ) : textVisible && mushafMode === 'physical' ? (
                  <div className="rounded-xl px-4 py-6 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,175,55,0.15)' }}>
                    <p className="text-xs italic" style={{ color: 'rgba(255,255,255,0.45)' }}>
                      📖 Ouvre ton Mushaf physique et suis depuis celui-ci.
                    </p>
                  </div>
                ) : textVisible && mushafMode === 'image' ? (
                  <HifzMushafImage surahNumber={surahNumber} startVerse={startVerse} endVerse={endVerse} maxHeight="320px" />
                ) : (
                  <div
                    style={{ display: textVisible ? 'block' : 'none' }}
                    className="rounded-xl overflow-auto max-h-72 px-4 py-4"
                    dir="rtl"
                  >
                    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(212,175,55,0.15)' }}>
                      {startVerse === 1 && surahNumber !== 1 && surahNumber !== 9 && (
                        <p
                          className="text-center mb-3"
                          style={{
                            fontFamily: FONT_FAMILY,
                            color: '#6a9a6a',
                            fontSize: '22px',
                            lineHeight: '40px',
                            fontWeight: 'bold',
                          }}
                        >
                          بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                        </p>
                      )}
                      {renderedText}
                    </div>
                  </div>
                )}

                {/* Phase 4: encouragement when text hidden */}
                {!phase.showText && !peekMode && !loading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="rounded-xl px-4 py-3 mx-auto max-w-xs text-left"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    <p className="text-white/70 text-xs italic leading-relaxed">
                      Fermez les yeux et récitez de mémoire. En cas de doute, appuyez sur « Vérifier » pour un bref aperçu.
                      L'essentiel est la sincérité de votre effort pour plaire à Allah{' '}
                      <span style={{ fontFamily: "'Amiri', serif", fontWeight: 'bold', fontSize: '1.1em' }}>(عز وجل)</span>.
                    </p>
                  </motion.div>
                )}
              </div>
            )}

            {/* Reset */}
            {ancrage > 0 && !isComplete && (
              <button
                onClick={() => {
                  if (window.confirm('Réinitialiser le compteur d\'ancrage ? Votre progression sera perdue.')) {
                    setAncrage(0);
                    setCurrentPhase(0);
                    localStorage.removeItem(storageKey);
                    audioRef.current?.pause();
                    setIsPlaying(false);
                  }
                }}
                className="flex items-center justify-center gap-1.5 mx-auto px-3 py-1.5 rounded-lg text-xs transition-all active:scale-95"
                style={{ color: 'rgba(255,255,255,0.4)' }}
              >
                <RotateCcw className="h-3 w-3" />
                Recommencer
              </button>
            )}

            {/* Reciter selector — visible in phases with audio */}
            {!isComplete && (
              <select
                value={reciter}
                onChange={e => {
                  setReciter(e.target.value);
                  localStorage.setItem('quran_reciter', e.target.value);
                  audioRef.current?.pause();
                  isPlayingRef.current = false;
                  setIsPlaying(false);
                }}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(212,175,55,0.2)',
                  color: 'white',
                  fontSize: '16px',
                }}
              >
                {RECITERS.map(r => (
                  <option key={r.id} value={r.id} style={{ background: '#0d4f4f' }}>{r.name}</option>
                ))}
              </select>
            )}

            {/* Controls */}
            {!isComplete && (
              <div className="space-y-3">
                <div className="flex items-center justify-center">
                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={() => {
                      setAncrage(prev => Math.min(prev + 1, tikrarTarget));
                      try { navigator?.vibrate?.(40); } catch {}
                    }}
                    className="w-20 h-20 rounded-full flex items-center justify-center"
                    style={{
                      background: 'rgba(212,175,55,0.15)',
                      border: '2px solid rgba(212,175,55,0.4)',
                    }}
                  >
                    <span className="text-2xl font-bold" style={{ color: '#d4af37' }}>+1</span>
                  </motion.button>

                  {/* Audio button — always visible */}
                  <button
                    onClick={toggleAudioHelp}
                    className="w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-95 ml-4"
                    style={{
                      background: isPlaying ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.08)',
                      border: isPlaying ? '1px solid rgba(212,175,55,0.4)' : '1px solid rgba(255,255,255,0.15)',
                    }}
                  >
                    <Volume2 className="h-5 w-5" style={{ color: isPlaying ? '#d4af37' : 'rgba(255,255,255,0.5)' }} />
                  </button>
                </div>

                {/* Mushaf link — always visible */}
                <p className="text-center text-[10px] leading-relaxed mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  📖{' '}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      getExactVersePage(surahNumber, startVerse).then(page =>
                        navigate(`/quran-reader?page=${page}`)
                      );
                    }}
                    className="underline"
                    style={{ color: 'rgba(212,175,55,0.6)' }}
                  >
                    Lire sur le Mushaf
                  </button>
                  {isPlaying ? ' — l\'audio continue en arrière-plan' : ''}
                </p>
              </div>
            )}

            {/* Navigation between phases */}
            {!isComplete && (
              <div className="flex items-center justify-between gap-3 pt-2">
                {currentPhase > 0 ? (
                  <button
                    onClick={() => goToPhase(currentPhase - 1)}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium transition-all active:scale-95"
                    style={{ color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.05)' }}
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    Palier {currentPhase}
                  </button>
                ) : <div />}

                {phaseComplete && currentPhase < 3 && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => goToPhase(currentPhase + 1)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95"
                    style={{ background: `${PHASES[currentPhase + 1].color}25`, border: `1px solid ${PHASES[currentPhase + 1].color}50`, color: PHASES[currentPhase + 1].color }}
                  >
                    Palier {currentPhase + 2}
                    <ChevronRight className="h-3.5 w-3.5" />
                  </motion.button>
                )}
              </div>
            )}

            {/* Final next button */}
            {isComplete && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileTap={{ scale: 0.97 }}
                onClick={onNext}
                className="w-full rounded-2xl py-4 flex items-center justify-center gap-2 font-semibold"
                style={{
                  background: 'linear-gradient(135deg, #d4af37, #b8962e)',
                  color: '#1a2e1a',
                }}
              >
                <Check className="h-5 w-5" />
                Passer au test de validation
              </motion.button>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Bismillah footer */}
        {!isComplete && (
          <p className="text-xs italic leading-relaxed" style={{ color: 'rgba(212,175,55,0.6)' }}>
            Bismillah, qu'Allah{' '}
            <span style={{ fontFamily: "'Amiri', serif", fontWeight: 'bold', fontSize: '1.1em' }}>(عز وجل)</span>
            {' '}facilite, amine.
          </p>
        )}
      </div>
    </HifzStepWrapper>
  );
}
