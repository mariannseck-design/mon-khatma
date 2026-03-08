import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronRight, Moon, MapPin, Heart, Sparkles } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { DOUAS_CATEGORIES, type DouaCategory, type DouaSubtheme } from '@/lib/douasData';
import SourcesSession from '@/components/sources-lumiere/SourcesSession';

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  Moon, MapPin, Heart, Sparkles,
};

const GOLD = '#D4AF37';

type View = 'categories' | 'subthemes' | 'session';

export default function DouasPage() {
  const [view, setView] = useState<View>('categories');
  const [selectedCategory, setSelectedCategory] = useState<DouaCategory | null>(null);
  const [selectedSubtheme, setSelectedSubtheme] = useState<DouaSubtheme | null>(null);

  const openCategory = (cat: DouaCategory) => {
    setSelectedCategory(cat);
    setView('subthemes');
  };

  const openSubtheme = (sub: DouaSubtheme) => {
    setSelectedSubtheme(sub);
    setView('session');
  };

  const goBack = () => {
    if (view === 'session') setView('subthemes');
    else if (view === 'subthemes') setView('categories');
  };

  return (
    <AppLayout title="Mes Douas" hideNav={view === 'session'}>
      <AnimatePresence mode="wait">
        {view === 'categories' && (
          <motion.div
            key="categories"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="px-4 py-4 space-y-4"
          >
            <p className="text-center text-sm font-medium" style={{ color: 'var(--p-text-60)' }}>
              Choisis une catégorie d'invocations
            </p>
            <div className="grid grid-cols-2 gap-4">
              {DOUAS_CATEGORIES.map((cat) => {
                const Icon = ICON_MAP[cat.icon] || Sparkles;
                return (
                  <motion.button
                    key={cat.id}
                    onClick={() => openCategory(cat)}
                    className="relative overflow-hidden rounded-[2rem] p-5 text-left flex flex-col justify-between"
                    style={{
                      background: cat.bg,
                      border: `1.5px solid ${GOLD}40`,
                      aspectRatio: '4/3',
                      boxShadow: `0 4px 20px -6px ${cat.bg}60`,
                    }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: `${GOLD}20`, border: `1px solid ${GOLD}30` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: GOLD }} />
                    </div>
                    <div className="mt-auto">
                      <p className="text-sm font-bold leading-tight" style={{ color: cat.textColor }}>
                        {cat.title}
                      </p>
                      <p className="text-[11px] mt-0.5 opacity-70" style={{ color: cat.textColor }}>
                        {cat.subtitle}
                      </p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}

        {view === 'subthemes' && selectedCategory && (
          <motion.div
            key="subthemes"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }}
            className="px-4 py-4 space-y-3"
          >
            <button
              onClick={goBack}
              className="flex items-center gap-2 text-sm font-medium mb-2"
              style={{ color: GOLD }}
            >
              <ArrowLeft className="w-4 h-4" />
              Retour
            </button>
            <h2 className="text-lg font-bold" style={{ color: 'var(--p-text)' }}>
              {selectedCategory.title}
            </h2>
            <div className="space-y-2">
              {selectedCategory.subthemes.map((sub) => (
                <motion.button
                  key={sub.id}
                  onClick={() => openSubtheme(sub)}
                  className="w-full flex items-center gap-3 rounded-2xl px-4 py-3.5 transition-colors"
                  style={{
                    background: 'var(--p-bg)',
                    border: '1px solid var(--p-border)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-lg">{sub.icon}</span>
                  <span className="flex-1 text-left text-sm font-semibold" style={{ color: 'var(--p-text)' }}>
                    {sub.title}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${GOLD}15`, color: GOLD }}>
                    {sub.items.length}
                  </span>
                  <ChevronRight className="w-4 h-4" style={{ color: 'var(--p-text-55)' }} />
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {view === 'session' && selectedSubtheme && selectedCategory && (
          <motion.div
            key="session"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }}
          >
            <DhikrSession
              title={`${selectedCategory.title} — ${selectedSubtheme.title}`}
              items={selectedSubtheme.items}
              onBack={goBack}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}
