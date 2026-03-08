import { useState, useCallback, useEffect } from 'react';
import { type DhikrItem } from '@/components/dhikr/DhikrCounter';

export interface FavoriteDoua {
  id: string; // unique key: categoryId__subthemeId__itemTitle
  categoryTitle: string;
  subthemeTitle: string;
  item: DhikrItem;
  addedAt: number;
}

const STORAGE_KEY = 'doua_favorites';

function loadFavorites(): FavoriteDoua[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveFavorites(favs: FavoriteDoua[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favs));
}

export function makeDouaId(categoryId: string, subthemeId: string, itemTitle: string): string {
  return `${categoryId}__${subthemeId}__${itemTitle}`;
}

export function useDouaFavorites() {
  const [favorites, setFavorites] = useState<FavoriteDoua[]>(loadFavorites);

  useEffect(() => {
    saveFavorites(favorites);
  }, [favorites]);

  const isFavorite = useCallback(
    (id: string) => favorites.some((f) => f.id === id),
    [favorites]
  );

  const toggleFavorite = useCallback(
    (id: string, categoryTitle: string, subthemeTitle: string, item: DhikrItem) => {
      setFavorites((prev) => {
        const exists = prev.some((f) => f.id === id);
        if (exists) {
          return prev.filter((f) => f.id !== id);
        }
        return [...prev, { id, categoryTitle, subthemeTitle, item, addedAt: Date.now() }];
      });
    },
    []
  );

  const removeFavorite = useCallback((id: string) => {
    setFavorites((prev) => prev.filter((f) => f.id !== id));
  }, []);

  return { favorites, isFavorite, toggleFavorite, removeFavorite };
}
