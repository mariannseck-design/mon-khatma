import { useState, useEffect, useMemo, useRef } from 'react';
import { SURAHS } from '@/lib/surahData';
import { getPageAyahs, type LocalAyah } from '@/lib/quranData';
import {
  getTajweedAnnotations,
  TAJWEED_COLORS,
  TAJWEED_COLORS_NIGHT,
  type TajweedAnnotation,
} from '@/lib/tajweedData';

type Ayah = LocalAyah;

interface QuranTextViewProps {
  page: number;
  highlightAyah?: number | null;
  fontSize?: number;
  darkMode?: boolean;
  tajweedEnabled?: boolean;
  showTranslation?: boolean;
  translationEdition?: string;
}

const FONT_FAMILY = "'Amiri Quran', 'Amiri', 'Scheherazade New', serif";

// Raw Basmala words for zero-normalization detection
const BASMALA_WORDS = ['بِسْمِ', 'ٱللَّهِ', 'ٱلرَّحْمَٰنِ', 'ٱلرَّحِيمِ'];

function stripLeadingBasmala(text: string): { stripped: string; offset: number } {
  const trimmed = text.trimStart();
  const leadingWhitespace = text.length - trimmed.length;
  if (!trimmed) return { stripped: trimmed, offset: 0 };

  // Check for single Basmala ligature character
  if (trimmed.startsWith('﷽')) {
    const after = trimmed.slice(1).trimStart();
    return { stripped: after, offset: text.length - after.length };
  }

  // Check if the first 4 words match known Basmala patterns
  const words = trimmed.split(/\s+/u);
  if (words.length < 4) return { stripped: trimmed, offset: leadingWhitespace };

  const first4 = words.slice(0, 4);
  const isBasmala = first4.every((word, i) => {
    const clean = word.replace(/[\u06DD\u06DE\u06E9\u06DA\u06DB\u06DC\u200E\u200F\u061C]/gu, '');
    return clean === BASMALA_WORDS[i];
  });

  if (!isBasmala) return { stripped: trimmed, offset: leadingWhitespace };

  if (words.length <= 4) return { stripped: '', offset: text.length };
  const remaining = words.slice(4).join(' ').trimStart();
  return { stripped: remaining, offset: text.length - remaining.length };
}

/** Render text with tajweed color annotations */
function renderTajweedText(
  text: string,
  annotations: TajweedAnnotation[],
  darkMode: boolean,
  charOffset: number = 0,
): React.ReactNode[] {
  if (!annotations.length) return [text];

  const colors = darkMode ? TAJWEED_COLORS_NIGHT : TAJWEED_COLORS;
  const segments: React.ReactNode[] = [];
  let pos = 0;

  for (const ann of annotations) {
    const start = ann.start - charOffset;
    const end = ann.end - charOffset;

    // Skip annotations outside our text range
    if (end <= 0 || start >= text.length) continue;

    const effectiveStart = Math.max(start, 0);
    const effectiveEnd = Math.min(end, text.length);

    // Add plain text before this annotation
    if (effectiveStart > pos) {
      segments.push(text.slice(pos, effectiveStart));
    }

    // Add colored segment
    const color = colors[ann.rule] || undefined;
    if (color) {
      segments.push(
        <span key={`${ann.rule}-${effectiveStart}`} style={{ color }}>
          {text.slice(effectiveStart, effectiveEnd)}
        </span>
      );
    } else {
      segments.push(text.slice(effectiveStart, effectiveEnd));
    }

    pos = effectiveEnd;
  }

  // Add remaining text
  if (pos < text.length) {
    segments.push(text.slice(pos));
  }

  return segments;
}

function VerseCircle({ number, size }: { number: number; size: number }) {
  const bg = '#2E7D32';
  const circleSize = Math.max(size, 16);

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: `${circleSize}px`,
        height: `${circleSize}px`,
        borderRadius: '50%',
        backgroundColor: bg,
        color: '#ffffff',
        fontSize: `${Math.max(circleSize * 0.5, 9)}px`,
        fontFamily: 'system-ui, sans-serif',
        fontWeight: 700,
        lineHeight: 1,
        verticalAlign: 'middle',
        marginRight: '4px',
        marginLeft: '4px',
        userSelect: 'none',
        flexShrink: 0,
      }}
    >
      {number}
    </span>
  );
}

