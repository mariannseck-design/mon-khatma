import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { RefreshCw, RotateCcw, BookOpen, CalendarDays, PartyPopper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { SURAHS } from '@/lib/surahData';
import { graduateLiaisonBlocks } from '@/lib/hifzUtils';
import { SparkleEffect } from '@/components/planificateur/SparkleEffect';
import MurajaCountdown from '@/components/muraja/MurajaCountdown';
import MurajaChecklist from '@/components/muraja/MurajaChecklist';
import MurajaCelebration from '@/components/muraja/MurajaCelebration';
import MurajaMethodModal from '@/components/muraja/MurajaMethodModal';
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
      // Auto-graduate liaison blocks that have completed 30 days
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
      setAllVerses((data as MemorizedVerse[]) || []);
      setLoading(false);
    };
    fetchVerses();
  }, [user, refreshKey]);

  // Rabt: blocks with liaison_status = 'liaison' (daily mandatory review)
  const rabtVerses = useMemo(() => {
    return allVerses.filter(v => v.liaison_status === 'liaison');
  }, [allVerses]);

  // Tour: blocks with liaison_status = 'tour' AND due today or earlier
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

  const totalBlocks = rabtVerses.length + tourVerses.length;
  const checkedCount = checkedIds.filter(
    id => rabtVerses.some(v => v.id === id) || tourVerses.some(v => v.id === id)
  ).length;

  const { totalVersesCount, surahSummary } = useMemo(() => {
    const total = allVerses.reduce((sum, v) => sum + (v.verse_end - v.verse_start + 1), 0);
    const map = new Map<number, { name: string; versesCount: number; nextReview: string; status: string }>();
    for (const v of allVerses) {
      const existing = map.get(v.surah_number);
      const count = v.verse_end - v.verse_start + 1;
      if (existing) {
        existing.versesCount += count;
        if (v.next_review_date < existing.nextReview) existing.nextReview = v.next_review_date;
      } else {
        const surahName = SURAHS.find(s => s.number === v.surah_number)?.name || `Sourate ${v.surah_number}`;
        map.set(v.surah_number, { name: surahName, versesCount: count, nextReview: v.next_review_date, status: v.liaison_status || 'tour' });
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

  // Compute remaining liaison days for rabt items
  const getLiaisonRemaining = (verse: MemorizedVerse) => {
    if (!verse.liaison_start_date) return null;
    const start = new Date(verse.liaison_start_date + 'T00:00:00');
    const now = new Date();
    const daysPassed = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, 30 - daysPassed);
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
    <AppLayout title="Muraja'a" hideNav>
      <div className="max-w-md mx-auto px-4 py-6 space-y-6" style={{ backgroundColor: 'var(--p-bg)', minHeight: '100vh' }}>
        {/* Header */}
        <div className="text-center space-y-1">
          <div
            className="w-12 h-12 rounded-xl mx-auto mb-2 flex items-center justify-center"
            style={{
              background: 'var(--p-card-active)',
              border: '1px solid var(--p-primary)',
            }}
          >
            <RefreshCw className="h-6 w-6" style={{ color: 'var(--p-primary)' }} />
          </div>
          <h1
            className="text-xl font-bold tracking-[0.08em] uppercase"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", color: 'var(--p-primary)' }}
          >
            Muraja'a
          </h1>
          <p className="text-xs font-medium" style={{ color: 'var(--p-text-75)' }}>
            Consolide ta mémorisation — Nouveau cycle à minuit
          </p>
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
            <RotateCcw className="h-10 w-10 mx-auto mb-4" style={{ color: 'var(--p-accent)' }} />
            <p className="text-base font-medium leading-relaxed" style={{ color: 'var(--p-on-dark)' }}>
              Tu n'as pas encore de versets mémorisés.
            </p>
            <p className="text-sm font-medium mt-2" style={{ color: 'var(--p-on-dark-muted)' }}>
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
                   <span className="font-bold" style={{ color: 'var(--p-primary)' }}>
                    Progression du jour
                  </span>
                  <span className="font-bold" style={{ color: 'var(--p-accent)' }}>
                    {checkedCount >= totalBlocks
                      ? 'Bravo, tu as tout révisé !'
                      : checkedCount === 0
                        ? "C'est parti !"
                        : `Plus que ${totalBlocks - checkedCount} étape${totalBlocks - checkedCount > 1 ? 's' : ''} !`}
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--p-track)' }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: 'var(--p-gradient-fill)' }}
                    animate={{ width: `${totalBlocks > 0 ? (checkedCount / totalBlocks) * 100 : 0}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            )}

            {/* Section Ar-Rabt */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                 <h2
                   className="text-base font-bold"
                   style={{ fontFamily: "'Playfair Display', Georgia, serif", color: 'var(--p-text)' }}
                 >
                   Ar-Rabt — Liaison du jour
                 </h2>
                 <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: 'var(--p-card-active)', color: 'var(--p-primary)' }}>
                   {rabtVerses.length}
                 </span>
                 <MurajaMethodModal defaultTab="rabt" />
              </div>
               <p className="text-[11px] font-medium -mt-2" style={{ color: 'var(--p-text-65)' }}>
                 Récitation quotidienne
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
                   className="text-base font-bold"
                   style={{ fontFamily: "'Playfair Display', Georgia, serif", color: 'var(--p-text)' }}
                 >
                   L'Entretien Continu (Le Tour)
                 </h2>
                 <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: 'var(--p-card-active)', color: 'var(--p-primary)' }}>
                   {tourVerses.length}
                 </span>
                 <MurajaMethodModal defaultTab="sm2" />
              </div>
               <p className="text-[11px] font-medium -mt-1" style={{ color: 'var(--p-text-65)' }}>
                 Anciens acquis — auto-évaluation après chaque bloc
               </p>
               <div
                 className="rounded-lg px-3 py-2 text-[11px] leading-relaxed"
                 style={{ background: 'var(--p-card)', border: '1px solid var(--p-border)', color: 'var(--p-text-65)' }}
               >
                 Ton programme de révision intelligent (<strong style={{ color: 'var(--p-primary)' }}>Algorithme SM-2</strong>). Il s'adapte naturellement à ta mémoire pour te proposer de réviser chaque verset au moment parfait, préservant ainsi ton trésor de l'oubli.
               </div>
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
                background: 'var(--p-card)',
                border: '1px solid var(--p-border)',
                boxShadow: 'var(--p-card-shadow)',
              }}
            >
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" style={{ color: 'var(--p-accent)' }} />
                <h3
                   className="text-sm font-bold"
                   style={{ fontFamily: "'Playfair Display', Georgia, serif", color: 'var(--p-primary)' }}
                 >
                  Mon trésor — {totalVersesCount} verset{totalVersesCount > 1 ? 's' : ''}
                </h3>
              </div>
              <div className="space-y-1.5">
                {surahSummary.map((s) => (
                  <div
                    key={s.name}
                    className="flex items-center justify-between px-3 py-2 rounded-lg"
                    style={{ background: 'var(--p-card-active)' }}
                  >
                     <span className="text-xs font-bold" style={{ color: 'var(--p-primary)' }}>
                       {s.name}
                     </span>
                     <div className="flex items-center gap-2 text-[10px] font-medium" style={{ color: 'var(--p-text-65)' }}>
                      <span>{s.versesCount} v.</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px]" style={{
                        background: s.status === 'liaison' ? 'rgba(74,222,128,0.15)' : 'var(--p-card)',
                        color: s.status === 'liaison' ? '#4ade80' : 'var(--p-text-65)',
                      }}>
                        {s.status === 'liaison' ? 'Liaison' : 'Tour'}
                      </span>
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
                style={{ color: 'var(--p-primary)' }}
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
