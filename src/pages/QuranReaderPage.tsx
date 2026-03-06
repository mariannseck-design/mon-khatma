import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
import { ArrowLeft, BookOpen, List, Type, Image as ImageIcon, Play, Pause, Loader2, Mic, Repeat } from 'lucide-react';
import { getSurahByPage } from '@/lib/surahData';
import { Slider } from '@/components/ui/slider';
import SurahDrawer from '@/components/quran/SurahDrawer';
import QuranTextView from '@/components/quran/QuranTextView';
import { useQuranAudio, RECITERS } from '@/hooks/useQuranAudio';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  const [showReciterSelect, setShowReciterSelect] = useState(false);
  const [autoPlay, setAutoPlay] = useState(() => {
    return localStorage.getItem('quran_autoplay') === 'true';
  });

  const handlePageFinished = useCallback(() => {
    if (autoPlay && page < TOTAL_PAGES) {
      setDirection(1);
      setImageLoaded(false);
      setPage(p => Math.min(p + 1, TOTAL_PAGES));
    }
  }, [autoPlay, page]);

  const {
    isPlaying,
    currentAyahNumber,
    loading: audioLoading,
    reciter,
    setReciter,
    togglePlay,
    stop: stopAudio,
  } = useQuranAudio(page, handlePageFinished);

  // Save autoplay preference
  useEffect(() => {
    localStorage.setItem('quran_autoplay', autoPlay.toString());
  }, [autoPlay]);

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

  // Auto-hide controls (pause when reciter select is open)
  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (controlsTimer.current) clearTimeout(controlsTimer.current);
    if (!showReciterSelect) {
      controlsTimer.current = setTimeout(() => setShowControls(false), 4000);
    }
  }, [showReciterSelect]);

  useEffect(() => {
    resetControlsTimer();
    return () => { if (controlsTimer.current) clearTimeout(controlsTimer.current); };
  }, [page, resetControlsTimer, showReciterSelect]);

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
      className="fixed inset-0 flex flex-col z-50"
      onClick={handleTap}
      style={{ background: 'linear-gradient(180deg, #f5edd6 0%, #efe6d0 40%, #e8dcc4 100%)' }}
    >
      {/* Persistent Title */}
      <div className="relative z-20 pt-safe text-center py-3">
        <h1
          className="text-lg tracking-[0.15em] uppercase"
          style={{
            fontFamily: "'Playfair Display', 'Georgia', serif",
            color: '#b8952e',
            fontWeight: 600,
            textShadow: '0 1px 2px rgba(184, 149, 46, 0.15)',
          }}
        >
          Lis le Noble Coran
        </h1>
      </div>

      {/* Top Bar */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute top-10 left-0 right-0 z-30 px-4 pt-2 pb-8"
            style={{ background: 'linear-gradient(to bottom, rgba(62, 50, 28, 0.55), transparent)' }}
          >
            <div className="flex items-center justify-between">
              <button
                onClick={(e) => { e.stopPropagation(); navigate(-1); }}
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(184, 149, 46, 0.25)', backdropFilter: 'blur(8px)' }}
              >
                <ArrowLeft className="h-5 w-5" style={{ color: '#f5edd6' }} />
              </button>

              <div className="text-center">
                <p className="font-semibold text-sm" style={{ fontFamily: "'Playfair Display', serif", color: '#f5edd6' }}>
                  {surah ? `${surah.number}. ${surah.name}` : ''}
                </p>
                <p className="text-xs" style={{ color: 'rgba(245, 237, 214, 0.7)' }}>
                  Page {page} · Juz {juz}
                </p>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setTextMode(m => {
                    if (m) {
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
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(184, 149, 46, 0.25)', backdropFilter: 'blur(8px)' }}
              >
                {textMode ? <ImageIcon className="h-5 w-5" style={{ color: '#f5edd6' }} /> : <Type className="h-5 w-5" style={{ color: '#f5edd6' }} />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 relative overflow-hidden">
        {textMode ? (
          <motion.div
            key={`text-${page}`}
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
            className="h-full"
            style={{ touchAction: 'pan-y pinch-zoom' }}
          >
            <QuranTextView page={page} highlightAyah={currentAyahNumber} />
          </motion.div>
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
            className="absolute bottom-0 left-0 right-0 z-30 px-4 pb-6 pt-10"
            style={{ background: 'linear-gradient(to top, rgba(62, 50, 28, 0.55), transparent)' }}
          >
            <div className="flex flex-col gap-3">
              {/* Reciter selector - shown when toggled */}
              {showReciterSelect && (
                <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
                  <Select value={reciter} onValueChange={(v) => { setReciter(v); setShowReciterSelect(false); }}>
                    <SelectTrigger className="w-56 bg-white/20 backdrop-blur-sm border-white/30 text-white text-xs h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RECITERS.map((r) => (
                        <SelectItem key={r.id} value={r.id} className="text-sm">
                          {r.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

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

                {/* Auto-play toggle */}
                <button
                  onClick={(e) => { e.stopPropagation(); setAutoPlay(a => !a); }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${autoPlay ? 'bg-white/40 backdrop-blur-sm' : 'bg-white/20 backdrop-blur-sm'}`}
                  title={autoPlay ? 'Lecture auto activée' : 'Lecture auto désactivée'}
                >
                  <Repeat className={`h-5 w-5 ${autoPlay ? 'text-green-300' : 'text-white'}`} />
                </button>

                {/* Reciter button */}
                <button
                  onClick={(e) => { e.stopPropagation(); setShowReciterSelect(s => !s); }}
                  className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0"
                >
                  <Mic className="h-5 w-5 text-white" />
                </button>

                {/* Play/Pause button */}
                <button
                  onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                  className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0"
                >
                  {audioLoading ? (
                    <Loader2 className="h-5 w-5 text-white animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="h-5 w-5 text-white" />
                  ) : (
                    <Play className="h-5 w-5 text-white" />
                  )}
                </button>
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
