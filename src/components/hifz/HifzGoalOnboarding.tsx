import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Calendar, Target, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface GoalOption {
  period: 'daily' | 'weekly';
  unit: 'verses' | 'pages';
  value: number;
  label: string;
  description: string;
  icon: string;
}

const DAILY_OPTIONS: GoalOption[] = [
  { period: 'daily', unit: 'verses', value: 3, label: '3 versets', description: 'Un rythme doux et régulier', icon: '🌱' },
  { period: 'daily', unit: 'verses', value: 5, label: '5 versets', description: 'Un bel engagement quotidien', icon: '🌿' },
  { period: 'daily', unit: 'pages', value: 1, label: '1 page', description: 'Pour les plus assidues', icon: '🌳' },
];

const WEEKLY_OPTIONS: GoalOption[] = [
  { period: 'weekly', unit: 'pages', value: 0.5, label: '½ page', description: 'Commencer en douceur', icon: '🌙' },
  { period: 'weekly', unit: 'pages', value: 1, label: '1 page', description: 'Un objectif équilibré', icon: '⭐' },
  { period: 'weekly', unit: 'pages', value: 2, label: '2 pages', description: 'Un rythme soutenu', icon: '🌟' },
];

const DAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

interface HifzGoalOnboardingProps {
  onGoalSet: () => void;
  existingGoal?: { goal_period: string; goal_unit: string; goal_value: number; id: string; active_days?: number[] } | null;
}

export default function HifzGoalOnboarding({ onGoalSet, existingGoal }: HifzGoalOnboardingProps) {
  const { user } = useAuth();
  const [tab, setTab] = useState<'daily' | 'weekly'>(
    (existingGoal?.goal_period as 'daily' | 'weekly') || 'daily'
  );
  const [selected, setSelected] = useState<GoalOption | null>(() => {
    if (!existingGoal) return null;
    const allOptions = [...DAILY_OPTIONS, ...WEEKLY_OPTIONS];
    return allOptions.find(
      o => o.period === existingGoal.goal_period && o.unit === existingGoal.goal_unit && o.value === existingGoal.goal_value
    ) || null;
  });
  const [activeDays, setActiveDays] = useState<number[]>(
    existingGoal?.active_days ?? [0, 1, 2, 3, 4, 5, 6]
  );
  const [saving, setSaving] = useState(false);

  const options = tab === 'daily' ? DAILY_OPTIONS : WEEKLY_OPTIONS;

  const toggleDay = (day: number) => {
    if (activeDays.includes(day)) {
      if (activeDays.length > 1) {
        setActiveDays(activeDays.filter(d => d !== day));
      }
    } else {
      setActiveDays([...activeDays, day].sort());
    }
  };

  const handleSave = async () => {
    if (!selected || !user) return;
    setSaving(true);

    try {
      if (existingGoal) {
        await supabase.from('hifz_goals').update({ is_active: false }).eq('id', existingGoal.id);
      }

      const { error } = await supabase.from('hifz_goals').insert({
        user_id: user.id,
        goal_period: selected.period,
        goal_unit: selected.unit,
        goal_value: selected.value,
        is_active: true,
        active_days: selected.period === 'daily' ? activeDays : [0, 1, 2, 3, 4, 5, 6],
      } as any);

      if (error) throw error;

      toast({
        title: 'Objectif enregistré ✨',
        description: `Ton rythme : ${selected.label} par ${selected.period === 'daily' ? 'jour' : 'semaine'}`,
      });
      onGoalSet();
    } catch (err) {
      console.error('Error saving goal:', err);
      toast({ title: 'Erreur', description: 'Impossible de sauvegarder l\'objectif', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)' }}
          >
            <Target className="h-7 w-7" style={{ color: '#d4af37' }} />
          </div>
        </div>
        <h2
          className="text-xl font-bold"
          style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#d4af37' }}
        >
          Choisis ton rythme d'ancrage
        </h2>
        <p className="text-sm text-white/70 leading-relaxed max-w-xs mx-auto">
          Un rythme que tu peux tenir avec persévérance, marche après marche, pour progresser avec constance par la grâce d'Allah <span style={{ fontFamily: "'Amiri'", fontWeight: 'bold', fontSize: '1.1em' }}>(عز وجل)</span>.
        </p>
      </div>

      {/* Tabs */}
      <div
        className="flex rounded-xl overflow-hidden"
        style={{ border: '1px solid rgba(212,175,55,0.3)', background: 'rgba(0,0,0,0.15)' }}
      >
        {(['daily', 'weekly'] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setSelected(null); }}
            className="flex-1 py-2.5 text-sm font-medium transition-all flex items-center justify-center gap-1.5"
            style={{
              background: tab === t ? 'rgba(212,175,55,0.2)' : 'transparent',
              color: tab === t ? '#d4af37' : 'rgba(255,255,255,0.5)',
              borderBottom: tab === t ? '2px solid #d4af37' : '2px solid transparent',
            }}
          >
            {t === 'daily' ? <Calendar className="h-3.5 w-3.5" /> : <BookOpen className="h-3.5 w-3.5" />}
            {t === 'daily' ? 'Quotidien' : 'Hebdomadaire'}
          </button>
        ))}
      </div>

      {/* Options */}
      <div className="space-y-3">
        {options.map((opt) => {
          const isSelected = selected?.value === opt.value && selected?.period === opt.period;
          return (
            <motion.button
              key={`${opt.period}-${opt.value}`}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelected(opt)}
              className="w-full text-left rounded-2xl p-4 transition-all"
              style={{
                background: isSelected
                  ? 'rgba(212,175,55,0.15)'
                  : 'rgba(255,255,255,0.05)',
                border: isSelected
                  ? '2px solid rgba(212,175,55,0.5)'
                  : '1px solid rgba(255,255,255,0.1)',
                boxShadow: isSelected ? '0 0 20px rgba(212,175,55,0.1)' : 'none',
              }}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{opt.icon}</span>
                <div className="flex-1">
                  <div className="font-semibold text-white">{opt.label}</div>
                  <div className="text-xs text-white/50">{opt.description}</div>
                </div>
                {isSelected && (
                  <Sparkles className="h-5 w-5" style={{ color: '#d4af37' }} />
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Day selector - only for daily */}
      {tab === 'daily' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-2.5"
        >
          <p className="text-xs text-center text-white/50">Jours de mémorisation</p>
          <div className="flex justify-center gap-2">
            {DAY_LABELS.map((label, i) => {
              const isActive = activeDays.includes(i);
              return (
                <button
                  key={i}
                  onClick={() => toggleDay(i)}
                  className="w-9 h-9 rounded-full text-xs font-bold transition-all active:scale-90"
                  style={{
                    background: isActive ? 'rgba(212,175,55,0.2)' : 'transparent',
                    border: isActive ? '2px solid #d4af37' : '1px solid rgba(255,255,255,0.15)',
                    color: isActive ? '#d4af37' : 'rgba(255,255,255,0.4)',
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Submit */}
      <Button
        onClick={handleSave}
        disabled={!selected || saving}
        className="w-full rounded-xl py-6 text-base font-semibold"
        style={{
          background: selected ? 'linear-gradient(135deg, #d4af37, #c4a030)' : undefined,
          color: selected ? '#0d7377' : undefined,
          opacity: selected ? 1 : 0.5,
        }}
      >
        {saving ? 'Enregistrement...' : existingGoal ? 'Modifier mon objectif' : 'Valider mon engagement'}
      </Button>
    </motion.div>
  );
}
