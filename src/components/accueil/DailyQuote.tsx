import { motion } from 'framer-motion';
import { getTodayQuote } from '@/lib/dailyQuotes';
import { useMemo } from 'react';

const COLORS = {
  emerald: '#2d6a4f',
  sage: '#52796f',
  gold: '#b5942e',
  goldAccent: '#d4af37',
  beige: '#faf8f5',
};

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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.15 }}
      className="relative overflow-hidden rounded-2xl px-5 py-4"
      style={{
        background: `linear-gradient(135deg, ${COLORS.beige}, #f0ede6)`,
        border: `1px solid ${COLORS.emerald}18`,
      }}
    >
      {/* Decorative corner accent */}
      <div
        className="absolute -top-3 -left-3 w-12 h-12 rounded-full blur-xl"
        style={{ background: `${COLORS.goldAccent}15` }}
      />
      <div
        className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full blur-lg"
        style={{ background: `${COLORS.emerald}08` }}
      />

      <div className="relative z-10 flex items-start gap-3">
        {/* Theme emoji */}
        <span className="text-lg mt-0.5 flex-shrink-0">{quote.theme}</span>

        {/* Quote text */}
        <p
          className="text-[13px] leading-relaxed italic flex-1"
          style={{ color: COLORS.sage, fontFamily: "'Inter', sans-serif" }}
        >
          « {renderWithHonorifics(quote.text)} »
        </p>
      </div>
    </motion.div>
  );
}
