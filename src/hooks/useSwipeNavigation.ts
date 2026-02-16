import { useRef, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const SWIPE_PAGES = ['/accueil', '/ramadan', '/favoris', '/emotions', '/rappels'];
const SWIPE_THRESHOLD = 50;

export function useSwipeNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const [swiping, setSwiping] = useState(false);

  const currentIndex = SWIPE_PAGES.indexOf(location.pathname);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    setSwiping(true);
  }, []);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!swiping || currentIndex === -1) return;
    setSwiping(false);

    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;

    // Only trigger if horizontal swipe is dominant
    if (Math.abs(deltaX) < SWIPE_THRESHOLD || Math.abs(deltaY) > Math.abs(deltaX)) return;

    if (deltaX < 0 && currentIndex < SWIPE_PAGES.length - 1) {
      // Swipe left → next page
      navigate(SWIPE_PAGES[currentIndex + 1]);
    } else if (deltaX > 0 && currentIndex > 0) {
      // Swipe right → previous page
      navigate(SWIPE_PAGES[currentIndex - 1]);
    }
  }, [swiping, currentIndex, navigate]);

  return { onTouchStart, onTouchEnd, isSwipeable: currentIndex !== -1 };
}
