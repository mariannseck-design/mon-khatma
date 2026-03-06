import { useState } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Zap, ThumbsUp, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SURAHS } from '@/lib/surahData';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface MemorizedVerse {
  id: string;
  surah_number: number;
  verse_start: number;
  verse_end: number;
  next_review_date: string;
  sm2_interval: number;
  sm2_ease_factor: number;
  sm2_repetitions: number;
}

interface MurajaTourProps {
  dueVerses: MemorizedVerse[];
  onSessionComplete: () => void;
  onCycleComplete: () => void;
}

// SM-2 algorithm
function computeSM2(
  quality: number, // 0-5 scale: hard=2, good=4, easy=5
  repetitions: number,
  easeFactor: number,
  interval: number
) {
  let newEF = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (newEF < 1.3) newEF = 1.3;

  let newInterval: number;
  let newReps: number;

  if (quality < 3) {
    // Reset
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

const RATINGS = [
  { key: 'hard', label: 'Difficile', quality: 2, icon: Zap, color: '#9b1c31' },
  { key: 'good', label: 'Bien', quality: 4, icon: ThumbsUp, color: '#d4af37' },
  { key: 'easy', label: 'Facile', quality: 5, icon: Crown, color: '#0d7377' },
] as const;

export default function MurajaTour({ dueVerses, onSessionComplete, onCycleComplete }: MurajaTourProps) {
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  if (dueVerses.length === 0) {
    return (
      <div
        className="rounded-2xl p-6 text-center"
        style={{
          background: 'linear-gradient(135deg, rgba(13,115,119,0.15), rgba(20,145,155,0.08))',
          border: '1px solid rgba(212,175,55,0.2)',
        }}
      >
        <RotateCcw className="h-8 w-8 mx-auto mb-3" style={{ color: '#d4af37' }} />
        <p className="text-muted-foreground text-sm">
          Aucun verset à réviser aujourd'hui.
        </p>
        <p className="text-muted-foreground text-xs mt-1">
          Reviens demain in shaa Allah !
        </p>
      </div>
    );
  }

  const current = dueVerses[currentIndex];
  const surahName = SURAHS.find(s => s.number === current?.surah_number)?.name || `Sourate ${current?.surah_number}`;
  const allDone = currentIndex >= dueVerses.length;

  const handleRating = async (quality: number, ratingKey: string) => {
    if (!user || !current || isProcessing) return;
    setIsProcessing(true);

    try {
      const { interval, easeFactor, repetitions } = computeSM2(
        quality,
        current.sm2_repetitions,
        current.sm2_ease_factor,
        current.sm2_interval
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
        .eq('id', current.id);

      // Log session
      await supabase.from('muraja_sessions').insert({
        user_id: user.id,
        session_type: 'tour',
        difficulty_rating: ratingKey,
        verses_reviewed: [{ surah: current.surah_number, start: current.verse_start, end: current.verse_end }],
        completed_at: new Date().toISOString(),
      });

      const newCompleted = completed + 1;
      setCompleted(newCompleted);

      if (newCompleted >= dueVerses.length) {
        // Check if this completes a 6-day cycle
        const { data: recentSessions } = await supabase
          .from('muraja_sessions')
          .select('created_at')
          .eq('user_id', user.id)
          .eq('session_type', 'tour')
          .gte('created_at', new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString())
          .order('created_at', { ascending: false });

        const uniqueDays = new Set(
          (recentSessions || []).map(s => s.created_at.split('T')[0])
        );
        // Add today
        uniqueDays.add(new Date().toISOString().split('T')[0]);

        if (uniqueDays.size >= 6) {
          // Increment tours completed
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

          onCycleComplete();
        } else {
          onSessionComplete();
        }
      } else {
        setCurrentIndex(currentIndex + 1);
      }
    } catch (err) {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsProcessing(false);
    }
  };

  if (allDone) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3
          className="text-lg font-semibold"
          style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#d4af37' }}
        >
          Le Tour — Cycle SM-2
        </h3>
        <span className="text-xs text-muted-foreground">
          {completed}/{dueVerses.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(13,115,119,0.2)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, #d4af37, #e8c84a)' }}
          animate={{ width: `${(completed / dueVerses.length) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {current && (
        <motion.div
          key={current.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-2xl p-6"
          style={{
            background: 'linear-gradient(135deg, rgba(13,115,119,0.2), rgba(20,145,155,0.1))',
            border: '1px solid rgba(212,175,55,0.25)',
          }}
        >
          <div className="text-center space-y-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Récite de mémoire</p>
            <p className="text-xl font-bold" style={{ color: '#0d7377' }}>
              {surahName}
            </p>
            <p className="text-sm" style={{ color: '#d4af37' }}>
              Versets {current.verse_start} → {current.verse_end}
            </p>
            <p className="text-xs text-muted-foreground">
              Intervalle actuel : {current.sm2_interval} jour{current.sm2_interval > 1 ? 's' : ''}
            </p>

            <div className="flex gap-3 justify-center pt-2">
              {RATINGS.map(({ key, label, quality, icon: Icon, color }) => (
                <Button
                  key={key}
                  onClick={() => handleRating(quality, key)}
                  disabled={isProcessing}
                  className="flex-1 gap-1.5 text-sm font-medium"
                  style={{
                    background: `${color}20`,
                    color,
                    border: `1px solid ${color}40`,
                  }}
                  variant="ghost"
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
