import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { ArrowLeft, Check, Zap, ThumbsUp, Crown, BookOpen, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMurajaData, getSurahName, getLiaisonDaysPassed, MemorizedVerse } from '@/hooks/useMurajaData';
import { getExactVersePage } from '@/lib/quranData';

const RATINGS = [
  { key: 'hard', label: 'Difficile', quality: 2, icon: Zap, color: '#EF4444' },
  { key: 'good', label: 'Moyen', quality: 4, icon: ThumbsUp, color: '#F59E0B' },
  { key: 'easy', label: 'Facile', quality: 5, icon: Crown, color: '#10B981' },
] as const;

function getWeekDays(): { key: string; label: string; dayNum: number; isToday: boolean; isFuture: boolean }[] {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));

  const days: { key: string; label: string; dayNum: number; isToday: boolean; isFuture: boolean }[] = [];
  const labels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const todayKey = now.toISOString().split('T')[0];

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const key = d.toISOString().split('T')[0];
    days.push({
      key,
      label: labels[i],
      dayNum: d.getDate(),
      isToday: key === todayKey,
      isFuture: key > todayKey,
    });
  }
  return days;
}

export default function MurjaCalendarPage() {
  const navigate = useNavigate();
  const {
    loading, allVerses, checkedIds, rabtVerses, tourVerses, thirtyDaysCutoff,
    handleRabtCheck, handleTourRate, handleTourCheck,
  } = useMurajaData();

  const weekDays = useMemo(() => getWeekDays(), []);
  const todayKey = new Date().toISOString().split('T')[0];
  const [selectedDay, setSelectedDay] = useState(todayKey);

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

  // All consolidation items with their next_review_date
  const allConsolidation = useMemo(() => {
    return allVerses.filter(v => v.memorized_at < thirtyDaysCutoff);
  }, [allVerses, thirtyDaysCutoff]);

  // For a given day key, which items are scheduled
  const getItemsForDay = (dayKey: string) => {
    const rabt = rabtVerses; // rabt is daily
    const tour = allConsolidation.filter(v => v.next_review_date === dayKey);
    return { rabt, tour };
  };

  // Dot indicators per day
  const dayIndicators = useMemo(() => {
    const map: Record<string, { hasRabt: boolean; hasTour: boolean }> = {};
    for (const day of weekDays) {
      const hasRabt = rabtVerses.length > 0;
      const hasTour = allConsolidation.some(v => v.next_review_date === day.key);
      map[day.key] = { hasRabt, hasTour };
    }
    return map;
  }, [weekDays, rabtVerses, allConsolidation]);

  const selectedItems = getItemsForDay(selectedDay);
  const isFutureDay = selectedDay > todayKey;

  const getItemColor = (item: MemorizedVerse, isRabt: boolean) => {
    if (!isRabt) return '#10B981';
    const days = getLiaisonDaysPassed(item.memorized_at, item.liaison_start_date);
    return days <= 7 ? '#14B8A6' : '#D4AF37';
  };

  const handleCardTap = (id: string, isRabt: boolean) => {
    if (isFutureDay || checkedIds.includes(id)) return;
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

  const renderCards = (items: MemorizedVerse[], isRabt: boolean) => {
    if (items.length === 0) return null;

    return (
      <div className="grid grid-cols-2 gap-3">
        {items.map(item => {
          const color = getItemColor(item, isRabt);
          const page = pageMap[item.id];
          const isChecked = checkedIds.includes(item.id);
          const checkColor = isRabt ? '#D4AF37' : '#10B981';

          return (
            <motion.button
              key={item.id}
              onClick={() => handleCardTap(item.id, isRabt)}
              className="relative rounded-2xl p-3.5 text-left transition-all"
              style={{
                background: 'var(--p-card)',
                border: '1px solid var(--p-border)',
                borderLeftWidth: '3px',
                borderLeftColor: color,
                opacity: isFutureDay ? 0.5 : isChecked ? 0.5 : 1,
              }}
              whileTap={isFutureDay || isChecked ? {} : { scale: 0.96 }}
              disabled={isFutureDay || isChecked}
            >
              {/* Checkbox circle */}
              <div
                className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center transition-all"
                style={isChecked
                  ? { background: checkColor }
                  : isFutureDay
                    ? { border: '1.5px solid var(--p-text-40)' }
                    : { border: `2px solid ${checkColor}` }
                }
              >
                {isChecked && <Check className="h-3 w-3 text-white" />}
                {isFutureDay && !isChecked && (
                  <Lock className="h-2.5 w-2.5" style={{ color: 'var(--p-text-40)' }} />
                )}
              </div>

              <p className="text-sm font-bold truncate pr-6" style={{ color: 'var(--p-text)' }}>
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
    );
  };

  return (
    <AppLayout title="Muraja'a — Calendrier" hideNav bgClassName="bg-gradient-muraja">
      <div className="max-w-md mx-auto px-4 py-5 space-y-4" style={{ backgroundColor: 'var(--p-bg)', minHeight: '100vh' }}>
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
            Vue Calendrier
          </h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: 'var(--p-primary)', borderTopColor: 'transparent' }} />
          </div>
        ) : (
          <>
            {/* Week banner */}
            <div
              className="flex items-center justify-between rounded-2xl px-2 py-2.5"
              style={{ background: 'var(--p-card)', border: '1px solid var(--p-border)' }}
            >
              {weekDays.map(day => {
                const isSelected = selectedDay === day.key;
                const indicators = dayIndicators[day.key];
                return (
                  <button
                    key={day.key}
                    onClick={() => setSelectedDay(day.key)}
                    className="flex flex-col items-center gap-1 px-2 py-1.5 rounded-xl transition-all relative"
                    style={{
                      background: isSelected ? '#10B981' : 'transparent',
                      minWidth: '40px',
                    }}
                  >
                    <span
                      className="text-[10px] font-bold uppercase"
                      style={{ color: isSelected ? '#fff' : 'var(--p-text-50)' }}
                    >
                      {day.label}
                    </span>
                    <span
                      className="text-sm font-bold"
                      style={{ color: isSelected ? '#fff' : day.isToday ? '#10B981' : 'var(--p-text)' }}
                    >
                      {day.dayNum}
                    </span>
                    {/* Dot indicators */}
                    <div className="flex gap-1 h-1.5">
                      {indicators?.hasRabt && (
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: isSelected ? 'rgba(255,255,255,0.6)' : '#D4AF37' }} />
                      )}
                      {indicators?.hasTour && (
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: isSelected ? 'rgba(255,255,255,0.6)' : '#10B981' }} />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected day label */}
            <p className="text-xs font-medium text-center" style={{ color: 'var(--p-text-50)' }}>
              {selectedDay === todayKey ? "Aujourd'hui" : new Date(selectedDay + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }).replace(/^\w/, c => c.toUpperCase())}
              {isFutureDay && ' · Lecture seule'}
            </p>

            {/* Tasks */}
            {selectedItems.rabt.length === 0 && selectedItems.tour.length === 0 ? (
              <p className="text-center text-sm py-8" style={{ color: 'var(--p-text-50)' }}>
                Aucune révision ce jour.
              </p>
            ) : (
              <div className="space-y-4">
                {selectedItems.rabt.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#D4AF37' }}>
                      Ar-Rabt
                    </p>
                    {renderCards(selectedItems.rabt, true)}
                  </div>
                )}
                {selectedItems.tour.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#10B981' }}>
                      Consolidation
                    </p>
                    {renderCards(selectedItems.tour, false)}
                  </div>
                )}
              </div>
            )}
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
