import { useState, useEffect, useMemo, useRef } from 'react';

interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  surah: { name: string; number: number };
}

interface QuranTextViewProps {
  page: number;
  highlightAyah?: number | null;
  fontSize?: number;
  darkMode?: boolean;
}

const FONT_FAMILY = "'KFGQPC Uthmanic Script HAFS', 'Amiri Quran', 'Amiri', 'Scheherazade New', serif";

// Tajweed color map based on Al-Quran.cloud tajweed codes
const TAJWEED_COLORS: Record<string, string> = {
  h: '#AAAAAA',   // hamza wasl
  s: '#AAAAAA',   // silent
  l: '#DD0000',   // lam shamsiyyah
  n: '#169777',   // ghunnah / noon sakinah
  q: '#4050FF',   // qalqalah
  i: '#992299',   // ikhfa
  o: '#FF7E1E',   // ikhfa shafawi / idgham
  m: '#D50000',   // madd (prolongation)
  u: '#169777',   // idgham without ghunnah
  a: '#4050FF',   // iqlab
  r: '#FF4500',   // madd lazim
  f: '#FF7E1E',   // ikhfa with ghunnah
  w: '#999999',   // waqf
  k: '#169777',   // idgham with ghunnah
  b: '#4050FF',   // idgham shafawi
};

function renderTajweed(text: string, darkMode: boolean): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  const regex = /\[([a-z])(?::\d+)?\[([^\]]*)\]/g;
  let match;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const code = match[1];
    const content = match[2];
    const color = TAJWEED_COLORS[code] || (darkMode ? '#d4c9a8' : '#1a1a1a');
    parts.push(
      <span key={key++} style={{ color }}>{content}</span>
    );
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

const LINES_PER_PAGE = 15;

export default function QuranTextView({ page, highlightAyah, darkMode = false }: QuranTextViewProps) {
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedAyah, setSelectedAyah] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [computedFontSize, setComputedFontSize] = useState(26);

  // Compute font size to fit 15 lines in available height
  useEffect(() => {
    const computeSize = () => {
      if (!containerRef.current) return;
      const containerHeight = containerRef.current.clientHeight;
      // Reserve space for surah headers (~60px) and padding (~40px)
      const availableHeight = containerHeight - 40;
      // line-height = fontSize * 2.3, and we want 15 lines
      // 15 * fontSize * 2.3 = availableHeight
      const idealSize = Math.floor(availableHeight / (LINES_PER_PAGE * 2.3));
      // Clamp between 18 and 34
      setComputedFontSize(Math.min(34, Math.max(18, idealSize)));
    };
    computeSize();
    window.addEventListener('resize', computeSize);
    return () => window.removeEventListener('resize', computeSize);
  }, []);

  const lineHeight = Math.round(computedFontSize * 2.3);

  useEffect(() => {
    setLoading(true);
    setError(false);
    fetch(`https://api.alquran.cloud/v1/page/${page}/quran-tajweed`)
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
  const ayahNumberSize = Math.max(computedFontSize * 0.5, 12);
  const textColor = darkMode ? '#d4c9a8' : '#1a1a1a';
  const bgColor = darkMode ? '#1a2e1a' : '#ffffff';

  return (
    <div
      ref={containerRef}
      data-text-scroll
      className="h-full w-full overflow-hidden flex flex-col select-text"
      dir="rtl"
      style={{
        fontFamily: FONT_FAMILY,
        background: bgColor,
        touchAction: 'pan-y',
      }}
    >
      {/* Fixed 15-line page container */}
      <div
        className="flex-1 flex flex-col justify-between px-5 py-3"
        style={{
          minHeight: 0,
          maxHeight: '100%',
        }}
      >
        {grouped.map((group) => (
          <div key={`${group.surahNumber}-${page}`} className="last:mb-0">
            {/* Surah header */}
            {group.ayahs[0].numberInSurah === 1 && (
              <div className="text-center mb-2">
                <div
                  className="inline-block px-6 py-1.5 rounded-xl mx-auto"
                  style={{ background: darkMode ? 'rgba(122,139,111,0.2)' : '#f7f3eb', border: '1px solid rgba(122,139,111,0.15)' }}
                >
                  <h3
                    className="text-base font-bold"
                    style={{ fontFamily: FONT_FAMILY, color: darkMode ? '#d4c9a8' : '#2d3a25', letterSpacing: '0.02em' }}
                  >
                    {group.surahName}
                  </h3>
                </div>
                {group.surahNumber !== 1 && group.surahNumber !== 9 && (
                  <p
                    className="mt-2 mb-1"
                    style={{
                      fontFamily: FONT_FAMILY,
                      color: darkMode ? '#8a9a7a' : '#5e6e54',
                      fontSize: `${computedFontSize * 0.8}px`,
                      lineHeight: `${lineHeight}px`,
                    }}
                  >
                    بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                  </p>
                )}
              </div>
            )}

            {/* Ayahs as flowing text with tajweed */}
            <p
              className="text-justify"
              style={{
                fontSize: `${computedFontSize}px`,
                lineHeight: `${lineHeight}px`,
                color: textColor,
                wordSpacing: '3px',
              }}
            >
              {group.ayahs.map((ayah) => {
                const isActive = activeAyah === ayah.number;
                const tajweedContent = renderTajweed(ayah.text, darkMode);

                return (
                  <span
                    key={ayah.number}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedAyah(prev => prev === ayah.number ? null : ayah.number);
                    }}
                    className="cursor-pointer transition-colors duration-200"
                    style={{
                      background: isActive ? (darkMode ? 'rgba(122, 139, 111, 0.25)' : 'rgba(122, 139, 111, 0.12)') : 'transparent',
                      borderRadius: isActive ? '3px' : '0',
                      padding: isActive ? '1px 2px' : '0',
                      borderBottom: isActive ? '2px solid rgba(122, 139, 111, 0.4)' : '2px solid transparent',
                    }}
                  >
                    {tajweedContent}
                    {' '}
                    <span
                      style={{
                        fontFamily: FONT_FAMILY,
                        color: '#7a8b6f',
                        fontSize: `${ayahNumberSize}px`,
                        fontWeight: 'bold',
                        userSelect: 'none',
                      }}
                    >
                      ﴿{ayah.numberInSurah.toLocaleString('ar-EG')}﴾
                    </span>
                    {' '}
                  </span>
                );
              })}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
