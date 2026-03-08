/**
 * Local Quran data loader — bundles the Uthmani text from public/data/quran-uthmani.json
 * for zero network dependency in text mode.
 */

interface RawAyah {
  number: number;
  text: string;
  numberInSurah: number;
  page: number;
  surah: { number: number; name: string };
}

export interface LocalAyah {
  number: number;
  text: string;
  numberInSurah: number;
  page: number;
  surah: { name: string; number: number };
}

// In-memory cache: page number → ayahs
let pageIndex: Map<number, LocalAyah[]> | null = null;
// In-memory cache: surah number → ayahs (indexed by numberInSurah)
let surahIndex: Map<number, Map<number, LocalAyah>> | null = null;
let loadPromise: Promise<void> | null = null;

async function buildIndexes(): Promise<{ pages: Map<number, LocalAyah[]>; surahs: Map<number, Map<number, LocalAyah>> }> {
  const res = await fetch('/data/quran-uthmani.json');
  const json = await res.json();

  const rawSurahs: any[] = json.data.surahs;
  const pages = new Map<number, LocalAyah[]>();
  const surahs = new Map<number, Map<number, LocalAyah>>();

  for (const surah of rawSurahs) {
    const surahMap = new Map<number, LocalAyah>();
    surahs.set(surah.number, surahMap);

    for (const ayah of surah.ayahs) {
      const page = ayah.page as number;
      const mapped: LocalAyah = {
        number: ayah.number,
        text: ayah.text,
        numberInSurah: ayah.numberInSurah,
        surah: { name: surah.name, number: surah.number },
      };
      if (!pages.has(page)) {
        pages.set(page, []);
      }
      pages.get(page)!.push(mapped);
      surahMap.set(ayah.numberInSurah, mapped);
    }
  }

  return { pages, surahs };
}

async function ensureLoaded(): Promise<void> {
  if (pageIndex && surahIndex) return;
  if (!loadPromise) {
    loadPromise = buildIndexes().then(({ pages, surahs }) => {
      pageIndex = pages;
      surahIndex = surahs;
    });
  }
  await loadPromise;
}

/**
 * Get ayahs for a specific page from the local bundled data.
 */
export async function getPageAyahs(page: number): Promise<LocalAyah[]> {
  await ensureLoaded();
  return pageIndex!.get(page) || [];
}

/**
 * Get ayahs for a specific surah/verse range from the local bundled data.
 */
export async function getVersesByRange(surahNumber: number, startVerse: number, endVerse: number): Promise<LocalAyah[]> {
  await ensureLoaded();
  const surahMap = surahIndex!.get(surahNumber);
  if (!surahMap) return [];
  const result: LocalAyah[] = [];
  for (let v = startVerse; v <= endVerse; v++) {
    const ayah = surahMap.get(v);
    if (ayah) result.push(ayah);
  }
  return result;
}
