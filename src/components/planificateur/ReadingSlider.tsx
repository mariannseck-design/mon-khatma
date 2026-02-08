import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, ChevronDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SURAHS } from '@/lib/surahData';

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
  const [selectedSurah, setSelectedSurah] = useState<string>('');
  const [pageNumber, setPageNumber] = useState<string>('');
  const [isLogging, setIsLogging] = useState(false);

  const isKhatmaComplete = totalPagesRead >= TOTAL_QURAN_PAGES;

  const handleSubmit = async () => {
    const page = parseInt(pageNumber);
    if (page > 0 && page <= TOTAL_QURAN_PAGES) {
      // Calculate pages read based on current position vs previous progress
      const pagesRead = Math.max(1, page - totalPagesRead);
      setIsLogging(true);
      await onLogReading(pagesRead);
      setPageNumber('');
      setSelectedSurah('');
      setIsLogging(false);
    }
  };

  // Auto-fill page when surah is selected
  const handleSurahChange = (value: string) => {
    setSelectedSurah(value);
    const surah = SURAHS.find(s => s.number.toString() === value);
    if (surah) {
      setPageNumber(surah.startPage.toString());
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
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <span className="font-semibold text-foreground">Où je me suis arrêté(e)</span>
          {targetPages > 0 && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
              {todayPages}/{targetPages} aujourd'hui
            </span>
          )}
        </div>

        {/* Surah selector */}
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Sourate</label>
            <Select value={selectedSurah} onValueChange={handleSurahChange}>
              <SelectTrigger className="w-full h-12 rounded-xl border-muted">
                <SelectValue placeholder="Choisir une sourate..." />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {SURAHS.map((surah) => (
                  <SelectItem key={surah.number} value={surah.number.toString()}>
                    <span className="flex items-center gap-2">
                      <span className="text-muted-foreground w-8">{surah.number}.</span>
                      <span>{surah.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Page number */}
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Page</label>
            <Input
              type="number"
              inputMode="numeric"
              min={1}
              max={604}
              value={pageNumber}
              onChange={(e) => setPageNumber(e.target.value)}
              placeholder="Numéro de page (1-604)"
              className="h-12 rounded-xl border-muted text-center text-lg font-medium"
            />
          </div>
        </div>

        {/* Submit button */}
        <Button
          onClick={handleSubmit}
          disabled={!pageNumber || parseInt(pageNumber) < 1 || parseInt(pageNumber) > 604 || isLogging}
          className="w-full h-12 mt-5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium disabled:opacity-40"
        >
          <Check className="h-5 w-5 mr-2" />
          Enregistrer
        </Button>
      </Card>
    </motion.div>
  );
}
