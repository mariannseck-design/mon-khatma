import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Headphones, Check, Play, Pause, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import HifzStepWrapper from './HifzStepWrapper';
import HifzMushafToggle, { getMushafMode, setMushafMode, type MushafMode } from './HifzMushafToggle';
import HifzMushafImage from './HifzMushafImage';
import { RECITERS, getAyahAudioUrl } from '@/hooks/useQuranAudio';
import { SURAHS } from '@/lib/surahData';
import { getVersesByRange, type LocalAyah } from '@/lib/quranData';
import { getTajweedAnnotations, TAJWEED_COLORS, type TajweedAnnotation } from '@/lib/tajweedData';

interface Props {
  surahNumber: number;
  startVerse: number;
  endVerse: number;
  onNext: () => void;
  onBack: () => void;
  onPause?: () => void;
}

const FONT_FAMILY = "'Amiri Quran', 'Amiri', 'Scheherazade New', serif";
const BASMALA_WORDS = ['بِسْمِ', 'ٱللَّهِ', 'ٱلرَّحْمَٰنِ', 'ٱلرَّحِيمِ'];
const FONT_SIZES = [20, 24, 30];
const FONT_LABELS = ['Petit', 'Moyen', 'Grand'];

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

function renderTajweedText(text: string, annotations: TajweedAnnotation[], charOffset: number = 0): React.ReactNode[] {
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
      segments.push(<span key={`${ann.rule}-${effectiveStart}`} style={{ color }}>{text.slice(effectiveStart, effectiveEnd)}</span>);
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

export default function HifzStepImpregnationTajweed({ surahNumber, startVerse, endVerse, onNext, onBack, onPause }: Props) {
  const storageKey = `hifz_listen_${surahNumber}_${startVerse}_${endVerse}`;
  const surahName = SURAHS.find(s => s.number === surahNumber)?.name || '';

  const [listenCount, setListenCount] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? parseInt(saved, 10) || 0 : 0;
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [reciter, setReciter] = useState(() => localStorage.getItem('quran_reciter') || 'ar.alafasy');
  const [currentAyahIndex, setCurrentAyahIndex] = useState(-1);
  const [fontSizeIndex, setFontSizeIndex] = useState(1);
  const [ayahs, setAyahs] = useState<AyahWithAnnotations[]>([]);
  const [versesLoading, setVersesLoading] = useState(true);
  const [mushafMode, setMushafModeState] = useState<MushafMode>(getMushafMode);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ayahsRef = useRef<{ audio: string; numberInSurah: number }[]>([]);
  const indexRef = useRef(0);

  useEffect(() => {
    localStorage.setItem(storageKey, String(listenCount));
  }, [listenCount, storageKey]);

  useEffect(() => {
    if (listenCount >= 3) {
      localStorage.removeItem(storageKey);
    }
  }, [listenCount, storageKey]);

  useEffect(() => {
    setVersesLoading(true);
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
      .finally(() => setVersesLoading(false));
  }, [surahNumber, startVerse, endVerse]);

  const renderedText = useMemo(() => {
    if (!ayahs.length) return null;
    return (
      <div
        dir="rtl"
        style={{
          fontFamily: FONT_FAMILY,
          fontSize: `${FONT_SIZES[fontSizeIndex]}px`,
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
        {ayahs.map((ayah, idx) => {
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

          const isActive = isPlaying && currentAyahIndex === idx;

          return (
            <span
              key={ayah.number}
              style={{
                borderRadius: '6px',
                padding: isActive ? '2px 4px' : undefined,
                backgroundColor: isActive ? 'rgba(212,175,55,0.15)' : undefined,
                boxShadow: isActive ? '0 0 12px rgba(212,175,55,0.2)' : undefined,
                transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
              }}
            >
              {textContent}
              {' '}
              <span
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: '18px', height: '18px', borderRadius: '50%',
                  backgroundColor: isActive ? '#d4af37' : '#2E7D32',
                  color: '#ffffff', fontSize: '10px', fontFamily: 'system-ui, sans-serif',
                  fontWeight: 700, lineHeight: 1, verticalAlign: 'middle', margin: '0 3px',
                  userSelect: 'none', flexShrink: 0, transition: 'background-color 0.3s ease',
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
  }, [ayahs, surahNumber, fontSizeIndex, currentAyahIndex, isPlaying]);

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
      }
    } catch { /* ignore */ }
  }, [surahNumber, startVerse, endVerse, reciter]);

  useEffect(() => { fetchAudio(); }, [fetchAudio]);

  const playNextAyah = useCallback((idx: number) => {
    if (idx >= ayahsRef.current.length) {
      setListenCount(prev => prev + 1);
      indexRef.current = 0;
      playNextAyah(0);
      return;
    }
    indexRef.current = idx;
    setCurrentAyahIndex(idx);
    const audio = new Audio(ayahsRef.current[idx].audio);
    audioRef.current = audio;
    audio.onended = () => playNextAyah(idx + 1);
    audio.onerror = () => playNextAyah(idx + 1);
    audio.play().catch(() => setIsPlaying(false));
  }, []);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      playNextAyah(indexRef.current);
    }
  };

  useEffect(() => {
    return () => { audioRef.current?.pause(); };
  }, []);

  return (
    <HifzStepWrapper stepNumber={3} stepTitle="Imprégnation du Tajweed" onBack={onBack} onPause={onPause} totalSteps={5}>
      <div className="text-center space-y-5">
        {/* Header */}
        <div
          className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center"
          style={{ background: 'rgba(69,183,170,0.15)', border: '1px solid rgba(69,183,170,0.3)' }}
        >
          <Headphones className="h-7 w-7" style={{ color: '#45b7aa' }} />
        </div>
        <h3 className="text-base font-bold" style={{ color: '#f0e6c8', fontFamily: "'Playfair Display', serif" }}>
          Imprégnation de la récitation et du Tajweed
        </h3>
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Écoute le récitateur en suivant sur le Mushaf pour assimiler la bonne prononciation.
        </p>

        {/* Mushaf mode toggle + display */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <HifzMushafToggle mode={mushafMode} onChange={(m) => { setMushafModeState(m); setMushafMode(m); }} />
            {mushafMode === 'text' && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setFontSizeIndex(i => Math.max(0, i - 1))}
                  disabled={fontSizeIndex === 0}
                  className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-30 transition-all active:scale-95"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(212,175,55,0.15)' }}
                >
                  <ZoomOut className="h-3.5 w-3.5" style={{ color: '#d4af37' }} />
                </button>
                <span className="text-xs px-2" style={{ color: 'rgba(255,255,255,0.5)' }}>{FONT_LABELS[fontSizeIndex]}</span>
                <button
                  onClick={() => setFontSizeIndex(i => Math.min(2, i + 1))}
                  disabled={fontSizeIndex === 2}
                  className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-30 transition-all active:scale-95"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(212,175,55,0.15)' }}
                >
                  <ZoomIn className="h-3.5 w-3.5" style={{ color: '#d4af37' }} />
                </button>
              </div>
            )}
          </div>

          {mushafMode === 'physical' ? (
            <div className="rounded-xl px-4 py-6 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,175,55,0.15)' }}>
              <p className="text-xs italic" style={{ color: 'rgba(255,255,255,0.45)' }}>
                📖 Ouvre ton Mushaf physique et suis depuis celui-ci.
              </p>
            </div>
          ) : mushafMode === 'image' ? (
            <HifzMushafImage surahNumber={surahNumber} startVerse={startVerse} endVerse={endVerse} maxHeight="320px" />
          ) : (
            <div
              className="rounded-xl overflow-auto max-h-72 px-4 py-4"
              style={{ border: '1px solid rgba(212,175,55,0.25)' }}
              dir="rtl"
            >
              {versesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: '#d4af37', borderTopColor: 'transparent' }} />
                </div>
              ) : (
                <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(212,175,55,0.15)' }}>
                  {startVerse === 1 && surahNumber !== 1 && surahNumber !== 9 && (
                    <p className="text-center mb-3" style={{ fontFamily: FONT_FAMILY, color: '#6a9a6a', fontSize: '22px', lineHeight: '40px', fontWeight: 'bold' }}>
                      بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                    </p>
                  )}
                  {renderedText}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Audio section */}
        <div className="space-y-3">
          <select
            value={reciter}
            onChange={e => { setReciter(e.target.value); localStorage.setItem('quran_reciter', e.target.value); audioRef.current?.pause(); setIsPlaying(false); }}
            className="w-full rounded-xl px-4 py-3 text-sm outline-none"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(212,175,55,0.2)', color: 'white', fontSize: '16px' }}
          >
            {RECITERS.map(r => (
              <option key={r.id} value={r.id} style={{ background: '#0d4f4f' }}>{r.name}</option>
            ))}
          </select>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={togglePlay}
            className="w-20 h-20 rounded-full mx-auto flex items-center justify-center"
            style={{
              background: isPlaying ? 'rgba(212,175,55,0.3)' : 'rgba(255,255,255,0.1)',
              border: `2px solid ${isPlaying ? '#d4af37' : 'rgba(255,255,255,0.2)'}`,
            }}
          >
            {isPlaying
              ? <Pause className="h-8 w-8" style={{ color: '#d4af37' }} />
              : <Play className="h-8 w-8 ml-1" style={{ color: '#d4af37' }} />
            }
          </motion.button>

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
                  setListenCount(0); localStorage.removeItem(storageKey); audioRef.current?.pause(); setIsPlaying(false);
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
          onClick={() => { audioRef.current?.pause(); setIsPlaying(false); onNext(); }}
          className="w-full rounded-2xl py-4 font-semibold flex items-center justify-center gap-2"
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
