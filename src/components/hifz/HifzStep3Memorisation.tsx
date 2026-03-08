import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Check, Eye, EyeOff, RotateCcw, Volume2, Star, ChevronDown, ChevronUp } from 'lucide-react';
import HifzStepWrapper from './HifzStepWrapper';
import HifzMushafToggle, { getMushafMode, setMushafMode, type MushafMode } from './HifzMushafToggle';
import HifzMushafImage from './HifzMushafImage';
import { getVersesByRange, type LocalAyah } from '@/lib/quranData';
import { RECITERS, getAyahAudioUrl } from '@/hooks/useQuranAudio';
import { SURAHS } from '@/lib/surahData';
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

function getPhaseBreaks(target: number) {
  const q1End = Math.max(Math.floor(target / 5), 1);
  const q2End = Math.max(Math.floor(target * 2 / 5), q1End + 1);
  const q3End = Math.max(Math.floor(target * 3 / 5), q2End + 1);
  return { q1End, q2End, q3End };
}

function getPhaseInfo(ancrage: number, target: number) {
  const { q1End, q2End, q3End } = getPhaseBreaks(target);
  if (ancrage < q1End) {
    return { phase: 1, emoji: '📖', label: 'Texte + Audio — Écoute, lecture et répétition', showText: true, audioProminent: true, color: '#4ecdc4' };
  }
  if (ancrage < q2End) {
    return { phase: 2, emoji: '📖', label: 'Texte + Audio discret — Lecture autonome', showText: true, audioProminent: false, audioAvailable: true, color: '#45b7aa' };
  }
  if (ancrage < q3End) {
    return { phase: 3, emoji: '📖', label: 'Texte visible, sans audio — Autonomie', showText: true, audioProminent: false, audioAvailable: false, color: '#f0d060' };
  }
  return { phase: 4, emoji: '🧠', label: 'Récitez de mémoire — Ancrage d\'acier', showText: false, audioProminent: false, audioAvailable: false, color: '#d4af37' };
}

