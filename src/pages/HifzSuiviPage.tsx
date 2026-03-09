import { useState, useEffect, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { motion } from 'framer-motion';
import { Flame, BookOpenCheck, RotateCcw, Target, Settings2, BookOpen, RefreshCw, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Progress } from '@/components/ui/progress';
import HifzGoalOnboarding from '@/components/hifz/HifzGoalOnboarding';
import { findNextStartingPoint, getTodayRevisions } from '@/lib/hifzUtils';
import { SURAHS } from '@/lib/surahData';
import { Link } from 'react-router-dom';
import { getTodayQuote } from '@/lib/dailyQuotes';

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 6) return 'Bonne nuit';
  if (h < 12) return 'Sabah al-khayr';
  if (h < 18) return 'Bon après-midi';
  return 'Masa al-khayr';
}


function CircularGauge({ value, max, label, hideMax }: { value: number; max: number; label: string; hideMax?: boolean }) {
  const pct = max > 0 ? Math.min(value / max, 1) : 0;
  const r = 32;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct);

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="80" height="80" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={r} fill="none" stroke="var(--p-track)" strokeWidth="5" />
        <motion.circle
          cx="40" cy="40" r={r} fill="none"
          stroke="var(--p-primary)" strokeWidth="5" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          transform="rotate(-90 40 40)"
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
        <text x="40" y={hideMax ? 44 : 38} textAnchor="middle" fill="var(--p-primary)" fontSize="16" fontWeight="bold" fontFamily="Inter, sans-serif">
          {value}
        </text>
        {!hideMax && (
          <text x="40" y="52" textAnchor="middle" fill="var(--p-text-60)" fontSize="8" fontWeight="600">
            / {max}
          </text>
        )}
      </svg>
      <span className="text-[10px] font-medium" style={{ color: 'var(--p-text-65)' }}>{label}</span>
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
  const [weeklyData, setWeeklyData] = useState<{ day: string; hifz: number; muraja: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [goal, setGoal] = useState<HifzGoal | null>(null);
  const [periodProgress, setPeriodProgress] = useState(0);
  const [periodVerses, setPeriodVerses] = useState(0);
  const [showGoalEdit, setShowGoalEdit] = useState(false);
  const [nextPoint, setNextPoint] = useState<{ surahNumber: number; startVerse: number; endVerse: number; surahName: string } | null>(null);
  const [todayRevisions, setTodayRevisions] = useState<{ surah_number: number; verse_start: number; verse_end: number }[]>([]);

  const greeting = useMemo(() => getGreeting(), []);
  const todayQuote = useMemo(() => getTodayQuote(), []);
  const [displayName, setDisplayName] = useState(() => localStorage.getItem('user_display_name') || localStorage.getItem('guest_first_name') || '');

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
      { data: versesData },
      { data: goalData },
      { data: murajaSessions },
      { data: hifzSessions },
      { data: periodSessions },
    ] = await Promise.all([
      supabase.from('hifz_streaks').select('*').eq('user_id', user.id).maybeSingle(),
      supabase.from('hifz_memorized_verses').select('verse_start, verse_end').eq('user_id', user.id),
      supabase.from('hifz_goals').select('*').eq('user_id', user.id).eq('is_active', true).maybeSingle(),
      supabase.from('muraja_sessions').select('verses_reviewed, created_at').eq('user_id', user.id).gte('created_at', sevenDaysAgo.toISOString()),
      supabase.from('hifz_sessions').select('start_verse, end_verse, created_at').eq('user_id', user.id).gte('created_at', sevenDaysAgo.toISOString()),
      supabase.from('hifz_sessions')
        .select('start_verse, end_verse, completed_at')
        .eq('user_id', user.id)
        .not('completed_at', 'is', null)
        .gte('completed_at', weekStartStr + 'T00:00:00Z'),
    ]);

    if (streakData) {
      setStreak({ current: streakData.current_streak, longest: streakData.longest_streak, tours: streakData.total_tours_completed });
    }
    const realTotalVerses = (versesData || []).reduce(
      (sum: number, v: any) => sum + (v.verse_end - v.verse_start + 1), 0
    );
    setTotalVerses(realTotalVerses);

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
      setPeriodVerses(versesCompleted);
      if (goalData.goal_unit === 'pages') {
        setPeriodProgress(Math.round((versesCompleted / 15) * 10) / 10);
      } else {
        setPeriodProgress(versesCompleted);
      }
    }

    const hifzCounts: Record<string, number> = {};
    const murajaCounts: Record<string, number> = {};
    for (const s of (hifzSessions || [])) {
      const dateKey = s.created_at.split('T')[0];
      const verses = (s.end_verse - s.start_verse + 1);
      hifzCounts[dateKey] = (hifzCounts[dateKey] || 0) + verses;
    }
    for (const s of (murajaSessions || [])) {
      const dateKey = s.created_at.split('T')[0];
      const reviewed = Array.isArray(s.verses_reviewed) ? s.verses_reviewed as any[] : [];
      const verses = reviewed.reduce((sum: number, r: any) => sum + (Number(r.verse_end || r.end_verse || r.end || 0) - Number(r.verse_start || r.start_verse || r.start || 0) + 1), 0);
      murajaCounts[dateKey] = (murajaCounts[dateKey] || 0) + (Number(verses) > 0 ? Number(verses) : 1);
    }

    const chartData: { day: string; hifz: number; muraja: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const jsDay = d.getDay();
      const dayName = DAY_LABELS[jsDay === 0 ? 6 : jsDay - 1];
      const dayNum = d.getDate();
      const label = `${dayName} ${dayNum}`;
      chartData.push({ day: label, hifz: hifzCounts[key] || 0, muraja: murajaCounts[key] || 0 });
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
        <div className="max-w-md mx-auto px-4 py-6" style={{ backgroundColor: 'var(--p-bg)', minHeight: '100vh' }}>
          <div
            className="min-h-[60vh] rounded-[2rem] p-6"
            style={{
              background: 'var(--p-gradient-bg)',
              border: '2px solid var(--p-accent)',
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
      <div className="max-w-md mx-auto px-4 py-6 space-y-6" style={{ backgroundColor: 'var(--p-bg)', minHeight: '100vh' }}>
        {/* Greeting */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-1">
          <h1 className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: 'var(--p-primary)' }}>
            {greeting}{displayName ? `, ${displayName}` : ''} 🌙
          </h1>
          <p className="text-sm font-medium" style={{ color: 'var(--p-text-65)' }}>{todayQuote.text}</p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: 'var(--p-primary)', borderTopColor: 'transparent' }} />
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
                  background: 'var(--p-card)',
                  border: '1px solid var(--p-border)',
                  boxShadow: 'var(--p-card-shadow)',
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #065F46, #10B981)' }}>
                      <Target className="h-3.5 w-3.5 text-white" />
                    </div>
                    <span className="text-sm font-semibold" style={{ color: 'var(--p-text)' }}>
                      Objectif {goal.goal_period === 'daily' ? 'du jour' : 'de la semaine'}
                    </span>
                  </div>
                  <button
                    onClick={() => setShowGoalEdit(true)}
                    className="p-1.5 rounded-lg transition-colors"
                    style={{ background: 'var(--p-card-active)' }}
                  >
                    <Settings2 className="h-3.5 w-3.5" style={{ color: 'var(--p-primary)' }} />
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-2xl font-bold" style={{ color: 'var(--p-accent)' }}>
                      {goal.goal_unit === 'pages' ? periodProgress.toFixed(1) : periodProgress}
                    </span>
                    <span className="text-sm font-medium" style={{ color: 'var(--p-text-60)' }}>
                      / {goalLabel} {periodLabel}
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--p-track)' }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: 'var(--p-gradient-fill)' }}
                      animate={{ width: `${progressPct}%` }}
                      transition={{ duration: 0.6 }}
                    />
                  </div>
                  <p className="text-[11px] text-center mt-1" style={{ color: 'var(--p-text-55)' }}>
                    ≈ {periodVerses} verset{periodVerses > 1 ? 's' : ''} mémorisé{periodVerses > 1 ? 's' : ''}
                  </p>
                  {progressPct >= 100 && (
                    <p className="text-xs text-center" style={{ color: 'var(--p-accent)' }}>
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
                  background: 'var(--p-card-active)',
                  border: '1px dashed var(--p-accent)',
                }}
              >
                <Target className="h-6 w-6 mx-auto mb-2" style={{ color: 'var(--p-accent)' }} />
                <p className="text-sm font-medium" style={{ color: 'var(--p-text-75)' }}>Définis ton objectif de mémorisation</p>
              </motion.button>
            )}

            {/* ═══ DUAL CIRCLES ═══ */}
            <div className="grid grid-cols-2 gap-5">
              {/* Programme du jour */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
              >
                <Link to="/hifz" className="block">
                  <div
                    className="w-full aspect-square rounded-full flex flex-col items-center justify-center text-center p-5 transition-transform hover:scale-[1.03]"
                    style={{
                      background: 'linear-gradient(145deg, var(--p-card), var(--p-card-active))',
                      border: '2px solid rgba(16, 185, 129, 0.3)',
                      boxShadow: '0 4px 20px rgba(16, 185, 129, 0.1)',
                    }}
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center mb-1.5"
                      style={{ background: 'linear-gradient(135deg, #065F46, #10B981)', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }}
                    >
                      <BookOpen className="h-[18px] w-[18px] text-white" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider mb-1 leading-tight" style={{ color: 'var(--p-text-60)' }}>
                      Programme de mémorisation
                    </span>
                    {nextPoint ? (
                      <>
                        <span className="text-sm font-semibold leading-tight" style={{ color: 'var(--p-primary)' }}>
                          {nextPoint.surahName}
                        </span>
                        <span className="text-xs font-medium" style={{ color: 'var(--p-text-60)' }}>
                          v. {nextPoint.startVerse} → {nextPoint.endVerse}
                        </span>
                      </>
                    ) : (
                      <span className="text-xs font-medium" style={{ color: 'var(--p-text-60)' }}>
                        Aucun pour l'instant
                      </span>
                    )}
                  </div>
                </Link>
              </motion.div>

              {/* Révision du jour */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Link to="/muraja" className="block">
                  <div
                    className="w-full aspect-square rounded-full flex flex-col items-center justify-center text-center p-5 transition-transform hover:scale-[1.03]"
                    style={{
                      background: 'linear-gradient(145deg, var(--p-card), var(--p-card-active))',
                      border: '2px solid rgba(212, 175, 55, 0.3)',
                      boxShadow: '0 4px 20px rgba(212, 175, 55, 0.1)',
                    }}
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center mb-1.5"
                      style={{ background: 'linear-gradient(135deg, #B8960C, #D4AF37)', boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)' }}
                    >
                      <RefreshCw className="h-[18px] w-[18px] text-white" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--p-text-60)' }}>
                      À réviser
                    </span>
                    {todayRevisions.length > 0 ? (
                      <>
                        <span className="text-sm font-semibold leading-tight" style={{ color: 'var(--p-primary)' }}>
                          {SURAHS.find(s => s.number === todayRevisions[0].surah_number)?.name || `Sourate ${todayRevisions[0].surah_number}`}
                        </span>
                        <span className="text-xs font-medium" style={{ color: 'var(--p-text-60)' }}>
                          v. {todayRevisions[0].verse_start} → {todayRevisions[0].verse_end}
                        </span>
                        {todayRevisions.length > 1 && (
                          <span className="text-[10px] font-medium mt-0.5" style={{ color: 'var(--p-accent)' }}>
                            +{todayRevisions.length - 1} autre{todayRevisions.length > 2 ? 's' : ''}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-xs font-medium" style={{ color: 'var(--p-text-60)' }}>
                        Aucune révision ✨
                      </span>
                    )}
                  </div>
                </Link>
              </motion.div>
            </div>

            {/* 3 KPI Cards */}
            <div className="grid grid-cols-3 gap-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="rounded-2xl p-3 flex flex-col items-center gap-1.5"
                style={{ background: 'var(--p-card)', border: '1px solid var(--p-border)', boxShadow: 'var(--p-card-shadow)' }}
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #D97706, #F59E0B)', boxShadow: '0 4px 10px rgba(245, 158, 11, 0.3)' }}>
                  <Flame className="h-4 w-4 text-white" />
                </div>
                <span className="text-xl font-bold" style={{ color: 'var(--p-primary)' }}>{streak.current}</span>
                <span className="text-[10px] font-medium text-center leading-tight" style={{ color: 'var(--p-text-65)' }}>Jours consécutifs</span>
                <span className="text-[9px] font-medium" style={{ color: 'var(--p-text-55)' }}>Record : {streak.longest}</span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="rounded-2xl p-2 flex flex-col items-center justify-center"
                style={{ background: 'var(--p-card)', border: '1px solid var(--p-border)', boxShadow: 'var(--p-card-shadow)' }}
              >
                <CircularGauge value={totalVerses} max={6236} label="Versets ancrés" hideMax />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="rounded-2xl p-3 flex flex-col items-center gap-1.5"
                style={{ background: 'var(--p-card)', border: '1px solid var(--p-border)', boxShadow: 'var(--p-card-shadow)' }}
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #065F46, #10B981)', boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)' }}>
                  <RotateCcw className="h-4 w-4 text-white" />
                </div>
                <span className="text-xl font-bold" style={{ color: 'var(--p-primary)' }}>{streak.tours}</span>
                <span className="text-[10px] font-medium text-center leading-tight" style={{ color: 'var(--p-text-65)' }}>Cycles terminés</span>
              </motion.div>
            </div>

            {/* Weekly chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="rounded-2xl p-5"
              style={{ background: 'var(--p-card)', border: '1px solid var(--p-border)', boxShadow: 'var(--p-card-shadow)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6D28D9, #8B5CF6)', boxShadow: '0 3px 8px rgba(109, 40, 217, 0.25)' }}>
                    <BarChart3 className="h-3.5 w-3.5 text-white" />
                  </div>
                  <h3 className="text-sm font-bold" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: 'var(--p-primary)' }}>
                    Versets travaillés (7 jours)
                  </h3>
                </div>
                <span className="text-[11px] font-medium capitalize" style={{ color: 'var(--p-text-55)' }}>
                  {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                </span>
              </div>
              <div className="flex items-center gap-3 mb-1 justify-end">
                <span className="flex items-center gap-1 text-[10px] font-medium" style={{ color: 'var(--p-text-55)' }}>
                  <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: 'var(--p-accent)' }} /> Hifz
                </span>
                <span className="flex items-center gap-1 text-[10px] font-medium" style={{ color: 'var(--p-text-55)' }}>
                  <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: 'var(--p-primary)' }} /> Muraja'a
                </span>
              </div>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={weeklyData} barCategoryGap="30%">
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'var(--p-text-65)', fontSize: 9, fontWeight: 500 }} />
                  <YAxis axisLine={false} tickLine={false} allowDecimals={false} tick={{ fill: 'var(--p-text-55)', fontSize: 9 }} width={28} />
                  <Tooltip
                    cursor={false}
                    contentStyle={{ background: 'var(--p-card)', border: '1px solid var(--p-border)', borderRadius: 8, fontSize: 12 }}
                    formatter={(value: number, name: string) => [`${value} verset${value > 1 ? 's' : ''}`, name === 'hifz' ? 'Hifz' : "Muraja'a"]}
                    labelStyle={{ color: 'var(--p-text-65)', fontWeight: 600 }}
                  />
                  <Bar dataKey="hifz" stackId="a" fill="var(--p-accent)" maxBarSize={28} radius={[0, 0, 0, 0]} />
                  <Bar dataKey="muraja" stackId="a" fill="var(--p-primary)" maxBarSize={28} radius={[6, 6, 0, 0]} />
                </BarChart>
               </ResponsiveContainer>
              {/* Total hebdomadaire */}
              {(() => {
                const totalHifz = weeklyData.reduce((s, d) => s + d.hifz, 0);
                const totalMuraja = weeklyData.reduce((s, d) => s + d.muraja, 0);
                const total = totalHifz + totalMuraja;
                return total > 0 ? (
                  <div className="mt-3 pt-3 flex items-center justify-center gap-3 text-[11px]" style={{ borderTop: '1px solid var(--p-border)' }}>
                    <span style={{ color: 'var(--p-text-65)' }}>Cette semaine :</span>
                    <span className="font-bold" style={{ color: 'var(--p-accent)' }}>{totalHifz} hifz</span>
                    <span style={{ color: 'var(--p-text-55)' }}>·</span>
                    <span className="font-bold" style={{ color: 'var(--p-primary)' }}>{totalMuraja} muraja'a</span>
                    <span style={{ color: 'var(--p-text-55)' }}>·</span>
                    <span className="font-semibold" style={{ color: 'var(--p-on-dark)' }}>{total} total</span>
                  </div>
                ) : null;
              })()}
            </motion.div>

            {/* Révisions du jour */}
            {todayRevisions.length > 0 && (() => {
              const totalDue = todayRevisions.reduce((s, r) => s + (r.verse_end - r.verse_start + 1), 0);
              const todayKey = new Date().toISOString().split('T')[0];
              const todayEntry = weeklyData.find(d => d.day.includes(String(new Date().getDate())));
              const doneToday = todayEntry?.muraja || 0;
              const remaining = Math.max(0, totalDue - doneToday);
              const pct = totalDue > 0 ? Math.min(Math.round((doneToday / totalDue) * 100), 100) : 0;
              return (
                <motion.div
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                  className="rounded-2xl p-4"
                  style={{ background: 'var(--p-card)', border: '1px solid var(--p-border)' }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <RotateCcw className="h-4 w-4" style={{ color: 'var(--p-primary)' }} />
                      <span className="text-xs font-semibold" style={{ color: 'var(--p-on-dark)' }}>Révision du jour</span>
                    </div>
                    <span className="text-[11px] font-medium" style={{ color: pct >= 100 ? 'var(--p-accent)' : 'var(--p-text-55)' }}>
                      {pct >= 100 ? '✅ Terminé' : `${remaining} verset${remaining > 1 ? 's' : ''} restant${remaining > 1 ? 's' : ''}`}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--p-track)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: pct >= 100 ? 'var(--p-accent)' : 'var(--p-primary)' }}
                    />
                  </div>
                  <div className="flex justify-between mt-1.5">
                    <span className="text-[10px]" style={{ color: 'var(--p-text-55)' }}>{doneToday} révisé{doneToday > 1 ? 's' : ''}</span>
                    <span className="text-[10px]" style={{ color: 'var(--p-text-55)' }}>{totalDue} à réviser</span>
                  </div>
                </motion.div>
              );
            })()}

            {/* Empty state */}
            {totalVerses === 0 && streak.current === 0 && (
              <div
                className="rounded-2xl p-6 text-center"
                style={{ background: 'var(--p-gradient-bg)', border: '1px solid var(--p-accent)' }}
              >
                <BookOpenCheck className="h-8 w-8 mx-auto mb-3" style={{ color: 'var(--p-accent)' }} />
                <p className="text-sm font-medium" style={{ color: 'var(--p-on-dark)' }}>
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
