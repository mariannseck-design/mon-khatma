import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, Check } from 'lucide-react';
import HifzMushafToggle, { getMushafMode, setMushafMode, type MushafMode } from '../HifzMushafToggle';
import HifzMushafImage from '../HifzMushafImage';
import { getVersesByRange, type LocalAyah } from '@/lib/quranData';

interface Props {
  surahNumber: number;
  verseStart: number;
  verseEnd: number;
  verseLabel?: string;
  onNext: () => void;
}

const FONT_FAMILY = "'Amiri Quran', 'Amiri', 'Scheherazade New', serif";

export default function StepAutonomie({ surahNumber, verseStart, verseEnd, verseLabel, onNext }: Props) {
  const [mushafMode, setMushafModeState] = useState<MushafMode>(getMushafMode);
  const [ayahs, setAyahs] = useState<LocalAyah[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getVersesByRange(surahNumber, verseStart, verseEnd)
      .then(setAyahs)
      .finally(() => setLoading(false));
  }, [surahNumber, verseStart, verseEnd]);

  const renderMushaf = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: '#d4af37', borderTopColor: 'transparent' }} />
        </div>
      );
    }
    if (mushafMode === 'physical') {
      return (
        <div className="rounded-xl px-4 py-6 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,175,55,0.15)' }}>
          <p className="text-xs italic" style={{ color: 'rgba(255,255,255,0.45)' }}>📖 Ouvre ton Mushaf physique et lis sans audio.</p>
        </div>
      );
    }
    if (mushafMode === 'image') {
      return <HifzMushafImage surahNumber={surahNumber} startVerse={verseStart} endVerse={verseEnd} maxHeight="320px" />;
    }
    return (
      <div className="rounded-xl overflow-auto max-h-72 px-4 py-4" dir="rtl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212,175,55,0.12)' }}>
        <div style={{ fontFamily: FONT_FAMILY, fontSize: '22px', lineHeight: '48px', color: '#e8e0d0', textAlign: 'justify', textAlignLast: 'center' }}>
          {ayahs.map(a => (
            <span key={a.number}>
              {a.text}{' '}
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#2E7D32', color: '#fff', fontSize: '10px', fontFamily: 'system-ui', fontWeight: 700, verticalAlign: 'middle', margin: '0 3px' }}>
                {a.numberInSurah}
              </span>{' '}
            </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      className="space-y-5"
    >
      <div className="text-center space-y-2">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto"
          style={{ background: 'rgba(240,208,96,0.15)', border: '1px solid rgba(240,208,96,0.3)' }}
        >
          <Eye className="h-7 w-7" style={{ color: '#f0d060' }} />
        </div>
        <h3 className="text-base font-bold" style={{ color: '#f0e6c8', fontFamily: "'Playfair Display', serif" }}>
          Récitation assistée{verseLabel ? ` — ${verseLabel}` : ''}
        </h3>
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Récitez en regardant le Mushaf, sans audio
        </p>
      </div>

      <HifzMushafToggle mode={mushafMode} onChange={m => { setMushafModeState(m); setMushafMode(m); }} />

      {renderMushaf()}

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={onNext}
        className="w-full rounded-2xl py-3.5 flex items-center justify-center gap-2 font-semibold text-sm"
        style={{ background: 'linear-gradient(135deg, #d4af37, #b8962e)', color: '#1a2e1a' }}
      >
        <Check className="h-4 w-4" />
        J'ai lu
      </motion.button>
    </motion.div>
  );
}
