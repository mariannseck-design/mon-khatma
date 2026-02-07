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

const TOTAL_QURAN_PAGES = 604;

// Liste des 114 sourates avec leur numéro de page de début
const SURAHS = [
  { number: 1, name: "Al-Fatiha", startPage: 1 },
  { number: 2, name: "Al-Baqara", startPage: 2 },
  { number: 3, name: "Al-Imran", startPage: 50 },
  { number: 4, name: "An-Nisa", startPage: 77 },
  { number: 5, name: "Al-Ma'ida", startPage: 106 },
  { number: 6, name: "Al-An'am", startPage: 128 },
  { number: 7, name: "Al-A'raf", startPage: 151 },
  { number: 8, name: "Al-Anfal", startPage: 177 },
  { number: 9, name: "At-Tawba", startPage: 187 },
  { number: 10, name: "Yunus", startPage: 208 },
  { number: 11, name: "Hud", startPage: 221 },
  { number: 12, name: "Yusuf", startPage: 235 },
  { number: 13, name: "Ar-Ra'd", startPage: 249 },
  { number: 14, name: "Ibrahim", startPage: 255 },
  { number: 15, name: "Al-Hijr", startPage: 262 },
  { number: 16, name: "An-Nahl", startPage: 267 },
  { number: 17, name: "Al-Isra", startPage: 282 },
  { number: 18, name: "Al-Kahf", startPage: 293 },
  { number: 19, name: "Maryam", startPage: 305 },
  { number: 20, name: "Ta-Ha", startPage: 312 },
  { number: 21, name: "Al-Anbiya", startPage: 322 },
  { number: 22, name: "Al-Hajj", startPage: 332 },
  { number: 23, name: "Al-Mu'minun", startPage: 342 },
  { number: 24, name: "An-Nur", startPage: 350 },
  { number: 25, name: "Al-Furqan", startPage: 359 },
  { number: 26, name: "Ash-Shu'ara", startPage: 367 },
  { number: 27, name: "An-Naml", startPage: 377 },
  { number: 28, name: "Al-Qasas", startPage: 385 },
  { number: 29, name: "Al-Ankabut", startPage: 396 },
  { number: 30, name: "Ar-Rum", startPage: 404 },
  { number: 31, name: "Luqman", startPage: 411 },
  { number: 32, name: "As-Sajda", startPage: 415 },
  { number: 33, name: "Al-Ahzab", startPage: 418 },
  { number: 34, name: "Saba", startPage: 428 },
  { number: 35, name: "Fatir", startPage: 434 },
  { number: 36, name: "Ya-Sin", startPage: 440 },
  { number: 37, name: "As-Saffat", startPage: 446 },
  { number: 38, name: "Sad", startPage: 453 },
  { number: 39, name: "Az-Zumar", startPage: 458 },
  { number: 40, name: "Ghafir", startPage: 467 },
  { number: 41, name: "Fussilat", startPage: 477 },
  { number: 42, name: "Ash-Shura", startPage: 483 },
  { number: 43, name: "Az-Zukhruf", startPage: 489 },
  { number: 44, name: "Ad-Dukhan", startPage: 496 },
  { number: 45, name: "Al-Jathiya", startPage: 499 },
  { number: 46, name: "Al-Ahqaf", startPage: 502 },
  { number: 47, name: "Muhammad", startPage: 507 },
  { number: 48, name: "Al-Fath", startPage: 511 },
  { number: 49, name: "Al-Hujurat", startPage: 515 },
  { number: 50, name: "Qaf", startPage: 518 },
  { number: 51, name: "Adh-Dhariyat", startPage: 520 },
  { number: 52, name: "At-Tur", startPage: 523 },
  { number: 53, name: "An-Najm", startPage: 526 },
  { number: 54, name: "Al-Qamar", startPage: 528 },
  { number: 55, name: "Ar-Rahman", startPage: 531 },
  { number: 56, name: "Al-Waqi'a", startPage: 534 },
  { number: 57, name: "Al-Hadid", startPage: 537 },
  { number: 58, name: "Al-Mujadila", startPage: 542 },
  { number: 59, name: "Al-Hashr", startPage: 545 },
  { number: 60, name: "Al-Mumtahina", startPage: 549 },
  { number: 61, name: "As-Saff", startPage: 551 },
  { number: 62, name: "Al-Jumu'a", startPage: 553 },
  { number: 63, name: "Al-Munafiqun", startPage: 554 },
  { number: 64, name: "At-Taghabun", startPage: 556 },
  { number: 65, name: "At-Talaq", startPage: 558 },
  { number: 66, name: "At-Tahrim", startPage: 560 },
  { number: 67, name: "Al-Mulk", startPage: 562 },
  { number: 68, name: "Al-Qalam", startPage: 564 },
  { number: 69, name: "Al-Haqqa", startPage: 566 },
  { number: 70, name: "Al-Ma'arij", startPage: 568 },
  { number: 71, name: "Nuh", startPage: 570 },
  { number: 72, name: "Al-Jinn", startPage: 572 },
  { number: 73, name: "Al-Muzzammil", startPage: 574 },
  { number: 74, name: "Al-Muddaththir", startPage: 575 },
  { number: 75, name: "Al-Qiyama", startPage: 577 },
  { number: 76, name: "Al-Insan", startPage: 578 },
  { number: 77, name: "Al-Mursalat", startPage: 580 },
  { number: 78, name: "An-Naba", startPage: 582 },
  { number: 79, name: "An-Nazi'at", startPage: 583 },
  { number: 80, name: "Abasa", startPage: 585 },
  { number: 81, name: "At-Takwir", startPage: 586 },
  { number: 82, name: "Al-Infitar", startPage: 587 },
  { number: 83, name: "Al-Mutaffifin", startPage: 587 },
  { number: 84, name: "Al-Inshiqaq", startPage: 589 },
  { number: 85, name: "Al-Buruj", startPage: 590 },
  { number: 86, name: "At-Tariq", startPage: 591 },
  { number: 87, name: "Al-A'la", startPage: 591 },
  { number: 88, name: "Al-Ghashiya", startPage: 592 },
  { number: 89, name: "Al-Fajr", startPage: 593 },
  { number: 90, name: "Al-Balad", startPage: 594 },
  { number: 91, name: "Ash-Shams", startPage: 595 },
  { number: 92, name: "Al-Layl", startPage: 595 },
  { number: 93, name: "Ad-Duha", startPage: 596 },
  { number: 94, name: "Ash-Sharh", startPage: 596 },
  { number: 95, name: "At-Tin", startPage: 597 },
  { number: 96, name: "Al-Alaq", startPage: 597 },
  { number: 97, name: "Al-Qadr", startPage: 598 },
  { number: 98, name: "Al-Bayyina", startPage: 598 },
  { number: 99, name: "Az-Zalzala", startPage: 599 },
  { number: 100, name: "Al-Adiyat", startPage: 599 },
  { number: 101, name: "Al-Qari'a", startPage: 600 },
  { number: 102, name: "At-Takathur", startPage: 600 },
  { number: 103, name: "Al-Asr", startPage: 601 },
  { number: 104, name: "Al-Humaza", startPage: 601 },
  { number: 105, name: "Al-Fil", startPage: 601 },
  { number: 106, name: "Quraysh", startPage: 602 },
  { number: 107, name: "Al-Ma'un", startPage: 602 },
  { number: 108, name: "Al-Kawthar", startPage: 602 },
  { number: 109, name: "Al-Kafirun", startPage: 603 },
  { number: 110, name: "An-Nasr", startPage: 603 },
  { number: 111, name: "Al-Masad", startPage: 603 },
  { number: 112, name: "Al-Ikhlas", startPage: 604 },
  { number: 113, name: "Al-Falaq", startPage: 604 },
  { number: 114, name: "An-Nas", startPage: 604 },
];

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
