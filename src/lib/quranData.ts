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

async function buildPageIndex(): Promise<Map<number, LocalAyah[]>> {
  const res = await fetch('/data/quran-uthmani.json');
  const json = await res.json();

  const surahs: any[] = json.data.surahs;
  const index = new Map<number, LocalAyah[]>();

  for (const surah of surahs) {
    for (const ayah of surah.ayahs) {
      const page = ayah.page as number;
      const mapped: LocalAyah = {
        number: ayah.number,
        text: ayah.text,
        numberInSurah: ayah.numberInSurah,
        surah: { name: surah.name, number: surah.number },
      };
      if (!index.has(page)) {
        index.set(page, []);
      }
      index.get(page)!.push(mapped);
    }
  }

  return index;
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
