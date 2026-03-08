import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Bookmark, BookmarkCheck, Play, Pause, Loader2, Settings, WifiOff } from 'lucide-react';
import { toast } from 'sonner';
import { getSurahByPage } from '@/lib/surahData';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import SurahDrawer from '@/components/quran/SurahDrawer';
import QuranTextView from '@/components/quran/QuranTextView';
import ImageVerseOverlay from '@/components/quran/ImageVerseOverlay';
import VerseTranslationDrawer from '@/components/quran/VerseTranslationDrawer';
import ReaderSettingsPanel from '@/components/quran/ReaderSettingsPanel';
import type { VerseLineInfo } from '@/components/quran/ImageVerseOverlay';
import { useQuranAudio, RECITERS } from '@/hooks/useQuranAudio';

const TOTAL_PAGES = 604;

const IMAGE_SOURCES = [
  (p: number) => `https://cdn.jsdelivr.net/gh/QuranHub/quran-pages-images@main/easyquran.com/hafs-tajweed/${p}.jpg`,
  (p: number) => `https://raw.githubusercontent.com/QuranHub/quran-pages-images/main/easyquran.com/hafs-tajweed/${p}.jpg`,
  (p: number) => `https://cdn.statically.io/gh/QuranHub/quran-pages-images/main/easyquran.com/hafs-tajweed/${p}.jpg`,
];

