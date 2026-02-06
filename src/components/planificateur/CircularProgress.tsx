import { motion } from 'framer-motion';

const TOTAL_QURAN_PAGES = 604;

interface CircularProgressProps {
  pagesRead: number;
  size?: number;
  strokeWidth?: number;
}

export function CircularProgress({ 
  pagesRead, 
  size = 200, 
  strokeWidth = 12 
}: CircularProgressProps) {
  const percentage = Math.min(100, (pagesRead / TOTAL_QURAN_PAGES) * 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const isComplete = pagesRead >= TOTAL_QURAN_PAGES;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Background circle */}
      <svg
        width={size}
        height={size}
        className="absolute progress-ring"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle with gradient */}
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--sage))" />
            <stop offset="50%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--gold))" />
          </linearGradient>
        </defs>
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={isComplete ? "hsl(var(--gold))" : "url(#progressGradient)"}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>

      {/* Center content */}
      <div className="relative z-10 text-center">
        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Page</p>
        <motion.p 
          key={pagesRead}
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-4xl sm:text-5xl font-display font-bold text-foreground leading-none"
        >
          {pagesRead}
        </motion.p>
        <motion.p 
          key={percentage}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-lg font-semibold text-primary mt-2"
        >
          {percentage.toFixed(1)}%
        </motion.p>
      </div>
    </div>
  );
}
