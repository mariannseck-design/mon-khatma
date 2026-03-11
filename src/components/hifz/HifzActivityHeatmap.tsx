import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, startOfDay, eachDayOfInterval, getDay } from 'date-fns';
import { fr } from 'date-fns/locale';

interface HifzActivityHeatmapProps {
  userId: string;
}

interface DayActivity {
  date: string;
  memorized: number;
  reviewed: number;
  total: number;
  versesAdded: number;
}

const WEEKS_TO_SHOW = 20;
const DAY_LABELS = ['', 'L', '', 'M', '', 'V', ''];

function getIntensity(count: number): number {
  if (count === 0) return 0;
  if (count <= 1) return 1;
  if (count <= 3) return 2;
  if (count <= 5) return 3;
  return 4;
}

const INTENSITY_STYLES: Record<number, { background: string; border: string }> = {
  0: { background: 'var(--p-track)', border: '1px solid transparent' },
  1: { background: 'rgba(16,185,129,0.35)', border: '1px solid rgba(16,185,129,0.2)' },
  2: { background: 'rgba(16,185,129,0.55)', border: '1px solid rgba(16,185,129,0.3)' },
  3: { background: 'rgba(16,185,129,0.75)', border: '1px solid rgba(16,185,129,0.4)' },
  4: { background: 'rgba(16,185,129,0.95)', border: '1px solid rgba(16,185,129,0.5)' },
};

