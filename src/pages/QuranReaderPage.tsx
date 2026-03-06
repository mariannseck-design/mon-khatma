import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
import { ArrowLeft, BookOpen, List, Type, Image as ImageIcon } from 'lucide-react';
import { getSurahByPage } from '@/lib/surahData';
import { Slider } from '@/components/ui/slider';
import SurahDrawer from '@/components/quran/SurahDrawer';
import QuranTextView from '@/components/quran/QuranTextView';

const TOTAL_PAGES = 604;
const IMAGE_BASE = 'https://cdn.islamic.network/quran/images/page';

function getPageUrl(page: number) {
  return `${IMAGE_BASE}/${page}.png`;
}

export default function QuranReaderPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(() => {
    const saved = localStorage.getItem('quran_reader_page');
    return saved ? Math.min(Math.max(parseInt(saved), 1), TOTAL_PAGES) : 1;
  });
  const [direction, setDirection] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [showSurahDrawer, setShowSurahDrawer] = useState(false);
  const [textMode, setTextMode] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const imageTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const controlsTimer = useRef<ReturnType<typeof setTimeout>>();
  const containerRef = useRef<HTMLDivElement>(null);

  const surah = getSurahByPage(page);
  const juz = Math.ceil(page / 20);

  // Save page to localStorage
  useEffect(() => {
    localStorage.setItem('quran_reader_page', page.toString());
  }, [page]);

  // Preload adjacent pages
  useEffect(() => {
    if (textMode) return;
    [page - 1, page + 1, page - 2, page + 2].forEach(p => {
      if (p >= 1 && p <= TOTAL_PAGES) {
        const img = new window.Image();
        img.src = getPageUrl(p);
      }
    });
  }, [page, textMode]);

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

  // RTL navigation: swipe left = next page (higher number), swipe right = previous
  const goNext = useCallback(() => {
    if (page < TOTAL_PAGES) {
      setDirection(1);
      setImageLoaded(false);
      setPage(p => Math.min(p + 1, TOTAL_PAGES));
    }
  }, [page]);

  const goPrev = useCallback(() => {
    if (page > 1) {
      setDirection(-1);
      setImageLoaded(false);
      setPage(p => Math.max(p - 1, 1));
    }
  }, [page]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const threshold = 50;
    // RTL: swipe left (negative offset) = go to next page
    if (info.offset.x < -threshold) {
      goNext();
    } else if (info.offset.x > threshold) {
      goPrev();
    }
  };

  const handleTap = () => {
    resetControlsTimer();
  };

  const goToPage = (p: number) => {
    setDirection(p > page ? 1 : -1);
    setImageLoaded(false);
    setPage(Math.min(Math.max(p, 1), TOTAL_PAGES));
  };

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goNext();
      if (e.key === 'ArrowRight') goPrev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goNext, goPrev]);

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-[#f5f0e8] dark:bg-[#1a1612] flex flex-col z-50"
      onClick={handleTap}
    >
      {/* Top Bar */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute top-0 left-0 right-0 z-30 bg-gradient-to-b from-black/50 to-transparent px-4 pt-3 pb-10"
          >
            <div className="flex items-center justify-between">
              <button
                onClick={(e) => { e.stopPropagation(); navigate(-1); }}
                className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
              >
                <ArrowLeft className="h-5 w-5 text-white" />
              </button>

              <div className="text-center">
                <p className="text-white font-display text-sm font-semibold">
                  {surah ? `${surah.number}. ${surah.name}` : ''}
                </p>
                <p className="text-white/70 text-xs">
                  Page {page} · Juz {juz}
                </p>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setTextMode(m => {
                    if (m) {
                      // Switching to image mode — start timeout
                      setImageError(false);
                      setImageLoaded(false);
                      if (imageTimeoutRef.current) clearTimeout(imageTimeoutRef.current);
                      imageTimeoutRef.current = setTimeout(() => {
                        setTextMode(true);
                        setImageError(true);
                      }, 10000);
                    }
                    return !m;
                  });
                }}
                className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
              >
                {textMode ? <ImageIcon className="h-5 w-5 text-white" /> : <Type className="h-5 w-5 text-white" />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 relative overflow-hidden">
        {textMode ? (
          <QuranTextView page={page} />
        ) : (
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={page}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.15}
              onDragEnd={handleDragEnd}
              className="absolute inset-0 flex items-center justify-center"
              style={{ touchAction: 'pinch-zoom' }}
            >
              {imageError ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-8 text-center">
                  <p className="text-muted-foreground text-lg">Images indisponibles</p>
                  <button
                    onClick={(e) => { e.stopPropagation(); setTextMode(true); }}
                    className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
                  >
                    Basculer en mode texte
                  </button>
                </div>
              ) : (
                <>
                  {!imageLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                  <img
                    src={getPageUrl(page)}
                    alt={`Page ${page} du Mushaf`}
                    className="max-h-full max-w-full object-contain select-none"
                    draggable={false}
                    onLoad={() => {
                      setImageLoaded(true);
                      if (imageTimeoutRef.current) clearTimeout(imageTimeoutRef.current);
                    }}
                    onError={() => {
                      setImageError(true);
                      if (imageTimeoutRef.current) clearTimeout(imageTimeoutRef.current);
                      setTimeout(() => setTextMode(true), 2000);
                    }}
                    style={{ opacity: imageLoaded ? 1 : 0, transition: 'opacity 0.2s' }}
                  />
                </>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Bottom Bar */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black/50 to-transparent px-4 pb-6 pt-10"
          >
            <div className="flex items-center gap-3">
              <button
                onClick={(e) => { e.stopPropagation(); setShowSurahDrawer(true); }}
                className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0"
              >
                <List className="h-5 w-5 text-white" />
              </button>

              <div className="flex-1 flex items-center gap-3" dir="ltr">
                <span className="text-white/80 text-xs font-mono w-7 text-right">1</span>
                <Slider
                  value={[page]}
                  min={1}
                  max={TOTAL_PAGES}
                  step={1}
                  onValueChange={([v]) => goToPage(v)}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1"
                />
                <span className="text-white/80 text-xs font-mono w-10">604</span>
              </div>

              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Surah Drawer */}
      <SurahDrawer
        open={showSurahDrawer}
        onOpenChange={setShowSurahDrawer}
        onSelectPage={goToPage}
        currentPage={page}
      />
    </div>
  );
}
