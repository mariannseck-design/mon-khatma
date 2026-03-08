import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Trash2, BookOpen, Sparkles, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { SURAHS } from '@/lib/surahData';
import { getExactVersePage } from '@/lib/quranData';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  cream: '#faf7f2',
  warmWhite: '#fdf8f0',
};

function getSurahName(num: number) {
  return SURAHS.find(s => s.number === num)?.name || `Sourate ${num}`;
}

export default function FavoriteVersesSection() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [verses, setVerses] = useState<FavoriteVerse[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-2xl"
      style={{
        background: `linear-gradient(145deg, ${COLORS.cream} 0%, #f5eee0 100%)`,
        border: `1.5px solid ${COLORS.gold}30`,
        boxShadow: `0 6px 24px -8px ${COLORS.gold}20`,
      }}
    >
      {/* Header */}
      <div className="p-5 pb-0">
        <div className="flex items-center gap-3.5 mb-1">
          <motion.div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(239,68,68,0.12) 0%, rgba(239,68,68,0.06) 100%)',
              border: '1.5px solid rgba(239,68,68,0.18)',
            }}
            whileHover={{ scale: 1.05 }}
          >
            <Heart className="h-6 w-6 text-red-400" strokeWidth={1.8} fill="rgba(239,68,68,0.25)" />
          </motion.div>
          <div>
            <h4
              className="text-base font-bold tracking-wide"
              style={{ fontFamily: "'Inter', sans-serif", color: COLORS.emerald }}
            >
              Mes Versets Favoris
            </h4>
            <p className="text-xs" style={{ color: `${COLORS.emerald}90` }}>
              {verses.length > 0
                ? `${verses.length} verset${verses.length !== 1 ? 's' : ''} sauvegardé${verses.length !== 1 ? 's' : ''}`
                : 'Ta collection personnelle'}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 pt-4">
        {verses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-6 px-4 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.5)', border: '1px dashed rgba(45,106,79,0.15)' }}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
              style={{ background: `${COLORS.gold}10`, border: `1px solid ${COLORS.gold}20` }}
            >
              <BookOpen className="h-7 w-7" style={{ color: `${COLORS.gold}` }} />
            </div>
            <p className="text-sm font-medium mb-1.5" style={{ color: COLORS.emerald }}>
              Comment sauvegarder un verset ?
            </p>
            <div className="space-y-1.5">
              <p className="text-xs leading-relaxed" style={{ color: `${COLORS.emerald}80` }}>
                <span className="font-semibold">1.</span> Ouvre le <span className="font-semibold">Mushaf</span> depuis l'accueil
              </p>
              <p className="text-xs leading-relaxed" style={{ color: `${COLORS.emerald}80` }}>
                <span className="font-semibold">2.</span> Touche un <span className="font-semibold">verset</span> pour voir sa traduction
              </p>
              <p className="text-xs leading-relaxed" style={{ color: `${COLORS.emerald}80` }}>
                <span className="font-semibold">3.</span> Appuie sur le <Heart className="h-3 w-3 inline text-red-400" fill="rgba(239,68,68,0.3)" /> pour le sauvegarder ici
              </p>
            </div>
            <button
              onClick={() => navigate('/quran-reader')}
              className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95"
              style={{
                background: `linear-gradient(135deg, ${COLORS.gold}, ${COLORS.goldAccent})`,
                color: '#fff',
                boxShadow: `0 4px 12px -4px ${COLORS.gold}50`,
              }}
            >
              <Sparkles className="h-3.5 w-3.5 inline mr-1.5 -mt-0.5" />
              Ouvrir le Mushaf
            </button>
          </motion.div>
        ) : (
          <ScrollArea className="max-h-[350px] w-full pr-1">
            <div className="space-y-3">
              <AnimatePresence>
                {verses.map((v) => (
                  <motion.div
                    key={v.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    className="relative rounded-xl overflow-hidden cursor-pointer group"
                    style={{
                      background: COLORS.warmWhite,
                      border: `1px solid ${COLORS.gold}18`,
                      boxShadow: '0 2px 8px -2px rgba(0,0,0,0.04)',
                    }}
                    onClick={async () => {
                      const page = await getExactVersePage(v.surah_number, v.verse_number);
                      localStorage.setItem('quran_reader_page', String(page));
                      navigate('/quran-reader');
                    }}
                  >
                    {/* Verse header */}
                    <div
                      className="flex items-center justify-between px-3.5 py-2"
                      style={{ background: `${COLORS.gold}08`, borderBottom: `1px solid ${COLORS.gold}12` }}
                    >
                      <span
                        className="text-[11px] font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1.5"
                        style={{ background: `${COLORS.gold}15`, color: COLORS.gold }}
                      >
                        <BookOpen className="h-3 w-3" />
                        {getSurahName(v.surah_number)} : {v.verse_number}
                      </span>
                      <div className="flex items-center gap-1">
                        <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity" style={{ color: COLORS.gold }} />
                        <button
                          onClick={(e) => { e.stopPropagation(); removeFavorite(v.id); }}
                          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 active:scale-90 transition-transform"
                          style={{ background: 'rgba(220,38,38,0.08)' }}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-red-400" />
                        </button>
                      </div>
                    </div>

                    {/* Verse content */}
                    <div className="px-4 py-3.5">
                      {v.arabic_text && (
                        <p
                          className="text-right leading-[2.2] mb-3"
                          style={{
                            color: '#1a1a1a',
                            fontFamily: "'Scheherazade New', 'Amiri', serif",
                            fontSize: '1.1rem',
                          }}
                          dir="rtl"
                        >
                          {v.arabic_text}
                        </p>
                      )}
                      {v.translation_text && (
                        <p
                          className="text-[12px] leading-relaxed italic"
                          style={{ color: `${COLORS.emerald}90` }}
                        >
                          {v.translation_text}
                        </p>
                      )}
                      <p className="text-[10px] mt-2 opacity-40 text-center" style={{ color: COLORS.gold }}>
                        Toucher pour ouvrir dans le Mushaf
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </ScrollArea>
        )}
      </div>
    </motion.div>
  );
}
