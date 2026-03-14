import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { ArrowLeft, Check, BookOpen, Lock, ChevronDown, Sparkles, Lightbulb, CalendarClock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMurajaData, getSurahName, getLiaisonDaysPassed, MemorizedVerse } from '@/hooks/useMurajaData';
import { getExactVersePage } from '@/lib/quranData';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';

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

export default function MurajaRabtPage() {
  const navigate = useNavigate();
  const { loading, allVerses, checkedIds, rabtVerses, thirtyDaysCutoff, handleRabtCheck } = useMurajaData();
  const weekDays = useMemo(() => getWeekDays(), []);
  const todayKey = new Date().toISOString().split('T')[0];
  const [selectedDay, setSelectedDay] = useState(todayKey);
  const [pageMap, setPageMap] = useState<Record<string, number>>({});

  useEffect(() => {
    if (rabtVerses.length === 0) return;
    let cancelled = false;
    (async () => {
      const result: Record<string, number> = {};
      for (const item of rabtVerses) {
        try { result[item.id] = await getExactVersePage(item.surah_number, item.verse_start); } catch {}
      }
      if (!cancelled) setPageMap(result);
    })();
    return () => { cancelled = true; };
  }, [rabtVerses.length]);

  const getRabtForDay = (dayKey: string) =>
    allVerses
      .filter(v => v.memorized_at >= thirtyDaysCutoff && (v.liaison_start_date || v.memorized_at.split('T')[0]) < dayKey)
      .sort((a, b) => a.surah_number - b.surah_number || a.verse_start - b.verse_start);

  const items = getRabtForDay(selectedDay);
  const isFutureDay = selectedDay > todayKey;
  const isToday = selectedDay === todayKey;
  const pending = items.filter(v => !checkedIds.includes(v.id));
  const done = items.filter(v => checkedIds.includes(v.id));
  const allDone = items.length > 0 && done.length === items.length && !isFutureDay;

  const dayIndicators = useMemo(() => {
    const map: Record<string, boolean> = {};
    for (const day of weekDays) {
      map[day.key] = allVerses.some(v => v.memorized_at >= thirtyDaysCutoff && (v.liaison_start_date || v.memorized_at.split('T')[0]) < day.key);
    }
    return map;
  }, [weekDays, allVerses, thirtyDaysCutoff]);

  const renderCard = (item: MemorizedVerse, interactive: boolean) => {
    const isChecked = checkedIds.includes(item.id);
    const locked = isFutureDay;
    const page = pageMap[item.id];
    return (
      <motion.button
        key={`${selectedDay}-${item.id}`}
        onClick={interactive && !locked && !isChecked ? () => handleRabtCheck(item.id) : undefined}
        className="relative rounded-2xl p-3.5 text-left transition-all"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: locked ? 0.7 : isChecked ? 0.5 : 1, y: 0 }}
        style={{
          background: locked ? 'color-mix(in srgb, var(--p-card) 85%, rgba(128,128,128,0.15))' : 'var(--p-card)',
          border: '1px solid var(--p-border)',
          borderLeftWidth: '3px',
          borderLeftColor: '#D4AF37',
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
            <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: '#D4AF37' }}>
              <Check className="h-3 w-3 text-white" />
            </div>
          ) : (
            <div className="w-5 h-5 rounded-full" style={{ border: '2px solid #D4AF37' }} />
          )}
        </div>
        <p className="text-sm font-bold truncate pr-6" style={{ color: 'var(--p-text)' }}>{getSurahName(item.surah_number)}</p>
        <div className="flex items-center gap-1 mt-1.5 text-[11px] font-medium" style={{ color: 'var(--p-text-60)' }}>
          <BookOpen className="h-3 w-3" style={{ color: '#D4AF37' }} />
          <span>v.{item.verse_start} → {item.verse_end}</span>
        </div>
        {page && <p className="text-[10px] mt-1 font-semibold" style={{ color: 'var(--p-text-50)' }}>p. {page}</p>}
        <div className="flex items-center gap-1 mt-1" style={{ color: 'var(--p-text-40)' }}>
          <CalendarClock className="h-3 w-3" />
          <span className="text-[10px] font-medium">J{getLiaisonDaysPassed(item.memorized_at, item.liaison_start_date, selectedDay)}/30</span>
        </div>
      </motion.button>
    );
  };

  return (
    <AppLayout title="Ar-Rabt" hideNav bgClassName="bg-gradient-muraja">
      <div className="max-w-md mx-auto px-4 py-5 space-y-4" style={{ backgroundColor: 'var(--p-bg)', minHeight: '100vh' }}>
        <div className="relative flex items-center justify-center">
          <button onClick={() => navigate('/muraja')} className="absolute left-0 p-1.5 rounded-full" style={{ color: 'var(--p-text-40)' }}>
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
          </button>
          <div className="text-center">
            <h1 className="text-base font-bold" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#D4AF37' }}>Ar-Rabt</h1>
            <p className="text-[11px] font-medium" style={{ color: 'var(--p-text-40)' }}>
              {items.length > 0 ? <><motion.span key={done.length} initial={{ scale: 1.4, color: '#D4AF37' }} animate={{ scale: 1, color: 'var(--p-text-40)' }} style={{ display: 'inline-block' }}>{isFutureDay ? 0 : done.length}</motion.span>/{items.length} terminés</> : 'Liaison quotidienne'}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: '#D4AF37', borderTopColor: 'transparent' }} /></div>
        ) : (
          <>
            {/* Week banner */}
            <div className="flex items-center justify-between rounded-2xl px-2 py-2.5" style={{ background: 'var(--p-card)', border: '1px solid var(--p-border)' }}>
              {weekDays.map(day => {
                const isSelected = selectedDay === day.key;
                const hasItems = dayIndicators[day.key];
                return (
                  <button key={day.key} onClick={() => setSelectedDay(day.key)} className="flex flex-col items-center gap-1 px-2 py-1.5 rounded-xl transition-all" style={{ background: isSelected ? '#D4AF37' : 'transparent', minWidth: '40px' }}>
                    <span className="text-[10px] font-bold uppercase" style={{ color: isSelected ? '#fff' : 'var(--p-text-50)' }}>{day.label}</span>
                    <span className="text-sm font-bold" style={{ color: isSelected ? '#fff' : day.isToday ? '#D4AF37' : 'var(--p-text)' }}>{day.dayNum}</span>
                    <div className="flex gap-1 h-1.5">{hasItems && <div className="w-1.5 h-1.5 rounded-full" style={{ background: isSelected ? 'rgba(255,255,255,0.6)' : '#D4AF37' }} />}</div>
                  </button>
                );
              })}
            </div>

            <p className="text-xs font-medium text-center" style={{ color: 'var(--p-text-50)' }}>
              {isToday ? "Aujourd'hui" : new Date(selectedDay + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }).replace(/^\w/, c => c.toUpperCase())}
            </p>

            <AnimatePresence>
              {allDone && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center justify-center rounded-xl px-4 py-3" style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)' }}>
                  <Sparkles className="h-4 w-4 mr-2" style={{ color: '#D4AF37' }} />
                  <p className="text-xs font-bold" style={{ color: '#D4AF37' }}>Ar-Rabt terminé pour aujourd'hui !</p>
                </motion.div>
              )}
            </AnimatePresence>

            {items.length === 0 ? (
              <p className="text-center text-sm py-8" style={{ color: 'var(--p-text-50)' }}>Aucune liaison ce jour.</p>
            ) : (
              <div className="space-y-2">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#D4AF37' }}>Liaison quotidienne</p>
                    <span className="text-[10px] font-medium" style={{ color: 'var(--p-text-40)' }}>· Récite 1 fois</span>
                  </div>
                  <p className="text-[10px] italic mt-1" style={{ color: 'var(--p-text-40)' }}>
                    Vous pouvez réciter ces pages lors de vos prières quotidiennes.
                  </p>
                </div>
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
      </div>
    </AppLayout>
  );
}
