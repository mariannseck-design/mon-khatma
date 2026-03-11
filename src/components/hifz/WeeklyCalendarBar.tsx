import { useMemo } from 'react';
import { startOfWeek, addDays, format, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';

interface WeeklyCalendarBarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  variant: 'header' | 'floating';
}

const DAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

export function WeeklyCalendarBar({ selectedDate, onSelectDate, variant }: WeeklyCalendarBarProps) {
  const weekDays = useMemo(() => {
    const monday = startOfWeek(new Date(), { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  }, []);

  const isFloating = variant === 'floating';

  return (
    <div
      className={
        isFloating
          ? 'fixed bottom-20 left-4 right-4 z-40 rounded-3xl px-3 py-2 flex items-center justify-between'
          : 'w-full rounded-2xl px-3 py-3 flex items-center justify-between mb-4'
      }
      style={{
        background: 'var(--p-card)',
        border: '1px solid var(--p-border)',
        boxShadow: isFloating
          ? '0 -4px 24px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)'
          : 'var(--p-card-shadow)',
      }}
    >
      {weekDays.map((day, i) => {
        const isSelected = isSameDay(day, selectedDate);
        const isToday = isSameDay(day, new Date());
        const dayNum = format(day, 'd');

        return (
          <button
            key={i}
            onClick={() => onSelectDate(day)}
            className="flex flex-col items-center gap-0.5 transition-all active:scale-90"
            style={{ minWidth: isFloating ? 36 : 40 }}
          >
            <span
              className="text-[10px] font-semibold uppercase"
              style={{ color: isSelected ? 'var(--p-primary)' : 'var(--p-text-55)' }}
            >
              {DAY_LABELS[i]}
            </span>
            <div
              className="flex items-center justify-center rounded-full transition-all"
              style={{
                width: isFloating ? 28 : 32,
                height: isFloating ? 28 : 32,
                background: isSelected ? 'var(--p-primary)' : 'transparent',
                border: isToday && !isSelected ? '1.5px solid var(--p-primary)' : 'none',
              }}
            >
              <span
                className="text-xs font-bold"
                style={{
                  color: isSelected ? 'var(--p-on-dark)' : isToday ? 'var(--p-primary)' : 'var(--p-text)',
                }}
              >
                {dayNum}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
