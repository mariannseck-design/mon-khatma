import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Sunrise, Moon, BookOpen, Heart, ChevronDown, MapPin, Landmark, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DhikrSession from '@/components/dhikr/DhikrSession';
import { MORNING_ADHKAR, EVENING_ADHKAR, POST_PRAYER_ADHKAR } from '@/lib/adhkarData';
import type { DhikrItem } from '@/components/dhikr/DhikrCounter';

/* ── Card config ── */
const dhikrCards = [
  { id: 'morning', title: 'Zikr du matin', icon: Sunrise, bg: '#e8d5a3', text: '#1b4332', border: '', enabled: true },
  { id: 'evening', title: 'Zikr du soir', icon: Moon, bg: '#1a1a2e', text: '#ffffff', border: '', enabled: true },
  { id: 'prayer', title: 'Après la prière', icon: BookOpen, bg: '#c8d5c0', text: '#1b4332', border: '', enabled: true },
  { id: 'anytime', title: 'Toute occasion', icon: Heart, bg: '#f0ebe3', text: '#1b4332', border: '', enabled: false },
  { id: 'sujud', title: 'Sujud Tilawah', icon: ChevronDown, bg: '#c67a5c', text: '#ffffff', border: '', enabled: false },
  { id: 'omra', title: 'Duas Omra', icon: MapPin, bg: '#faf8f5', text: '#1b4332', border: '#b5942e', enabled: false },
  { id: 'hajj', title: 'Duas Hajj', icon: Landmark, bg: '#2d6a4f', text: '#b5942e', border: '', enabled: false },
  { id: 'istikharah', title: 'Istikharah', icon: Sparkles, bg: '#dce8f0', text: '#1b4332', border: '', enabled: false },
];

const CATEGORY_DATA: Record<string, { title: string; items: DhikrItem[] }> = {
  morning: { title: 'Zikr du matin', items: MORNING_ADHKAR },
  evening: { title: 'Zikr du soir', items: EVENING_ADHKAR },
  prayer: { title: 'Après la prière', items: POST_PRAYER_ADHKAR },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function DhikrPage() {
  const { isAdmin } = useAuth();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categoryData = activeCategory ? CATEGORY_DATA[activeCategory] : null;

  return (
    <AppLayout title="Mon Dhikr Quotidien">
      <AnimatePresence mode="wait">
        {categoryData ? (
          <motion.div
            key="session"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <DhikrSession
              title={categoryData.title}
              items={categoryData.items}
              onBack={() => setActiveCategory(null)}
            />
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            <h1
              className="text-xl font-bold tracking-[0.06em] uppercase text-center"
              style={{ fontFamily: "'Inter', sans-serif", color: 'var(--p-primary)' }}
            >
              Mon Dhikr Quotidien
            </h1>

            <motion.div
              className="grid grid-cols-2 gap-4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {dhikrCards.map((card) => {
                const Icon = card.icon;
                return (
                  <motion.div
                    key={card.id}
                    variants={itemVariants}
                    className="relative overflow-hidden rounded-2xl p-5 flex flex-col items-center justify-center text-center aspect-[4/3] cursor-pointer"
                    style={{
                      background: card.bg,
                      border: card.border ? `1.5px solid ${card.border}` : '1px solid rgba(0,0,0,0.06)',
                      boxShadow: '0 2px 12px -2px rgba(0,0,0,0.08)',
                    }}
                    onClick={() => {
                      if (card.enabled || isAdmin) setActiveCategory(card.id);
                    }}
                    whileTap={card.enabled || isAdmin ? { scale: 0.96 } : {}}
                  >
                    {/* Badge Bientôt disponible — only for disabled cards */}
                    {!card.enabled && (
                      <span
                        className="absolute top-2 right-2 text-[9px] font-medium px-2 py-0.5 rounded-full backdrop-blur-sm"
                        style={{
                          background: 'rgba(255,255,255,0.35)',
                          color: card.text,
                          border: '1px solid rgba(255,255,255,0.25)',
                        }}
                      >
                        Bientôt disponible
                      </span>
                    )}

                    <Icon
                      className="h-7 w-7 mb-2 opacity-80"
                      strokeWidth={1.5}
                      style={{ color: card.text }}
                    />
                    <h3
                      className="text-sm font-semibold leading-tight"
                      style={{ color: card.text, fontFamily: "'Inter', sans-serif" }}
                    >
                      {card.title}
                    </h3>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}
