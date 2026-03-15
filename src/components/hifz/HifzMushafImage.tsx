import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw, ChevronDown } from 'lucide-react';
import { getExactVersePage } from '@/lib/quranData';

interface Props {
  surahNumber: number;
  startVerse: number;
  endVerse: number;
  maxHeight?: string;
  fullWidth?: boolean;
}

const IMAGE_SOURCES = [
  (p: number) => `https://cdn.jsdelivr.net/gh/QuranHub/quran-pages-images@main/easyquran.com/hafs-tajweed/${p}.jpg`,
  (p: number) => `https://raw.githubusercontent.com/QuranHub/quran-pages-images/main/easyquran.com/hafs-tajweed/${p}.jpg`,
  (p: number) => `https://cdn.statically.io/gh/QuranHub/quran-pages-images/main/easyquran.com/hafs-tajweed/${p}.jpg`,
];

const MIN_SCALE = 1;
const MAX_SCALE = 3;

export default function HifzMushafImage({ surahNumber, startVerse, endVerse, maxHeight = '320px', fullWidth = false }: Props) {
  const [pages, setPages] = useState<number[]>([]);
  const [currentPageIdx, setCurrentPageIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [imgLoading, setImgLoading] = useState(true);
  const [sourceIdx, setSourceIdx] = useState(0);

  // Zoom & pan state
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [showScrollHint, setShowScrollHint] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastTouchDistRef = useRef<number | null>(null);
  const lastTouchCenterRef = useRef<{ x: number; y: number } | null>(null);
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const lastTapTimeRef = useRef(0);
  const lastTapPosRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const startPage = await getExactVersePage(surahNumber, startVerse);
      const endPage = await getExactVersePage(surahNumber, endVerse);
      const pageList: number[] = [];
      for (let p = startPage; p <= endPage; p++) pageList.push(p);
      setPages(pageList);
      setCurrentPageIdx(0);
      setSourceIdx(0);
      resetZoom();
      setLoading(false);
    };
    load();
  }, [surahNumber, startVerse, endVerse]);

  const resetZoom = useCallback(() => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  }, []);

  const clampTranslate = useCallback((tx: number, ty: number, s: number) => {
    if (s <= 1) return { x: 0, y: 0 };
    const container = containerRef.current;
    if (!container) return { x: tx, y: ty };
    const rect = container.getBoundingClientRect();
    const maxX = (rect.width * (s - 1)) / 2;
    const maxY = (rect.height * (s - 1)) / 2;
    return {
      x: Math.max(-maxX, Math.min(maxX, tx)),
      y: Math.max(-maxY, Math.min(maxY, ty)),
    };
  }, []);

  const getTouchDist = (touches: React.TouchList) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getTouchCenter = (touches: React.TouchList) => ({
    x: (touches[0].clientX + touches[1].clientX) / 2,
    y: (touches[0].clientY + touches[1].clientY) / 2,
  });

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      lastTouchDistRef.current = getTouchDist(e.touches);
      lastTouchCenterRef.current = getTouchCenter(e.touches);
    } else if (e.touches.length === 1) {
      // Store position for double-tap detection
      lastTapPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      if (scale > 1) {
        isPanningRef.current = true;
        panStartRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
          tx: translate.x,
          ty: translate.y,
        };
      }
    }
  }, [scale, translate]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && lastTouchDistRef.current !== null) {
      e.preventDefault();
      const newDist = getTouchDist(e.touches);
      const ratio = newDist / lastTouchDistRef.current;
      const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale * ratio));
      lastTouchDistRef.current = newDist;

      const center = getTouchCenter(e.touches);
      const lastCenter = lastTouchCenterRef.current || center;
      const dx = center.x - lastCenter.x;
      const dy = center.y - lastCenter.y;
      lastTouchCenterRef.current = center;

      const newTranslate = clampTranslate(translate.x + dx, translate.y + dy, newScale);
      setScale(newScale);
      setTranslate(newTranslate);
    } else if (e.touches.length === 1 && isPanningRef.current && scale > 1) {
      const dx = e.touches[0].clientX - panStartRef.current.x;
      const dy = e.touches[0].clientY - panStartRef.current.y;
      const newTranslate = clampTranslate(
        panStartRef.current.tx + dx,
        panStartRef.current.ty + dy,
        scale
      );
      setTranslate(newTranslate);
    }
  }, [scale, translate, clampTranslate]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    // Double-tap detection (single finger only, no pinch)
    if (e.changedTouches.length === 1 && lastTouchDistRef.current === null) {
      const now = Date.now();
      const dt = now - lastTapTimeRef.current;
      if (dt < 300 && lastTapPosRef.current) {
        // Double-tap detected
        e.preventDefault();
        if (scale > 1.05) {
          // Reset zoom
          setScale(1);
          setTranslate({ x: 0, y: 0 });
        } else {
          // Zoom to 2x centered on tap position
          const container = containerRef.current;
          if (container) {
            const rect = container.getBoundingClientRect();
            const tapX = lastTapPosRef.current.x - rect.left - rect.width / 2;
            const tapY = lastTapPosRef.current.y - rect.top - rect.height / 2;
            const newScale = 2;
            const newTranslate = clampTranslate(-tapX, -tapY, newScale);
            setScale(newScale);
            setTranslate(newTranslate);
          } else {
            setScale(2);
          }
        }
        lastTapTimeRef.current = 0;
      } else {
        lastTapTimeRef.current = now;
      }
    }

    lastTouchDistRef.current = null;
    lastTouchCenterRef.current = null;
    isPanningRef.current = false;
    if (scale < 1.05 && !lastTapTimeRef.current) {
      setScale(1);
      setTranslate({ x: 0, y: 0 });
    }
  }, [scale, clampTranslate]);

  const zoomIn = useCallback(() => {
    const newScale = Math.min(MAX_SCALE, scale + 0.5);
    setScale(newScale);
    setTranslate(clampTranslate(translate.x, translate.y, newScale));
  }, [scale, translate, clampTranslate]);

  const zoomOut = useCallback(() => {
    const newScale = Math.max(MIN_SCALE, scale - 0.5);
    setScale(newScale);
    if (newScale <= 1) {
      setTranslate({ x: 0, y: 0 });
    } else {
      setTranslate(clampTranslate(translate.x, translate.y, newScale));
    }
  }, [scale, translate, clampTranslate]);

  if (loading || !pages.length) {
    return loading ? (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: '#d4af37', borderTopColor: 'transparent' }} />
      </div>
    ) : null;
  }

  const page = pages[currentPageIdx];
  const allFailed = sourceIdx >= IMAGE_SOURCES.length;
  const imgUrl = allFailed ? '' : IMAGE_SOURCES[sourceIdx](page);
  const isZoomed = scale > 1.05;

  return (
    <div className={fullWidth ? "space-y-1" : "space-y-2"}>
      {/* Zoom controls */}
      <div className="flex items-center justify-center gap-1.5">
        <button
          onClick={zoomOut}
          disabled={scale <= MIN_SCALE}
          className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-30 transition-all active:scale-95"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(212,175,55,0.15)' }}
        >
          <ZoomOut className="h-3.5 w-3.5" style={{ color: '#d4af37' }} />
        </button>
        <span className="text-xs px-1.5 min-w-[40px] text-center" style={{ color: 'rgba(255,255,255,0.5)' }}>
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={zoomIn}
          disabled={scale >= MAX_SCALE}
          className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-30 transition-all active:scale-95"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(212,175,55,0.15)' }}
        >
          <ZoomIn className="h-3.5 w-3.5" style={{ color: '#d4af37' }} />
        </button>
        {isZoomed && (
          <button
            onClick={resetZoom}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all active:scale-95"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(212,175,55,0.15)' }}
          >
            <RotateCcw className="h-3.5 w-3.5" style={{ color: '#d4af37' }} />
          </button>
        )}
      </div>

      <div className="relative">
        <div
          ref={containerRef}
          className={`overflow-auto relative ${fullWidth ? '' : 'rounded-xl'} ${scale > 1 ? 'touch-none' : 'touch-pan-y'}`}
          style={{
            border: fullWidth ? 'none' : '1px solid rgba(212,175,55,0.25)',
            maxHeight,
            background: '#f5f0e0',
          }}
          onScroll={() => {
            const el = containerRef.current;
            if (el && el.scrollTop > 20) setShowScrollHint(false);
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {imgLoading && !allFailed && (
            <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(245,240,224,0.9)' }}>
              <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: '#d4af37', borderTopColor: 'transparent' }} />
            </div>
          )}
          {allFailed ? (
            <div className="flex items-center justify-center py-8 text-sm" style={{ color: 'rgba(0,0,0,0.4)' }}>
              Page {page} non disponible
            </div>
          ) : (
            <img
              key={`${page}-${sourceIdx}`}
              src={imgUrl}
              alt={`Page ${page} du Mushaf`}
              className="w-full h-auto"
              style={{
                transform: scale > 1 ? `scale(${scale}) translate(${translate.x / scale}px, ${translate.y / scale}px)` : undefined,
                transformOrigin: 'center center',
                transition: isPanningRef.current || lastTouchDistRef.current ? 'none' : 'transform 0.2s ease',
              }}
              onLoad={() => setImgLoading(false)}
              onError={() => {
                setSourceIdx(i => i + 1);
                setImgLoading(true);
              }}
              draggable={false}
            />
          )}
        </div>

        {/* Scroll hint overlay */}
        {showScrollHint && !imgLoading && !allFailed && (
          <div
            className="absolute bottom-0 left-0 right-0 pointer-events-none flex flex-col items-center pb-1"
            style={{
              background: 'linear-gradient(to top, rgba(245,240,224,0.95) 0%, rgba(245,240,224,0.6) 50%, transparent 100%)',
              height: '48px',
            }}
          >
            <ChevronDown
              className="h-5 w-5 animate-bounce mt-auto"
              style={{ color: 'rgba(0,0,0,0.35)' }}
            />
          </div>
        )}
      </div>

      {pages.length > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => { setCurrentPageIdx(i => i - 1); setImgLoading(true); setSourceIdx(0); resetZoom(); }}
            disabled={currentPageIdx === 0}
            className="w-8 h-8 rounded-full flex items-center justify-center disabled:opacity-30 transition-all active:scale-95"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(212,175,55,0.2)' }}
          >
            <ChevronLeft className="h-4 w-4" style={{ color: '#d4af37' }} />
          </button>
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Page {page} ({currentPageIdx + 1}/{pages.length})
          </span>
          <button
            onClick={() => { setCurrentPageIdx(i => i + 1); setImgLoading(true); setSourceIdx(0); resetZoom(); }}
            disabled={currentPageIdx === pages.length - 1}
            className="w-8 h-8 rounded-full flex items-center justify-center disabled:opacity-30 transition-all active:scale-95"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(212,175,55,0.2)' }}
          >
            <ChevronRight className="h-4 w-4" style={{ color: '#d4af37' }} />
          </button>
        </div>
      )}
    </div>
  );
}
