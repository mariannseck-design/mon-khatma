import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Calendar, BookOpen } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const TOTAL_QURAN_PAGES = 604;

interface PlannerCalculatorProps {
  onGoalChange?: (pagesPerDay: number, totalDays: number) => void;
  initialPagesPerDay?: number;
  initialDays?: number;
}

export function PlannerCalculator({ 
  onGoalChange, 
  initialPagesPerDay = 5, 
  initialDays 
}: PlannerCalculatorProps) {
  const [pagesPerDay, setPagesPerDay] = useState<string>(
    initialPagesPerDay ? initialPagesPerDay.toString() : ''
  );
  const [targetDays, setTargetDays] = useState<string>(
    initialDays ? initialDays.toString() : ''
  );
  const [lastEdited, setLastEdited] = useState<'pages' | 'days'>('pages');

  // Calculate the other value when one changes
  useEffect(() => {
    if (lastEdited === 'pages' && pagesPerDay) {
      const pages = parseFloat(pagesPerDay);
      if (pages > 0) {
        const days = Math.ceil(TOTAL_QURAN_PAGES / pages);
        setTargetDays(days.toString());
        onGoalChange?.(pages, days);
      }
    }
  }, [pagesPerDay, lastEdited, onGoalChange]);

  useEffect(() => {
    if (lastEdited === 'days' && targetDays) {
      const days = parseInt(targetDays);
      if (days > 0) {
        const pages = TOTAL_QURAN_PAGES / days;
        // Show decimal if not a whole number
        setPagesPerDay(pages % 1 === 0 ? pages.toString() : pages.toFixed(1));
        onGoalChange?.(pages, days);
      }
    }
  }, [targetDays, lastEdited, onGoalChange]);

  const handlePagesChange = (value: string) => {
    // Allow empty, numbers, and decimals
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setPagesPerDay(value);
      setLastEdited('pages');
    }
  };

  const handleDaysChange = (value: string) => {
    // Allow empty and integers only for days
    if (value === '' || /^\d+$/.test(value)) {
      const numValue = parseInt(value);
      // Limit to 1-1000 days
      if (value === '' || (numValue >= 1 && numValue <= 1000)) {
        setTargetDays(value);
        setLastEdited('days');
      }
    }
  };

  const parsedPages = parseFloat(pagesPerDay) || 0;
  const parsedDays = parseInt(targetDays) || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="pastel-card p-6 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.08)]">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Calculator className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-display text-lg">Planificateur intelligent</h3>
            <p className="text-sm text-muted-foreground">
              {TOTAL_QURAN_PAGES} pages au total, avec l'aide d'Allah <span className="honorific">(عز وجل)</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pages per day input */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="pages-per-day" className="text-sm font-medium">
                Pages par jour
              </Label>
            </div>
            <Input
              id="pages-per-day"
              type="text"
              inputMode="decimal"
              value={pagesPerDay}
              onChange={(e) => handlePagesChange(e.target.value)}
              placeholder="Ex: 20"
              className="text-lg font-semibold text-center h-14 border-2 focus:border-primary/50 transition-colors"
            />
            {parsedDays > 0 && lastEdited === 'pages' && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-primary font-medium text-center bg-primary/5 rounded-lg py-2 px-3"
              >
                ✨ Vous finirez en <span className="font-bold">{parsedDays} jours</span>
              </motion.p>
            )}
          </div>

          {/* Target days input */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="target-days" className="text-sm font-medium">
                Objectif de jours
              </Label>
            </div>
            <Input
              id="target-days"
              type="text"
              inputMode="numeric"
              value={targetDays}
              onChange={(e) => handleDaysChange(e.target.value)}
              placeholder="Ex: 30"
              className="text-lg font-semibold text-center h-14 border-2 focus:border-primary/50 transition-colors"
            />
            {parsedPages > 0 && lastEdited === 'days' && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-primary font-medium text-center bg-primary/5 rounded-lg py-2 px-3"
              >
                📖 Vous devez lire <span className="font-bold">{pagesPerDay} pages/jour</span>
              </motion.p>
            )}
          </div>
        </div>

        {/* Motivational footer */}
        <p className="text-xs text-muted-foreground text-center mt-6 italic">
          "La meilleure des actions est celle qui est régulière, même si elle est modeste."
        </p>
      </Card>
    </motion.div>
  );
}
