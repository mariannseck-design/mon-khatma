export interface Part {
  surahNumber: number;
  verseStart: number;
  verseEnd: number;
  partIndex: number;
}

/**
 * Split a verse range into individual verses (one Part per verse).
 */
export async function splitIntoParts(
  surahNumber: number,
  verseStart: number,
  verseEnd: number,
): Promise<Part[]> {
  const parts: Part[] = [];
  for (let v = verseStart; v <= verseEnd; v++) {
    parts.push({
      surahNumber,
      verseStart: v,
      verseEnd: v,
      partIndex: v - verseStart,
    });
  }
  return parts;
}
