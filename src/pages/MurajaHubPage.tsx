import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { ArrowLeft, Link2, RefreshCw, BookOpen, CalendarDays, BarChart3, ChevronRight } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useNavigate } from 'react-router-dom';
import { useMurajaData } from '@/hooks/useMurajaData';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';

export default function MurajaHubPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { loading, rabtVerses, tourVerses, checkedIds } = useMurajaData();
  const today = useMemo(() => new Date(), []);
  const monday = useMemo(() => startOfWeek(today, { weekStartsOn: 1 }), [today]);

  const [streak, setStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);

  const [weekSessions, setWeekSessions] = useState(0);
  const [weekVerses, setWeekVerses] = useState(0);
  const [weekActiveDays, setWeekActiveDays] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!user?.id) return;
    const weekStart = format(monday, 'yyyy-MM-dd');

    Promise.all([
      supabase
        .from('hifz_streaks')
        .select('current_streak, longest_streak')
        .eq('user_id', user.id)
        .maybeSingle(),
      supabase
        .from('muraja_sessions')
        .select('completed_at, verses_reviewed')
        .eq('user_id', user.id)
        .not('completed_at', 'is', null)
        .gte('completed_at', weekStart),
    ]).then(([streakRes, murajaRes]) => {
      if (streakRes.data) {
        setStreak(streakRes.data.current_streak);
        setLongestStreak(streakRes.data.longest_streak);
      }

      const sessions = murajaRes.data || [];
      setWeekSessions(sessions.length);

      let totalV = 0;
      const activeDays = new Set<number>();
      for (const s of sessions) {
        const d = new Date(s.completed_at!);
        for (let i = 0; i < 7; i++) {
          if (isSameDay(d, addDays(monday, i))) { activeDays.add(i); break; }
        }
        const reviewed = s.verses_reviewed as any[];
        if (Array.isArray(reviewed)) {
          for (const r of reviewed) {
            totalV += ((r.end || r.verse_end || r.end_verse || 0) - (r.start || r.verse_start || r.start_verse || 0) + 1);
          }
        }
      }
      setWeekVerses(totalV);
      setWeekActiveDays(activeDays);
    });
  }, [user?.id, monday]);

  const rabtDone = rabtVerses.filter(v => checkedIds.includes(v.id)).length;
  const tourDone = tourVerses.filter(v => checkedIds.includes(v.id)).length;

  const TOTAL_QURAN_VERSES = 6236;
  const totalMemorized = useMemo(() => {
    return allVerses.reduce((sum, v) => sum + (v.verse_end - v.verse_start + 1), 0);
  }, [allVerses]);
  const progressPercent = Math.min(100, (totalMemorized / TOTAL_QURAN_VERSES) * 100);
  const totalPages = Math.max(totalMemorized > 0 ? 1 : 0, Math.round(totalMemorized / 15));
  const totalJuz = Math.round((totalMemorized / TOTAL_QURAN_VERSES) * 30 * 10) / 10;

  return (
    <AppLayout title="Muraja'a" hideNav bgClassName="bg-gradient-muraja">
      <div className="max-w-md mx-auto px-4 py-5 space-y-5" style={{ backgroundColor: 'var(--p-bg)', minHeight: '100vh' }}>
        {/* Header */}
        <div className="relative flex items-center justify-center">
          <button
            onClick={() => navigate('/accueil')}
            className="absolute left-0 p-1.5 rounded-full"
            style={{ color: 'var(--p-text-40)' }}
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
          </button>
          {streak > 0 && (
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.button
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="absolute right-0 flex items-center gap-0.5 px-2 py-1 rounded-full"
                  >
                    <span className="text-xs font-bold" style={{ color: '#D4AF37' }}>{streak}</span>
                    <span className="text-xs">🔥</span>
                  </motion.button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs font-semibold">
                  Record : {longestStreak} jours 🏆
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <div className="text-center">
            <h1 className="text-base font-bold" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: 'var(--p-primary)' }}>
              Muraja'a
            </h1>
            <p className="text-[11px] font-medium" style={{ color: 'var(--p-text-40)' }}>
              Consolide ta mémorisation
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: 'var(--p-primary)', borderTopColor: 'transparent' }} />
          </div>
        ) : (
          <>
            {/* Global Progress */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl p-4 space-y-2.5"
              style={{ background: 'var(--p-card)', border: '1px solid var(--p-border)', boxShadow: 'var(--p-card-shadow)' }}
            >
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--p-text-40)' }}>
                  Progression globale
                </p>
                <span className="text-xs font-bold" style={{ color: 'var(--p-primary)' }}>
                  {progressPercent.toFixed(1)}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--p-track)' }}>
                <motion.div
                  className="h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  style={{ background: 'linear-gradient(90deg, #10B981, #D4AF37)' }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px]" style={{ color: 'var(--p-text-50)' }}>
                <span>{totalMemorized} versets · {totalPages} pages</span>
                <span>{totalJuz} / 30 juz</span>
              </div>
            </motion.div>

          {/* Weekly Recap */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl p-4 space-y-3"
              style={{ background: 'var(--p-card)', border: '1px solid var(--p-border)', boxShadow: 'var(--p-card-shadow)' }}
            >
              <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--p-text-40)' }}>
                Cette semaine
              </p>

              {/* Stats row */}
              <div className="flex items-center justify-around">
                <div className="flex flex-col items-center gap-0.5">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.12)' }}>
                    <BarChart3 className="h-4 w-4" style={{ color: '#10B981' }} />
                  </div>
                  <span className="text-sm font-bold" style={{ color: 'var(--p-text)' }}>{weekSessions}</span>
                  <span className="text-[9px]" style={{ color: 'var(--p-text-40)' }}>sessions</span>
                </div>
                <div className="flex flex-col items-center gap-0.5">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(212,175,55,0.12)' }}>
                    <BookOpen className="h-4 w-4" style={{ color: '#D4AF37' }} />
                  </div>
                  <span className="text-sm font-bold" style={{ color: 'var(--p-text)' }}>{Math.max(weekVerses > 0 ? 1 : 0, Math.round(weekVerses / 15))}</span>
                  <span className="text-[9px]" style={{ color: 'var(--p-text-40)' }}>pages</span>
                </div>
                <div className="flex flex-col items-center gap-0.5">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.12)' }}>
                    <CalendarDays className="h-4 w-4" style={{ color: '#6366F1' }} />
                  </div>
                  <span className="text-sm font-bold" style={{ color: 'var(--p-text)' }}>{weekActiveDays.size}/7</span>
                  <span className="text-[9px]" style={{ color: 'var(--p-text-40)' }}>jours actifs</span>
                </div>
              </div>

              {/* Day dots */}
              <div className="flex items-center justify-between px-2 pt-1">
                {['L','M','M','J','V','S','D'].map((label, i) => {
                  const isActive = weekActiveDays.has(i);
                  const isToday = isSameDay(addDays(monday, i), today);
                  return (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <span className="text-[10px] font-medium" style={{ color: 'var(--p-text-55)' }}>{label}</span>
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center"
                        style={{
                          background: isActive ? 'rgba(16,185,129,0.85)' : 'var(--p-track)',
                          border: isToday && !isActive ? '2px solid rgba(16,185,129,0.6)' : '1px solid transparent',
                          boxShadow: isActive ? '0 0 6px rgba(16,185,129,0.3)' : 'none',
                        }}
                      >
                        {isActive && <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'white' }} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

          <div className="space-y-4">
            {/* Ar-Rabt Card */}
            <motion.button
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              onClick={() => navigate('/muraja/rabt')}
              className="w-full rounded-2xl p-5 text-left transition-all"
              style={{
                background: 'var(--p-card)',
                border: '1px solid var(--p-border)',
                borderLeftWidth: '4px',
                borderLeftColor: '#D4AF37',
              }}
              whileTap={{ scale: 0.97 }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(212,175,55,0.15)' }}>
                  <Link2 className="h-5 w-5" style={{ color: '#D4AF37' }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold" style={{ color: 'var(--p-text)' }}>Ar-Rabt</p>
                  <p className="text-[11px]" style={{ color: 'var(--p-text-50)' }}>Liaison quotidienne · 30 jours</p>
                </div>
                <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: 'rgba(212,175,55,0.12)', color: '#D4AF37' }}>
                  {rabtDone}/{rabtVerses.length}
                </span>
              </div>
              <p className="text-[11px] leading-relaxed" style={{ color: 'var(--p-text-40)' }}>
                Récite chaque jour tes portions récentes pour les ancrer solidement.
              </p>
            </motion.button>

            {/* Consolidation Card */}
            <motion.button
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              onClick={() => navigate('/muraja/revision')}
              className="w-full rounded-2xl p-5 text-left transition-all"
              style={{
                background: 'var(--p-card)',
                border: '1px solid var(--p-border)',
                borderLeftWidth: '4px',
                borderLeftColor: '#10B981',
              }}
              whileTap={{ scale: 0.97 }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.15)' }}>
                  <RefreshCw className="h-5 w-5" style={{ color: '#10B981' }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold" style={{ color: 'var(--p-text)' }}>Consolidation</p>
                  <p className="text-[11px]" style={{ color: 'var(--p-text-50)' }}>Révision espacée SM-2</p>
                </div>
                <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: 'rgba(16,185,129,0.12)', color: '#10B981' }}>
                  {tourDone}/{tourVerses.length}
                </span>
              </div>
              <p className="text-[11px] leading-relaxed" style={{ color: 'var(--p-text-40)' }}>
                Révise tes portions anciennes au moment optimal selon l'algorithme.
              </p>
            </motion.button>
           </div>

            {/* Continuer la mémorisation */}
            <motion.button
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              onClick={() => navigate('/hifz')}
              className="w-full rounded-full py-3.5 px-6 flex items-center justify-center gap-2 font-semibold text-sm"
              style={{
                background: 'var(--p-primary)',
                color: 'white',
                boxShadow: '0 4px 14px rgba(16,185,129,0.3)',
              }}
              whileTap={{ scale: 0.96 }}
            >
              Continuer la mémorisation
              <ChevronRight className="h-4 w-4" />
            </motion.button>
          </>
        )}
      </div>
    </AppLayout>
  );
}
