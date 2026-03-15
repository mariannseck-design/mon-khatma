/**
 * Tajweed annotations loader — loads cpfair/quran-tajweed data
 * and provides O(1) lookup per verse.
 * Palette: King Saud University (KSU) academic style.
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

// ─── KSU Palette (day mode) ───
export const TAJWEED_COLORS: Record<string, string> = {
  // Madd — rouge brique foncé
  madd_2: '#A51B0B',
  madd_246: '#A51B0B',
  madd_6: '#A51B0B',
  madd_muttasil: '#A51B0B',
  madd_munfasil: '#A51B0B',
  // Qalqalah — rouge clair / orangé
  qalqalah: '#C44536',
  // Ghunnah — vert doux
  ghunnah: '#2A7B3D',
  // Ikhfa / Iqlab — bleu
  ikhfa: '#1A6B8A',
  ikhfa_shafawi: '#1A6B8A',
  iqlab: '#1A6B8A',
  // Idghaam — orange brique
  idghaam_ghunnah: '#D4790E',
  idghaam_no_ghunnah: '#D4790E',
  idghaam_shafawi: '#D4790E',
  idghaam_mutajanisayn: '#D4790E',
  idghaam_mutaqaribayn: '#D4790E',
  // Lettres muettes
  hamzat_wasl: '#888888',
  silent: '#888888',
  // Lam Shamsiyyah
  lam_shamsiyyah: '#636e72',
};

// ─── KSU Palette (night mode — slightly brighter) ───
export const TAJWEED_COLORS_NIGHT: Record<string, string> = {
  madd_2: '#e05545',
  madd_246: '#e05545',
  madd_6: '#e05545',
  madd_muttasil: '#e05545',
  madd_munfasil: '#e05545',
  qalqalah: '#e06a5a',
  ghunnah: '#4db86a',
  ikhfa: '#3ca0c4',
  ikhfa_shafawi: '#3ca0c4',
  iqlab: '#3ca0c4',
  idghaam_ghunnah: '#f0a030',
  idghaam_no_ghunnah: '#f0a030',
  idghaam_shafawi: '#f0a030',
  idghaam_mutajanisayn: '#f0a030',
  idghaam_mutaqaribayn: '#f0a030',
  hamzat_wasl: '#a0a0a0',
  silent: '#a0a0a0',
  lam_shamsiyyah: '#90a4ae',
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
    const sorted = entry.annotations.sort((a, b) => a.start - b.start);
    index.set(key, sorted);
  }

  return index;
}

/**
 * Get tajweed annotations for a specific verse.
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
 * Preload the tajweed data.
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

/**
 * Determine the dominant tajweed color for a word based on its position
 * within the full verse text (text_qpc_hafs).
 *
 * @param wordIndex  - 0-based word index in the verse
 * @param wordsTexts - array of text_qpc_hafs for each word in the verse (in order)
 * @param annotations - tajweed annotations for this verse
 * @param darkMode - use night palette
 * @returns hex color string, or null if no tajweed rule applies
 */
export function getWordTajweedColor(
  wordIndex: number,
  wordsTexts: string[],
  annotations: TajweedAnnotation[],
  darkMode: boolean
): string | null {
  if (!annotations.length) return null;

  // Calculate the character offset of this word in the full verse text
  // Words are joined by spaces in text_qpc_hafs
  let charOffset = 0;
  for (let i = 0; i < wordIndex; i++) {
    charOffset += wordsTexts[i].length + 1; // +1 for space separator
  }
  const wordStart = charOffset;
  const wordEnd = charOffset + wordsTexts[wordIndex].length;

  // Find which annotations overlap this word, track coverage per rule
  const ruleCoverage = new Map<string, number>();

  for (const ann of annotations) {
    // Check overlap
    const overlapStart = Math.max(ann.start, wordStart);
    const overlapEnd = Math.min(ann.end, wordEnd);
    if (overlapStart < overlapEnd) {
      const coverage = overlapEnd - overlapStart;
      ruleCoverage.set(ann.rule, (ruleCoverage.get(ann.rule) || 0) + coverage);
    }
  }

  if (ruleCoverage.size === 0) return null;

  // Pick the rule with greatest coverage
  let bestRule = '';
  let bestCoverage = 0;
  for (const [rule, cov] of ruleCoverage) {
    if (cov > bestCoverage) {
      bestCoverage = cov;
      bestRule = rule;
    }
  }

  const palette = darkMode ? TAJWEED_COLORS_NIGHT : TAJWEED_COLORS;
  return palette[bestRule] || null;
}
