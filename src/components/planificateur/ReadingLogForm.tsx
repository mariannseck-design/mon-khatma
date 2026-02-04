import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Search, ChevronDown, Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SURAHS, Surah, calculatePageFromPosition } from '@/lib/surahData';

interface ReadingLogFormProps {
  onLogReading: (data: {
    pages: number;
    surahName: string;
    surahNumber: number;
    ayahNumber: number;
  }) => Promise<void>;
  isDisabled?: boolean;
  todayPages?: number;
  lastSurah?: string | null;
  lastAyah?: number | null;
}

export function ReadingLogForm({ 
  onLogReading, 
  isDisabled = false,
  todayPages = 0,
  lastSurah,
  lastAyah,
}: ReadingLogFormProps) {
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [ayahNumber, setAyahNumber] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLogging, setIsLogging] = useState(false);

  // Filter surahs based on search
  const filteredSurahs = useMemo(() => {
    if (!searchQuery.trim()) return SURAHS;
    const query = searchQuery.toLowerCase();
    return SURAHS.filter(s => 
      s.name.toLowerCase().includes(query) ||
      s.arabicName.includes(searchQuery) ||
      s.number.toString() === searchQuery
    );
  }, [searchQuery]);

  // Calculate estimated page
  const estimatedPage = useMemo(() => {
    if (!selectedSurah) return 0;
    return calculatePageFromPosition(selectedSurah.number, ayahNumber);
  }, [selectedSurah, ayahNumber]);

  const handleSelectSurah = (surah: Surah) => {
    setSelectedSurah(surah);
    setAyahNumber(1);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleAyahChange = (value: string) => {
    const num = parseInt(value) || 1;
    if (selectedSurah) {
      setAyahNumber(Math.min(Math.max(1, num), selectedSurah.versesCount));
    }
  };

  const handleSubmit = async () => {
    if (!selectedSurah || ayahNumber < 1) return;
    
    setIsLogging(true);
    try {
      await onLogReading({
        pages: estimatedPage,
        surahName: selectedSurah.name,
        surahNumber: selectedSurah.number,
        ayahNumber,
      });
      // Reset form
      setSelectedSurah(null);
      setAyahNumber(1);
    } finally {
      setIsLogging(false);
    }
  };

  if (isDisabled) {
    return (
      <Card className="p-6 bg-gradient-mint border-none shadow-[0_8px_30px_-12px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-center gap-3">
          <span className="text-3xl">✨</span>
          <p className="text-primary-foreground font-semibold text-lg">
            Objectif atteint, Macha'Allah !
          </p>
          <span className="text-3xl">✨</span>
        </div>
        <p className="text-primary-foreground/80 text-base text-center mt-3">
          Qu'Allah <span className="honorific">(عز وجل)</span> accepte ta lecture
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
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground">
                Enregistrer ma Tilawah
              </h3>
              <p className="text-base text-muted-foreground">
                Avec l'aide d'Allah <span className="honorific">(عز وجل)</span>
              </p>
            </div>
          </div>

          {/* Last reading reminder */}
          {lastSurah && lastAyah && (
            <div className="bg-secondary/50 rounded-2xl p-4 mb-6">
              <p className="text-base text-muted-foreground">Dernière lecture :</p>
              <p className="font-display font-bold text-lg text-foreground">
                Sourate {lastSurah}, Verset {lastAyah}
              </p>
            </div>
          )}

          {/* Surah Selection */}
          <div className="space-y-4 mb-6">
            <Label className="text-lg font-semibold">Sourate</Label>
            <Popover open={isOpen} onOpenChange={setIsOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={isOpen}
                  className="w-full justify-between h-14 text-left font-normal text-base bg-background hover:bg-secondary/50 border-2"
                >
                  {selectedSurah ? (
                    <span className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                        {selectedSurah.number}
                      </span>
                      <span>
                        {selectedSurah.name}
                        <span className="text-muted-foreground ml-2 font-arabic">
                          {selectedSurah.arabicName}
                        </span>
                      </span>
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Sélectionner une sourate...</span>
                  )}
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-background border-2 z-50" align="start">
                <div className="p-3 border-b">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher par nom ou numéro..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 text-base"
                    />
                  </div>
                </div>
                <ScrollArea className="h-[300px]">
                  <div className="p-2">
                    {filteredSurahs.map((surah) => (
                      <button
                        key={surah.number}
                        onClick={() => handleSelectSurah(surah)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors hover:bg-secondary ${
                          selectedSurah?.number === surah.number ? 'bg-primary/10' : ''
                        }`}
                      >
                        <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                          {surah.number}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{surah.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {surah.versesCount} versets
                          </p>
                        </div>
                        <span className="text-lg font-arabic text-muted-foreground">
                          {surah.arabicName}
                        </span>
                        {selectedSurah?.number === surah.number && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </button>
                    ))}
                    {filteredSurahs.length === 0 && (
                      <p className="text-center text-muted-foreground py-6">
                        Aucune sourate trouvée
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </PopoverContent>
            </Popover>
          </div>

          {/* Ayah Number */}
          <AnimatePresence>
            {selectedSurah && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 mb-6"
              >
                <Label className="text-lg font-semibold">
                  Verset (Ayah) où tu t'es arrêtée
                </Label>
                <div className="flex items-center gap-4">
                  <Input
                    type="number"
                    min={1}
                    max={selectedSurah.versesCount}
                    value={ayahNumber}
                    onChange={(e) => handleAyahChange(e.target.value)}
                    className="text-center text-2xl font-bold h-16 w-28"
                  />
                  <span className="text-base text-muted-foreground">
                    sur {selectedSurah.versesCount} versets
                  </span>
                </div>

                {/* Page estimate */}
                <div className="bg-primary/5 rounded-2xl p-4">
                  <p className="text-base text-primary">
                    📖 Environ page <span className="font-bold text-lg">{estimatedPage}</span> sur 604
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={!selectedSurah || ayahNumber < 1 || isLogging}
            className="w-full h-16 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg shadow-[0_4px_15px_-5px_rgba(0,0,0,0.15)] hover-lift transition-all disabled:opacity-50 rounded-2xl"
          >
            <BookOpen className="h-5 w-5 mr-3" />
            Enregistrer ma lecture
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
