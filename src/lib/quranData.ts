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
  surah: { name: string; number: number };
}

// In-memory cache: page number → ayahs
let pageIndex: Map<number, LocalAyah[]> | null = null;
// In-memory cache: surah number → ayahs (indexed by numberInSurah)
let surahIndex: Map<number, Map<number, LocalAyah>> | null = null;
let loadPromise: Promise<Map<number, LocalAyah[]>> | null = null;

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

/**
 * Get ayahs for a specific page from the local bundled data.
 * Loads and indexes the full Quran on first call, then serves from memory.
 */
export async function getPageAyahs(page: number): Promise<LocalAyah[]> {
  if (pageIndex) {
    return pageIndex.get(page) || [];
  }

  if (!loadPromise) {
    loadPromise = buildPageIndex().then(idx => {
      pageIndex = idx;
      loadPromise = null;
      return idx;
    });
  }

  const idx = await loadPromise;
  return idx.get(page) || [];
}
