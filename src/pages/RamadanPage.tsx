import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Check, Sparkles, BookOpen, Heart, HandHeart, ChevronLeft, ChevronRight, Trash2, Pencil, Plus, X } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format, addDays, subDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import RamadanTaskGroups from '@/components/ramadan/RamadanTaskGroups';
import RamadanTaqwaReview from '@/components/ramadan/RamadanTaqwaReview';
import RamadanProgress from '@/components/ramadan/RamadanProgress';
import RamadanReadingSetup from '@/components/ramadan/RamadanReadingSetup';
import RamadanWeeklyReport from '@/components/ramadan/RamadanWeeklyReport';
import RamadanDhikrSection from '@/components/ramadan/RamadanDhikrSection';

export interface DailyTasks {
  prayer_fajr: boolean;
  prayer_dhuhr: boolean;
  prayer_asr: boolean;
  prayer_maghrib: boolean;
  prayer_isha: boolean;
  prayer_tarawih: boolean;
  prayer_tahajjud: boolean;
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
  prayer_tahajjud: false,
  sunnah_duha: false, sunnah_rawatib: false, sunnah_witr: false,
  reading_quran: false, reading_hadith: false, reading_dhikr: false,
  sadaqa: false, fasting: false,
};

// Ramadan 2026 starts Feb 17 and lasts 31 days
const RAMADAN_START = new Date(2026, 1, 17); // Feb 17, 2026
const RAMADAN_DAYS = 31;
const RAMADAN_END = addDays(RAMADAN_START, RAMADAN_DAYS - 1);

