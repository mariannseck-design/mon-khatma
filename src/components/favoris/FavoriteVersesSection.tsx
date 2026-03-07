import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Trash2, BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { SURAHS } from '@/lib/surahData';

interface FavoriteVerse {
  id: string;
  verse_key: string;
  surah_number: number;
  verse_number: number;
  arabic_text: string | null;
  translation_text: string | null;
  created_at: string;
}

const COLORS = {
  emerald: '#2d6a4f',
  gold: '#b5942e',
  goldAccent: '#d4af37',
};

function getSurahName(num: number) {
  return SURAHS.find(s => s.number === num)?.name || `Sourate ${num}`;
}

export default function FavoriteVersesSection() {
  const { user } = useAuth();
  const [verses, setVerses] = useState<FavoriteVerse[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    const load = async () => {
      const { data } = await supabase
        .from('favorite_verses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      if (data) setVerses(data as FavoriteVerse[]);
      setLoading(false);
    };
    load();
  }, [user]);

  const removeFavorite = async (id: string) => {
    setVerses(prev => prev.filter(v => v.id !== id));
    await supabase.from('favorite_verses').delete().eq('id', id);
  };

  if (!user || loading) return null;

  const displayedVerses = expanded ? verses : verses.slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-2xl p-5"
      style={{
        background: '#faf7f2',
        border: `1.5px solid ${COLORS.gold}30`,
        boxShadow: `0 4px 20px -6px ${COLORS.gold}15`,
      }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.15)' }}
        >
          <Heart className="h-5 w-5 text-red-500" strokeWidth={1.5} fill="rgba(220,38,38,0.3)" />
        </div>
        <div>
          <h4 className="text-sm font-bold tracking-wide" style={{ fontFamily: "'Inter', sans-serif", color: COLORS.emerald }}>
            Mes Versets Favoris
          </h4>
          <p className="text-xs" style={{ color: `${COLORS.emerald}80` }}>
            {verses.length} verset{verses.length !== 1 ? 's' : ''} sauvegardé{verses.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {verses.length === 0 ? (
        <div className="text-center py-6">
          <BookOpen className="h-8 w-8 mx-auto mb-2" style={{ color: `${COLORS.emerald}40` }} />
          <p className="text-xs" style={{ color: `${COLORS.emerald}70` }}>
            Touche un verset dans le Coran puis appuie sur ❤️ pour le sauvegarder
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          <AnimatePresence>
            {displayedVerses.map((v) => (
              <motion.div
                key={v.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="relative rounded-xl p-3"
                style={{ background: 'rgba(255,255,255,0.7)', border: `1px solid ${COLORS.gold}18` }}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: `${COLORS.gold}15`, color: COLORS.gold }}>
                    {getSurahName(v.surah_number)} : {v.verse_number}
                  </span>
                  <button
                    onClick={() => removeFavorite(v.id)}
                    className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(220,38,38,0.08)' }}
                  >
                    <Trash2 className="h-3 w-3 text-red-400" />
                  </button>
                </div>
                {v.arabic_text && (
                  <p className="text-right leading-relaxed mb-1.5 font-arabic text-sm"
                    style={{ color: '#1a1a1a', fontFamily: "'Scheherazade New', 'Amiri', serif" }}
                    dir="rtl">
                    {v.arabic_text.length > 120 ? v.arabic_text.slice(0, 120) + '…' : v.arabic_text}
                  </p>
                )}
                {v.translation_text && (
                  <p className="text-[11px] leading-relaxed" style={{ color: `${COLORS.emerald}90` }}>
                    {v.translation_text.length > 150 ? v.translation_text.slice(0, 150) + '…' : v.translation_text}
                  </p>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {verses.length > 3 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full text-center text-xs font-semibold py-2 rounded-xl transition-colors"
              style={{ color: COLORS.gold, background: `${COLORS.gold}08` }}
            >
              {expanded ? 'Voir moins' : `Voir tout (${verses.length})`}
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}
