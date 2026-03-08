import { useState, useEffect, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { motion } from 'framer-motion';
import { Flame, BookOpenCheck, RotateCcw, Target, Settings2, BookOpen, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Progress } from '@/components/ui/progress';
import HifzGoalOnboarding from '@/components/hifz/HifzGoalOnboarding';
import { findNextStartingPoint, getTodayRevisions } from '@/lib/hifzUtils';
import { SURAHS } from '@/lib/surahData';
import { Link } from 'react-router-dom';

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 6) return 'Bonne nuit';
  if (h < 12) return 'Sabah al-khayr';
  if (h < 18) return 'Bon après-midi';
  return 'Masa al-khayr';
}

const MOTIVATIONS = [
  "Prête pour ton ancrage aujourd'hui ?",
  "Chaque verset compte auprès d'Allah (عز وجل).",
  "La constance est la clé de la mémorisation.",
  "Qu'Allah (عز وجل) te facilite ce chemin.",
];

function CircularGauge({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = max > 0 ? Math.min(value / max, 1) : 0;
  const r = 38;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct);

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="96" height="96" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r={r} fill="none" stroke="rgba(212,175,55,0.15)" strokeWidth="5" />
        <motion.circle
          cx="48" cy="48" r={r} fill="none"
          stroke="#d4af37" strokeWidth="5" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          transform="rotate(-90 48 48)"
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
        <text x="48" y="44" textAnchor="middle" fill="#d4af37" fontSize="18" fontWeight="bold" fontFamily="Inter, sans-serif">
          {value}
        </text>
        <text x="48" y="60" textAnchor="middle" fill="rgba(212,175,55,0.6)" fontSize="9">
          / {max}
        </text>
      </svg>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

const DAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

interface HifzGoal {
  id: string;
  goal_period: string;
  goal_unit: string;
  goal_value: number;
}

export default function HifzSuiviPage() {
  const { user } = useAuth();
  const [streak, setStreak] = useState({ current: 0, longest: 0, tours: 0 });
  const [totalVerses, setTotalVerses] = useState(0);
  const [weeklyData, setWeeklyData] = useState<{ day: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [goal, setGoal] = useState<HifzGoal | null>(null);
  const [periodProgress, setPeriodProgress] = useState(0);
  const [showGoalEdit, setShowGoalEdit] = useState(false);

  const greeting = useMemo(() => getGreeting(), []);
  const motivation = useMemo(() => MOTIVATIONS[Math.floor(Math.random() * MOTIVATIONS.length)], []);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);

    // Fetch all data in parallel
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Week start (Monday)
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - mondayOffset);
    const weekStartStr = weekStart.toISOString().split('T')[0];

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const [
      { data: streakData },
      { count },
      { data: goalData },
      { data: murajaSessions },
      { data: hifzSessions },
      { data: periodSessions },
    ] = await Promise.all([
      supabase.from('hifz_streaks').select('*').eq('user_id', user.id).maybeSingle(),
      supabase.from('hifz_memorized_verses').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('hifz_goals').select('*').eq('user_id', user.id).eq('is_active', true).maybeSingle(),
      supabase.from('muraja_sessions').select('created_at').eq('user_id', user.id).gte('created_at', sevenDaysAgo.toISOString()),
      supabase.from('hifz_sessions').select('created_at').eq('user_id', user.id).gte('created_at', sevenDaysAgo.toISOString()),
      // Fetch completed sessions for goal period calculation
      supabase.from('hifz_sessions')
        .select('start_verse, end_verse, completed_at')
        .eq('user_id', user.id)
        .not('completed_at', 'is', null)
        .gte('completed_at', weekStartStr + 'T00:00:00Z'),
    ]);

    if (streakData) {
      setStreak({ current: streakData.current_streak, longest: streakData.longest_streak, tours: streakData.total_tours_completed });
    }
    setTotalVerses(count || 0);

    if (goalData) {
      setGoal(goalData as HifzGoal);

      // Calculate progress based on period
      const relevantSessions = (periodSessions || []).filter(s => {
        if (!s.completed_at) return false;
        if (goalData.goal_period === 'daily') {
          return s.completed_at.startsWith(todayStr);
        }
        return true; // weekly already filtered by weekStartStr
      });

      const versesCompleted = relevantSessions.reduce(
        (sum, s) => sum + (s.end_verse - s.start_verse + 1), 0
      );

      // Convert to goal unit if needed
      if (goalData.goal_unit === 'pages') {
        // ~15 verses per page approximation
        setPeriodProgress(Math.round((versesCompleted / 15) * 10) / 10);
      } else {
        setPeriodProgress(versesCompleted);
      }
    }

    // Weekly chart
    const dayCounts: Record<string, number> = {};
    const allSessions = [...(murajaSessions || []), ...(hifzSessions || [])];
    for (const s of allSessions) {
      const dateKey = s.created_at.split('T')[0];
      dayCounts[dateKey] = (dayCounts[dateKey] || 0) + 1;
    }

    const chartData: { day: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const jsDay = d.getDay();
      const label = DAY_LABELS[jsDay === 0 ? 6 : jsDay - 1];
      chartData.push({ day: label, count: dayCounts[key] || 0 });
    }
    setWeeklyData(chartData);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [user]);

  if (showGoalEdit) {
    return (
      <AppLayout title="Mon Suivi Hifz">
        <div className="max-w-md mx-auto px-4 py-6">
          <div
            className="min-h-[60vh] rounded-[2rem] p-6"
            style={{
              background: 'linear-gradient(135deg, #0d7377 0%, #14919b 50%, #0d7377 100%)',
              border: '2px solid rgba(212,175,55,0.4)',
            }}
          >
            <HifzGoalOnboarding
              existingGoal={goal}
              onGoalSet={() => { setShowGoalEdit(false); loadData(); }}
            />
          </div>
        </div>
      </AppLayout>
    );
  }

  const goalLabel = goal
    ? `${goal.goal_unit === 'pages' ? (goal.goal_value === 0.5 ? '½ page' : `${goal.goal_value} page${goal.goal_value > 1 ? 's' : ''}`) : `${goal.goal_value} verset${goal.goal_value > 1 ? 's' : ''}`}`
    : '';
  const periodLabel = goal?.goal_period === 'daily' ? "aujourd'hui" : 'cette semaine';
  const progressPct = goal ? Math.min((periodProgress / goal.goal_value) * 100, 100) : 0;

  return (
    <AppLayout title="Mon Suivi Hifz">
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Greeting */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-1">
          <h1 className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#d4af37' }}>
            {greeting} 🌙
          </h1>
          <p className="text-sm text-muted-foreground">{motivation}</p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Goal Progress Card */}
            {goal && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="rounded-2xl p-5"
                style={{
                  background: 'linear-gradient(135deg, rgba(13,115,119,0.18), rgba(20,145,155,0.1))',
                  border: '1px solid rgba(212,175,55,0.25)',
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4" style={{ color: '#d4af37' }} />
                    <span className="text-sm font-semibold text-white/90">
                      Objectif {goal.goal_period === 'daily' ? 'du jour' : 'de la semaine'}
                    </span>
                  </div>
                  <button
                    onClick={() => setShowGoalEdit(true)}
                    className="p-1.5 rounded-lg transition-colors"
                    style={{ background: 'rgba(212,175,55,0.1)' }}
                  >
                    <Settings2 className="h-3.5 w-3.5" style={{ color: '#d4af37' }} />
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-2xl font-bold" style={{ color: '#d4af37' }}>
                      {goal.goal_unit === 'pages' ? periodProgress.toFixed(1) : periodProgress}
                    </span>
                    <span className="text-sm text-white/50">
                      / {goalLabel} {periodLabel}
                    </span>
                  </div>
                  <Progress
                    value={progressPct}
                    className="h-2.5 bg-white/10"
                  />
                  {progressPct >= 100 && (
                    <p className="text-xs text-center" style={{ color: '#d4af37' }}>
                      ✨ Objectif atteint, ma shaa Allah !
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {/* No goal set */}
            {!goal && (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setShowGoalEdit(true)}
                className="w-full rounded-2xl p-5 text-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(13,115,119,0.15), rgba(20,145,155,0.08))',
                  border: '1px dashed rgba(212,175,55,0.3)',
                }}
              >
                <Target className="h-6 w-6 mx-auto mb-2" style={{ color: '#d4af37' }} />
                <p className="text-sm text-white/70">Définis ton objectif de mémorisation</p>
              </motion.button>
            )}

            {/* 3 KPI Cards */}
            <div className="grid grid-cols-3 gap-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="rounded-2xl p-4 flex flex-col items-center gap-2"
                style={{ background: 'linear-gradient(135deg, rgba(13,115,119,0.15), rgba(20,145,155,0.08))', border: '1px solid rgba(212,175,55,0.2)' }}
              >
                <Flame className="h-5 w-5" style={{ color: '#d4af37' }} />
                <span className="text-2xl font-bold" style={{ color: '#0d7377' }}>{streak.current}</span>
                <span className="text-[10px] text-muted-foreground text-center leading-tight">Jours consécutifs</span>
                <span className="text-[9px] text-muted-foreground/60">Record : {streak.longest}</span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="rounded-2xl p-3 flex flex-col items-center"
                style={{ background: 'linear-gradient(135deg, rgba(13,115,119,0.15), rgba(20,145,155,0.08))', border: '1px solid rgba(212,175,55,0.2)' }}
              >
                <CircularGauge value={totalVerses} max={Math.max(totalVerses, 50)} label="Versets ancrés" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="rounded-2xl p-4 flex flex-col items-center gap-2"
                style={{ background: 'linear-gradient(135deg, rgba(13,115,119,0.15), rgba(20,145,155,0.08))', border: '1px solid rgba(212,175,55,0.2)' }}
              >
                <RotateCcw className="h-5 w-5" style={{ color: '#d4af37' }} />
                <span className="text-2xl font-bold" style={{ color: '#0d7377' }}>{streak.tours}</span>
                <span className="text-[10px] text-muted-foreground text-center leading-tight">Cycles terminés</span>
              </motion.div>
            </div>

            {/* Weekly chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="rounded-2xl p-5"
              style={{ background: 'linear-gradient(135deg, rgba(13,115,119,0.12), rgba(20,145,155,0.06))', border: '1px solid rgba(212,175,55,0.15)' }}
            >
              <h3 className="text-sm font-semibold mb-4" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#d4af37' }}>
                Activité des 7 derniers jours
              </h3>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={weeklyData} barCategoryGap="30%">
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                  <YAxis hide allowDecimals={false} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={28}>
                    {weeklyData.map((entry, i) => (
                      <Cell key={i} fill={entry.count > 0 ? 'rgba(212,175,55,0.7)' : 'rgba(13,115,119,0.15)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Empty state */}
            {totalVerses === 0 && streak.current === 0 && (
              <div
                className="rounded-2xl p-6 text-center"
                style={{ background: 'linear-gradient(135deg, #0d7377, #14919b)', border: '1px solid rgba(212,175,55,0.3)' }}
              >
                <BookOpenCheck className="h-8 w-8 mx-auto mb-3" style={{ color: '#d4af37' }} />
                <p className="text-white/80 text-sm">
                  Ton tableau de bord se remplira dès ta première session de Hifz in shaa Allah !
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
