import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { SURAHS, getApproxVersePage } from '@/lib/surahData';
import { splitBlockByPages } from '@/lib/hifzUtils';
import { getExactVersePage } from '@/lib/quranData';

const MAX_TOUR_BLOCKS_PER_DAY = 10;

export interface MemorizedVerse {
  id: string;
  surah_number: number;
  verse_start: number;
  verse_end: number;
  memorized_at: string;
  last_reviewed_at: string | null;
  next_review_date: string;
  sm2_interval: number;
  sm2_ease_factor: number;
  sm2_repetitions: number;
  liaison_status?: string;
  liaison_start_date?: string | null;
}

function computeSM2(quality: number, repetitions: number, easeFactor: number, interval: number) {
  let newEF = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (newEF < 1.3) newEF = 1.3;
  let newInterval: number;
  let newReps: number;
  if (quality < 3) {
    newReps = 0;
    newInterval = 1;
  } else {
    newReps = repetitions + 1;
    if (newReps === 1) newInterval = 1;
    else if (newReps === 2) newInterval = 6;
    else newInterval = Math.round(interval * newEF);
  }
  return { interval: newInterval, easeFactor: newEF, repetitions: newReps };
}

function getTodayKey() {
  return new Date().toISOString().split('T')[0];
}

function getStorageKey() {
  return `muraja_checked_${getTodayKey()}`;
}

