import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

const TOTAL_QURAN_PAGES = 604;

interface ReadingSliderProps {
  onLogReading: (pages: number) => Promise<void>;
  isDisabled?: boolean;
  todayPages?: number;
  targetPages?: number;
  totalPagesRead?: number;
}

export function ReadingSlider({ 
  onLogReading, 
  isDisabled = false,
  todayPages = 0,
  targetPages = 0,
  totalPagesRead = 0
}: ReadingSliderProps) {
  const [sliderValue, setSliderValue] = useState(0);
  const [isLogging, setIsLogging] = useState(false);

  // Calculate remaining pages (never negative)
  const remainingPages = Math.max(0, TOTAL_QURAN_PAGES - totalPagesRead);
  const isKhatmaComplete = totalPagesRead >= TOTAL_QURAN_PAGES;

  const handleSubmit = async () => {
    if (sliderValue > 0 && sliderValue <= TOTAL_QURAN_PAGES) {
      setIsLogging(true);
      await onLogReading(sliderValue);
      setSliderValue(0);
      setIsLogging(false);
    }
  };

  if (isDisabled || isKhatmaComplete) {
    return (
      <Card className="p-6 bg-gradient-mint border-none rounded-[2rem]">
        <div className="flex items-center justify-center gap-3">
          <span className="text-2xl">✨</span>
          <p className="text-primary-foreground font-medium">
            {isKhatmaComplete ? 'Khatma terminée, Macha\'Allah !' : 'Objectif atteint, Macha\'Allah !'}
          </p>
          <span className="text-2xl">✨</span>
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="p-6 border-none rounded-[2rem] bg-card shadow-sm">
        {/* Header simple */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-muted-foreground text-sm">Enregistrer</span>
          {targetPages > 0 && (
            <span className="text-xs text-muted-foreground">
              {todayPages}/{targetPages} aujourd'hui
            </span>
          )}
        </div>

        {/* Slider minimaliste */}
        <div className="mb-6">
          <Slider
            value={[sliderValue]}
            onValueChange={(value) => setSliderValue(value[0])}
            min={0}
            max={Math.min(50, remainingPages)}
            step={1}
            disabled={isLogging}
            className="[&_[data-radix-slider-track]]:h-2 [&_[data-radix-slider-track]]:bg-muted [&_[data-radix-slider-range]]:bg-primary [&_[data-radix-slider-thumb]]:w-6 [&_[data-radix-slider-thumb]]:h-6 [&_[data-radix-slider-thumb]]:border-2 [&_[data-radix-slider-thumb]]:border-primary [&_[data-radix-slider-thumb]]:bg-background"
          />
        </div>

        {/* Valeur et bouton sur une ligne */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-foreground">{sliderValue}</span>
            <span className="text-muted-foreground text-sm">pages</span>
          </div>
          
          <Button
            onClick={handleSubmit}
            disabled={sliderValue <= 0 || isLogging}
            size="lg"
            className="rounded-full px-8 bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-40"
          >
            <Check className="h-5 w-5" />
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
