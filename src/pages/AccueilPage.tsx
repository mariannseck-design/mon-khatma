import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, Easing } from 'framer-motion';
import { BookOpen, Target, Users } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { DailyReminderBanner } from '@/components/notifications/DailyReminderBanner';
import { useDailyNotification } from '@/hooks/useDailyNotification';
export default function AccueilPage() {
  const {
    user
  } = useAuth();
  const [profile, setProfile] = useState<{
    display_name: string | null;
  } | null>(null);
  const [todayProgress, setTodayProgress] = useState(0);
  const [weeklyStreak, setWeeklyStreak] = useState(0);
  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchProgress();
    }
  }, [user]);
  const fetchProfile = async () => {
    if (!user) return;
    const {
      data
    } = await supabase.from('profiles').select('display_name').eq('user_id', user.id).maybeSingle();
    setProfile(data);
  };
  const fetchProgress = async () => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    const {
      data
    } = await supabase.from('quran_progress').select('pages_read').eq('user_id', user.id).eq('date', today).maybeSingle();
    setTodayProgress(data?.pages_read || 0);

    // Calculate weekly streak
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const {
      data: weekData
    } = await supabase.from('quran_progress').select('date').eq('user_id', user.id).gte('date', lastWeek.toISOString().split('T')[0]);
    setWeeklyStreak(weekData?.length || 0);
  };
  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Sabah el-kheir';
    if (hour < 18) return 'Bon après-midi';
    return 'Assalamu aleykum wa rahmatulahi wa barakatuhu';
  };
  const displayName = profile?.display_name || 'Sœur';
  const {
    showNotification,
    dismissNotification
  } = useDailyNotification();
  const containerVariants = {
    hidden: {
      opacity: 0
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12
      }
    }
  };
  const easeOut: Easing = [0.0, 0.0, 0.2, 1];
  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: easeOut
      }
    }
  };
  return <AppLayout title="Accueil">
      <motion.div className="space-y-5 pb-6" variants={containerVariants} initial="hidden" animate="visible">
        {/* Daily Reminder Banner */}
        <DailyReminderBanner isVisible={showNotification} onDismiss={dismissNotification} />

        {/* Greeting Header */}
        <motion.div className="text-center pt-2 pb-4" variants={itemVariants}>
          <p className="text-muted-foreground text-xl mb-1">{greeting()}</p>
          
        </motion.div>

        {/* Daily Progress Card - Full Width */}
        <motion.div variants={itemVariants}>
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary via-primary/80 to-success p-8 shadow-lg">
            {/* Decorative elements */}
            <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10 blur-xl" />
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/5 to-transparent" />
            <div className="absolute top-8 left-8 w-12 h-12 rounded-xl rotate-12 bg-white/10" />
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-primary-foreground/70 text-2xl font-medium mb-1">Aujourd'hui</p>
                  <p className="text-7xl font-display font-bold text-primary-foreground">
                    {todayProgress}
                  </p>
                  <p className="text-primary-foreground/80 text-3xl font-medium mt-1">pages lues</p>
                </div>
                <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <BookOpen className="h-10 w-10 text-primary-foreground" />
                </div>
              </div>
              
              <div className="flex items-center gap-3 bg-white/15 backdrop-blur-sm rounded-2xl px-5 py-4 w-fit">
                <div className="flex -space-x-1">
                  {[...Array(7)].map((_, i) => <div key={i} className={`w-5 h-5 rounded-full border-2 border-primary/50 ${i < weeklyStreak ? 'bg-white' : 'bg-white/30'}`} />)}
                </div>
                <span className="text-primary-foreground font-semibold text-xl ml-2">
                  {weeklyStreak}/7 jours cette semaine
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Cards */}
        <motion.div variants={itemVariants}>
          
          
          <div className="space-y-4">
            {/* Planificateur Card */}
            <Link to="/planificateur" className="block">
              <motion.div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-peach via-secondary to-peach/60 p-7 shadow-lg group" whileHover={{
              scale: 1.02
            }} whileTap={{
              scale: 0.98
            }} transition={{
              duration: 0.2
            }}>
                {/* Decorative shapes */}
                <div className="absolute -bottom-4 -right-4 w-32 h-32 rounded-full bg-white/20 blur-xl group-hover:bg-white/30 transition-colors" />
                <div className="absolute top-4 right-8 w-8 h-8 rounded-lg rotate-12 bg-white/10" />
                
                <div className="relative z-10 flex items-center gap-5">
                  <div className="w-20 h-20 rounded-2xl bg-white/30 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                    <Target className="h-12 w-12 text-peach-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display text-3xl font-bold text-foreground">Ma Tilawah </h3>
                    <p className="text-muted-foreground text-xl mt-1">
                      Définir mon objectif de lecture
                    </p>
                  </div>
                </div>
              </motion.div>
            </Link>

            {/* Cercle Card */}
            <Link to="/cercle" className="block">
              <motion.div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-accent via-accent/70 to-sky/50 p-7 shadow-lg group" whileHover={{
              scale: 1.02
            }} whileTap={{
              scale: 0.98
            }} transition={{
              duration: 0.2
            }}>
                {/* Decorative shapes */}
                <div className="absolute -top-4 -left-4 w-28 h-28 rounded-full bg-white/15 blur-xl group-hover:bg-white/25 transition-colors" />
                <div className="absolute bottom-6 right-6 w-10 h-10 rounded-full bg-white/10" />
                
                <div className="relative z-10 flex items-center gap-5">
                  <div className="w-20 h-20 rounded-2xl bg-white/30 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                    <Users className="h-12 w-12 text-accent-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display text-3xl font-bold text-foreground">Coin des Sœurs</h3>
                    <p className="text-muted-foreground text-xl mt-1">
                      Rejoindre la communauté
                    </p>
                  </div>
                </div>
              </motion.div>
            </Link>
          </div>
        </motion.div>

        {/* Spiritual Quote - Bottom */}
        <motion.div variants={itemVariants} className="text-center pt-4 pb-2">
          <p className="font-display text-2xl text-muted-foreground italic">
            "Sois constant (Istaqim) comme il t'a été ordonné."
          </p>
          <p className="text-lg text-muted-foreground/70 mt-2">
            — Sourate Hud, verset 112
          </p>
        </motion.div>
      </motion.div>
    </AppLayout>;
}