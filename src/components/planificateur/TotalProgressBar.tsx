import { motion } from 'framer-motion';
import { BookOpen, Star, Moon } from 'lucide-react';
import { Card } from '@/components/ui/card';

const TOTAL_QURAN_PAGES = 604;

// Calculate days until Ramadan 2026 (approximately February 17, 2026)
const getDaysUntilRamadan = () => {
  const today = new Date();
  const ramadan2026 = new Date(2026, 1, 17); // February 17, 2026
  const diffTime = ramadan2026.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

interface TotalProgressBarProps {
  totalPagesRead: number;
}

export function TotalProgressBar({ totalPagesRead }: TotalProgressBarProps) {
  const percentage = Math.min(100, (totalPagesRead / TOTAL_QURAN_PAGES) * 100);
  const isComplete = totalPagesRead >= TOTAL_QURAN_PAGES;
  const daysUntilRamadan = getDaysUntilRamadan();
  const remainingPages = TOTAL_QURAN_PAGES - totalPagesRead;
  const pagesPerDayForRamadan = daysUntilRamadan > 0 ? Math.ceil(remainingPages / daysUntilRamadan) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className={`relative overflow-hidden border-none shadow-[0_8px_30px_-12px_rgba(0,0,0,0.1)] ${
        isComplete ? 'bg-gradient-to-r from-accent/60 to-accent/40' : 'bg-gradient-mint'
      }`}>
        <div className="p-6">
          {/* Ramadan Countdown - Static Label */}
          {daysUntilRamadan > 0 && !isComplete && (
            <div className="flex items-center justify-center gap-2 mb-4 bg-white/20 rounded-xl py-2 px-4">
              <Moon className="h-4 w-4 text-primary-foreground" />
              <span className="text-sm font-medium text-primary-foreground">
                {daysUntilRamadan} jours avant Ramadan
              </span>
            </div>
          )}

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/30 flex items-center justify-center">
                {isComplete ? (
                  <Star className="h-6 w-6 text-accent-foreground fill-accent" />
                ) : (
                  <BookOpen className="h-6 w-6 text-primary-foreground" />
                )}
              </div>
              <div>
                <p className="font-medium text-primary-foreground">
                  {isComplete ? 'Khatma complète!' : `Progression globale • ${totalPagesRead} pages`}
                </p>
              </div>
            </div>
            <div className="text-right">
              <motion.p 
                key={percentage}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-3xl font-bold text-primary-foreground"
              >
                {percentage.toFixed(1)}%
              </motion.p>
            </div>
          </div>

          {/* Subtitle */}
          <p className="text-sm text-primary-foreground/80 mb-4 italic text-center">
            {isComplete 
              ? "Félicitations ! Qu'Allah (عز وجل) accepte votre lecture."
              : <>Continue ta Khatma avec l'aide d'Allah <span className="honorific">(عز وجل)</span></>
            }
          </p>

          {/* Smart Calculator - Integrated Display */}
          {!isComplete && (
            <div className="bg-white/15 rounded-2xl p-4 mb-4">
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div className="text-center">
                  <p className="text-xs text-primary-foreground/70 mb-1">Pages par jour</p>
                  <div className="bg-white/20 rounded-xl py-3 px-4">
                    <span className="text-2xl font-bold text-primary-foreground">{pagesPerDayForRamadan || 5}</span>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-xs text-primary-foreground/70 mb-1">Objectif de jours</p>
                  <div className="bg-white/20 rounded-xl py-3 px-4">
                    <span className="text-2xl font-bold text-primary-foreground">{daysUntilRamadan || Math.ceil(remainingPages / 5)}</span>
                  </div>
                </div>
              </div>
              {daysUntilRamadan > 0 && remainingPages > 0 && (
                <p className="text-sm text-primary-foreground font-medium text-center bg-white/10 rounded-xl py-2 px-3">
                  ✨ Vous finirez en <span className="font-bold">{daysUntilRamadan} jours</span>
                </p>
              )}
            </div>
          )}

          {/* Motivational Quote */}
          <p className="text-xs text-primary-foreground/70 text-center italic">
            "La meilleure des actions est celle qui est régulière, même si elle est modeste."
          </p>
        </div>

        {/* Progress bar at bottom */}
        <div className="h-3 bg-white/20 relative overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`h-full ${
              isComplete 
                ? 'bg-gradient-to-r from-accent to-accent/80' 
                : 'bg-white/60'
            }`}
          />
          {/* Milestone markers */}
          <div className="absolute inset-0 flex justify-between px-0">
            {[25, 50, 75].map((milestone) => (
              <div
                key={milestone}
                className="w-px bg-white/30 h-full"
                style={{ marginLeft: `${milestone}%` }}
              />
            ))}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
