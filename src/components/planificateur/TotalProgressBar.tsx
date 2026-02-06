import { motion } from 'framer-motion';
import { BookOpen, Star } from 'lucide-react';
import { Card } from '@/components/ui/card';

const TOTAL_QURAN_PAGES = 604;

interface TotalProgressBarProps {
  totalPagesRead: number;
}

export function TotalProgressBar({ totalPagesRead }: TotalProgressBarProps) {
  const percentage = Math.min(100, (totalPagesRead / TOTAL_QURAN_PAGES) * 100);
  const isComplete = totalPagesRead >= TOTAL_QURAN_PAGES;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className={`relative overflow-hidden border-none shadow-[0_8px_30px_-12px_rgba(0,0,0,0.1)] ${
        isComplete ? 'bg-gradient-to-r from-accent/60 to-accent/40' : 'bg-gradient-mint'
      }`}>
        <div className="p-6">
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
                  {isComplete ? 'Khatma complète!' : 'Progression globale'}
                </p>
                <p className="text-sm text-primary-foreground/70">
                  {TOTAL_QURAN_PAGES} pages
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
              ? "Félicitations ! Qu'Allah (عز وجل) accepte votre lecture et vous accorde Sa satisfaction."
              : "Cheminez vers la constance à votre rythme, avec l'aide d'Allah (عز وجل)"
            }
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
