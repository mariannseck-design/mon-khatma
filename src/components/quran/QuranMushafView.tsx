import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { SURAHS } from '@/lib/surahData';

/* ─── Types ─── */
interface Word {
  id: number;
  position: number;
  text_qpc_hafs: string;
  code_v2: string;
  line_number: number;
  char_type_name: 'word' | 'end' | 'pause';
  verse_key: string;
}

interface Verse {
  id: number;
  verse_key: string;
  verse_number: number;
  chapter_id: number;
  words: Word[];
}

interface PageData {
  verses: Verse[];
}

/* ─── Caches ─── */
const pageDataCache = new Map<number, PageData>();
const fontLoadedCache = new Set<number>();

/* ─── Font loader ─── */
function loadPageFont(page: number): Promise<void> {
  if (fontLoadedCache.has(page)) return Promise.resolve();

  const familyName = `p${page}-v2`;
  const url = `https://verses.quran.foundation/fonts/quran/hafs/v2/woff2/p${page}.woff2`;

  const face = new FontFace(familyName, `url(${url})`, {
    style: 'normal',
    weight: 'normal',
    display: 'block',
  });

  return face.load().then((loaded) => {
    document.fonts.add(loaded);
    fontLoadedCache.add(page);
  });
}

/* ─── API fetcher ─── */
async function fetchPageData(page: number): Promise<PageData> {
  if (pageDataCache.has(page)) return pageDataCache.get(page)!;

  const url = `https://api.quran.com/api/v4/verses/by_page/${page}?language=ar&words=true&word_fields=code_v2,text_qpc_hafs&mushaf=1`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  const json = await res.json();

  const data: PageData = {
    verses: json.verses.map((v: any) => ({
      id: v.id,
      verse_key: v.verse_key,
      verse_number: v.verse_number,
      chapter_id: v.chapter_id ?? parseInt(v.verse_key.split(':')[0]),
      words: v.words
        .filter((w: any) => w.line_number != null)
        .map((w: any) => ({
          id: w.id,
          position: w.position,
          text_qpc_hafs: w.text_qpc_hafs ?? w.text_uthmani ?? '',
          code_v2: w.code_v2 ?? '',
          line_number: w.line_number,
          char_type_name: w.char_type_name ?? 'word',
          verse_key: v.verse_key,
        })),
    })),
  };

  pageDataCache.set(page, data);
  return data;
}

/* ─── Surah header detector ─── */
function getSurahStartsOnPage(verses: Verse[]): number[] {
  const starts: number[] = [];
  for (const v of verses) {
    if (v.verse_number === 1 && !starts.includes(v.chapter_id)) {
      starts.push(v.chapter_id);
    }
  }
  return starts;
}

/* ─── Bismillah line number for a surah start ─── */
function getBismillahLineNumber(verses: Verse[], surahNumber: number): number | null {
  for (const v of verses) {
    if (v.chapter_id === surahNumber && v.verse_number === 1) {
      // The first word of verse 1 should be on the bismillah line
      const firstWord = v.words[0];
      if (firstWord) return firstWord.line_number;
    }
  }
  return null;
}

/* ─── Props ─── */
interface QuranMushafViewProps {
  page: number;
  highlightAyah?: number | null;
  darkMode?: boolean;
  onVerseSelect?: (verseKey: string, surahNumber: number, verseNumber: number) => void;
}

