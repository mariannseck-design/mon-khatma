import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, BookOpen, Sparkles, RefreshCw, ChevronDown } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ReadingSlider } from '@/components/planificateur/ReadingSlider';
import { ReadingHistory } from '@/components/planificateur/ReadingHistory';
import { TotalProgressBar } from '@/components/planificateur/TotalProgressBar';
import { SparkleEffect } from '@/components/planificateur/SparkleEffect';
import { SuccessModal } from '@/components/planificateur/SuccessModal';
import { KhatmaCelebration } from '@/components/planificateur/KhatmaCelebration';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { RotateCcw } from 'lucide-react';

const TOTAL_QURAN_PAGES = 604;

interface QuranGoal {
  id: string;
  goal_type: string;
  target_value: number;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
}

interface DailyProgress {
  date: string;
  pages_read: number;
}

export default function PlanificateurPage() {
  const { user } = useAuth();
  const [activeGoal, setActiveGoal] = useState<QuranGoal | null>(null);
  const [todayPages, setTodayPages] = useState(0);
  const [totalPagesRead, setTotalPagesRead] = useState(0);
  const [weekProgress, setWeekProgress] = useState<DailyProgress[]>([]);
  const [allProgress, setAllProgress] = useState<DailyProgress[]>([]);
  const [isCreatingGoal, setIsCreatingGoal] = useState(false);
  const [newGoalType, setNewGoalType] = useState<'pages_per_day' | 'duration_days'>('pages_per_day');
  const [newGoalValue, setNewGoalValue] = useState(5);
  const [showSparkles, setShowSparkles] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [goalMetToday, setGoalMetToday] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showKhatmaCelebration, setShowKhatmaCelebration] = useState(false);
  const [lastReadingDate, setLastReadingDate] = useState<string | null>(null);
  // Spiritual setup state
  const [setupFirstName, setSetupFirstName] = useState('');
  const [setupPages, setSetupPages] = useState(5);
  const [setupSubmitting, setSetupSubmitting] = useState(false);
  const [setupSuccess, setSetupSuccess] = useState(false);
  const [savedSetup, setSavedSetup] = useState<{ first_name: string; daily_pages: number } | null>(null);
  const [juzExpanded, setJuzExpanded] = useState(false);

  useEffect(() => {
    if (user) {
      fetchGoal();
      fetchProgress();
      fetchSetup();
    }
  }, [user]);

  const fetchSetup = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('ramadan_reading_goals')
      .select('first_name, daily_pages')
      .eq('user_id', user.id)
      .maybeSingle();
    if (data) setSavedSetup(data);
  };

  const handleSpiritualSetup = async () => {
    if (!user || !setupFirstName.trim() || setupPages < 1) return;
    setSetupSubmitting(true);

    // Save to ramadan_reading_goals
    const { error: goalError } = await supabase
      .from('ramadan_reading_goals')
      .upsert(
        { user_id: user.id, first_name: setupFirstName.trim(), daily_pages: setupPages },
        { onConflict: 'user_id' }
      );

    if (goalError) {
      toast.error("Erreur lors de l'enregistrement");
      setSetupSubmitting(false);
      return;
    }

    // Deactivate any existing active goals first
    await supabase.from('quran_goals').update({ is_active: false }).eq('user_id', user.id).eq('is_active', true);

    // Create new quran_goals entry
    const pagesVal = Number(setupPages);
    const daysNeeded = Math.ceil(TOTAL_QURAN_PAGES / pagesVal);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + daysNeeded);

    await supabase.from('quran_goals').insert({
      user_id: user.id,
      goal_type: 'pages_per_day',
      target_value: pagesVal,
      end_date: endDate.toISOString().split('T')[0]
    });

    setSavedSetup({ first_name: setupFirstName.trim(), daily_pages: setupPages });
    setSetupSuccess(true);
    setTimeout(() => {
      setSetupSuccess(false);
      fetchGoal();
    }, 3000);
    setSetupSubmitting(false);
  };

  const fetchGoal = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('quran_goals')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    setActiveGoal(data);
  };

  const fetchProgress = async () => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];

    // Today's progress
    const { data: todayData } = await supabase
      .from('quran_progress')
      .select('pages_read')
      .eq('user_id', user.id)
      .eq('date', today)
      .maybeSingle();
    const pagesRead = todayData?.pages_read || 0;
    setTodayPages(pagesRead);

    // Total pages read (all time)
    const { data: allProgressData } = await supabase
      .from('quran_progress')
      .select('pages_read, date')
      .eq('user_id', user.id)
      .order('date', { ascending: true });
    const total = allProgressData?.reduce((sum, p) => sum + p.pages_read, 0) || 0;
    setTotalPagesRead(total);
    setAllProgress(allProgressData || []);

    // Find last reading date
    if (allProgressData && allProgressData.length > 0) {
      const dates = allProgressData.map(p => p.date).sort();
      setLastReadingDate(dates[dates.length - 1]);
    }

    // Check if goal is met today
    if (activeGoal?.goal_type === 'pages_per_day' && pagesRead >= activeGoal.target_value) {
      setGoalMetToday(true);
    }

    // Week's progress
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const { data: weekData } = await supabase
      .from('quran_progress')
      .select('date, pages_read')
      .eq('user_id', user.id)
      .gte('date', lastWeek.toISOString().split('T')[0])
      .order('date', { ascending: true });
    setWeekProgress(weekData || []);
  };

  const createGoal = async () => {
    if (!user) return;
    const endDate = new Date();
    if (newGoalType === 'duration_days') {
      endDate.setDate(endDate.getDate() + newGoalValue);
    } else {
      const daysNeeded = Math.ceil(TOTAL_QURAN_PAGES / newGoalValue);
      endDate.setDate(endDate.getDate() + daysNeeded);
    }

    const { error } = await supabase.from('quran_goals').insert({
      user_id: user.id,
      goal_type: newGoalType,
      target_value: newGoalValue,
      end_date: endDate.toISOString().split('T')[0]
    });

    if (error) {
      toast.error('Erreur lors de la création de l\'objectif');
      return;
    }
    toast.success('Objectif créé avec l\'aide d\'Allah (عز وجل)! 🌙');
    setIsCreatingGoal(false);
    fetchGoal();
  };

  const logReading = async (pagesOrAbsolutePage: number, isAbsolutePosition = false) => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];

    let pagesToAdd: number;

    if (isAbsolutePosition) {
      // "Bookmark" mode: the value is an absolute page number (1-604)
      const targetPage = pagesOrAbsolutePage;
      if (targetPage <= totalPagesRead) {
        // Position correction (going back or same page) — update total directly
        // We need to recalculate: delete all progress and insert one record with the new total
        await supabase.from('quran_progress').delete().eq('user_id', user.id);
        await supabase.from('quran_progress').insert({
          user_id: user.id,
          goal_id: activeGoal?.id,
          pages_read: targetPage,
          date: today
        });
        toast.success(`Position mise à jour : page ${targetPage} 📖`);
        await fetchProgress();
        return;
      }
      // Moving forward: add the difference
      pagesToAdd = targetPage - totalPagesRead;
    } else {
      pagesToAdd = pagesOrAbsolutePage;
    }

    const { data: existing } = await supabase
      .from('quran_progress')
      .select('id, pages_read')
      .eq('user_id', user.id)
      .eq('date', today)
      .maybeSingle();

    let newTotal = pagesToAdd;
    if (existing) {
      newTotal = existing.pages_read + pagesToAdd;
      await supabase
        .from('quran_progress')
        .update({ pages_read: newTotal })
        .eq('id', existing.id);
    } else {
      await supabase.from('quran_progress').insert({
        user_id: user.id,
        goal_id: activeGoal?.id,
        pages_read: pagesToAdd
      });
    }

    // Check if Khatma is now complete
    const updatedTotal = totalPagesRead + pagesToAdd;
    if (updatedTotal >= TOTAL_QURAN_PAGES) {
      // Show success modal first, then transition to celebration after delay
      setShowSparkles(true);
      setGoalMetToday(true);
      toast.success('Allahou Akbar ! Tu as terminé ta Khatma ! 🎊', { duration: 4000 });
      
      // Record khatma completion for community announcement
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('user_id', user.id)
        .maybeSingle();
      await supabase.from('khatma_completions').insert({
        user_id: user.id,
        display_name: profile?.display_name || null
      });
      
      setTimeout(() => {
        setShowKhatmaCelebration(true);
      }, 3000);
    } else if (activeGoal?.goal_type === 'pages_per_day' && newTotal >= activeGoal.target_value && !goalMetToday) {
      // Daily goal met (but not khatma)
      setShowSparkles(true);
      setTimeout(() => {
        setShowSuccessModal(true);
        setGoalMetToday(true);
      }, 800);
    } else {
      toast.success(`${pagesToAdd} page(s) enregistrée(s)! Masha'Allah! 📖`);
    }
    await fetchProgress();
  };

  const handleSparkleComplete = useCallback(() => {
    setShowSparkles(false);
  }, []);

  const resetKhatma = async () => {
    if (!user) return;
    // Delete progress
    const { error } = await supabase
      .from('quran_progress')
      .delete()
      .eq('user_id', user.id);
    if (error) {
      toast.error('Erreur lors de la réinitialisation');
      return;
    }
    // Delete active goal so setup reappears
    if (activeGoal) {
      await supabase.from('quran_goals').delete().eq('id', activeGoal.id);
    }
    // Delete saved setup
    await supabase.from('ramadan_reading_goals').delete().eq('user_id', user.id);
    setActiveGoal(null);
    setSavedSetup(null);
    setTotalPagesRead(0);
    setTodayPages(0);
    setWeekProgress([]);
    setGoalMetToday(false);
    setLastReadingDate(null);
    toast.success('Nouvelle Khatma commencée, Bismillah! 🌙');
  };

  const totalPagesThisWeek = weekProgress.reduce((sum, day) => sum + day.pages_read, 0);

  // Calculate inactivity days
  const daysSinceLastReading = lastReadingDate
    ? Math.floor((Date.now() - new Date(lastReadingDate).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  // Dynamic estimation message based on real pace
  const getDynamicEstimationMessage = (): string | null => {
    if (!activeGoal || activeGoal.goal_type !== 'pages_per_day') return null;

    const target = activeGoal.target_value;
    const initialTargetDays = Math.floor(TOTAL_QURAN_PAGES / target);
    const initialExtraPages = TOTAL_QURAN_PAGES % target;
    const remainingPages = TOTAL_QURAN_PAGES - totalPagesRead;
    const extraSuffix = initialExtraPages > 0 ? ` (+ ${Math.round(initialExtraPages)} pages le dernier jour)` : '';

    // Condition A: no pages read yet
    if (totalPagesRead <= 0) {
      return `Bismillah ! À ce rythme d'objectif, tu termineras ta lecture dans ${initialTargetDays} jours${extraSuffix}.`;
    }

    // Calculate days elapsed since start
    const startDate = new Date(activeGoal.start_date);
    const now = new Date();
    const daysElapsed = Math.max(1, Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));

    if (remainingPages <= 0) return null;

    // Days left based on TARGET pace (not actual pace)
    const estimatedDaysLeft = Math.floor(remainingPages / target);
    const estimatedExtraPages = remainingPages % target;
    const estimatedExtraSuffix = estimatedExtraPages > 0 ? ` (+ ${Math.round(estimatedExtraPages)} pages le dernier jour)` : '';

    // Compare actual progress vs expected progress
    const expectedPages = daysElapsed * target;
    const progressRatio = totalPagesRead / expectedPages; // >1 = ahead, <1 = behind

    // Condition B: well ahead (read 50%+ more than expected)
    if (progressRatio > 1.5) {
      return `Ma sha Allah ! Ton ardeur fait chaud au cœur. Tu termineras ta lecture dans seulement ${estimatedDaysLeft} jours${estimatedExtraSuffix}. Qu'Allah (عز وجل) bénisse ton temps !`;
    }

    // Condition D: behind (read less than 85% of expected)
    if (progressRatio < 0.85) {
      return `Chaque lettre lue est une immense récompense. Tu as pris un peu de retard, mais l'essentiel est l'Istiqamah (constance). Tu finiras dans ${estimatedDaysLeft} jours${estimatedExtraSuffix}. On s'accroche !`;
    }

    // Condition C: on track
    return `Excellente régularité ! Tu termineras ta lecture dans environ ${estimatedDaysLeft} jours${estimatedExtraSuffix}.`;
  };

  const handleRecalculateGoal = async () => {
    if (!user || !activeGoal) return;
    const remainingPages = TOTAL_QURAN_PAGES - totalPagesRead;
    if (remainingPages <= 0) return;
    // Recalculate over 30 days
    const newTarget = Math.ceil(remainingPages / 30);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    await supabase.from('quran_goals').update({
      target_value: newTarget,
      end_date: endDate.toISOString().split('T')[0]
    }).eq('id', activeGoal.id);

    if (savedSetup) {
      await supabase.from('ramadan_reading_goals').update({ daily_pages: newTarget }).eq('user_id', user.id);
      setSavedSetup({ ...savedSetup, daily_pages: newTarget });
    }

    toast.success(`Nouvel objectif : ${newTarget} pages/jour. Bismillah ! 🌙`);
    fetchGoal();
    fetchProgress();
  };

  if (showKhatmaCelebration) {
    return (
      <AppLayout title="Planificateur">
        <KhatmaCelebration onResetKhatma={() => {
          resetKhatma();
          setShowKhatmaCelebration(false);
        }} />
      </AppLayout>
    );
  }

  const completedJuz = Array.from({ length: 30 }, (_, i) => {
    const juzEndPage = (i + 1) === 30 ? 604 : (i + 1) * 20;
    return totalPagesRead >= juzEndPage;
  }).filter(Boolean).length;

  return (
    <AppLayout title="Planificateur">
      <div className="section-spacing space-y-5">

        {/* Total Progress Bar */}
        <TotalProgressBar totalPagesRead={totalPagesRead} onResetKhatma={resetKhatma} onShowCelebration={() => setShowKhatmaCelebration(true)} targetPagesPerDay={activeGoal?.target_value} startDate={activeGoal?.start_date} />

        {/* Subtle info line — merges greeting + estimation */}
        {savedSetup && activeGoal && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-muted-foreground text-center leading-relaxed px-2"
          >
            {savedSetup.first_name}, {getDynamicEstimationMessage() || `objectif : ${savedSetup.daily_pages} page${savedSetup.daily_pages > 1 ? 's' : ''}/jour`}
          </motion.p>
        )}

        {/* 7-day inactivity prompt — kept but lighter */}
        {activeGoal && daysSinceLastReading !== null && daysSinceLastReading >= 7 && totalPagesRead < TOTAL_QURAN_PAGES && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-4 border-none rounded-2xl bg-primary/5">
              <p className="text-xs text-center text-muted-foreground mb-3 leading-relaxed">
                Une semaine sans lecture. Reprends aujourd'hui, même une seule page. 🌙
              </p>
              <Button
                onClick={handleRecalculateGoal}
                variant="outline"
                size="sm"
                className="w-full rounded-xl text-xs"
              >
                <RefreshCw className="h-3 w-3 mr-1.5" />
                Recalculer mon objectif
              </Button>
            </Card>
          </motion.div>
        )}

        {/* Spiritual Setup (no goal yet) */}
        {!activeGoal && !isCreatingGoal && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-6 border-none rounded-[2rem] bg-card shadow-sm">
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-7 w-7 text-primary" />
                </div>
                <h2 className="font-display text-lg text-foreground mb-1.5">
                  Bismillah
                </h2>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Définis ton objectif de lecture quotidien
                </p>
              </div>

              {!setupSuccess ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="setupName" className="text-xs">Ton prénom</Label>
                    <Input
                      id="setupName"
                      value={setupFirstName}
                      onChange={(e) => setSetupFirstName(e.target.value)}
                      placeholder="Ex: Fatima"
                      className="mt-1 rounded-xl h-11"
                    />
                  </div>
                  <div>
                    <Label htmlFor="setupPages" className="text-xs">Pages par jour</Label>
                    <Input
                      id="setupPages"
                      type="number"
                      min={1}
                      max={50}
                      value={setupPages}
                      onChange={(e) => setSetupPages(e.target.value === '' ? '' as any : parseInt(e.target.value) || ('' as any))}
                      onFocus={(e) => e.target.select()}
                      onBlur={(e) => { if (!e.target.value || parseInt(e.target.value) < 1) setSetupPages(1); }}
                      className="mt-1 rounded-xl h-11"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      ≈ {Math.ceil(TOTAL_QURAN_PAGES / setupPages)} jours pour terminer
                    </p>
                  </div>
                  <Button
                    onClick={handleSpiritualSetup}
                    disabled={setupSubmitting || !setupFirstName.trim() || setupPages < 1}
                    className="w-full bg-primary text-primary-foreground rounded-xl h-11"
                  >
                    {setupSubmitting ? 'Enregistrement...' : 'Bismillah, je commence !'}
                  </Button>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-4"
                >
                  <Sparkles className="h-8 w-8 text-primary mx-auto mb-3" />
                  <p className="text-sm text-foreground leading-relaxed">
                    Qu'Allah accepte ta dévotion, <strong>{setupFirstName}</strong> ! 🤲
                  </p>
                </motion.div>
              )}
            </Card>
          </motion.div>
        )}

        {/* Create Goal Modal */}
        {isCreatingGoal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="p-6 border-none rounded-[2rem] bg-card shadow-sm">
              <h3 className="font-display text-lg mb-4">Nouvel objectif</h3>
              
              <Tabs value={newGoalType} onValueChange={v => setNewGoalType(v as typeof newGoalType)}>
                <TabsList className="w-full mb-4">
                  <TabsTrigger value="pages_per_day" className="flex-1">Pages/jour</TabsTrigger>
                  <TabsTrigger value="duration_days" className="flex-1">Durée</TabsTrigger>
                </TabsList>
                
                <TabsContent value="pages_per_day">
                  <div className="space-y-4">
                    <Label>Combien de pages par jour ?</Label>
                    <div className="flex items-center gap-4">
                      <Input
                        type="number"
                        min={1}
                        max={604}
                        value={newGoalValue}
                        onChange={e => setNewGoalValue(parseInt(e.target.value) || 1)}
                        className="text-center text-2xl font-bold w-24 rounded-xl"
                      />
                      <span className="text-muted-foreground text-sm">pages/jour</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      ≈ {Math.ceil(TOTAL_QURAN_PAGES / newGoalValue)} jours pour finir
                    </p>
                  </div>
                </TabsContent>
                
                <TabsContent value="duration_days">
                  <div className="space-y-4">
                    <Label>Terminer le Coran en combien de jours ?</Label>
                    <div className="flex items-center gap-4">
                      <Input
                        type="number"
                        min={1}
                        max={1000}
                        value={newGoalValue}
                        onChange={e => setNewGoalValue(parseInt(e.target.value) || 30)}
                        className="text-center text-2xl font-bold w-24 rounded-xl"
                      />
                      <span className="text-muted-foreground text-sm">jours</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      ≈ {(TOTAL_QURAN_PAGES / newGoalValue).toFixed(1)} pages/jour
                    </p>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={() => setIsCreatingGoal(false)} className="flex-1 rounded-xl">
                  Annuler
                </Button>
                <Button onClick={createGoal} className="flex-1 bg-primary text-primary-foreground rounded-xl">
                  Bismillah !
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Juz Progress — Collapsible */}
        <div>
          <button
            onClick={() => setJuzExpanded(!juzExpanded)}
            className="w-full flex items-center justify-between px-1 py-2 group"
          >
            <span className="text-sm font-medium text-foreground">
              Juz — {completedJuz}/30
            </span>
            <motion.div
              animate={{ rotate: juzExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </motion.div>
          </button>

          {/* Compact progress dots when collapsed */}
          {!juzExpanded && (
            <div className="flex gap-1 px-1 pb-1">
              {Array.from({ length: 30 }, (_, i) => {
                const juzEndPage = (i + 1) === 30 ? 604 : (i + 1) * 20;
                const juzStartPage = i * 20 + 1;
                const isCompleted = totalPagesRead >= juzEndPage;
                const isInProgress = totalPagesRead >= juzStartPage && totalPagesRead < juzEndPage;
                return (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      !isCompleted && !isInProgress ? 'bg-muted' : ''
                    }`}
                    style={
                      isCompleted
                        ? { background: 'var(--p-primary)' }
                        : isInProgress
                          ? { background: 'rgba(6,95,70,0.3)' }
                          : undefined
                    }
                  />
                );
              })}
            </div>
          )}

          <AnimatePresence>
            {juzExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-6 gap-1.5 pt-2 pb-1">
                  {Array.from({ length: 30 }, (_, i) => {
                    const juzNumber = i + 1;
                    const juzStartPage = (juzNumber - 1) * 20 + 1;
                    const juzEndPage = juzNumber === 30 ? 604 : juzNumber * 20;
                    const isCompleted = totalPagesRead >= juzEndPage;
                    const isInProgress = totalPagesRead >= juzStartPage && totalPagesRead < juzEndPage;
                    
                    return (
                      <div 
                        key={juzNumber} 
                        className={`flex items-center justify-center py-2 rounded-xl text-xs font-medium transition-all ${
                          isCompleted 
                            ? 'bg-primary text-primary-foreground' 
                            : isInProgress 
                              ? 'bg-primary/15 text-primary ring-1 ring-primary/30' 
                              : 'bg-muted/60 text-muted-foreground'
                        }`}
                      >
                        {juzNumber}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Reading Slider */}
        <div className="relative overflow-hidden">
          <SparkleEffect isActive={showSparkles} onComplete={handleSparkleComplete} />
          <ReadingSlider
            onLogReading={(absolutePage) => logReading(absolutePage, true)}
            todayPages={todayPages}
            targetPages={activeGoal?.target_value || 0}
            totalPagesRead={totalPagesRead}
          />
        </div>

        {/* Reading History */}
        <ReadingHistory
          entries={allProgress}
          targetPages={activeGoal?.target_value}
        />

        {/* Reset Button */}
        {(totalPagesRead > 0 || activeGoal || savedSetup) && (
          <div className="flex justify-center pt-2 pb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowResetConfirm(true)}
              className="text-muted-foreground hover:text-destructive text-xs gap-1.5 opacity-60 hover:opacity-100 transition-opacity"
            >
              <RotateCcw className="h-3 w-3" />
              Réinitialiser
            </Button>
          </div>
        )}

        {/* Success Modal */}
        <SuccessModal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} />

        {/* Reset Confirmation Dialog */}
        <Dialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
          <DialogContent className="max-w-sm mx-4 rounded-3xl">
            <DialogHeader>
              <DialogTitle className="font-display text-lg text-center">
                Réinitialiser la lecture
              </DialogTitle>
            </DialogHeader>
            <DialogDescription className="text-center text-sm text-muted-foreground">
              Toute ta progression sera effacée.
            </DialogDescription>
            <div className="flex gap-3 mt-4">
              <Button variant="outline" onClick={() => setShowResetConfirm(false)} className="flex-1 rounded-2xl">
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  resetKhatma();
                  setShowResetConfirm(false);
                }}
                className="flex-1 rounded-2xl"
              >
                Réinitialiser
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
