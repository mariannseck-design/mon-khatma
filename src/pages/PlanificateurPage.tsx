import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Check, BookOpen } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { GoalCard } from '@/components/planificateur/GoalCard';
import { SparkleEffect } from '@/components/planificateur/SparkleEffect';
import { SuccessModal } from '@/components/planificateur/SuccessModal';

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
  const [weekProgress, setWeekProgress] = useState<DailyProgress[]>([]);
  const [isCreatingGoal, setIsCreatingGoal] = useState(false);
  const [newGoalType, setNewGoalType] = useState<'pages_per_day' | 'duration_days'>('pages_per_day');
  const [newGoalValue, setNewGoalValue] = useState(5);
  const [showSparkles, setShowSparkles] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [goalMetToday, setGoalMetToday] = useState(false);

  useEffect(() => {
    if (user) {
      fetchGoal();
      fetchProgress();
    }
  }, [user]);

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
      endDate.setDate(endDate.getDate() + 30); // Default 30 days for pages/day
    }

    const { error } = await supabase
      .from('quran_goals')
      .insert({
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
    if (!user || goalMetToday) return;
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
      await supabase
        .from('quran_progress')
        .insert({
          user_id: user.id,
          goal_id: activeGoal?.id,
          pages_read: pages
        });
    }

    // Check if goal is now met
    if (activeGoal?.goal_type === 'pages_per_day' && newTotal >= activeGoal.target_value) {
      setShowSparkles(true);
      setTimeout(() => {
        setShowSuccessModal(true);
        setGoalMetToday(true);
      }, 800);
    } else {
      toast.success(`${pages} page(s) enregistrée(s)! Masha'Allah! 📖`);
    }
    
    fetchProgress();
  };

  const handleSparkleComplete = useCallback(() => {
    setShowSparkles(false);
  }, []);

  const totalPagesThisWeek = weekProgress.reduce((sum, day) => sum + day.pages_read, 0);
  const goalProgress = activeGoal?.goal_type === 'pages_per_day' 
    ? Math.min(100, (todayPages / activeGoal.target_value) * 100)
    : 0;

  return (
    <AppLayout title="Planificateur">
      <div className="section-spacing">
        {/* Header */}
        <div className="zen-header">
          <h1>📖 Mon Objectif Coran</h1>
          <p className="text-muted-foreground">
            Planifie ta lecture avec l'aide d'Allah <span className="honorific">(عز وجل)</span>
          </p>
        </div>

        {/* Current Goal or Create New */}
        {activeGoal ? (
          <GoalCard
            goalType={activeGoal.goal_type}
            targetValue={activeGoal.target_value}
            todayPages={todayPages}
            goalProgress={goalProgress}
          />
        ) : (
          <Card className="pastel-card p-6 text-center shadow-[0_8px_30px_-12px_rgba(0,0,0,0.08)]">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">Aucun objectif actif</p>
            <Button 
              onClick={() => setIsCreatingGoal(true)}
              className="bg-primary text-primary-foreground hover-lift"
            >
              <Plus className="h-4 w-4 mr-2" />
              Créer un objectif
            </Button>
          </Card>
        )}

        {/* Create Goal Modal */}
        {isCreatingGoal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="pastel-card p-6">
              <h3 className="font-display text-lg mb-4">Nouvel objectif</h3>
              
              <Tabs value={newGoalType} onValueChange={(v) => setNewGoalType(v as any)}>
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
                        max={20}
                        value={newGoalValue}
                        onChange={(e) => setNewGoalValue(parseInt(e.target.value) || 1)}
                        className="text-center text-2xl font-bold w-24"
                      />
                      <span className="text-muted-foreground">pages/jour</span>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="duration_days">
                  <div className="space-y-4">
                    <Label>Terminer le Coran en combien de jours ?</Label>
                    <div className="flex items-center gap-4">
                      <Input
                        type="number"
                        min={7}
                        max={365}
                        value={newGoalValue}
                        onChange={(e) => setNewGoalValue(parseInt(e.target.value) || 30)}
                        className="text-center text-2xl font-bold w-24"
                      />
                      <span className="text-muted-foreground">jours</span>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex gap-3 mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreatingGoal(false)}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button 
                  onClick={createGoal}
                  className="flex-1 bg-primary text-primary-foreground"
                >
                  Bismillah, je commence!
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Quick Log */}
        {activeGoal && (
          <Card className="pastel-card p-6 relative overflow-hidden shadow-[0_8px_30px_-12px_rgba(0,0,0,0.08)]">
            <SparkleEffect isActive={showSparkles} onComplete={handleSparkleComplete} />
            <h3 className="font-display text-lg mb-4">Enregistrer ma lecture</h3>
            
            {goalMetToday ? (
              <Button
                disabled
                className="w-full h-14 bg-gradient-mint text-primary-foreground cursor-not-allowed opacity-90"
              >
                ✨ Objectif atteint, Macha'Allah !
              </Button>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 5].map((pages) => (
                  <Button
                    key={pages}
                    variant="outline"
                    onClick={() => logReading(pages)}
                    className="hover-lift h-16 flex flex-col shadow-[0_4px_15px_-5px_rgba(0,0,0,0.08)]"
                  >
                    <span className="text-xl font-bold">{pages}</span>
                    <span className="text-xs text-muted-foreground">page{pages > 1 ? 's' : ''}</span>
                  </Button>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Success Modal */}
        <SuccessModal 
          isOpen={showSuccessModal} 
          onClose={() => setShowSuccessModal(false)} 
        />

        {/* Week Summary */}
        <Card className="pastel-card p-6 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.08)]">
          <h3 className="font-display text-lg mb-4">Cette semaine</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-primary">{totalPagesThisWeek}</p>
              <p className="text-sm text-muted-foreground">pages lues</p>
            </div>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4, 5, 6].map((dayOffset) => {
                const date = new Date();
                date.setDate(date.getDate() - (6 - dayOffset));
                const dateStr = date.toISOString().split('T')[0];
                const dayProgress = weekProgress.find(p => p.date === dateStr);
                const hasProgress = dayProgress && dayProgress.pages_read > 0;
                
                return (
                  <div
                    key={dayOffset}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      hasProgress ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    }`}
                  >
                    {hasProgress && <Check className="h-4 w-4" />}
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
