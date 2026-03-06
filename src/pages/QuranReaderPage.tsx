import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
import { ArrowLeft, List, Type, Image as ImageIcon, Play, Pause, Loader2, Mic, Repeat, Moon, Sun } from 'lucide-react';
import { getSurahByPage } from '@/lib/surahData';
import { Slider } from '@/components/ui/slider';
import SurahDrawer from '@/components/quran/SurahDrawer';
import QuranTextView from '@/components/quran/QuranTextView';
import { useQuranAudio, RECITERS } from '@/hooks/useQuranAudio';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const TOTAL_PAGES = 604;
const IMAGE_BASE = 'https://cdn.islamic.network/quran/images/page';

const TEXT_SIZES = [
  { label: 'Petit', value: 20 },
  { label: 'Moyen', value: 24 },
  { label: 'Grand', value: 30 },
  { label: 'Très Grand', value: 36 },
];

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

  const [textSize, setTextSize] = useState(() => {
    const saved = localStorage.getItem('quran_text_size');
    return saved ? parseInt(saved) : 24;
  });

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('quran_dark_mode') === 'true';
  });

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

  // Save preferences
  useEffect(() => { localStorage.setItem('quran_autoplay', autoPlay.toString()); }, [autoPlay]);
  useEffect(() => { localStorage.setItem('quran_reader_page', page.toString()); }, [page]);
  useEffect(() => { localStorage.setItem('quran_text_size', textSize.toString()); }, [textSize]);
  useEffect(() => { localStorage.setItem('quran_dark_mode', darkMode.toString()); }, [darkMode]);

  // Theme colors
  const theme = darkMode ? {
    bg: 'linear-gradient(180deg, #1a2e1a 0%, #0f1f0f 100%)',
    barGradientTop: 'linear-gradient(to bottom, rgba(10, 20, 10, 0.85), transparent)',
    barGradientBottom: 'linear-gradient(to top, rgba(10, 20, 10, 0.85), transparent)',
    btnBg: 'rgba(180, 160, 80, 0.2)',
    btnBgActive: 'rgba(180, 160, 80, 0.4)',
    iconColor: '#c9a94e',
    titleColor: '#d4af37',
    subtitleColor: 'rgba(212, 175, 55, 0.7)',
    pageCounter: '#d4af37',
    sliderLabel: 'rgba(212, 175, 55, 0.8)',
    selectBg: 'rgba(180, 160, 80, 0.25)',
    selectBorder: 'rgba(180, 160, 80, 0.4)',
  } : {
    bg: 'linear-gradient(180deg, #f7f3eb 0%, #ede8dc 100%)',
    barGradientTop: 'linear-gradient(to bottom, rgba(42, 58, 37, 0.6), transparent)',
    barGradientBottom: 'linear-gradient(to top, rgba(42, 58, 37, 0.6), transparent)',
    btnBg: 'rgba(122, 139, 111, 0.35)',
    btnBgActive: 'rgba(122, 139, 111, 0.55)',
    iconColor: '#e8e2d0',
    titleColor: '#f0ead9',
    subtitleColor: 'rgba(240, 234, 217, 0.7)',
    pageCounter: '#8fa07e',
    sliderLabel: 'rgba(240, 234, 217, 0.8)',
    selectBg: 'rgba(122, 139, 111, 0.35)',
    selectBorder: 'rgba(122, 139, 111, 0.5)',
  };

  // Preload adjacent pages (image mode)
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
    if (!showReciterSelect) {
      controlsTimer.current = setTimeout(() => setShowControls(false), 4000);
    }
  }, [showReciterSelect]);

  useEffect(() => {
    resetControlsTimer();
    return () => { if (controlsTimer.current) clearTimeout(controlsTimer.current); };
  }, [page, resetControlsTimer, showReciterSelect]);

  // RTL navigation
  const goNext = useCallback(() => {
    if (page < TOTAL_PAGES) { setDirection(1); setImageLoaded(false); setPage(p => Math.min(p + 1, TOTAL_PAGES)); }
  }, [page]);

  const goPrev = useCallback(() => {
    if (page > 1) { setDirection(-1); setImageLoaded(false); setPage(p => Math.max(p - 1, 1)); }
  }, [page]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const threshold = 50;
    if (info.offset.x > threshold) goNext();
    else if (info.offset.x < -threshold) goPrev();
  };

  const handleTap = () => resetControlsTimer();

  const goToPage = (p: number) => {
    setDirection(p > page ? 1 : -1);
    setImageLoaded(false);
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

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 flex flex-col z-50"
      onClick={handleTap}
      style={{ background: theme.bg }}
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

              <div className="flex items-center gap-2">
                {/* Text size selector */}
                {textMode && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                        style={{ background: 'rgba(184, 149, 46, 0.25)', backdropFilter: 'blur(8px)', color: '#f5edd6' }}
                      >
                        Aa
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-40 p-2"
                      align="end"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex flex-col gap-1">
                        {TEXT_SIZES.map((s) => (
                          <button
                            key={s.value}
                            onClick={() => setTextSize(s.value)}
                            className={`text-sm px-3 py-2 rounded-md text-left transition-colors ${
                              textSize === s.value
                                ? 'bg-primary text-primary-foreground font-semibold'
                                : 'hover:bg-muted'
                            }`}
                          >
                            {s.label} ({s.value}px)
                          </button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                )}

                {/* Text/Image toggle */}
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 relative overflow-hidden" style={{ touchAction: 'pan-y' }}>
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
            style={{ touchAction: 'pan-y' }}
          >
            <QuranTextView page={page} highlightAyah={currentAyahNumber} fontSize={textSize} />
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
              style={{ touchAction: 'pan-y' }}
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
                    onLoad={() => { setImageLoaded(true); if (imageTimeoutRef.current) clearTimeout(imageTimeoutRef.current); }}
                    onError={() => { setImageError(true); if (imageTimeoutRef.current) clearTimeout(imageTimeoutRef.current); setTimeout(() => setTextMode(true), 2000); }}
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
              {showReciterSelect && (
                <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
                  <Select value={reciter} onValueChange={(v) => { setReciter(v); setShowReciterSelect(false); }}>
                    <SelectTrigger className="w-56 backdrop-blur-sm text-xs h-8" style={{ background: 'rgba(184, 149, 46, 0.3)', borderColor: 'rgba(184, 149, 46, 0.4)', color: '#f5edd6' }}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RECITERS.map((r) => (
                        <SelectItem key={r.id} value={r.id} className="text-sm">{r.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => { e.stopPropagation(); setShowSurahDrawer(true); }}
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(184, 149, 46, 0.25)', backdropFilter: 'blur(8px)' }}
                >
                  <List className="h-5 w-5" style={{ color: '#f5edd6' }} />
                </button>

                <div className="flex-1 flex flex-col gap-1">
                  <div className="text-center">
                    <span className="text-xs font-semibold" style={{ color: '#d4af37', fontFamily: "'Playfair Display', serif" }}>
                      Page {page} / {TOTAL_PAGES}
                    </span>
                  </div>
                  <div className="flex items-center gap-3" dir="ltr">
                    <span className="text-xs font-mono w-7 text-right" style={{ color: 'rgba(245, 237, 214, 0.8)' }}>1</span>
                    <Slider
                      value={[page]}
                      min={1}
                      max={TOTAL_PAGES}
                      step={1}
                      onValueChange={([v]) => goToPage(v)}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1"
                    />
                    <span className="text-xs font-mono w-10" style={{ color: 'rgba(245, 237, 214, 0.8)' }}>604</span>
                  </div>
                </div>

                <button
                  onClick={(e) => { e.stopPropagation(); setAutoPlay(a => !a); }}
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: autoPlay ? 'rgba(184, 149, 46, 0.45)' : 'rgba(184, 149, 46, 0.25)', backdropFilter: 'blur(8px)' }}
                  title={autoPlay ? 'Lecture auto activée' : 'Lecture auto désactivée'}
                >
                  <Repeat className="h-5 w-5" style={{ color: autoPlay ? '#d4af37' : '#f5edd6' }} />
                </button>

                <button
                  onClick={(e) => { e.stopPropagation(); setShowReciterSelect(s => !s); }}
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(184, 149, 46, 0.25)', backdropFilter: 'blur(8px)' }}
                >
                  <Mic className="h-5 w-5" style={{ color: '#f5edd6' }} />
                </button>

                <button
                  onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(184, 149, 46, 0.25)', backdropFilter: 'blur(8px)' }}
                >
                  {audioLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" style={{ color: '#f5edd6' }} />
                  ) : isPlaying ? (
                    <Pause className="h-5 w-5" style={{ color: '#f5edd6' }} />
                  ) : (
                    <Play className="h-5 w-5" style={{ color: '#f5edd6' }} />
                  )}
                </button>
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
