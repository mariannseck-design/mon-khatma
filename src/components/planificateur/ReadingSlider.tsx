import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, BookOpen } from 'lucide-react';
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
  onLogReading: (absolutePage: number) => Promise<void>;
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
      setIsLogging(true);
      await onLogReading(page);
      setPageNumber('');
      setSelectedSurah('');
      setIsLogging(false);
    }
  };

  const handleSurahChange = (value: string) => {
    setSelectedSurah(value);
    const surah = SURAHS.find(s => s.number.toString() === value);
    if (surah) {
      setPageNumber(surah.startPage.toString());
    }
  };

  if (isKhatmaComplete) {
    return null;
  }

  const goalMet = targetPages > 0 && todayPages >= targetPages;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      {/* Congrats banner */}
      {goalMet && (
        <div
          className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl"
          style={{ background: 'rgba(6,95,70,0.08)' }}
        >
          <span className="text-xs font-medium" style={{ color: 'var(--p-primary)' }}>
            ✨ Objectif atteint, Macha'Allah !
          </span>
        </div>
      )}

      <Card className="p-5 border-none rounded-[2rem] bg-card shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" style={{ color: 'var(--p-primary)' }} />
            <span className="text-sm font-semibold text-foreground">Marque-page</span>
          </div>
          {targetPages > 0 && (
            <span
              className="text-[11px] font-medium px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(6,95,70,0.08)', color: 'var(--p-primary)' }}
            >
              {todayPages}/{targetPages} auj.
            </span>
          )}
        </div>

        <div className="space-y-3">
          {/* Surah selector */}
          <Select value={selectedSurah} onValueChange={handleSurahChange}>
            <SelectTrigger className="w-full h-11 rounded-xl border-border/50 bg-muted/30 text-sm">
              <SelectValue placeholder="Sourate..." />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {SURAHS.map((surah) => (
                <SelectItem key={surah.number} value={surah.number.toString()}>
                  <span className="flex items-center gap-2">
                    <span className="text-muted-foreground w-7 text-xs">{surah.number}.</span>
                    <span className="text-sm">{surah.name}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Page number */}
          <Input
            type="number"
            inputMode="numeric"
            min={1}
            max={604}
            value={pageNumber}
            onChange={(e) => setPageNumber(e.target.value)}
            placeholder="Page (1-604)"
            className="h-11 rounded-xl border-border/50 bg-muted/30 text-center text-sm font-medium"
          />
        </div>

        {/* Submit button */}
        <Button
          onClick={handleSubmit}
          disabled={!pageNumber || parseInt(pageNumber) < 1 || parseInt(pageNumber) > 604 || isLogging}
          className="w-full h-11 mt-4 rounded-xl text-sm font-medium disabled:opacity-30 border-none"
          style={{
            background: 'var(--p-primary)',
            color: 'var(--p-on-dark)',
          }}
        >
          <Check className="h-4 w-4 mr-1.5" />
          Enregistrer
        </Button>
      </Card>
    </motion.div>
  );
}
