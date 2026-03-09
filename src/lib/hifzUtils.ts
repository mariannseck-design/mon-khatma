import { SURAHS } from '@/lib/surahData';
import { supabase } from '@/integrations/supabase/client';
import { getExactVersePage, getPageAyahs } from '@/lib/quranData';

/**
 * Groups of commonly memorized surahs for quick selection
 */
export const JUZ_AMMA_SURAHS = SURAHS.filter(s => s.number >= 78); // Surahs 78-114
export const COMMON_SURAH_GROUPS = [
  { label: 'Juz Amma (complet)', icon: '📖', surahs: JUZ_AMMA_SURAHS.map(s => s.number) },
  { label: 'Al-Fatiha', icon: '🌟', surahs: [1] },
  { label: 'Al-Kahf', icon: '🏔️', surahs: [18] },
  { label: 'Ya-Sin', icon: '💎', surahs: [36] },
  { label: 'Ar-Rahman', icon: '🌸', surahs: [55] },
  { label: 'Al-Mulk', icon: '👑', surahs: [67] },
];

/**
 * Convert surah numbers into verse blocks for insertion
 */
export function surahsToVerseBlocks(surahNumbers: number[]) {
  return surahNumbers.map(num => {
    const surah = SURAHS.find(s => s.number === num);
    if (!surah) return null;
    return {
      surahNumber: num,
      verseStart: 1,
      verseEnd: surah.versesCount,
    };
  }).filter(Boolean) as { surahNumber: number; verseStart: number; verseEnd: number }[];
}

/**
 * Convert a page range into verse blocks (approximate: ~15 verses per page)
 */
export async function pageRangeToVerseBlocks(startPage: number, endPage: number) {
  const blocks: { surahNumber: number; verseStart: number; verseEnd: number }[] = [];

  for (let page = startPage; page <= endPage; page++) {
    const ayahs = await getPageAyahs(page);
    for (const ayah of ayahs) {
      const existing = blocks.find(b => b.surahNumber === ayah.surah.number);
      if (existing) {
        existing.verseStart = Math.min(existing.verseStart, ayah.numberInSurah);
        existing.verseEnd = Math.max(existing.verseEnd, ayah.numberInSurah);
      } else {
        blocks.push({
          surahNumber: ayah.surah.number,
          verseStart: ayah.numberInSurah,
          verseEnd: ayah.numberInSurah,
        });
      }
    }
  }

  return blocks;
}

/**
 * Inject memorized verse blocks into the SRS with staggered review dates.
 * Spreads reviews over `spreadDays` (default 14) to avoid overwhelming the user.
 */
export async function injectMemorizedVerses(
  userId: string,
  blocks: { surahNumber: number; verseStart: number; verseEnd: number }[],
  options: {
    spreadDays?: number;
    category?: 'solid' | 'recent';
    daysAlreadyDone?: number;
  } = {}
) {
  const { spreadDays = 14, category = 'solid', daysAlreadyDone = 0 } = options;
  if (blocks.length === 0) return { success: true, count: 0 };

  const now = new Date();

  const rows = blocks.map((block, index) => {
    if (category === 'recent') {
      // Liaison: daily review, liaison_start_date = today - daysAlreadyDone
      const liaisonStart = new Date(now);
      liaisonStart.setDate(liaisonStart.getDate() - daysAlreadyDone);
      return {
        user_id: userId,
        surah_number: block.surahNumber,
        verse_start: block.verseStart,
        verse_end: block.verseEnd,
        memorized_at: now.toISOString(),
        next_review_date: now.toISOString().split('T')[0],
        sm2_interval: 1,
        sm2_ease_factor: 2.5,
        sm2_repetitions: 0,
        liaison_status: 'liaison',
        liaison_start_date: liaisonStart.toISOString().split('T')[0],
      };
    }
    // Solid: stagger SM-2 over spreadDays (existing behavior)
    const dayOffset = Math.floor((index / blocks.length) * spreadDays);
    const reviewDate = new Date(now);
    reviewDate.setDate(reviewDate.getDate() + dayOffset);
    return {
      user_id: userId,
      surah_number: block.surahNumber,
      verse_start: block.verseStart,
      verse_end: block.verseEnd,
      memorized_at: now.toISOString(),
      next_review_date: reviewDate.toISOString().split('T')[0],
      sm2_interval: Math.max(dayOffset, 1),
      sm2_ease_factor: 2.5,
      sm2_repetitions: 1,
      liaison_status: 'tour',
      liaison_start_date: null,
    };
  });

  // Upsert in batches of 50
  const batchSize = 50;
  let insertedCount = 0;

  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const { error } = await supabase
      .from('hifz_memorized_verses')
      .upsert(batch as any, { onConflict: 'user_id,surah_number,verse_start,verse_end' });

    if (error) {
      console.error('Error inserting memorized verses batch:', error);
      for (const row of batch) {
        await supabase.from('hifz_memorized_verses').upsert(row as any, {
          onConflict: 'user_id,surah_number,verse_start,verse_end',
        });
        insertedCount++;
      }
    } else {
      insertedCount += batch.length;
    }
  }

  return { success: true, count: insertedCount };
}