function SurahHeader({ surahNumber, surahName, darkMode }: { surahNumber: number; surahName: string; darkMode: boolean }) {
  const surahData = SURAHS.find(s => s.number === surahNumber);
  const nameFr = surahData?.nameFr || '';

  return (
    <div className="text-center mb-3 mt-1">
      <div className="flex items-center justify-center gap-3 mb-1">
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            backgroundColor: '#2E7D32',
            color: '#ffffff',
            fontSize: '12px',
            fontFamily: 'system-ui, sans-serif',
            fontWeight: 700,
          }}
        >
          {surahNumber}
        </span>
        <h3
          style={{
            fontFamily: FONT_FAMILY,
            color: darkMode ? '#d4c9a8' : '#2d3a25',
            fontSize: '18px',
            fontWeight: 'bold',
            letterSpacing: '0.02em',
          }}
        >
          {surahName}
        </h3>
      </div>
      {nameFr && (
        <p
          style={{
            color: darkMode ? '#8a9a7a' : '#6b7c5e',
            fontSize: '12px',
            fontFamily: 'system-ui, sans-serif',
            fontWeight: 500,
            letterSpacing: '0.05em',
          }}
        >
          {nameFr}
        </p>
      )}
    </div>
  );
}

interface AyahWithAnnotations extends LocalAyah {
  tajweed?: TajweedAnnotation[];
}

// In-memory translation cache
const translationCache = new Map<number, Map<string, string>>();

