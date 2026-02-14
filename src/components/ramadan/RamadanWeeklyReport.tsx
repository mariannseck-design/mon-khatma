import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarCheck, Sparkles, Heart } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface RamadanWeeklyReportProps {
  firstName: string;
  dailyPages: number;
}

function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  const sunday = new Date(d.setDate(diff));
  return sunday.toISOString().split('T')[0];
}

export default function RamadanWeeklyReport({ firstName, dailyPages }: RamadanWeeklyReportProps) {
  const { user } = useAuth();
  const [response, setResponse] = useState<boolean | null>(null);
  const [alreadyAnswered, setAlreadyAnswered] = useState(false);
  const [loading, setLoading] = useState(true);

  const isSunday = new Date().getDay() === 0;
  const weekStart = getWeekStart(new Date());

  useEffect(() => {
    if (!user) return;
    const fetchReport = async () => {
      const { data } = await supabase
        .from('ramadan_weekly_reports')
        .select('*')
        .eq('user_id', user.id)
        .eq('week_start', weekStart)
        .maybeSingle();

      if (data) {
        setResponse(data.goal_met);
        setAlreadyAnswered(true);
      }
      setLoading(false);
    };
    fetchReport();
  }, [user, weekStart]);

  const handleResponse = async (goalMet: boolean) => {
    if (!user) return;
    setResponse(goalMet);

    const { error } = await supabase
      .from('ramadan_weekly_reports')
      .upsert(
        { user_id: user.id, week_start: weekStart, goal_met: goalMet },
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

  // Show the report card on Sunday or if there's an unanswered report
  if (!isSunday && alreadyAnswered) return null;
  if (!isSunday && !alreadyAnswered) return null;

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
            Rapport Hebdomadaire 📊
          </h3>
        </div>

        <AnimatePresence mode="wait">
          {response === null ? (
            <motion.div key="question" exit={{ opacity: 0, y: -10 }} className="space-y-4">
              <p className="text-sm text-foreground text-center leading-relaxed">
                Assalamou aleykoum <strong>{firstName}</strong> ! Comment s'est passée ta lecture cette
                semaine ? As-tu maintenu ton rythme de <strong>{dailyPages} page{dailyPages > 1 ? 's' : ''}</strong> par
                jour ?
              </p>

              <div className="flex gap-3">
                <Button
                  onClick={() => handleResponse(true)}
                  className="flex-1 bg-primary text-primary-foreground"
                >
                  <Sparkles className="h-4 w-4 mr-1" />
                  Oui, Alhamdoulillah !
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
