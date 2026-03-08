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
        <circle cx="48" cy="48" r={r} fill="none" stroke="#E6F0ED" strokeWidth="5" />
        <motion.circle
          cx="48" cy="48" r={r} fill="none"
          stroke="#065F46" strokeWidth="5" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          transform="rotate(-90 48 48)"
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
        <text x="48" y="44" textAnchor="middle" fill="#065F46" fontSize="18" fontWeight="bold" fontFamily="Inter, sans-serif">
          {value}
        </text>
        <text x="48" y="60" textAnchor="middle" fill="rgba(6,95,70,0.7)" fontSize="9" fontWeight="600">
          / {max}
        </text>
      </svg>
      <span className="text-xs font-medium" style={{ color: 'rgba(28,36,33,0.65)' }}>{label}</span>
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
  const [nextPoint, setNextPoint] = useState<{ surahNumber: number; startVerse: number; endVerse: number; surahName: string } | null>(null);
  const [todayRevisions, setTodayRevisions] = useState<{ surah_number: number; verse_start: number; verse_end: number }[]>([]);

  const greeting = useMemo(() => getGreeting(), []);
  const motivation = useMemo(() => MOTIVATIONS[Math.floor(Math.random() * MOTIVATIONS.length)], []);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
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
      const relevantSessions = (periodSessions || []).filter(s => {
        if (!s.completed_at) return false;
        if (goalData.goal_period === 'daily') {
          return s.completed_at.startsWith(todayStr);
        }
        return true;
      });
      const versesCompleted = relevantSessions.reduce(
        (sum, s) => sum + (s.end_verse - s.start_verse + 1), 0
      );
      if (goalData.goal_unit === 'pages') {
        setPeriodProgress(Math.round((versesCompleted / 15) * 10) / 10);
      } else {
        setPeriodProgress(versesCompleted);
      }
    }

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

    const [point, revisions] = await Promise.all([
      findNextStartingPoint(user.id),
      getTodayRevisions(user.id),
    ]);
    setNextPoint(point);
    setTodayRevisions(revisions);

    setLoading(false);
  };

  useEffect(() => { loadData(); }, [user]);

  if (showGoalEdit) {
    return (
      <AppLayout title="Mon Suivi Hifz">
        <div className="max-w-md mx-auto px-4 py-6" style={{ backgroundColor: '#FDFBF7', minHeight: '100vh' }}>
          <div
            className="min-h-[60vh] rounded-[2rem] p-6"
            style={{
              background: 'linear-gradient(135deg, #065F46 0%, #044E3B 100%)',
              border: '2px solid #D4AF37',
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
      <div className="max-w-md mx-auto px-4 py-6 space-y-6" style={{ backgroundColor: '#FDFBF7', minHeight: '100vh' }}>
        {/* Greeting */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-1">
          <h1 className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#065F46' }}>
            {greeting} 🌙
          </h1>
          <p className="text-sm font-medium" style={{ color: 'rgba(28,36,33,0.65)' }}>{motivation}</p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: '#065F46', borderTopColor: 'transparent' }} />
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
                  background: '#FFFFFF',
                  border: '1px solid #E6F0ED',
                  boxShadow: '0 4px 20px rgba(6,95,70,0.06)',
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4" style={{ color: '#D4AF37' }} />
                    <span className="text-sm font-semibold" style={{ color: '#1C2421' }}>
                      Objectif {goal.goal_period === 'daily' ? 'du jour' : 'de la semaine'}
                    </span>
                  </div>
                  <button
                    onClick={() => setShowGoalEdit(true)}
                    className="p-1.5 rounded-lg transition-colors"
                    style={{ background: '#F0F7F4' }}
                  >
                    <Settings2 className="h-3.5 w-3.5" style={{ color: '#065F46' }} />
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-2xl font-bold" style={{ color: '#D4AF37' }}>
                      {goal.goal_unit === 'pages' ? periodProgress.toFixed(1) : periodProgress}
                    </span>
                     <span className="text-sm font-medium" style={{ color: 'rgba(28,36,33,0.6)' }}>
                       / {goalLabel} {periodLabel}
                     </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: '#E6F0ED' }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: 'linear-gradient(90deg, #065F46, #044E3B)' }}
                      animate={{ width: `${progressPct}%` }}
                      transition={{ duration: 0.6 }}
                    />
                  </div>
                  {progressPct >= 100 && (
                    <p className="text-xs text-center" style={{ color: '#D4AF37' }}>
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
                  background: '#F0F7F4',
                  border: '1px dashed #D4AF37',
                }}
              >
                <Target className="h-6 w-6 mx-auto mb-2" style={{ color: '#D4AF37' }} />
                <p className="text-sm font-medium" style={{ color: 'rgba(28,36,33,0.75)' }}>Définis ton objectif de mémorisation</p>
              </motion.button>
            )}

            {/* ═══ SPLIT DASHBOARD ═══ */}
            <div className="grid grid-cols-1 gap-3">
              {/* Programme du jour (Hifz) */}
              {nextPoint && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                >
                  <Link to="/hifz" className="block">
                    <div
                      className="rounded-2xl p-5"
                      style={{
                        background: '#F0F7F4',
                        border: '1px solid #E6F0ED',
                      }}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ background: '#FFFFFF', border: '1px solid #E6F0ED', boxShadow: '0 2px 8px rgba(6,95,70,0.04)' }}
                        >
                          <BookOpen className="h-5 w-5" style={{ color: '#D4AF37' }} />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold" style={{ color: '#1C2421' }}>Programme du jour</h3>
                          <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'rgba(28,36,33,0.6)' }}>Nouvelle mémorisation</p>
                        </div>
                      </div>
                      <div
                        className="rounded-xl px-4 py-3"
                        style={{ background: '#FFFFFF', border: '1px solid #E6F0ED' }}
                      >
                        <p className="text-sm font-semibold" style={{ color: '#065F46' }}>
                          {nextPoint.surahName}
                        </p>
                         <p className="text-xs font-medium" style={{ color: 'rgba(28,36,33,0.6)' }}>
                           Versets {nextPoint.startVerse} → {nextPoint.endVerse}
                         </p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )}

              {/* Révision du jour (Acquis) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Link to="/muraja" className="block">
                  <div
                    className="rounded-2xl p-5"
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #E6F0ED',
                      boxShadow: '0 4px 20px rgba(6,95,70,0.06)',
                    }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: '#F0F7F4', border: '1px solid #E6F0ED' }}
                      >
                        <RefreshCw className="h-5 w-5" style={{ color: '#D4AF37' }} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold" style={{ color: '#1C2421' }}>Révision du jour</h3>
                        <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'rgba(28,36,33,0.6)' }}>Acquis à consolider</p>
                      </div>
                    </div>
                    {todayRevisions.length > 0 ? (
                      <div className="space-y-1.5">
                        {todayRevisions.slice(0, 4).map((rev, i) => {
                          const surah = SURAHS.find(s => s.number === rev.surah_number);
                          return (
                            <div
                              key={i}
                              className="rounded-lg px-3 py-2 flex items-center justify-between"
                              style={{ background: '#F0F7F4', border: '1px solid #E6F0ED' }}
                            >
                               <span className="text-xs font-semibold" style={{ color: '#1C2421' }}>{surah?.name || `Sourate ${rev.surah_number}`}</span>
                               <span className="text-[10px] font-medium" style={{ color: 'rgba(28,36,33,0.6)' }}>v.{rev.verse_start}-{rev.verse_end}</span>
                            </div>
                          );
                        })}
                        {todayRevisions.length > 4 && (
                          <p className="text-[10px] font-medium text-center" style={{ color: 'rgba(28,36,33,0.6)' }}>+{todayRevisions.length - 4} autres portions</p>
                        )}
                      </div>
                    ) : (
                      <div
                        className="rounded-xl px-4 py-3 text-center"
                        style={{ background: '#F0F7F4' }}
                      >
                        <p className="text-xs font-medium" style={{ color: 'rgba(28,36,33,0.6)' }}>Aucune révision prévue aujourd'hui ✨</p>
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>
            </div>

            {/* 3 KPI Cards */}
            <div className="grid grid-cols-3 gap-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="rounded-2xl p-4 flex flex-col items-center gap-2"
                style={{ background: '#FFFFFF', border: '1px solid #E6F0ED', boxShadow: '0 4px 20px rgba(6,95,70,0.06)' }}
              >
                <Flame className="h-5 w-5" style={{ color: '#D4AF37' }} />
                <span className="text-2xl font-bold" style={{ color: '#065F46' }}>{streak.current}</span>
                 <span className="text-[10px] font-medium text-center leading-tight" style={{ color: 'rgba(28,36,33,0.65)' }}>Jours consécutifs</span>
                 <span className="text-[9px] font-medium" style={{ color: 'rgba(28,36,33,0.55)' }}>Record : {streak.longest}</span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="rounded-2xl p-3 flex flex-col items-center"
                style={{ background: '#FFFFFF', border: '1px solid #E6F0ED', boxShadow: '0 4px 20px rgba(6,95,70,0.06)' }}
              >
                <CircularGauge value={totalVerses} max={Math.max(totalVerses, 50)} label="Versets ancrés" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="rounded-2xl p-4 flex flex-col items-center gap-2"
                style={{ background: '#FFFFFF', border: '1px solid #E6F0ED', boxShadow: '0 4px 20px rgba(6,95,70,0.06)' }}
              >
                <RotateCcw className="h-5 w-5" style={{ color: '#D4AF37' }} />
                <span className="text-2xl font-bold" style={{ color: '#065F46' }}>{streak.tours}</span>
                <span className="text-[10px] font-medium text-center leading-tight" style={{ color: 'rgba(28,36,33,0.65)' }}>Cycles terminés</span>
              </motion.div>
            </div>

            {/* Weekly chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="rounded-2xl p-5"
              style={{ background: '#FFFFFF', border: '1px solid #E6F0ED', boxShadow: '0 4px 20px rgba(6,95,70,0.06)' }}
            >
              <h3 className="text-sm font-bold mb-4" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#065F46' }}>
                Activité des 7 derniers jours
              </h3>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={weeklyData} barCategoryGap="30%">
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'rgba(28,36,33,0.5)', fontSize: 11 }} />
                  <YAxis hide allowDecimals={false} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={28}>
                    {weeklyData.map((entry, i) => (
                      <Cell key={i} fill={entry.count > 0 ? 'rgba(212,175,55,0.85)' : '#E6F0ED'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Empty state */}
            {totalVerses === 0 && streak.current === 0 && (
              <div
                className="rounded-2xl p-6 text-center"
                style={{ background: 'linear-gradient(135deg, #065F46, #044E3B)', border: '1px solid #D4AF37' }}
              >
                <BookOpenCheck className="h-8 w-8 mx-auto mb-3" style={{ color: '#D4AF37' }} />
                <p className="text-sm" style={{ color: 'rgba(253,251,247,0.85)' }}>
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
