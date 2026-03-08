import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { RefreshCw, RotateCcw, BookOpen, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { SURAHS } from '@/lib/surahData';
import MurajaCountdown from '@/components/muraja/MurajaCountdown';
import MurajaChecklist from '@/components/muraja/MurajaChecklist';
import MurajaCelebration from '@/components/muraja/MurajaCelebration';
import { toast } from 'sonner';

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
  // Cleanup old keys
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

  useEffect(() => {
    if (!user) return;
    const fetchVerses = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('hifz_memorized_verses')
        .select('*')
        .eq('user_id', user.id)
        .order('memorized_at', { ascending: false });
      setAllVerses((data as MemorizedVerse[]) || []);
      setLoading(false);
    };
    fetchVerses();
  }, [user, refreshKey]);

  // Pipeline A: Ar-Rabt — memorized < 30 days ago
  const rabtVerses = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return allVerses.filter(v => new Date(v.memorized_at) >= thirtyDaysAgo);
  }, [allVerses]);

  // Pipeline B: Le Tour — older than 30 days AND next_review_date <= today
  const { tourVerses, isCapActive, totalDueCount } = useMemo(() => {
    const today = getTodayKey();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const allDue = allVerses.filter(
      v => new Date(v.memorized_at) < thirtyDaysAgo && v.next_review_date <= today
    );
    return {
      tourVerses: allDue.slice(0, MAX_TOUR_BLOCKS_PER_DAY),
      isCapActive: allDue.length > MAX_TOUR_BLOCKS_PER_DAY,
      totalDueCount: allDue.length,
    };
  }, [allVerses]);

  // Total blocks for today
  const totalBlocks = rabtVerses.length + tourVerses.length;
  const checkedCount = checkedIds.filter(
    id => rabtVerses.some(v => v.id === id) || tourVerses.some(v => v.id === id)
  ).length;

  // Mon trésor summary
  const { totalVersesCount, surahSummary } = useMemo(() => {
    const total = allVerses.reduce((sum, v) => sum + (v.verse_end - v.verse_start + 1), 0);
    const map = new Map<number, { name: string; versesCount: number; nextReview: string }>();
    for (const v of allVerses) {
      const existing = map.get(v.surah_number);
      const count = v.verse_end - v.verse_start + 1;
      if (existing) {
        existing.versesCount += count;
        if (v.next_review_date < existing.nextReview) existing.nextReview = v.next_review_date;
      } else {
        const surahName = SURAHS.find(s => s.number === v.surah_number)?.name || `Sourate ${v.surah_number}`;
        map.set(v.surah_number, { name: surahName, versesCount: count, nextReview: v.next_review_date });
      }
    }
    return {
      totalVersesCount: total,
      surahSummary: [...map.values()].sort((a, b) => a.nextReview.localeCompare(b.nextReview)),
    };
  }, [allVerses]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const handleRabtCheck = useCallback(async (id: string) => {
    if (!user) return;
    const newChecked = [...checkedIds, id];
    setCheckedIds(newChecked);
    saveChecked(newChecked);

    // Update last_reviewed_at
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

    // Check if all done
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
      // Check for cycle completion
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
    <AppLayout title="Muraja'a" hideNav>
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <div
            className="w-12 h-12 rounded-xl mx-auto mb-2 flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(212,175,55,0.2), rgba(212,175,55,0.08))',
              border: '1px solid rgba(212,175,55,0.25)',
            }}
          >
            <RefreshCw className="h-6 w-6" style={{ color: '#d4af37' }} />
          </div>
          <h1
            className="text-xl font-bold tracking-[0.08em] uppercase"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#d4af37' }}
          >
            Muraja'a
          </h1>
          <p className="text-muted-foreground text-xs">
            Consolide ta mémorisation — reset à minuit
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : allVerses.length === 0 ? (
          <div
            className="rounded-2xl p-8 text-center"
            style={{
              background: 'linear-gradient(135deg, #0d7377 0%, #14919b 50%, #0d7377 100%)',
              border: '2px solid rgba(212,175,55,0.3)',
              boxShadow: '0 8px 32px -8px rgba(13,115,119,0.4)',
            }}
          >
            <RotateCcw className="h-10 w-10 mx-auto mb-4" style={{ color: '#d4af37' }} />
            <p className="text-white/80 text-base leading-relaxed">
              Tu n'as pas encore de versets mémorisés.
            </p>
            <p className="text-white/50 text-sm mt-2">
              Commence par le module Hifz pour ancrer tes premiers versets !
            </p>
          </div>
        ) : (
          <>
            {/* Countdown */}
            <MurajaCountdown />

            {/* Progress bar */}
            {totalBlocks > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium" style={{ color: '#0d7377' }}>
                    Progression du jour
                  </span>
                  <span className="font-bold" style={{ color: '#d4af37' }}>
                    {checkedCount}/{totalBlocks} blocs
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(13,115,119,0.12)' }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: 'linear-gradient(90deg, #d4af37, #e8c84a)' }}
                    animate={{ width: `${totalBlocks > 0 ? (checkedCount / totalBlocks) * 100 : 0}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            )}

            {/* Section Ar-Rabt */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <h2
                  className="text-base font-semibold"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#d4af37' }}
                >
                  Ar-Rabt — Liaison du jour
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(212,175,55,0.15)', color: '#d4af37' }}>
                  {rabtVerses.length}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground -mt-1">
                Acquis récents (30 derniers jours) — révision quotidienne sans plafond
              </p>
              <MurajaChecklist
                items={rabtVerses}
                section="rabt"
                checkedIds={checkedIds}
                onCheck={handleRabtCheck}
              />
            </div>

            {/* Section Le Tour */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <h2
                  className="text-base font-semibold"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#d4af37' }}
                >
                  Le Tour — Révision SM-2
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(13,115,119,0.15)', color: '#0d7377' }}>
                  {tourVerses.length}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground -mt-1">
                Anciens acquis — auto-évaluation après chaque bloc
              </p>
              <MurajaChecklist
                items={tourVerses}
                section="tour"
                checkedIds={checkedIds}
                onCheck={handleTourCheck}
                onRate={handleTourRate}
                isCapActive={isCapActive}
                totalDue={totalDueCount}
              />
            </div>

            {/* Mon trésor */}
            <div
              className="rounded-2xl p-5 space-y-3"
              style={{
                background: 'linear-gradient(135deg, rgba(13,115,119,0.1), rgba(20,145,155,0.05))',
                border: '1px solid rgba(212,175,55,0.15)',
              }}
            >
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" style={{ color: '#d4af37' }} />
                <h3
                  className="text-sm font-semibold"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#d4af37' }}
                >
                  Mon trésor — {totalVersesCount} verset{totalVersesCount > 1 ? 's' : ''}
                </h3>
              </div>
              <div className="space-y-1.5">
                {surahSummary.map((s) => (
                  <div
                    key={s.name}
                    className="flex items-center justify-between px-3 py-2 rounded-lg"
                    style={{ background: 'rgba(13,115,119,0.06)' }}
                  >
                    <span className="text-xs font-medium" style={{ color: '#0d7377' }}>
                      {s.name}
                    </span>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span>{s.versesCount} v.</span>
                      <span className="flex items-center gap-0.5">
                        <CalendarDays className="h-2.5 w-2.5" />
                        {formatDate(s.nextReview)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Refresh */}
            <div className="text-center">
              <Button
                variant="ghost"
                onClick={refresh}
                className="text-xs gap-1.5"
                style={{ color: '#0d7377' }}
              >
                <RefreshCw className="h-3 w-3" />
                Actualiser
              </Button>
            </div>
          </>
        )}
      </div>

      <MurajaCelebration
        type={celebration || 'daily'}
        isOpen={celebration !== null}
        onClose={() => setCelebration(null)}
      />
    </AppLayout>
  );
}
