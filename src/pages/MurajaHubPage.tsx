import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { ArrowLeft, Link2, RefreshCw, BookOpen, CalendarDays, BarChart3 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useNavigate } from 'react-router-dom';
import { useMurajaData } from '@/hooks/useMurajaData';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';

export default function MurajaHubPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { loading, rabtVerses, tourVerses, checkedIds } = useMurajaData();
  const todayKey = new Date().toISOString().split('T')[0];

  const [streak, setStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);

  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from('hifz_streaks')
      .select('current_streak, longest_streak')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setStreak(data.current_streak);
          setLongestStreak(data.longest_streak);
        }
      });
  }, [user?.id]);

  const rabtDone = rabtVerses.filter(v => checkedIds.includes(v.id)).length;
  const tourDone = tourVerses.filter(v => checkedIds.includes(v.id)).length;

  return (
    <AppLayout title="Muraja'a" hideNav bgClassName="bg-gradient-muraja">
      <div className="max-w-md mx-auto px-4 py-5 space-y-5" style={{ backgroundColor: 'var(--p-bg)', minHeight: '100vh' }}>
        {/* Header */}
        <div className="relative flex items-center justify-center">
          <button
            onClick={() => navigate('/accueil')}
            className="absolute left-0 p-1.5 rounded-full"
            style={{ color: 'var(--p-text-40)' }}
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
          </button>
          {streak > 0 && (
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.button
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="absolute right-0 flex items-center gap-0.5 px-2 py-1 rounded-full"
                  >
                    <span className="text-xs font-bold" style={{ color: '#D4AF37' }}>{streak}</span>
                    <span className="text-xs">🔥</span>
                  </motion.button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs font-semibold">
                  Record : {longestStreak} jours 🏆
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <div className="text-center">
            <h1 className="text-base font-bold" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: 'var(--p-primary)' }}>
              Muraja'a
            </h1>
            <p className="text-[11px] font-medium" style={{ color: 'var(--p-text-40)' }}>
              Consolide ta mémorisation
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: 'var(--p-primary)', borderTopColor: 'transparent' }} />
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            {/* Ar-Rabt Card */}
            <motion.button
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              onClick={() => navigate('/muraja/rabt')}
              className="w-full rounded-2xl p-5 text-left transition-all"
              style={{
                background: 'var(--p-card)',
                border: '1px solid var(--p-border)',
                borderLeftWidth: '4px',
                borderLeftColor: '#D4AF37',
              }}
              whileTap={{ scale: 0.97 }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(212,175,55,0.15)' }}>
                  <Link2 className="h-5 w-5" style={{ color: '#D4AF37' }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold" style={{ color: 'var(--p-text)' }}>Ar-Rabt</p>
                  <p className="text-[11px]" style={{ color: 'var(--p-text-50)' }}>Liaison quotidienne · 30 jours</p>
                </div>
                <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: 'rgba(212,175,55,0.12)', color: '#D4AF37' }}>
                  {rabtDone}/{rabtVerses.length}
                </span>
              </div>
              <p className="text-[11px] leading-relaxed" style={{ color: 'var(--p-text-40)' }}>
                Récite chaque jour tes portions récentes pour les ancrer solidement.
              </p>
            </motion.button>

            {/* Consolidation Card */}
            <motion.button
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              onClick={() => navigate('/muraja/revision')}
              className="w-full rounded-2xl p-5 text-left transition-all"
              style={{
                background: 'var(--p-card)',
                border: '1px solid var(--p-border)',
                borderLeftWidth: '4px',
                borderLeftColor: '#10B981',
              }}
              whileTap={{ scale: 0.97 }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.15)' }}>
                  <RefreshCw className="h-5 w-5" style={{ color: '#10B981' }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold" style={{ color: 'var(--p-text)' }}>Consolidation</p>
                  <p className="text-[11px]" style={{ color: 'var(--p-text-50)' }}>Révision espacée SM-2</p>
                </div>
                <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: 'rgba(16,185,129,0.12)', color: '#10B981' }}>
                  {tourDone}/{tourVerses.length}
                </span>
              </div>
              <p className="text-[11px] leading-relaxed" style={{ color: 'var(--p-text-40)' }}>
                Révise tes portions anciennes au moment optimal selon l'algorithme.
              </p>
            </motion.button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
