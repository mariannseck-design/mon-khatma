import { motion } from 'framer-motion';
import { History, Check, BookOpen } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { getSurahByPage } from '@/lib/surahData';

interface HistoryEntry {
  date: string;
  pages_read: number;
}

interface ReadingHistoryProps {
  entries: HistoryEntry[];
  targetPages?: number;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

function isToday(dateStr: string): boolean {
  return dateStr === new Date().toISOString().split('T')[0];
}

export function ReadingHistory({ entries, targetPages = 0 }: ReadingHistoryProps) {
  if (entries.length === 0) return null;

  // Compute cumulative pages to show surah at that point
  // We need cumulative from oldest to newest, but display newest first
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  let cumulative = 0;
  const withCumulative = sorted.map(e => {
    cumulative += e.pages_read;
    return { ...e, cumulativePage: Math.min(cumulative, 604) };
  });
  const display = [...withCumulative].reverse().slice(0, 15);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="p-5 border-none rounded-[2rem] bg-card shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <History className="h-4 w-4 text-primary" />
          <span className="font-semibold text-foreground text-sm">Historique de lecture</span>
        </div>

        <div className="space-y-1">
          {display.map((entry, i) => {
            const surah = getSurahByPage(entry.cumulativePage);
            const goalMet = targetPages > 0 && entry.pages_read >= targetPages;
            const today = isToday(entry.date);

            return (
              <div
                key={entry.date}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors ${
                  today ? 'bg-primary/10' : i % 2 === 0 ? 'bg-muted/50' : ''
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`text-xs font-medium w-16 shrink-0 ${today ? 'text-primary' : 'text-muted-foreground'}`}>
                    {today ? "Auj." : formatDate(entry.date)}
                  </span>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <BookOpen className="h-3 w-3 text-muted-foreground shrink-0" />
                    <span className="text-sm text-foreground truncate">
                      {surah?.name || ''}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-semibold text-foreground">
                    {entry.pages_read} p.
                  </span>
                  {goalMet && (
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </motion.div>
  );
}
