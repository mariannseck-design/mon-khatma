import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Check, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { getSM2Config } from '@/lib/sm2Config';
import { SURAHS } from '@/lib/surahData';
import HifzStepWrapper from './HifzStepWrapper';

const DIFFICULTY_BUTTONS = [
  { value: 'hard', label: '🔴 Difficile - Demain', color: '#dc6464', bg: 'rgba(220,100,100,0.15)', border: 'rgba(220,100,100,0.3)' },
  { value: 'good', label: '🟠 Moyen - Dans 3 jours', color: '#d4af37', bg: 'rgba(212,175,55,0.15)', border: 'rgba(212,175,55,0.3)' },
  { value: 'easy', label: '🟢 Facile - Dans 7 jours', color: '#50c878', bg: 'rgba(80,200,120,0.15)', border: 'rgba(80,200,120,0.3)' },
  { value: 'very_easy', label: '🔵 Très Facile - Dans 15 jours', color: '#3b82f6', bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.3)' },
];

interface ReviewBlock {
  id: string;
  surah_number: number;
  verse_start: number;
  verse_end: number;
  sm2_interval: number;
  sm2_ease_factor: number;
  sm2_repetitions: number;
  surahName: string;
}

interface Props {
  onComplete: (difficulty: string) => void;
  onBack: () => void;
}

