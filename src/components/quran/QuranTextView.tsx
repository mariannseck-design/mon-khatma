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

// Tajweed color map
const TAJWEED_COLORS: Record<string, string> = {
  h: '#AAAAAA',
  s: '#AAAAAA',
  l: '#AAAAAA',
  n: '#537FFF',
  p: '#4050FF',
  m: '#000EBC',
  q: '#DD0008',
  i: '#9400A8',
  o: '#9400A8',
  g: '#FF7E1E',
  f: '#169200',
  d: '#169777',
  b: '#26BFFD',
};

function parseTajweed(text: string): string {
  return text.replace(/\[([a-z])(?::\d+)?\[([^\]]*)\]/g, (_, code, content) => {
    const color = TAJWEED_COLORS[code];
    if (color) {
      return `<span style="color:${color}">${content}</span>`;
    }
    return content;
  });
}

const FONT_FAMILY = "'Scheherazade New', 'Traditional Arabic', serif";

export default function QuranTextView({ page, highlightAyah, fontSize = 24, darkMode = false }: QuranTextViewProps) {
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const lineHeight = `${Math.round(fontSize * 2.2)}px`;

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

  const grouped = useMemo(() => {
    const groups: { surahName: string; surahNumber: number; ayahs: Ayah[] }[] = [];
    for (const ayah of ayahs) {
      const last = groups[groups.length - 1];
      if (last && last.surahNumber === ayah.surah.number) {
        last.ayahs.push(ayah);
      } else {
        groups.push({
          surahName: ayah.surah.name,
          surahNumber: ayah.surah.number,
          ayahs: [ayah],
        });
      }
    }
    return groups;
  }, [ayahs]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>Impossible de charger le texte</p>
      </div>
    );
  }

  const ayahNumberSize = Math.max(fontSize * 0.7, 14);
  const textColor = darkMode ? '#d4af37' : undefined;
  const bgColor = darkMode ? '#1a2e1a' : '#fefdfb';
  const surahNameColor = darkMode ? '#d4af37' : '#8a6d1b';
  const highlightBg = darkMode ? 'rgba(212, 175, 55, 0.15)' : 'rgba(138, 109, 27, 0.12)';

  return (
    <div
      className="h-full flex flex-col items-center justify-start px-5 py-6 select-text overflow-auto"
      dir="rtl"
      style={{ fontFamily: FONT_FAMILY, touchAction: 'pan-y', background: bgColor, color: textColor }}
    >
      {grouped.map((group) => (
        <div key={`${group.surahNumber}-${page}`} className="w-full mb-4 last:mb-0">
          {group.ayahs[0].numberInSurah === 1 && (
            <>
              <h3 className="text-center text-2xl font-bold mb-3" style={{ color: '#8a6d1b', fontFamily: FONT_FAMILY }}>
                {group.surahName}
              </h3>
              {group.surahNumber !== 1 && group.surahNumber !== 9 && (
                <p className="text-center mb-4" style={{ fontFamily: FONT_FAMILY, color: '#8a6d1b', fontSize: `${fontSize}px`, lineHeight }}>
                  بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                </p>
              )}
            </>
          )}
          <p className="text-foreground text-justify" style={{ fontSize: `${fontSize}px`, lineHeight }}>
            {group.ayahs.map((ayah) => (
              <span
                key={ayah.number}
                className={highlightAyah === ayah.number ? 'rounded px-0.5 transition-colors duration-300' : 'transition-colors duration-300'}
                style={highlightAyah === ayah.number ? { background: 'rgba(138, 109, 27, 0.12)' } : undefined}
              >
                <span dangerouslySetInnerHTML={{ __html: parseTajweed(ayah.text) }} />{' '}
                <span className="font-bold" style={{ color: '#8a6d1b', fontSize: `${ayahNumberSize}px` }}>
                  ﴿{ayah.numberInSurah.toLocaleString('ar-EG')}﴾
                </span>{' '}
              </span>
            ))}
          </p>
        </div>
      ))}
    </div>
  );
}
