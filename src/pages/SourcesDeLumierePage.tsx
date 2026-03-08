import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, BookOpenCheck, Heart, Star, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import SourcesSession from '@/components/sources-lumiere/SourcesSession';
import { QURAN_INVOCATIONS, SUNNA_INVOCATIONS, SALAWAT } from '@/lib/sourcesLumiereData';

type Category = 'menu' | 'coran' | 'sunna' | 'salawat';

const TILES = [
  {
    id: 'coran' as const,
    title: 'Le Noble Coran',
    subtitle: 'Invocations des versets',
    icon: BookOpenCheck,
    bg: 'linear-gradient(135deg, #faf8f5 0%, #f5e6c8 100%)',
    darkBg: 'linear-gradient(135deg, #1a1f1a 0%, #252a1e 100%)',
    iconColor: '#D4AF37',
    textColor: '#2d6a4f',
    darkTextColor: '#D4AF37',
    border: '#D4AF3740',
  },
  {
    id: 'sunna' as const,
    title: 'La Sunna Sacrée',
    subtitle: 'Invocations prophétiques',
    icon: Heart,
    bg: 'linear-gradient(135deg, #065F46 0%, #2d6a4f 100%)',
    darkBg: 'linear-gradient(135deg, #0a2e20 0%, #14382a 100%)',
    iconColor: '#D4AF37',
    textColor: '#faf8f5',
    darkTextColor: '#E5C44B',
    border: '#D4AF3750',
  },
  {
    id: 'salawat' as const,
    title: 'Salawât',
    subtitle: 'Prières sur le Prophète (ﷺ)',
    icon: Star,
    bg: 'linear-gradient(135deg, #1a3a2a 0%, #065F46 100%)',
    darkBg: 'linear-gradient(135deg, #0a1f15 0%, #0d2e1e 100%)',
    iconColor: '#D4AF37',
    textColor: '#faf8f5',
    darkTextColor: '#E5C44B',
    border: '#D4AF3760',
  },
];

export default function SourcesDeLumierePage() {
  const navigate = useNavigate();
  const [category, setCategory] = useState<Category>('menu');
  const isDark = document.documentElement.classList.contains('dark') ||
    window.matchMedia('(prefers-color-scheme: dark)').matches;

  const handleBack = () => {
    if (category === 'menu') {
      navigate('/accueil');
    } else {
      setCategory('menu');
    }
  };

  const getSessionProps = () => {
    switch (category) {
      case 'coran':
        return { title: 'Le Noble Coran', items: QURAN_INVOCATIONS, useSalawatCounter: false };
      case 'sunna':
        return { title: 'La Sunna Sacrée', items: SUNNA_INVOCATIONS, useSalawatCounter: false };
      case 'salawat':
        return { title: 'Salawât', items: SALAWAT, useSalawatCounter: true };
      default:
        return null;
    }
  };

  const sessionProps = getSessionProps();

  return (
    <AppLayout title="Les Sources de Lumière" hideNav={category !== 'menu'}>
      <AnimatePresence mode="wait">
        {category === 'menu' ? (
          <motion.div
            key="menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4 pb-6"
          >
            {/* Header */}
            <div className="text-center pt-2 pb-4">
              <div className="flex justify-center mb-3">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center relative"
                  style={{ background: '#D4AF3720', border: '1.5px solid #D4AF3740' }}
                >
                  <Sparkles className="w-7 h-7" style={{ color: '#D4AF37' }} />
                  <div
                    className="absolute inset-0 rounded-2xl blur-lg opacity-30"
                    style={{ background: '#D4AF37' }}
                  />
                </div>
              </div>
              <h2
                className="text-xl font-bold tracking-wide"
                style={{ color: '#D4AF37', fontFamily: "'Inter', sans-serif" }}
              >
                Les Sources de Lumière
              </h2>
              <p className="text-sm mt-1" style={{ color: 'var(--p-text-60)' }}>
                Coran · Sunna · Salawât
              </p>
            </div>

            {/* Tiles */}
            {TILES.map((tile, i) => {
              const Icon = tile.icon;
              return (
                <motion.button
                  key={tile.id}
                  onClick={() => setCategory(tile.id)}
                  className="w-full text-left"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div
                    className="relative overflow-hidden rounded-[2rem] p-7"
                    style={{
                      background: isDark ? tile.darkBg : tile.bg,
                      border: `2px solid ${tile.border}`,
                      boxShadow: '0 8px 32px -8px rgba(212, 175, 55, 0.15)',
                    }}
                  >
                    {/* Glow */}
                    <div
                      className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full blur-2xl"
                      style={{ background: '#D4AF3710' }}
                    />
                    <div className="relative z-10 flex items-center gap-5">
                      <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                        style={{ background: '#D4AF3722', border: '1px solid #D4AF3735' }}
                      >
                        <Icon className="h-8 w-8" style={{ color: tile.iconColor }} />
                      </div>
                      <div className="flex-1">
                        <h3
                          className="text-lg font-bold tracking-wide"
                          style={{
                            fontFamily: "'Inter', sans-serif",
                            color: isDark ? tile.darkTextColor : tile.textColor,
                          }}
                        >
                          {tile.title}
                        </h3>
                        <p
                          className="text-sm mt-0.5 opacity-75"
                          style={{ color: isDark ? tile.darkTextColor : tile.textColor }}
                        >
                          {tile.subtitle}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        ) : sessionProps ? (
          <motion.div
            key={category}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
          >
            <SourcesSession
              title={sessionProps.title}
              items={sessionProps.items}
              onBack={handleBack}
              useSalawatCounter={sessionProps.useSalawatCounter}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </AppLayout>
  );
}
