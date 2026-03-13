import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Check, ArrowRight } from 'lucide-react';
import { SURAHS } from '@/lib/surahData';

interface Props {
  surahNumber: number;
  verseStart: number;
  verseEnd: number;
  onNext: () => void;
}

export default function StepComprehension({ surahNumber, verseStart, verseEnd, onNext }: Props) {
  const [translations, setTranslations] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [confirmed, setConfirmed] = useState(false);
  const lockRef = useRef(false);
  const surahName = SURAHS.find(s => s.number === surahNumber)?.name || '';

  useEffect(() => {
    setLoading(true);
    fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/fr.hamidullah`)
      .then(r => r.json())
      .then(data => {
        const map = new Map<string, string>();
        if (data.code === 200) {
          for (const ayah of data.data.ayahs) {
            if (ayah.numberInSurah >= verseStart && ayah.numberInSurah <= verseEnd) {
              map.set(`${ayah.numberInSurah}`, ayah.text);
            }
          }
        }
        setTranslations(map);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [surahNumber, verseStart, verseEnd]);

  const handleConfirm = () => {
    if (lockRef.current) return;
    lockRef.current = true;
    setConfirmed(true);
    console.log('[StepComprehension] ✅ Compréhension confirmée, bouton mémorisation affiché');
  };

  const handleStartMemorisation = () => {
    console.log('[StepComprehension] ▶️ Bouton "Commencer la mémorisation" cliqué → appel onNext()');
    onNext();
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
          style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)' }}
        >
          <BookOpen className="h-7 w-7" style={{ color: '#d4af37' }} />
        </div>
        <h3 className="text-base font-bold" style={{ color: '#ffffff', fontFamily: "'Playfair Display', serif" }}>
          Comprendre le message
        </h3>
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
          {surahName} · Versets {verseStart}-{verseEnd}
        </p>
      </div>

      <div
        className="rounded-xl px-4 py-3"
        style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)' }}
      >
        <p className="text-xs font-medium leading-relaxed" style={{ color: '#d4af37' }}>
          Lisez la traduction pour saisir le sens de ce que vous allez mémoriser.
        </p>
        <p className="text-xs mt-1 italic" style={{ color: 'rgba(212,175,55,0.7)' }}>
          💡 Vous pouvez effectuer cette étape la veille pour laisser votre esprit s'en imprégner durant la nuit.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: '#d4af37', borderTopColor: 'transparent' }} />
        </div>
      ) : (
        <div
          className="rounded-xl overflow-auto max-h-64 px-4 py-4 space-y-3"
          dir="ltr"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212,175,55,0.12)' }}
        >
          {Array.from({ length: verseEnd - verseStart + 1 }, (_, i) => verseStart + i).map(v => (
            <div key={v} className="flex items-start gap-2 pb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <span
                className="inline-flex items-center justify-center shrink-0 mt-0.5"
                style={{
                  width: '20px', height: '20px', borderRadius: '50%',
                  backgroundColor: '#2E7D32', color: '#fff',
                  fontSize: '10px', fontFamily: 'system-ui', fontWeight: 700,
                }}
              >
                {v}
              </span>
              <p className="text-sm leading-relaxed" style={{ color: '#e8e0d0' }}>
                {translations.get(`${v}`) || '...'}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Step 1: Confirm understanding */}
      {!confirmed && !loading && (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleConfirm}
          className="w-full rounded-2xl py-3.5 flex items-center justify-center gap-2 font-semibold text-sm transition-all"
          style={{ background: 'linear-gradient(135deg, #d4af37, #b8962e)', color: '#1a2e1a' }}
        >
          <Check className="h-4 w-4" />
          Je commence
        </motion.button>
      )}

      {!confirmed && !loading && (
        <p className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.55)' }}>
          En route vers un Hifz scellé, avec l'aide d'Allah.
        </p>
      )}



      {/* Step 2: Explicit button to proceed to memorisation */}
      <AnimatePresence>
        {confirmed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div
              className="rounded-xl px-4 py-3 text-center"
              style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.4)' }}
            >
              <p className="text-sm font-semibold" style={{ color: '#d4af37' }}>
                ✨ Magnifique ! Le sens éclaire votre mémorisation.
              </p>
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleStartMemorisation}
              className="w-full rounded-2xl py-3.5 flex items-center justify-center gap-2 font-bold text-sm transition-all"
              style={{ background: 'linear-gradient(135deg, #2E7D32, #1b5e20)', color: '#fff', boxShadow: '0 4px 15px rgba(46,125,50,0.4)' }}
            >
              <ArrowRight className="h-4 w-4" />
              Commencer la mémorisation
            </motion.button>
            <p className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.55)' }}>
              En route vers un Hifz scellé.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
