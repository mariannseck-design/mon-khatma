import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';

export default function MurajaCountdown() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const { hours, minutes, seconds } = useMemo(() => {
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const diff = midnight.getTime() - now.getTime();
    const totalSeconds = Math.max(0, Math.floor(diff / 1000));
    return {
      hours: Math.floor(totalSeconds / 3600),
      minutes: Math.floor((totalSeconds % 3600) / 60),
      seconds: totalSeconds % 60,
    };
  }, [now]);

  const pad = (n: number) => n.toString().padStart(2, '0');

  const radius = 75;
  const circumference = 2 * Math.PI * radius;
  const totalDaySeconds = 24 * 3600;
  const elapsed = totalDaySeconds - (hours * 3600 + minutes * 60 + seconds);
  const progress = elapsed / totalDaySeconds;

  return (
    <div className="flex flex-col items-center gap-3">
      <p
        className="text-xs font-medium tracking-widest uppercase"
        style={{ color: 'var(--p-accent)' }}
      >
        Ta prochaine récitation dans
      </p>

      <div className="relative w-40 h-40 flex items-center justify-center">
        {/* SVG Ring */}
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 170 170">
          <defs>
            <linearGradient id="countdown-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--p-primary)" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
          </defs>
          <circle
            cx="85" cy="85" r={radius}
            fill="none"
            stroke="var(--p-track)"
            strokeWidth="4"
          />
          <motion.circle
            cx="85" cy="85" r={radius}
            fill="none"
            stroke="url(#countdown-gradient)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
            transition={{ duration: 1 }}
          />
        </svg>

        {/* Inner circle */}
        <div
          className="w-30 h-30 rounded-full flex flex-col items-center justify-center"
          style={{
            width: '7.5rem',
            height: '7.5rem',
            background: 'radial-gradient(circle at center, var(--p-track), var(--p-card))',
            border: '2px solid var(--p-primary)',
            boxShadow: '0 0 20px rgba(6,95,70,0.12), var(--p-card-shadow)',
          }}
        >
          <span
            className="text-2xl font-bold tabular-nums"
            style={{
              fontFamily: "'Inter', sans-serif",
              color: 'var(--p-primary)',
              letterSpacing: '0.05em',
            }}
          >
            {pad(hours)}:{pad(minutes)}
          </span>
          <span className="text-[10px] tabular-nums" style={{ color: 'var(--p-text-60)' }}>
            :{pad(seconds)}
          </span>
        </div>
      </div>
    </div>
  );
}
