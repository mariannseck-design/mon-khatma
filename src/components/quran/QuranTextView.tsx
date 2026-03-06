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
}

// Tajweed color map
const TAJWEED_COLORS: Record<string, string> = {
  h: '#AAAAAA', // Hamzat ul Wasl
  s: '#AAAAAA', // Silent
  l: '#AAAAAA', // Lam Shamsiyyah
  n: '#537FFF', // Madd Normal
  p: '#4050FF', // Madd Permissible
  m: '#000EBC', // Madd Obligatoire
  q: '#DD0008', // Qalqalah
  i: '#9400A8', // Ikhfa
  o: '#9400A8', // Ikhfa Meem Saakin
  g: '#FF7E1E', // Ghunnah
  f: '#169200', // Idgham avec Ghunnah
  d: '#169777', // Idgham sans Ghunnah
  b: '#26BFFD', // Iqlab
};

function parseTajweed(text: string): string {
  // Pattern: [x[content] or [x:n[content]
  return text.replace(/\[([a-z])(?::\d+)?\[([^\]]*)\]/g, (_, code, content) => {
    const color = TAJWEED_COLORS[code];
    if (color) {
      return `<span style="color:${color}">${content}</span>`;
    }
    return content;
  });
}

export default function QuranTextView({ page, highlightAyah }: QuranTextViewProps) {
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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

  // Group ayahs by surah
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

  return (
    <div
      className="h-full flex flex-col items-center justify-start px-5 py-6 select-text overflow-auto"
      dir="rtl"
      style={{ fontFamily: "'Amiri', 'Traditional Arabic', serif", touchAction: 'manipulation' }}
    >
      {grouped.map((group) => (
        <div key={`${group.surahNumber}-${page}`} className="w-full mb-4 last:mb-0">
          {group.ayahs[0].numberInSurah === 1 && (
            <>
              <h3 className="text-center text-2xl font-bold mb-3" style={{ color: '#b8952e', fontFamily: "'Playfair Display', serif" }}>
                {group.surahName}
              </h3>
              {group.surahNumber !== 1 && group.surahNumber !== 9 && (
                <p className="text-center text-2xl sm:text-3xl mb-4" style={{ fontFamily: "'Amiri', 'Traditional Arabic', serif", color: '#8a6d1b' }}>
                  بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                </p>
              )}
            </>
          )}
          <p className="text-2xl sm:text-3xl leading-[2.8rem] sm:leading-[3.2rem] text-foreground text-justify">
            {group.ayahs.map((ayah) => (
              <span
                key={ayah.number}
                className={highlightAyah === ayah.number ? 'rounded px-0.5 transition-colors duration-300' : 'transition-colors duration-300'}
                style={highlightAyah === ayah.number ? { background: 'rgba(184, 149, 46, 0.15)' } : undefined}
              >
                <span dangerouslySetInnerHTML={{ __html: parseTajweed(ayah.text) }} />{' '}
                <span className="text-lg sm:text-xl font-bold" style={{ color: '#b8952e' }}>
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
