import { useEffect, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Milestone {
  key: string;
  emoji: string;
  title: string;
  subtitle: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
  duration: number;
  type: 'confetti' | 'star';
  rotation: number;
}

const MILESTONE_DEFS: { check: (args: { totalPages: number; completedJuz: number[]; activeJuzCount: number }) => boolean; key: string; emoji: string; title: string; subtitle: string }[] = [
  { key: 'first_1p', check: ({ totalPages }) => totalPages >= 1, emoji: '🌱', title: '1 page mémorisée !', subtitle: 'Tes premiers pas sont posés' },
  { key: 'first_3p', check: ({ totalPages }) => totalPages >= 3, emoji: '⭐', title: '3 pages mémorisées !', subtitle: 'Ma sha Allah, continue !' },
  { key: 'first_7p', check: ({ totalPages }) => totalPages >= 7, emoji: '🌟', title: '7 pages mémorisées !', subtitle: 'Un cap symbolique franchi' },
  { key: 'first_juz', check: ({ completedJuz }) => completedJuz.length >= 1, emoji: '🏆', title: 'Premier Juz complet !', subtitle: 'Allahumma barik, quel accomplissement !' },
  { key: 'first_17p', check: ({ totalPages }) => totalPages >= 17, emoji: '💎', title: '17 pages mémorisées !', subtitle: 'Ta persévérance porte ses fruits' },
  { key: 'first_33p', check: ({ totalPages }) => totalPages >= 33, emoji: '🔥', title: '33 pages mémorisées !', subtitle: 'Ma sha Allah, quelle force !' },
  { key: 'two_juz', check: ({ completedJuz }) => completedJuz.length >= 2, emoji: '👑', title: '2 Juz complets !', subtitle: 'La régularité est ta force' },
  { key: 'first_67p', check: ({ totalPages }) => totalPages >= 67, emoji: '🎖️', title: '67 pages mémorisées !', subtitle: 'SubhanAllah, quel trésor dans ton cœur' },
  { key: 'five_juz', check: ({ completedJuz }) => completedJuz.length >= 5, emoji: '🌙', title: '5 Juz complets !', subtitle: 'SubhanAllah, quel parcours !' },
];

const CONFETTI_COLORS = [
  'rgba(16,185,129,0.9)', 'rgba(5,150,105,0.9)', 'rgba(52,211,153,0.9)',
  'rgba(251,191,36,0.9)', 'rgba(245,158,11,0.9)', 'rgba(255,255,255,0.8)',
];

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: -10 - Math.random() * 20,
    size: 4 + Math.random() * 8,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    delay: Math.random() * 0.8,
    duration: 1.5 + Math.random() * 1.5,
    type: Math.random() > 0.3 ? 'confetti' : 'star',
    rotation: Math.random() * 360,
  }));
}

interface HifzMilestoneCelebrationProps {
  totalAyats: number;
  completedJuz: number[]; // juz numbers at 100%
  activeJuzCount: number;
}

export function HifzMilestoneCelebration({ totalAyats, completedJuz, activeJuzCount }: HifzMilestoneCelebrationProps) {
  const [shownMilestones, setShownMilestones] = useState<Set<string>>(new Set());
  const [activeMilestone, setActiveMilestone] = useState<Milestone | null>(null);
  const [particles, setParticles] = useState<Particle[]>([]);

  // Load previously dismissed milestones from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('hifz_milestones_seen');
    if (stored) {
      try { setShownMilestones(new Set(JSON.parse(stored))); } catch {}
    }
  }, []);

  const newMilestone = useMemo(() => {
    const args = { totalAyats, completedJuz, activeJuzCount };
    // Find the highest unlocked milestone not yet shown
    const unlocked = MILESTONE_DEFS.filter(m => m.check(args) && !shownMilestones.has(m.key));
    return unlocked.length > 0 ? unlocked[unlocked.length - 1] : null;
  }, [totalAyats, completedJuz, activeJuzCount, shownMilestones]);

  useEffect(() => {
    if (!newMilestone) return;
    // Small delay for dramatic effect
    const timer = setTimeout(() => {
      setActiveMilestone(newMilestone);
      setParticles(generateParticles(40));
    }, 800);
    return () => clearTimeout(timer);
  }, [newMilestone]);

  const dismiss = useCallback(() => {
    if (!activeMilestone) return;
    const updated = new Set(shownMilestones);
    // Mark all milestones up to this one as seen
    const idx = MILESTONE_DEFS.findIndex(m => m.key === activeMilestone.key);
    for (let i = 0; i <= idx; i++) updated.add(MILESTONE_DEFS[i].key);
    setShownMilestones(updated);
    localStorage.setItem('hifz_milestones_seen', JSON.stringify([...updated]));
    setActiveMilestone(null);
    setParticles([]);
  }, [activeMilestone, shownMilestones]);

  return (
    <AnimatePresence>
      {activeMilestone && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={dismiss}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          {/* Confetti particles */}
          {particles.map(p => (
            <motion.div
              key={p.id}
              className="absolute pointer-events-none"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: p.size,
                height: p.type === 'star' ? p.size : p.size * 0.6,
                background: p.type === 'confetti' ? p.color : 'transparent',
                borderRadius: p.type === 'confetti' ? '2px' : '0',
                fontSize: p.type === 'star' ? p.size * 1.5 : 0,
              }}
              initial={{ y: 0, rotate: 0, opacity: 1 }}
              animate={{
                y: [0, window.innerHeight * 1.2],
                rotate: [p.rotation, p.rotation + 360 + Math.random() * 360],
                x: [0, (Math.random() - 0.5) * 100],
                opacity: [1, 1, 0],
              }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                ease: 'easeIn',
              }}
            >
              {p.type === 'star' ? '✦' : ''}
            </motion.div>
          ))}

          {/* Card */}
          <motion.div
            className="relative rounded-3xl p-8 mx-6 text-center max-w-sm"
            style={{
              background: 'var(--p-card)',
              border: '2px solid var(--p-primary)',
              boxShadow: '0 25px 60px rgba(6,95,70,0.3)',
            }}
            initial={{ scale: 0.5, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 30, opacity: 0 }}
            transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.1 }}
            onClick={e => e.stopPropagation()}
          >
            {/* Emoji */}
            <motion.div
              className="text-6xl mb-4"
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 10, stiffness: 200, delay: 0.3 }}
            >
              {activeMilestone.emoji}
            </motion.div>

            {/* Title */}
            <motion.h2
              className="text-xl font-bold mb-2"
              style={{ color: 'var(--p-primary)' }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {activeMilestone.title}
            </motion.h2>

            {/* Subtitle */}
            <motion.p
              className="text-sm mb-6"
              style={{ color: 'var(--p-text-65)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              {activeMilestone.subtitle}
            </motion.p>

            {/* Dismiss button */}
            <motion.button
              onClick={dismiss}
              className="px-6 py-2.5 rounded-full text-sm font-semibold transition-all hover:scale-105 active:scale-95"
              style={{ background: 'var(--p-primary)', color: 'var(--p-on-dark)' }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              Alhamdulillah ✨
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
