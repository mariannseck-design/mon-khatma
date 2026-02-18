import { motion } from 'framer-motion';
import { BookOpen, Star, RotateCcw, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getSurahByPage } from '@/lib/surahData';

const TOTAL_QURAN_PAGES = 604;

interface TotalProgressBarProps {
  totalPagesRead: number;
  onResetKhatma?: () => void;
  targetPagesPerDay?: number;
  startDate?: string;
}

export function TotalProgressBar({ totalPagesRead, onResetKhatma, targetPagesPerDay, startDate }: TotalProgressBarProps) {
  const percentage = Math.min(100, (totalPagesRead / TOTAL_QURAN_PAGES) * 100);
  const isComplete = totalPagesRead >= TOTAL_QURAN_PAGES;
  const remainingPages = TOTAL_QURAN_PAGES - totalPagesRead;
  const effectivePagesPerDay = targetPagesPerDay || 5;
  const estimatedDays = Math.ceil(remainingPages / effectivePagesPerDay);

  // Get current surah based on pages read
  const currentSurah = getSurahByPage(totalPagesRead);

  // Format start date
  const formattedStartDate = startDate
    ? new Date(startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className={`relative overflow-hidden border-none shadow-[0_8px_30px_-12px_rgba(0,0,0,0.1)] ${
        isComplete ? 'bg-gradient-to-r from-accent/60 to-accent/40' : 'bg-gradient-mint'
      }`}>
        {/* Top section with icon + percentage */}
        <div className="px-6 pt-6 pb-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white/25 backdrop-blur-sm flex items-center justify-center">
                {isComplete ? (
                  <Star className="h-5 w-5 text-accent-foreground fill-accent" />
                ) : (
                  <BookOpen className="h-5 w-5 text-primary-foreground" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-primary-foreground/80">
                  {isComplete ? 'Khatma complète !' : 'Ma Khatma'}
                </p>
                {formattedStartDate && !isComplete && (
                  <p className="text-xs text-primary-foreground/60 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Depuis le {formattedStartDate}
                  </p>
                )}
              </div>
            </div>
            {!isComplete && (
              <motion.div
                key={percentage}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white/20 backdrop-blur-sm rounded-xl px-3 py-1.5"
              >
                <span className="text-lg font-bold text-primary-foreground">{percentage.toFixed(1)}%</span>
              </motion.div>
            )}
          </div>

          {/* Current position */}
          {!isComplete && currentSurah && (
            <motion.div
              key={totalPagesRead}
              initial={{ scale: 1.05, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="bg-white/15 backdrop-blur-sm rounded-xl py-2.5 px-4 text-center mb-3"
            >
              <p className="text-lg font-bold text-primary-foreground">
                Sourate {currentSurah.name}
              </p>
              <p className="text-xs text-primary-foreground/70">
                Page {totalPagesRead} / {TOTAL_QURAN_PAGES}
              </p>
            </motion.div>
          )}

          {/* Subtitle */}
          <p className="text-xs text-primary-foreground/70 text-center italic">
            {isComplete 
              ? "Félicitations ! Qu'Allah (عز وجل) accepte votre lecture."
              : <>Continue ta Khatma avec l'aide d'Allah <span className="honorific">(عز وجل)</span></>
            }
          </p>

          {/* New Khatma Button */}
          {isComplete && onResetKhatma && (
            <Button
              onClick={onResetKhatma}
              className="w-full mt-3 rounded-xl bg-white/20 hover:bg-white/30 text-primary-foreground font-medium border-none"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Commencer une nouvelle Khatma
            </Button>
          )}
        </div>

        {/* Progress bar at bottom */}
        <div className="h-2.5 bg-white/20 relative overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`h-full rounded-r-full ${
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