export default function QuranReaderPage() {
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();
  const [page, setPage] = useState(() => {
    const saved = localStorage.getItem('quran_reader_page');
    return saved ? Math.min(Math.max(parseInt(saved), 1), TOTAL_PAGES) : 1;
  });
  const [direction, setDirection] = useState(0);
  const [showSurahDrawer, setShowSurahDrawer] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [sourceIndex, setSourceIndex] = useState(0);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const pinchRef = useRef<{ dist: number; scale: number } | null>(null);
  const panRef = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);
  const preferredSourceRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const containerRef = useRef<HTMLDivElement>(null);
  const retriesRef = useRef(0);

  // Text mode now uses local bundled data — no network dependency
  const [viewMode, setViewMode] = useState<'image' | 'text'>('image');
  const textModeDisabled = false;

  const [tajweedEnabled, setTajweedEnabled] = useState(() => {
    return localStorage.getItem('quran_tajweed') !== 'false';
  });

  // Welcome message for first-time users
  const [showIntro, setShowIntro] = useState(() => {
    return !localStorage.getItem('quran_reader_intro_seen');
  });
  const dismissIntro = () => {
    setShowIntro(false);
    localStorage.setItem('quran_reader_intro_seen', 'true');
  };

  // Exit prompt — ask to bookmark before leaving
  const [showExitPrompt, setShowExitPrompt] = useState(false);

  const handleTajweedChange = (enabled: boolean) => {
    setTajweedEnabled(enabled);
    localStorage.setItem('quran_tajweed', String(enabled));
  };

  const [translationEnabled, setTranslationEnabled] = useState(() => {
    return localStorage.getItem('quran_translation') === 'true';
  });
  const [translationEdition, setTranslationEdition] = useState(() => {
    return localStorage.getItem('quran_translation_edition') || 'fr.hamidullah';
  });
  const handleTranslationChange = (enabled: boolean) => {
    setTranslationEnabled(enabled);
    localStorage.setItem('quran_translation', String(enabled));
  };
  const handleTranslationEditionChange = (edition: string) => {
    setTranslationEdition(edition);
    localStorage.setItem('quran_translation_edition', edition);
  };

  // Force text mode when offline
  useEffect(() => {
    if (!isOnline && viewMode === 'image') {
      setViewMode('text');
    }
  }, [isOnline, viewMode]);
  const [nightMode, setNightMode] = useState(() => {
    return localStorage.getItem('quran_night_mode') === 'true';
  });

  const handleNightModeChange = (on: boolean) => {
    setNightMode(on);
    localStorage.setItem('quran_night_mode', String(on));
  };

  const TEXT_SIZES = [
    { label: 'Petit', value: 16 },
    { label: 'Moyen', value: 22 },
    { label: 'Grand', value: 28 },
    { label: 'Très Grand', value: 36 },
    { label: 'Grand', value: 34 },
  ] as const;
  const [textSizeIndex, setTextSizeIndex] = useState(() => {
    const saved = localStorage.getItem('quran_text_size_index');
    return saved ? parseInt(saved) : 1; // default: Moyen
  });
  useEffect(() => { localStorage.setItem('quran_text_size_index', textSizeIndex.toString()); }, [textSizeIndex]);

  useEffect(() => { localStorage.setItem('quran_view_mode', viewMode); }, [viewMode]);

  const [bookmark, setBookmark] = useState<number | null>(() => {
    const saved = localStorage.getItem('quran_bookmark');
    return saved ? parseInt(saved) : null;
  });
  const [pageInput, setPageInput] = useState(page.toString());
  
  const [selectedVerse, setSelectedVerse] = useState<string | null>(null);
  const [pageVerses, setPageVerses] = useState<VerseLineInfo[]>([]);
  const [audioStartVerse, setAudioStartVerse] = useState<number | undefined>();
  const [audioEndVerse, setAudioEndVerse] = useState<number | undefined>(); 

  // Audio
  const goNextAuto = useCallback(() => {
    if (page < TOTAL_PAGES) { setDirection(1); setPage(p => Math.min(p + 1, TOTAL_PAGES)); }
  }, [page]);
  const { isPlaying, currentAyahNumber, loading: audioLoading, reciter, setReciter, togglePlay } = useQuranAudio(page, goNextAuto, audioStartVerse, audioEndVerse);

  const getPageUrl = useCallback((p: number, srcIdx?: number) => {
    const idx = srcIdx ?? preferredSourceRef.current;
    return IMAGE_SOURCES[idx](p);
  }, []);

  useEffect(() => {
    setImageLoaded(false);
    setSourceIndex(preferredSourceRef.current);
    retriesRef.current = 0;
    setScale(1);
    setTranslate({ x: 0, y: 0 });
    setSelectedVerse(null);
    setPageVerses([]);
    setAudioStartVerse(undefined);
    setAudioEndVerse(undefined);
  }, [page]);

  useEffect(() => {
    if (viewMode === 'text') return;
    if (imageLoaded) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      return;
    }
    timeoutRef.current = setTimeout(() => { tryNextSource(); }, 8000);
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [imageLoaded, sourceIndex, page, viewMode]);

  const tryNextSource = useCallback(() => {
    retriesRef.current += 1;
    if (retriesRef.current >= IMAGE_SOURCES.length * 2) {
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

  const handleImageError = useCallback(() => { tryNextSource(); }, [tryNextSource]);

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

  const surah = getSurahByPage(page);
  const juz = Math.ceil(page / 20);

  useEffect(() => { localStorage.setItem('quran_reader_page', page.toString()); setPageInput(page.toString()); }, [page]);

  // Preload adjacent pages (image mode)
  useEffect(() => {
    if (viewMode !== 'image') return;
    [page - 1, page + 1].forEach(p => {
      if (p >= 1 && p <= TOTAL_PAGES) {
        const img = new window.Image();
        img.src = getPageUrl(p);
      }
    });
  }, [page, getPageUrl, viewMode]);

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
    if (e.touches.length === 2 && viewMode === 'image') {
      pinchRef.current = { dist: getDistance(e.touches[0], e.touches[1]), scale };
      panRef.current = null;
      touchStartRef.current = null;
    } else if (e.touches.length === 1 && scale > 1 && viewMode === 'image') {
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
    if (pinchRef.current) { pinchRef.current = null; return; }
    if (panRef.current) { panRef.current = null; return; }
    if (!touchStartRef.current) return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    touchStartRef.current = null;
    if (scale > 1) return;
    if (Math.abs(dx) < 50 || Math.abs(dy) > Math.abs(dx)) return;
    if (dx > 0) goNext();
    else goPrev();
  };

  // Double-tap to zoom (image mode)
  const lastTapRef = useRef(0);
  const handleDoubleTap = (e: React.MouseEvent) => {
    if (viewMode === 'text') return; // no zoom in text mode
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      e.stopPropagation();
      if (scale > 1) { setScale(1); setTranslate({ x: 0, y: 0 }); } else { setScale(2.5); }
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

  const bgColor = nightMode ? '#0f1a0f' : '#f7f3eb';
  const contentBg = nightMode ? '#1a2e1a' : '#ffffff';

  // Bottom bar height
  const BOTTOM_BAR_H = 44;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 flex flex-col z-50"
      style={{ background: bgColor }}
    >
      {/* Offline banner */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative z-30 flex items-center justify-center gap-2 py-1.5 text-xs font-medium overflow-hidden"
            style={{ background: 'hsl(35, 80%, 55%)', color: 'hsl(35, 50%, 15%)' }}
          >
            <WifiOff className="h-3 w-3" />
            Mode hors-ligne · Texte uniquement
          </motion.div>
        )}
      </AnimatePresence>

      {/* Night mode filter for image mode */}
      {nightMode && viewMode === 'image' && (
        <div className="absolute inset-0 z-10 pointer-events-none" style={{ background: 'rgba(10, 20, 10, 0.35)', mixBlendMode: 'multiply' }} />
      )}

      {/* Main Content — full screen minus thin bottom bar */}
      <div
        className={`flex-1 relative overflow-hidden flex items-center justify-center ${viewMode === 'image' ? 'touch-none' : ''}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleDoubleTap}
        style={{ background: contentBg, paddingBottom: 0 }}
      >
        {viewMode === 'image' ? (
          <>
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
                {imageLoaded && (
                  <ImageVerseOverlay
                    page={page}
                    scale={scale}
                    selectedVerse={selectedVerse}
                    onVerseSelect={(vk, verses) => {
                      setSelectedVerse(vk);
                      setPageVerses(verses);
                    }}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </>
        ) : (
          <QuranTextView
            page={page}
            highlightAyah={currentAyahNumber}
            fontSize={TEXT_SIZES[textSizeIndex].value}
            darkMode={nightMode}
            tajweedEnabled={tajweedEnabled}
            showTranslation={translationEnabled}
            translationEdition={translationEdition}
          />
        )}
      </div>

      {/* Simplified bottom bar */}
      <div
        className="relative z-30 flex items-center gap-2 px-3"
        style={{
          height: `${BOTTOM_BAR_H}px`,
          background: nightMode
            ? 'linear-gradient(135deg, #3a8a80, #4a9a90)'
            : 'linear-gradient(135deg, #8ed1c4, #a0d9ce)',
          borderTop: `1px solid rgba(212,175,55,0.25)`,
          borderBottom: `1px solid rgba(212,175,55,0.15)`,
        }}
      >
        {/* Back */}
        <button
          onClick={() => {
            // If no bookmark set, ask user if they want to mark this page
            if (bookmark === null) {
              setShowExitPrompt(true);
            } else {
              navigate(-1);
            }
          }}
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ color: nightMode ? '#f0e6c8' : '#1a3a3a' }}
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        {/* Center: Surah name + page */}
        <div className="flex-1 flex items-center justify-center gap-2">
          <span className="text-xs font-medium truncate" style={{ color: nightMode ? '#f0e6c8' : '#1a3a3a', fontFamily: "'Playfair Display', serif" }}>
            {surah ? surah.name : ''}
          </span>
          <span className="text-[10px]" style={{ color: nightMode ? 'rgba(240,230,200,0.5)' : 'rgba(26,58,58,0.4)' }}>·</span>
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
              if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-10 text-center text-xs font-semibold rounded border-0 outline-none"
            style={{
              background: nightMode ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
              color: nightMode ? '#f0e6c8' : '#1a3a3a',
              padding: '2px 0',
            }}
          />
        </div>

        {/* Right: Play, Bookmark, Settings */}
        <div className="flex items-center gap-1">
          {/* Audio play/pause */}
          <button
            onClick={(e) => { e.stopPropagation(); if (isOnline) togglePlay(); }}
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              background: isPlaying ? 'rgba(180,150,60,0.25)' : 'transparent',
              color: nightMode ? '#f0e6c8' : '#1a3a3a',
              opacity: isOnline ? 1 : 0.35,
            }}
          >
            {audioLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : isPlaying ? (
              <Pause className="h-3.5 w-3.5" />
            ) : (
              <Play className="h-3.5 w-3.5 ml-0.5" />
            )}
          </button>

          {/* Bookmark */}
          <button
            onClick={handleBookmark}
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ color: bookmark !== null ? '#d4af37' : (nightMode ? '#f0e6c8' : '#1a3a3a') }}
          >
            {bookmark !== null ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
          </button>

          {/* Settings */}
          <ReaderSettingsPanel
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            nightMode={nightMode}
            onNightModeChange={handleNightModeChange}
            fontSize={TEXT_SIZES[textSizeIndex].value}
            onFontSizeChange={(size) => {
              const idx = TEXT_SIZES.findIndex(t => t.value === size);
              if (idx >= 0) setTextSizeIndex(idx);
            }}
            isPlaying={isPlaying}
            audioLoading={audioLoading}
            onTogglePlay={togglePlay}
            reciter={reciter}
            onReciterChange={setReciter}
            onShowSurahDrawer={() => setShowSurahDrawer(true)}
            textSizeIndex={textSizeIndex}
            textSizes={TEXT_SIZES as unknown as Array<{label: string; value: number}>}
            onTextSizeIndexChange={setTextSizeIndex}
            textModeDisabled={textModeDisabled}
            audioStartVerse={audioStartVerse}
            audioEndVerse={audioEndVerse}
            onAudioStartVerseChange={setAudioStartVerse}
            onAudioEndVerseChange={setAudioEndVerse}
            isOffline={!isOnline}
            tajweedEnabled={tajweedEnabled}
            onTajweedChange={handleTajweedChange}
            translationEnabled={translationEnabled}
            onTranslationChange={handleTranslationChange}
            translationEdition={translationEdition}
            onTranslationEditionChange={handleTranslationEditionChange}
          />
        </div>
      </div>

      <SurahDrawer
        open={showSurahDrawer}
        onOpenChange={setShowSurahDrawer}
        onSelectPage={goToPage}
        currentPage={page}
      />

      <VerseTranslationDrawer
        verseKey={selectedVerse}
        allVerses={pageVerses}
        onClose={() => setSelectedVerse(null)}
        onNavigate={(vk) => setSelectedVerse(vk)}
      />

      {/* Welcome intro modal — shown once */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center px-6"
            style={{ background: 'rgba(0,0,0,0.5)' }}
            onClick={dismissIntro}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-sm rounded-2xl p-6 text-center"
              style={{
                background: 'linear-gradient(135deg, #f7f3eb, #e8dcc8)',
                border: '1px solid rgba(212,175,55,0.3)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-3xl mb-3">📖</div>
              <h3 className="text-lg font-bold mb-2" style={{ color: '#6b5417', fontFamily: "'Playfair Display', serif" }}>
                Bienvenue
              </h3>
              <p className="text-sm mb-3 leading-relaxed" style={{ color: '#5a4a2a' }}>
                Tu peux lire le Coran en <strong>mode Mushaf</strong> (image) ou en <strong>mode Texte</strong>.
              </p>
              <p className="text-sm mb-3 leading-relaxed" style={{ color: '#5a4a2a' }}>
                Tu peux aussi <strong>marquer ta page</strong> pour la retrouver facilement 🔖
              </p>
              <p className="text-xs mb-5 opacity-70" style={{ color: '#5a4a2a' }}>
                Change de mode et accède aux réglages via ⚙️ en bas de l'écran.
              </p>
              <button
                onClick={dismissIntro}
                className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: 'linear-gradient(135deg, #4a9a9a, #5ab8b8)',
                  color: '#f7f3eb',
                  boxShadow: '0 4px 15px rgba(74,154,154,0.3)',
                }}
              >
                J'ai compris ✨
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exit prompt — ask to bookmark before leaving */}
      <AnimatePresence>
        {showExitPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center px-6"
            style={{ background: 'rgba(0,0,0,0.5)' }}
            onClick={() => { setShowExitPrompt(false); navigate(-1); }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-xs rounded-2xl p-5 text-center"
              style={{
                background: nightMode ? 'linear-gradient(135deg, #1a2e1a, #2a3e2a)' : 'linear-gradient(135deg, #f7f3eb, #e8dcc8)',
                border: '1px solid rgba(212,175,55,0.3)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-2xl mb-2">🔖</div>
              <h3 className="text-base font-bold mb-1" style={{ color: nightMode ? '#d4c9a8' : '#6b5417', fontFamily: "'Playfair Display', serif" }}>
                Marquer cette page ?
              </h3>
              <p className="text-xs mb-4 opacity-70" style={{ color: nightMode ? '#a0996a' : '#5a4a2a' }}>
                Page {page} {surah ? `· ${surah.name}` : ''}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setBookmark(page);
                    localStorage.setItem('quran_bookmark', page.toString());
                    toast(`Marque-page enregistré · Page ${page}`);
                    setShowExitPrompt(false);
                    navigate(-1);
                  }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #4a9a9a, #5ab8b8)',
                    color: '#f7f3eb',
                    boxShadow: '0 4px 15px rgba(74,154,154,0.3)',
                  }}
                >
                  Marquer
                </button>
                <button
                  onClick={() => { setShowExitPrompt(false); navigate(-1); }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
                  style={{
                    background: nightMode ? 'rgba(90,180,180,0.1)' : 'rgba(0,0,0,0.06)',
                    color: nightMode ? '#a0996a' : '#5a4a2a',
                  }}
                >
                  Quitter
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