/* ─── Component ─── */
export default function QuranMushafView({ page, highlightAyah, darkMode = false, tajweedEnabled = false, onVerseSelect }: QuranMushafViewProps) {
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [fontReady, setFontReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState<string | null>(null);
  const [tajweedMap, setTajweedMap] = useState<Map<string, TajweedAnnotation[]>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);

  const fontFamily = `p${page}-v2`;

  // Load data + font in parallel
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    setFontReady(false);
    setSelectedVerse(null);

    Promise.all([fetchPageData(page), loadPageFont(page)])
      .then(([data]) => {
        if (cancelled) return;
        setPageData(data);
        setFontReady(true);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    // Preload adjacent pages
    if (page > 1) { fetchPageData(page - 1).catch(() => {}); loadPageFont(page - 1).catch(() => {}); }
    if (page < 604) { fetchPageData(page + 1).catch(() => {}); loadPageFont(page + 1).catch(() => {}); }

    return () => { cancelled = true; };
  }, [page]);

  // Reset scroll on page change
  useEffect(() => { containerRef.current?.scrollTo(0, 0); }, [page]);

  // Load tajweed annotations when enabled
  useEffect(() => {
    if (!tajweedEnabled || !pageData) {
      setTajweedMap(new Map());
      return;
    }
    preloadTajweedData();
    const verseKeys = pageData.verses.map(v => v.verse_key);
    Promise.all(
      pageData.verses.map(v =>
        getTajweedAnnotations(v.chapter_id, v.verse_number).then(anns => ({
          key: v.verse_key,
          anns,
        }))
      )
    ).then(results => {
      const map = new Map<string, TajweedAnnotation[]>();
      for (const r of results) map.set(r.key, r.anns);
      setTajweedMap(map);
    });
  }, [tajweedEnabled, pageData]);

  // Group words by line number
  const lines = useMemo(() => {
    if (!pageData) return [];

    const allWords: Word[] = [];
    for (const verse of pageData.verses) {
      allWords.push(...verse.words);
    }

    const lineMap = new Map<number, Word[]>();
    for (const w of allWords) {
      if (!lineMap.has(w.line_number)) lineMap.set(w.line_number, []);
      lineMap.get(w.line_number)!.push(w);
    }

    // Sort by line number, and words within each line by position
    const sorted = Array.from(lineMap.entries()).sort((a, b) => a[0] - b[0]);
    return sorted.map(([lineNum, words]) => ({
      lineNumber: lineNum,
      words: words.sort((a, b) => a.position - b.position),
    }));
  }, [pageData]);

  // Pre-compute tajweed color per word id
  const wordTajweedColors = useMemo(() => {
    const map = new Map<number, string | null>();
    if (!tajweedEnabled || tajweedMap.size === 0 || !pageData) return map;

    for (const verse of pageData.verses) {
      const anns = tajweedMap.get(verse.verse_key);
      if (!anns || anns.length === 0) continue;

      // Build ordered word texts (only 'word' type, matching text_qpc_hafs order)
      const textWords = verse.words.filter(w => w.char_type_name === 'word');
      const wordsTexts = textWords.map(w => w.text_qpc_hafs);

      for (let i = 0; i < textWords.length; i++) {
        const color = getWordTajweedColor(i, wordsTexts, anns, darkMode);
        if (color) map.set(textWords[i].id, color);
      }
    }
    return map;
  }, [tajweedEnabled, tajweedMap, pageData, darkMode]);

  // Detect surah starts for headers
  const surahStarts = useMemo(() => {
    if (!pageData) return [];
    return getSurahStartsOnPage(pageData.verses);
  }, [pageData]);

  const handleWordClick = useCallback((word: Word) => {
    const [surahStr, verseStr] = word.verse_key.split(':');
    const surahNum = parseInt(surahStr);
    const verseNum = parseInt(verseStr);
    setSelectedVerse(prev => prev === word.verse_key ? null : word.verse_key);
    onVerseSelect?.(word.verse_key, surahNum, verseNum);
  }, [onVerseSelect]);

  if (loading) {
    return (
      <div ref={containerRef} className="flex items-center justify-center h-full w-full">
        <div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: '#7a8b6f', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  if (error || !pageData) {
    return (
      <div ref={containerRef} className="flex items-center justify-center h-full w-full">
        <p style={{ color: '#7a8b6f', fontSize: '14px' }}>Impossible de charger la page</p>
      </div>
    );
  }

  const textColor = darkMode ? '#d4c9a8' : '#1a1a1a';
  const bgColor = darkMode ? '#1a2e1a' : '#ffffff';
  const activeVerse = selectedVerse;
  const isSpecialPage = page <= 2; // Fatiha & start of Baqara have centered layout

  return (
    <div
      ref={containerRef}
      data-text-scroll
      className="h-full w-full overflow-hidden flex flex-col select-text"
      dir="rtl"
      style={{ background: bgColor, touchAction: 'pan-y' }}
    >
      <div
        className={`flex-1 flex flex-col px-3 py-1 ${isSpecialPage ? 'justify-center' : 'justify-between'}`}
        style={{ height: '100%' }}
      >
        {lines.map(({ lineNumber, words }) => {
          // Check if this line starts a new surah
          const surahStarting = surahStarts.find(sNum => {
            if (!pageData) return false;
            const bismillahLine = getBismillahLineNumber(pageData.verses, sNum);
            // The header should appear above the bismillah/first verse line
            return bismillahLine === lineNumber;
          });

          const surahInfo = surahStarting ? SURAHS.find(s => s.number === surahStarting) : null;

          return (
            <div key={lineNumber}>
              {/* Surah header */}
              {surahInfo && (
                <div className="text-center my-0.5">
                  <div
                    className="inline-flex items-center gap-2 px-4 py-0.5 rounded-md mx-auto"
                    style={{
                      background: darkMode
                        ? 'linear-gradient(135deg, rgba(46,125,50,0.2), rgba(46,125,50,0.1))'
                        : 'linear-gradient(135deg, rgba(46,125,50,0.08), rgba(46,125,50,0.04))',
                      border: `1px solid ${darkMode ? 'rgba(106,154,106,0.3)' : 'rgba(46,125,50,0.15)'}`,
                    }}
                  >
                    <span
                      className="flex items-center justify-center rounded-full"
                      style={{
                        width: '20px', height: '20px',
                        backgroundColor: '#2E7D32', color: '#fff',
                        fontSize: '9px', fontWeight: 700,
                        fontFamily: 'system-ui, sans-serif',
                      }}
                    >
                      {surahInfo.number}
                    </span>
                    <span
                      style={{
                        fontFamily: "'KFGQPC HAFS Uthmanic Script', 'Amiri', serif",
                        fontSize: '14px', fontWeight: 'bold',
                        color: darkMode ? '#d4c9a8' : '#2d3a25',
                      }}
                    >
                      {surahInfo.name}
                    </span>
                    {surahInfo.nameFr && (
                      <span
                        style={{
                          fontFamily: 'system-ui, sans-serif',
                          fontSize: '9px', color: darkMode ? '#8a9a7a' : '#6b7c5e',
                        }}
                      >
                        {surahInfo.nameFr}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Line of Mushaf text */}
              <div
                className="flex items-center w-full"
                style={{
                  justifyContent: isSpecialPage ? 'center' : 'space-around',
                  direction: 'rtl',
                  padding: '0 4px',
                }}
              >
                {words.map((word) => {
                  const isEnd = word.char_type_name === 'end';
                  const isHighlighted = activeVerse === word.verse_key;
                  const tajweedColor = tajweedEnabled ? wordTajweedColors.get(word.id) : null;

                  return (
                    <span
                      key={word.id}
                      onClick={() => handleWordClick(word)}
                      className="cursor-pointer transition-colors duration-150"
                      style={{
                        fontFamily: isEnd
                          ? "'KFGQPC HAFS Uthmanic Script', 'Amiri', serif"
                          : `'${fontFamily}', serif`,
                        fontSize: 'clamp(18px, 5.8vw, 28px)',
                        lineHeight: 1.55,
                        color: isHighlighted
                          ? (darkMode ? '#6a9a6a' : '#2E7D32')
                          : (tajweedColor || textColor),
                        background: isHighlighted
                          ? (darkMode ? 'rgba(122,139,111,0.15)' : 'rgba(46,125,50,0.06)')
                          : 'transparent',
                        borderRadius: isHighlighted ? '4px' : '0',
                        padding: '0 1px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {fontReady ? word.code_v2 : word.text_qpc_hafs}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