function getRamadanDay(date: Date): number | null {
  const start = new Date(RAMADAN_START);
  start.setHours(0, 0, 0, 0);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const diff = Math.floor((d.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0 || diff >= RAMADAN_DAYS) return null;
  return diff + 1;
}

export default function RamadanPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<DailyTasks>(defaultTasks);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [customGoodDeeds, setCustomGoodDeeds] = useState<string[]>([]);
  const [newDeed, setNewDeed] = useState('');
  const [gratitude, setGratitude] = useState('');
  const [intention, setIntention] = useState('');
  const [reviewId, setReviewId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    if (today < RAMADAN_START) return RAMADAN_START;
    if (today > RAMADAN_END) return RAMADAN_END;
    return today;
  });
  const [isEditing, setIsEditing] = useState(false);
  const [readingGoal, setReadingGoal] = useState<{ first_name: string; daily_pages: number } | null>(null);
  const [loadingGoal, setLoadingGoal] = useState(true);
  const [activeTab, setActiveTab] = useState('routine');

  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const isToday = dateStr === format(new Date(), 'yyyy-MM-dd');
  const ramadanDay = getRamadanDay(selectedDate);

  const canGoBack = selectedDate > RAMADAN_START;
  const canGoForward = selectedDate < RAMADAN_END && !isToday;

  useEffect(() => {
    if (user) {
      fetchTasks();
      fetchReview();
      fetchReadingGoal();
    }
  }, [user, dateStr]);

  const fetchReadingGoal = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('ramadan_reading_goals')
      .select('first_name, daily_pages')
      .eq('user_id', user.id)
      .maybeSingle();
    if (data) setReadingGoal(data);
    setLoadingGoal(false);
  };

  const fetchTasks = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('ramadan_daily_tasks')
      .select('*')
      .eq('user_id', user.id)
      .eq('task_date', dateStr)
      .maybeSingle();
    if (data) {
      setTaskId(data.id);
      const { id, user_id, task_date, created_at, updated_at, custom_good_deeds, ...taskData } = data;
      setTasks(taskData as unknown as DailyTasks);
      setCustomGoodDeeds((custom_good_deeds as string[]) || []);
    } else {
      setTaskId(null);
      setTasks(defaultTasks);
      setCustomGoodDeeds([]);
    }
  };

  const fetchReview = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('ramadan_reviews')
      .select('*')
      .eq('user_id', user.id)
      .eq('review_date', dateStr)
      .maybeSingle();
    if (data) {
      setReviewId(data.id);
      setGratitude(data.gratitude || '');
      setIntention(data.intention || '');
      setIsEditing(false);
    } else {
      setReviewId(null);
      setGratitude('');
      setIntention('');
      setIsEditing(false);
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
        .insert({ user_id: user.id, task_date: dateStr, ...newTasks, custom_good_deeds: customGoodDeeds })
        .select('id')
        .single();
      if (data) setTaskId(data.id);
    }
  };

  const addCustomDeed = async () => {
    if (!user || !newDeed.trim()) return;
    const updated = [...customGoodDeeds, newDeed.trim()];
    setCustomGoodDeeds(updated);
    setNewDeed('');

    if (taskId) {
      await supabase.from('ramadan_daily_tasks').update({ custom_good_deeds: updated }).eq('id', taskId);
    } else {
      const { data } = await supabase
        .from('ramadan_daily_tasks')
        .insert({ user_id: user.id, task_date: dateStr, ...tasks, custom_good_deeds: updated })
        .select('id')
        .single();
      if (data) setTaskId(data.id);
    }
    toast.success('Bonne action ajoutée ✨');
  };

  const removeCustomDeed = async (index: number) => {
    if (!user || !taskId) return;
    const updated = customGoodDeeds.filter((_, i) => i !== index);
    setCustomGoodDeeds(updated);
    await supabase.from('ramadan_daily_tasks').update({ custom_good_deeds: updated }).eq('id', taskId);
  };

  const saveReview = async () => {
    if (!user) return;
    setSaving(true);
    if (reviewId) {
      await supabase.from('ramadan_reviews').update({ gratitude, intention }).eq('id', reviewId);
    } else {
      const { data } = await supabase
        .from('ramadan_reviews')
        .insert({ user_id: user.id, review_date: dateStr, gratitude, intention })
        .select('id')
        .single();
      if (data) setReviewId(data.id);
    }
    toast.success('Réflexion enregistrée, Masha\'Allah 🤲');
    setSaving(false);
    setIsEditing(false);
  };

  const deleteReview = async () => {
    if (!user || !reviewId) return;
    await supabase.from('ramadan_reviews').delete().eq('id', reviewId);
    setReviewId(null);
    setGratitude('');
    setIntention('');
    toast.success('Réflexion supprimée');
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

        {/* Weekly Report (linked to Tilawah data) */}
        {readingGoal && (
          <RamadanWeeklyReport
            firstName={readingGoal.first_name}
            dailyPages={readingGoal.daily_pages}
          />
        )}

        {/* Date Navigation */}
        <div className="flex items-center justify-between px-2">
          <Button variant="ghost" size="icon" onClick={() => setSelectedDate(subDays(selectedDate, 1))} disabled={!canGoBack}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="text-center">
            <p className="font-display text-base capitalize">
              {format(selectedDate, 'EEEE d MMMM', { locale: fr })}
            </p>
            <div className="flex items-center justify-center gap-2">
              {isToday && <span className="text-xs text-primary font-semibold">Aujourd'hui</span>}
              {ramadanDay && (
                <span className="text-xs text-muted-foreground font-medium">
                  Jour {ramadanDay}/{RAMADAN_DAYS}
                </span>
              )}
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setSelectedDate(addDays(selectedDate, 1))} disabled={!canGoForward}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Progress */}
        <RamadanProgress completedCount={completedCount} totalCount={totalCount} progressPercent={progressPercent} />

        {/* Tabs: Routine / Dhikr */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-2 rounded-2xl h-11">
            <TabsTrigger value="routine" className="rounded-xl text-sm font-medium">
              📋 Routine
            </TabsTrigger>
            <TabsTrigger value="dhikr" className="rounded-xl text-sm font-medium">
              📿 Dhikr
            </TabsTrigger>
          </TabsList>

          <TabsContent value="routine" className="space-y-6 mt-4">
            {/* Task Groups */}
            <RamadanTaskGroups
              tasks={tasks}
              toggleTask={toggleTask}
              customGoodDeeds={customGoodDeeds}
              newDeed={newDeed}
              setNewDeed={setNewDeed}
              addCustomDeed={addCustomDeed}
              removeCustomDeed={removeCustomDeed}
            />
          </TabsContent>

          <TabsContent value="dhikr" className="space-y-6 mt-4">
            <RamadanDhikrSection dateStr={dateStr} />
          </TabsContent>
        </Tabs>

        {/* Taqwa Review */}
        <RamadanTaqwaReview
          gratitude={gratitude}
          setGratitude={setGratitude}
          intention={intention}
          setIntention={setIntention}
          reviewId={reviewId}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          saving={saving}
          saveReview={saveReview}
          deleteReview={deleteReview}
        />
      </div>
    </AppLayout>
  );
}
