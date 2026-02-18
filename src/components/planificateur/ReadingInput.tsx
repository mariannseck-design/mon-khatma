import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookMarked, Plus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ReadingInputProps {
  onLogReading: (pages: number) => Promise<void>;
  isDisabled?: boolean;
  todayPages?: number;
  targetPages?: number;
}

export function ReadingInput({ 
  onLogReading, 
  isDisabled = false,
  todayPages = 0,
  targetPages = 0
}: ReadingInputProps) {
  const [pagesInput, setPagesInput] = useState('');
  const [isLogging, setIsLogging] = useState(false);

  const handleSubmit = async () => {
    const pages = parseInt(pagesInput);
    if (pages > 0 && pages <= 604) {
      setIsLogging(true);
      await onLogReading(pages);
      setPagesInput('');
      setIsLogging(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isDisabled && !isLogging) {
      handleSubmit();
    }
  };

  const handleInputChange = (value: string) => {
    // Only allow positive integers
    if (value === '' || /^\d+$/.test(value)) {
      const numValue = parseInt(value);
      // Max 604 pages (whole Quran)
      if (value === '' || (numValue >= 1 && numValue <= 604)) {
        setPagesInput(value);
      }
    }
  };

  if (isDisabled) {
    return (
      <Card className="p-6 bg-gradient-mint border-none shadow-[0_8px_30px_-12px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-center gap-3">
          <span className="text-2xl">✨</span>
          <p className="text-primary-foreground font-medium">
            Objectif atteint, Macha'Allah !
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
      <Card className="pastel-card p-6 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.08)]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <BookMarked className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-display text-lg">Enregistrer ma lecture</h3>
            {targetPages > 0 && (
              <p className="text-sm text-muted-foreground">
                {todayPages}/{targetPages} pages aujourd'hui
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Input
              type="text"
              inputMode="numeric"
              value={pagesInput}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nombre de pages lues..."
              className="h-14 text-lg font-semibold text-center pr-16 border-2 focus:border-primary/50 transition-colors"
              onFocus={(e) => e.target.select()}
              disabled={isLogging}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
              pages
            </span>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={!pagesInput || isLogging}
            className="h-14 px-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_4px_15px_-5px_rgba(0,0,0,0.15)] hover-lift"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>

        {/* Quick buttons for common amounts */}
        <div className="flex gap-2 mt-4">
          {[1, 2, 5, 10, 20].map((pages) => (
            <Button
              key={pages}
              variant="outline"
              size="sm"
              onClick={() => setPagesInput(pages.toString())}
              className="flex-1 text-xs hover:bg-primary/5 hover:border-primary/30"
            >
              {pages}
            </Button>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}
