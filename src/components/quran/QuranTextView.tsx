import { useState, useEffect, useMemo } from 'react';

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

// Strip tajweed markup to get clean text
function stripTajweed(text: string): string {
  return text.replace(/\[([a-z])(?::\d+)?\[([^\]]*)\]/g, (_, _code, content) => content);
}

export default function QuranTextView({ page, highlightAyah, fontSize = 28, darkMode = false }: QuranTextViewProps) {
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedAyah, setSelectedAyah] = useState<number | null>(null);

  const lineHeight = Math.round(fontSize * 2.4);

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

  // Reset selection on page change
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
      <div className="flex items-center justify-center h-full w-full">
        <div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: '#7a8b6f', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <p style={{ color: '#7a8b6f', fontSize: '14px' }}>Impossible de charger le texte</p>
      </div>
    );
  }

  const activeAyah = selectedAyah ?? highlightAyah ?? null;

  const ayahNumberSize = Math.max(fontSize * 0.55, 13);

  return (
    <div
      className="h-full w-full overflow-y-auto px-5 py-8 select-text"
      dir="rtl"
      style={{
        fontFamily: FONT_FAMILY,
        touchAction: 'pan-y',
        background: '#ffffff',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {grouped.map((group) => (
        <div key={`${group.surahNumber}-${page}`} className="mb-6 last:mb-0">
          {/* Surah header */}
          {group.ayahs[0].numberInSurah === 1 && (
            <div className="mb-5 text-center">
              <div
                className="inline-block px-8 py-3 rounded-2xl mx-auto"
                style={{ background: '#f7f3eb', border: '1px solid rgba(122,139,111,0.15)' }}
              >
                <h3
                  className="text-xl font-bold"
                  style={{ fontFamily: FONT_FAMILY, color: '#2d3a25', letterSpacing: '0.02em' }}
                >
                  {group.surahName}
                </h3>
              </div>
              {group.surahNumber !== 1 && group.surahNumber !== 9 && (
                <p
                  className="mt-4 mb-2"
                  style={{
                    fontFamily: FONT_FAMILY,
                    color: '#5e6e54',
                    fontSize: `${fontSize * 0.85}px`,
                    lineHeight: `${lineHeight}px`,
                  }}
                >
                  بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                </p>
              )}
            </div>
          )}

          {/* Ayahs as flowing text */}
          <p
            className="text-justify leading-loose"
            style={{
              fontSize: `${fontSize}px`,
              lineHeight: `${lineHeight}px`,
              color: '#1a1a1a',
              wordSpacing: '4px',
            }}
          >
            {group.ayahs.map((ayah) => {
              const isActive = activeAyah === ayah.number;
              const cleanText = stripTajweed(ayah.text);

              return (
                <span
                  key={ayah.number}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedAyah(prev => prev === ayah.number ? null : ayah.number);
                  }}
                  className="cursor-pointer transition-colors duration-200 rounded-sm"
                  style={{
                    background: isActive ? 'rgba(122, 139, 111, 0.15)' : 'transparent',
                    padding: isActive ? '2px 1px' : '0',
                    borderBottom: isActive ? '2px solid rgba(122, 139, 111, 0.4)' : '2px solid transparent',
                  }}
                >
                  {cleanText}
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

      {/* Bottom padding for controls */}
      <div className="h-24" />
    </div>
  );
}
