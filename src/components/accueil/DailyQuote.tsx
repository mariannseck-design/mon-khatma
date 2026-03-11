import { motion } from 'framer-motion';
import { getTodayQuote } from '@/lib/dailyQuotes';
import { useMemo } from 'react';

function renderWithHonorifics(text: string) {
  const parts = text.split(/(\(عليهم السلام\)|\(عليه السلام\)|\(ﷺ\))/g);
  return parts.map((part, i) => {
    if (/^\(عليهم السلام\)$|^\(عليه السلام\)$|^\(ﷺ\)$/.test(part)) {
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="flex flex-col items-center gap-3 px-2 py-2"
    >
      {/* Thin horizontal accent line */}
      <div
        className="h-[2px] w-12 rounded-full flex-shrink-0"
        style={{ background: 'linear-gradient(to right, #d4af3700, #d4af37, #d4af3700)' }}
      />
      <p
        className="text-[15px] leading-relaxed italic text-center"
        style={{ color: '#52796f', fontFamily: "'Inter', sans-serif" }}
      >
        {renderWithHonorifics(quote.text)}
      </p>
    </motion.div>
  );
}
