import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Mountain, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const COLORS = {
  cave: '#7A5C2E',
  caveLight: '#A07D45',
  sand: '#F5D87A',
  sandLight: '#FBE9A0',
};

function getWeekKey() {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const weekNum = Math.ceil(((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
  return `kahf_week_${now.getFullYear()}_${weekNum}`;
}

function isValidationWindow() {
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours();
  if (day === 4 && hour >= 18) return true;
  if (day === 5) return true;
  return false;
}

function getNextWindowText() {
  const now = new Date();
  const day = now.getDay();
  if (day === 4 && now.getHours() < 18) return 'Disponible ce soir à 18h in shaa Allah';
  if (day === 3) return 'Disponible demain soir in shaa Allah';
  return 'Disponible jeudi soir in shaa Allah';
}

function getPastWeekKeys(count: number): string[] {
  const keys: string[] = [];
  const now = new Date();
  for (let i = 1; i <= count; i++) {
    const past = new Date(now.getTime() - i * 7 * 86400000);
    const startOfYear = new Date(past.getFullYear(), 0, 1);
    const weekNum = Math.ceil(((past.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
    keys.push(`kahf_week_${past.getFullYear()}_${weekNum}`);
  }
  return keys;
}

export default function DefiAlKahf({ disabled = false }: { disabled?: boolean }) {
  const { user } = useAuth();
  const weekKey = getWeekKey();
  const [completed, setCompleted] = useState(false);
  const [streak, setStreak] = useState(0);
  const [history, setHistory] = useState<boolean[]>([false, false, false, false]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [loading, setLoading] = useState(!disabled);

  useEffect(() => {
    if (disabled) return;
    if (!user) {
      const saved = localStorage.getItem(weekKey);
      setCompleted(saved === 'true');
      const pastKeys = getPastWeekKeys(4);
      setHistory(pastKeys.map(k => localStorage.getItem(k) === 'true'));
      setLoading(false);
      return;
    }

    const load = async () => {
      const { data } = await (supabase as any)
        .from('challenge_kahf')
        .select('completed')
        .eq('user_id', user.id)
        .eq('week_key', weekKey)
        .maybeSingle();

      if (data?.completed) setCompleted(true);

      const pastKeys = getPastWeekKeys(4);
      const { data: histData } = await (supabase as any)
        .from('challenge_kahf')
        .select('week_key, completed')
        .eq('user_id', user.id)
        .in('week_key', pastKeys);

      const completedKeys = new Set(
        ((histData as any[]) || []).filter((r: any) => r.completed).map((r: any) => r.week_key)
      );
      const hist = pastKeys.map(k => completedKeys.has(k));
      setHistory(hist);

      let s = data?.completed ? 1 : 0;
      for (const h of hist) {
        if (h) s++;
        else break;
      }
      setStreak(s);
      setLoading(false);
    };
    load();
  }, [user, weekKey, disabled]);

  const save = useCallback(async () => {
    if (!user) {
      localStorage.setItem(weekKey, 'true');
      return;
    }
    await (supabase as any)
      .from('challenge_kahf')
      .upsert(
        { user_id: user.id, week_key: weekKey, completed: true },
        { onConflict: 'user_id,week_key' }
      );
  }, [user, weekKey]);

  const handleValidate = () => {
    if (disabled || completed) return;
    setCompleted(true);
    save();
    setStreak(s => s + 1);
    setTimeout(() => setShowCelebration(true), 300);
  };

  const canValidate = isValidationWindow();

  if (loading) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-2xl p-5"
        style={{
          background: `linear-gradient(135deg, ${COLORS.cave} 0%, ${COLORS.caveLight} 100%)`,
          boxShadow: `0 4px 20px -6px ${COLORS.cave}60`,
        }}
      >
        <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full blur-2xl" style={{ background: `${COLORS.sand}12` }} />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: `${COLORS.sand}22`, border: `1px solid ${COLORS.sand}35` }}
            >
              <Mountain className="h-5 w-5" style={{ color: COLORS.sand }} strokeWidth={1.5} />
            </div>
            <div>
              <h4 className="font-bold text-white tracking-wide leading-tight" style={{ fontFamily: "'Inter', sans-serif" }}>
                <span className="text-sm">La Lumière</span>
                <br />
                <span className="text-[10px] font-medium text-white/60">du Vendredi</span>
              </h4>
              <p className="text-xs text-white/50">Sourate Al-Kahf</p>
            </div>
            {streak > 0 && (
              <span
                className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ background: `${COLORS.sand}25`, color: COLORS.sand }}
              >
                🔥 {streak} sem.
              </span>
            )}
          </div>

          {/* History dots */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[10px] text-white/40 mr-1">Historique :</span>
            {[...history].reverse().map((done, i) => (
              <div
                key={i}
                className="w-5 h-5 rounded-full flex items-center justify-center"
                style={{
                  background: done ? `${COLORS.sand}30` : 'rgba(255,255,255,0.08)',
                  border: `1.5px solid ${done ? COLORS.sand : 'rgba(255,255,255,0.15)'}`,
                }}
              >
                {done && <Check className="h-3 w-3" style={{ color: COLORS.sand }} />}
              </div>
            ))}
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center"
              style={{
                background: completed ? `${COLORS.sand}30` : 'rgba(255,255,255,0.08)',
                border: `1.5px solid ${completed ? COLORS.sand : COLORS.sand + '60'}`,
              }}
            >
              {completed && <Check className="h-3 w-3" style={{ color: COLORS.sand }} />}
            </div>
          </div>

          {/* Validate button */}
          <div className={disabled ? 'opacity-50 pointer-events-none' : ''}>
            {completed ? (
              <div
                className="flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold"
                style={{ background: `${COLORS.sand}18`, color: COLORS.sand }}
              >
                <Check className="h-4 w-4" />
                Lecture validée cette semaine ✨
              </div>
            ) : canValidate ? (
              <button
                onClick={handleValidate}
                className="w-full rounded-xl py-3 text-sm font-semibold transition-all active:scale-95"
                style={{ background: COLORS.sand, color: COLORS.cave }}
              >
                Valider ma lecture d'Al-Kahf 📖
              </button>
            ) : (
              <div
                className="text-center rounded-xl py-3 text-xs font-medium"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)' }}
              >
                {getNextWindowText()}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <Dialog open={showCelebration} onOpenChange={setShowCelebration}>
        <DialogContent className="sm:max-w-sm text-center border-none" style={{ background: `linear-gradient(135deg, ${COLORS.cave}, ${COLORS.caveLight})` }}>
          <DialogHeader className="space-y-3">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', duration: 0.6 }} className="mx-auto text-5xl">
              🕌
            </motion.div>
            <DialogTitle className="text-lg text-white" style={{ fontFamily: "'Inter', sans-serif" }}>
              Lecture du vendredi validée !
            </DialogTitle>
            <DialogDescription className="text-white/70 text-sm leading-relaxed">
              {streak > 1
                ? `${streak} semaines consécutives, maa shaa Allah ! Qu'Allah te récompense pour ta constance. 🤲`
                : "Qu'Allah accepte ta lecture et te couvre de Sa lumière. 🤲"}
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => setShowCelebration(false)} className="mt-3 w-full" style={{ background: COLORS.sand, color: COLORS.cave }}>
            Alhamdulillah ✨
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
