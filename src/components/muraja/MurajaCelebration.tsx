import { motion, AnimatePresence } from 'framer-motion';
import { Star, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMemo } from 'react';

const CONFETTI_COLORS = ['#D4AF37', '#065F46', '#6EE7B7', '#FBBF24', '#ffffff', '#34D399'];

interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  size: number;
  delay: number;
  rotation: number;
  xDrift: number;
}

function generateConfetti(count = 30): ConfettiPiece[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    size: Math.random() * 8 + 4,
    delay: Math.random() * 0.8,
    rotation: Math.random() * 360,
    xDrift: (Math.random() - 0.5) * 80,
  }));
}

const DAILY_MESSAGES = [
  "MashaAllah, qu'Allah (عز وجل) bénisse ta persévérance ! 🌟",
  "SubhanAllah, ta constance est une source de lumière ! ✨",
  "Allahoumma barik, tu avances avec détermination ! 🌙",
  "Qu'Allah (عز وجل) t'accorde la facilité dans ta mémorisation ! 🤲",
  "MashaAllah, chaque révision est une graine plantée au Paradis ! 🌿",
  "Continue sur cette voie, qu'Allah (عز وجل) te récompense ! 💫",
];

const CYCLE_MESSAGES = [
  "Un cycle complet ! Qu'Allah (عز وجل) fasse de toi une porteuse du Coran ! 👑",
  "SubhanAllah, un tour entier ! Ta détermination est inspirante ! 🏆",
  "MashaAllah, cycle terminé ! Le Coran intercédera pour toi le Jour du Jugement ! ⭐",
];

interface MurajaCelebrationProps {
  type: 'daily' | 'cycle';
  isOpen: boolean;
  onClose: () => void;
}

export default function MurajaCelebration({ type, isOpen, onClose }: MurajaCelebrationProps) {
  const messages = type === 'cycle' ? CYCLE_MESSAGES : DAILY_MESSAGES;
  const message = messages[Math.floor(Math.random() * messages.length)];
  const confetti = useMemo(() => generateConfetti(30), [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={onClose}
        >
          {/* Confetti */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {confetti.map((piece) => (
              <motion.div
                key={piece.id}
                className="absolute"
                style={{
                  left: `${piece.x}%`,
                  top: -10,
                  width: piece.size,
                  height: piece.size * 1.4,
                  backgroundColor: piece.color,
                  borderRadius: piece.size > 8 ? '50%' : '2px',
                }}
                initial={{ y: -20, x: 0, rotate: 0, opacity: 1 }}
                animate={{
                  y: [0, window.innerHeight + 40],
                  x: [0, piece.xDrift, piece.xDrift * 0.5],
                  rotate: [0, piece.rotation, piece.rotation * 2],
                  opacity: [1, 1, 0],
                }}
                transition={{
                  duration: 2.5 + Math.random(),
                  delay: piece.delay,
                  ease: 'easeIn',
                }}
              />
            ))}
          </div>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', damping: 20 }}
            className="relative w-full max-w-sm rounded-3xl p-8 text-center"
            style={{
              background: 'var(--p-gradient-bg)',
              border: '2px solid var(--p-accent)',
              boxShadow: '0 0 40px rgba(212,175,55,0.2), 0 20px 60px rgba(0,0,0,0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={onClose} className="absolute top-4 right-4" style={{ color: 'var(--p-on-dark-muted)' }}>
              <X className="h-5 w-5" />
            </button>

            {/* Golden rays */}
            {type === 'cycle' && (
              <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-3xl">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-0.5 h-32 origin-bottom"
                    style={{
                      background: 'linear-gradient(to top, rgba(212,175,55,0.3), transparent)',
                      transform: `rotate(${i * 45}deg)`,
                    }}
                    animate={{ opacity: [0.2, 0.6, 0.2] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.25 }}
                  />
                ))}
              </div>
            )}

            <div className="relative z-10">
              <motion.div
                animate={type === 'cycle' ? { rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] } : { scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Star className="h-16 w-16 mx-auto mb-4" style={{ color: 'var(--p-accent)' }} fill="var(--p-accent)" />
              </motion.div>

              <h2
                className="text-xl font-bold mb-4"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", color: 'var(--p-accent)' }}
              >
                {type === 'cycle' ? '🎉 Cycle Terminé !' : '✨ Bravo !'}
              </h2>

              <p className="text-base leading-relaxed mb-6" style={{ color: 'var(--p-on-dark)' }}>
                {message}
              </p>

              <Button
                onClick={onClose}
                className="px-8"
                style={{
                  background: 'var(--p-accent)',
                  color: '#065F46',
                  border: 'none',
                }}
              >
                Al hamdoulillah
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
