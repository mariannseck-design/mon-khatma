import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Check } from 'lucide-react';
import HifzStepWrapper from './HifzStepWrapper';
import { SURAHS } from '@/lib/surahData';
import { getExactVersePage } from '@/lib/quranData';

interface Props {
  surahNumber: number;
  startVerse: number;
  endVerse: number;
  onNext: () => void;
  onBack: () => void;
  onPause?: () => void;
}

export default function HifzStep0Intention({ surahNumber, startVerse, endVerse, onNext, onBack, onPause }: Props) {
  const [translation, setTranslation] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageLabel, setPageLabel] = useState('');
  const surahName = SURAHS.find(s => s.number === surahNumber)?.name || '';

  useEffect(() => {
    getExactVersePage(surahNumber, startVerse).then(startP => {
      getExactVersePage(surahNumber, endVerse).then(endP => {
        setPageLabel(startP === endP ? `P.${startP}` : `P.${startP}-${endP}`);
      });
    });
  }, [surahNumber, startVerse, endVerse]);

  useEffect(() => {
    const fetchTranslation = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://api.alquran.cloud/v1/surah/${surahNumber}/fr.hamidullah`
        );
        const data = await res.json();
        if (data.code === 200) {
          const ayahs = data.data.ayahs
            .filter((a: any) => a.numberInSurah >= startVerse && a.numberInSurah <= endVerse)
            .map((a: any) => `${a.numberInSurah}. ${a.text}`);
          setTranslation(ayahs);
        }
      } catch {
        setTranslation(['Traduction non disponible.']);
      } finally {
        setLoading(false);
      }
    };
    fetchTranslation();
  }, [surahNumber, startVerse, endVerse]);

  return (
    <HifzStepWrapper stepNumber={0} stepTitle="Intention & Préparation" onBack={onBack} onPause={onPause} surahNumber={surahNumber} startVerse={startVerse} endVerse={endVerse}>
      <div className="text-center space-y-4">
        <div
          className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center"
          style={{ background: 'rgba(212,175,55,0.2)', border: '1px solid rgba(212,175,55,0.3)' }}
        >
          <Heart className="h-8 w-8" style={{ color: '#d4af37' }} />
        </div>

        <p className="text-white/80 text-sm leading-relaxed px-2">
          Purifie ton intention pour Allah (le Très-Haut). Prépare ton Mushaf et demande Son aide pour graver Sa parole dans ton cœur.
        </p>

        <div
          className="rounded-2xl p-4 text-left"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(212,175,55,0.15)' }}
        >
          <p className="text-xs uppercase tracking-wider text-white/40 mb-3">
            Traduction — {surahName} {pageLabel && `(${pageLabel}) `}(v.{startVerse}-{endVerse})
          </p>
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <div className="w-6 h-6 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {translation.map((verse, i) => (
                <p key={i} className="text-white/70 text-sm leading-relaxed">{verse}</p>
              ))}
            </div>
          )}
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onNext}
          className="w-full rounded-2xl py-4 flex items-center justify-center gap-2 font-semibold"
          style={{
            background: 'linear-gradient(135deg, #d4af37, #b8962e)',
            color: '#1a2e1a',
          }}
        >
          <Check className="h-5 w-5" />
          J'ai lu et compris le sens
        </motion.button>
      </div>
    </HifzStepWrapper>
  );
}
