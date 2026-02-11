import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Check, Sparkles, BookOpen, Heart, HandHeart, UtensilsCrossed } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DailyTasks {
  prayer_fajr: boolean;
  prayer_dhuhr: boolean;
  prayer_asr: boolean;
  prayer_maghrib: boolean;
  prayer_isha: boolean;
  prayer_tarawih: boolean;
  sunnah_duha: boolean;
  sunnah_rawatib: boolean;
  sunnah_witr: boolean;
  reading_quran: boolean;
  reading_hadith: boolean;
  reading_dhikr: boolean;
  sadaqa: boolean;
  fasting: boolean;
}

const defaultTasks: DailyTasks = {
  prayer_fajr: false, prayer_dhuhr: false, prayer_asr: false,
  prayer_maghrib: false, prayer_isha: false, prayer_tarawih: false,
  sunnah_duha: false, sunnah_rawatib: false, sunnah_witr: false,
  reading_quran: false, reading_hadith: false, reading_dhikr: false,
  sadaqa: false, fasting: false,
};

const taskGroups = [
  {
    title: 'Prières',
    icon: Sparkles,
    color: 'from-primary/20 to-primary/5',
    items: [
      { key: 'prayer_fajr', label: 'Fajr' },
      { key: 'prayer_dhuhr', label: 'Dhuhr' },
      { key: 'prayer_asr', label: 'Asr' },
      { key: 'prayer_maghrib', label: 'Maghrib' },
      { key: 'prayer_isha', label: 'Isha' },
      { key: 'prayer_tarawih', label: 'Tarawih' },
    ],
  },
  {
    title: 'Sunnah',
    icon: Heart,
    color: 'from-accent/30 to-accent/5',
    items: [
      { key: 'sunnah_duha', label: 'Prière Duha' },
      { key: 'sunnah_rawatib', label: 'Rawatib' },
      { key: 'sunnah_witr', label: 'Witr' },
    ],
  },
  {
    title: 'Lecture',
    icon: BookOpen,
    color: 'from-secondary/30 to-secondary/5',
    items: [
      { key: 'reading_quran', label: 'Coran' },
      { key: 'reading_hadith', label: 'Hadith' },
      { key: 'reading_dhikr', label: 'Dhikr' },
    ],
  },
  {
    title: 'Bonnes actions',
    icon: HandHeart,
    color: 'from-primary/15 to-accent/10',
    items: [
      { key: 'sadaqa', label: 'Sadaqa' },
      { key: 'fasting', label: 'Jeûne' },
    ],
  },
];

