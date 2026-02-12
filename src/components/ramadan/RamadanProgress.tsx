import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';

interface RamadanProgressProps {
  completedCount: number;
  totalCount: number;
  progressPercent: number;
}

export default function RamadanProgress({ completedCount, totalCount, progressPercent }: RamadanProgressProps) {
  return (
    <Card className="pastel-card p-6 bg-gradient-to-br from-primary/10 via-background to-accent/10 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.08)]">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display text-lg">Ma Routine Baraka</h2>
        <motion.span
          key={completedCount}
          initial={{ scale: 1.3 }}
          animate={{ scale: 1 }}
          className="text-xl font-bold text-primary"
        >
          {progressPercent}%
        </motion.span>
      </div>
      <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
      <p className="text-sm text-muted-foreground mt-2 text-center">
        {completedCount}/{totalCount} actions accomplies
      </p>
    </Card>
  );
}
