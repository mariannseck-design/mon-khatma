import { useState, useEffect, useCallback } from 'react';
import { motion, Easing } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CircularProgress } from '@/components/planificateur/CircularProgress';
import { PageGrid } from '@/components/planificateur/PageGrid';
import { EveningCheckIn } from '@/components/planificateur/EveningCheckIn';
import { CuriosityCorner } from '@/components/planificateur/CuriosityCorner';
import { GoldenSparkles } from '@/components/planificateur/GoldenSparkles';
import { SuccessModal } from '@/components/planificateur/SuccessModal';

const TOTAL_QURAN_PAGES = 604;

export default function PlanificateurPage() {
  const { user } = useAuth();
  const [totalPagesRead, setTotalPagesRead] = useState(0);
  const [todayValidated, setTodayValidated] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [todayPages, setTodayPages] = useState(0);

  useEffect(() => {
    if (user) {
      fetchProgress();

      // Subscribe to real-time changes
      const channel = supabase
        .channel('quran-progress-realtime')
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
    
    const pagesReadToday = todayData?.pages_read || 0;
    setTodayPages(pagesReadToday);
    setTodayValidated(pagesReadToday > 0);

    // Total pages read (all time) - use max page reached
    const { data: allProgress } = await supabase
      .from('quran_progress')
      .select('pages_read')
      .eq('user_id', user.id)
      .order('pages_read', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    setTotalPagesRead(allProgress?.pages_read || 0);
  };

  const handleValidateReading = async (lastPage: number) => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];

    const { data: existing } = await supabase
      .from('quran_progress')
      .select('id, pages_read')
      .eq('user_id', user.id)
      .eq('date', today)
      .maybeSingle();

    if (existing) {
      // Update with higher page if applicable
      const newPage = Math.max(existing.pages_read, lastPage);
      await supabase
        .from('quran_progress')
        .update({ pages_read: newPage })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('quran_progress')
        .insert({
          user_id: user.id,
          pages_read: lastPage,
        });
    }

    // Trigger celebration
    setShowSparkles(true);
    setTimeout(() => {
      setShowSuccessModal(true);
    }, 800);

    await fetchProgress();
  };

  const handleSparkleComplete = useCallback(() => {
    setShowSparkles(false);
  }, []);

  const handleCreateGoal = async (type: 'pages_per_day' | 'duration_days', value: number) => {
    if (!user) return;

    const endDate = new Date();
    if (type === 'duration_days') {
      endDate.setDate(endDate.getDate() + value);
    } else {
      const daysNeeded = Math.ceil(TOTAL_QURAN_PAGES / value);
      endDate.setDate(endDate.getDate() + daysNeeded);
    }

    await supabase
      .from('quran_goals')
      .update({ is_active: false })
      .eq('user_id', user.id)
      .eq('is_active', true);

    await supabase
      .from('quran_goals')
      .insert({
        user_id: user.id,
        goal_type: type,
        target_value: value,
        end_date: endDate.toISOString().split('T')[0],
      });

    toast.success('Objectif créé! Bismillah 🌙');
  };

  const easeOut: Easing = [0.0, 0.0, 0.2, 1];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, ease: easeOut },
    },
  };


  const isComplete = totalPagesRead >= TOTAL_QURAN_PAGES;

  return (
    <AppLayout title="Khatma">
      <motion.div 
        className="space-y-6 pb-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-2">
            📖 Ma Khatma
          </h1>
          <p className="text-lg text-muted-foreground">
            Avec l'aide d'Allah <span className="honorific">(عز وجل)</span>
          </p>
        </motion.div>

        {/* Circular Progress - Center Stage */}
        <motion.div 
          variants={itemVariants}
          className="flex flex-col items-center py-6"
        >
          <div className="relative">
            <GoldenSparkles isActive={showSparkles} onComplete={handleSparkleComplete} />
            <CircularProgress 
              pagesRead={totalPagesRead} 
              size={200}
              strokeWidth={12}
            />
          </div>
          
          {/* Next Step Indicator */}
          {!isComplete && totalPagesRead > 0 && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 text-base text-muted-foreground"
            >
              Prochaine étape : <span className="font-semibold text-primary">Page {Math.min(totalPagesRead + 1, TOTAL_QURAN_PAGES)}</span>
            </motion.p>
          )}
        </motion.div>

        {/* Completion Message */}
        {isComplete && (
          <motion.div 
            variants={itemVariants}
            className="text-center bg-gradient-to-r from-gold/20 via-cream to-gold/20 rounded-2xl p-6"
          >
            <p className="text-2xl font-display font-bold text-foreground mb-2">
              ✨ Khatma complète! ✨
            </p>
            <p className="text-lg text-muted-foreground italic">
              Qu'Allah <span className="honorific">(عز وجل)</span> accepte ta lecture et te récompense.
            </p>
          </motion.div>
        )}

        {/* Evening Check-in Section */}
        <motion.div variants={itemVariants}>
          <EveningCheckIn
            currentPage={todayPages}
            onValidate={handleValidateReading}
            isValidated={todayValidated}
          />
        </motion.div>

        {/* Page Grid - Juz Progress */}
        <motion.div variants={itemVariants}>
          <PageGrid pagesRead={totalPagesRead} />
        </motion.div>

        {/* Curiosity Corner - Calculators at bottom */}
        <motion.div variants={itemVariants}>
          <CuriosityCorner 
            pagesRead={totalPagesRead}
            onCreateGoal={handleCreateGoal}
          />
        </motion.div>

        {/* Spiritual Quote */}
        <motion.div 
          variants={itemVariants}
          className="text-center pt-4 pb-2"
        >
          <p className="font-display text-base text-muted-foreground italic">
            "Lis! Au nom de ton Seigneur qui a créé."
          </p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            — Sourate Al-'Alaq, verset 1
          </p>
        </motion.div>

        {/* Success Modal */}
        <SuccessModal 
          isOpen={showSuccessModal} 
          onClose={() => setShowSuccessModal(false)} 
        />
      </motion.div>
    </AppLayout>
  );
}
