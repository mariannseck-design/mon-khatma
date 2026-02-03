import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface GoalCardProps {
  goalType: string;
  targetValue: number;
  todayPages: number;
  goalProgress: number;
}

export function GoalCard({ goalType, targetValue, todayPages, goalProgress }: GoalCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="relative overflow-hidden bg-gradient-mint border-none shadow-[0_8px_30px_-12px_rgba(0,0,0,0.1)] hover:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.15)] transition-shadow duration-300">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/30 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <p className="font-medium text-primary-foreground">Objectif actif</p>
                <p className="text-sm text-primary-foreground/70">
                  {goalType === 'pages_per_day' 
                    ? `${targetValue} pages/jour`
                    : `Terminer en ${targetValue} jours`}
                </p>
              </div>
            </div>
          </div>

          {/* Subtitle with honorific */}
          <p className="text-sm text-primary-foreground/80 mb-4 italic">
            Cheminez vers la constance à votre rythme, avec l'aide d'Allah <span className="honorific">(عز وجل)</span>
          </p>

          {/* Progress text */}
          <p className="text-sm text-primary-foreground/70 mb-2 text-center">
            {todayPages}/{targetValue} pages aujourd'hui
          </p>
        </div>

        {/* Thin progress bar at bottom */}
        <div className="px-0">
          <Progress 
            value={goalProgress} 
            className="h-1.5 rounded-none bg-white/20"
          />
        </div>
      </Card>
    </motion.div>
  );
}
