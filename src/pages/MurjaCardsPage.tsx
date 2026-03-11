import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { ArrowLeft, Check, Zap, ThumbsUp, Crown, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMurajaData, getSurahName, getLiaisonDaysPassed } from '@/hooks/useMurajaData';
import { getExactVersePage } from '@/lib/quranData';

const RATINGS = [
  { key: 'hard', label: 'Difficile', quality: 2, icon: Zap, color: '#EF4444' },
  { key: 'good', label: 'Moyen', quality: 4, icon: ThumbsUp, color: '#F59E0B' },
  { key: 'easy', label: 'Facile', quality: 5, icon: Crown, color: '#10B981' },
] as const;

export default function MurjaCardsPage() {
  const navigate = useNavigate();
  const {
    loading, allVerses, checkedIds, rabtVerses, tourVerses,
    handleRabtCheck, handleTourRate, handleTourCheck,
  } = useMurajaData();

  const [pageMap, setPageMap] = useState<Record<string, number>>({});
  const [ratingFor, setRatingFor] = useState<string | null>(null);

  const allItems = [...rabtVerses, ...tourVerses];

  useEffect(() => {
    if (allItems.length === 0) return;
    let cancelled = false;
    (async () => {
      const result: Record<string, number> = {};
      for (const item of allItems) {
        try {
          result[item.id] = await getExactVersePage(item.surah_number, item.verse_start);
        } catch { /* skip */ }
      }
      if (!cancelled) setPageMap(result);
    })();
    return () => { cancelled = true; };
  }, [allItems.length]);

  const getItemColor = (item: typeof allItems[0], isRabt: boolean) => {
    if (!isRabt) return '#10B981';
    const days = getLiaisonDaysPassed(item.memorized_at, item.liaison_start_date);
    return days <= 7 ? '#14B8A6' : '#D4AF37';
  };

  const handleCardTap = (id: string, isRabt: boolean) => {
    if (checkedIds.includes(id)) return;
    if (!isRabt) {
      setRatingFor(id);
    } else {
      handleRabtCheck(id);
    }
  };

  const handleRate = (quality: number, ratingKey: string) => {
    if (!ratingFor) return;
    handleTourRate(ratingFor, quality, ratingKey);
    handleTourCheck(ratingFor);
    setRatingFor(null);
  };

  const renderGrid = (items: typeof allItems, isRabt: boolean, label: string) => {
    if (items.length === 0) return null;
    const unchecked = items.filter(i => !checkedIds.includes(i.id));
    const checked = items.filter(i => checkedIds.includes(i.id));

    return (
      <div className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: isRabt ? '#D4AF37' : '#10B981' }}>
          {label}
        </p>

        <div className="grid grid-cols-2 gap-3">
          {unchecked.map(item => {
            const color = getItemColor(item, isRabt);
            const page = pageMap[item.id];
            return (
              <motion.button
                key={item.id}
                onClick={() => handleCardTap(item.id, isRabt)}
                className="relative rounded-2xl p-3.5 text-left transition-all"
                style={{
                  background: 'var(--p-card)',
                  borderLeft: `3px solid ${color}`,
                  border: '1px solid var(--p-border)',
                  borderLeftWidth: '3px',
                  borderLeftColor: color,
                }}
                whileTap={{ scale: 0.96 }}
              >
                <p className="text-sm font-bold truncate" style={{ color: 'var(--p-text)' }}>
                  {getSurahName(item.surah_number)}
                </p>
                <div className="flex items-center gap-1 mt-1.5 text-[11px] font-medium" style={{ color: 'var(--p-text-60)' }}>
                  <BookOpen className="h-3 w-3" style={{ color }} />
                  <span>v.{item.verse_start} → {item.verse_end}</span>
                </div>
                {page && (
                  <p className="text-[10px] mt-1 font-semibold" style={{ color: 'var(--p-text-50)' }}>
                    p. {page}
                  </p>
                )}
              </motion.button>
            );
          })}
        </div>

        {checked.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {checked.map(item => (
              <span
                key={item.id}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold"
                style={{
                  background: isRabt ? 'rgba(212,175,55,0.10)' : 'rgba(16,185,129,0.10)',
                  color: isRabt ? '#D4AF37' : '#10B981',
                }}
              >
                <Check className="h-2.5 w-2.5" />
                {getSurahName(item.surah_number)}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <AppLayout title="Muraja'a — Cartes" hideNav bgClassName="bg-gradient-muraja">
      <div className="max-w-md mx-auto px-4 py-5 space-y-5" style={{ backgroundColor: 'var(--p-bg)', minHeight: '100vh' }}>
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/muraja')}
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--p-card)', border: '1px solid var(--p-border)' }}
          >
            <ArrowLeft className="h-4 w-4" style={{ color: 'var(--p-text-60)' }} />
          </button>
          <h1 className="text-base font-bold" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: 'var(--p-primary)' }}>
            Vue Cartes
          </h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: 'var(--p-primary)', borderTopColor: 'transparent' }} />
          </div>
        ) : allVerses.length === 0 ? (
          <p className="text-center text-sm py-12" style={{ color: 'var(--p-text-60)' }}>Aucun verset mémorisé.</p>
        ) : (
          <>
            {renderGrid(rabtVerses, true, 'Ar-Rabt · Liaison quotidienne')}
            {rabtVerses.length > 0 && tourVerses.length > 0 && (
              <div className="h-px" style={{ background: 'var(--p-border)' }} />
            )}
            {renderGrid(tourVerses, false, 'Consolidation · Révision espacée')}
          </>
        )}

        {/* Rating Bottom Sheet */}
        <AnimatePresence>
          {ratingFor && (
            <motion.div
              className="fixed inset-0 z-50 flex items-end justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="absolute inset-0 bg-black/40" onClick={() => setRatingFor(null)} />
              <motion.div
                className="relative w-full max-w-md rounded-t-2xl p-5 pb-8"
                style={{ background: 'var(--p-card)' }}
                initial={{ y: 200 }}
                animate={{ y: 0 }}
                exit={{ y: 200 }}
              >
                <p className="text-sm font-bold text-center mb-4" style={{ color: 'var(--p-text)' }}>
                  Comment s'est passée cette révision ?
                </p>
                <div className="flex gap-3 justify-center">
                  {RATINGS.map(r => {
                    const Icon = r.icon;
                    return (
                      <button
                        key={r.key}
                        onClick={() => handleRate(r.quality, r.key)}
                        className="flex flex-col items-center gap-1.5 px-5 py-3 rounded-xl transition-all"
                        style={{ background: `color-mix(in srgb, ${r.color} 12%, transparent)`, border: `1px solid color-mix(in srgb, ${r.color} 25%, transparent)` }}
                      >
                        <Icon className="h-5 w-5" style={{ color: r.color }} />
                        <span className="text-[11px] font-bold" style={{ color: r.color }}>{r.label}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}
