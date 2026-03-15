import { motion } from 'framer-motion';
import { BookOpen, Star, RotateCcw, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getSurahByPage } from '@/lib/surahData';

const TOTAL_QURAN_PAGES = 604;

interface TotalProgressBarProps {
  totalPagesRead: number;
  onResetKhatma?: () => void;
  onShowCelebration?: () => void;
  targetPagesPerDay?: number;
  startDate?: string;
}

export function TotalProgressBar({ totalPagesRead, onResetKhatma, onShowCelebration, targetPagesPerDay, startDate }: TotalProgressBarProps) {
  const percentage = Math.min(100, (totalPagesRead / TOTAL_QURAN_PAGES) * 100);
  const isComplete = totalPagesRead >= TOTAL_QURAN_PAGES;
  const remainingPages = TOTAL_QURAN_PAGES - totalPagesRead;
  const effectivePagesPerDay = targetPagesPerDay || 5;

  const currentSurah = getSurahByPage(totalPagesRead);

  const formattedStartDate = startDate
    ? new Date(startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card
        className="relative overflow-hidden border-none"
        style={{
          background: 'linear-gradient(145deg, var(--p-card) 0%, rgba(6,95,70,0.08) 100%)',
          boxShadow: '0 4px 24px rgba(6,95,70,0.1), 0 2px 8px rgba(212,175,55,0.12)',
          border: '1px solid rgba(212,175,55,0.15)',
        }}
      >
        {/* Subtle decorative accent */}
        <div
          className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-[0.12]"
          style={{ background: 'radial-gradient(circle, var(--p-accent), transparent 70%)', transform: 'translate(30%, -30%)' }}
        />
        <div
          className="absolute bottom-0 left-0 w-28 h-28 rounded-full opacity-[0.08]"
          style={{ background: 'radial-gradient(circle, var(--p-primary), transparent 70%)', transform: 'translate(-30%, 30%)' }}
        />

        <div className="px-6 pt-6 pb-3 relative">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.22), rgba(212,175,55,0.10))' }}
              >
                {isComplete ? (
                  <Star className="h-5 w-5" style={{ color: 'var(--p-accent)' }} />
                ) : (
                  <BookOpen className="h-5 w-5" style={{ color: 'var(--p-accent)' }} />
                )}
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: 'var(--p-primary-deep)' }}>
                  {isComplete ? 'Khatma complète !' : 'Ma Khatma'}
                </p>
                {formattedStartDate && !isComplete && (
                  <p className="text-xs flex items-center gap-1" style={{ color: 'var(--p-text-65)' }}>
                    <Calendar className="h-3 w-3" style={{ color: 'var(--p-primary)' }} />
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
                className="rounded-xl px-3 py-1.5"
                style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.15), rgba(212,175,55,0.06))' }}
              >
                <span className="text-lg font-bold" style={{ color: 'var(--p-accent)' }}>
                  {percentage.toFixed(1)}%
                </span>
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
              className="rounded-xl py-2.5 px-4 text-center mb-3"
              style={{
                background: 'linear-gradient(135deg, rgba(6,95,70,0.07), rgba(6,95,70,0.03))',
                border: '1px solid rgba(212,175,55,0.06)',
              }}
            >
              <p className="text-lg font-bold" style={{ color: 'var(--p-primary-deep)' }}>
                Sourate {currentSurah.name}
              </p>
              <p className="text-xs font-medium" style={{ color: 'var(--p-text-65)' }}>
                Page {totalPagesRead} / {TOTAL_QURAN_PAGES}
              </p>
            </motion.div>
          )}

          {/* Subtitle */}
          <p className="text-xs text-center italic" style={{ color: 'var(--p-text-65)' }}>
            {isComplete 
              ? "Félicitations ! Qu'Allah (عز وجل) accepte votre lecture."
              : <>Qu'Allah <span className="honorific font-bold" style={{ fontSize: '1.1em' }}>(عز وجل)</span> facilite ta lecture</>
            }
          </p>

          {/* New Khatma Button */}
          {isComplete && onShowCelebration && (
            <Button
              onClick={onShowCelebration}
              className="w-full mt-3 rounded-xl font-medium border-none"
              style={{
                background: 'linear-gradient(90deg, var(--p-accent), hsl(43 85% 60%))',
                color: 'var(--p-primary-deep)',
              }}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Voir la Doua de fin de Khatma
            </Button>
          )}
        </div>

        {/* Progress bar at bottom */}
        <div className="h-2.5 rounded-b-lg" style={{ background: 'rgba(6,95,70,0.10)' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full rounded-r-full"
            style={{ background: 'linear-gradient(90deg, var(--p-primary), var(--p-accent))' }}
          />
        </div>
      </Card>
    </motion.div>
  );
}
