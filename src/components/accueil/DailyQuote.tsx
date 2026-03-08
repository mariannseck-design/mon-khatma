import { motion } from 'framer-motion';
import { Sparkles, PenLine } from 'lucide-react';
import { getTodayQuote } from '@/lib/dailyQuotes';
import { useMemo } from 'react';

function renderWithHonorifics(text: string) {
  const parts = text.split(/(\(عز وجل\)|\(عليهم السلام\)|\(عليه السلام\)|\(ﷺ\))/g);
  return parts.map((part, i) => {
    if (/^\(عز وجل\)$|^\(عليهم السلام\)$|^\(عليه السلام\)$|^\(ﷺ\)$/.test(part)) {
      return (
        <span key={i} style={{ fontFamily: "'Amiri', serif", fontWeight: 700, fontSize: '1.1em' }}>
          {part}
        </span>
      );
    }
    return part;
  });
}

export default function DailyQuote() {
  const quote = useMemo(() => getTodayQuote(), []);
  const Icon = quote.type === 'doua' ? Sparkles : PenLine;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="flex flex-col items-center text-center px-4 py-3.5"
    >
      <Icon className="mb-2" size={16} style={{ color: 'var(--p-text-55)' }} />
      <p className="text-sm italic leading-relaxed" style={{ color: 'var(--p-text-65)' }}>
        {renderWithHonorifics(quote.text)}
      </p>
    </motion.div>
  );
}
