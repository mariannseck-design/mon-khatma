import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
}

interface SparkleEffectProps {
  isActive: boolean;
  onComplete?: () => void;
}

const SPARKLE_COLORS = [
  'hsl(45, 93%, 70%)',   // Gold
  'hsl(45, 80%, 60%)',   // Darker gold
  'hsl(142, 40%, 70%)',  // Mint green
  'hsl(142, 50%, 60%)',  // Darker mint
  'hsl(38, 90%, 75%)',   // Light gold
];

export function SparkleEffect({ isActive, onComplete }: SparkleEffectProps) {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);

  useEffect(() => {
    if (isActive) {
      const newSparkles: Sparkle[] = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 12 + 6,
        color: SPARKLE_COLORS[Math.floor(Math.random() * SPARKLE_COLORS.length)],
        delay: Math.random() * 0.3,
      }));
      setSparkles(newSparkles);

      const timer = setTimeout(() => {
        setSparkles([]);
        onComplete?.();
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [isActive, onComplete]);

  return (
    <AnimatePresence>
      {sparkles.map((sparkle) => (
        <motion.div
          key={sparkle.id}
          className="absolute pointer-events-none z-50"
          style={{
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
          }}
          initial={{ opacity: 0, scale: 0, rotate: 0 }}
          animate={{
            opacity: [0, 1, 1, 0],
            scale: [0, 1.2, 1, 0],
            rotate: [0, 180, 360],
            y: [0, -30],
          }}
          exit={{ opacity: 0, scale: 0 }}
          transition={{
            duration: 1.2,
            delay: sparkle.delay,
            ease: 'easeOut',
          }}
        >
          <svg
            width={sparkle.size}
            height={sparkle.size}
            viewBox="0 0 24 24"
            fill={sparkle.color}
          >
            <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
          </svg>
        </motion.div>
      ))}
    </AnimatePresence>
  );
}
