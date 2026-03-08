import { useState, useEffect, useMemo, useRef } from 'react';
import { SURAHS } from '@/lib/surahData';
import { getPageAyahs, type LocalAyah } from '@/lib/quranData';

type Ayah = LocalAyah;

interface QuranTextViewProps {
  page: number;
  highlightAyah?: number | null;
  fontSize?: number;
  darkMode?: boolean;
}

const FONT_FAMILY = "'KFGQPC Uthmanic Script HAFS', 'Amiri Quran', 'Amiri', 'Scheherazade New', serif";

const LEADING_DECORATION_PATTERN = /^[\s\u200E\u200F\u061C\u06DD\u06DE\u06E9\u06DA\u06DB\u06DC\u06DF\u06E0\u06E1\u06E2\u06E3\u06E4\u06E5\u06E6\u06E7\u06E8\u06EA\u06EB\u06EC\u06ED]+/u;

function normalizeArabicForMatch(value: string) {
  return value
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .replace(/[\s\u200E\u200F\u061C]/gu, '')
    .replace(/[ٱأإآ]/gu, 'ا')
    .replace(/ى/gu, 'ي');
}

function stripLeadingBasmala(text: string) {
  const withoutDecorations = text.replace(LEADING_DECORATION_PATTERN, '').trimStart();
  if (!withoutDecorations) return withoutDecorations;

  if (withoutDecorations.startsWith('﷽')) {
    return withoutDecorations.slice(1).replace(LEADING_DECORATION_PATTERN, '').trimStart();
  }

  const normalized = normalizeArabicForMatch(withoutDecorations);
  if (!normalized.startsWith('بسماللهالرحمنالرحيم')) {
    return withoutDecorations;
  }

  const words = withoutDecorations.split(/\s+/u);
  if (words.length <= 4) return '';
  return words.slice(4).join(' ').trimStart();
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

export default function QuranTextView({ page, highlightAyah, fontSize = 28, darkMode = false }: QuranTextViewProps) {
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
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
    fetch(`https://api.alquran.cloud/v1/page/${page}/quran-uthmani`)
      .then(res => res.json())
      .then(data => {
        if (data.code === 200) {
          setAyahs(data.data.ayahs);
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => { setSelectedAyah(null); }, [page]);

  const grouped = useMemo(() => {
    const groups: { surahName: string; surahNumber: number; ayahs: Ayah[] }[] = [];
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

            {/* Ayahs — continuous flow */}
            <div
              style={{
                textAlign: 'justify',
                textAlignLast: 'center',
                direction: 'rtl',
                fontSize: `${computedFontSize}px`,
                lineHeight: `${lineHeight}px`,
                color: textColor,
                wordSpacing: '0.12em',
                letterSpacing: '0.01em',
              }}
            >
              {group.ayahs.map((ayah) => {
                const isActive = activeAyah === ayah.number;
                // Remove Basmala from verse 1 text for all surahs except Al-Fatiha (1) and At-Tawbah (9)
                let displayText = ayah.text;
                if (ayah.numberInSurah === 1 && group.surahNumber !== 1 && group.surahNumber !== 9) {
                  // Keep only the large green Basmala header; strip any leading Basmala variant from verse text
                  displayText = stripLeadingBasmala(displayText);
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
                    {displayText}
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
