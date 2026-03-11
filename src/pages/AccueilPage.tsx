import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Easing } from 'framer-motion';
import { BookOpen, Target, Users, Download, Moon, Sun, Sunrise, Share2, BookOpenCheck, Sparkles } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { SamsungBanner } from '@/components/layout/SamsungBanner';
import { useAuth } from '@/contexts/AuthContext';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { DailyReminderBanner } from '@/components/notifications/DailyReminderBanner';
import RamadanWeeklyReport from '@/components/ramadan/RamadanWeeklyReport';
import DefiAlMulk from '@/components/defis/DefiAlMulk';
import DefiAlKahf from '@/components/defis/DefiAlKahf';
import DefiAlBaqara from '@/components/defis/DefiAlBaqara';
import DefisCommunityCounter from '@/components/defis/DefisCommunityCounter';

import FavoriteVersesSection from '@/components/favoris/FavoriteVersesSection';
import { useDailyNotification } from '@/hooks/useDailyNotification';
import { usePushSubscription } from '@/hooks/usePushSubscription';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

// Emerald/Sage/Gold palette
const COLORS = {
  emerald: '#2d6a4f',
  emeraldLight: '#40916c',
  sage: '#52796f',
  sageLight: '#74a892',
  gold: '#b5942e',
  goldAccent: '#d4af37',
  beige: '#faf8f5',
  beigeWarm: '#f5f0e8',
  greenMist: '#dde5d4',
};

