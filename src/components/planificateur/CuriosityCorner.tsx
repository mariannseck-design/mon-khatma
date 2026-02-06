import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, Calendar, ChevronDown, ChevronUp, Target } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const TOTAL_QURAN_PAGES = 604;

interface CuriosityCornerProps {
  pagesRead: number;
  onCreateGoal?: (type: 'pages_per_day' | 'duration_days', value: number) => void;
}

export function CuriosityCorner({ pagesRead, onCreateGoal }: CuriosityCornerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [goalType, setGoalType] = useState<'pages_per_day' | 'duration_days'>('pages_per_day');
  const [goalValue, setGoalValue] = useState(5);

  const remainingPages = Math.max(0, TOTAL_QURAN_PAGES - pagesRead);
  
  // Calculate estimates
  const daysToComplete = goalType === 'pages_per_day' 
    ? Math.ceil(remainingPages / goalValue)
    : goalValue;
  const pagesPerDay = goalType === 'pages_per_day'
    ? goalValue
    : Math.ceil(remainingPages / goalValue);
  
  // Ramadan countdown (approximate)
  const now = new Date();
  const ramadan2026 = new Date(2026, 1, 18); // Feb 18, 2026 (approximate)
  const daysToRamadan = Math.ceil((ramadan2026.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const pagesPerDayForRamadan = daysToRamadan > 0 ? Math.ceil(remainingPages / daysToRamadan) : 0;

  return (
    <Card className="pastel-card border-none shadow-khatma overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-5 flex items-center justify-between text-left hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center">
            <Calculator className="h-5 w-5 text-gold-foreground" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-foreground">
              🎯 Coin Curiosité
            </h3>
            <p className="text-sm text-muted-foreground">
              Calculateurs et objectifs
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        )}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-5 pt-0 space-y-6">
              {/* Ramadan Countdown */}
              {daysToRamadan > 0 && daysToRamadan <= 120 && (
                <div className="bg-gradient-to-r from-gold/10 to-cream rounded-2xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="h-5 w-5 text-gold-foreground" />
                    <span className="font-semibold text-foreground">Objectif Ramadan</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-bold text-foreground">{daysToRamadan}</span> jours avant Ramadan
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Pour finir à temps: <span className="font-bold text-primary">{pagesPerDayForRamadan}</span> pages/jour
                  </p>
                </div>
              )}

              {/* Goal Calculator */}
              <Tabs value={goalType} onValueChange={(v) => setGoalType(v as typeof goalType)}>
                <TabsList className="w-full h-12">
                  <TabsTrigger value="pages_per_day" className="flex-1 text-sm">
                    Pages/jour
                  </TabsTrigger>
                  <TabsTrigger value="duration_days" className="flex-1 text-sm">
                    Durée (jours)
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="pages_per_day" className="space-y-4 mt-4">
                  <div className="flex items-center gap-4">
                    <Input
                      type="number"
                      min={1}
                      max={TOTAL_QURAN_PAGES}
                      value={goalValue}
                      onChange={(e) => setGoalValue(Math.max(1, parseInt(e.target.value) || 1))}
                      className="text-center text-xl font-bold h-14 w-24"
                    />
                    <span className="text-muted-foreground">pages/jour</span>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-3">
                    <p className="text-sm text-muted-foreground">
                      ≈ <span className="font-bold text-foreground">{daysToComplete}</span> jours pour terminer
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="duration_days" className="space-y-4 mt-4">
                  <div className="flex items-center gap-4">
                    <Input
                      type="number"
                      min={1}
                      max={1000}
                      value={goalValue}
                      onChange={(e) => setGoalValue(Math.max(1, parseInt(e.target.value) || 30))}
                      className="text-center text-xl font-bold h-14 w-24"
                    />
                    <span className="text-muted-foreground">jours</span>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-3">
                    <p className="text-sm text-muted-foreground">
                      ≈ <span className="font-bold text-foreground">{pagesPerDay.toFixed(1)}</span> pages/jour
                    </p>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Set Goal Button */}
              {onCreateGoal && (
                <Button
                  onClick={() => onCreateGoal(goalType, goalValue)}
                  className="w-full h-12 bg-gold hover:bg-gold/90 text-gold-foreground font-semibold rounded-xl"
                >
                  <Target className="h-4 w-4 mr-2" />
                  Définir cet objectif
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
