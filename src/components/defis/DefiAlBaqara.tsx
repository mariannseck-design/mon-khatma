import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Landmark, RotateCcw, Check, BookOpen, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const COLORS = {
  emerald: '#2d6a4f',
  gold: '#b5942e',
  goldAccent: '#d4af37',
  beigeWarm: '#f5f0e8',
};

const BAQARA_PAGES = 48;

const PRESETS = [
  { days: 30, label: '1 mois', emoji: '🌙' },
  { days: 14, label: '2 semaines', emoji: '⭐' },
  { days: 7, label: '1 semaine', emoji: '🔥' },
];

const STORAGE_KEY = 'baqara_challenge';

interface ChallengeState {
  targetDays: number;
  startDate: string;
  checkedDays: string[];
}

function getToday() {
  return new Date().toISOString().split('T')[0];
}

export default function DefiAlBaqara({ disabled = false }: { disabled?: boolean }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState<ChallengeState | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<number | 'custom'>(30);
  const [customDays, setCustomDays] = useState<string>('');
  const [loading, setLoading] = useState(disabled ? false : true);
  const [dbId, setDbId] = useState<string | null>(null);

  // Load from DB or localStorage
  useEffect(() => {
    if (disabled) return;
    if (!user) {
      const saved = localStorage.getItem(STORAGE_KEY);
      setChallenge(saved ? JSON.parse(saved) : null);
      setLoading(false);
      return;
    }

    const load = async () => {
      const { data } = await supabase
        .from('challenge_baqara')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        setDbId(data.id);
        setChallenge({
          targetDays: data.target_days,
          startDate: data.start_date,
          checkedDays: (data.checked_days as string[]) || [],
        });
      }
      setLoading(false);
    };
    load();
  }, [user, disabled]);

  const saveChallenge = useCallback(async (state: ChallengeState | null) => {
    if (!user) {
      if (state) localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      else localStorage.removeItem(STORAGE_KEY);
      return;
    }

    if (!state) {
      if (dbId) {
        await supabase.from('challenge_baqara').delete().eq('id', dbId);
        setDbId(null);
      }
      return;
    }

    if (dbId) {
      await supabase
        .from('challenge_baqara')
        .update({
          target_days: state.targetDays,
          start_date: state.startDate,
          checked_days: state.checkedDays,
        })
        .eq('id', dbId);
    } else {
      const { data } = await supabase
        .from('challenge_baqara')
        .insert({
          user_id: user.id,
          target_days: state.targetDays,
          start_date: state.startDate,
          checked_days: state.checkedDays,
        })
        .select('id')
        .single();
      if (data) setDbId(data.id);
    }
  }, [user, dbId]);

  const startChallenge = () => {
    const days = selectedGoal === 'custom' ? (parseInt(customDays) || 30) : selectedGoal;
    const state: ChallengeState = {
      targetDays: Math.max(1, Math.min(365, days)),
      startDate: getToday(),
      checkedDays: [],
    };
    setChallenge(state);
    saveChallenge(state);
  };

  const resetChallenge = useCallback(() => {
    setChallenge(null);
    saveChallenge(null);
  }, [saveChallenge]);

  const toggleToday = () => {
    if (!challenge) return;
    const today = getToday();
    const updated = { ...challenge };
    if (updated.checkedDays.includes(today)) {
      updated.checkedDays = updated.checkedDays.filter(d => d !== today);
    } else {
      updated.checkedDays = [...updated.checkedDays, today];
    }
    setChallenge(updated);
    saveChallenge(updated);
  };

  // Auto-reset after completion (show celebration for 4 seconds then reset)
  useEffect(() => {
    if (!challenge) return;
    const progress = Math.min((challenge.checkedDays.length / challenge.targetDays) * 100, 100);
    if (progress >= 100) {
      const timer = setTimeout(() => {
        resetChallenge();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [challenge, resetChallenge]);

  if (loading) return null;

  const todayChecked = challenge?.checkedDays.includes(getToday()) ?? false;
  const progress = challenge ? Math.min((challenge.checkedDays.length / challenge.targetDays) * 100, 100) : 0;
  const dayNumber = challenge ? challenge.checkedDays.length : 0;

  // Configuration state
  if (!challenge) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="relative overflow-hidden rounded-2xl p-5"
        style={{
          background: COLORS.beigeWarm,
          border: `1.5px solid ${COLORS.gold}40`,
          boxShadow: `0 4px 20px -6px ${COLORS.gold}20`,
        }}
      >
        <div className="absolute -bottom-8 -right-8 w-28 h-28 rounded-full blur-2xl" style={{ background: `${COLORS.gold}10` }} />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: `${COLORS.gold}20`, border: `1px solid ${COLORS.gold}30` }}
            >
              <Landmark className="h-5 w-5" style={{ color: COLORS.goldAccent }} strokeWidth={1.5} />
            </div>
            <div>
              <h4 className="text-sm font-bold tracking-wide" style={{ fontFamily: "'Inter', sans-serif", color: COLORS.emerald }}>
                La Forteresse (Al-Baqara)
              </h4>
              <p className="text-xs" style={{ color: `${COLORS.emerald}80` }}>Choisis ton objectif</p>
            </div>
          </div>

          <div className={`space-y-2 mb-4 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
            {PRESETS.map((g) => {
              const pace = (BAQARA_PAGES / g.days).toFixed(1);
              return (
                <button
                  key={g.days}
                  onClick={() => !disabled && setSelectedGoal(g.days)}
                  className="w-full py-3 px-4 rounded-xl text-left transition-all flex items-center justify-between"
                  style={{
                    background: selectedGoal === g.days ? `${COLORS.gold}20` : 'rgba(255,255,255,0.6)',
                    border: selectedGoal === g.days ? `1.5px solid ${COLORS.goldAccent}` : '1.5px solid transparent',
                  }}
                >
                  <span className="text-sm font-semibold flex items-center gap-2" style={{ color: COLORS.emerald }}>
                    <span>{g.emoji}</span> {g.label}
                  </span>
                  <span className="text-[11px] font-medium" style={{ color: `${COLORS.emerald}90` }}>~{pace} pages/jour</span>
                </button>
              );
            })}

            {/* Custom option */}
            <button
              onClick={() => !disabled && setSelectedGoal('custom')}
              className="w-full py-3 px-4 rounded-xl text-left transition-all"
              style={{
                background: selectedGoal === 'custom' ? `${COLORS.gold}20` : 'rgba(255,255,255,0.6)',
                border: selectedGoal === 'custom' ? `1.5px solid ${COLORS.goldAccent}` : '1.5px solid transparent',
              }}
            >
              <span className="text-sm font-semibold flex items-center gap-2" style={{ color: COLORS.emerald }}>
                <Pencil className="h-3.5 w-3.5" /> Personnalisé
              </span>
            </button>

            {selectedGoal === 'custom' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex items-center gap-3 px-2"
              >
                <Input
                  type="text"
                  inputMode="numeric"
                  value={customDays}
                  onChange={(e) => {
                    if (e.target.value === '' || /^\d+$/.test(e.target.value)) {
                      setCustomDays(e.target.value);
                    }
                  }}
                  placeholder="Nombre de jours"
                  className="h-11 text-center font-semibold border-2"
                  style={{ borderColor: `${COLORS.gold}60` }}
                  onFocus={(e) => e.target.select()}
                />
                {customDays && parseInt(customDays) > 0 && (
                  <span className="text-xs font-medium whitespace-nowrap" style={{ color: COLORS.gold }}>
                    ~{(BAQARA_PAGES / parseInt(customDays)).toFixed(1)} p/j
                  </span>
                )}
              </motion.div>
            )}
          </div>

          <Button
            onClick={disabled ? undefined : startChallenge}
            disabled={disabled}
            className="w-full rounded-xl font-bold"
            style={{ background: disabled ? `${COLORS.emerald}60` : '#fff', color: disabled ? '#fff' : COLORS.emerald }}
          >
            {disabled ? 'Lancement après le Ramadan in shâ Allah 🌸' : 'Lancer le défi 🚀'}
          </Button>
        </div>
      </motion.div>
    );
  }

  // Active challenge state
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="relative overflow-hidden rounded-2xl p-5"
      style={{
        background: COLORS.beigeWarm,
        border: `1.5px solid ${COLORS.gold}40`,
        boxShadow: `0 4px 20px -6px ${COLORS.gold}20`,
      }}
    >
      <div className="absolute -bottom-8 -right-8 w-28 h-28 rounded-full blur-2xl" style={{ background: `${COLORS.gold}10` }} />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: `${COLORS.gold}20`, border: `1px solid ${COLORS.gold}30` }}
          >
            <Landmark className="h-5 w-5" style={{ color: COLORS.goldAccent }} strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold tracking-wide" style={{ fontFamily: "'Inter', sans-serif", color: COLORS.emerald }}>
              La Forteresse (Al-Baqara)
            </h4>
            <p className="text-xs" style={{ color: COLORS.gold }}>
              Jour {dayNumber} sur {challenge.targetDays}
            </p>
          </div>
          <button
            onClick={resetChallenge}
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: `${COLORS.emerald}10` }}
          >
            <RotateCcw className="h-3.5 w-3.5" style={{ color: COLORS.emerald }} />
          </button>
        </div>

        <div className="mb-3">
          <div className="flex justify-between text-[10px] font-semibold mb-1.5" style={{ color: COLORS.emerald }}>
            <span>Progression</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: `${COLORS.gold}15` }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${COLORS.gold}, ${COLORS.goldAccent})` }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
        </div>

        <button
          onClick={toggleToday}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-semibold text-sm"
          style={{
            background: todayChecked ? '#fff' : 'rgba(255,255,255,0.9)',
            color: COLORS.emerald,
            border: `1.5px solid ${COLORS.emerald}30`,
          }}
        >
          {todayChecked ? (
            <>
              <Check className="h-4 w-4" /> Lecture du jour validée ✅
            </>
          ) : (
            'Valider ma lecture du jour'
          )}
        </button>

        <motion.button
          onClick={() => {
            if (disabled) return;
            const baqaraPage = 2 + Math.floor(challenge.checkedDays.length * (48 / challenge.targetDays));
            const page = Math.min(baqaraPage, 49);
            navigate(`/quran-reader?page=${page}`);
          }}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          whileTap={disabled ? {} : { scale: 0.97 }}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium mt-2 transition-colors ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
          style={{
            background: `${COLORS.emerald}10`,
            color: COLORS.emerald,
            border: `1px solid ${COLORS.emerald}20`,
          }}
        >
          <BookOpen className="h-3.5 w-3.5 animate-[pulse_3s_ease-in-out_infinite]" />
          Continuer ma lecture 📖
        </motion.button>
        {progress >= 100 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-sm mt-3 font-semibold"
            style={{ color: COLORS.goldAccent }}
          >
            🏆 Défi complété ! Allahumma barik !
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}
