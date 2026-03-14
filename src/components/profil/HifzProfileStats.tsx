import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HifzActivitySummary } from '@/components/hifz/HifzActivitySummary';
import { BookOpen, Flame, Clock, GraduationCap } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Area, AreaChart, ResponsiveContainer, XAxis, Tooltip } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

interface DayData {
  date: string;
  label: string;
  cumulative: number;
}

export function HifzProfileStats() {
  const { user } = useAuth();
  const [totalVerses, setTotalVerses] = useState(0);
  const [totalSessions, setTotalSessions] = useState(0);
  const [streak, setStreak] = useState(0);
  const [avgMinutes, setAvgMinutes] = useState(0);
  const [chartData, setChartData] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);

  const today = useMemo(() => new Date(), []);

  useEffect(() => {
    if (!user) return;
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    if (!user) return;

    const [versesRes, hifzSessionsRes, murajaSessionsRes, streakHifzRes, streakMurajaRes] = await Promise.all([
      supabase
        .from('hifz_memorized_verses')
        .select('verse_start, verse_end, memorized_at')
        .eq('user_id', user.id),
      supabase
        .from('hifz_sessions')
        .select('started_at, completed_at')
        .eq('user_id', user.id)
        .not('completed_at', 'is', null),
      supabase
        .from('muraja_sessions')
        .select('completed_at')
        .eq('user_id', user.id)
        .not('completed_at', 'is', null),
      supabase
        .from('hifz_sessions')
        .select('completed_at')
        .eq('user_id', user.id)
        .not('completed_at', 'is', null)
        .gte('completed_at', format(subDays(today, 60), 'yyyy-MM-dd')),
      supabase
        .from('muraja_sessions')
        .select('completed_at')
        .eq('user_id', user.id)
        .not('completed_at', 'is', null)
        .gte('completed_at', format(subDays(today, 60), 'yyyy-MM-dd')),
    ]);

    // Total verses
    let total = 0;
    const verses = versesRes.data || [];
    for (const v of verses) {
      total += (v.verse_end - v.verse_start + 1);
    }
    setTotalVerses(total);

    // Total sessions
    const hifzCount = hifzSessionsRes.data?.length || 0;
    const murajaCount = murajaSessionsRes.data?.length || 0;
    setTotalSessions(hifzCount + murajaCount);

    // Average session duration
    const durations: number[] = [];
    for (const s of hifzSessionsRes.data || []) {
      if (s.started_at && s.completed_at) {
        const mins = (new Date(s.completed_at).getTime() - new Date(s.started_at).getTime()) / 60000;
        if (mins > 0 && mins < 300) durations.push(mins);
      }
    }
    setAvgMinutes(durations.length > 0 ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0);

    // Streak
    const daySet = new Set<string>();
    for (const s of streakHifzRes.data || []) {
      daySet.add(format(new Date(s.completed_at!), 'yyyy-MM-dd'));
    }
    for (const s of streakMurajaRes.data || []) {
      daySet.add(format(new Date(s.completed_at!), 'yyyy-MM-dd'));
    }
    let currentStreak = 0;
    for (let i = 0; i < 60; i++) {
      const key = format(subDays(today, i), 'yyyy-MM-dd');
      if (daySet.has(key)) {
        currentStreak++;
      } else if (i === 0) {
        continue;
      } else {
        break;
      }
    }
    setStreak(currentStreak);

    // Chart data - 30 days cumulative
    const thirtyDaysAgo = subDays(today, 29);
    const versesBeforeWindow = verses.filter(
      v => new Date(v.memorized_at) < thirtyDaysAgo
    ).reduce((acc, v) => acc + (v.verse_end - v.verse_start + 1), 0);

    const dayMap = new Map<string, number>();
    for (const v of verses) {
      const d = format(new Date(v.memorized_at), 'yyyy-MM-dd');
      dayMap.set(d, (dayMap.get(d) || 0) + (v.verse_end - v.verse_start + 1));
    }

    const data: DayData[] = [];
    let cumulative = versesBeforeWindow;
    for (let i = 0; i < 30; i++) {
      const d = subDays(today, 29 - i);
      const key = format(d, 'yyyy-MM-dd');
      cumulative += (dayMap.get(key) || 0);
      data.push({
        date: key,
        label: format(d, 'd MMM', { locale: fr }),
        cumulative,
      });
    }
    setChartData(data);
    setLoading(false);
  };

  if (!user) return null;

  if (loading) {
    return (
      <Card className="rounded-2xl">
        <CardHeader><Skeleton className="h-6 w-40" /></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
          </div>
          <Skeleton className="h-40 rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  const kpis = [
    { icon: BookOpen, label: 'Versets mémorisés', value: totalVerses, color: 'hsl(var(--primary))' },
    { icon: GraduationCap, label: 'Sessions', value: totalSessions, color: 'hsl(var(--accent))' },
    { icon: Flame, label: 'Streak', value: `${streak}j`, color: 'hsl(20, 80%, 55%)' },
    { icon: Clock, label: 'Moy. / session', value: avgMinutes > 0 ? `${avgMinutes} min` : '—', color: 'hsl(var(--sky))' },
  ];

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          📊 Mes statistiques Hifz
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* KPI Grid */}
        <div className="grid grid-cols-2 gap-3">
          {kpis.map((kpi) => (
            <div
              key={kpi.label}
              className="rounded-xl p-3 flex flex-col items-center gap-1 bg-muted/50 border border-border/50"
            >
              <kpi.icon className="h-5 w-5" style={{ color: kpi.color }} />
              <span className="text-xl font-bold text-foreground">{kpi.value}</span>
              <span className="text-[11px] text-muted-foreground text-center leading-tight">{kpi.label}</span>
            </div>
          ))}
        </div>

        {/* Chart */}
        {totalVerses > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Progression (30 jours)</p>
            <div className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
                  <defs>
                    <linearGradient id="hifzGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(158, 45%, 70%)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="hsl(158, 45%, 70%)" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                    formatter={(value: number) => [`${value} versets`, 'Total']}
                    labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="cumulative"
                    stroke="hsl(158, 45%, 60%)"
                    strokeWidth={2}
                    fill="url(#hifzGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Weekly bar */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Régularité cette semaine</p>
          <HifzActivitySummary userId={user.id} />
        </div>
      </CardContent>
    </Card>
  );
}
