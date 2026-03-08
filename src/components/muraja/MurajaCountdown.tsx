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

  const radius = 70;
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

      <div className="relative w-36 h-36 flex items-center justify-center">
        {/* SVG Ring */}
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 160 160">
          <circle
            cx="80" cy="80" r={radius}
            fill="none"
            stroke="var(--p-track)"
            strokeWidth="3"
          />
          <motion.circle
            cx="80" cy="80" r={radius}
            fill="none"
            stroke="var(--p-primary)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
            transition={{ duration: 1 }}
          />
        </svg>

        {/* Inner circle */}
        <div
          className="w-28 h-28 rounded-full flex flex-col items-center justify-center"
          style={{
            background: 'var(--p-card)',
            border: '2px solid var(--p-primary)',
            boxShadow: 'var(--p-card-shadow)',
          }}
        >
          <span
            className="text-xl font-bold tabular-nums"
            style={{ fontFamily: "'Inter', sans-serif", color: 'var(--p-primary)' }}
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
