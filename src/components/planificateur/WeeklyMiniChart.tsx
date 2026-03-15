import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

interface DailyProgress {
  date: string;
  pages_read: number;
}

interface Props {
  weekProgress: DailyProgress[];
  targetPages: number;
}

const DAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

function getMonday(d: Date): Date {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

export function WeeklyMiniChart({ weekProgress, targetPages }: Props) {
  const { days, totalPages, maxPages } = useMemo(() => {
    const today = new Date();
    const monday = getMonday(today);
    const todayStr = today.toISOString().split('T')[0];

    const progressMap = new Map<string, number>();
    weekProgress.forEach((p) => {
      progressMap.set(p.date, (progressMap.get(p.date) || 0) + p.pages_read);
    });

    let total = 0;
    let max = 0;
    const result = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const pages = progressMap.get(dateStr) || 0;
      total += pages;
      if (pages > max) max = pages;
      return { dateStr, pages, isToday: dateStr === todayStr };
    });

    return { days: result, totalPages: total, maxPages: max };
  }, [weekProgress]);

  // Don't render if no data this week
  if (totalPages === 0) return null;

  const chartMax = Math.max(maxPages, targetPages || 1);
  const targetPercent = targetPages > 0 ? Math.min((targetPages / chartMax) * 100, 100) : 0;

  return (
    <Card
      className="border-none shadow-none p-5"
      style={{
        borderRadius: '2rem',
        background: 'white',
        boxShadow: '0 2px 12px rgba(6,95,70,0.06)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 size={16} style={{ color: 'var(--p-primary)' }} />
          <span
            className="text-sm font-semibold"
            style={{ color: 'var(--p-text)' }}
          >
            Cette semaine
          </span>
        </div>
        <span
          className="text-xs font-medium px-2 py-0.5 rounded-full"
          style={{
            background: 'var(--p-track)',
            color: 'var(--p-primary)',
          }}
        >
          {totalPages} page{totalPages > 1 ? 's' : ''}
        </span>
      </div>

      {/* Chart */}
      <div className="relative" style={{ height: 120 }}>
        {/* Target line */}
        {targetPages > 0 && targetPercent < 100 && (
          <div
            className="absolute left-0 right-0 border-t-2 border-dashed z-10"
            style={{
              bottom: `${targetPercent}%`,
              borderColor: 'var(--p-accent)',
              opacity: 0.5,
            }}
          />
        )}

        {/* Bars */}
        <div className="flex items-end justify-between h-full gap-2 px-1">
          {days.map((day, i) => {
            const heightPercent = chartMax > 0 ? (day.pages / chartMax) * 100 : 0;
            const metGoal = targetPages > 0 && day.pages >= targetPages;

            return (
              <div key={day.dateStr} className="flex flex-col items-center flex-1 h-full justify-end gap-1">
                {/* Page count on top */}
                {day.pages > 0 && (
                  <span
                    className="text-[10px] font-medium"
                    style={{ color: day.isToday ? 'var(--p-accent)' : 'var(--p-text-55)' }}
                  >
                    {day.pages}
                  </span>
                )}

                {/* Bar */}
                <div
                  className="w-full rounded-t-md transition-all duration-500"
                  style={{
                    height: `${Math.max(heightPercent, day.pages > 0 ? 4 : 0)}%`,
                    minHeight: day.pages > 0 ? 4 : 0,
                    background: day.isToday
                      ? 'var(--p-accent)'
                      : metGoal
                        ? 'var(--p-primary)'
                        : 'var(--p-primary)',
                    opacity: day.isToday ? 1 : metGoal ? 1 : 0.5,
                    borderRadius: '4px 4px 0 0',
                    maxWidth: 28,
                    margin: '0 auto',
                  }}
                />

                {/* Day label */}
                <span
                  className="text-[11px] font-medium mt-1"
                  style={{
                    color: day.isToday ? 'var(--p-accent)' : 'var(--p-text-55)',
                    fontWeight: day.isToday ? 700 : 500,
                  }}
                >
                  {DAY_LABELS[i]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