export default function HifzStep3Memorisation({ surahNumber, startVerse, endVerse, repetitionLevel, onNext, onBack, onPause }: Props) {
  const tikrarTarget = repetitionLevel || 40;
  const storageKey = getStorageKey(surahNumber, startVerse, endVerse);

  const [ancrage, setAncrage] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? Math.min(parseInt(saved, 10) || 0, tikrarTarget) : 0;
  });
  const [ayahs, setAyahs] = useState<AyahWithAnnotations[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const isPlayingRef = useRef(false);
  const [showText, setShowText] = useState(true);
  const [showGuide, setShowGuide] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);
  const [peekMode, setPeekMode] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ayahAudiosRef = useRef<{ audio: string }[]>([]);
  const [reciter, setReciter] = useState(() => localStorage.getItem('quran_reciter') || 'ar.alafasy');
  const [mushafMode, setMushafModeState] = useState<MushafMode>(getMushafMode);

  const phaseInfo = getPhaseInfo(ancrage, tikrarTarget);
  const quarters = getPhaseBreaks(tikrarTarget);


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

  // Auto-show/hide text based on phase
  useEffect(() => {
    setShowText(phaseInfo.showText);
    setPeekMode(false);
  }, [phaseInfo.phase]);

  const playNextAyah = useCallback((idx: number) => {
    if (!isPlayingRef.current && idx > 0) return;
    if (idx >= ayahAudiosRef.current.length) {
      setAncrage(prev => {
        const next = Math.min(prev + 1, tikrarTarget);
        try { navigator?.vibrate?.(40); } catch {}
        if (next >= tikrarTarget) {
          isPlayingRef.current = false;
          setIsPlaying(false);
          return next;
        }
        setTimeout(() => { if (isPlayingRef.current) playNextAyah(0); }, 600);
        return next;
      });
      return;
    }
    const audio = new Audio(ayahAudiosRef.current[idx].audio);
    audioRef.current = audio;
    audio.onended = () => { if (isPlayingRef.current) playNextAyah(idx + 1); };
    audio.onerror = () => { if (isPlayingRef.current) playNextAyah(idx + 1); };
    audio.play().catch(() => { isPlayingRef.current = false; setIsPlaying(false); });
  }, [tikrarTarget]);

  const toggleAudioHelp = () => {
    if (isPlayingRef.current) {
      isPlayingRef.current = false;
      audioRef.current?.pause();
      setIsPlaying(false);
    } else if (ayahAudiosRef.current.length > 0) {
      isPlayingRef.current = true;
      setIsPlaying(true);
      playNextAyah(0);
    }
  };

  useEffect(() => {
    return () => { isPlayingRef.current = false; audioRef.current?.pause(); };
  }, []);

  // Peek timeout
  useEffect(() => {
    if (peekMode) {
      const timer = setTimeout(() => setPeekMode(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [peekMode]);

  const progress = Math.min((ancrage / tikrarTarget) * 100, 100);
  const isComplete = ancrage >= tikrarTarget;
  const textVisible = showText || peekMode;

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

  return (
    <HifzStepWrapper stepNumber={3} stepTitle="Tikrar" onBack={onBack} onPause={onPause}>
      <div className="text-center space-y-4">
        {/* Icon */}
        <div
          className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center"
          style={{ background: 'rgba(212,175,55,0.2)', border: '1px solid rgba(212,175,55,0.3)' }}
        >
          <BookOpen className="h-8 w-8" style={{ color: '#d4af37' }} />
        </div>

        {/* Subtitle */}
        <div>
          <p className="text-sm font-semibold" style={{ color: '#d4af37' }}>L'ancrage d'acier</p>
          <p className="text-white/50 text-xs">(Objectif {tikrarTarget} répétitions)</p>
        </div>


        {/* Guide */}
        <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <button
            onClick={() => setShowGuide(!showGuide)}
            className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-medium transition-all"
            style={{ color: '#d4af37' }}
          >
            <span>📋 Mode d'emploi du Tikrar</span>
            {showGuide ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          <AnimatePresence>
            {showGuide && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 space-y-3 text-left">
                  <p className="text-xs text-white/70 leading-relaxed">
                    Pour graver ce passage dans votre cœur par la grâce d'Allah{' '}
                    <span style={{ fontFamily: "'Amiri', serif", fontWeight: 'bold', fontSize: '1.1em' }}>(عز وجل)</span>
                    , nous vous suggérons un minimum de 15 répétitions. Votre objectif : <strong style={{ color: '#d4af37' }}>{tikrarTarget} répétitions</strong>.
                  </p>

                  <p className="text-xs font-semibold" style={{ color: '#d4af37' }}>Mode d'emploi de votre progression :</p>

                  <div className="space-y-2">
                    <div className="flex items-start gap-2 rounded-lg px-3 py-2" style={{ background: phaseInfo.phase === 1 ? 'rgba(78,205,196,0.15)' : 'transparent', border: phaseInfo.phase === 1 ? '1px solid rgba(78,205,196,0.3)' : '1px solid transparent' }}>
                      <span className="text-xs mt-0.5 whitespace-nowrap" style={{ color: '#4ecdc4', fontWeight: phaseInfo.phase === 1 ? 700 : 400 }}>1 à {quarters.q1End}</span>
                      <p className="text-xs text-white/70">📖 Texte Tajwid + audio actif. Écoute, lecture et répétition simultanée.</p>
                    </div>
                    <div className="flex items-start gap-2 rounded-lg px-3 py-2" style={{ background: phaseInfo.phase === 2 ? 'rgba(69,183,170,0.15)' : 'transparent', border: phaseInfo.phase === 2 ? '1px solid rgba(69,183,170,0.3)' : '1px solid transparent' }}>
                      <span className="text-xs mt-0.5 whitespace-nowrap" style={{ color: '#45b7aa', fontWeight: phaseInfo.phase === 2 ? 700 : 400 }}>{quarters.q1End + 1} à {quarters.q2End}</span>
                      <p className="text-xs text-white/70">📖 Texte visible + audio discret. Lecture autonome avec aide audio.</p>
                    </div>
                    <div className="flex items-start gap-2 rounded-lg px-3 py-2" style={{ background: phaseInfo.phase === 3 ? 'rgba(240,208,96,0.15)' : 'transparent', border: phaseInfo.phase === 3 ? '1px solid rgba(240,208,96,0.3)' : '1px solid transparent' }}>
                      <span className="text-xs mt-0.5 whitespace-nowrap" style={{ color: '#f0d060', fontWeight: phaseInfo.phase === 3 ? 700 : 400 }}>{quarters.q2End + 1} à {quarters.q3End}</span>
                      <p className="text-xs text-white/70">📖 Texte visible, sans audio. Autonomie visuelle complète.</p>
                    </div>
                    <div className="flex items-start gap-2 rounded-lg px-3 py-2" style={{ background: phaseInfo.phase === 4 ? 'rgba(212,175,55,0.15)' : 'transparent', border: phaseInfo.phase === 4 ? '1px solid rgba(212,175,55,0.3)' : '1px solid transparent' }}>
                      <span className="text-xs mt-0.5 whitespace-nowrap" style={{ color: '#d4af37', fontWeight: phaseInfo.phase === 4 ? 700 : 400 }}>Dès la {quarters.q3End + 1}ème</span>
                      <p className="text-xs text-white/70">🧠 Texte masqué. Récitation de mémoire. Bouton « Vérifier » disponible.</p>
                    </div>
                  </div>

                  <p className="text-xs text-white/70 leading-relaxed">
                    Bismillah, prenez le temps nécessaire. Votre persévérance honore le Prophète{' '}
                    <span style={{ fontFamily: "'Amiri', serif", fontWeight: 'bold', fontSize: '1.1em' }}>(ﷺ)</span>.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
                Vous suivez avec succès la voie des Prophètes{' '}
                <span style={{ fontFamily: "'Amiri', serif", fontWeight: 'bold', fontSize: '1.1em' }}>(عليهم السلام)</span>.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Counter */}
        <div className="relative w-32 h-32 mx-auto">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
            <circle
              cx="50" cy="50" r="44" fill="none"
              stroke={isComplete ? '#d4af37' : phaseInfo.color}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${progress * 2.76} 276`}
              style={{ transition: 'stroke-dasharray 0.5s ease, stroke 0.3s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold" style={{ color: '#d4af37' }}>{ancrage}</span>
            <span className="text-white/40 text-xs">/ {tikrarTarget}</span>
          </div>
        </div>

        {/* Phase indicator */}
        {!isComplete && (
          <motion.div
            key={phaseInfo.phase}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl px-4 py-2.5 mx-auto max-w-xs"
            style={{ background: `${phaseInfo.color}15`, border: `1px solid ${phaseInfo.color}40` }}
          >
            <p className="text-xs font-medium" style={{ color: phaseInfo.color }}>
              {phaseInfo.emoji} {phaseInfo.label}
            </p>
          </motion.div>
        )}

        {/* Quran text block */}
        {!isComplete && (
          <div className="relative">
            {/* Phase 3: Verify button */}
            {!phaseInfo.showText && (
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

            {/* Content container — Image or Text */}
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: '#d4af37', borderTopColor: 'transparent' }} />
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

            {/* Phase 3: Encouragement */}
            {!phaseInfo.showText && !peekMode && !loading && (
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

        {/* Reciter selector — visible in phases 1 & 2 */}
        {!isComplete && (phaseInfo.audioProminent || ('audioAvailable' in phaseInfo && phaseInfo.audioAvailable)) && (
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

              {/* Audio: prominent in phase 1 */}
              {phaseInfo.audioProminent && (
                <button
                  onClick={toggleAudioHelp}
                  className="w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-95 ml-4"
                  style={{
                    background: isPlaying ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.08)',
                    border: isPlaying ? '1px solid rgba(212,175,55,0.4)' : '1px solid rgba(255,255,255,0.15)',
                  }}
                  title={isPlaying ? 'Arrêter l\'audio' : 'Écouter le passage'}
                >
                  <Volume2 className="h-5 w-5" style={{ color: isPlaying ? '#d4af37' : 'rgba(255,255,255,0.5)' }} />
                </button>
              )}
            </div>

            {/* Audio: discreet help in phase 2 only */}
            {!phaseInfo.audioProminent && ('audioAvailable' in phaseInfo && phaseInfo.audioAvailable) && (
              <button
                onClick={toggleAudioHelp}
                className="flex items-center justify-center gap-1.5 mx-auto px-3 py-1.5 rounded-lg text-xs transition-all active:scale-95"
                style={{ color: 'rgba(255,255,255,0.3)' }}
                title={isPlaying ? 'Arrêter' : 'Aide audio'}
              >
                <Volume2 className="h-3 w-3" style={{ color: isPlaying ? '#d4af37' : 'rgba(255,255,255,0.3)' }} />
                <span style={{ color: isPlaying ? '#d4af37' : undefined }}>
                  {isPlaying ? 'Arrêter' : 'Aide audio'}
                </span>
              </button>
            )}
          </div>
        )}

        {/* Next — locked until target reached */}
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
      </div>
    </HifzStepWrapper>
  );
}
