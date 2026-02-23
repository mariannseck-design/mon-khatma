import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarCheck, Sparkles, Heart, BookOpen } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface RamadanWeeklyReportProps {
  firstName: string;
  dailyPages: number;
}

function getPreviousWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  // Calculate Monday of the previous week
  const diffToMonday = day === 0 ? 6 : day - 1; // days since last Monday
  const thisMonday = new Date(d);
  thisMonday.setDate(d.getDate() - diffToMonday);
  // Go back one more week to get previous Monday
  const prevMonday = new Date(thisMonday);
  prevMonday.setDate(thisMonday.getDate() - 7);
  return prevMonday.toISOString().split('T')[0];
}

function getWeekDates(weekStart: string): { start: string; end: string } {
  const start = new Date(weekStart);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
}

export default function RamadanWeeklyReport({ firstName, dailyPages }: RamadanWeeklyReportProps) {
  const { user } = useAuth();
  const [response, setResponse] = useState<boolean | null>(null);
  const [alreadyAnswered, setAlreadyAnswered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [weeklyStats, setWeeklyStats] = useState<{ totalPages: number; daysRead: number } | null>(null);

  const isMondayOrTuesday = [1, 2].includes(new Date().getDay());
  const weekStart = getPreviousWeekStart(new Date());

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      // Fetch existing report
      const { data: reportData } = await supabase
        .from('ramadan_weekly_reports')
        .select('*')
        .eq('user_id', user.id)
        .eq('week_start', weekStart)
        .maybeSingle();

      if (reportData) {
        setResponse(reportData.goal_met);
        setAlreadyAnswered(true);
      }

      // Fetch actual reading data from quran_progress for this week
      const { start, end } = getWeekDates(weekStart);
      const { data: progressData } = await supabase
        .from('quran_progress')
        .select('pages_read, date')
        .eq('user_id', user.id)
        .gte('date', start)
        .lte('date', end);

      if (progressData) {
        const totalPages = progressData.reduce((sum, d) => sum + (d.pages_read || 0), 0);
        const daysRead = progressData.filter(d => (d.pages_read || 0) > 0).length;
        setWeeklyStats({ totalPages, daysRead });
      }

      setLoading(false);
    };

    fetchData();
  }, [user, weekStart]);

  const weeklyGoal = dailyPages * 7;
  const goalMet = weeklyStats ? weeklyStats.totalPages >= weeklyGoal : false;

  const handleResponse = async (met: boolean) => {
    if (!user) return;
    setResponse(met);

    const { error } = await supabase
      .from('ramadan_weekly_reports')
      .upsert(
        { user_id: user.id, week_start: weekStart, goal_met: met },
        { onConflict: 'user_id,week_start' }
      );

    if (error) {
      toast.error("Erreur lors de l'enregistrement");
      console.error(error);
    } else {
      setAlreadyAnswered(true);
    }
  };

  if (loading) return null;
  if (!isMondayOrTuesday && alreadyAnswered) return null;
  if (!isMondayOrTuesday) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="pastel-card p-6 bg-gradient-to-br from-accent/15 via-primary/10 to-secondary/10 border-2 border-accent/20">
        <div className="text-center mb-5">
          <div className="w-14 h-14 rounded-2xl bg-accent/20 flex items-center justify-center mx-auto mb-3">
            <CalendarCheck className="h-7 w-7 text-accent-foreground" />
          </div>
          <h3 className="font-display text-lg text-foreground mb-2">
            Rapport de la semaine dernière 📊
          </h3>
        </div>

        {/* Real stats from Tilawah */}
        {weeklyStats && (
          <div className="flex items-center justify-center gap-6 mb-5">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{weeklyStats.totalPages}</p>
              <p className="text-xs text-muted-foreground">pages lues</p>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{weeklyStats.daysRead}/7</p>
              <p className="text-xs text-muted-foreground">jours actifs</p>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{weeklyGoal}</p>
              <p className="text-xs text-muted-foreground">objectif</p>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {response === null ? (
            <motion.div key="question" exit={{ opacity: 0, y: -10 }} className="space-y-4">
              <p className="text-sm text-foreground text-center leading-relaxed">
                Assalamou aleykoum <strong>{firstName}</strong> ! La semaine dernière, tu as lu{' '}
                <strong>{weeklyStats?.totalPages ?? 0} page{(weeklyStats?.totalPages ?? 0) > 1 ? 's' : ''}</strong> sur{' '}
                <strong>{weeklyGoal}</strong> prévues.
                {goalMet
                  ? ' Masha Allah, objectif atteint ! 🌟'
                  : ' Continue tes efforts, chaque lettre compte !'}
              </p>

              <div className="flex gap-3">
                <Button
                  onClick={() => handleResponse(true)}
                  className="flex-1 bg-primary text-primary-foreground"
                >
                  <Sparkles className="h-4 w-4 mr-1" />
                  Alhamdoulillah !
                </Button>
                <Button
                  onClick={() => handleResponse(false)}
                  variant="outline"
                  className="flex-1"
                >
                  <Heart className="h-4 w-4 mr-1" />
                  J'essaie encore
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="feedback"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-2"
            >
              {response ? (
                <p className="text-foreground leading-relaxed">
                  <Sparkles className="h-6 w-6 text-primary inline-block mr-1 mb-1" />
                  Alhamdoulillah ! Quelle bénédiction. Qu'Allah{' '}
                  <span className="honorific font-bold" style={{ fontSize: '1.1em' }}>(عز وجل)</span>{' '}
                  renforce ta constance pour le reste du Ramadan ! 🤲
                </p>
              ) : (
                <p className="text-foreground leading-relaxed">
                  <Heart className="h-6 w-6 text-accent-foreground inline-block mr-1 mb-1" />
                  Qu'Allah <span className="honorific font-bold" style={{ fontSize: '1.1em' }}>(عز وجل)</span>{' '}
                  t'accorde facilité et baraka dans ton temps. Chaque lettre lue est une récompense,
                  continue ! 💪
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
