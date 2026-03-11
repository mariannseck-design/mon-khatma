import { useState, useEffect, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { motion } from 'framer-motion';
import { Flame, BookOpenCheck, RotateCcw, Target, Settings2, BookOpen, RefreshCw, Layers, Grid3X3, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import HifzGoalOnboarding from '@/components/hifz/HifzGoalOnboarding';
import { findNextStartingPoint, getTodayRevisions } from '@/lib/hifzUtils';
import { SURAHS } from '@/lib/surahData';
import { getExactVersePage } from '@/lib/quranData';
import { Link } from 'react-router-dom';
import { getTodayQuote } from '@/lib/dailyQuotes';

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 6) return 'Bonne nuit';
  if (h < 12) return 'Sabah al-khayr';
  if (h < 18) return 'Bon après-midi';
  return 'Masa al-khayr';
}

/* ── Mini circular progress for milestone cards ── */
function MiniCircle({ value, max, size = 36, stroke = 3 }: { value: number; max: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = max > 0 ? Math.min(value / max, 1) : 0;
  const offset = circ * (1 - pct);
  const half = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={half} cy={half} r={r} fill="none" stroke="var(--p-track)" strokeWidth={stroke} />
      <motion.circle
        cx={half} cy={half} r={r} fill="none"
        stroke="var(--p-primary)" strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={offset}
        transform={`rotate(-90 ${half} ${half})`}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1, ease: 'easeOut' }}
      />
    </svg>
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
  const [weeklyData, setWeeklyData] = useState<{ day: string; hifz: number; muraja: number; date: string; surahs: { name: string; startVerse: number; endVerse: number; startPage: number; endPage: number }[] }[]>([]);
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

  // ── Derived milestones ──
  const juzCount = Math.floor(totalVerses / 208);
  const hizbCount = Math.floor(totalVerses / 104);
  const pageCount = Math.floor(totalVerses / 10.3); // ~604 pages / 6236 verses

  const loadData = async () => {
    if (!user) return;
    setLoading(true);

    const { data: profileData } = await supabase.from('profiles').select('display_name').eq('user_id', user.id).maybeSingle();
    if (profileData?.display_name) {
      setDisplayName(profileData.display_name);
      localStorage.setItem('user_display_name', profileData.display_name);
    }

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
      supabase.from('hifz_sessions').select('surah_number, start_verse, end_verse, created_at').eq('user_id', user.id).gte('created_at', sevenDaysAgo.toISOString()),
      supabase.from('hifz_sessions')
        .select('surah_number, start_verse, end_verse, completed_at')
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
        const pageSet = new Set<number>();
        for (const s of relevantSessions) {
          try {
            const startPage = await getExactVersePage(s.surah_number, s.start_verse);
            const endPage = await getExactVersePage(s.surah_number, s.end_verse);
            for (let p = startPage; p <= endPage; p++) pageSet.add(p);
          } catch { /* fallback */ }
        }
        setPeriodProgress(pageSet.size);
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

    const chartData: { day: string; hifz: number; muraja: number; date: string }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const jsDay = d.getDay();
      const dayName = DAY_LABELS[jsDay === 0 ? 6 : jsDay - 1];
      const dayNum = d.getDate();
      const label = `${dayName} ${dayNum}`;
      chartData.push({ day: label, hifz: hifzCounts[key] || 0, muraja: murajaCounts[key] || 0, date: key });
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
            style={{ background: 'var(--p-gradient-bg)', border: '2px solid var(--p-accent)' }}
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

  // ── Global progress ──
  const globalPct = pageCount > 0 ? Math.min(pageCount / 604, 1) : 0;
  const bigR = 70;
  const bigCirc = 2 * Math.PI * bigR;
  const bigOffset = bigCirc * (1 - globalPct);

  // ── Today stats for pills ──
  const todayEntry = weeklyData[weeklyData.length - 1];
  const todayHifz = todayEntry?.hifz || 0;
  const todayMuraja = todayEntry?.muraja || 0;

  return (
    <AppLayout title="Mon Suivi Hifz">
      <div className="max-w-md mx-auto px-4 py-6 space-y-6" style={{ backgroundColor: 'var(--p-bg)', minHeight: '100vh' }}>
        {/* ═══ Greeting ═══ */}
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
            {/* ═══ 1. GRAND CERCLE — Progression Globale ═══ */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 }}
              className="flex flex-col items-center"
            >
              <div className="relative">
                <svg width="180" height="180" viewBox="0 0 180 180">
                  <defs>
                    <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#065F46" />
                      <stop offset="100%" stopColor="#10B981" />
                    </linearGradient>
                  </defs>
                  <circle cx="90" cy="90" r={bigR} fill="none" stroke="var(--p-track)" strokeWidth="4" />
                  <motion.circle
                    cx="90" cy="90" r={bigR} fill="none"
                    stroke="url(#emeraldGrad)" strokeWidth="4" strokeLinecap="round"
                    strokeDasharray={bigCirc} strokeDashoffset={bigOffset}
                    transform="rotate(-90 90 90)"
                    initial={{ strokeDashoffset: bigCirc }}
                    animate={{ strokeDashoffset: bigOffset }}
                    transition={{ duration: 1.4, ease: 'easeOut' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: 'var(--p-primary)' }}>
                    {pageCount}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--p-text-65)' }}>pages</span>
                </div>
              </div>
              <span className="text-xs font-semibold mt-2" style={{ color: 'var(--p-text-65)' }}>
                Progression globale
              </span>
            </motion.div>

            {/* ═══ 2. JALONS — 3 mini-cartes ═══ */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-3 gap-3"
            >
              {[
                { icon: Layers, label: 'Juz', value: juzCount, max: 30 },
                { icon: Grid3X3, label: 'Hizb', value: hizbCount, max: 60 },
                { icon: FileText, label: 'Pages', value: pageCount, max: 604 },
              ].map((m, i) => (
                <div
                  key={m.label}
                  className="rounded-2xl p-3 flex flex-col items-center gap-2"
                  style={{ background: 'var(--p-card)', border: '1px solid var(--p-border)', boxShadow: 'var(--p-card-shadow)' }}
                >
                  <m.icon className="h-4 w-4" style={{ color: 'var(--p-primary)' }} />
                  <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--p-text-60)' }}>
                    {m.label}
                  </span>
                  <span className="text-lg font-bold" style={{ color: 'var(--p-text)' }}>
                    {m.value}<span className="text-xs font-medium" style={{ color: 'var(--p-text-55)' }}>/{m.max}</span>
                  </span>
                  <MiniCircle value={m.value} max={m.max} />
                </div>
              ))}
            </motion.div>

            {/* ═══ 3. OBJECTIF ═══ */}
            {goal && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="rounded-2xl p-5"
                style={{ background: 'var(--p-card)', border: '1px solid var(--p-border)', boxShadow: 'var(--p-card-shadow)' }}
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
                    ≈ {periodVerses} ayat{periodVerses > 1 ? 's' : ''} validée{periodVerses > 1 ? 's' : ''}
                  </p>
                  {progressPct >= 100 && (
                    <p className="text-xs text-center" style={{ color: 'var(--p-accent)' }}>
                      ✨ Objectif atteint, ma shaa Allah !
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {!goal && (
              <motion.button
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setShowGoalEdit(true)}
                className="w-full rounded-2xl p-5 text-center"
                style={{ background: 'var(--p-card-active)', border: '1px dashed var(--p-accent)' }}
              >
                <Target className="h-6 w-6 mx-auto mb-2" style={{ color: 'var(--p-accent)' }} />
                <p className="text-sm font-medium" style={{ color: 'var(--p-text-75)' }}>Définis ton objectif de mémorisation</p>
              </motion.button>
            )}


            {/* ═══ 6. TIMELINE HISTORIQUE ═══ */}
            {weeklyData.some(d => d.hifz > 0 || d.muraja > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-2xl p-5"
                style={{ background: 'var(--p-card)', border: '1px solid var(--p-border)', boxShadow: 'var(--p-card-shadow)' }}
              >
                <h3 className="text-sm font-bold mb-4" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: 'var(--p-primary)' }}>
                  Historique récent
                </h3>
                <div className="space-y-0">
                  {weeklyData
                    .slice()
                    .reverse()
                    .filter(d => d.hifz > 0 || d.muraja > 0)
                    .slice(0, 7)
                    .map((d, i, arr) => {
                      const total = d.hifz + d.muraja;
                      return (
                        <div key={d.date} className="flex items-start gap-3">
                          {/* Timeline line + dot */}
                          <div className="flex flex-col items-center">
                            <div
                              className="w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0"
                              style={{ background: d.hifz > 0 ? 'var(--p-primary)' : 'var(--p-accent)' }}
                            />
                            {i < arr.length - 1 && (
                              <div className="w-px h-8 flex-shrink-0" style={{ background: 'var(--p-border)' }} />
                            )}
                          </div>
                          {/* Content */}
                          <div className="pb-3">
                            <span className="text-xs font-medium" style={{ color: 'var(--p-text-65)' }}>
                              {d.day}
                            </span>
                            <span className="text-xs ml-2" style={{ color: 'var(--p-text-55)' }}>
                              +{total} verset{total > 1 ? 's' : ''}
                              {d.hifz > 0 && d.muraja > 0 && (
                                <span className="ml-1" style={{ color: 'var(--p-text-55)' }}>
                                  ({d.hifz} nouveau{d.hifz > 1 ? 'x' : ''} · {d.muraja} révisé{d.muraja > 1 ? 's' : ''})
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </motion.div>
            )}

            {/* ═══ LIENS RAPIDES ═══ */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="grid grid-cols-2 gap-3"
            >
              <Link
                to="/hifz"
                className="rounded-2xl p-4 flex items-center gap-3 transition-transform hover:scale-[1.02]"
                style={{ background: 'var(--p-card)', border: '1px solid var(--p-border)', boxShadow: 'var(--p-card-shadow)' }}
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #065F46, #10B981)' }}>
                  <BookOpen className="h-4 w-4 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold" style={{ color: 'var(--p-text)' }}>Ar-Rabt</span>
                  <span className="text-[10px]" style={{ color: 'var(--p-text-55)' }}>Mémoriser</span>
                </div>
              </Link>
              <Link
                to="/muraja"
                className="rounded-2xl p-4 flex items-center gap-3 transition-transform hover:scale-[1.02]"
                style={{ background: 'var(--p-card)', border: '1px solid var(--p-border)', boxShadow: 'var(--p-card-shadow)' }}
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #B8960C, #D4AF37)' }}>
                  <RefreshCw className="h-4 w-4 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold" style={{ color: 'var(--p-text)' }}>Muraja'a</span>
                  <span className="text-[10px]" style={{ color: 'var(--p-text-55)' }}>Réviser</span>
                </div>
              </Link>
            </motion.div>

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
