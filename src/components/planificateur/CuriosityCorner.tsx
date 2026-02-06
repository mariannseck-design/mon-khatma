import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, Calendar, ChevronDown, ChevronUp, Target, Check, Edit3, Lock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const TOTAL_QURAN_PAGES = 604;

interface ActiveGoal {
  id: string;
  goal_type: 'pages_per_day' | 'duration_days';
  target_value: number;
  end_date: string | null;
}

interface CuriosityCornerProps {
  pagesRead: number;
  onCreateGoal?: (type: 'pages_per_day' | 'duration_days', value: number) => void;
}

export function CuriosityCorner({ pagesRead, onCreateGoal }: CuriosityCornerProps) {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [goalType, setGoalType] = useState<'pages_per_day' | 'duration_days'>('pages_per_day');
  const [goalValue, setGoalValue] = useState(5);
  const [activeGoal, setActiveGoal] = useState<ActiveGoal | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const remainingPages = Math.max(0, TOTAL_QURAN_PAGES - pagesRead);
  
  // Fetch active goal on mount
  useEffect(() => {
    if (user) {
      fetchActiveGoal();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const fetchActiveGoal = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('quran_goals')
        .select('id, goal_type, target_value, end_date')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();
      
      if (data) {
        setActiveGoal({
          id: data.id,
          goal_type: data.goal_type as 'pages_per_day' | 'duration_days',
          target_value: data.target_value,
          end_date: data.end_date,
        });
        setGoalType(data.goal_type as 'pages_per_day' | 'duration_days');
        setGoalValue(data.target_value);
      }
    } catch (error) {
      console.error('Error fetching goal:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate estimates
  const daysToComplete = goalType === 'pages_per_day' 
    ? Math.ceil(remainingPages / goalValue)
    : goalValue;
  const pagesPerDay = goalType === 'pages_per_day'
    ? goalValue
    : Math.ceil(remainingPages / goalValue);
  
  // Ramadan countdown (approximate)
  const now = new Date();
  const ramadan2026 = new Date(2026, 1, 18);
  const daysToRamadan = Math.ceil((ramadan2026.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const pagesPerDayForRamadan = daysToRamadan > 0 ? Math.ceil(remainingPages / daysToRamadan) : 0;

  const handleSetGoal = async () => {
    if (!user || !onCreateGoal) return;
    
    setIsSaving(true);
    try {
      await onCreateGoal(goalType, goalValue);
      await fetchActiveGoal();
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditGoal = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (activeGoal) {
      setGoalType(activeGoal.goal_type);
      setGoalValue(activeGoal.target_value);
    }
    setIsEditing(false);
  };

  const isGoalLocked = activeGoal && !isEditing;

  return (
    <Card className="pastel-card border-none shadow-khatma overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-muted/30 transition-colors touch-target"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gold/20 flex items-center justify-center flex-shrink-0">
            <Calculator className="h-5 w-5 sm:h-6 sm:w-6 text-gold-foreground" />
          </div>
          <div className="min-w-0">
            <h3 className="font-display text-lg sm:text-xl font-bold text-foreground">
              🎯 Coin Curiosité
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground truncate">
              {activeGoal ? 'Objectif actif' : 'Calculateurs et objectifs'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {activeGoal && (
            <div className="hidden sm:flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
              <Check className="h-3 w-3" />
              <span>Défini</span>
            </div>
          )}
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 sm:p-5 pt-0 space-y-5">
              {/* Ramadan Countdown */}
              {daysToRamadan > 0 && daysToRamadan <= 120 && (
                <div className="bg-gradient-to-r from-gold/10 to-cream rounded-2xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="h-5 w-5 text-gold-foreground flex-shrink-0" />
                    <span className="font-semibold text-foreground text-base sm:text-lg">Objectif Ramadan</span>
                  </div>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    <span className="font-bold text-foreground">{daysToRamadan}</span> jours avant Ramadan
                  </p>
                  <p className="text-sm sm:text-base text-muted-foreground mt-1">
                    Pour finir à temps: <span className="font-bold text-primary">{pagesPerDayForRamadan}</span> pages/jour
                  </p>
                </div>
              )}

              {/* Goal Status - Locked View */}
              {isGoalLocked && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-br from-sage/20 via-primary/10 to-gold/20 rounded-2xl p-4 sm:p-5 border-2 border-primary/20"
                >
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <Lock className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-display text-lg font-bold text-foreground">
                          Objectif actif
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Bismillah, tu es sur la bonne voie!
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleEditGoal}
                      className="flex-shrink-0 h-10 w-10 sm:h-auto sm:w-auto sm:px-3 rounded-xl hover:bg-muted/50"
                    >
                      <Edit3 className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Modifier</span>
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="bg-white/60 rounded-xl p-3 sm:p-4 text-center">
                      <p className="text-2xl sm:text-3xl font-bold text-foreground">
                        {activeGoal.target_value}
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                        {activeGoal.goal_type === 'pages_per_day' ? 'pages/jour' : 'jours'}
                      </p>
                    </div>
                    <div className="bg-white/60 rounded-xl p-3 sm:p-4 text-center">
                      <p className="text-2xl sm:text-3xl font-bold text-primary">
                        {activeGoal.goal_type === 'pages_per_day' 
                          ? Math.ceil(remainingPages / activeGoal.target_value)
                          : Math.ceil(remainingPages / activeGoal.target_value)}
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                        {activeGoal.goal_type === 'pages_per_day' ? 'jours restants' : 'pages/jour'}
                      </p>
                    </div>
                  </div>

                  {activeGoal.end_date && (
                    <p className="text-sm text-muted-foreground mt-3 text-center">
                      Date estimée de fin: <span className="font-semibold text-foreground">
                        {new Date(activeGoal.end_date).toLocaleDateString('fr-FR', { 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </span>
                    </p>
                  )}
                </motion.div>
              )}

              {/* Goal Calculator - Editing View */}
              {(!activeGoal || isEditing) && !isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  {isEditing && (
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-foreground">Modifier l'objectif</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCancelEdit}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        Annuler
                      </Button>
                    </div>
                  )}

                  <Tabs value={goalType} onValueChange={(v) => setGoalType(v as typeof goalType)}>
                    <TabsList className="w-full h-12 sm:h-14 grid grid-cols-2 gap-1 p-1 bg-muted/50 rounded-xl">
                      <TabsTrigger 
                        value="pages_per_day" 
                        className="text-sm sm:text-base font-medium rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm h-full"
                      >
                        Pages/jour
                      </TabsTrigger>
                      <TabsTrigger 
                        value="duration_days" 
                        className="text-sm sm:text-base font-medium rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm h-full"
                      >
                        Durée (jours)
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="pages_per_day" className="space-y-4 mt-4">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <Input
                          type="number"
                          inputMode="numeric"
                          min={1}
                          max={TOTAL_QURAN_PAGES}
                          value={goalValue}
                          onChange={(e) => setGoalValue(Math.max(1, parseInt(e.target.value) || 1))}
                          className="text-center text-2xl sm:text-3xl font-bold h-16 sm:h-18 w-24 sm:w-28 rounded-xl border-2 border-sage/30 focus:border-primary bg-white"
                        />
                        <span className="text-base sm:text-lg text-muted-foreground">pages/jour</span>
                      </div>
                      <div className="bg-muted/50 rounded-xl p-3 sm:p-4">
                        <p className="text-sm sm:text-base text-muted-foreground">
                          ≈ <span className="font-bold text-foreground text-lg sm:text-xl">{daysToComplete}</span> jours pour terminer
                        </p>
                      </div>
                    </TabsContent>

                    <TabsContent value="duration_days" className="space-y-4 mt-4">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <Input
                          type="number"
                          inputMode="numeric"
                          min={1}
                          max={1000}
                          value={goalValue}
                          onChange={(e) => setGoalValue(Math.max(1, parseInt(e.target.value) || 30))}
                          className="text-center text-2xl sm:text-3xl font-bold h-16 sm:h-18 w-24 sm:w-28 rounded-xl border-2 border-sage/30 focus:border-primary bg-white"
                        />
                        <span className="text-base sm:text-lg text-muted-foreground">jours</span>
                      </div>
                      <div className="bg-muted/50 rounded-xl p-3 sm:p-4">
                        <p className="text-sm sm:text-base text-muted-foreground">
                          ≈ <span className="font-bold text-foreground text-lg sm:text-xl">{pagesPerDay.toFixed(1)}</span> pages/jour
                        </p>
                      </div>
                    </TabsContent>
                  </Tabs>

                  {/* Set Goal Button - Only way to save */}
                  {onCreateGoal && (
                    <Button
                      onClick={handleSetGoal}
                      disabled={isSaving}
                      className="w-full h-14 sm:h-16 bg-gold hover:bg-gold/90 text-gold-foreground font-bold text-base sm:text-lg rounded-xl shadow-lg transition-all disabled:opacity-50"
                    >
                      {isSaving ? (
                        <span className="flex items-center gap-2">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="w-5 h-5 border-2 border-gold-foreground/30 border-t-gold-foreground rounded-full"
                          />
                          Enregistrement...
                        </span>
                      ) : (
                        <>
                          <Target className="h-5 w-5 mr-2" />
                          {isEditing ? 'Mettre à jour l\'objectif' : 'Définir cet objectif'}
                        </>
                      )}
                    </Button>
                  )}
                </motion.div>
              )}

              {/* Loading state */}
              {isLoading && (
                <div className="flex items-center justify-center py-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full"
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
