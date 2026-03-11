import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Easing } from 'framer-motion';
import { BookOpen, BookHeart, RefreshCw, BarChart3, Play } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';


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

const STEP_NAMES = ['Intention', 'Réveil', 'Imprégnation', 'Istiqâmah', 'Validation'];
const MOURAD_PHASE_NAMES = ['Compréhension', 'Imprégnation', 'Liaison', 'Ancrage'];

export default function HifzHubPage() {
  const { user } = useAuth();
  const [activeHifzSession, setActiveHifzSession] = useState<{ surahName: string; stepName: string } | null>(null);
  const [activeMouradSession, setActiveMouradSession] = useState<{ surahName: string; phaseName: string } | null>(null);
  const [pendingReviews, setPendingReviews] = useState(0);

  useEffect(() => {
    if (user) {
      fetchPendingReviews();
      detectActiveMouradSession();
    }
    detectActiveHifzSession();
  }, [user]);

  const fetchPendingReviews = async () => {
    if (!user) return;
    try {
      const today = new Date().toISOString().split('T')[0];
      const { count } = await supabase
        .from('hifz_memorized_verses')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .lte('next_review_date', today);
      setPendingReviews(count || 0);
    } catch { /* ignore */ }
  };

  const detectActiveHifzSession = async () => {
    try {
      const raw = localStorage.getItem('hifz_active_session');
      if (raw) {
        const data = JSON.parse(raw);
        if (data.session && typeof data.step === 'number' && data.step >= 0 && data.step <= 4) {
          if (Date.now() - (data.ts || 0) < 24 * 60 * 60 * 1000) {
            const surahData = await import('@/lib/surahData');
            const surah = surahData.SURAHS.find((s: any) => s.number === data.session.surahNumber);
            setActiveHifzSession({
              surahName: surah?.name || `Sourate ${data.session.surahNumber}`,
              stepName: STEP_NAMES[data.step] || `Étape ${data.step}`,
            });
            return;
          }
        }
      }
      if (user) {
        const { data: dbSession } = await supabase
          .from('hifz_sessions')
          .select('surah_number, current_step')
          .eq('user_id', user.id)
          .is('completed_at', null)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (dbSession && dbSession.current_step >= 0 && dbSession.current_step <= 4) {
          const surahData = await import('@/lib/surahData');
          const surah = surahData.SURAHS.find((s: any) => s.number === dbSession.surah_number);
          setActiveHifzSession({
            surahName: surah?.name || `Sourate ${dbSession.surah_number}`,
            stepName: STEP_NAMES[dbSession.current_step] || `Étape ${dbSession.current_step}`,
          });
        }
      }
    } catch { /* ignore */ }
  };

  const detectActiveMouradSession = async () => {
    if (!user) return;
    try {
      const { data: dbSession } = await supabase
        .from('mourad_sessions')
        .select('surah_number, current_phase')
        .eq('user_id', user.id)
        .is('completed_at', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (dbSession && dbSession.current_phase >= 0 && dbSession.current_phase <= 3) {
        const surahData = await import('@/lib/surahData');
        const surah = surahData.SURAHS.find((s: any) => s.number === dbSession.surah_number);
        setActiveMouradSession({
          surahName: surah?.name || `Sourate ${dbSession.surah_number}`,
          phaseName: MOURAD_PHASE_NAMES[dbSession.current_phase] || `Phase ${dbSession.current_phase}`,
        });
      }
    } catch { /* ignore */ }
  };

  const easeOut: Easing = [0.16, 1, 0.3, 1];
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.92 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7, ease: easeOut } },
  };

  return (
    <AppLayout title="Hifz">
      <motion.div className="space-y-4 pb-6 pt-2" variants={containerVariants} initial="hidden" animate="visible">

        {/* Méthode Tikrar-ISTIQÂMAH */}
        <motion.div variants={itemVariants}>
          <Link to="/hifz" className="block">
            <motion.div
              className="relative overflow-hidden rounded-[2rem] p-7 group"
              style={{
                background: `linear-gradient(135deg, ${COLORS.emerald} 0%, ${COLORS.emeraldLight} 100%)`,
                border: `2px solid ${COLORS.gold}40`,
                boxShadow: `0 8px 32px -8px ${COLORS.emerald}50`,
              }}
              whileTap={{ scale: 0.97 }}
            >
              <div className="absolute -bottom-4 -right-4 w-32 h-32 rounded-full blur-xl" style={{ background: `${COLORS.gold}10` }} />
              <div className="relative z-10 flex items-center gap-5">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${COLORS.gold}22`, border: `1px solid ${COLORS.gold}35` }}
                >
                  {activeHifzSession ? (
                    <Play className="h-8 w-8" style={{ color: COLORS.goldAccent }} />
                  ) : (
                    <BookOpen className="h-8 w-8" style={{ color: COLORS.goldAccent }} />
                  )}
                </div>
                <div className="flex-1">
                  <h3
                    className="text-base font-bold tracking-[0.08em] uppercase"
                    style={{ fontFamily: "'Inter', sans-serif", color: COLORS.goldAccent }}
                  >
                    {activeHifzSession ? '▶️ Continuer ma session' : <>Méthode Tikrar-ISTIQÂMAH<sup className="text-[0.6em] ml-0.5">1</sup></>}
                  </h3>
                  <p className="text-white/70 text-sm mt-1">
                    {activeHifzSession
                      ? `${activeHifzSession.surahName} — ${activeHifzSession.stepName}`
                      : 'Apprendre et mémoriser le Coran'}
                  </p>
                </div>
              </div>
            </motion.div>
          </Link>
        </motion.div>

        {/* Méthode Oustaz Mourad */}
        <motion.div variants={itemVariants}>
          <Link to="/methode-mourad" className="block">
            <motion.div
              className="relative overflow-hidden rounded-[2rem] p-7 group"
              style={{
                background: `linear-gradient(135deg, ${COLORS.emerald} 0%, ${COLORS.emeraldLight} 100%)`,
                border: `2px solid ${COLORS.gold}40`,
                boxShadow: `0 8px 32px -8px ${COLORS.emerald}50`,
              }}
              whileTap={{ scale: 0.97 }}
            >
              <div className="absolute -bottom-4 -right-4 w-32 h-32 rounded-full blur-xl" style={{ background: `${COLORS.gold}10` }} />
              <div className="relative z-10 flex items-center gap-5">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${COLORS.gold}22`, border: `1px solid ${COLORS.gold}35` }}
                >
                  {activeMouradSession ? (
                    <Play className="h-7 w-7" style={{ color: COLORS.goldAccent }} />
                  ) : (
                    <BookHeart className="h-7 w-7" style={{ color: COLORS.goldAccent }} />
                  )}
                </div>
                <div className="flex-1">
                  <h3
                    className="text-base font-bold tracking-[0.08em] uppercase"
                    style={{ fontFamily: "'Inter', sans-serif", color: COLORS.goldAccent }}
                  >
                    {activeMouradSession ? '▶️ Continuer ma session' : 'Méthode Oustaz Mourad + Tikrar + Istiqâmah'}
                  </h3>
                  <p className="text-white/70 text-sm mt-1">
                    {activeMouradSession
                      ? `${activeMouradSession.surahName} — ${activeMouradSession.phaseName}`
                      : 'Recommandé pour débutant'}
                  </p>
                </div>
              </div>
            </motion.div>
          </Link>
        </motion.div>

        {/* Muraja'a */}
        <motion.div variants={itemVariants}>
          <Link to="/muraja" className="block">
            <motion.div
              className="relative overflow-hidden rounded-[2rem] p-7 group"
              style={{
                background: `linear-gradient(135deg, ${COLORS.sage} 0%, ${COLORS.sageLight} 100%)`,
                border: `2px solid ${COLORS.gold}40`,
                boxShadow: `0 8px 32px -8px ${COLORS.sage}50`,
              }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="absolute -bottom-4 -right-4 w-32 h-32 rounded-full blur-xl" style={{ background: `${COLORS.gold}10` }} />
              <div className="relative z-10 flex items-center gap-5">
                <div className="relative">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${COLORS.gold}22`, border: `1px solid ${COLORS.gold}35` }}
                  >
                    <RefreshCw className="h-8 w-8" style={{ color: COLORS.goldAccent }} />
                  </div>
                  {pendingReviews > 0 && (
                    <span
                      className="absolute -top-1.5 -right-1.5 min-w-[22px] h-[22px] rounded-full flex items-center justify-center text-[11px] font-bold px-1"
                      style={{
                        background: 'linear-gradient(135deg, #d4af37, #b8962e)',
                        color: '#1a2e1a',
                        border: '2px solid white',
                        boxShadow: '0 2px 6px rgba(212,175,55,0.4)',
                      }}
                    >
                      {pendingReviews > 99 ? '99+' : pendingReviews}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <h3
                    className="text-xl font-bold tracking-[0.08em] uppercase"
                    style={{ fontFamily: "'Inter', sans-serif", color: COLORS.goldAccent }}
                  >
                    Muraja'a
                  </h3>
                  <p className="text-white/70 text-sm mt-1">
                    {pendingReviews > 0
                      ? `${pendingReviews} portion${pendingReviews > 1 ? 's' : ''} à réviser`
                      : 'Réviser et consolider'}
                  </p>
                </div>
              </div>
            </motion.div>
          </Link>
        </motion.div>

        {/* Mon Suivi Hifz */}
        <motion.div variants={itemVariants}>
          <Link to="/hifz-suivi" className="block">
            <motion.div
              className="relative overflow-hidden rounded-2xl p-5 flex items-center gap-4 group"
              style={{
                background: COLORS.greenMist,
                border: `1.5px solid ${COLORS.emerald}20`,
              }}
              whileTap={{ scale: 0.97 }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${COLORS.gold}18`, border: `1px solid ${COLORS.gold}25` }}
              >
                <BarChart3 className="h-6 w-6" style={{ color: COLORS.goldAccent }} />
              </div>
              <div>
                <h4
                  className="text-sm font-bold tracking-[0.06em] uppercase"
                  style={{ fontFamily: "'Inter', sans-serif", color: COLORS.emerald }}
                >
                  Mon Suivi Hifz
                </h4>
                <p className="text-xs mt-0.5" style={{ color: COLORS.sage }}>Statistiques & progression</p>
              </div>
            </motion.div>
          </Link>
        </motion.div>

      </motion.div>
    </AppLayout>
  );
}
