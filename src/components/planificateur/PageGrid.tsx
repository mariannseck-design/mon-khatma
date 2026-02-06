import { motion } from 'framer-motion';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

const TOTAL_QURAN_PAGES = 604;
const PAGES_PER_JUZ = Math.ceil(604 / 30); // ~20 pages per juz

interface PageGridProps {
  pagesRead: number;
}

export function PageGrid({ pagesRead }: PageGridProps) {
  const [showAll, setShowAll] = useState(false);
  
  // Group by Juz (30 parts)
  const juzData = Array.from({ length: 30 }, (_, i) => {
    const juzNumber = i + 1;
    const startPage = i * PAGES_PER_JUZ + 1;
    const endPage = Math.min((i + 1) * PAGES_PER_JUZ, TOTAL_QURAN_PAGES);
    const pagesInJuz = endPage - startPage + 1;
    const pagesReadInJuz = Math.min(
      Math.max(0, pagesRead - startPage + 1),
      pagesInJuz
    );
    const isComplete = pagesReadInJuz >= pagesInJuz;
    const isInProgress = pagesReadInJuz > 0 && !isComplete;
    const percentage = (pagesReadInJuz / pagesInJuz) * 100;
    
    return {
      juzNumber,
      startPage,
      endPage,
      pagesInJuz,
      pagesReadInJuz,
      isComplete,
      isInProgress,
      percentage,
    };
  });

  const displayedJuz = showAll ? juzData : juzData.slice(0, 6);

  return (
    <Card className="pastel-card p-5 border-none shadow-khatma">
      <h3 className="font-display text-xl font-bold text-foreground mb-4">
        📚 Progression par Juz
      </h3>
      
      <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 sm:gap-3">
        {displayedJuz.map((juz) => (
          <motion.div
            key={juz.juzNumber}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: juz.juzNumber * 0.02 }}
            className={`
              relative aspect-square rounded-xl flex flex-col items-center justify-center
              text-sm font-semibold transition-all duration-300
              ${juz.isComplete 
                ? 'bg-gradient-to-br from-sage via-primary to-gold text-white shadow-md' 
                : juz.isInProgress 
                  ? 'bg-gradient-to-br from-cream to-sage/30 text-foreground border-2 border-sage/50' 
                  : 'bg-cream/50 text-muted-foreground border border-border/50'
              }
            `}
          >
            <span className="text-base font-bold">{juz.juzNumber}</span>
            {juz.isInProgress && (
              <span className="text-[10px] text-muted-foreground">
                {Math.round(juz.percentage)}%
              </span>
            )}
            {juz.isComplete && (
              <span className="text-xs">✓</span>
            )}
          </motion.div>
        ))}
      </div>

      {!showAll && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAll(true)}
          className="w-full mt-4 text-muted-foreground hover:text-foreground"
        >
          <ChevronDown className="h-4 w-4 mr-2" />
          Voir tous les Juz
        </Button>
      )}

      {showAll && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAll(false)}
          className="w-full mt-4 text-muted-foreground hover:text-foreground"
        >
          <ChevronUp className="h-4 w-4 mr-2" />
          Réduire
        </Button>
      )}
    </Card>
  );
}
