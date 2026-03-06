import { useState, useEffect } from 'react';

interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  surah: { name: string; number: number };
}

interface QuranTextViewProps {
  page: number;
}

export default function QuranTextView({ page }: QuranTextViewProps) {
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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

  // Group ayahs by surah
  const grouped: { surahName: string; surahNumber: number; ayahs: Ayah[] }[] = [];
  for (const ayah of ayahs) {
    const last = grouped[grouped.length - 1];
    if (last && last.surahNumber === ayah.surah.number) {
      last.ayahs.push(ayah);
    } else {
      grouped.push({
        surahName: ayah.surah.name,
        surahNumber: ayah.surah.number,
        ayahs: [ayah],
      });
    }
  }

  return (
    <div
      className="h-full overflow-y-auto px-6 py-8 select-text"
      dir="rtl"
      style={{ fontFamily: "'Amiri', 'Traditional Arabic', serif" }}
    >
      {grouped.map((group) => (
        <div key={group.surahNumber} className="mb-8">
          {group.ayahs[0].numberInSurah === 1 && (
            <h3 className="text-center text-2xl font-bold text-primary mb-4">
              {group.surahName}
            </h3>
          )}
          <p className="text-3xl leading-[3rem] text-foreground text-justify">
            {group.ayahs.map((ayah) => (
              <span key={ayah.number}>
                {ayah.text}{' '}
                <span className="text-primary text-xl font-bold">
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