export default function RamadanPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<DailyTasks>(defaultTasks);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [gratitude, setGratitude] = useState('');
  const [intention, setIntention] = useState('');
  const [reviewId, setReviewId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (user) {
      fetchTasks();
      fetchReview();
    }
  }, [user]);

  const fetchTasks = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('ramadan_daily_tasks')
      .select('*')
      .eq('user_id', user.id)
      .eq('task_date', today)
      .maybeSingle();
    if (data) {
      setTaskId(data.id);
      const { id, user_id, task_date, created_at, updated_at, ...taskData } = data;
      setTasks(taskData as DailyTasks);
    }
  };

  const fetchReview = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('ramadan_reviews')
      .select('*')
      .eq('user_id', user.id)
      .eq('review_date', today)
      .maybeSingle();
    if (data) {
      setReviewId(data.id);
      setGratitude(data.gratitude || '');
      setIntention(data.intention || '');
    }
  };

  const toggleTask = async (key: string) => {
    if (!user) return;
    const newTasks = { ...tasks, [key]: !tasks[key as keyof DailyTasks] };
    setTasks(newTasks);

    if (taskId) {
      await supabase.from('ramadan_daily_tasks').update(newTasks).eq('id', taskId);
    } else {
      const { data } = await supabase
        .from('ramadan_daily_tasks')
        .insert({ user_id: user.id, task_date: today, ...newTasks })
        .select('id')
        .single();
      if (data) setTaskId(data.id);
    }
  };

  const saveReview = async () => {
    if (!user) return;
    setSaving(true);
    if (reviewId) {
      await supabase.from('ramadan_reviews').update({ gratitude, intention }).eq('id', reviewId);
    } else {
      const { data } = await supabase
        .from('ramadan_reviews')
        .insert({ user_id: user.id, review_date: today, gratitude, intention })
        .select('id')
        .single();
      if (data) setReviewId(data.id);
    }
    toast.success('Réflexion enregistrée, Masha\'Allah 🤲');
    setSaving(false);
  };

  const completedCount = Object.values(tasks).filter(Boolean).length;
  const totalCount = Object.values(tasks).length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  return (
    <AppLayout title="Ramadan">
      <div className="section-spacing space-y-6">
        {/* Header */}
        <div className="zen-header">
          <h1>🌙 Mon Ramadan</h1>
        </div>

        {/* Progress Summary */}
        <Card className="pastel-card p-6 bg-gradient-to-br from-primary/10 via-background to-accent/10 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.08)]">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-lg">Ma Routine Baraka</h2>
            <motion.span
              key={completedCount}
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
              className="text-xl font-bold text-primary"
            >
              {progressPercent}%
            </motion.span>
          </div>
          <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
          <p className="text-sm text-muted-foreground mt-2 text-center">
            {completedCount}/{totalCount} actions accomplies aujourd'hui
          </p>
        </Card>

        {/* Task Groups */}
        {taskGroups.map((group, gi) => (
          <motion.div
            key={group.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: gi * 0.1 }}
          >
            <Card className={`pastel-card p-5 bg-gradient-to-br ${group.color} shadow-[0_8px_30px_-12px_rgba(0,0,0,0.06)]`}>
              <div className="flex items-center gap-2 mb-4">
                <group.icon className="h-5 w-5 text-primary" />
                <h3 className="font-display text-base">{group.title}</h3>
              </div>
              <div className="space-y-3">
                {group.items.map((item) => {
                  const checked = tasks[item.key as keyof DailyTasks];
                  return (
                    <label
                      key={item.key}
                      className="flex items-center gap-3 cursor-pointer group"
                      onClick={() => toggleTask(item.key)}
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => {}}
                        className="h-5 w-5 rounded-lg border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <span className={`text-sm font-medium transition-all ${checked ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                        {item.label}
                      </span>
                      <AnimatePresence>
                        {checked && (
                          <motion.span
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="ml-auto text-primary"
                          >
                            <Check className="h-4 w-4" />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </label>
                  );
                })}
              </div>
            </Card>
          </motion.div>
        ))}

        {/* Taqwa Review */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="pastel-card p-6 bg-gradient-to-br from-secondary/20 to-accent/10 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.06)]">
            <div className="flex items-center gap-2 mb-4">
              <Moon className="h-5 w-5 text-primary" />
              <h3 className="font-display text-lg">Mon Bilan Taqwa</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">
                  🤲 Gratitude du jour
                </label>
                <Textarea
                  placeholder="Al-Hamdulillah pour..."
                  value={gratitude}
                  onChange={(e) => setGratitude(e.target.value)}
                  className="min-h-[80px] bg-background/60 border-border/40 rounded-2xl resize-none text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">
                  🌟 Intention pour demain
                </label>
                <Textarea
                  placeholder="Demain, in sha Allah, je souhaite..."
                  value={intention}
                  onChange={(e) => setIntention(e.target.value)}
                  className="min-h-[80px] bg-background/60 border-border/40 rounded-2xl resize-none text-sm"
                />
              </div>

              <Button
                onClick={saveReview}
                disabled={saving || (!gratitude && !intention)}
                className="w-full bg-primary text-primary-foreground rounded-2xl hover-lift"
              >
                {saving ? 'Enregistrement...' : 'Enregistrer ma réflexion 🌙'}
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </AppLayout>
  );
}
