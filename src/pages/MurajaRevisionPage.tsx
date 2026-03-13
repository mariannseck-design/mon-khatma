import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { ArrowLeft, Check, Zap, ThumbsUp, Crown, Star, BookOpen, Lock, ChevronDown, Sparkles, CalendarClock, Trophy } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useNavigate } from 'react-router-dom';
import { useMurajaData, getSurahName, MemorizedVerse } from '@/hooks/useMurajaData';
import { getExactVersePage } from '@/lib/quranData';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const RATINGS = [
  { key: 'hard', label: '🔴 Difficile - Demain', quality: 2, icon: Zap, color: '#EF4444' },
  { key: 'good', label: '🟠 Moyen - 3 jours', quality: 3, icon: ThumbsUp, color: '#F59E0B' },
  { key: 'easy', label: '🟢 Facile - 7 jours', quality: 4, icon: Crown, color: '#10B981' },
  { key: 'very_easy', label: '🔵 Très Facile - 15 jours', quality: 5, icon: Star, color: '#3B82F6' },
] as const;

function getWeekDays() {
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

export default function MurajaRevisionPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { loading, allVerses, checkedIds, tourVerses, thirtyDaysCutoff, handleTourRate, handleTourCheck } = useMurajaData();
  const weekDays = useMemo(() => getWeekDays(), []);
  const todayKey = new Date().toISOString().split('T')[0];
  const [selectedDay, setSelectedDay] = useState(todayKey);
  const [pageMap, setPageMap] = useState<Record<string, number>>({});
  const [ratingFor, setRatingFor] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [showNewRecord, setShowNewRecord] = useState(false);
  const streakUpdatedRef = useRef(false);

  useEffect(() => {
    if (!user?.id) return;
    supabase.from('hifz_streaks').select('current_streak, longest_streak, last_active_date').eq('user_id', user.id).maybeSingle().then(({ data }) => {
      if (data) {
        setStreak(data.current_streak);
        setLongestStreak(data.longest_streak);
        if (data.last_active_date === todayKey) streakUpdatedRef.current = true;
      }
    });
  }, [user?.id]);

  const allConsolidation = useMemo(() => allVerses.filter(v => v.memorized_at < thirtyDaysCutoff), [allVerses, thirtyDaysCutoff]);

  useEffect(() => {
    if (tourVerses.length === 0) return;
    let cancelled = false;
    (async () => {
      const result: Record<string, number> = {};
      for (const item of tourVerses) {
        try { result[item.id] = await getExactVersePage(item.surah_number, item.verse_start); } catch {}
      }
      if (!cancelled) setPageMap(result);
    })();
    return () => { cancelled = true; };
  }, [tourVerses.length]);

  const getItemsForDay = (dayKey: string) => {
    const tourDue = dayKey === todayKey
      ? allConsolidation.filter(v => v.next_review_date <= dayKey)
      : allConsolidation.filter(v => v.next_review_date === dayKey);
    if (dayKey === todayKey) {
      const dueIds = new Set(tourDue.map(v => v.id));
      const checkedButPushed = allConsolidation.filter(v => !dueIds.has(v.id) && checkedIds.includes(v.id));
      return [...tourDue, ...checkedButPushed];
    }
    return tourDue;
  };

  const items = getItemsForDay(selectedDay);
  const isFutureDay = selectedDay > todayKey;
  const isToday = selectedDay === todayKey;
  const pending = items.filter(v => !checkedIds.includes(v.id));
  const done = items.filter(v => checkedIds.includes(v.id));
  const totalDone = isFutureDay ? 0 : done.length;
  const allDone = items.length > 0 && totalDone === items.length && !isFutureDay;

  // Streak update
  useEffect(() => {
    if (!allDone || !user?.id || streakUpdatedRef.current) return;
    streakUpdatedRef.current = true;
    (async () => {
      const { data: existing } = await supabase.from('hifz_streaks').select('current_streak, longest_streak, last_active_date').eq('user_id', user.id).maybeSingle();
      if (existing?.last_active_date === todayKey) return;
      const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayKey = yesterday.toISOString().split('T')[0];
      const isConsecutive = existing?.last_active_date === yesterdayKey;
      const newStreak = isConsecutive ? (existing?.current_streak ?? 0) + 1 : 1;
      const oldLongest = existing?.longest_streak ?? 0;
      const newLongest = Math.max(newStreak, oldLongest);
      const isBeatRecord = newStreak > oldLongest;
      if (existing) {
        await supabase.from('hifz_streaks').update({ current_streak: newStreak, longest_streak: newLongest, last_active_date: todayKey }).eq('user_id', user.id);
      } else {
        await supabase.from('hifz_streaks').insert({ user_id: user.id, current_streak: 1, longest_streak: 1, last_active_date: todayKey });
      }
      setStreak(newStreak);
      setLongestStreak(newLongest);
      if (isBeatRecord) { setShowNewRecord(true); setTimeout(() => setShowNewRecord(false), 4000); }
    })();
  }, [allDone, user?.id]);

  const dayIndicators = useMemo(() => {
    const map: Record<string, boolean> = {};
    for (const day of weekDays) {
      map[day.key] = day.key === todayKey
        ? allConsolidation.some(v => v.next_review_date <= day.key)
        : allConsolidation.some(v => v.next_review_date === day.key);
    }
    return map;
  }, [weekDays, allConsolidation, todayKey]);

  const handleRate = (quality: number, ratingKey: string) => {
    if (!ratingFor) return;
    handleTourRate(ratingFor, quality, ratingKey);
    handleTourCheck(ratingFor);
    setRatingFor(null);
  };

  const renderCard = (item: MemorizedVerse, interactive: boolean) => {
    const isChecked = checkedIds.includes(item.id);
    const locked = isFutureDay;
    const page = pageMap[item.id];
    return (
      <motion.button
        key={`${selectedDay}-${item.id}`}
        onClick={interactive && !locked && !isChecked ? () => setRatingFor(item.id) : undefined}
        className="relative rounded-2xl p-3.5 text-left transition-all"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: locked ? 0.7 : isChecked ? 0.5 : 1, y: 0 }}
        style={{
          background: locked ? 'color-mix(in srgb, var(--p-card) 85%, rgba(128,128,128,0.15))' : 'var(--p-card)',
          border: '1px solid var(--p-border)',
          borderLeftWidth: '3px',
          borderLeftColor: '#10B981',
          pointerEvents: locked || isChecked ? 'none' : 'auto',
          cursor: locked ? 'not-allowed' : isChecked ? 'default' : 'pointer',
          filter: locked ? 'grayscale(40%)' : 'none',
        }}
        whileTap={interactive && !locked && !isChecked ? { scale: 0.96 } : {}}
        disabled={locked || isChecked}
        layout
      >
        <div className="absolute top-2.5 right-2.5">
          {locked ? (
            <Lock className="h-4 w-4" style={{ color: 'var(--p-text-30)' }} />
          ) : isChecked ? (
            <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: '#10B981' }}>
              <Check className="h-3 w-3 text-white" />
            </div>
          ) : (
            <div className="w-5 h-5 rounded-full" style={{ border: '2px solid #10B981' }} />
          )}
        </div>
        <p className="text-sm font-bold truncate pr-6" style={{ color: 'var(--p-text)' }}>{getSurahName(item.surah_number)}</p>
        <div className="flex items-center gap-1 mt-1.5 text-[11px] font-medium" style={{ color: 'var(--p-text-60)' }}>
          <BookOpen className="h-3 w-3" style={{ color: '#10B981' }} />
          <span>v.{item.verse_start} → {item.verse_end}</span>
        </div>
        {page && <p className="text-[10px] mt-1 font-semibold" style={{ color: 'var(--p-text-50)' }}>p. {page}</p>}
        {item.next_review_date && (
          <div className="flex items-center gap-1 mt-1" style={{ color: 'var(--p-text-40)' }}>
            <CalendarClock className="h-3 w-3" />
            <span className="text-[10px] font-medium">
              {(() => {
                const next = new Date(item.next_review_date + 'T00:00:00');
                const today = new Date(); today.setHours(0,0,0,0);
                const diff = Math.round((next.getTime() - today.getTime()) / 86400000);
                if (diff <= 0) return "Aujourd'hui";
                if (diff === 1) return 'Demain';
                return `Dans ${diff}j`;
              })()}
            </span>
          </div>
        )}
      </motion.button>
    );
  };

  return (
    <AppLayout title="Consolidation" hideNav bgClassName="bg-gradient-muraja">
      <div className="max-w-md mx-auto px-4 py-5 space-y-4" style={{ backgroundColor: 'var(--p-bg)', minHeight: '100vh' }}>
        <div className="relative flex items-center justify-center">
          <button onClick={() => navigate('/muraja')} className="absolute left-0 p-1.5 rounded-full" style={{ color: 'var(--p-text-40)' }}>
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
          </button>
          {streak > 0 && (
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.button initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="absolute right-0 flex items-center gap-0.5 px-2 py-1 rounded-full">
                    <span className="text-xs font-bold" style={{ color: '#D4AF37' }}>{streak}</span>
                    <span className="text-xs">🔥</span>
                  </motion.button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs font-semibold">Record : {longestStreak} jours 🏆</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <div className="text-center">
            <h1 className="text-base font-bold" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#10B981' }}>Consolidation</h1>
            <p className="text-[11px] font-medium" style={{ color: 'var(--p-text-40)' }}>
              {items.length > 0 ? <><motion.span key={totalDone} initial={{ scale: 1.4, color: '#10B981' }} animate={{ scale: 1, color: 'var(--p-text-40)' }} style={{ display: 'inline-block' }}>{totalDone}</motion.span>/{items.length} terminés</> : 'Révision espacée'}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: '#10B981', borderTopColor: 'transparent' }} /></div>
        ) : (
          <>
            <div className="flex items-center justify-between rounded-2xl px-2 py-2.5" style={{ background: 'var(--p-card)', border: '1px solid var(--p-border)' }}>
              {weekDays.map(day => {
                const isSelected = selectedDay === day.key;
                const hasItems = dayIndicators[day.key];
                return (
                  <button key={day.key} onClick={() => setSelectedDay(day.key)} className="flex flex-col items-center gap-1 px-2 py-1.5 rounded-xl transition-all" style={{ background: isSelected ? '#10B981' : 'transparent', minWidth: '40px' }}>
                    <span className="text-[10px] font-bold uppercase" style={{ color: isSelected ? '#fff' : 'var(--p-text-50)' }}>{day.label}</span>
                    <span className="text-sm font-bold" style={{ color: isSelected ? '#fff' : day.isToday ? '#10B981' : 'var(--p-text)' }}>{day.dayNum}</span>
                    <div className="flex gap-1 h-1.5">{hasItems && <div className="w-1.5 h-1.5 rounded-full" style={{ background: isSelected ? 'rgba(255,255,255,0.6)' : '#10B981' }} />}</div>
                  </button>
                );
              })}
            </div>

            <p className="text-xs font-medium text-center" style={{ color: 'var(--p-text-50)' }}>
              {isToday ? "Aujourd'hui" : new Date(selectedDay + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }).replace(/^\w/, c => c.toUpperCase())}
            </p>

            <AnimatePresence>
              {allDone && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center justify-center rounded-xl px-4 py-3" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                  <Sparkles className="h-4 w-4 mr-2" style={{ color: '#10B981' }} />
                  <p className="text-xs font-bold" style={{ color: '#10B981' }}>Consolidation terminée !</p>
                </motion.div>
              )}
            </AnimatePresence>

            {items.length === 0 ? (
              <p className="text-center text-sm py-8" style={{ color: 'var(--p-text-50)' }}>Aucune révision ce jour.</p>
            ) : (
              <div className="space-y-2">
                {(isFutureDay ? items : pending).length > 0 && (
                  <div className="grid grid-cols-2 gap-3">{(isFutureDay ? items : pending).map(item => renderCard(item, true))}</div>
                )}
                {done.length > 0 && !isFutureDay && (
                  <Collapsible>
                    <CollapsibleTrigger className="flex items-center gap-1.5 w-full py-1.5 text-[11px] font-semibold" style={{ color: 'var(--p-text-40)' }}>
                      <Check className="h-3 w-3" /><span>Terminées ({done.length})</span><ChevronDown className="h-3 w-3 ml-auto transition-transform [[data-state=open]>&]:rotate-180" />
                    </CollapsibleTrigger>
                    <CollapsibleContent><div className="grid grid-cols-2 gap-3 mt-1.5">{done.map(item => renderCard(item, false))}</div></CollapsibleContent>
                  </Collapsible>
                )}
              </div>
            )}
          </>
        )}

        {/* Rating Bottom Sheet */}
        <AnimatePresence>
          {ratingFor && (
            <motion.div className="fixed inset-0 z-50 flex items-end justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="absolute inset-0 bg-black/40" onClick={() => setRatingFor(null)} />
              <motion.div className="relative w-full max-w-md rounded-t-2xl p-5 pb-8" style={{ background: 'var(--p-card)' }} initial={{ y: 200 }} animate={{ y: 0 }} exit={{ y: 200 }}>
                <p className="text-sm font-bold text-center mb-4" style={{ color: 'var(--p-text)' }}>Comment s'est passée cette révision ?</p>
                <div className="grid grid-cols-4 gap-2 justify-center">
                  {RATINGS.map(r => {
                    const Icon = r.icon;
                    return (
                      <button key={r.key} onClick={() => handleRate(r.quality, r.key)} className="flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl transition-all" style={{ background: `color-mix(in srgb, ${r.color} 12%, transparent)`, border: `1px solid color-mix(in srgb, ${r.color} 25%, transparent)` }}>
                        <Icon className="h-5 w-5" style={{ color: r.color }} />
                        <span className="text-[10px] font-bold" style={{ color: r.color }}>{r.label}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* New Record Celebration */}
        <AnimatePresence>
          {showNewRecord && (
            <motion.div className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="absolute inset-0 bg-black/30 pointer-events-auto" onClick={() => setShowNewRecord(false)} />
              <motion.div className="relative flex flex-col items-center gap-3 px-8 py-6 rounded-2xl pointer-events-auto" style={{ background: 'var(--p-card)', border: '2px solid #D4AF37', boxShadow: '0 0 40px rgba(212,175,55,0.3)' }} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}>
                <Trophy className="h-10 w-10" style={{ color: '#D4AF37' }} />
                <p className="text-sm font-bold" style={{ color: '#D4AF37' }}>Nouveau record !</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--p-text)' }}>{streak} jours 🔥</p>
                <p className="text-[11px]" style={{ color: 'var(--p-text-50)' }}>Qu'Allah te garde constant(e) !</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}
