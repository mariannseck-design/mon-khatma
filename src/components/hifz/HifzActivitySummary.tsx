import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, startOfWeek, addDays, isSameDay } from 'date-fns';

interface HifzActivitySummaryProps {
  userId: string;
}

const DAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

export function HifzActivitySummary({ userId }: HifzActivitySummaryProps) {
  const [streak, setStreak] = useState(0);
  const [weekSessions, setWeekSessions] = useState(0);
  const [weekVerses, setWeekVerses] = useState(0);
  const [weekActiveDays, setWeekActiveDays] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  const today = useMemo(() => new Date(), []);
  const monday = useMemo(() => startOfWeek(today, { weekStartsOn: 1 }), [today]);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      const weekStart = format(monday, 'yyyy-MM-dd');

      const [sessionsRes, murajaRes, hifzVersesRes, streakDaysRes] = await Promise.all([
        // Week sessions (hifz) — need verse range for verse count
        supabase
          .from('hifz_sessions')
          .select('completed_at, start_verse, end_verse')
          .eq('user_id', userId)
          .not('completed_at', 'is', null)
          .gte('completed_at', weekStart),
        // Week sessions (muraja) — need verses_reviewed
        supabase
          .from('muraja_sessions')
          .select('completed_at, verses_reviewed')
          .eq('user_id', userId)
          .not('completed_at', 'is', null)
          .gte('completed_at', weekStart),
        // Week new verses
        supabase
          .from('hifz_memorized_verses')
          .select('verse_start, verse_end')
          .eq('user_id', userId)
          .gte('memorized_at', weekStart),
        // Last 60 days for streak calc
        supabase
          .from('hifz_sessions')
          .select('completed_at')
          .eq('user_id', userId)
          .not('completed_at', 'is', null)
          .gte('completed_at', format(subDays(today, 60), 'yyyy-MM-dd')),
      ]);

      // Week sessions count
      const hifzCount = sessionsRes.data?.length || 0;
      const murajaCount = murajaRes.data?.length || 0;
      setWeekSessions(hifzCount + murajaCount);

      // Week verses worked (memorized + revised)
      let versesWorked = 0;
      for (const s of sessionsRes.data || []) {
        versesWorked += (s.end_verse - s.start_verse + 1);
      }
      for (const s of murajaRes.data || []) {
        const reviewed = s.verses_reviewed as any[];
        if (Array.isArray(reviewed)) {
          for (const r of reviewed) {
            versesWorked += ((r.verse_end || r.end_verse || 0) - (r.verse_start || r.start_verse || 0) + 1);
          }
        }
      }
      for (const v of hifzVersesRes.data || []) {
        versesWorked += (v.verse_end - v.verse_start + 1);
      }
      setWeekVerses(versesWorked);

      // Week active days (0=Mon … 6=Sun)
      const activeDays = new Set<number>();
      const allWeekSessions = [
        ...(sessionsRes.data || []),
        ...(murajaRes.data || []),
      ];
      for (const s of allWeekSessions) {
        const d = new Date(s.completed_at!);
        for (let i = 0; i < 7; i++) {
          if (isSameDay(d, addDays(monday, i))) {
            activeDays.add(i);
            break;
          }
        }
      }
      setWeekActiveDays(activeDays);

      // Streak calculation
      const daySet = new Set<string>();
      for (const s of streakDaysRes.data || []) {
        daySet.add(format(new Date(s.completed_at!), 'yyyy-MM-dd'));
      }
      // Also add muraja days for streak
      const murajaStreakRes = await supabase
        .from('muraja_sessions')
        .select('completed_at')
        .eq('user_id', userId)
        .not('completed_at', 'is', null)
        .gte('completed_at', format(subDays(today, 60), 'yyyy-MM-dd'));
      for (const s of murajaStreakRes.data || []) {
        daySet.add(format(new Date(s.completed_at!), 'yyyy-MM-dd'));
      }

      let currentStreak = 0;
      for (let i = 0; i < 60; i++) {
        const key = format(subDays(today, i), 'yyyy-MM-dd');
        if (daySet.has(key)) {
          currentStreak++;
        } else if (i === 0) {
          // Today not active yet, keep checking
          continue;
        } else {
          break;
        }
      }
      setStreak(currentStreak);
      setLoading(false);
    })();
  }, [userId, monday, today]);

  if (loading) {
    return (
      <div className="rounded-2xl p-4 animate-pulse" style={{ background: 'var(--p-card)', border: '1px solid var(--p-border)' }}>
        <div className="h-16 rounded" style={{ background: 'var(--p-track)' }} />
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-4" style={{ background: 'var(--p-card)', border: '1px solid var(--p-border)', boxShadow: 'var(--p-card-shadow)' }}>
      {/* Stats pills */}
      <div className="flex items-center justify-between gap-2 mb-4">
        {[
          { emoji: '🔥', value: streak, label: `jour${streak !== 1 ? 's' : ''}` },
          { emoji: '📖', value: weekSessions, label: `session${weekSessions !== 1 ? 's' : ''}` },
          { emoji: '✅', value: monthVerses, label: `verset${monthVerses !== 1 ? 's' : ''}` },
        ].map((stat, i) => (
          <div
            key={i}
            className="flex-1 flex flex-col items-center gap-0.5 rounded-xl py-2"
            style={{ background: 'var(--p-track)' }}
          >
            <span className="text-lg font-bold" style={{ color: 'var(--p-text)' }}>
              {stat.emoji} {stat.value}
            </span>
            <span className="text-[10px]" style={{ color: 'var(--p-text-55)' }}>
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      {/* Weekly consistency bar */}
      <div className="flex items-center justify-between px-2">
        {DAY_LABELS.map((label, i) => {
          const isActive = weekActiveDays.has(i);
          const isToday = isSameDay(addDays(monday, i), today);
          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <span className="text-[10px] font-medium" style={{ color: 'var(--p-text-55)' }}>
                {label}
              </span>
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center transition-all"
                style={{
                  background: isActive ? 'rgba(16,185,129,0.85)' : 'var(--p-track)',
                  border: isToday && !isActive ? '2px solid rgba(16,185,129,0.6)' : '1px solid transparent',
                  boxShadow: isActive ? '0 0 6px rgba(16,185,129,0.3)' : 'none',
                }}
              >
                {isActive && (
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'white' }} />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
