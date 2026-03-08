import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getExactVersePage } from '@/lib/quranData';

interface Props {
  surahNumber: number;
  startVerse: number;
  endVerse: number;
  maxHeight?: string;
}

const IMAGE_SOURCES = [
  (p: number) => `https://cdn.jsdelivr.net/gh/QuranHub/quran-pages-images@main/easyquran.com/hafs-tajweed/${p}.jpg`,
  (p: number) => `https://raw.githubusercontent.com/QuranHub/quran-pages-images/main/easyquran.com/hafs-tajweed/${p}.jpg`,
  (p: number) => `https://cdn.statically.io/gh/QuranHub/quran-pages-images/main/easyquran.com/hafs-tajweed/${p}.jpg`,
];

export default function HifzMushafImage({ surahNumber, startVerse, endVerse, maxHeight = '320px' }: Props) {
  const [pages, setPages] = useState<number[]>([]);
  const [currentPageIdx, setCurrentPageIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [imgLoading, setImgLoading] = useState(true);
  const [imgError, setImgError] = useState(false);
  const sourceIdxRef = useRef(0);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const startPage = await getExactVersePage(surahNumber, startVerse);
      const endPage = await getExactVersePage(surahNumber, endVerse);
      const pageList: number[] = [];
      for (let p = startPage; p <= endPage; p++) pageList.push(p);
      setPages(pageList);
      setCurrentPageIdx(0);
      sourceIdxRef.current = 0;
      setImgError(false);
      setLoading(false);
    };
    load();
  }, [surahNumber, startVerse, endVerse]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: '#d4af37', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  if (!pages.length) return null;

  const page = pages[currentPageIdx];
  const imgUrl = IMAGE_SOURCES[sourceIdxRef.current](page);

  const handleError = () => {
    if (sourceIdxRef.current < IMAGE_SOURCES.length - 1) {
      sourceIdxRef.current += 1;
      setImgLoading(true);
      setImgError(false);
      // Force re-render by toggling a state
      setCurrentPageIdx(i => i);
    } else {
      setImgLoading(false);
      setImgError(true);
    }
  };

  return (
    <div className="space-y-2">
      <div
        className="rounded-xl overflow-hidden relative"
        style={{ border: '1px solid rgba(212,175,55,0.25)', maxHeight, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f0e0' }}
      >
        {imgLoading && !imgError && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(245,240,224,0.9)' }}>
            <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: '#d4af37', borderTopColor: 'transparent' }} />
          </div>
        )}
        {imgError ? (
          <div className="flex items-center justify-center py-8 text-sm" style={{ color: 'rgba(0,0,0,0.4)' }}>
            Page {page} non disponible
          </div>
        ) : (
          <img
            key={`${page}-${sourceIdxRef.current}`}
            src={imgUrl}
            alt={`Page ${page} du Mushaf`}
            className="w-full h-auto object-contain"
            style={{ maxHeight }}
            onLoad={() => setImgLoading(false)}
            onError={handleError}
          />
        )}
      </div>

      {pages.length > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => { setCurrentPageIdx(i => i - 1); setImgLoading(true); setImgError(false); sourceIdxRef.current = 0; }}
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
            onClick={() => { setCurrentPageIdx(i => i + 1); setImgLoading(true); setImgError(false); sourceIdxRef.current = 0; }}
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