function loadChecked(): string[] {
  try {
    const saved = localStorage.getItem(getStorageKey());
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveChecked(ids: string[]) {
  localStorage.setItem(getStorageKey(), JSON.stringify(ids));
  Object.keys(localStorage)
    .filter(k => k.startsWith('muraja_checked_') && k !== getStorageKey())
    .forEach(k => localStorage.removeItem(k));
}

export function useMurajaData() {
  const { user } = useAuth();
  const [allVerses, setAllVerses] = useState<MemorizedVerse[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkedIds, setCheckedIds] = useState<string[]>(loadChecked);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!user) return;
    const fetchVerses = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('hifz_memorized_verses')
        .select('*')
        .eq('user_id', user.id)
        .order('memorized_at', { ascending: false });

      const verses = (data as MemorizedVerse[]) || [];

      let needsRefresh = false;
      for (const verse of verses) {
        const subBlocks = await splitBlockByPages(verse.surah_number, verse.verse_start, verse.verse_end);
        if (subBlocks.length > 1) {
          needsRefresh = true;
          await supabase.from('hifz_memorized_verses').delete().eq('id', verse.id);
          const newRows = subBlocks.map(sub => ({
            user_id: user.id,
            surah_number: sub.surahNumber,
            verse_start: sub.verseStart,
            verse_end: sub.verseEnd,
            memorized_at: verse.memorized_at,
            next_review_date: verse.next_review_date,
            sm2_interval: verse.sm2_interval,
            sm2_ease_factor: verse.sm2_ease_factor,
            sm2_repetitions: verse.sm2_repetitions,
            liaison_status: verse.liaison_status,
            liaison_start_date: verse.liaison_start_date,
            last_reviewed_at: verse.last_reviewed_at,
          }));
          await supabase.from('hifz_memorized_verses').insert(newRows);
        }
      }

      if (needsRefresh) {
        const { data: refreshed } = await supabase
          .from('hifz_memorized_verses')
          .select('*')
          .eq('user_id', user.id)
          .order('memorized_at', { ascending: false });
        setAllVerses((refreshed as MemorizedVerse[]) || []);
      } else {
        setAllVerses(verses);
      }
      setLoading(false);
    };
    fetchVerses();
  }, [user, refreshKey]);

  const thirtyDaysCutoff = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString();
  }, []);

  const rabtVerses = useMemo(() => {
    return allVerses
      .filter(v => v.memorized_at >= thirtyDaysCutoff)
      .sort((a, b) => a.surah_number - b.surah_number || a.verse_start - b.verse_start);
  }, [allVerses, thirtyDaysCutoff]);

  const { tourVerses, isCapActive, totalDueCount } = useMemo(() => {
    const today = getTodayKey();
    const allDue = allVerses
      .filter(v => v.memorized_at < thirtyDaysCutoff && v.next_review_date <= today)
      .sort((a, b) => a.surah_number - b.surah_number || a.verse_start - b.verse_start);
    return {
      tourVerses: allDue.slice(0, MAX_TOUR_BLOCKS_PER_DAY),
      isCapActive: allDue.length > MAX_TOUR_BLOCKS_PER_DAY,
      totalDueCount: allDue.length,
    };
  }, [allVerses, thirtyDaysCutoff]);

  const totalBlocks = rabtVerses.length + tourVerses.length;
  const checkedCount = checkedIds.filter(
    id => rabtVerses.some(v => v.id === id) || tourVerses.some(v => v.id === id)
  ).length;
  const allDailyChecked = checkedCount >= totalBlocks && totalBlocks > 0;

  const handleRabtCheck = useCallback(async (id: string) => {
    if (!user) return;
    const newChecked = [...checkedIds, id];
    setCheckedIds(newChecked);
    saveChecked(newChecked);

    await supabase
      .from('hifz_memorized_verses')
      .update({ last_reviewed_at: new Date().toISOString() })
      .eq('id', id);

    const verse = rabtVerses.find(v => v.id === id);
    if (verse) {
      await supabase.from('muraja_sessions').insert({
        user_id: user.id,
        session_type: 'rabt',
        verses_reviewed: [{ surah: verse.surah_number, start: verse.verse_start, end: verse.verse_end }],
        completed_at: new Date().toISOString(),
      });
    }
  }, [user, checkedIds, rabtVerses]);

  const handleTourRate = useCallback(async (id: string, quality: number, ratingKey: string) => {
    if (!user) return;
    const verse = tourVerses.find(v => v.id === id) || allVerses.find(v => v.id === id);
    if (!verse) return;

    const { interval, easeFactor, repetitions } = computeSM2(
      quality, verse.sm2_repetitions, verse.sm2_ease_factor, verse.sm2_interval
    );
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + interval);

    await supabase
      .from('hifz_memorized_verses')
      .update({
        sm2_interval: interval,
        sm2_ease_factor: easeFactor,
        sm2_repetitions: repetitions,
        next_review_date: nextDate.toISOString().split('T')[0],
        last_reviewed_at: new Date().toISOString(),
      })
      .eq('id', id);

    await supabase.from('muraja_sessions').insert({
      user_id: user.id,
      session_type: 'tour',
      difficulty_rating: ratingKey,
      verses_reviewed: [{ surah: verse.surah_number, start: verse.verse_start, end: verse.verse_end }],
      completed_at: new Date().toISOString(),
    });
  }, [user, tourVerses, allVerses]);

  const handleTourCheck = useCallback(async (id: string) => {
    const newChecked = [...checkedIds, id];
    setCheckedIds(newChecked);
    saveChecked(newChecked);
  }, [checkedIds]);

  const refresh = () => setRefreshKey(k => k + 1);

  return {
    user,
    allVerses,
    loading,
    checkedIds,
    rabtVerses,
    tourVerses,
    isCapActive,
    totalDueCount,
    totalBlocks,
    checkedCount,
    allDailyChecked,
    thirtyDaysCutoff,
    handleRabtCheck,
    handleTourRate,
    handleTourCheck,
    refresh,
  };
}

export function getSurahName(num: number) {
  return SURAHS.find(s => s.number === num)?.name || `Sourate ${num}`;
}

export function getLiaisonDaysPassed(memorizedAt?: string | null, startDate?: string | null): number {
  const dateStr = memorizedAt || startDate;
  if (!dateStr) return 0;
  const start = new Date(dateStr.length === 10 ? dateStr + 'T00:00:00' : dateStr);
  const now = new Date();
  return Math.min(30, Math.max(0, Math.floor((now.getTime() - start.getTime()) / 86400000)));
}
