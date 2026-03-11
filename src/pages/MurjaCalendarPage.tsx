import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { ArrowLeft, Check, Zap, ThumbsUp, Crown, BookOpen, Lock, ChevronDown, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMurajaData, getSurahName, getLiaisonDaysPassed, MemorizedVerse } from '@/hooks/useMurajaData';
import { getExactVersePage } from '@/lib/quranData';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';

const RATINGS = [
  { key: 'hard', label: 'Difficile', quality: 2, icon: Zap, color: '#EF4444' },
  { key: 'good', label: 'Moyen', quality: 4, icon: ThumbsUp, color: '#F59E0B' },
  { key: 'easy', label: 'Facile', quality: 5, icon: Crown, color: '#10B981' },
] as const;

function getWeekDays(): { key: string; label: string; dayNum: number; isToday: boolean; isFuture: boolean }[] {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));

  const days: { key: string; label: string; dayNum: number; isToday: boolean; isFuture: boolean }[] = [];
  const labels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const todayKey = now.toISOString().split('T')[0];

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const key = d.toISOString().split('T')[0];
    days.push({ key, label: labels[i], dayNum: d.getDate(), isToday: key === todayKey, isFuture: key > todayKey });
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
        try { result[item.id] = await getExactVersePage(item.surah_number, item.verse_start); } catch { /* skip */ }
      }
      if (!cancelled) setPageMap(result);
    })();
    return () => { cancelled = true; };
  }, [allItems.length]);

  const allConsolidation = useMemo(() => {
    return allVerses.filter(v => v.memorized_at < thirtyDaysCutoff);
  }, [allVerses, thirtyDaysCutoff]);

  const getItemsForDay = (dayKey: string) => {
    const rabt = rabtVerses;
    const tour = allConsolidation.filter(v => v.next_review_date === dayKey);
    return { rabt, tour };
  };

  const dayIndicators = useMemo(() => {
    const map: Record<string, { hasRabt: boolean; hasTour: boolean }> = {};
    for (const day of weekDays) {
      map[day.key] = {
        hasRabt: rabtVerses.length > 0,
        hasTour: allConsolidation.some(v => v.next_review_date === day.key),
      };
    }
    return map;
  }, [weekDays, rabtVerses, allConsolidation]);

  const selectedItems = getItemsForDay(selectedDay);
  const isFutureDay = selectedDay > todayKey;
  const isToday = selectedDay === todayKey;

  // Split pending vs done
  const pendingRabt = selectedItems.rabt.filter(v => !checkedIds.includes(v.id));
  const doneRabt = selectedItems.rabt.filter(v => checkedIds.includes(v.id));
  const pendingTour = selectedItems.tour.filter(v => !checkedIds.includes(v.id));
  const doneTour = selectedItems.tour.filter(v => checkedIds.includes(v.id));
  const totalItems = selectedItems.rabt.length + selectedItems.tour.length;
  const totalDone = doneRabt.length + doneTour.length;
  const allDayChecked = totalItems > 0 && totalDone === totalItems && !isFutureDay;

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

  const renderCard = (item: MemorizedVerse, isRabt: boolean, interactive: boolean) => {
    const color = getItemColor(item, isRabt);
    const page = pageMap[item.id];
    const isChecked = checkedIds.includes(item.id);
    const checkColor = isRabt ? '#D4AF37' : '#10B981';
    const locked = isFutureDay;

    return (
      <motion.button
        key={item.id}
        onClick={interactive ? () => handleCardTap(item.id, isRabt) : undefined}
        className="relative rounded-2xl p-3.5 text-left transition-all"
        style={{
          background: 'var(--p-card)',
          border: '1px solid var(--p-border)',
          borderLeftWidth: '3px',
          borderLeftColor: color,
          opacity: locked ? 0.45 : isChecked ? 0.5 : 1,
          pointerEvents: locked || isChecked ? 'none' : 'auto',
          cursor: locked ? 'not-allowed' : isChecked ? 'default' : 'pointer',
          filter: locked ? 'grayscale(30%)' : 'none',
        }}
        whileTap={interactive && !locked && !isChecked ? { scale: 0.96 } : {}}
        disabled={locked || isChecked}
        layout
      >
        {/* Checkbox / Lock */}
        <div
          className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center transition-all"
          style={
            isChecked
              ? { background: checkColor }
              : locked
                ? { background: 'var(--p-text-20, rgba(128,128,128,0.15))' }
                : { border: `2px solid ${checkColor}` }
          }
        >
          {isChecked && <Check className="h-3 w-3 text-white" />}
          {locked && !isChecked && <Lock className="h-2.5 w-2.5" style={{ color: 'var(--p-text-40)' }} />}
        </div>

        <p className="text-sm font-bold truncate pr-6" style={{ color: 'var(--p-text)' }}>
          {getSurahName(item.surah_number)}
        </p>
        <div className="flex items-center gap-1 mt-1.5 text-[11px] font-medium" style={{ color: 'var(--p-text-60)' }}>
          <BookOpen className="h-3 w-3" style={{ color }} />
          <span>v.{item.verse_start} → {item.verse_end}</span>
        </div>
        {page && (
          <p className="text-[10px] mt-1 font-semibold" style={{ color: 'var(--p-text-50)' }}>p. {page}</p>
        )}
      </motion.button>
    );
  };

  const renderSection = (label: string, labelColor: string, pending: MemorizedVerse[], done: MemorizedVerse[], isRabt: boolean) => {
    if (pending.length === 0 && done.length === 0) return null;
    return (
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: labelColor }}>{label}</p>
        {pending.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {pending.map(item => renderCard(item, isRabt, true))}
          </div>
        )}
        {done.length > 0 && !isFutureDay && (
          <Collapsible>
            <CollapsibleTrigger className="flex items-center gap-1.5 w-full py-1.5 text-[11px] font-semibold" style={{ color: 'var(--p-text-40)' }}>
              <Check className="h-3 w-3" />
              <span>Terminées ({done.length})</span>
              <ChevronDown className="h-3 w-3 ml-auto transition-transform [[data-state=open]>&]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="grid grid-cols-2 gap-3 mt-1.5">
                {done.map(item => renderCard(item, isRabt, false))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
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
                    style={{ background: isSelected ? '#10B981' : 'transparent', minWidth: '40px' }}
                  >
                    <span className="text-[10px] font-bold uppercase" style={{ color: isSelected ? '#fff' : 'var(--p-text-50)' }}>
                      {day.label}
                    </span>
                    <span className="text-sm font-bold" style={{ color: isSelected ? '#fff' : day.isToday ? '#10B981' : 'var(--p-text)' }}>
                      {day.dayNum}
                    </span>
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
              {isToday ? "Aujourd'hui" : new Date(selectedDay + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }).replace(/^\w/, c => c.toUpperCase())}
              {isFutureDay && ' · Lecture seule'}
            </p>

            {/* Celebration banner */}
            <AnimatePresence>
              {allDayChecked && isToday && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-2.5 rounded-xl px-4 py-3"
                  style={{ background: 'color-mix(in srgb, #10B981 10%, transparent)', border: '1px solid color-mix(in srgb, #10B981 20%, transparent)' }}
                >
                  <Sparkles className="h-4 w-4 flex-shrink-0" style={{ color: '#10B981' }} />
                  <p className="text-xs font-semibold" style={{ color: '#10B981' }}>
                    Alhamdulillah ! Programme du jour terminé.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tasks */}
            {totalItems === 0 ? (
              <p className="text-center text-sm py-8" style={{ color: 'var(--p-text-50)' }}>
                Aucune révision ce jour.
              </p>
            ) : (
              <div className="space-y-4">
                {renderSection('Ar-Rabt', '#D4AF37', isFutureDay ? selectedItems.rabt : pendingRabt, doneRabt, true)}
                {renderSection('Consolidation', '#10B981', isFutureDay ? selectedItems.tour : pendingTour, doneTour, false)}
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