export default function QuranTextView({ page, highlightAyah, fontSize = 28, darkMode = false, tajweedEnabled = false, showTranslation = false }: QuranTextViewProps) {
  const [ayahs, setAyahs] = useState<AyahWithAnnotations[]>([]);
  const [translations, setTranslations] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedAyah, setSelectedAyah] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const computedFontSize = fontSize;
  const lineHeight = Math.round(computedFontSize * 2.1);
  const circleSize = Math.round(computedFontSize * 0.6);

  useEffect(() => {
    setLoading(true);
    setError(false);

    getPageAyahs(page)
      .then(async (data) => {
        if (data.length > 0) {
          if (tajweedEnabled) {
            // Load tajweed annotations in parallel for all ayahs on this page
            const withAnnotations = await Promise.all(
              data.map(async (ayah) => {
                const tajweed = await getTajweedAnnotations(ayah.surah.number, ayah.numberInSurah);
                return { ...ayah, tajweed };
              })
            );
            setAyahs(withAnnotations);
          } else {
            setAyahs(data);
          }
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [page, tajweedEnabled]);

  // Load translations when enabled
  useEffect(() => {
    if (!showTranslation) { setTranslations(new Map()); return; }
    if (translationCache.has(page)) { setTranslations(translationCache.get(page)!); return; }
    fetch(`https://api.alquran.cloud/v1/page/${page}/fr.hamidullah`)
      .then(res => res.json())
      .then(data => {
        const map = new Map<string, string>();
        if (data.code === 200) {
          for (const ayah of data.data.ayahs) {
            map.set(`${ayah.surah.number}:${ayah.numberInSurah}`, ayah.text);
          }
        }
        translationCache.set(page, map);
        setTranslations(map);
      })
      .catch(() => setTranslations(new Map()));
  }, [page, showTranslation]);

  useEffect(() => { setSelectedAyah(null); }, [page]);

  const grouped = useMemo(() => {
    const groups: { surahName: string; surahNumber: number; ayahs: AyahWithAnnotations[] }[] = [];
    for (const ayah of ayahs) {
      const last = groups[groups.length - 1];
      if (last && last.surahNumber === ayah.surah.number) {
        last.ayahs.push(ayah);
      } else {
        groups.push({ surahName: ayah.surah.name, surahNumber: ayah.surah.number, ayahs: [ayah] });
      }
    }
    return groups;
  }, [ayahs]);

  if (loading) {
    return (
      <div ref={containerRef} className="flex items-center justify-center h-full w-full">
        <div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: '#7a8b6f', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  if (error) {
    return (
      <div ref={containerRef} className="flex items-center justify-center h-full w-full">
        <p style={{ color: '#7a8b6f', fontSize: '14px' }}>Impossible de charger le texte</p>
      </div>
    );
  }

  const activeAyah = selectedAyah ?? highlightAyah ?? null;
  const textColor = darkMode ? '#d4c9a8' : '#1a1a1a';
  const bgColor = darkMode ? '#1a2e1a' : '#ffffff';

  return (
    <div
      ref={containerRef}
      data-text-scroll
      className="h-full w-full overflow-y-auto flex flex-col select-text"
      dir="rtl"
      style={{
        fontFamily: FONT_FAMILY,
        background: bgColor,
        touchAction: 'pan-y',
      }}
    >
      <div
        className={`flex-1 flex flex-col px-5 py-3 pb-16 ${page <= 2 ? 'justify-center items-center' : ''}`}
        style={{ minHeight: 0 }}
      >
        {grouped.map((group, groupIndex) => (
          <div key={`${group.surahNumber}-${page}`} className="last:mb-0">
            {/* Decorative separator between surahs */}
            {groupIndex > 0 && group.ayahs[0].numberInSurah === 1 && (
              <div className="flex items-center justify-center my-4 gap-3" dir="ltr">
                <div
                  className="flex-1 h-px"
                  style={{
                    background: darkMode
                      ? 'linear-gradient(to right, transparent, #6a9a6a, transparent)'
                      : 'linear-gradient(to right, transparent, #2E7D32, transparent)',
                  }}
                />
                <span style={{ color: darkMode ? '#6a9a6a' : '#2E7D32', fontSize: '18px', lineHeight: 1 }}>
                  ✦
                </span>
                <div
                  className="flex-1 h-px"
                  style={{
                    background: darkMode
                      ? 'linear-gradient(to right, transparent, #6a9a6a, transparent)'
                      : 'linear-gradient(to right, transparent, #2E7D32, transparent)',
                  }}
                />
              </div>
            )}

            {/* Surah header */}
            {group.ayahs[0].numberInSurah === 1 && (
              <>
                <SurahHeader
                  surahNumber={group.surahNumber}
                  surahName={group.surahName}
                  darkMode={darkMode}
                />
                {group.surahNumber !== 1 && group.surahNumber !== 9 && (
                  <p
                    className="text-center mb-3"
                    style={{
                      fontFamily: FONT_FAMILY,
                      color: darkMode ? '#6a9a6a' : '#2d5a2d',
                      fontSize: `${Math.round(computedFontSize * 1.3)}px`,
                      lineHeight: `${Math.round(lineHeight * 1.3)}px`,
                      fontWeight: 'bold',
                      letterSpacing: '0.05em',
                    }}
                  >
                    بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                  </p>
                )}
              </>
            )}

            {/* Ayahs — continuous flow or verse-by-verse with translation */}
            <div
              style={{
                textAlign: showTranslation ? 'right' : 'justify',
                textAlignLast: showTranslation ? 'right' : 'center',
                direction: 'rtl',
                fontSize: `${computedFontSize}px`,
                lineHeight: `${lineHeight}px`,
                color: textColor,
                wordSpacing: '0.12em',
                fontVariantLigatures: 'common-ligatures',
                fontFeatureSettings: '"liga" 1, "calt" 1, "kern" 1',
                textRendering: 'optimizeLegibility',
                WebkitFontSmoothing: 'antialiased',
              }}
            >
              {group.ayahs.map((ayah) => {
                const isActive = activeAyah === ayah.number;
                const needsStrip = ayah.numberInSurah === 1 && group.surahNumber !== 1 && group.surahNumber !== 9;
                let displayText = ayah.text;
                let charOffset = 0;

                if (needsStrip) {
                  const result = stripLeadingBasmala(ayah.text);
                  displayText = result.stripped;
                  charOffset = result.offset;
                }

                const textContent = tajweedEnabled && ayah.tajweed?.length
                  ? renderTajweedText(displayText, ayah.tajweed, darkMode, charOffset)
                  : displayText;

                const translationText = showTranslation
                  ? translations.get(`${ayah.surah.number}:${ayah.numberInSurah}`)
                  : null;

                if (showTranslation) {
                  return (
                    <div
                      key={ayah.number}
                      className="mb-4"
                      style={{
                        borderBottom: darkMode ? '1px solid rgba(122,139,111,0.15)' : '1px solid rgba(122,139,111,0.1)',
                        paddingBottom: '12px',
                      }}
                    >
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAyah(prev => prev === ayah.number ? null : ayah.number);
                        }}
                        className="cursor-pointer"
                        style={{
                          background: isActive
                            ? (darkMode ? 'rgba(122, 139, 111, 0.25)' : 'rgba(122, 139, 111, 0.10)')
                            : 'transparent',
                          borderRadius: isActive ? '4px' : '0',
                          padding: isActive ? '0 2px' : '0',
                        }}
                      >
                        {textContent}
                        {' '}
                        <VerseCircle number={ayah.numberInSurah} size={circleSize} />
                      </span>
                      {translationText && (
                        <p
                          dir="ltr"
                          style={{
                            fontFamily: 'system-ui, sans-serif',
                            fontSize: '13px',
                            lineHeight: '1.6',
                            color: darkMode ? 'rgba(212,201,168,0.6)' : 'rgba(26,26,26,0.55)',
                            marginTop: '6px',
                            textAlign: 'left',
                          }}
                        >
                          {translationText}
                        </p>
                      )}
                    </div>
                  );
                }

                return (
                  <span
                    key={ayah.number}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedAyah(prev => prev === ayah.number ? null : ayah.number);
                    }}
                    className="cursor-pointer"
                    style={{
                      background: isActive
                        ? (darkMode ? 'rgba(122, 139, 111, 0.25)' : 'rgba(122, 139, 111, 0.10)')
                        : 'transparent',
                      borderRadius: isActive ? '4px' : '0',
                      padding: isActive ? '0 2px' : '0',
                    }}
                  >
                    {textContent}
                    {' '}
                    <VerseCircle number={ayah.numberInSurah} size={circleSize} />
                    {' '}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
