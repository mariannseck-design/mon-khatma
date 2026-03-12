import { splitBlockByPages } from '@/lib/hifzUtils';

export interface Part {
  surahNumber: number;
  verseStart: number;
  verseEnd: number;
  partIndex: number;
}

/**
 * Split a verse range into digestible parts aligned with Mushaf pages.
 * If ≤ 5 verses, returns a single part (no fusion needed).
 */
export async function splitIntoParts(
  surahNumber: number,
  verseStart: number,
  verseEnd: number,
): Promise<Part[]> {
  const totalVerses = verseEnd - verseStart + 1;

  if (totalVerses <= 5) {
    return [{ surahNumber, verseStart, verseEnd, partIndex: 0 }];
  }

  const blocks = await splitBlockByPages(surahNumber, verseStart, verseEnd);

  return blocks.map((b, i) => ({
    surahNumber: b.surahNumber,
    verseStart: b.verseStart,
    verseEnd: b.verseEnd,
    partIndex: i,
  }));
}