export function HifzActivityHeatmap({ userId }: HifzActivityHeatmapProps) {
  const [activityMap, setActivityMap] = useState<Map<string, DayActivity>>(new Map());
  const [loading, setLoading] = useState(true);
  const [hoveredDay, setHoveredDay] = useState<DayActivity | null>(null);

  const today = useMemo(() => startOfDay(new Date()), []);
  const startDate = useMemo(() => {
    const d = subDays(today, WEEKS_TO_SHOW * 7 - 1);
    // Align to Monday
    const day = getDay(d);
    return subDays(d, day === 0 ? 6 : day - 1);
  }, [today]);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      const fromDate = format(startDate, 'yyyy-MM-dd');

      const [sessionsRes, murajaRes, versesRes] = await Promise.all([
        supabase
          .from('hifz_sessions')
          .select('completed_at')
          .eq('user_id', userId)
          .not('completed_at', 'is', null)
          .gte('completed_at', fromDate),
        supabase
          .from('muraja_sessions')
          .select('completed_at')
          .eq('user_id', userId)
          .not('completed_at', 'is', null)
          .gte('completed_at', fromDate),
        supabase
          .from('hifz_memorized_verses')
          .select('memorized_at')
          .eq('user_id', userId)
          .gte('memorized_at', fromDate),
      ]);

      const map = new Map<string, DayActivity>();
      const getOrCreate = (dateKey: string): DayActivity =>
        map.get(dateKey) || { date: dateKey, memorized: 0, reviewed: 0, total: 0, versesAdded: 0 };

      for (const s of sessionsRes.data || []) {
        const dateKey = format(new Date(s.completed_at!), 'yyyy-MM-dd');
        const existing = getOrCreate(dateKey);
        existing.memorized++;
        existing.total++;
        map.set(dateKey, existing);
      }

      for (const s of murajaRes.data || []) {
        const dateKey = format(new Date(s.completed_at!), 'yyyy-MM-dd');
        const existing = getOrCreate(dateKey);
        existing.reviewed++;
        existing.total++;
        map.set(dateKey, existing);
      }

      for (const s of versesRes.data || []) {
        const dateKey = format(new Date(s.memorized_at), 'yyyy-MM-dd');
        const existing = getOrCreate(dateKey);
        existing.versesAdded++;
        map.set(dateKey, existing);
      }

      setActivityMap(map);
      setLoading(false);
    })();
  }, [userId, startDate]);

  const weeks = useMemo(() => {
    const allDays = eachDayOfInterval({ start: startDate, end: today });
    const grid: Date[][] = [];
    let currentWeek: Date[] = [];

    for (const day of allDays) {
      const dow = getDay(day);
      const mondayBased = dow === 0 ? 6 : dow - 1;
      if (mondayBased === 0 && currentWeek.length > 0) {
        grid.push(currentWeek);
        currentWeek = [];
      }
      currentWeek.push(day);
    }
    if (currentWeek.length > 0) grid.push(currentWeek);
    return grid;
  }, [startDate, today]);

  const totalActiveDays = activityMap.size;
  const totalSessions = Array.from(activityMap.values()).reduce((s, d) => s + d.total, 0);

  if (loading) {
    return (
      <div className="rounded-2xl p-4 animate-pulse" style={{ background: 'var(--p-card)', border: '1px solid var(--p-border)' }}>
        <div className="h-4 w-32 rounded mb-3" style={{ background: 'var(--p-track)' }} />
        <div className="h-24 rounded" style={{ background: 'var(--p-track)' }} />
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-4" style={{ background: 'var(--p-card)', border: '1px solid var(--p-border)', boxShadow: 'var(--p-card-shadow)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--p-text-55)' }}>
          🔥 Activité
        </span>
        <span className="text-[10px]" style={{ color: 'var(--p-text-55)' }}>
          {totalActiveDays} jour{totalActiveDays !== 1 ? 's' : ''} actif{totalActiveDays !== 1 ? 's' : ''} · {totalSessions} session{totalSessions !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Tooltip */}
      {hoveredDay && (
        <div className="mb-2 px-2 py-1 rounded-lg text-[10px] text-center transition-all"
          style={{ background: 'var(--p-track)', color: 'var(--p-text-65)' }}>
          {format(new Date(hoveredDay.date), 'd MMMM yyyy', { locale: fr })} —{' '}
          {hoveredDay.memorized > 0 && `${hoveredDay.memorized} mémo`}
          {hoveredDay.memorized > 0 && (hoveredDay.reviewed > 0 || hoveredDay.versesAdded > 0) && ' · '}
          {hoveredDay.reviewed > 0 && `${hoveredDay.reviewed} révision${hoveredDay.reviewed > 1 ? 's' : ''}`}
          {hoveredDay.reviewed > 0 && hoveredDay.versesAdded > 0 && ' · '}
          {hoveredDay.versesAdded > 0 && `${hoveredDay.versesAdded} verset${hoveredDay.versesAdded > 1 ? 's' : ''} ajouté${hoveredDay.versesAdded > 1 ? 's' : ''}`}
        </div>
      )}

      {/* Grid */}
      <div className="flex gap-[3px] overflow-x-auto scrollbar-hide">
        {/* Day labels */}
        <div className="flex flex-col gap-[3px] flex-shrink-0 mr-1">
          {DAY_LABELS.map((label, i) => (
            <div key={i} className="h-[13px] w-3 flex items-center justify-end">
              <span className="text-[8px]" style={{ color: 'var(--p-text-55)' }}>{label}</span>
            </div>
          ))}
        </div>

        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {Array.from({ length: 7 }, (_, di) => {
              const day = week.find(d => {
                const dow = getDay(d);
                return (dow === 0 ? 6 : dow - 1) === di;
              });
              if (!day) return <div key={di} className="w-[13px] h-[13px]" />;

              const dateKey = format(day, 'yyyy-MM-dd');
              const activity = activityMap.get(dateKey);
              const hasActivity = activity && (activity.total > 0 || activity.versesAdded > 0);
              const intensity = getIntensity(activity?.total || 0);
              const style = INTENSITY_STYLES[intensity];

              return (
                <div
                  key={di}
                  className="w-[13px] h-[13px] rounded-[3px] cursor-pointer transition-transform hover:scale-125"
                  style={{ background: style.background, border: style.border }}
                  onMouseEnter={() => hasActivity && setHoveredDay(activity)}
                  onMouseLeave={() => setHoveredDay(null)}
                  onTouchStart={() => hasActivity && setHoveredDay(activity)}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-1.5 mt-3">
        <span className="text-[9px]" style={{ color: 'var(--p-text-55)' }}>Moins</span>
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} className="w-[11px] h-[11px] rounded-[2px]"
            style={{ background: INTENSITY_STYLES[i].background, border: INTENSITY_STYLES[i].border }} />
        ))}
        <span className="text-[9px]" style={{ color: 'var(--p-text-55)' }}>Plus</span>
      </div>
    </div>
  );
}
