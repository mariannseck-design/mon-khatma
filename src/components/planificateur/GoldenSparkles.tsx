import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  type: 'star' | 'circle' | 'diamond';
}

interface GoldenSparklesProps {
  isActive: boolean;
  onComplete?: () => void;
}

const SPARKLE_COLORS = [
  'hsl(43, 90%, 55%)',    // Rich gold
  'hsl(43, 85%, 65%)',    // Light gold
  'hsl(43, 80%, 75%)',    // Pale gold
  'hsl(158, 45%, 70%)',   // Sage green
  'hsl(38, 95%, 60%)',    // Amber
];

export function GoldenSparkles({ isActive, onComplete }: GoldenSparklesProps) {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);

  useEffect(() => {
    if (isActive) {
      const types: Array<'star' | 'circle' | 'diamond'> = ['star', 'circle', 'diamond'];
      const newSparkles: Sparkle[] = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 16 + 8,
        delay: Math.random() * 0.5,
        type: types[Math.floor(Math.random() * types.length)],
      }));
      setSparkles(newSparkles);

      const timer = setTimeout(() => {
        setSparkles([]);
        onComplete?.();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isActive, onComplete]);

  const renderShape = (type: 'star' | 'circle' | 'diamond', size: number, color: string) => {
    switch (type) {
      case 'star':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
            <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
          </svg>
        );
      case 'circle':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
            <circle cx="12" cy="12" r="10" />
          </svg>
        );
      case 'diamond':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
            <path d="M12 2L22 12L12 22L2 12L12 2Z" />
          </svg>
        );
    }
  };

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
            scale: [0, 1.5, 1, 0],
            rotate: [0, 180, 360],
            y: [0, -40, -60],
          }}
          exit={{ opacity: 0, scale: 0 }}
          transition={{
            duration: 1.5,
            delay: sparkle.delay,
            ease: 'easeOut',
          }}
        >
          {renderShape(
            sparkle.type,
            sparkle.size,
            SPARKLE_COLORS[Math.floor(Math.random() * SPARKLE_COLORS.length)]
          )}
        </motion.div>
      ))}
    </AnimatePresence>
  );
}
