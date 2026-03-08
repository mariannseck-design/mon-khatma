/**
 * Tajweed annotations loader — loads cpfair/quran-tajweed data
 * and provides O(1) lookup per verse.
 */

export interface TajweedAnnotation {
  rule: string;
  start: number;
  end: number;
}

interface RawEntry {
  surah: number;
  ayah: number;
  annotations: TajweedAnnotation[];
}

// Color map matching standard Mushaf Tajwid conventions
export const TAJWEED_COLORS: Record<string, string> = {
  ghunnah: '#169b4c',
  ikhfa: '#26b89a',
  ikhfa_shafawi: '#26b89a',
  idghaam_ghunnah: '#f0932b',
  idghaam_no_ghunnah: '#f0932b',
  idghaam_shafawi: '#f0932b',
  idghaam_mutajanisayn: '#f0932b',
  idghaam_mutaqaribayn: '#f0932b',
  iqlab: '#10ac84',
  qalqalah: '#4a90d9',
  madd_2: '#d63031',
  madd_246: '#d63031',
  madd_6: '#d63031',
  madd_muttasil: '#d63031',
  madd_munfasil: '#d63031',
  hamzat_wasl: '#9b9b9b',
  lam_shamsiyyah: '#636e72',
  silent: '#b2bec3',
};

// Night mode colors (brighter for dark backgrounds)
export const TAJWEED_COLORS_NIGHT: Record<string, string> = {
  ghunnah: '#2ecc71',
  ikhfa: '#48dbab',
  ikhfa_shafawi: '#48dbab',
  idghaam_ghunnah: '#f9a825',
  idghaam_no_ghunnah: '#f9a825',
  idghaam_shafawi: '#f9a825',
  idghaam_mutajanisayn: '#f9a825',
  idghaam_mutaqaribayn: '#f9a825',
  iqlab: '#2ed8a3',
  qalqalah: '#64b5f6',
  madd_2: '#ff6b6b',
  madd_246: '#ff6b6b',
  madd_6: '#ff6b6b',
  madd_muttasil: '#ff6b6b',
  madd_munfasil: '#ff6b6b',
  hamzat_wasl: '#b0b0b0',
  lam_shamsiyyah: '#90a4ae',
  silent: '#cfd8dc',
};

// Rule labels for legend
export const TAJWEED_RULES: { rule: string; label: string; color: string }[] = [
  { rule: 'ghunnah', label: 'Ghunnah', color: TAJWEED_COLORS.ghunnah },
  { rule: 'ikhfa', label: 'Ikhfa', color: TAJWEED_COLORS.ikhfa },
  { rule: 'idghaam_ghunnah', label: 'Idghaam', color: TAJWEED_COLORS.idghaam_ghunnah },
  { rule: 'iqlab', label: 'Iqlab', color: TAJWEED_COLORS.iqlab },
  { rule: 'qalqalah', label: 'Qalqalah', color: TAJWEED_COLORS.qalqalah },
  { rule: 'madd_2', label: 'Madd', color: TAJWEED_COLORS.madd_2 },
  { rule: 'hamzat_wasl', label: 'Hamzat al-Wasl', color: TAJWEED_COLORS.hamzat_wasl },
  { rule: 'lam_shamsiyyah', label: 'Lam Shamsiyyah', color: TAJWEED_COLORS.lam_shamsiyyah },
];

// In-memory cache
let annotationIndex: Map<string, TajweedAnnotation[]> | null = null;
let loadPromise: Promise<Map<string, TajweedAnnotation[]>> | null = null;

function makeKey(surah: number, ayah: number) {
  return `${surah}:${ayah}`;
}

async function buildIndex(): Promise<Map<string, TajweedAnnotation[]>> {
  const res = await fetch('/data/tajweed-annotations.json');
  const data: RawEntry[] = await res.json();
  const index = new Map<string, TajweedAnnotation[]>();

  for (const entry of data) {
    const key = makeKey(entry.surah, entry.ayah);
    // Sort annotations by start index
    const sorted = entry.annotations.sort((a, b) => a.start - b.start);
    index.set(key, sorted);
  }

  return index;
}

/**
 * Get tajweed annotations for a specific verse.
 * Loads the full dataset on first call, then serves from memory.
 */
export async function getTajweedAnnotations(
  surah: number,
  ayah: number
): Promise<TajweedAnnotation[]> {
  if (annotationIndex) {
    return annotationIndex.get(makeKey(surah, ayah)) || [];
  }

  if (!loadPromise) {
    loadPromise = buildIndex().then(idx => {
      annotationIndex = idx;
      loadPromise = null;
      return idx;
    });
  }

  const idx = await loadPromise;
  return idx.get(makeKey(surah, ayah)) || [];
}

/**
 * Preload the tajweed data (call early to avoid delay on first render).
 */
export function preloadTajweedData(): void {
  if (!annotationIndex && !loadPromise) {
    loadPromise = buildIndex().then(idx => {
      annotationIndex = idx;
      loadPromise = null;
      return idx;
    });
  }
}