export default function AccueilPage() {
  const { user, isAdmin, hasFullAccess } = useAuth();
  const { isInstallable, isInstalled, isIOS, promptInstall } = usePWAInstall();
  const { subscriptionError } = usePushSubscription();
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [guestName, setGuestName] = useState('');
  

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

  useEffect(() => {
    if (subscriptionError && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [subscriptionError]);

  const [profile, setProfile] = useState<{ display_name: string | null } | null>(() => {
    const cached = localStorage.getItem('user_display_name');
    return cached ? { display_name: cached } : null;
  });
  const [todayProgress, setTodayProgress] = useState(0);
  const [weeklyStreak, setWeeklyStreak] = useState(0);
  const [readingGoal, setReadingGoal] = useState<{ first_name: string; daily_pages: number } | null>(null);



  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchProgress();
      fetchReadingGoal();
    }
  }, [user]);

  const fetchReadingGoal = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('ramadan_reading_goals')
      .select('first_name, daily_pages')
      .eq('user_id', user.id)
      .maybeSingle();
    if (data) setReadingGoal(data);
  };

  const fetchProfile = async () => {
    if (!user) return;
    const { data } = await supabase.from('profiles').select('display_name').eq('user_id', user.id).maybeSingle();
    setProfile(data);
    if (data?.display_name) {
      localStorage.setItem('user_display_name', data.display_name);
    }
  };

  const fetchProgress = async () => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase.from('quran_progress').select('pages_read').eq('user_id', user.id).eq('date', today).maybeSingle();
    setTodayProgress(data?.pages_read || 0);
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const { data: weekData } = await supabase.from('quran_progress').select('date').eq('user_id', user.id).gte('date', lastWeek.toISOString().split('T')[0]);
    setWeeklyStreak(weekData?.length || 0);
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '☀️ Sabah el-kheir !';
    if (hour < 18) return '🌸 Bon après-midi !';
    if (hour < 22) return "🌙 N'oublie pas de lire la sourate Al Moulk";
    return "🌙 Qu'Allah t'accorde une nuit paisible.";
  };

  const displayName = profile?.display_name || localStorage.getItem('guest_first_name') || '';
  const { showNotification, dismissNotification } = useDailyNotification();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
  };
  const easeOut: Easing = [0.0, 0.0, 0.2, 1];
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOut } },
  };

  return (
    <AppLayout title="Accueil">
      <motion.div className="space-y-5 pb-6" variants={containerVariants} initial="hidden" animate="visible">
        <SamsungBanner />
        <DailyReminderBanner isVisible={showNotification} onDismiss={dismissNotification} />

        {/* Greeting */}
        <motion.div className="text-center pt-2 pb-2" variants={itemVariants}>
          {displayName && (
            <p className="text-foreground font-semibold text-lg">{(() => { const h = new Date().getHours(); return h < 12 ? 'Bonjour' : h < 18 ? 'Bon après-midi' : 'Bonsoir'; })()} {displayName} {(() => { const h = new Date().getHours(); return h < 12 ? '☀️' : h < 18 ? '🌤' : '🌙'; })()}</p>
          )}
          <p className="text-muted-foreground text-base mt-1">{greeting()}</p>
        </motion.div>


        {/* EN-TÊTE FONDATEUR — Pages lues + Ma Tillawah fusionnées */}
        <motion.div variants={itemVariants}>
          <div
            className="relative overflow-hidden rounded-[2rem] p-5"
            style={{
              background: COLORS.beige,
              border: `2px solid ${COLORS.emerald}30`,
              boxShadow: `0 4px 24px -6px ${COLORS.emerald}15`,
            }}
          >
            {/* Community link — top right */}
            <Link
              to="/cercle"
              className="absolute top-4 right-4 w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
              style={{ background: `${COLORS.emerald}12` }}
            >
              <Users className="h-5 w-5" style={{ color: COLORS.emerald }} />
            </Link>

            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${COLORS.gold}18`, border: `1px solid ${COLORS.gold}30` }}
              >
                <BookOpen className="h-7 w-7" style={{ color: COLORS.goldAccent }} />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: COLORS.sage }}>Aujourd'hui</p>
                <p className="text-3xl font-bold" style={{ color: COLORS.emerald }}>{todayProgress}</p>
                <p className="text-sm font-medium" style={{ color: COLORS.sage }}>pages lues</p>
              </div>
            </div>

            {/* Weekly streak dots */}
            <div className="flex items-center gap-2 mt-4 px-1">
              <div className="flex -space-x-0.5">
                {[...Array(7)].map((_, i) => (
                  <div
                    key={i}
                    className="w-4 h-4 rounded-full border-2"
                    style={{
                      borderColor: COLORS.emerald + '50',
                      background: i < weeklyStreak ? COLORS.emerald : COLORS.greenMist,
                    }}
                  />
                ))}
              </div>
              <span className="text-xs font-semibold ml-1" style={{ color: COLORS.sage }}>
                {weeklyStreak}/7 jours
              </span>
            </div>

            {/* Ma Tillawah sub-link */}
            <Link to="/planificateur" className="block mt-4">
              <motion.div
                className="flex items-center gap-3 rounded-xl px-4 py-3 relative overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${COLORS.gold}, ${COLORS.goldAccent})` }}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5, ease: easeOut }}
              >
                {/* Shimmer effect */}
                <motion.div
                  className="absolute inset-0"
                  style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)' }}
                  initial={{ x: '-100%' }}
                  animate={{ x: '200%' }}
                  transition={{ delay: 1, duration: 1.2, ease: 'easeInOut' }}
                />
                <Target className="h-5 w-5 relative z-10" style={{ color: '#fff' }} />
                <span className="text-base font-bold uppercase tracking-wide text-white relative z-10">MA KHATMA <span className="font-bold text-xs normal-case text-white">(Mon objectif)</span></span>
              </motion.div>
            </Link>
          </div>
        </motion.div>

        {/* LE NOBLE CORAN */}
        <motion.div variants={itemVariants}>
          {hasFullAccess ? (
            <Link to="/quran-reader" className="block">
              <motion.div
                className="relative overflow-hidden rounded-[2rem] p-8 group"
                style={{
                  background: COLORS.beige,
                  border: `2px solid ${COLORS.emerald}35`,
                  boxShadow: `0 6px 24px -8px ${COLORS.emerald}15`,
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full blur-2xl" style={{ background: `${COLORS.gold}08` }} />
                <div className="relative z-10 flex items-center justify-center gap-5">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${COLORS.gold}18`, border: `1px solid ${COLORS.gold}30` }}
                  >
                    <BookOpenCheck className="h-9 w-9" style={{ color: COLORS.goldAccent }} />
                  </div>
                  <div className="flex-1 text-center">
                    <h3
                      className="text-xl font-bold tracking-[0.1em] uppercase"
                      style={{ fontFamily: "'Inter', sans-serif", color: COLORS.goldAccent }}
                    >
                      Le Noble Coran
                    </h3>
                  </div>
                </div>
              </motion.div>
            </Link>
          ) : (
            <div
              className="relative overflow-hidden rounded-[2rem] p-8 opacity-75"
              style={{
                background: COLORS.beige,
                border: `2px solid ${COLORS.emerald}25`,
              }}
            >
              <div className="relative z-10 flex items-center justify-center gap-5">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${COLORS.gold}12`, border: `1px solid ${COLORS.gold}20` }}
                >
                  <BookOpenCheck className="h-9 w-9" style={{ color: COLORS.goldAccent }} />
                </div>
                <div className="flex-1 text-center">
                  <h3
                    className="text-xl font-bold tracking-[0.1em] uppercase"
                    style={{ fontFamily: "'Inter', sans-serif", color: COLORS.goldAccent }}
                  >
                    Le Noble Coran
                  </h3>
                  <p className="text-sm mt-1" style={{ color: `${COLORS.sage}90` }}>Bientôt disponible in shaa Allah</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Ma Tillawah */}

        {/* ═══ MES VERSETS FAVORIS ═══ */}
        <motion.div variants={itemVariants}>
          <FavoriteVersesSection />
        </motion.div>

        {/* ═══ NOS DÉFIS ═══ */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3
              className="text-sm font-bold tracking-[0.1em] uppercase"
              style={{ fontFamily: "'Inter', sans-serif", color: COLORS.emerald }}
            >
              Nos Défis
            </h3>
          </div>
          <div className="space-y-4">
            {!hasFullAccess && (
              <p className="text-xs text-center font-medium" style={{ color: COLORS.gold }}>
                Lancement après le Ramadan 🌸
              </p>
            )}
            <DefiAlMulk disabled={!hasFullAccess} />
            <DefiAlKahf disabled={!hasFullAccess} />
            <DefiAlBaqara disabled={!hasFullAccess} />
            <DefisCommunityCounter />
          </div>
        </motion.div>

        {/* Espace Communauté */}
        <motion.div variants={itemVariants}>
          <Link to="/cercle" className="block">
            <motion.div
              className="relative overflow-hidden rounded-[2rem] p-7 group"
              style={{
                background: `linear-gradient(135deg, ${COLORS.emerald} 0%, ${COLORS.emeraldLight} 100%)`,
                border: `2px solid ${COLORS.gold}35`,
                boxShadow: `0 8px 28px -8px ${COLORS.emerald}40`,
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="relative z-10 flex items-center gap-5">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${COLORS.gold}22`, border: `1px solid ${COLORS.gold}35` }}
                >
                  <Users className="h-7 w-7" style={{ color: COLORS.goldAccent }} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold tracking-[0.06em] uppercase" style={{ fontFamily: "'Inter', sans-serif", color: COLORS.goldAccent }}>
                    Espace Communauté
                  </h3>
                  <p className="text-white/70 text-sm mt-1">Rejoindre la communauté</p>
                </div>
              </div>
            </motion.div>
          </Link>
        </motion.div>

        {/* Weekly Report */}
        {user && readingGoal && (
          <motion.div variants={itemVariants}>
            <RamadanWeeklyReport firstName={readingGoal.first_name} dailyPages={readingGoal.daily_pages} />
          </motion.div>
        )}

        {/* Spiritual Quote */}
        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden rounded-[2rem] p-8 border"
          style={{
            background: `linear-gradient(135deg, ${COLORS.greenMist}80, ${COLORS.beige})`,
            borderColor: `${COLORS.emerald}15`,
          }}
        >
          <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full blur-2xl" style={{ background: `${COLORS.emerald}06` }} />
          <p className="relative z-10 text-lg leading-relaxed italic text-center" style={{ color: COLORS.emerald, fontFamily: "'Inter', sans-serif" }}>
            « Ô les croyants ! On vous a prescrit le jeûne comme on l'a prescrit à ceux d'avant vous, ainsi atteindrez-vous la piété »
          </p>
          <p className="relative z-10 text-sm mt-3 text-center font-medium" style={{ color: COLORS.sage }}>
            — Sourate Al-Baqara, verset 183
          </p>
        </motion.div>

        {/* PWA Install */}
        {!isInstalled && isInstallable && (
          <motion.div variants={itemVariants}>
            <motion.button
              onClick={() => {
                if (isIOS) {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  toast('📲 Pour installer l\'app', {
                    description: 'Appuie sur le bouton Partager (⎙) puis "Sur l\'écran d\'accueil"',
                    duration: 8000,
                  });
                } else {
                  promptInstall();
                }
              }}
              className="w-full relative overflow-hidden rounded-[2rem] p-7 group border-2"
              style={{
                background: `linear-gradient(135deg, ${COLORS.emerald}, ${COLORS.emeraldLight})`,
                borderColor: `${COLORS.gold}40`,
                boxShadow: `0 8px 32px -8px ${COLORS.emerald}40`,
              }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
            >
              <div className="relative z-10 flex items-center justify-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${COLORS.gold}22` }}>
                  <Download className="h-6 w-6" style={{ color: COLORS.goldAccent }} />
                </div>
                <div className="text-left">
                  <p className="text-lg font-bold text-white">📲 Télécharger</p>
                  <p className="text-white/70 text-sm">Installe l'app sur ton téléphone</p>
                </div>
              </div>
            </motion.button>
          </motion.div>
        )}

        {/* Share Button */}
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
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl transition-colors"
            style={{ background: `${COLORS.emerald}10` }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            <Share2 className="h-5 w-5" style={{ color: COLORS.emerald }} />
            <span className="text-base font-bold" style={{ color: COLORS.emerald, fontFamily: "'Inter', sans-serif" }}>
              Partager l'application
            </span>
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Name Prompt Dialog */}
      <Dialog open={showNamePrompt} onOpenChange={setShowNamePrompt}>
        <DialogContent className="max-w-sm mx-4 rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl text-center" style={{ fontFamily: "'Inter', sans-serif", color: COLORS.emerald }}>
              Salam Aleykoum 🌿
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-center text-muted-foreground">Comment vous appelez-vous ?</p>
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
              className="w-full rounded-2xl"
              style={{ background: COLORS.emerald, color: '#fff' }}
            >
              Bismillah ✨
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
