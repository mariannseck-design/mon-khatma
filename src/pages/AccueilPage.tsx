import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Target, Users, ChevronRight, Sparkles } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export default function AccueilPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<{ display_name: string | null } | null>(null);
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

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Sabah el-kheir';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  const displayName = profile?.display_name || 'Sœur';

  return (
    <AppLayout title="Accueil">
      <div className="section-spacing stagger-children">
        {/* Greeting */}
        <motion.div 
          className="zen-header"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-muted-foreground text-sm">{greeting()}</p>
          <h1 className="text-3xl">{displayName} ✨</h1>
          <p className="text-muted-foreground">
            Qu'Allah <span className="honorific">(عز وجل)</span> bénisse ta journée
          </p>
        </motion.div>

        {/* Daily Progress Card */}
        <Card className="illustrated-card bg-gradient-mint">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-primary-foreground/70">Aujourd'hui</p>
              <p className="text-3xl font-display font-bold text-primary-foreground">
                {todayProgress} pages
              </p>
              <p className="text-sm text-primary-foreground/70 mt-1">
                {weeklyStreak}/7 jours cette semaine
              </p>
            </div>
            <div className="w-16 h-16 rounded-full bg-white/30 flex items-center justify-center">
              <BookOpen className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-3">
          <h2 className="font-display text-lg text-foreground">Actions rapides</h2>
          
          <Link to="/planificateur">
            <Card className="pastel-card p-4 hover-lift flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-peach flex items-center justify-center">
                  <Target className="h-6 w-6 text-peach-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Planificateur Coran</p>
                  <p className="text-sm text-muted-foreground">Définir mon objectif</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </Card>
          </Link>

          <Link to="/cercle">
            <Card className="pastel-card p-4 hover-lift flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-lavender flex items-center justify-center">
                  <Users className="h-6 w-6 text-accent-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Cercle des Sœurs</p>
                  <p className="text-sm text-muted-foreground">Rejoindre la communauté</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </Card>
          </Link>
        </div>

        {/* Motivational Quote */}
        <Card className="illustrated-card bg-gradient-sky text-center">
          <Sparkles className="h-6 w-6 text-sky-foreground mx-auto mb-3" />
          <p className="font-display text-lg text-sky-foreground italic">
            "La constance dans le bien, même si elle est petite, est meilleure que beaucoup de bien interrompu."
          </p>
          <p className="text-sm text-sky-foreground/70 mt-2">— Sagesse prophétique</p>
        </Card>
      </div>
    </AppLayout>
  );
}
