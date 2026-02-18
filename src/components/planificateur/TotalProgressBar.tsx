import { motion } from 'framer-motion';
import { BookOpen, Star, RotateCcw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getSurahByPage } from '@/lib/surahData';

const TOTAL_QURAN_PAGES = 604;

interface TotalProgressBarProps {
  totalPagesRead: number;
  onResetKhatma?: () => void;
  targetPagesPerDay?: number;
}

export function TotalProgressBar({ totalPagesRead, onResetKhatma, targetPagesPerDay }: TotalProgressBarProps) {
  const percentage = Math.min(100, (totalPagesRead / TOTAL_QURAN_PAGES) * 100);
  const isComplete = totalPagesRead >= TOTAL_QURAN_PAGES;
  const remainingPages = TOTAL_QURAN_PAGES - totalPagesRead;
  const effectivePagesPerDay = targetPagesPerDay || 5;
  const estimatedDays = Math.ceil(remainingPages / effectivePagesPerDay);

  // Get current surah based on pages read
  const currentSurah = getSurahByPage(totalPagesRead);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className={`relative overflow-hidden border-none shadow-[0_8px_30px_-12px_rgba(0,0,0,0.1)] ${
        isComplete ? 'bg-gradient-to-r from-accent/60 to-accent/40' : 'bg-gradient-mint'
      }`}>
        <div className="p-6">

          <div className="mb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-white/30 flex items-center justify-center">
                {isComplete ? (
                  <Star className="h-6 w-6 text-accent-foreground fill-accent" />
                ) : (
                  <BookOpen className="h-6 w-6 text-primary-foreground" />
                )}
              </div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-primary-foreground">
                  {isComplete ? 'Khatma complète!' : 'Progression globale'}
                </p>
                {!isComplete && (
                  <motion.span 
                    key={percentage}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-xl font-bold text-primary-foreground"
                  >
                    {percentage.toFixed(1)}%
                  </motion.span>
                )}
              </div>
            </div>
            {!isComplete && currentSurah && (
              <motion.p
                key={totalPagesRead}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="text-xl font-bold text-primary-foreground text-center"
              >
                Sourate {currentSurah.name} Page {totalPagesRead}
              </motion.p>
            )}
          </div>

          {/* Subtitle */}
          <p className="text-sm text-primary-foreground/80 mb-4 italic text-center">
            {isComplete 
              ? "Félicitations ! Qu'Allah (عز وجل) accepte votre lecture."
              : <>Continue ta Khatma avec l'aide d'Allah <span className="honorific">(عز وجل)</span></>
            }
          </p>

          {/* New Khatma Button */}
          {isComplete && onResetKhatma && (
            <Button
              onClick={onResetKhatma}
              className="w-full mb-4 rounded-xl bg-white/20 hover:bg-white/30 text-primary-foreground font-medium border-none"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Commencer une nouvelle Khatma
            </Button>
          )}

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