export default function HifzStep6Tour({ onComplete, onBack }: Props) {
  const { user } = useAuth();
  const [selected, setSelected] = useState<string | null>(null);
  const [block, setBlock] = useState<ReviewBlock | null>(null);
  const [loading, setLoading] = useState(true);
  const [showText, setShowText] = useState(false);
  const [verseText, setVerseText] = useState<string[]>([]);
  const [loadingText, setLoadingText] = useState(false);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    const fetchDueReview = async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase
        .from('hifz_memorized_verses')
        .select('id, surah_number, verse_start, verse_end, sm2_interval, sm2_ease_factor, sm2_repetitions')
        .eq('user_id', user.id)
        .lte('next_review_date', today)
        .order('next_review_date', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (data) {
        setBlock({
          ...data,
          surahName: SURAHS.find(s => s.number === data.surah_number)?.name || `Sourate ${data.surah_number}`,
        });
      }
      setLoading(false);
    };
    fetchDueReview();
  }, [user]);

  const handleShowText = async () => {
    if (showText) { setShowText(false); return; }
    if (!block) return;
    if (verseText.length > 0) { setShowText(true); return; }

    setLoadingText(true);
    try {
      const res = await fetch('/data/quran-uthmani.json');
      const quranData = await res.json();
      const verses: string[] = [];
      for (let v = block.verse_start; v <= block.verse_end; v++) {
        const key = `${block.surah_number}:${v}`;
        if (quranData[key]) verses.push(`﴿${v}﴾ ${quranData[key]}`);
      }
      setVerseText(verses);
      setShowText(true);
    } catch (err) {
      console.error('Error loading verse text:', err);
    }
    setLoadingText(false);
  };

  const handleComplete = async (difficulty: string) => {
    if (!block || !user) { onComplete(difficulty); return; }

    // SM-2 algorithm
    const cfg = getSM2Config();
    let { sm2_interval: interval, sm2_ease_factor: ease, sm2_repetitions: reps } = block;

    if (difficulty === 'hard') {
      interval = cfg.interval1;
      ease = Math.max(cfg.minEase, ease - 0.15);
      reps = 0;
    } else if (difficulty === 'good') {
      reps += 1;
      if (reps === 1) interval = cfg.interval2;
      else interval = Math.round(interval * ease);
    } else if (difficulty === 'easy') {
      reps += 1;
      if (reps === 1) interval = cfg.interval3;
      else interval = Math.round(interval * ease * 1.3);
      ease += 0.10;
    } else {
      // very_easy
      reps += 1;
      if (reps === 1) interval = cfg.interval4;
      else interval = Math.round(interval * ease * 1.5);
      ease += 0.15;
    }

    // Cap absolu à 40 jours
    interval = Math.min(cfg.maxInterval, interval);

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + interval);

    await supabase.from('hifz_memorized_verses').update({
      sm2_interval: interval,
      sm2_ease_factor: ease,
      sm2_repetitions: reps,
      next_review_date: nextDate.toISOString().split('T')[0],
      last_reviewed_at: new Date().toISOString(),
    }).eq('id', block.id);

    onComplete(difficulty);
  };

  return (
    <HifzStepWrapper stepNumber={6} stepTitle="Le Tour (Révision SM-2)" onBack={onBack}>
      <div className="text-center space-y-6">
        <div
          className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center"
          style={{ background: 'rgba(212,175,55,0.2)', border: '1px solid rgba(212,175,55,0.3)' }}
        >
          <Shield className="h-8 w-8" style={{ color: '#d4af37' }} />
        </div>

        <p className="text-white/80 text-sm leading-relaxed px-2">
          Ta révision quotidienne. Récite le passage ci-dessous de mémoire, puis évalue ta facilité.
        </p>

        {/* Review block reference */}
        <div
          className="rounded-2xl p-5"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(212,175,55,0.15)' }}
        >
          {loading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin" style={{ color: '#d4af37' }} />
            </div>
          ) : !block ? (
            <div className="py-4 space-y-2">
              <p className="text-white/70 text-sm">Aucune révision en attente aujourd'hui.</p>
              <p className="text-white/40 text-xs">Tes révisions apparaîtront ici selon l'algorithme SM-2.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Block reference */}
              <div className="rounded-xl px-4 py-3" style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)' }}>
                <p className="text-sm font-semibold" style={{ color: '#d4af37' }}>
                  📖 {block.surahName}
                </p>
                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  Versets {block.verse_start} → {block.verse_end}
                </p>
              </div>

              {/* Show text toggle */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleShowText}
                disabled={loadingText}
                className="mx-auto flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium"
                style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.12)' }}
              >
                {loadingText ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : showText ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                {showText ? 'Masquer le texte' : 'Voir le texte'}
              </motion.button>

              {/* Revealed text */}
              {showText && verseText.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="rounded-xl p-4 max-h-48 overflow-y-auto text-right"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,175,55,0.1)' }}
                >
                  {verseText.map((v, i) => (
                    <p key={i} className="text-base leading-loose mb-2" style={{ fontFamily: "'Amiri', 'Noto Naskh Arabic', serif", color: 'rgba(255,255,255,0.85)', direction: 'rtl' }}>
                      {v}
                    </p>
                  ))}
                </motion.div>
              )}

              {/* Difficulty buttons */}
              <p className="text-white/60 text-sm">
                Comment s'est passée votre récitation ?
              </p>

              <div className="grid grid-cols-2 gap-3">
                {DIFFICULTY_BUTTONS.map(btn => (
                  <motion.button
                    key={btn.value}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelected(btn.value)}
                    className="rounded-xl py-4 font-semibold text-sm transition-all"
                    style={{
                      background: selected === btn.value ? btn.bg : 'rgba(255,255,255,0.04)',
                      border: `2px solid ${selected === btn.value ? btn.border : 'rgba(255,255,255,0.08)'}`,
                      color: selected === btn.value ? btn.color : 'rgba(255,255,255,0.4)',
                    }}
                  >
                    {btn.label}
                  </motion.button>
                ))}
              </div>
            </div>
          )}
        </div>

        {selected && block && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleComplete(selected)}
            className="w-full rounded-2xl py-4 flex items-center justify-center gap-2 font-semibold"
            style={{ background: 'linear-gradient(135deg, #d4af37, #b8962e)', color: '#1a2e1a' }}
          >
            <Check className="h-5 w-5" />
            Valider la révision
          </motion.button>
        )}

        {/* If no block, allow skipping */}
        {!loading && !block && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => onComplete('none')}
            className="w-full rounded-2xl py-4 flex items-center justify-center gap-2 font-semibold"
            style={{ background: 'linear-gradient(135deg, #d4af37, #b8962e)', color: '#1a2e1a' }}
          >
            <Check className="h-5 w-5" />
            Terminé
          </motion.button>
        )}
      </div>
    </HifzStepWrapper>
  );
}
