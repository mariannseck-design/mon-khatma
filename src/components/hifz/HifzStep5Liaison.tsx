import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link2, Check, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { SURAHS } from '@/lib/surahData';
import { getExactVersePage } from '@/lib/quranData';
import HifzStepWrapper from './HifzStepWrapper';

interface VerseBlock {
  surah_number: number;
  verse_start: number;
  verse_end: number;
  surahName: string;
  pageLabel?: string;
}

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export default function HifzStep5Liaison({ onNext, onBack }: Props) {
  const { user } = useAuth();
  const [confirmed, setConfirmed] = useState(false);
  const [blocks, setBlocks] = useState<VerseBlock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    const fetchRecentBlocks = async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data } = await supabase
        .from('hifz_memorized_verses')
        .select('surah_number, verse_start, verse_end')
        .eq('user_id', user.id)
        .gte('memorized_at', thirtyDaysAgo.toISOString())
        .order('surah_number', { ascending: true })
        .order('verse_start', { ascending: true });

      if (data) {
        const mapped = await Promise.all(data.map(async b => {
          const pStart = await getExactVersePage(b.surah_number, b.verse_start);
          const pEnd = await getExactVersePage(b.surah_number, b.verse_end);
          const pageLabel = pStart === pEnd ? `p. ${pStart}` : `p. ${pStart}–${pEnd}`;
          return {
            ...b,
            surahName: SURAHS.find(s => s.number === b.surah_number)?.name || `Sourate ${b.surah_number}`,
            pageLabel,
          };
        }));
        setBlocks(mapped);
      }
      setLoading(false);
    };
    fetchRecentBlocks();
  }, [user]);

  return (
    <HifzStepWrapper stepNumber={5} stepTitle="La Liaison (Ar-Rabt)" onBack={onBack}>
      <div className="text-center space-y-6">
        <div
          className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center"
          style={{ background: 'rgba(212,175,55,0.2)', border: '1px solid rgba(212,175,55,0.3)' }}
        >
          <Link2 className="h-8 w-8" style={{ color: '#d4af37' }} />
        </div>

        <p className="text-white/80 text-sm leading-relaxed px-2">
          Connecte tes acquis. Récite une fois, sans regarder, tout ce que tu as mémorisé ces 30 derniers jours.
        </p>

        {/* Dynamic verse list */}
        <div
          className="rounded-2xl p-5 text-left space-y-3"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(212,175,55,0.15)' }}
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-center" style={{ color: '#d4af37' }}>
            À relier aujourd'hui
          </p>

          {loading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin" style={{ color: '#d4af37' }} />
            </div>
          ) : blocks.length === 0 ? (
            <p className="text-white/50 text-sm text-center py-2">
              Aucun verset mémorisé ces 30 derniers jours.
            </p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {blocks.map((b, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-xl px-3 py-2"
                  style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.12)' }}
                >
                  <span className="text-sm" style={{ color: '#d4af37' }}>📖</span>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.85)' }}>
                      {b.surahName}
                    </p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      Versets {b.verse_start} → {b.verse_end}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setConfirmed(true)}
          disabled={confirmed}
          className="px-6 py-3 rounded-xl font-semibold text-sm"
          style={{
            background: confirmed ? 'rgba(212,175,55,0.3)' : 'rgba(255,255,255,0.1)',
            color: confirmed ? '#d4af37' : 'white',
            border: `1px solid ${confirmed ? '#d4af37' : 'rgba(255,255,255,0.15)'}`,
          }}
        >
          {confirmed ? 'Récitation confirmée ✓' : 'J\'ai récité de mémoire'}
        </motion.button>

        {confirmed && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.97 }}
            onClick={onNext}
            className="w-full rounded-2xl py-4 flex items-center justify-center gap-2 font-semibold"
            style={{ background: 'linear-gradient(135deg, #d4af37, #b8962e)', color: '#1a2e1a' }}
          >
            <Check className="h-5 w-5" />
            Passer à la révision
          </motion.button>
        )}
      </div>
    </HifzStepWrapper>
  );
}
