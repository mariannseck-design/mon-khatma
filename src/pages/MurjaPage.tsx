import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { AppLayout } from '@/components/layout/AppLayout';
import { RefreshCw, TrendingUp, CalendarDays, Info, Link, BookOpen, Sparkles, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { SURAHS, getApproxVersePage } from '@/lib/surahData';
import { graduateLiaisonBlocks, splitBlockByPages } from '@/lib/hifzUtils';
import { getExactVersePage } from '@/lib/quranData';
import { SparkleEffect } from '@/components/planificateur/SparkleEffect';
import MurajaCountdown from '@/components/muraja/MurajaCountdown';
import MurajaChecklist from '@/components/muraja/MurajaChecklist';
import MurajaCelebration from '@/components/muraja/MurajaCelebration';
import MurajaMethodModal from '@/components/muraja/MurajaMethodModal';
import MurajaWeeklyRecap from '@/components/muraja/MurajaWeeklyRecap';

const MAX_TOUR_BLOCKS_PER_DAY = 10;

interface MemorizedVerse {
  id: string;
  surah_number: number;
  verse_start: number;
  verse_end: number;
  memorized_at: string;
  last_reviewed_at: string | null;
  next_review_date: string;
  sm2_interval: number;
  sm2_ease_factor: number;
  sm2_repetitions: number;
  liaison_status?: string;
  liaison_start_date?: string | null;
}

function computeSM2(quality: number, repetitions: number, easeFactor: number, interval: number) {
  let newEF = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (newEF < 1.3) newEF = 1.3;
  let newInterval: number;
  let newReps: number;
  if (quality < 3) {
    newReps = 0;
    newInterval = 1;
  } else {
    newReps = repetitions + 1;
    if (newReps === 1) newInterval = 1;
    else if (newReps === 2) newInterval = 6;
    else newInterval = Math.round(interval * newEF);
  }
  return { interval: newInterval, easeFactor: newEF, repetitions: newReps };
}

function getTodayKey() {
  return new Date().toISOString().split('T')[0];
}

function getStorageKey() {
  return `muraja_checked_${getTodayKey()}`;
}

function loadChecked(): string[] {
  try {
    const saved = localStorage.getItem(getStorageKey());
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveChecked(ids: string[]) {
  localStorage.setItem(getStorageKey(), JSON.stringify(ids));
  Object.keys(localStorage)
    .filter(k => k.startsWith('muraja_checked_') && k !== getStorageKey())
    .forEach(k => localStorage.removeItem(k));
}

export default function MurjaPage() {
  const { user } = useAuth();
  const [allVerses, setAllVerses] = useState<MemorizedVerse[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkedIds, setCheckedIds] = useState<string[]>(loadChecked);
  const [celebration, setCelebration] = useState<'daily' | 'cycle' | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [graduatedCount, setGraduatedCount] = useState(0);
  const [showGraduation, setShowGraduation] = useState(false);
  useEffect(() => {
    if (!user) return;
    const fetchVerses = async () => {
      setLoading(true);
      const graduated = await graduateLiaisonBlocks(user.id);
      if (graduated > 0) {
        setGraduatedCount(graduated);
        setShowGraduation(true);
      }
      const { data } = await supabase
        .from('hifz_memorized_verses')
        .select('*')
        .eq('user_id', user.id)
        .order('memorized_at', { ascending: false });

      const verses = (data as MemorizedVerse[]) || [];

      let needsRefresh = false;
      for (const verse of verses) {
        const subBlocks = await splitBlockByPages(verse.surah_number, verse.verse_start, verse.verse_end);
        if (subBlocks.length > 1) {
          needsRefresh = true;
          await supabase.from('hifz_memorized_verses').delete().eq('id', verse.id);
          const newRows = subBlocks.map(sub => ({
            user_id: user.id,
            surah_number: sub.surahNumber,
            verse_start: sub.verseStart,
            verse_end: sub.verseEnd,
            memorized_at: verse.memorized_at,
            next_review_date: verse.next_review_date,
            sm2_interval: verse.sm2_interval,
            sm2_ease_factor: verse.sm2_ease_factor,
            sm2_repetitions: verse.sm2_repetitions,
            liaison_status: verse.liaison_status,
            liaison_start_date: verse.liaison_start_date,
            last_reviewed_at: verse.last_reviewed_at,
          }));
          await supabase.from('hifz_memorized_verses').insert(newRows);
        }
      }

      if (needsRefresh) {
        const { data: refreshed } = await supabase
          .from('hifz_memorized_verses')
          .select('*')
          .eq('user_id', user.id)
          .order('memorized_at', { ascending: false });
        setAllVerses((refreshed as MemorizedVerse[]) || []);
      } else {
        setAllVerses(verses);
      }
      setLoading(false);
    };
    fetchVerses();
  }, [user, refreshKey]);

  const rabtVerses = useMemo(() => {
    return allVerses.filter(v => v.liaison_status === 'liaison');
  }, [allVerses]);

  const { tourVerses, isCapActive, totalDueCount } = useMemo(() => {
    const today = getTodayKey();
    const allDue = allVerses.filter(
      v => (v.liaison_status === 'tour' || !v.liaison_status) && v.next_review_date <= today
    );
    return {
      tourVerses: allDue.slice(0, MAX_TOUR_BLOCKS_PER_DAY),
      isCapActive: allDue.length > MAX_TOUR_BLOCKS_PER_DAY,
      totalDueCount: allDue.length,
    };
  }, [allVerses]);

  const nextTourReviews = useMemo(() => {
    const today = getTodayKey();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowKey = tomorrow.toISOString().split('T')[0];

    // Tour reviews scheduled for the future
    const futureReviews = allVerses
      .filter(v => (v.liaison_status === 'tour' || !v.liaison_status) && v.next_review_date > today)
      .map(v => ({ surah_number: v.surah_number, verse_start: v.verse_start, verse_end: v.verse_end, next_review_date: v.next_review_date }));

    // Liaison verses are due every day → show them as "tomorrow"
    const liaisonReviews = allVerses
      .filter(v => v.liaison_status === 'liaison')
      .map(v => ({ surah_number: v.surah_number, verse_start: v.verse_start, verse_end: v.verse_end, next_review_date: tomorrowKey }));

    return [...liaisonReviews, ...futureReviews]
      .sort((a, b) => a.next_review_date.localeCompare(b.next_review_date))
      .slice(0, 3);
  }, [allVerses]);

  const totalBlocks = rabtVerses.length + tourVerses.length;
  const checkedCount = checkedIds.filter(
    id => rabtVerses.some(v => v.id === id) || tourVerses.some(v => v.id === id)
  ).length;

  const allDailyChecked = checkedCount >= totalBlocks && totalBlocks > 0;

  const { totalVersesCount, surahSummary } = useMemo(() => {
    const total = allVerses.reduce((sum, v) => sum + (v.verse_end - v.verse_start + 1), 0);
    const map = new Map<string, { name: string; surahNumber: number; verseMin: number; verseMax: number; nextReview: string; isLiaison: boolean }>();
    for (const v of allVerses) {
      const isLiaison = v.liaison_status === 'liaison';
      const key = `${v.surah_number}_${isLiaison ? 'liaison' : 'tour'}`;
      const existing = map.get(key);
      if (existing) {
        existing.verseMin = Math.min(existing.verseMin, v.verse_start);
        existing.verseMax = Math.max(existing.verseMax, v.verse_end);
        if (v.next_review_date < existing.nextReview) existing.nextReview = v.next_review_date;
      } else {
        const surahName = SURAHS.find(s => s.number === v.surah_number)?.name || `Sourate ${v.surah_number}`;
        map.set(key, { name: surahName, surahNumber: v.surah_number, verseMin: v.verse_start, verseMax: v.verse_end, nextReview: v.next_review_date, isLiaison });
      }
    }
    return {
      totalVersesCount: total,
      surahSummary: [...map.values()].sort((a, b) => {
        if (a.isLiaison !== b.isLiaison) return a.isLiaison ? -1 : 1;
        return a.verseMin - b.verseMin || a.name.localeCompare(b.name);
      }),
    };
  }, [allVerses]);

  const [pageMap, setPageMap] = useState<Record<string, { startPage: number; endPage: number }>>({});
  useEffect(() => {
    if (surahSummary.length === 0) return;
    let cancelled = false;
    (async () => {
      const result: Record<string, { startPage: number; endPage: number }> = {};
      for (const s of surahSummary) {
        const key = `${s.surahNumber}_${s.isLiaison ? 'l' : 't'}`;
        try {
          const [startPage, endPage] = await Promise.all([
            getExactVersePage(s.surahNumber, s.verseMin),
            getExactVersePage(s.surahNumber, s.verseMax),
          ]);
          result[key] = { startPage, endPage };
        } catch { /* skip */ }
      }
      if (!cancelled) setPageMap(result);
    })();
    return () => { cancelled = true; };
  }, [surahSummary]);

  const nextReviewsForCountdown = useMemo(() => {
    const today = getTodayKey();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowKey = tomorrow.toISOString().split('T')[0];

    const formatReviewDate = (dateStr: string) => {
      if (dateStr === tomorrowKey) return 'Demain';
      const d = new Date(dateStr + 'T00:00:00');
      const diff = Math.ceil((d.getTime() - new Date().setHours(0,0,0,0)) / 86400000);
      const dayMonth = d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
      if (diff <= 7) {
        const weekday = d.toLocaleDateString('fr-FR', { weekday: 'long' }).replace(/^\w/, c => c.toUpperCase());
        return `${weekday} ${dayMonth}`;
      }
      return dayMonth;
    };

    // Tour/future reviews
    const futureItems = allVerses
      .filter(v => v.next_review_date > today && v.liaison_status !== 'liaison')
      .map(v => ({ ...v, _sortDate: v.next_review_date }));

    // Liaison verses are daily → treat them as due tomorrow
    const liaisonItems = allVerses
      .filter(v => v.liaison_status === 'liaison')
      .map(v => ({ ...v, _sortDate: tomorrowKey }));

    return [...liaisonItems, ...futureItems]
      .sort((a, b) => a._sortDate.localeCompare(b._sortDate))
      .slice(0, 5)
      .map(v => {
        const surahName = SURAHS.find(s => s.number === v.surah_number)?.name || `Sourate ${v.surah_number}`;
        const page = getApproxVersePage(v.surah_number, v.verse_start);
        return {
          surahName,
          verseStart: v.verse_start,
          verseEnd: v.verse_end,
          page: `p. ${page}`,
          date: formatReviewDate(v._sortDate),
          type: (v.liaison_status === 'liaison' ? 'rabt' : 'tour') as 'rabt' | 'tour',
        };
      });
  }, [allVerses, pageMap]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const handleRabtCheck = useCallback(async (id: string) => {
    if (!user) return;
    const newChecked = [...checkedIds, id];
    setCheckedIds(newChecked);
    saveChecked(newChecked);

    await supabase
      .from('hifz_memorized_verses')
      .update({ last_reviewed_at: new Date().toISOString() })
      .eq('id', id);

    const verse = rabtVerses.find(v => v.id === id);
    if (verse) {
      await supabase.from('muraja_sessions').insert({
        user_id: user.id,
        session_type: 'rabt',
        verses_reviewed: [{ surah: verse.surah_number, start: verse.verse_start, end: verse.verse_end }],
        completed_at: new Date().toISOString(),
      });
    }

    const allChecked = newChecked.filter(
      cid => rabtVerses.some(v => v.id === cid) || tourVerses.some(v => v.id === cid)
    ).length;
    if (allChecked >= totalBlocks && totalBlocks > 0) {
      setCelebration('daily');
    }
  }, [user, checkedIds, rabtVerses, tourVerses, totalBlocks]);

  const handleTourRate = useCallback(async (id: string, quality: number, ratingKey: string) => {
    if (!user) return;
    const verse = tourVerses.find(v => v.id === id) || allVerses.find(v => v.id === id);
    if (!verse) return;

    const { interval, easeFactor, repetitions } = computeSM2(
      quality, verse.sm2_repetitions, verse.sm2_ease_factor, verse.sm2_interval
    );
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + interval);

    await supabase
      .from('hifz_memorized_verses')
      .update({
        sm2_interval: interval,
        sm2_ease_factor: easeFactor,
        sm2_repetitions: repetitions,
        next_review_date: nextDate.toISOString().split('T')[0],
        last_reviewed_at: new Date().toISOString(),
      })
      .eq('id', id);

    await supabase.from('muraja_sessions').insert({
      user_id: user.id,
      session_type: 'tour',
      difficulty_rating: ratingKey,
      verses_reviewed: [{ surah: verse.surah_number, start: verse.verse_start, end: verse.verse_end }],
      completed_at: new Date().toISOString(),
    });
  }, [user, tourVerses, allVerses]);

  const handleTourCheck = useCallback(async (id: string) => {
    const newChecked = [...checkedIds, id];
    setCheckedIds(newChecked);
    saveChecked(newChecked);

    const allChecked = newChecked.filter(
      cid => rabtVerses.some(v => v.id === cid) || tourVerses.some(v => v.id === cid)
    ).length;
    if (allChecked >= totalBlocks && totalBlocks > 0) {
      if (user) {
        const { data: recentSessions } = await supabase
          .from('muraja_sessions')
          .select('created_at')
          .eq('user_id', user.id)
          .eq('session_type', 'tour')
          .gte('created_at', new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString());

        const uniqueDays = new Set(
          (recentSessions || []).map(s => s.created_at.split('T')[0])
        );
        uniqueDays.add(getTodayKey());

        if (uniqueDays.size >= 6) {
          const { data: streak } = await supabase
            .from('hifz_streaks')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();
          if (streak) {
            await supabase.from('hifz_streaks').update({
              total_tours_completed: streak.total_tours_completed + 1,
            }).eq('id', streak.id);
          }
          setCelebration('cycle');
        } else {
          setCelebration('daily');
        }
      } else {
        setCelebration('daily');
      }
    }
  }, [user, checkedIds, rabtVerses, tourVerses, totalBlocks]);

  const refresh = () => setRefreshKey(k => k + 1);

  return (
    <AppLayout title="Muraja'a" hideNav bgClassName="bg-gradient-muraja">
      <div className="max-w-md mx-auto px-4 py-5 space-y-4" style={{ backgroundColor: 'var(--p-bg)', minHeight: '100vh' }}>
        {/* Compact Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #065F46, #10B981)',
                boxShadow: '0 3px 10px -2px rgba(16, 185, 129, 0.4)',
              }}
            >
              <RefreshCw className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1
                className="text-base font-bold tracking-wide"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", color: 'var(--p-primary)' }}
              >
                Muraja'a
              </h1>
              <p className="text-[10px] font-medium -mt-0.5" style={{ color: 'var(--p-text-60)' }}>
                Consolide ta mémorisation
              </p>
            </div>
          </div>
          {!loading && allVerses.length > 0 && (
            <button
              onClick={refresh}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
              style={{ background: 'var(--p-card)', border: '1px solid var(--p-border)' }}
              title="Actualiser"
            >
              <RefreshCw className="h-3 w-3" style={{ color: 'var(--p-text-60)' }} />
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: 'var(--p-primary)', borderTopColor: 'transparent' }} />
          </div>
        ) : allVerses.length === 0 ? (
          <div
            className="rounded-2xl p-8 text-center"
            style={{
              background: 'var(--p-gradient-bg)',
              border: '2px solid var(--p-accent)',
              boxShadow: '0 8px 32px -8px rgba(6,95,70,0.4)',
            }}
          >
            <RefreshCw className="h-10 w-10 mx-auto mb-4" style={{ color: 'var(--p-accent)' }} />
            <p className="text-base font-medium leading-relaxed" style={{ color: 'var(--p-on-dark)' }}>
              Tu n'as pas encore de versets mémorisés.
            </p>
            <p className="text-sm font-medium mt-2" style={{ color: 'var(--p-on-dark-muted)' }}>
              Commence par le module Hifz pour ancrer tes premiers versets !
            </p>
          </div>
        ) : totalBlocks === 0 ? (
          <>
            {/* All done — success banner */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl px-4 py-3 flex items-center gap-3"
              style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(212, 175, 55, 0.08))',
                border: '1px solid rgba(16, 185, 129, 0.25)',
              }}
            >
              <Sparkles className="h-5 w-5 flex-shrink-0" style={{ color: '#D4AF37' }} />
              <div>
                <p className="text-xs font-bold" style={{ color: 'var(--p-primary)' }}>
                  Alhamdulillah, tu as terminé tes révisions !
                </p>
                <p className="text-[10px] font-medium" style={{ color: 'var(--p-text-60)' }}>
                  Prochaines révisions selon la répétition espacée.
                </p>
              </div>
            </motion.div>

            {/* Récap hebdomadaire */}
            <MurajaWeeklyRecap />

            {/* Mes ayats mémorisées */}
            <div
              className="rounded-2xl p-4 space-y-2.5"
              style={{
                background: 'var(--p-card)',
                border: '1px solid var(--p-border)',
              }}
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #6D28D9, #8B5CF6)' }}>
                  <TrendingUp className="h-3 w-3 text-white" />
                </div>
                <h3 className="text-xs font-bold" style={{ color: 'var(--p-primary)' }}>
                  Mes ayats mémorisées · {totalVersesCount} Ayat{totalVersesCount > 1 ? 's' : ''}
                </h3>
              </div>
              <div className="space-y-1">
                {surahSummary.map((s, idx) => {
                  const today = getTodayKey();
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  const tomorrowKey = tomorrow.toISOString().split('T')[0];
                  const phaseLabel = s.isLiaison ? 'liaison' : 'révision';

                  let statusText: string;
                  if (s.nextReview <= today) {
                    statusText = s.isLiaison ? 'Phase de liaison' : 'Phase de révision';
                  } else if (s.nextReview === tomorrowKey) {
                    statusText = `Prochaine ${phaseLabel} : demain`;
                  } else {
                    statusText = `Prochaine ${phaseLabel} : ${formatDate(s.nextReview)}`;
                  }

                  return (
                    <div
                      key={`${s.name}_${idx}`}
                      className="flex items-center justify-between px-2.5 py-1.5 rounded-lg"
                      style={{ background: 'var(--p-card-active)' }}
                    >
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="h-2.5 w-2.5 flex-shrink-0" style={{ color: s.isLiaison ? '#D4AF37' : '#10B981' }} />
                        <span className="text-[11px] font-bold" style={{ color: 'var(--p-primary)' }}>{s.name}</span>
                        <span className="text-[11px] font-extrabold" style={{ color: 'var(--p-primary)' }}>{s.verseMin}→{s.verseMax}</span>
                      </div>
                      <span className="text-[9px] font-medium" style={{ color: 'var(--p-text-65)' }}>{statusText}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Countdown */}
            <MurajaCountdown allChecked={allDailyChecked} nextReviews={nextReviewsForCountdown} />

  const todayReviewedTourItems = useMemo(() => {
    const today = getTodayKey();
    return allVerses.filter(v =>
      (v.liaison_status === 'tour' || !v.liaison_status) &&
      v.last_reviewed_at?.startsWith(today)
    );
  }, [allVerses]);


            {/* Progress bar */}
            {totalBlocks > 0 && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold" style={{ color: 'var(--p-primary)' }}>
                    Progression du jour
                  </span>
                  <span className="font-bold" style={{ color: 'var(--p-accent)' }}>
                    {checkedCount >= totalBlocks
                      ? 'Tout révisé !'
                      : checkedCount === 0
                        ? "C'est parti !"
                        : `${totalBlocks - checkedCount} restante${totalBlocks - checkedCount > 1 ? 's' : ''}`}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--p-track)' }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: 'var(--p-gradient-fill)' }}
                    animate={{ width: `${totalBlocks > 0 ? (checkedCount / totalBlocks) * 100 : 0}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            )}

            {/* ── Mon Programme du Jour ── */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: 'var(--p-primary)' }}>
                  Mon Programme du Jour
                </h2>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                  style={{ background: 'linear-gradient(135deg, #065F46, #10B981)' }}
                >
                  {totalBlocks} portion{totalBlocks > 1 ? 's' : ''}
                </span>
              </div>

              {/* Sub-section: Ar-Rabt */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#D4AF37' }} />
                  <span className="text-xs font-bold" style={{ color: '#B8860B' }}>Ar-Rabt</span>
                  <span className="text-[11px] font-bold" style={{ color: 'var(--p-text-60)' }}>· Liaison quotidienne</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(212, 175, 55, 0.12)', color: '#B8860B' }}>
                    {rabtVerses.length}
                  </span>
                  <MurajaMethodModal defaultTab="rabt" />
                </div>
                <MurajaChecklist
                  items={rabtVerses}
                  section="rabt"
                  checkedIds={checkedIds}
                  onCheck={handleRabtCheck}
                />
              </div>

              {/* Sub-section: Consolidation */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#10B981' }} />
                  <span className="text-xs font-bold" style={{ color: '#059669' }}>Consolidation</span>
                  <span className="text-[11px] font-bold" style={{ color: 'var(--p-text-60)' }}>· Révision espacée</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#059669' }}>
                    {tourVerses.length}
                  </span>
                  <MurajaMethodModal defaultTab="sm2" />
                </div>
                <MurajaChecklist
                  items={tourVerses}
                  section="tour"
                  checkedIds={checkedIds}
                  onCheck={handleTourCheck}
                  onRate={handleTourRate}
                  isCapActive={isCapActive}
                  totalDue={totalDueCount}
                  hasTourBlocks={allVerses.some(v => v.liaison_status === 'tour' || !v.liaison_status)}
                  firstArrivalDate={
                    rabtVerses.length > 0
                      ? rabtVerses.reduce((earliest, v) => {
                          if (!v.liaison_start_date) return earliest;
                          return !earliest || v.liaison_start_date < earliest ? v.liaison_start_date : earliest;
                        }, null as string | null) ?? undefined
                      : undefined
                  }
                  nextTourReviews={nextTourReviews}
                  checkedTourItems={todayReviewedTourItems}
                />
              </div>
            </div>

            {/* Récap hebdomadaire */}
            <MurajaWeeklyRecap />

            {/* Mes ayats mémorisées */}
            <div
              className="rounded-2xl p-4 space-y-2.5"
              style={{
                background: 'var(--p-card)',
                border: '1px solid var(--p-border)',
              }}
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #6D28D9, #8B5CF6)' }}>
                  <TrendingUp className="h-3 w-3 text-white" />
                </div>
                <h3 className="text-xs font-bold" style={{ color: 'var(--p-primary)' }}>
                  Mes ayats mémorisées · {totalVersesCount} Ayat{totalVersesCount > 1 ? 's' : ''}
                </h3>
              </div>
              <div className="space-y-1">
                {surahSummary.map((s, idx) => {
                  const isLiaison = s.isLiaison;
                  const pages = pageMap[`${s.surahNumber}_${isLiaison ? 'l' : 't'}`];
                  const pageLabel = pages
                    ? pages.startPage === pages.endPage
                      ? `${pages.startPage}`
                      : `${pages.startPage}-${pages.endPage}`
                    : '';

                  return (
                    <div
                      key={`${s.name}_${idx}`}
                      className="flex items-center justify-between px-2.5 py-1.5 rounded-lg"
                      style={{
                        background: isLiaison ? 'rgba(212, 175, 55, 0.06)' : 'rgba(16, 185, 129, 0.06)',
                        borderLeft: `2px solid ${isLiaison ? '#D4AF37' : '#10B981'}`,
                      }}
                    >
                      <div className="flex items-center gap-1.5">
                        {isLiaison ? (
                          <Link className="h-2.5 w-2.5 flex-shrink-0" style={{ color: '#D4AF37' }} />
                        ) : (
                          <BookOpen className="h-2.5 w-2.5 flex-shrink-0" style={{ color: '#10B981' }} />
                        )}
                        <span className="text-[11px] font-bold" style={{ color: 'var(--p-primary)' }}>{s.name}</span>
                        <span className="text-[11px] font-extrabold" style={{ color: 'var(--p-primary)' }}>{s.verseMin}→{s.verseMax}</span>
                        {pageLabel && (
                          <span className="flex items-center gap-0.5 text-[9px] font-semibold px-1 py-0.5 rounded" style={{ background: 'var(--p-card)', color: 'var(--p-text-50)' }}>
                            <FileText className="h-2 w-2" />
                            {pageLabel}
                          </span>
                        )}
                      </div>
                      <span className="text-[9px] font-medium flex-shrink-0" style={{ color: isLiaison ? '#B8860B' : '#059669' }}>
                        {isLiaison ? 'Liaison' : 'Révision'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      <MurajaCelebration
        type={celebration || 'daily'}
        isOpen={celebration !== null}
        onClose={() => setCelebration(null)}
      />

      {/* Graduation celebration */}
      <Dialog open={showGraduation} onOpenChange={setShowGraduation}>
        <DialogContent className="sm:max-w-md text-center border-none shadow-xl bg-gradient-to-br from-card via-card to-accent/10 relative overflow-hidden">
          <SparkleEffect isActive={showGraduation} />
          <DialogHeader className="space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.6 }}
              className="mx-auto text-5xl"
            >
              🎉
            </motion.div>
            <DialogTitle className="text-xl font-display text-center">
              Félicitations !
            </DialogTitle>
            <DialogDescription className="text-base text-center leading-relaxed px-2">
              Vos versets sont désormais ancrés dans votre cœur. Ils rejoignent votre trésor éternel pour l'entretien espacé.
            </DialogDescription>
          </DialogHeader>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-4"
          >
            <Button
              onClick={() => setShowGraduation(false)}
              className="w-full"
              style={{ background: 'linear-gradient(135deg, #065F46, #10B981)', color: '#fff' }}
            >
              Alhamdulillah 🤲
            </Button>
          </motion.div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
