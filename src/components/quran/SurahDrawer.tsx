import { useState } from 'react';
import { Search } from 'lucide-react';
import { SURAHS } from '@/lib/surahData';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SurahDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectPage: (page: number) => void;
  currentPage: number;
}

export default function SurahDrawer({ open, onOpenChange, onSelectPage, currentPage }: SurahDrawerProps) {
  const [search, setSearch] = useState('');

  const filtered = SURAHS.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.number.toString().includes(search)
  );

  const currentSurah = [...SURAHS].reverse().find(s => s.startPage <= currentPage);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[70vh] rounded-t-3xl">
        <SheetHeader className="pb-2">
          <SheetTitle className="font-display text-xl">Sourates</SheetTitle>
        </SheetHeader>

        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une sourate..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl"
          />
        </div>

        <ScrollArea className="h-[calc(70vh-140px)]">
          <div className="space-y-1 pr-3">
            {filtered.map((surah) => (
              <button
                key={surah.number}
                onClick={() => {
                  onSelectPage(surah.startPage);
                  onOpenChange(false);
                  setSearch('');
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                  currentSurah?.number === surah.number
                    ? 'bg-primary/10 text-primary'
                    : 'hover:bg-muted'
                }`}
              >
                <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                  {surah.number}
                </span>
                <span className="font-medium text-foreground flex-1">{surah.name}</span>
                <span className="text-xs text-muted-foreground">p. {surah.startPage}</span>
              </button>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
