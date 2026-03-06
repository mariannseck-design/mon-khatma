import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';

interface MurajaCountdownProps {
  nextReviewDate: Date | null;
}

export default function MurajaCountdown({ nextReviewDate }: MurajaCountdownProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const { hours, minutes, seconds, isOverdue, overdueHours, isReady } = useMemo(() => {
    if (!nextReviewDate) return { hours: 0, minutes: 0, seconds: 0, isOverdue: false, overdueHours: 0, isReady: false };
    
    const diff = nextReviewDate.getTime() - now.getTime();
    const isOverdue = diff <= 0;
    const absDiff = Math.abs(diff);
    const totalSeconds = Math.floor(absDiff / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const overdueHours = isOverdue ? hours : 0;
    const isReady = diff <= 0 && diff > -60000; // within 1 minute of due

    return { hours, minutes, seconds, isOverdue, overdueHours, isReady };
  }, [nextReviewDate, now]);

  const circleColor = isOverdue && overdueHours >= 24
    ? '#9b1c31' // ruby red
    : isOverdue
    ? '#d4af37' // gold (ready)
    : '#d4af37'; // gold (countdown)

  const glowEffect = isReady
    ? '0 0 30px rgba(212,175,55,0.6), 0 0 60px rgba(212,175,55,0.3)'
    : isOverdue && overdueHours >= 24
    ? '0 0 20px rgba(155,28,49,0.4)'
    : '0 0 15px rgba(212,175,55,0.2)';

  const statusText = !nextReviewDate
    ? 'Aucun verset à réviser'
    : isOverdue && overdueHours >= 24
    ? `En retard de ${overdueHours}h`
    : isOverdue
    ? "C'est l'heure !"
    : 'Prochaine Muraja\'a dans';

  const pad = (n: number) => n.toString().padStart(2, '0');

  // SVG circle progress
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const progress = nextReviewDate
    ? isOverdue ? 1 : Math.min(1, 1 - (nextReviewDate.getTime() - now.getTime()) / (24 * 3600 * 1000))
    : 0;

  return (
    <div className="flex flex-col items-center gap-4">
      <p
        className="text-sm font-medium tracking-wide uppercase"
        style={{ color: isOverdue && overdueHours >= 24 ? '#9b1c31' : '#d4af37' }}
      >
        {statusText}
      </p>

      <motion.div
        className="relative w-44 h-44 flex items-center justify-center"
        animate={isReady ? { scale: [1, 1.03, 1] } : {}}
        transition={isReady ? { duration: 2, repeat: Infinity } : {}}
      >
        {/* SVG Ring */}
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 160 160">
          <circle
            cx="80" cy="80" r={radius}
            fill="none"
            stroke="rgba(212,175,55,0.15)"
            strokeWidth="4"
          />
          <motion.circle
            cx="80" cy="80" r={radius}
            fill="none"
            stroke={circleColor}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
            transition={{ duration: 1 }}
          />
        </svg>

        {/* Inner circle */}
        <div
          className="w-32 h-32 rounded-full flex flex-col items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, rgba(13,115,119,0.9), rgba(20,145,155,0.9))',
            border: `2px solid ${circleColor}`,
            boxShadow: glowEffect,
          }}
        >
          {nextReviewDate ? (
            <>
              <span
                className="text-2xl font-bold tabular-nums"
                style={{ fontFamily: "'Inter', sans-serif", color: '#d4af37' }}
              >
                {pad(hours)}:{pad(minutes)}
              </span>
              <span className="text-xs text-white/60 tabular-nums">
                :{pad(seconds)}
              </span>
            </>
          ) : (
            <span className="text-sm text-white/60 text-center px-2">
              Commence le Hifz
            </span>
          )}
        </div>
      </motion.div>
    </div>
  );
}
