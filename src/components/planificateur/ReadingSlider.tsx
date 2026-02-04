import { useState, useEffect } from 'react';
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

  // Calculate remaining pages
  const remainingPages = TOTAL_QURAN_PAGES - totalPagesRead;

  // Calculate days remaining at current rate
  const getDaysRemaining = () => {
    if (sliderValue <= 0) return null;
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

  if (isDisabled) {
    return (
      <Card className="p-6 bg-gradient-to-br from-ramadan-night to-ramadan-night-light border-none shadow-[0_8px_30px_-12px_rgba(0,0,0,0.3)]">
        <div className="flex items-center justify-center gap-3">
          <span className="text-2xl">✨</span>
          <p className="text-ramadan-gold font-medium">
            Objectif atteint, Macha'Allah !
          </p>
          <span className="text-2xl">✨</span>
        </div>
        <p className="text-ramadan-night-foreground/70 text-sm text-center mt-2">
          Qu'Allah <span className="text-ramadan-gold">(عز وجل)</span> accepte votre lecture
        </p>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="overflow-hidden border-none shadow-[0_8px_30px_-12px_rgba(0,0,0,0.2)]">
        {/* Header */}
        <div className="bg-gradient-to-br from-ramadan-night to-ramadan-night-light p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-ramadan-gold/20 flex items-center justify-center">
              <BookMarked className="h-5 w-5 text-ramadan-gold" />
            </div>
            <div>
              <h3 className="font-display text-lg text-ramadan-night-foreground">Enregistrer ma lecture</h3>
              {targetPages > 0 && (
                <p className="text-sm text-ramadan-night-foreground/60">
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
                <span className="text-7xl font-display font-bold text-ramadan-gold drop-shadow-[0_2px_10px_rgba(212,175,55,0.3)]">
                  {sliderValue}
                </span>
                <p className="text-ramadan-night-foreground/60 text-sm mt-1">
                  {sliderValue === 1 ? 'page' : 'pages'}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Custom Styled Slider */}
          <div className="px-2 mb-6">
            <Slider
              value={[sliderValue]}
              onValueChange={(value) => setSliderValue(value[0])}
              min={0}
              max={Math.min(100, remainingPages)}
              step={1}
              disabled={isLogging}
              className="ramadan-slider"
            />
            <div className="flex justify-between text-xs text-ramadan-night-foreground/50 mt-2">
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
                className={`flex-1 text-xs border-ramadan-gold/30 hover:bg-ramadan-gold/10 hover:border-ramadan-gold/50 transition-all ${
                  sliderValue === pages 
                    ? 'bg-ramadan-gold/20 border-ramadan-gold text-ramadan-gold' 
                    : 'text-ramadan-night-foreground/70'
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
                <p className="text-ramadan-gold-light text-sm italic">
                  À ce rythme, avec l'aide d'Allah <span className="text-ramadan-gold">(عز وجل)</span>, vous finirez dans{' '}
                  <span className="font-bold text-ramadan-gold">{daysRemaining} jour{daysRemaining > 1 ? 's' : ''}</span>
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={sliderValue <= 0 || isLogging}
            className="w-full h-14 bg-ramadan-gold hover:bg-ramadan-gold-light text-ramadan-gold-foreground font-semibold shadow-[0_4px_20px_-5px_rgba(212,175,55,0.4)] hover:shadow-[0_6px_25px_-5px_rgba(212,175,55,0.5)] transition-all disabled:opacity-50"
          >
            <Check className="h-5 w-5 mr-2" />
            Valider ma lecture
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
