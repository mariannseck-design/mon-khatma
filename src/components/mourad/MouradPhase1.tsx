import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Check } from 'lucide-react';
import { SURAHS } from '@/lib/surahData';
import { getExactVersePage } from '@/lib/quranData';
import MouradMushafToggle, { type MushafMode, getMouradMushafMode, setMouradMushafMode } from './MouradMushafToggle';
import MouradPhysicalView from './MouradPhysicalView';
import HifzMushafImage from '@/components/hifz/HifzMushafImage';
import QuranTextView from '@/components/quran/QuranTextView';

interface Props {
  surahNumber: number;
  startVerse: number;
  endVerse: number;
  onValidate: () => void;
}

export default function MouradPhase1({ surahNumber, startVerse, endVerse, onValidate }: Props) {
  const [mushafMode, setMushafModeState] = useState<MushafMode>(getMouradMushafMode());
  const [page, setPage] = useState(1);
  const [translations, setTranslations] = useState<Map<string, string>>(new Map());
  const [loadingTranslation, setLoadingTranslation] = useState(true);

  const surah = SURAHS.find(s => s.number === surahNumber);

  useEffect(() => {
    getExactVersePage(surahNumber, startVerse).then(setPage);
  }, [surahNumber, startVerse]);

  // Load translations
  useEffect(() => {
    setLoadingTranslation(true);
    fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/fr.hamidullah`)
      .then(r => r.json())
      .then(data => {
        const map = new Map<string, string>();
        if (data.code === 200) {
          for (const ayah of data.data.ayahs) {
            if (ayah.numberInSurah >= startVerse && ayah.numberInSurah <= endVerse) {
              map.set(`${ayah.numberInSurah}`, ayah.text);
            }
          }
        }
        setTranslations(map);
      })
      .catch(() => {})
      .finally(() => setLoadingTranslation(false));
  }, [surahNumber, startVerse, endVerse]);

  const handleModeChange = (mode: MushafMode) => {
    setMushafModeState(mode);
    setMouradMushafMode(mode);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium" style={{ background: 'rgba(5,150,105,0.1)', color: '#059669' }}>
          <BookOpen className="h-3.5 w-3.5" />
          Phase 1 — Compréhension
        </div>
        <h2 className="text-lg font-bold text-gray-800">
          {surah?.name} · v.{startVerse}-{endVerse}
        </h2>
        <p className="text-gray-500 text-xs">
          Lis le Tafsir et la traduction, puis valide ta compréhension
        </p>
      </div>

      {/* Mushaf toggle */}
      <MouradMushafToggle mode={mushafMode} onChange={handleModeChange} />

      {/* Mushaf display */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {mushafMode === 'image' && (
          <HifzMushafImage surahNumber={surahNumber} startVerse={startVerse} endVerse={endVerse} maxHeight="280px" />
        )}
        {mushafMode === 'text' && (
          <div style={{ height: '280px' }}>
            <QuranTextView page={page} fontSize={22} darkMode={false} showTranslation tajweedEnabled />
          </div>
        )}
        {mushafMode === 'physical' && (
          <MouradPhysicalView surahNumber={surahNumber} startVerse={startVerse} endVerse={endVerse} />
        )}
      </div>

      {/* Translation section */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 space-y-3">
        <h3 className="font-semibold text-gray-800 text-sm">📖 Traduction</h3>
        {loadingTranslation ? (
          <div className="flex justify-center py-4">
            <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: '#059669', borderTopColor: 'transparent' }} />
          </div>
        ) : (
          <div className="space-y-3">
            {Array.from({ length: endVerse - startVerse + 1 }, (_, i) => startVerse + i).map(v => (
              <div key={v} className="text-sm">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold text-white mr-2" style={{ background: '#059669' }}>
                  {v}
                </span>
                <span className="text-gray-600">
                  {translations.get(`${v}`) || '...'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Validate button */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={onValidate}
        className="w-full rounded-2xl py-4 flex items-center justify-center gap-3 font-bold text-white"
        style={{
          background: 'linear-gradient(135deg, #059669, #10B981)',
          boxShadow: '0 4px 20px rgba(5,150,105,0.3)',
        }}
      >
        <Check className="h-5 w-5" />
        J'ai compris le sens des versets
      </motion.button>
    </div>
  );
}
