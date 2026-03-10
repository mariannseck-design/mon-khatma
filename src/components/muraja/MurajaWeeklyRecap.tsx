import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, CalendarDays, Flame, Link, BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { SURAHS } from '@/lib/surahData';

interface SessionRow {
  session_type: string;
  difficulty_rating: string | null;
  verses_reviewed: any;
  completed_at: string | null;
  created_at: string;
}

interface DayStat {
  date: string;
  dayLabel: string;
  rabtCount: number;
  tourCount: number;
}

interface SurahDetail {
  surahName: string;
  verseStart: number;
  verseEnd: number;
  type: 'rabt' | 'tour';
}

function getWeekBounds(): { start: Date; end: Date; startKey: string; endKey: string } {
  const now = new Date();
  const day = now.getDay(); // 0=Sun
  const diffToMon = day === 0 ? 6 : day - 1;
  const start = new Date(now);
  start.setDate(now.getDate() - diffToMon);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return {
    start,
    end,
    startKey: start.toISOString().split('T')[0],
    endKey: end.toISOString().split('T')[0],
  };
}

const DAY_NAMES = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

export default function MurajaWeeklyRecap() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(true);

  const { start, startKey, endKey } = useMemo(() => getWeekBounds(), []);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from('muraja_sessions')
        .select('session_type, difficulty_rating, verses_reviewed, completed_at, created_at')
        .eq('user_id', user.id)
        .gte('created_at', startKey + 'T00:00:00')
        .lte('created_at', endKey + 'T23:59:59')
        .order('created_at', { ascending: true });
      setSessions((data as SessionRow[]) || []);
      setLoading(false);
    })();
  }, [user, startKey, endKey]);

  const { dayStats, totalRabt, totalTour, activeDays, surahDetails } = useMemo(() => {
    // Build 7-day grid
    const days: DayStat[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push({
        date: d.toISOString().split('T')[0],
        dayLabel: DAY_NAMES[i],
        rabtCount: 0,
        tourCount: 0,
      });
    }

    let totalR = 0;
    let totalT = 0;
    const details: SurahDetail[] = [];
    const seenDetails = new Set<string>();

    for (const s of sessions) {
      const dateKey = s.created_at.split('T')[0];
      const day = days.find(d => d.date === dateKey);
      if (!day) continue;

      const verses = Array.isArray(s.verses_reviewed) ? s.verses_reviewed : [];
      const verseCount = verses.reduce((sum: number, v: any) => sum + ((v.end || 0) - (v.start || 0) + 1), 0) || 1;

      if (s.session_type === 'rabt') {
        day.rabtCount += verseCount;
        totalR += verseCount;
      } else {
        day.tourCount += verseCount;
        totalT += verseCount;
      }

      // Collect surah details
      for (const v of verses) {
        const key = `${v.surah}_${v.start}_${v.end}`;
        if (!seenDetails.has(key)) {
          seenDetails.add(key);
          const surahName = SURAHS.find(su => su.number === v.surah)?.name || `Sourate ${v.surah}`;
          details.push({
            surahName,
            verseStart: v.start,
            verseEnd: v.end,
            type: s.session_type === 'rabt' ? 'rabt' : 'tour',
          });
        }
      }
    }

    const active = days.filter(d => d.rabtCount > 0 || d.tourCount > 0).length;

    return { dayStats: days, totalRabt: totalR, totalTour: totalT, activeDays: active, surahDetails: details };
  }, [sessions, start]);

  if (loading) return null;

  const totalVerses = totalRabt + totalTour;
  const maxDay = Math.max(...dayStats.map(d => d.rabtCount + d.tourCount), 1);
  const todayKey = new Date().toISOString().split('T')[0];

  return (
    <div
      className="rounded-2xl p-5 space-y-4"
      style={{
        background: 'var(--p-card)',
        border: '1px solid var(--p-border)',
        boxShadow: 'var(--p-card-shadow)',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #0891B2, #06B6D4)', boxShadow: '0 3px 10px -2px rgba(6, 182, 212, 0.4)' }}
        >
          <BarChart3 className="h-3.5 w-3.5 text-white" />
        </div>
        <h3
          className="text-sm font-bold"
          style={{ fontFamily: "'Playfair Display', Georgia, serif", color: 'var(--p-primary)' }}
        >
          Récap de la semaine
        </h3>
      </div>

      {totalVerses === 0 ? (
        <p className="text-xs text-center py-2" style={{ color: 'var(--p-text-50)' }}>
          Aucune révision cette semaine. Commence dès maintenant in shaa Allah !
        </p>
      ) : (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(6, 182, 212, 0.08)', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
              <p className="text-lg font-extrabold" style={{ color: 'var(--p-primary)' }}>{totalVerses}</p>
              <p className="text-[10px] font-medium" style={{ color: 'var(--p-text-60)' }}>versets révisés</p>
            </div>
            <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <p className="text-lg font-extrabold" style={{ color: 'var(--p-primary)' }}>{activeDays}/7</p>
              <p className="text-[10px] font-medium" style={{ color: 'var(--p-text-60)' }}>jours actifs</p>
            </div>
            <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(212, 175, 55, 0.08)', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
              <p className="text-lg font-extrabold" style={{ color: 'var(--p-primary)' }}>{sessions.length}</p>
              <p className="text-[10px] font-medium" style={{ color: 'var(--p-text-60)' }}>révisions</p>
            </div>
          </div>

          {/* Mini bar chart */}
          <div className="flex items-end justify-between gap-1 h-16 px-1">
            {dayStats.map((day) => {
              const total = day.rabtCount + day.tourCount;
              const height = total > 0 ? Math.max(8, (total / maxDay) * 100) : 4;
              const isToday = day.date === todayKey;
              const rabtRatio = total > 0 ? (day.rabtCount / total) * 100 : 0;

              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex flex-col items-center" style={{ height: '48px', justifyContent: 'flex-end' }}>
                    {total > 0 ? (
                      <motion.div
                        className="w-full max-w-[20px] rounded-t-md overflow-hidden"
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{ duration: 0.5, delay: 0.05 }}
                        style={{ minHeight: '4px' }}
                      >
                        {/* Tour portion */}
                        <div style={{ height: `${100 - rabtRatio}%`, background: 'linear-gradient(180deg, #065F46, #10B981)' }} />
                        {/* Rabt portion */}
                        <div style={{ height: `${rabtRatio}%`, background: 'linear-gradient(180deg, #B8960C, #D4AF37)' }} />
                      </motion.div>
                    ) : (
                      <div
                        className="w-full max-w-[20px] rounded-t-md"
                        style={{ height: '4px', background: 'var(--p-track)' }}
                      />
                    )}
                  </div>
                  <span
                    className="text-[9px] font-bold"
                    style={{
                      color: isToday ? 'var(--p-primary)' : 'var(--p-text-50)',
                    }}
                  >
                    {day.dayLabel}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 text-[10px]">
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ background: '#D4AF37' }} />
              <span style={{ color: 'var(--p-text-60)' }}>Liaison ({totalRabt})</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ background: '#10B981' }} />
              <span style={{ color: 'var(--p-text-60)' }}>Révision ({totalTour})</span>
            </div>
          </div>

          {/* Surah detail */}
          {surahDetails.length > 0 && (
            <div className="space-y-1.5 pt-2" style={{ borderTop: '1px solid var(--p-border)' }}>
              <p className="text-xs font-bold" style={{ color: 'var(--p-text-75)' }}>
                Sourates révisées cette semaine :
              </p>
              {surahDetails.slice(0, 8).map((d, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs"
                  style={{
                    background: d.type === 'rabt' ? 'rgba(212, 175, 55, 0.06)' : 'rgba(16, 185, 129, 0.06)',
                  }}
                >
                  {d.type === 'rabt' ? (
                    <Link className="h-3 w-3 flex-shrink-0" style={{ color: '#D4AF37' }} />
                  ) : (
                    <BookOpen className="h-3 w-3 flex-shrink-0" style={{ color: '#10B981' }} />
                  )}
                  <span className="font-bold" style={{ color: 'var(--p-primary)' }}>{d.surahName}</span>
                  <span className="font-medium" style={{ color: 'var(--p-text-60)' }}>
                    v. {d.verseStart} → {d.verseEnd}
                  </span>
                </div>
              ))}
              {surahDetails.length > 8 && (
                <p className="text-[10px] text-center" style={{ color: 'var(--p-text-50)' }}>
                  + {surahDetails.length - 8} autre{surahDetails.length - 8 > 1 ? 's' : ''} bloc{surahDetails.length - 8 > 1 ? 's' : ''}
                </p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
