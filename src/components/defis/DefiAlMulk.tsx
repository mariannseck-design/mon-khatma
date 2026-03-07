import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Shield, Moon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const DAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

const COLORS = {
  emerald: '#2d6a4f',
  gold: '#b5942e',
  goldAccent: '#d4af37',
};

function getWeekKey() {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const weekNum = Math.ceil(((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
  return `mulk_week_${now.getFullYear()}_${weekNum}`;
}

function getTodayIndex() {
  const day = new Date().getDay();
  return day === 0 ? 6 : day - 1;
}

function isSundayEvening() {
  const now = new Date();
  return now.getDay() === 0 && now.getHours() >= 17;
}

export default function DefiAlMulk({ disabled = false }: { disabled?: boolean }) {
  const { user } = useAuth();
  const weekKey = getWeekKey();
  const [days, setDays] = useState<boolean[]>(Array(7).fill(false));
  const [showCelebration, setShowCelebration] = useState(false);
  const [loading, setLoading] = useState(disabled ? false : true);

  // Load from DB
  useEffect(() => {
    if (disabled) return;
    if (!user) {
      const saved = localStorage.getItem(weekKey);
      setDays(saved ? JSON.parse(saved) : Array(7).fill(false));
      setLoading(false);
      return;
    }

    const load = async () => {
      const { data } = await supabase
        .from('challenge_mulk')
        .select('days')
        .eq('user_id', user.id)
        .eq('week_key', weekKey)
        .maybeSingle();

      if (data?.days) {
        setDays(data.days as boolean[]);
      }
      setLoading(false);
    };
    load();
  }, [user, weekKey, disabled]);

  const saveDays = useCallback(async (updated: boolean[]) => {
    if (!user) {
      localStorage.setItem(weekKey, JSON.stringify(updated));
      return;
    }

    await supabase
      .from('challenge_mulk')
      .upsert(
        { user_id: user.id, week_key: weekKey, days: updated },
        { onConflict: 'user_id,week_key' }
      );
  }, [user, weekKey]);

  const toggleDay = (index: number) => {
    if (disabled) return;
    const updated = [...days];
    updated[index] = !updated[index];
    setDays(updated);
    saveDays(updated);

    if (updated[index] && index === 6 && isSundayEvening()) {
      if (updated.every(Boolean)) {
        setTimeout(() => setShowCelebration(true), 400);
      }
    }
  };

  const completedCount = days.filter(Boolean).length;

  if (loading) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-2xl p-5"
        style={{
          background: `linear-gradient(135deg, ${COLORS.emerald} 0%, #1b4332 100%)`,
          boxShadow: `0 4px 20px -6px ${COLORS.emerald}60`,
        }}
      >
        <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full blur-2xl" style={{ background: `${COLORS.goldAccent}12` }} />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: `${COLORS.goldAccent}22`, border: `1px solid ${COLORS.goldAccent}35` }}
            >
              <Shield className="h-5 w-5" style={{ color: COLORS.goldAccent }} strokeWidth={1.5} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white tracking-wide" style={{ fontFamily: "'Inter', sans-serif" }}>
                Le Bouclier de la Nuit
              </h4>
              <p className="text-xs text-white/50">Sourate Al-Mulk</p>
            </div>
            <span
              className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ background: `${COLORS.goldAccent}25`, color: COLORS.goldAccent }}
            >
              {completedCount}/7
            </span>
          </div>

          <div className={`flex justify-between gap-1 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
            {DAYS.map((label, i) => {
              const isToday = i === getTodayIndex();
              const done = days[i];
              return (
                <button
                  key={i}
                  onClick={() => toggleDay(i)}
                  className="flex flex-col items-center gap-1.5 flex-1 py-2 rounded-xl transition-all"
                  style={{
                    background: done ? `${COLORS.goldAccent}20` : 'rgba(255,255,255,0.06)',
                    border: isToday ? `1.5px solid ${COLORS.goldAccent}60` : '1.5px solid transparent',
                  }}
                >
                  <motion.div
                    animate={done ? { scale: [1, 1.3, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    <Moon
                      className="h-4 w-4"
                      strokeWidth={1.5}
                      style={{ color: done ? COLORS.goldAccent : 'rgba(255,255,255,0.3)' }}
                      fill={done ? COLORS.goldAccent : 'none'}
                    />
                  </motion.div>
                  <span
                    className="text-[10px] font-semibold"
                    style={{ color: done ? COLORS.goldAccent : 'rgba(255,255,255,0.4)' }}
                  >
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>

      <Dialog open={showCelebration} onOpenChange={setShowCelebration}>
        <DialogContent className="sm:max-w-sm text-center border-none" style={{ background: `linear-gradient(135deg, #1b4332, ${COLORS.emerald})` }}>
          <DialogHeader className="space-y-3">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', duration: 0.6 }} className="mx-auto text-5xl">
              🌟
            </motion.div>
            <DialogTitle className="text-lg text-white" style={{ fontFamily: "'Inter', sans-serif" }}>
              Bilan de la semaine validé !
            </DialogTitle>
            <DialogDescription className="text-white/70 text-sm leading-relaxed">
              La communauté s'illumine grâce à tes efforts. Qu'Allah accepte ta constance. 🤲
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => setShowCelebration(false)} className="mt-3 w-full" style={{ background: COLORS.goldAccent, color: '#1b4332' }}>
            Alhamdulillah ✨
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
