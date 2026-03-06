import { useState, useEffect, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { motion } from 'framer-motion';
import { Flame, BookOpenCheck, RotateCcw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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

export default function HifzSuiviPage() {
  const { user } = useAuth();
  const [streak, setStreak] = useState({ current: 0, longest: 0, tours: 0 });
  const [totalVerses, setTotalVerses] = useState(0);
  const [weeklyData, setWeeklyData] = useState<{ day: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  const greeting = useMemo(() => getGreeting(), []);
  const motivation = useMemo(() => MOTIVATIONS[Math.floor(Math.random() * MOTIVATIONS.length)], []);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      setLoading(true);

      // Fetch streak
      const { data: streakData } = await supabase
        .from('hifz_streaks')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (streakData) {
        setStreak({
          current: streakData.current_streak,
          longest: streakData.longest_streak,
          tours: streakData.total_tours_completed,
        });
      }

      // Fetch total memorized verses
      const { count } = await supabase
        .from('hifz_memorized_verses')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      setTotalVerses(count || 0);

      // Weekly activity (last 7 days) from muraja_sessions + hifz_sessions
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
      const startStr = sevenDaysAgo.toISOString();

      const [{ data: murajaSessions }, { data: hifzSessions }] = await Promise.all([
        supabase
          .from('muraja_sessions')
          .select('created_at')
          .eq('user_id', user.id)
          .gte('created_at', startStr),
        supabase
          .from('hifz_sessions')
          .select('created_at')
          .eq('user_id', user.id)
          .gte('created_at', startStr),
      ]);

      // Count sessions per day
      const dayCounts: Record<string, number> = {};
      const allSessions = [...(murajaSessions || []), ...(hifzSessions || [])];
      for (const s of allSessions) {
        const dateKey = s.created_at.split('T')[0];
        dayCounts[dateKey] = (dayCounts[dateKey] || 0) + 1;
      }

      // Build 7-day array
      const chartData: { day: string; count: number }[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split('T')[0];
        // JS getDay: 0=Sun → map to Mon-first labels
        const jsDay = d.getDay();
        const label = DAY_LABELS[jsDay === 0 ? 6 : jsDay - 1];
        chartData.push({ day: label, count: dayCounts[key] || 0 });
      }
      setWeeklyData(chartData);
      setLoading(false);
    };

    load();
  }, [user]);

  return (
    <AppLayout title="Mon Suivi">
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Dynamic greeting */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-1"
        >
          <h1
            className="text-xl font-bold"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#d4af37' }}
          >
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
            {/* 3 KPI Cards */}
            <div className="grid grid-cols-3 gap-3">
              {/* Constance */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-2xl p-4 flex flex-col items-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, rgba(13,115,119,0.15), rgba(20,145,155,0.08))',
                  border: '1px solid rgba(212,175,55,0.2)',
                }}
              >
                <Flame className="h-5 w-5" style={{ color: '#d4af37' }} />
                <span className="text-2xl font-bold" style={{ color: '#0d7377' }}>
                  {streak.current}
                </span>
                <span className="text-[10px] text-muted-foreground text-center leading-tight">
                  Jours consécutifs
                </span>
                <span className="text-[9px] text-muted-foreground/60">
                  Record : {streak.longest}
                </span>
              </motion.div>

              {/* Trésor (versets ancrés) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-2xl p-3 flex flex-col items-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(13,115,119,0.15), rgba(20,145,155,0.08))',
                  border: '1px solid rgba(212,175,55,0.2)',
                }}
              >
                <CircularGauge value={totalVerses} max={Math.max(totalVerses, 50)} label="Versets ancrés" />
              </motion.div>

              {/* Cycles */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-2xl p-4 flex flex-col items-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, rgba(13,115,119,0.15), rgba(20,145,155,0.08))',
                  border: '1px solid rgba(212,175,55,0.2)',
                }}
              >
                <RotateCcw className="h-5 w-5" style={{ color: '#d4af37' }} />
                <span className="text-2xl font-bold" style={{ color: '#0d7377' }}>
                  {streak.tours}
                </span>
                <span className="text-[10px] text-muted-foreground text-center leading-tight">
                  Cycles terminés
                </span>
              </motion.div>
            </div>

            {/* Weekly chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-2xl p-5"
              style={{
                background: 'linear-gradient(135deg, rgba(13,115,119,0.12), rgba(20,145,155,0.06))',
                border: '1px solid rgba(212,175,55,0.15)',
              }}
            >
              <h3
                className="text-sm font-semibold mb-4"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#d4af37' }}
              >
                Activité des 7 derniers jours
              </h3>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={weeklyData} barCategoryGap="30%">
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  />
                  <YAxis hide allowDecimals={false} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={28}>
                    {weeklyData.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={entry.count > 0 ? 'rgba(212,175,55,0.7)' : 'rgba(13,115,119,0.15)'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Empty state encouragement */}
            {totalVerses === 0 && streak.current === 0 && (
              <div
                className="rounded-2xl p-6 text-center"
                style={{
                  background: 'linear-gradient(135deg, #0d7377, #14919b)',
                  border: '1px solid rgba(212,175,55,0.3)',
                }}
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
