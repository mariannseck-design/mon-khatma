import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, Easing } from 'framer-motion';
import { BookOpen, Target, Users, RotateCcw } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { DailyReminderBanner } from '@/components/notifications/DailyReminderBanner';
import { useDailyNotification } from '@/hooks/useDailyNotification';
import { toast } from 'sonner';

export default function AccueilPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<{ display_name: string | null } | null>(null);
  const [todayProgress, setTodayProgress] = useState(0);
  const [weeklyStreak, setWeeklyStreak] = useState(0);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchProgress();

      // Subscribe to real-time changes
      const channel = supabase
        .channel('quran-progress-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'quran_progress',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            fetchProgress();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('user_id', user.id)
      .maybeSingle();
    setProfile(data);
  };

  const fetchProgress = async () => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    
    const { data } = await supabase
      .from('quran_progress')
      .select('pages_read')
      .eq('user_id', user.id)
      .eq('date', today)
      .maybeSingle();
    
    setTodayProgress(data?.pages_read || 0);


    // Calculate weekly streak
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const { data: weekData } = await supabase
      .from('quran_progress')
      .select('date')
      .eq('user_id', user.id)
      .gte('date', lastWeek.toISOString().split('T')[0]);
    
    setWeeklyStreak(weekData?.length || 0);
  };

  const resetProgress = async () => {
    if (!user) return;
    
    const confirmed = window.confirm('Remettre ta lecture à zéro ? Cette action est irréversible.');
    if (!confirmed) return;

    const today = new Date().toISOString().split('T')[0];
    
    // Delete today's progress
    await supabase
      .from('quran_progress')
      .delete()
      .eq('user_id', user.id)
      .eq('date', today);
    
    setTodayProgress(0);
    toast.success('Lecture remise à zéro');
  };


  const { showNotification, dismissNotification } = useDailyNotification();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
      },
    },
  };

  const easeOut: Easing = [0.0, 0.0, 0.2, 1];

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        ease: easeOut,
      },
    },
  };

  return (
    <AppLayout title="Accueil">
      <motion.div 
        className="space-y-5 pb-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Daily Reminder Banner */}
        <DailyReminderBanner 
          isVisible={showNotification} 
          onDismiss={dismissNotification} 
        />


        {/* Daily Progress Card - Full Width */}
        <motion.div variants={itemVariants}>
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary via-primary/80 to-success p-6 shadow-lg">
            {/* Decorative elements */}
            <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10 blur-xl" />
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/5 to-transparent" />
            <div className="absolute top-8 left-8 w-12 h-12 rounded-xl rotate-12 bg-white/10" />
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-primary-foreground/70 text-base font-medium mb-1">Ma Khatma</p>
                  <p className="text-5xl font-display font-bold text-primary-foreground">
                    {todayProgress}
                  </p>
                  <p className="text-primary-foreground/80 text-xl font-medium mt-1">
                    page{todayProgress !== 1 ? 's' : ''} sur 604
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <BookOpen className="h-8 w-8 text-primary-foreground" />
                  </div>
                  {todayProgress > 0 && (
                    <button
                      onClick={resetProgress}
                      className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl px-3 py-2 transition-colors"
                    >
                      <RotateCcw className="h-4 w-4 text-primary-foreground" />
                      <span className="text-sm font-medium text-primary-foreground">Réinitialiser</span>
                    </button>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-2xl px-4 py-3 w-fit">
                <div className="flex -space-x-1">
                  {[...Array(7)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-3 h-3 rounded-full border-2 border-primary/50 ${
                        i < weeklyStreak ? 'bg-white' : 'bg-white/30'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-primary-foreground font-semibold text-sm ml-2">
                  {weeklyStreak}/7 jours cette semaine
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Last Reading Display - Now shows page instead of Surah/Ayah */}
        {todayProgress > 0 && (
          <motion.div variants={itemVariants}>
            <Link to="/planificateur">
              <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-cream via-sage/20 to-gold/20 p-6 shadow-lg border border-sage/10">
                <div className="absolute -bottom-4 -right-4 w-32 h-32 rounded-full bg-gold/10 blur-xl" />
                <div className="absolute top-4 right-4 w-8 h-8 rounded-lg rotate-12 bg-sage/10" />
                
                <div className="relative z-10">
                  <p className="text-foreground/70 text-sm font-medium mb-2">
                    📖 Dernière page atteinte
                  </p>
                  <p className="text-4xl font-display font-bold text-foreground leading-tight">
                    Page {todayProgress}
                  </p>
                  <p className="text-xl font-display font-bold text-primary mt-1">
                    sur 604 pages
                  </p>
                  <p className="text-sm text-muted-foreground mt-3 italic">
                    Continue ta Khatma avec l'aide d'Allah <span className="honorific">(عز وجل)</span>
                  </p>
                </div>
              </div>
            </Link>
          </motion.div>
        )}

        {/* Action Cards */}
        <motion.div variants={itemVariants}>
          <h2 className="font-display text-xl font-bold text-foreground mb-3 px-1">
            Actions rapides
          </h2>
          
          <div className="space-y-3">
            {/* Planificateur Card */}
            <Link to="/planificateur" className="block">
              <motion.div 
                className="relative overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-peach via-secondary to-peach/60 p-5 shadow-lg group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                {/* Decorative shapes */}
                <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-white/20 blur-xl group-hover:bg-white/30 transition-colors" />
                <div className="absolute top-4 right-8 w-6 h-6 rounded-lg rotate-12 bg-white/10" />
                
                <div className="relative z-10 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-white/30 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                    <Target className="h-7 w-7 text-peach-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display text-xl font-bold text-foreground">
                      Planificateur Coran
                    </h3>
                    <p className="text-muted-foreground text-sm mt-0.5">
                      Définir mon objectif de lecture
                    </p>
                  </div>
                </div>
              </motion.div>
            </Link>

            {/* Cercle Card */}
            <Link to="/cercle" className="block">
              <motion.div 
                className="relative overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-accent via-accent/70 to-sky/50 p-5 shadow-lg group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                {/* Decorative shapes */}
                <div className="absolute -top-4 -left-4 w-20 h-20 rounded-full bg-white/15 blur-xl group-hover:bg-white/25 transition-colors" />
                <div className="absolute bottom-4 right-4 w-8 h-8 rounded-full bg-white/10" />
                
                <div className="relative z-10 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-white/30 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                    <Users className="h-7 w-7 text-accent-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display text-xl font-bold text-foreground">
                      Cercle des Sœurs
                    </h3>
                    <p className="text-muted-foreground text-sm mt-0.5">
                      Rejoindre la communauté
                    </p>
                  </div>
                </div>
              </motion.div>
            </Link>
          </div>
        </motion.div>

        {/* Spiritual Quote - Bottom */}
        <motion.div 
          variants={itemVariants}
          className="text-center pt-3 pb-2"
        >
          <p className="font-display text-base text-muted-foreground italic">
            "Sois constant (Istaqim) comme il t'a été ordonné."
          </p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            — Sourate Hud, verset 112
          </p>
        </motion.div>
      </motion.div>
    </AppLayout>
  );
}
