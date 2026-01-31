import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Moon, Flame, BookOpen, CheckCircle2, 
  TrendingUp, Star, ChevronRight, Sun
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageTransition, FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/PageTransition';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

interface DailyStats {
  prayersCompleted: number;
  totalPrayers: number;
  adhkarCompleted: number;
  totalAdhkar: number;
  hifzReviewsDue: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<DailyStats>({
    prayersCompleted: 0,
    totalPrayers: 12,
    adhkarCompleted: 0,
    totalAdhkar: 3,
    hifzReviewsDue: 0
  });
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchDailyStats();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    if (data) setProfile(data);
  };

  const fetchDailyStats = async () => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    
    // Fetch prayer stats
    const { data: prayers } = await supabase
      .from('prayer_tracker')
      .select('completed')
      .eq('user_id', user.id)
      .eq('date', today);
    
    // Fetch adhkar stats
    const { data: adhkar } = await supabase
      .from('adhkar_tracker')
      .select('completed')
      .eq('user_id', user.id)
      .eq('date', today);

    // Fetch hifz due for review
    const { data: hifz } = await supabase
      .from('hifz_progress')
      .select('id')
      .eq('user_id', user.id)
      .lte('next_review', today);

    setStats({
      prayersCompleted: prayers?.filter(p => p.completed).length || 0,
      totalPrayers: 12,
      adhkarCompleted: adhkar?.filter(a => a.completed).length || 0,
      totalAdhkar: 3,
      hifzReviewsDue: hifz?.length || 0
    });
  };

  const overallProgress = Math.round(
    ((stats.prayersCompleted + stats.adhkarCompleted) / 
    (stats.totalPrayers + stats.totalAdhkar)) * 100
  ) || 0;

  return (
    <AppLayout title="Mon Compagnon">
      <PageTransition>
        <div className="space-y-6">
          {/* Greeting Card */}
          <FadeIn>
            <div className="relative overflow-hidden rounded-2xl bg-gradient-spiritual p-6 text-primary-foreground">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  {new Date().getHours() < 18 ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                  <span className="text-sm opacity-90">{greeting}</span>
                </div>
                <h2 className="font-display text-2xl font-bold mb-4">
                  {profile?.display_name || 'Traveler'}
                </h2>
                
                {/* Streak */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5">
                    <Flame className="h-4 w-4 text-accent animate-flame" />
                    <span className="text-sm font-semibold">
                      {profile?.streak_days || 0} day streak
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5">
                    <Star className="h-4 w-4" />
                    <span className="text-sm font-semibold">
                      {profile?.total_points || 0} pts
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Decorative pattern */}
              <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <pattern id="islamic" patternUnits="userSpaceOnUse" width="20" height="20">
                    <path d="M10 0L20 10L10 20L0 10Z" fill="currentColor"/>
                  </pattern>
                  <rect width="100" height="100" fill="url(#islamic)"/>
                </svg>
              </div>
            </div>
          </FadeIn>

          {/* Daily Progress */}
          <FadeIn delay={0.1}>
            <div className="glass-card p-5 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-foreground">
                  Today's Progress
                </h3>
                <span className="text-2xl font-bold text-primary">{overallProgress}%</span>
              </div>
              <Progress value={overallProgress} className="h-3 mb-4" />
              
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-xl bg-secondary/50">
                  <CheckCircle2 className="h-5 w-5 mx-auto text-primary mb-1" />
                  <p className="text-lg font-bold text-foreground">
                    {stats.prayersCompleted}/{stats.totalPrayers}
                  </p>
                  <p className="text-xs text-muted-foreground">Prayers</p>
                </div>
                <div className="p-3 rounded-xl bg-secondary/50">
                  <Moon className="h-5 w-5 mx-auto text-primary mb-1" />
                  <p className="text-lg font-bold text-foreground">
                    {stats.adhkarCompleted}/{stats.totalAdhkar}
                  </p>
                  <p className="text-xs text-muted-foreground">Adhkar</p>
                </div>
                <div className="p-3 rounded-xl bg-secondary/50">
                  <BookOpen className="h-5 w-5 mx-auto text-primary mb-1" />
                  <p className="text-lg font-bold text-foreground">
                    {stats.hifzReviewsDue}
                  </p>
                  <p className="text-xs text-muted-foreground">Reviews Due</p>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Quick Actions */}
          <FadeIn delay={0.2}>
            <h3 className="font-display font-semibold text-foreground mb-3">
              Quick Actions
            </h3>
            <StaggerContainer className="space-y-3">
              <StaggerItem>
                <Link to="/trackers">
                  <motion.div 
                    className="glass-card p-4 rounded-xl flex items-center justify-between hover-lift cursor-pointer"
                    whileHover={{ x: 4 }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <CheckCircle2 className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Complete Sunnah Prayers</p>
                        <p className="text-sm text-muted-foreground">
                          {stats.totalPrayers - stats.prayersCompleted} remaining today
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </motion.div>
                </Link>
              </StaggerItem>

              <StaggerItem>
                <Link to="/hifz">
                  <motion.div 
                    className="glass-card p-4 rounded-xl flex items-center justify-between hover-lift cursor-pointer"
                    whileHover={{ x: 4 }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-accent" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Review Memorization</p>
                        <p className="text-sm text-muted-foreground">
                          {stats.hifzReviewsDue > 0 ? `${stats.hifzReviewsDue} verses due` : 'All caught up!'}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </motion.div>
                </Link>
              </StaggerItem>

              <StaggerItem>
                <Link to="/journal">
                  <motion.div 
                    className="glass-card p-4 rounded-xl flex items-center justify-between hover-lift cursor-pointer"
                    whileHover={{ x: 4 }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
                        <TrendingUp className="h-6 w-6 text-success" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Ramadan Journal</p>
                        <p className="text-sm text-muted-foreground">Set today's intentions</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </motion.div>
                </Link>
              </StaggerItem>
            </StaggerContainer>
          </FadeIn>
        </div>
      </PageTransition>
    </AppLayout>
  );
}
