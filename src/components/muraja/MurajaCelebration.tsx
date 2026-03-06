import { motion, AnimatePresence } from 'framer-motion';
import { Star, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', damping: 20 }}
            className="relative w-full max-w-sm rounded-3xl p-8 text-center"
            style={{
              background: 'linear-gradient(135deg, #0d7377 0%, #14919b 50%, #0d7377 100%)',
              border: '2px solid rgba(212,175,55,0.5)',
              boxShadow: '0 0 40px rgba(212,175,55,0.2), 0 20px 60px rgba(0,0,0,0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-white/40 hover:text-white/70">
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
                <Star className="h-16 w-16 mx-auto mb-4" style={{ color: '#d4af37' }} fill="#d4af37" />
              </motion.div>

              <h2
                className="text-xl font-bold mb-4"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#d4af37' }}
              >
                {type === 'cycle' ? '🎉 Cycle Terminé !' : '✨ Bravo !'}
              </h2>

              <p className="text-white/90 text-base leading-relaxed mb-6">
                {message}
              </p>

              <Button
                onClick={onClose}
                className="px-8"
                style={{
                  background: 'linear-gradient(135deg, #d4af37, #c5a028)',
                  color: '#0d4a4c',
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
