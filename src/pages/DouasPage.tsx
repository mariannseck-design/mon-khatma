import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronRight, Moon, MapPin, Heart, Sparkles, Star, Trash2 } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { DOUAS_CATEGORIES, type DouaCategory, type DouaSubtheme } from '@/lib/douasData';
import DouasSession from '@/components/douas/DouasSession';
import { useDouaFavorites, makeDouaId, type FavoriteDoua } from '@/hooks/useDouaFavorites';
import { type DhikrItem } from '@/components/dhikr/DhikrCounter';

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  Moon, MapPin, Heart, Sparkles,
};

const GOLD = '#D4AF37';

type View = 'categories' | 'subthemes' | 'session' | 'favorites' | 'fav-session';

export default function DouasPage() {
  const [view, setView] = useState<View>('categories');
  const [selectedCategory, setSelectedCategory] = useState<DouaCategory | null>(null);
  const [selectedSubtheme, setSelectedSubtheme] = useState<DouaSubtheme | null>(null);
  const [favSessionItems, setFavSessionItems] = useState<DhikrItem[]>([]);
  const { favorites, isFavorite, toggleFavorite, removeFavorite } = useDouaFavorites();

  const openCategory = (cat: DouaCategory) => {
    setSelectedCategory(cat);
    setView('subthemes');
  };

  const openSubtheme = (sub: DouaSubtheme) => {
    setSelectedSubtheme(sub);
    setView('session');
  };

  const openFavSession = (fav: FavoriteDoua) => {
    setFavSessionItems([fav.item]);
    setView('fav-session');
  };

  const openAllFavSession = () => {
    if (favorites.length === 0) return;
    setFavSessionItems(favorites.map(f => f.item));
    setView('fav-session');
  };

  const goBack = () => {
    if (view === 'session') setView('subthemes');
    else if (view === 'subthemes') setView('categories');
    else if (view === 'favorites' || view === 'fav-session') setView('categories');
  };

  const handleToggleFavorite = (id: string, catTitle: string, subTitle: string, item: DhikrItem) => {
    toggleFavorite(id, catTitle, subTitle, item);
  };

  return (
    <AppLayout title="Mes Douas" hideNav={view === 'session' || view === 'fav-session'}>
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

            {/* Favorites card */}
            {favorites.length > 0 && (
              <motion.button
                onClick={() => setView('favorites')}
                className="w-full flex items-center gap-4 rounded-2xl px-5 py-4"
                style={{
                  background: 'linear-gradient(135deg, #fdf2f8, #fce7f3)',
                  border: '1.5px solid #f9a8d420',
                  boxShadow: '0 4px 16px -4px rgba(233,76,60,0.1)',
                }}
                whileTap={{ scale: 0.98 }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: '#e74c3c18', border: '1px solid #e74c3c25' }}
                >
                  <Heart className="w-5 h-5" style={{ color: '#e74c3c' }} fill="#e74c3c" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-bold" style={{ color: '#9b1c31' }}>Mes Favoris</p>
                  <p className="text-xs" style={{ color: '#9b1c3180' }}>{favorites.length} doua{favorites.length > 1 ? 's' : ''} sauvegardée{favorites.length > 1 ? 's' : ''}</p>
                </div>
                <ChevronRight className="w-4 h-4" style={{ color: '#9b1c3160' }} />
              </motion.button>
            )}

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
            <DouasSession
              title={`${selectedCategory.title} — ${selectedSubtheme.title}`}
              items={selectedSubtheme.items}
              onBack={goBack}
              categoryId={selectedCategory.id}
              subthemeId={selectedSubtheme.id}
              isFavorite={isFavorite}
              onToggleFavorite={(id, item) => handleToggleFavorite(id, selectedCategory.title, selectedSubtheme.title, item)}
              makeId={(itemTitle) => makeDouaId(selectedCategory.id, selectedSubtheme.id, itemTitle)}
            />
          </motion.div>
        )}

        {view === 'favorites' && (
          <motion.div
            key="favorites"
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
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold" style={{ color: 'var(--p-text)' }}>
                Mes Favoris ❤️
              </h2>
              {favorites.length > 1 && (
                <button
                  onClick={openAllFavSession}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full"
                  style={{ background: `${GOLD}15`, color: GOLD }}
                >
                  ▶ Tout lire
                </button>
              )}
            </div>
            {favorites.length === 0 ? (
              <p className="text-center text-sm py-8" style={{ color: 'var(--p-text-55)' }}>
                Aucun favori pour le moment. Appuie sur le ❤️ pendant une session pour en ajouter.
              </p>
            ) : (
              <div className="space-y-2">
                {favorites.map((fav) => (
                  <motion.div
                    key={fav.id}
                    className="flex items-center gap-3 rounded-2xl px-4 py-3.5"
                    style={{
                      background: 'var(--p-bg)',
                      border: '1px solid var(--p-border)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    }}
                  >
                    <button
                      onClick={() => openFavSession(fav)}
                      className="flex-1 text-left min-w-0"
                    >
                      <p
                        className="text-base font-bold leading-relaxed truncate"
                        style={{
                          color: 'var(--p-primary)',
                          fontFamily: "'Scheherazade New', 'Traditional Arabic', serif",
                          direction: 'rtl',
                        }}
                      >
                        {fav.item.arabic}
                      </p>
                      <p className="text-xs mt-1 truncate" style={{ color: 'var(--p-text-60)' }}>
                        {fav.categoryTitle} — {fav.subthemeTitle}
                      </p>
                    </button>
                    <button
                      onClick={() => removeFavorite(fav.id)}
                      className="p-2 rounded-full flex-shrink-0"
                      style={{ color: '#e74c3c60' }}
                      aria-label="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {view === 'fav-session' && favSessionItems.length > 0 && (
          <motion.div
            key="fav-session"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }}
          >
            <DouasSession
              title="Mes Favoris"
              items={favSessionItems}
              onBack={goBack}
              categoryId="favorites"
              subthemeId="all"
              isFavorite={isFavorite}
              onToggleFavorite={(id, item) => toggleFavorite(id, 'Favoris', '', item)}
              makeId={(itemTitle) => {
                // Try to find existing ID from favorites
                const found = favorites.find(f => f.item.title === itemTitle);
                return found?.id || makeDouaId('favorites', 'all', itemTitle);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}
