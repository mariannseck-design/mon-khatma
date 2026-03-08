import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface VerseLineInfo {
  verseKey: string;
  verseNumber: number;
  surahNumber: number;
}

interface LineMapping {
  line: number;
  verses: VerseLineInfo[];
}

interface Props {
  page: number;
  scale: number;
  onVerseSelect: (verseKey: string, verses: VerseLineInfo[]) => void;
  selectedVerse: string | null;
}

const LINES_PER_PAGE = 15;
// Pages 1 & 2 (Fatiha / Baqara start) have different layouts
const SPECIAL_PAGES = new Set([1, 2]);

export type { VerseLineInfo };

export default function ImageVerseOverlay({ page, scale, onVerseSelect, selectedVerse }: Props) {
  const [lineMap, setLineMap] = useState<LineMapping[]>([]);
  const [loading, setLoading] = useState(false);
  const [highlightedLine, setHighlightedLine] = useState<number | null>(null);
  const tapTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setHighlightedLine(null);

    const fetchLineData = async () => {
      try {
        const res = await fetch(
          `https://api.quran.com/api/v4/verses/by_page/${page}?words=true&per_page=50&word_fields=line_number,text_uthmani`
        );
        if (!res.ok) throw new Error('API error');
        const data = await res.json();

        if (cancelled) return;

        const map: Record<number, Map<string, VerseLineInfo>> = {};

        for (const verse of data.verses) {
          const [surah, ayah] = verse.verse_key.split(':').map(Number);
          const info: VerseLineInfo = {
            verseKey: verse.verse_key,
            verseNumber: ayah,
            surahNumber: surah,
          };

          for (const word of verse.words) {
            const ln = word.line_number;
            if (!ln) continue;
            if (!map[ln]) map[ln] = new Map();
            map[ln].set(verse.verse_key, info);
          }
        }

        const lines: LineMapping[] = [];
        for (let i = 1; i <= LINES_PER_PAGE; i++) {
          lines.push({
            line: i,
            verses: map[i] ? Array.from(map[i].values()) : [],
          });
        }

        setLineMap(lines);
      } catch (err) {
        console.error('Failed to fetch verse line data:', err);
        setLineMap([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchLineData();
    return () => { cancelled = true; };
  }, [page]);

  // Determine which line contains the selected verse
  const selectedLine = selectedVerse
    ? lineMap.find(l => l.verses.some(v => v.verseKey === selectedVerse))?.line ?? null
    : null;

  const handleLineTap = useCallback((line: LineMapping) => {
    if (line.verses.length === 0) return;
    // Flash highlight
    setHighlightedLine(line.line);
    if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
    tapTimerRef.current = setTimeout(() => setHighlightedLine(null), 600);

    // Select first verse on that line (or the one not yet selected)
    const currentIdx = line.verses.findIndex(v => v.verseKey === selectedVerse);
    const nextIdx = currentIdx >= 0 ? (currentIdx + 1) % line.verses.length : 0;
    onVerseSelect(line.verses[nextIdx].verseKey, line.verses);
  }, [selectedVerse, onVerseSelect]);

  // For special pages (1, 2), the text area is smaller
  const isSpecial = SPECIAL_PAGES.has(page);
  const topOffset = isSpecial ? '33%' : '7.5%';
  const bottomOffset = isSpecial ? '20%' : '7.5%';

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now(),
    };
  };

  const handleTouchEnd = (e: React.TouchEvent, line: LineMapping) => {
    if (!touchStartRef.current) return;
    const dx = Math.abs(e.changedTouches[0].clientX - touchStartRef.current.x);
    const dy = Math.abs(e.changedTouches[0].clientY - touchStartRef.current.y);
    const dt = Date.now() - touchStartRef.current.time;
    touchStartRef.current = null;

    // Only trigger on short, small-movement taps (not swipes)
    if (dx < 20 && dy < 20 && dt < 400) {
      e.stopPropagation();
      handleLineTap(line);
    }
  };

  if (loading || lineMap.length === 0) return null;

  return (
    <div
      className="absolute inset-0 z-[5]"
      style={{
        pointerEvents: scale > 1.2 ? 'none' : 'auto',
      }}
    >
      <div
        className="absolute left-[8%] right-[8%]"
        style={{ top: topOffset, bottom: bottomOffset }}
      >
        {lineMap.map((line) => {
          const isHighlighted = highlightedLine === line.line;
          const isSelected = selectedLine === line.line;
          const hasVerses = line.verses.length > 0;

          return (
            <div
              key={line.line}
              className="relative"
              style={{
                height: `${100 / LINES_PER_PAGE}%`,
                cursor: hasVerses ? 'pointer' : 'default',
              }}
              onTouchStart={handleTouchStart}
              onTouchEnd={(e) => handleTouchEnd(e, line)}
              onClick={(e) => {
                // Desktop click fallback
                if (scale <= 1.2 && hasVerses) {
                  e.stopPropagation();
                  handleLineTap(line);
                }
              }}
            >
              <AnimatePresence>
                {(isHighlighted || isSelected) && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="absolute inset-0 rounded-sm"
                    style={{
                      background: isSelected
                        ? 'rgba(122, 139, 111, 0.18)'
                        : 'rgba(122, 139, 111, 0.3)',
                    }}
                  />
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
