import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Check, BookOpen, Sparkles } from 'lucide-react';
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
import { TotalProgressBar } from '@/components/planificateur/TotalProgressBar';
import { SparkleEffect } from '@/components/planificateur/SparkleEffect';
import { SuccessModal } from '@/components/planificateur/SuccessModal';

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
  const [isCreatingGoal, setIsCreatingGoal] = useState(false);
  const [newGoalType, setNewGoalType] = useState<'pages_per_day' | 'duration_days'>('pages_per_day');
  const [newGoalValue, setNewGoalValue] = useState(5);
  const [showSparkles, setShowSparkles] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [goalMetToday, setGoalMetToday] = useState(false);
  // Spiritual setup state
  const [setupFirstName, setSetupFirstName] = useState('');
  const [setupPages, setSetupPages] = useState(5);
  const [setupSubmitting, setSetupSubmitting] = useState(false);
  const [setupSuccess, setSetupSuccess] = useState(false);
  const [savedSetup, setSavedSetup] = useState<{ first_name: string; daily_pages: number } | null>(null);

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

    // Also create quran_goals entry
    const daysNeeded = Math.ceil(TOTAL_QURAN_PAGES / setupPages);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + daysNeeded);

    await supabase.from('quran_goals').insert({
      user_id: user.id,
      goal_type: 'pages_per_day',
      target_value: setupPages,
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
    const { data: allProgress } = await supabase
      .from('quran_progress')
      .select('pages_read')
      .eq('user_id', user.id);
    const total = allProgress?.reduce((sum, p) => sum + p.pages_read, 0) || 0;
    setTotalPagesRead(total);

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

  const logReading = async (pages: number) => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];

    const { data: existing } = await supabase
      .from('quran_progress')
      .select('id, pages_read')
      .eq('user_id', user.id)
      .eq('date', today)
      .maybeSingle();

    let newTotal = pages;
    if (existing) {
      newTotal = existing.pages_read + pages;
      await supabase
        .from('quran_progress')
        .update({ pages_read: newTotal })
        .eq('id', existing.id);
    } else {
      await supabase.from('quran_progress').insert({
        user_id: user.id,
        goal_id: activeGoal?.id,
        pages_read: pages
      });
    }

    // Check if daily goal is now met
    if (activeGoal?.goal_type === 'pages_per_day' && newTotal >= activeGoal.target_value && !goalMetToday) {
      setShowSparkles(true);
      setTimeout(() => {
        setShowSuccessModal(true);
        setGoalMetToday(true);
      }, 800);
    } else {
      toast.success(`${pages} page(s) enregistrée(s)! Masha'Allah! 📖`);
    }
    await fetchProgress();
  };

  const handleSparkleComplete = useCallback(() => {
    setShowSparkles(false);
  }, []);

  const resetKhatma = async () => {
    if (!user) return;
    const { error } = await supabase
      .from('quran_progress')
      .delete()
      .eq('user_id', user.id);
    if (error) {
      toast.error('Erreur lors de la réinitialisation');
      return;
    }
    setTotalPagesRead(0);
    setTodayPages(0);
    setWeekProgress([]);
    setGoalMetToday(false);
    toast.success('Nouvelle Khatma commencée, Bismillah! 🌙');
  };

  const totalPagesThisWeek = weekProgress.reduce((sum, day) => sum + day.pages_read, 0);

  return (
    <AppLayout title="Planificateur">
      <div className="section-spacing space-y-6">
        {/* Header */}
        <div className="zen-header">
          <h1>📖 Ma Khatma</h1>
        </div>

        {/* Total Progress Bar */}
        <TotalProgressBar totalPagesRead={totalPagesRead} onResetKhatma={resetKhatma} />

        {/* Personalized greeting if setup exists */}
        {savedSetup && activeGoal && (
          <Card className="pastel-card p-4 bg-gradient-to-r from-primary/10 to-accent/10">
            <p className="text-sm text-center text-foreground">
              📖 Objectif : <strong>{savedSetup.daily_pages} page{savedSetup.daily_pages > 1 ? 's' : ''}/jour</strong> — 
              Qu'Allah <span className="honorific font-bold" style={{ fontSize: '1.1em' }}>(عز وجل)</span> t'accorde la constance, <strong>{savedSetup.first_name}</strong> !
            </p>
          </Card>
        )}

        {/* Spiritual Setup (no goal yet) */}
        {!activeGoal && !isCreatingGoal && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="pastel-card p-6 bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 border-2 border-primary/20">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-8 w-8 text-primary" />
                </div>
                <h2 className="font-display text-xl text-foreground mb-2">
                  Bismillah ! 🌟
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Quel est ton objectif de lecture quotidien pour rester constante 
                  avec le Livre d'Allah <span className="honorific font-bold" style={{ fontSize: '1.1em' }}>(عز وجل)</span> ?
                </p>
              </div>

              {!setupSuccess ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="setupName">Ton prénom</Label>
                    <Input
                      id="setupName"
                      value={setupFirstName}
                      onChange={(e) => setSetupFirstName(e.target.value)}
                      placeholder="Ex: Fatima"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="setupPages">Nombre de pages par jour</Label>
                    <Input
                      id="setupPages"
                      type="number"
                      min={1}
                      max={50}
                      value={setupPages}
                      onChange={(e) => setSetupPages(parseInt(e.target.value) || 1)}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      ≈ {Math.ceil(TOTAL_QURAN_PAGES / setupPages)} jours pour terminer le Coran
                    </p>
                  </div>
                  <Button
                    onClick={handleSpiritualSetup}
                    disabled={setupSubmitting || !setupFirstName.trim() || setupPages < 1}
                    className="w-full bg-primary text-primary-foreground"
                  >
                    {setupSubmitting ? 'Enregistrement...' : 'Bismillah, je commence ! ✨'}
                  </Button>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-4"
                >
                  <Sparkles className="h-10 w-10 text-primary mx-auto mb-3" />
                  <p className="text-foreground leading-relaxed">
                    Qu'Allah <span className="honorific font-bold" style={{ fontSize: '1.1em' }}>(عز وجل)</span> accepte
                    ta dévotion, <strong>{setupFirstName}</strong> ! Ton objectif de{' '}
                    <strong>{setupPages} page{setupPages > 1 ? 's' : ''}</strong> par jour est un
                    magnifique engagement. 🤲
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
            <Card className="pastel-card p-6">
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
                        className="text-center text-2xl font-bold w-24"
                      />
                      <span className="text-muted-foreground">pages/jour</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
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
                        className="text-center text-2xl font-bold w-24"
                      />
                      <span className="text-muted-foreground">jours</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      ≈ {(TOTAL_QURAN_PAGES / newGoalValue).toFixed(1)} pages/jour
                    </p>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={() => setIsCreatingGoal(false)} className="flex-1">
                  Annuler
                </Button>
                <Button onClick={createGoal} className="flex-1 bg-primary text-primary-foreground">
                  Bismillah, je commence!
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Juz Progress Grid - Middle */}
        <Card className="pastel-card p-6 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.08)]">
          <h3 className="font-display text-lg mb-4">Juz lues</h3>
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: 30 }, (_, i) => {
              const juzNumber = i + 1;
              const juzStartPage = (juzNumber - 1) * 20 + 1;
              const juzEndPage = juzNumber === 30 ? 604 : juzNumber * 20;
              const isCompleted = totalPagesRead >= juzEndPage;
              const isInProgress = totalPagesRead >= juzStartPage && totalPagesRead < juzEndPage;
              
              return (
                <div 
                  key={juzNumber} 
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    isCompleted 
                      ? 'bg-primary text-primary-foreground' 
                      : isInProgress 
                        ? 'bg-primary/20 text-primary border-2 border-primary' 
                        : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <span>Juz {juzNumber}</span>
                  {isCompleted && <Check className="h-4 w-4" />}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Reading Slider - Where I stopped (End) */}
        <div className="relative overflow-hidden">
          <SparkleEffect isActive={showSparkles} onComplete={handleSparkleComplete} />
          <ReadingSlider
            onLogReading={logReading}
            isDisabled={goalMetToday}
            todayPages={todayPages}
            targetPages={activeGoal?.target_value || 0}
            totalPagesRead={totalPagesRead}
          />
        </div>

        {/* Success Modal */}
        <SuccessModal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} />
      </div>
    </AppLayout>
  );
}
