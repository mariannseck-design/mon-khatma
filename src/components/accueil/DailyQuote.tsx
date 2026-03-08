import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="flex items-start gap-3 rounded-2xl px-4 py-3.5"
      style={{
        background: 'rgba(6, 95, 70, 0.06)',
        border: '1px solid rgba(212, 175, 55, 0.25)',
      }}
    >
      <Sparkles className="shrink-0 mt-0.5" size={18} style={{ color: '#D4AF37' }} />
      <p className="text-sm italic leading-relaxed" style={{ color: '#D4AF37' }}>
        {renderWithHonorifics(quote.text)}
      </p>
    </motion.div>
  );
}
