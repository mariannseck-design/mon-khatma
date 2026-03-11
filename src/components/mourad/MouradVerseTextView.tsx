import { useState, useEffect } from 'react';
import { getVersesByRange, type LocalAyah } from '@/lib/quranData';
import { SURAHS } from '@/lib/surahData';

const FONT_FAMILY = "'Amiri Quran', 'Amiri', 'Scheherazade New', serif";

const BASMALA_WORDS = ['بِسْمِ', 'ٱللَّهِ', 'ٱلرَّحْمَٰنِ', 'ٱلرَّحِيمِ'];

function normalizeForComparison(s: string): string {
  return s.replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640\u06DD\u06DE\u06E9\u06DA\u06DB\u06DC\u200E\u200F\u061C\u200B-\u200D\uFEFF]/gu, '').trim();
}

const BASMALA_NORMALIZED = BASMALA_WORDS.map(normalizeForComparison);

function stripLeadingBasmala(text: string): string {
  const trimmed = text.trimStart();
  if (trimmed.startsWith('﷽')) return trimmed.slice(1).trimStart();
  const words = trimmed.split(/\s+/u);
  if (words.length < 4) return trimmed;
  const first4 = words.slice(0, 4).map(normalizeForComparison);
  if (first4.every((w, i) => w === BASMALA_NORMALIZED[i])) {
    return words.slice(4).join(' ');
  }
  return trimmed;
}

interface Props {
  surahNumber: number;
  startVerse: number;
  endVerse: number;
  fontSize?: number;
  maxHeight?: string;
}

export default function MouradVerseTextView({ surahNumber, startVerse, endVerse, fontSize = 22, maxHeight = '280px' }: Props) {
  const [verses, setVerses] = useState<LocalAyah[]>([]);
  const surah = SURAHS.find(s => s.number === surahNumber);

  useEffect(() => {
    getVersesByRange(surahNumber, startVerse, endVerse).then(setVerses);
  }, [surahNumber, startVerse, endVerse]);

  const showBasmala = surahNumber !== 9 && startVerse === 1;

  return (
    <div
      className="overflow-y-auto p-4"
      style={{ maxHeight, direction: 'rtl' }}
    >
      {/* Surah header */}
      <div className="text-center mb-3" style={{ direction: 'ltr' }}>
        <p className="text-sm font-semibold" style={{ color: '#059669' }}>
          {surah?.name} ({surah?.latinName})
        </p>
      </div>

      {/* Basmala */}
      {showBasmala && (
        <p
          className="text-center mb-3"
          style={{
            fontFamily: FONT_FAMILY,
            fontSize: fontSize - 2,
            color: '#059669',
            lineHeight: 2,
          }}
        >
          بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
        </p>
      )}

      {/* Verses */}
      <div
        className="leading-loose text-right"
        style={{
          fontFamily: FONT_FAMILY,
          fontSize,
          lineHeight: 2.1,
          fontVariantLigatures: 'common-ligatures',
          fontFeatureSettings: '"liga" 1, "calt" 1, "kern" 1',
          color: '#1f2937',
        }}
      >
        {verses.map((v) => {
          const text = showBasmala && v.numberInSurah === 1 && surahNumber !== 1
            ? stripLeadingBasmala(v.text)
            : v.text;

          return (
            <span key={v.numberInSurah}>
              {text}{' '}
              <span
                className="inline-block text-center"
                style={{
                  fontFamily: 'sans-serif',
                  fontSize: fontSize * 0.55,
                  color: '#059669',
                  minWidth: '1.6em',
                  verticalAlign: 'middle',
                }}
              >
                ﴿{v.numberInSurah}﴾
              </span>{' '}
            </span>
          );
        })}
      </div>
    </div>
  );
}
