import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookMarked, Check } from 'lucide-react';
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

  // Calculate days remaining at current rate
  const getDaysRemaining = () => {
    if (sliderValue <= 0 || remainingPages <= 0) return null;
    const days = Math.ceil(remainingPages / sliderValue);
    return days;
  };

  const handleSubmit = async () => {
    if (sliderValue > 0 && sliderValue <= TOTAL_QURAN_PAGES) {
      setIsLogging(true);
      await onLogReading(sliderValue);
      setSliderValue(0);
      setIsLogging(false);
    }
  };

  const daysRemaining = getDaysRemaining();

  if (isDisabled || isKhatmaComplete) {
    return (
      <Card className="p-6 bg-gradient-mint border-none shadow-[0_8px_30px_-12px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-center gap-3">
          <span className="text-2xl">✨</span>
          <p className="text-primary-foreground font-medium">
            {isKhatmaComplete ? 'Khatma terminée, Macha\'Allah !' : 'Objectif atteint, Macha\'Allah !'}
          </p>
          <span className="text-2xl">✨</span>
        </div>
        <p className="text-primary-foreground/70 text-sm text-center mt-2">
          Qu'Allah <span className="honorific">(عز وجل)</span> accepte votre lecture
        </p>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="pastel-card overflow-hidden border-none shadow-[0_8px_30px_-12px_rgba(0,0,0,0.08)]">
        {/* Header */}
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <BookMarked className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-display text-lg text-foreground">Enregistrer ma lecture</h3>
              {targetPages > 0 && (
                <p className="text-sm text-muted-foreground">
                  {todayPages}/{targetPages} pages aujourd'hui
                </p>
              )}
            </div>
          </div>

          {/* Large Page Display */}
          <div className="text-center mb-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={sliderValue}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                className="inline-block"
              >
                <span className="text-7xl font-display font-bold text-primary">
                  {sliderValue}
                </span>
                <p className="text-muted-foreground text-sm mt-1">
                  {sliderValue === 1 ? 'page' : 'pages'}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Slider */}
          <div className="px-2 mb-6">
            <Slider
              value={[sliderValue]}
              onValueChange={(value) => setSliderValue(value[0])}
              min={0}
              max={Math.min(100, remainingPages)}
              step={1}
              disabled={isLogging}
              className="[&_[data-radix-slider-track]]:h-3 [&_[data-radix-slider-track]]:bg-secondary [&_[data-radix-slider-range]]:bg-primary [&_[data-radix-slider-thumb]]:w-7 [&_[data-radix-slider-thumb]]:h-7 [&_[data-radix-slider-thumb]]:border-4 [&_[data-radix-slider-thumb]]:border-primary [&_[data-radix-slider-thumb]]:bg-background [&_[data-radix-slider-thumb]]:shadow-lg"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>0</span>
              <span>{Math.min(100, remainingPages)} pages</span>
            </div>
          </div>

          {/* Quick Select Buttons */}
          <div className="flex gap-2 mb-6">
            {[1, 2, 5, 10, 20].map((pages) => (
              <Button
                key={pages}
                variant="outline"
                size="sm"
                onClick={() => setSliderValue(pages)}
                className={`flex-1 text-xs transition-all ${
                  sliderValue === pages 
                    ? 'bg-primary/20 border-primary text-primary' 
                    : 'hover:bg-primary/5 hover:border-primary/30'
                }`}
              >
                {pages}
              </Button>
            ))}
          </div>

          {/* Prediction Text */}
          <AnimatePresence>
            {sliderValue > 0 && daysRemaining !== null && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-center mb-4"
              >
                <p className="text-primary text-sm italic bg-primary/5 rounded-lg py-3 px-4">
                  À ce rythme, avec l'aide d'Allah <span className="honorific">(عز وجل)</span>, vous finirez dans{' '}
                  <span className="font-bold">{daysRemaining} jour{daysRemaining > 1 ? 's' : ''}</span>
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={sliderValue <= 0 || isLogging}
            className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-[0_4px_15px_-5px_rgba(0,0,0,0.15)] hover-lift transition-all disabled:opacity-50"
          >
            <Check className="h-5 w-5 mr-2" />
            Valider ma lecture
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
