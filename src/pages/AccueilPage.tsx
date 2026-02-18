import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Easing } from 'framer-motion';
import { BookOpen, Target, Users, Download, Moon, Sun, Sunrise, Share2 } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { SamsungBanner } from '@/components/layout/SamsungBanner';
import { useAuth } from '@/contexts/AuthContext';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { DailyReminderBanner } from '@/components/notifications/DailyReminderBanner';
import { useDailyNotification } from '@/hooks/useDailyNotification';
import { usePushSubscription } from '@/hooks/usePushSubscription';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
export default function AccueilPage() {
  const { user } = useAuth();
  const { isInstallable, isInstalled, isIOS, promptInstall } = usePWAInstall();
  const { subscriptionError } = usePushSubscription();
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [guestName, setGuestName] = useState('');

  // Check if first visit (no name stored)
  useEffect(() => {
    const hasName = localStorage.getItem('guest_first_name') || localStorage.getItem('user_display_name');
    if (!hasName && !user) {
      setShowNamePrompt(true);
    }
  }, [user]);

  const handleSaveName = () => {
    if (guestName.trim()) {
      localStorage.setItem('guest_first_name', guestName.trim());
      setShowNamePrompt(false);
    }
  };
  
  // Fallback: if push subscription failed, ensure local notifications work
  useEffect(() => {
    if (subscriptionError && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [subscriptionError]);
  const [profile, setProfile] = useState<{
    display_name: string | null;
  } | null>(() => {
    const cached = localStorage.getItem('user_display_name');
    return cached ? { display_name: cached } : null;
  });
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
    if (data?.display_name) {
      localStorage.setItem('user_display_name', data.display_name);
    }
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
    if (hour < 12) return '☀️ Sabah el-kheir !';
    if (hour < 18) return '🌸 Bon après-midi !';
    if (hour < 22) return '🌙 N\'oublie pas de lire la sourate Al Moulk';
    return '🌙 Qu\'Allah t\'accorde une nuit paisible.';
  };
  const displayName = profile?.display_name || localStorage.getItem('guest_first_name') || '';
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
        {/* Samsung Internet Banner */}
        <SamsungBanner />
        
        {/* Daily Reminder Banner */}
        <DailyReminderBanner isVisible={showNotification} onDismiss={dismissNotification} />

        {/* Greeting Header */}
        <motion.div className="text-center pt-2 pb-4" variants={itemVariants}>
          <p className="text-muted-foreground text-xl mb-1">{greeting()}</p>
          <h2 className="font-display text-2xl font-bold text-foreground">
            {displayName ? `Bienvenue, ${displayName} 🤍` : 'Bienvenue 🤍'}
          </h2>
        </motion.div>

        {/* Daily Progress Card - Full Width */}
        <motion.div variants={itemVariants}>
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-mint via-mint/90 to-success/70 p-8 shadow-lg">
            {/* Decorative geometric elements */}
            <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/20 blur-xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/5 to-transparent" />
            <div className="absolute top-8 left-8 w-12 h-12 rounded-xl rotate-12 bg-white/15" />
            <div className="absolute bottom-12 right-12 w-8 h-8 rounded-lg rotate-45 bg-white/10" />
            <div className="absolute top-20 right-24 w-6 h-6 rounded-full bg-white/10" />
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-primary-foreground/70 text-2xl font-medium mb-1">Aujourd'hui</p>
                  <p className="text-6xl font-display font-bold text-primary-foreground">
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
                    <h3 className="font-display text-3xl font-bold text-foreground">Ma Tillawah </h3>
                    <p className="text-muted-foreground text-xl mt-1">
                      Définir mon objectif de lecture
                    </p>
                  </div>
                </div>
              </motion.div>
            </Link>

            {/* Espace Dhikr Card - Inactive */}
            <div className="block opacity-70 cursor-default">
              <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-lavender via-lavender/80 to-secondary/50 p-7 shadow-lg">
                <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/15 blur-xl" />
                <div className="absolute bottom-4 left-6 w-8 h-8 rounded-lg rotate-12 bg-white/10" />
                
                <div className="relative z-10">
                  <div className="flex items-center gap-5 mb-5">
                    <div className="w-20 h-20 rounded-2xl bg-white/30 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                      <Moon className="h-12 w-12 text-foreground/60" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display text-3xl font-bold text-foreground">Espace Dhikr</h3>
                      <p className="text-muted-foreground text-lg mt-1">Bientôt disponible in shaa Allah</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <button disabled className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/20 backdrop-blur-sm text-muted-foreground cursor-not-allowed">
                      <Sunrise className="h-5 w-5" />
                      <span className="text-sm font-medium">Zikr du matin</span>
                      <span className="ml-auto text-xs bg-white/30 px-2 py-0.5 rounded-full">Bientôt</span>
                    </button>
                    <button disabled className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/20 backdrop-blur-sm text-muted-foreground cursor-not-allowed">
                      <Sun className="h-5 w-5" />
                      <span className="text-sm font-medium">Zikr après chaque prière</span>
                      <span className="ml-auto text-xs bg-white/30 px-2 py-0.5 rounded-full">Bientôt</span>
                    </button>
                    <button disabled className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/20 backdrop-blur-sm text-muted-foreground cursor-not-allowed">
                      <Moon className="h-5 w-5" />
                      <span className="text-sm font-medium">Zikr du soir</span>
                      <span className="ml-auto text-xs bg-white/30 px-2 py-0.5 rounded-full">Bientôt</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

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
                    <h3 className="font-display text-3xl font-bold text-foreground">Espace Communauté</h3>
                    <p className="text-muted-foreground text-xl mt-1">
                      Rejoindre la communauté
                    </p>
                  </div>
                </div>
              </motion.div>
            </Link>
          </div>
        </motion.div>

        {/* PWA Install CTA - Only in standard browser, never in standalone */}
        {!isInstalled && isInstallable && (
          <motion.div variants={itemVariants}>
            <motion.button
              onClick={() => {
                if (isIOS) {
                  // On iOS, show a guide since we can't trigger install programmatically
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  toast('📲 Pour installer l\'app', {
                    description: 'Appuie sur le bouton Partager (⎙) puis "Sur l\'écran d\'accueil"',
                    duration: 8000,
                  });
                } else {
                  promptInstall();
                }
              }}
              className="w-full relative overflow-hidden rounded-[2rem] p-8 shadow-2xl bg-gradient-to-r from-[hsl(var(--destructive))] via-[hsl(20,80%,55%)] to-[hsl(40,90%,55%)] group border-2 border-white/20"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              transition={{ duration: 0.2 }}
              animate={{ 
                boxShadow: [
                  '0 10px 40px -10px hsla(20, 80%, 55%, 0.4)',
                  '0 10px 50px -10px hsla(20, 80%, 55%, 0.6)',
                  '0 10px 40px -10px hsla(20, 80%, 55%, 0.4)',
                ],
              }}
            >
              <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/20 blur-xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white/15 blur-lg" />
              <div className="absolute top-4 left-8 w-6 h-6 rounded-full bg-white/20 animate-pulse" />
              <div className="relative z-10 flex items-center justify-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-white/30 backdrop-blur-sm flex items-center justify-center">
                  <Download className="h-9 w-9 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-3xl font-display font-bold text-white tracking-tight">📲 Télécharger</p>
                  <p className="text-white/85 text-lg mt-0.5">Installe l'app sur ton téléphone</p>
                </div>
              </div>
            </motion.button>
          </motion.div>
        )}

        {/* Share App Button */}
        <motion.div variants={itemVariants}>
          <motion.button
            onClick={() => {
              const shareData = {
                title: 'Ma Khatma',
                text: "Salam ! Je t'invite à découvrir Ma Khatma, l'application qui m'aide à rester constante dans ma lecture du Coran et mes adorations. Rejoins-nous ici :",
                url: 'https://www.makhatma.com',
              };
              if (navigator.share) {
                navigator.share(shareData).catch(() => {});
              } else {
                navigator.clipboard.writeText(shareData.text + ' ' + shareData.url);
                toast.success('Lien copié dans le presse-papiers !');
              }
            }}
            className="w-full flex items-center justify-center gap-3 py-5 rounded-[2rem] bg-primary/10 hover:bg-primary/15 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            <Share2 className="h-6 w-6 text-primary" />
            <span className="font-display text-xl font-semibold text-primary">Partager l'application</span>
          </motion.button>
        </motion.div>

        {/* Spiritual Quote - Bottom */}
        <motion.div variants={itemVariants} className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-lavender/40 via-secondary/30 to-mint/20 p-8 shadow-inner border border-primary/10" initial={{ opacity: 0, y: 30, scale: 0.97 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}>
          <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-primary/5 blur-2xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-mint/10 blur-xl" />
          <p className="relative z-10 font-display text-xl leading-relaxed text-foreground/90 italic text-center">
            « Ô les croyants ! On vous a prescrit le jeûne comme on l'a prescrit à ceux d'avant vous, ainsi atteindrez-vous la piété »
          </p>
          <p className="relative z-10 text-base text-muted-foreground mt-3 text-center font-medium">
            — Sourate Al-Baqara, verset 183
          </p>
        </motion.div>
      </motion.div>
      {/* Name Prompt Dialog */}
      <Dialog open={showNamePrompt} onOpenChange={setShowNamePrompt}>
        <DialogContent className="max-w-sm mx-4 rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-center">
              Salam Aleykoum 🌙
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-center text-muted-foreground">
              Comment vous appelez-vous ?
            </p>
            <Input
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Votre prénom"
              className="text-center text-lg"
              onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
            />
            <Button
              onClick={handleSaveName}
              disabled={!guestName.trim()}
              className="w-full bg-primary text-primary-foreground rounded-2xl"
            >
              Bismillah ✨
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>;
}