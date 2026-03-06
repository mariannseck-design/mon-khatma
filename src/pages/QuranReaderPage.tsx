import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, List, Bookmark, BookmarkCheck } from 'lucide-react';
import { toast } from 'sonner';
import { getSurahByPage } from '@/lib/surahData';
import SurahDrawer from '@/components/quran/SurahDrawer';

const TOTAL_PAGES = 604;

const IMAGE_SOURCES = [
  (p: number) => `https://cdn.jsdelivr.net/gh/QuranHub/quran-pages-images@main/easyquran.com/hafs-tajweed/${p}.jpg`,
  (p: number) => `https://raw.githubusercontent.com/QuranHub/quran-pages-images/main/easyquran.com/hafs-tajweed/${p}.jpg`,
  (p: number) => `https://cdn.statically.io/gh/QuranHub/quran-pages-images/main/easyquran.com/hafs-tajweed/${p}.jpg`,
];

export default function QuranReaderPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(() => {
    const saved = localStorage.getItem('quran_reader_page');
    return saved ? Math.min(Math.max(parseInt(saved), 1), TOTAL_PAGES) : 1;
  });
  const [direction, setDirection] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [showSurahDrawer, setShowSurahDrawer] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [sourceIndex, setSourceIndex] = useState(0);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const pinchRef = useRef<{ dist: number; scale: number } | null>(null);
  const panRef = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);
  const preferredSourceRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const controlsTimer = useRef<ReturnType<typeof setTimeout>>();
  const containerRef = useRef<HTMLDivElement>(null);
  const retriesRef = useRef(0);

  const [bookmark, setBookmark] = useState<number | null>(() => {
    const saved = localStorage.getItem('quran_bookmark');
    return saved ? parseInt(saved) : null;
  });
  const [pageInput, setPageInput] = useState(page.toString());

  const getPageUrl = useCallback((p: number, srcIdx?: number) => {
    const idx = srcIdx ?? preferredSourceRef.current;
    return IMAGE_SOURCES[idx](p);
  }, []);

  // Reset source index and zoom when page changes
  useEffect(() => {
    setImageLoaded(false);
    setSourceIndex(preferredSourceRef.current);
    retriesRef.current = 0;
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  }, [page]);

  // Timeout: if image hangs, try next source
  useEffect(() => {
    if (imageLoaded) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      return;
    }
    timeoutRef.current = setTimeout(() => {
      tryNextSource();
    }, 8000);
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [imageLoaded, sourceIndex, page]);

  const tryNextSource = useCallback(() => {
    retriesRef.current += 1;
    if (retriesRef.current >= IMAGE_SOURCES.length * 2) {
      // Silent retry loop — restart from preferred
      retriesRef.current = 0;
      setSourceIndex(preferredSourceRef.current);
      return;
    }
    setSourceIndex(prev => (prev + 1) % IMAGE_SOURCES.length);
  }, []);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
    preferredSourceRef.current = sourceIndex;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, [sourceIndex]);

  const handleImageError = useCallback(() => {
    tryNextSource();
  }, [tryNextSource]);

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (bookmark === page) {
      setBookmark(null);
      localStorage.removeItem('quran_bookmark');
      toast('Marque-page retiré');
    } else if (bookmark !== null && bookmark !== page) {
      goToPage(bookmark);
      toast(`Retour au marque-page · Page ${bookmark}`);
    } else {
      setBookmark(page);
      localStorage.setItem('quran_bookmark', page.toString());
      const s = getSurahByPage(page);
      toast(`Marque-page enregistré · Page ${page}${s ? ` · ${s.name}` : ''}`);
    }
  };

  const handleBookmarkLongPress = (e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmark(page);
    localStorage.setItem('quran_bookmark', page.toString());
    const s = getSurahByPage(page);
    toast(`Marque-page enregistré · Page ${page}${s ? ` · ${s.name}` : ''}`);
  };

  const surah = getSurahByPage(page);
  const juz = Math.ceil(page / 20);

  useEffect(() => { localStorage.setItem('quran_reader_page', page.toString()); setPageInput(page.toString()); }, [page]);

  // Preload adjacent pages
  useEffect(() => {
    [page - 1, page + 1, page - 2, page + 2].forEach(p => {
      if (p >= 1 && p <= TOTAL_PAGES) {
        const img = new window.Image();
        img.src = getPageUrl(p);
      }
    });
  }, [page, getPageUrl]);

  // Auto-hide controls
  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (controlsTimer.current) clearTimeout(controlsTimer.current);
    controlsTimer.current = setTimeout(() => setShowControls(false), 4000);
  }, []);

  useEffect(() => {
    resetControlsTimer();
    return () => { if (controlsTimer.current) clearTimeout(controlsTimer.current); };
  }, [page, resetControlsTimer]);

  // Navigation
  const goNext = useCallback(() => {
    if (page < TOTAL_PAGES) { setDirection(1); setPage(p => Math.min(p + 1, TOTAL_PAGES)); }
  }, [page]);

  const goPrev = useCallback(() => {
    if (page > 1) { setDirection(-1); setPage(p => Math.max(p - 1, 1)); }
  }, [page]);

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const getDistance = (t1: React.Touch, t2: React.Touch) =>
    Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch start
      pinchRef.current = { dist: getDistance(e.touches[0], e.touches[1]), scale };
      panRef.current = null;
      touchStartRef.current = null;
    } else if (e.touches.length === 1 && scale > 1) {
      // Pan start when zoomed
      panRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, tx: translate.x, ty: translate.y };
      touchStartRef.current = null;
    } else if (e.touches.length === 1) {
      touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchRef.current) {
      e.preventDefault();
      const newDist = getDistance(e.touches[0], e.touches[1]);
      const newScale = Math.min(Math.max(pinchRef.current.scale * (newDist / pinchRef.current.dist), 1), 4);
      setScale(newScale);
      if (newScale === 1) setTranslate({ x: 0, y: 0 });
    } else if (e.touches.length === 1 && panRef.current && scale > 1) {
      const dx = e.touches[0].clientX - panRef.current.x;
      const dy = e.touches[0].clientY - panRef.current.y;
      setTranslate({ x: panRef.current.tx + dx, y: panRef.current.ty + dy });
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (pinchRef.current) {
      pinchRef.current = null;
      return;
    }
    if (panRef.current) {
      panRef.current = null;
      return;
    }
    if (!touchStartRef.current) return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    touchStartRef.current = null;
    if (scale > 1) return; // No swipe nav when zoomed
    if (Math.abs(dx) < 50 || Math.abs(dy) > Math.abs(dx)) return;
    if (dx > 0) goNext();
    else goPrev();
  };

  // Double-tap to zoom
  const lastTapRef = useRef(0);
  const handleDoubleTap = (e: React.MouseEvent) => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      e.stopPropagation();
      if (scale > 1) {
        setScale(1);
        setTranslate({ x: 0, y: 0 });
      } else {
        setScale(2.5);
      }
    }
    lastTapRef.current = now;
  };

  const goToPage = (p: number) => {
    setDirection(p > page ? 1 : -1);
    setPage(Math.min(Math.max(p, 1), TOTAL_PAGES));
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goNext();
      if (e.key === 'ArrowRight') goPrev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goNext, goPrev]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 flex flex-col z-50"
      onClick={() => resetControlsTimer()}
      style={{ background: '#f7f3eb' }}
    >
      {/* Top Bar */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute top-0 left-0 right-0 z-30 px-4 pt-3 pb-10"
            style={{ background: 'linear-gradient(to bottom, rgba(42, 58, 37, 0.6), transparent)' }}
          >
            <div className="flex items-center justify-between">
              <button
                onClick={(e) => { e.stopPropagation(); navigate(-1); }}
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(122, 139, 111, 0.35)', backdropFilter: 'blur(8px)' }}
              >
                <ArrowLeft className="h-5 w-5" style={{ color: '#e8e2d0' }} />
              </button>

              <div className="text-center">
                <p className="font-semibold text-sm" style={{ fontFamily: "'Playfair Display', serif", color: '#f0ead9' }}>
                  {surah ? `${surah.number}. ${surah.name}` : ''}
                </p>
                <p className="text-xs" style={{ color: 'rgba(240, 234, 217, 0.7)' }}>
                  Page {page} · Juz {juz}
                </p>
              </div>

              <div className="w-10" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div
        className="flex-1 relative overflow-hidden flex items-center justify-center touch-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleDoubleTap}
        style={{ background: '#ffffff' }}
      >
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div
            key={page}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: '#7a8b6f', borderTopColor: 'transparent' }} />
              </div>
            )}
            <img
              key={`${page}-${sourceIndex}`}
              src={getPageUrl(page, sourceIndex)}
              alt={`Page ${page} du Mushaf`}
              className="max-h-full max-w-full object-contain select-none"
              draggable={false}
              referrerPolicy="no-referrer"
              onLoad={handleImageLoad}
              onError={handleImageError}
              style={{
                opacity: imageLoaded ? 1 : 0,
                transform: `scale(${scale}) translate(${translate.x / scale}px, ${translate.y / scale}px)`,
                transition: pinchRef.current || panRef.current ? 'none' : 'opacity 0.2s, transform 0.2s',
              }}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Bar */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute bottom-0 left-0 right-0 z-30 px-4 pb-6 pt-10"
            style={{ background: 'linear-gradient(to top, rgba(42, 58, 37, 0.6), transparent)' }}
          >
            <div className="flex items-center gap-3">
              <button
                onClick={(e) => { e.stopPropagation(); setShowSurahDrawer(true); }}
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(122, 139, 111, 0.35)', backdropFilter: 'blur(8px)' }}
              >
                <List className="h-5 w-5" style={{ color: '#e8e2d0' }} />
              </button>

              <button
                onClick={handleBookmark}
                onContextMenu={(e) => { e.preventDefault(); handleBookmarkLongPress(e); }}
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: bookmark !== null ? 'rgba(122, 139, 111, 0.55)' : 'rgba(122, 139, 111, 0.35)', backdropFilter: 'blur(8px)' }}
                title={bookmark !== null ? `Marque-page : page ${bookmark}` : 'Ajouter un marque-page'}
              >
                {bookmark !== null ? (
                  <BookmarkCheck className="h-5 w-5" style={{ color: '#8fa07e' }} />
                ) : (
                  <Bookmark className="h-5 w-5" style={{ color: '#e8e2d0' }} />
                )}
              </button>

              <div className="flex-1 flex items-center justify-center gap-2">
                <span className="text-xs" style={{ color: 'rgba(240, 234, 217, 0.7)' }}>Page</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={TOTAL_PAGES}
                  value={pageInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPageInput(val);
                    const v = parseInt(val);
                    if (!isNaN(v) && v >= 1 && v <= TOTAL_PAGES) {
                      goToPage(v);
                    }
                  }}
                  onFocus={(e) => e.target.select()}
                  onBlur={() => {
                    const v = parseInt(pageInput);
                    if (isNaN(v) || v < 1 || v > TOTAL_PAGES) {
                      setPageInput(page.toString());
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      (e.target as HTMLInputElement).blur();
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-14 text-center text-sm font-semibold rounded-lg border-0 outline-none"
                  style={{
                    background: 'rgba(255,255,255,0.15)',
                    color: '#f0ead9',
                    backdropFilter: 'blur(4px)',
                    padding: '4px 2px',
                  }}
                />
                <span className="text-xs" style={{ color: 'rgba(240, 234, 217, 0.7)' }}>/ {TOTAL_PAGES}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SurahDrawer
        open={showSurahDrawer}
        onOpenChange={setShowSurahDrawer}
        onSelectPage={goToPage}
        currentPage={page}
      />
    </div>
  );
}
