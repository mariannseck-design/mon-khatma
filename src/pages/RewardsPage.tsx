import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Award, Trophy, Flame, BookOpen, 
  Moon, Star, Crown, Lock
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageTransition, FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/PageTransition';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  points_required: number;
  category: string;
  earned: boolean;
  earned_at?: string;
}

const ICON_MAP: Record<string, React.ElementType> = {
  'footprints': Star,
  'flame': Flame,
  'trophy': Trophy,
  'book-open': BookOpen,
  'award': Award,
  'sunrise': Star,
  'moon': Moon,
  'star': Star,
  'pen-tool': BookOpen,
  'crown': Crown,
};

export default function RewardsPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [badges, setBadges] = useState<Badge[]>([]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchBadges();
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

  const fetchBadges = async () => {
    if (!user) return;

    // Fetch all badges
    const { data: allBadges } = await supabase
      .from('badges')
      .select('*')
      .order('points_required');

    // Fetch user's earned badges
    const { data: earnedBadges } = await supabase
      .from('user_badges')
      .select('badge_id, earned_at')
      .eq('user_id', user.id);

    const earnedMap = new Map(earnedBadges?.map(b => [b.badge_id, b.earned_at]) || []);

    if (allBadges) {
      setBadges(allBadges.map(b => ({
        ...b,
        earned: earnedMap.has(b.id),
        earned_at: earnedMap.get(b.id)
      })));
    }
  };

  const earnedCount = badges.filter(b => b.earned).length;
  const nextMilestone = [100, 250, 500, 1000].find(m => m > (profile?.total_points || 0)) || 1000;
  const progressToNext = Math.min(((profile?.total_points || 0) / nextMilestone) * 100, 100);

  const categoryColors: Record<string, string> = {
    streak: 'from-orange-500 to-red-500',
    hifz: 'from-emerald-500 to-teal-500',
    prayer: 'from-blue-500 to-indigo-500',
    ramadan: 'from-purple-500 to-pink-500'
  };

  return (
    <AppLayout title="Rewards">
      <PageTransition>
        <div className="space-y-6">
          {/* Points Summary */}
          <FadeIn>
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-accent via-amber-500 to-orange-500 p-6 text-white">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm opacity-80">Total Points</p>
                    <p className="text-4xl font-bold">{profile?.total_points || 0}</p>
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Trophy className="h-8 w-8" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Next milestone</span>
                    <span>{nextMilestone} pts</span>
                  </div>
                  <div className="h-2 bg-white/30 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-white rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progressToNext}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full" />
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/10 rounded-full" />
            </div>
          </FadeIn>

          {/* Stats */}
          <FadeIn delay={0.1}>
            <div className="grid grid-cols-3 gap-3">
              <div className="glass-card p-4 rounded-xl text-center">
                <div className="text-2xl font-bold text-primary">
                  {earnedCount}/{badges.length}
                </div>
                <p className="text-xs text-muted-foreground">Badges</p>
              </div>
              <div className="glass-card p-4 rounded-xl text-center">
                <div className="flex items-center justify-center gap-1 text-2xl font-bold text-accent">
                  <Flame className="h-5 w-5" />
                  {profile?.streak_days || 0}
                </div>
                <p className="text-xs text-muted-foreground">Day Streak</p>
              </div>
              <div className="glass-card p-4 rounded-xl text-center">
                <div className="text-2xl font-bold text-success">
                  {badges.filter(b => b.earned && b.category === 'hifz').length}
                </div>
                <p className="text-xs text-muted-foreground">Hifz Badges</p>
              </div>
            </div>
          </FadeIn>

          {/* Badges Grid */}
          <FadeIn delay={0.2}>
            <h3 className="font-display font-semibold text-foreground mb-4">
              Your Badges
            </h3>
            <StaggerContainer className="grid grid-cols-2 gap-3">
              {badges.map((badge) => {
                const IconComponent = ICON_MAP[badge.icon] || Award;
                
                return (
                  <StaggerItem key={badge.id}>
                    <motion.div
                      className={cn(
                        "glass-card p-4 rounded-xl text-center relative overflow-hidden",
                        badge.earned ? "border-2 border-accent/30" : "opacity-60"
                      )}
                      whileHover={{ scale: 1.02 }}
                    >
                      {badge.earned && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-br opacity-10"
                          style={{
                            backgroundImage: `linear-gradient(135deg, var(--tw-gradient-stops))`,
                          }}
                          animate={{ opacity: [0.05, 0.15, 0.05] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      )}
                      
                      <div className={cn(
                        "w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center relative",
                        badge.earned 
                          ? `bg-gradient-to-br ${categoryColors[badge.category] || 'from-gray-400 to-gray-500'}`
                          : "bg-muted"
                      )}>
                        {badge.earned ? (
                          <IconComponent className="h-7 w-7 text-white" />
                        ) : (
                          <Lock className="h-6 w-6 text-muted-foreground" />
                        )}
                        
                        {badge.earned && (
                          <motion.div
                            className="absolute -inset-1 rounded-2xl"
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            style={{
                              background: `linear-gradient(135deg, transparent, rgba(255,255,255,0.2), transparent)`,
                            }}
                          />
                        )}
                      </div>
                      
                      <p className={cn(
                        "font-medium text-sm mb-1",
                        badge.earned ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {badge.name}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {badge.description}
                      </p>
                      
                      {badge.earned && badge.earned_at && (
                        <p className="text-xs text-primary mt-2">
                          Earned {new Date(badge.earned_at).toLocaleDateString()}
                        </p>
                      )}
                      
                      {!badge.earned && badge.points_required > 0 && (
                        <p className="text-xs text-muted-foreground mt-2">
                          {badge.points_required} pts required
                        </p>
                      )}
                    </motion.div>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          </FadeIn>
        </div>
      </PageTransition>
    </AppLayout>
  );
}
