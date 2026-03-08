import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ChevronRight, Sparkles } from 'lucide-react';
import { useDouaFavorites } from '@/hooks/useDouaFavorites';

export default function FavoriteDouasSection() {
  const navigate = useNavigate();
  const { favorites } = useDouaFavorites();

  const categories = [...new Set(favorites.map(f => f.categoryTitle))].slice(0, 3);

  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      onClick={() => navigate('/douas?view=favorites')}
      className="w-full text-left relative overflow-hidden rounded-2xl p-5 active:scale-[0.98] transition-transform"
      style={{
        background: 'linear-gradient(145deg, hsl(var(--card)) 0%, hsl(var(--muted)) 100%)',
        border: '1.5px solid hsl(var(--border))',
        boxShadow: '0 4px 16px -6px hsl(var(--primary) / 0.1)',
      }}
    >
      <div className="flex items-center gap-3.5">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
          style={{
            background: 'linear-gradient(135deg, rgba(239,68,68,0.12) 0%, rgba(239,68,68,0.06) 100%)',
            border: '1.5px solid rgba(239,68,68,0.18)',
          }}
        >
          <Heart className="h-6 w-6 text-red-400" strokeWidth={1.8} fill="rgba(239,68,68,0.25)" />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-base font-bold tracking-wide text-foreground">
            Mes Invocations Favorites
          </h4>
          {favorites.length > 0 ? (
            <>
              <p className="text-xs text-muted-foreground mt-0.5">
                {favorites.length} invocation{favorites.length !== 1 ? 's' : ''} sauvegardée{favorites.length !== 1 ? 's' : ''}
              </p>
              {categories.length > 0 && (
                <p className="text-[11px] text-muted-foreground/70 mt-0.5 truncate">
                  {categories.join(', ')}{favorites.length > 3 ? '…' : ''}
                </p>
              )}
            </>
          ) : (
            <p className="text-xs text-muted-foreground mt-0.5">
              Ta collection personnelle
            </p>
          )}
        </div>

        <ChevronRight className="h-5 w-5 text-muted-foreground/50 shrink-0" />
      </div>

      {favorites.length === 0 && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-primary font-medium">
          <Sparkles className="h-3.5 w-3.5" />
          Sauvegarde des invocations depuis la page Douas
        </div>
      )}
    </motion.button>
  );
}