/**
 * Graduate liaison blocks that have completed 30 days into tour status
 */
export async function graduateLiaisonBlocks(userId: string) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const cutoffDate = thirtyDaysAgo.toISOString().split('T')[0];

  const { data: liaisonBlocks } = await supabase
    .from('hifz_memorized_verses')
    .select('id, liaison_start_date')
    .eq('user_id', userId)
    .eq('liaison_status', 'liaison')
    .lte('liaison_start_date', cutoffDate);

  if (!liaisonBlocks || liaisonBlocks.length === 0) return 0;

  let graduated = 0;
  for (const block of liaisonBlocks) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await supabase
      .from('hifz_memorized_verses')
      .update({
        liaison_status: 'tour',
        sm2_interval: 1,
        sm2_ease_factor: 2.5,
        sm2_repetitions: 1,
        next_review_date: tomorrow.toISOString().split('T')[0],
      } as any)
      .eq('id', block.id);
    graduated++;
  }
  return graduated;
}

/**
 * Find the first non-memorized starting point after the user's memorized content.
 * Returns { surahNumber, startVerse } for the next Hifz session.
 */
export async function findNextStartingPoint(userId: string): Promise<{
  surahNumber: number;
  startVerse: number;
  endVerse: number;
  surahName: string;
} | null> {
  const { data: memorized } = await supabase
    .from('hifz_memorized_verses')
    .select('surah_number, verse_start, verse_end')
    .eq('user_id', userId)
    .order('surah_number', { ascending: true })
    .order('verse_start', { ascending: true });

  if (!memorized || memorized.length === 0) {
    const endVerse = await getPageAlignedEnd(1, 1);
    return { surahNumber: 1, startVerse: 1, endVerse, surahName: 'Al-Fatiha' };
  }

  // Build a set of fully memorized surahs
  const surahCoverage = new Map<number, { maxVerseEnd: number }>();
  for (const m of memorized) {
    const current = surahCoverage.get(m.surah_number);
    if (!current || m.verse_end > current.maxVerseEnd) {
      surahCoverage.set(m.surah_number, { maxVerseEnd: m.verse_end });
    }
  }

  // Check each surah in order to find the first gap
  for (const surah of SURAHS) {
    const coverage = surahCoverage.get(surah.number);
    if (!coverage) {
      const endVerse = await getPageAlignedEnd(surah.number, 1);
      return {
        surahNumber: surah.number,
        startVerse: 1,
        endVerse: Math.min(endVerse, surah.versesCount),
        surahName: surah.name,
      };
    }
    if (coverage.maxVerseEnd < surah.versesCount) {
      const startVerse = coverage.maxVerseEnd + 1;
      const endVerse = await getPageAlignedEnd(surah.number, startVerse);
      return {
        surahNumber: surah.number,
        startVerse,
        endVerse: Math.min(endVerse, surah.versesCount),
        surahName: surah.name,
      };
    }
  }

  return { surahNumber: 1, startVerse: 1, endVerse: 7, surahName: 'Al-Fatiha' };
}

/**
 * Find the last verse of the same surah on the same Mushaf page as `startVerse`.
 * Falls back to startVerse + 5 if data isn't available.
 */
async function getPageAlignedEnd(surahNumber: number, startVerse: number): Promise<number> {
  try {
    const page = await getExactVersePage(surahNumber, startVerse);
    const ayahs = await getPageAyahs(page);
    const sameSurahOnPage = ayahs.filter(a => a.surah.number === surahNumber);
    if (sameSurahOnPage.length > 0) {
      return Math.max(...sameSurahOnPage.map(a => a.numberInSurah));
    }
  } catch {
    // fallback
  }
  return startVerse + 5;
}

/**
 * Get today's revision items (verses due for review today or earlier)
 */
export async function getTodayRevisions(userId: string) {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('hifz_memorized_verses')
    .select('*')
    .eq('user_id', userId)
    .lte('next_review_date', today)
    .order('next_review_date', { ascending: true })
    .limit(10); // Limit daily review load

  if (error) {
    console.error('Error fetching revisions:', error);
    return [];
  }
  return data || [];
}

/**
 * Count total memorized verses for a user
 */
export function countTotalVerses(blocks: { verse_start: number; verse_end: number }[]) {
  return blocks.reduce((sum, b) => sum + (b.verse_end - b.verse_start + 1), 0);
}
