import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Easing } from 'framer-motion';
import { BookOpen, BookHeart, RefreshCw, BarChart3, Play, BookOpenCheck } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { getExactVersePage } from '@/lib/quranData';


const COLORS = {
  emerald: '#2d6a4f',
  emeraldLight: '#40916c',
  emeraldDeep: '#1B4332',
  sage: '#3a6b5a',
  sageLight: '#5a9a80',
  gold: '#b5942e',
  goldAccent: '#d4af37',
  beige: '#faf8f5',
  beigeWarm: '#f5f0e8',
  greenMist: '#dde5d4',
};

const SHOW_MOURAD_CARD = false;
const STEP_NAMES = ['Intention', 'Réveil', 'Imprégnation', 'Istiqâmah', 'Validation'];
const STEP_PHASE: Record<number, { label: string; tag: string }> = {
  0: { label: 'Étape A', tag: 'Préparation' },
  1: { label: 'Étape A', tag: 'Préparation' },
  2: { label: 'Étape B', tag: 'Mémorisation' },
  3: { label: 'Étape B', tag: 'Mémorisation' },
  4: { label: 'Étape B', tag: 'Mémorisation' },
};
const MOURAD_PHASE_NAMES = ['Compréhension', 'Imprégnation', 'Liaison', 'Ancrage'];

export default function HifzHubPage() {
  const { user, hasFullAccess, isAdmin, accessLoading } = useAuth();
  const [activeHifzSession, setActiveHifzSession] = useState<{ surahName: string; stepName: string; pageLabel?: string; phase?: { label: string; tag: string }; currentStep: number } | null>(null);
  const [activeMouradSession, setActiveMouradSession] = useState<{ surahName: string; phaseName: string; pageLabel?: string } | null>(null);
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

  const resolvePageLabel = async (surahNumber: number, vStart: number, vEnd: number): Promise<string> => {
    try {
      const pStart = await getExactVersePage(surahNumber, vStart);
      const pEnd = await getExactVersePage(surahNumber, vEnd);
      return pStart === pEnd ? `p. ${pStart}` : `p. ${pStart}–${pEnd}`;
    } catch { return ''; }
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
            const pageLabel = data.session.startVerse && data.session.endVerse
              ? await resolvePageLabel(data.session.surahNumber, data.session.startVerse, data.session.endVerse)
              : '';
            setActiveHifzSession({
              surahName: surah?.name || `Sourate ${data.session.surahNumber}`,
              stepName: STEP_NAMES[data.step] || `Étape ${data.step}`,
              pageLabel,
              phase: STEP_PHASE[data.step],
              currentStep: data.step,
            });
            return;
          }
        }
      }
      if (user) {
        const { data: dbSession } = await supabase
          .from('hifz_sessions')
          .select('surah_number, current_step, start_verse, end_verse')
          .eq('user_id', user.id)
          .is('completed_at', null)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (dbSession && dbSession.current_step >= 0 && dbSession.current_step <= 4) {
          const surahData = await import('@/lib/surahData');
          const surah = surahData.SURAHS.find((s: any) => s.number === dbSession.surah_number);
          const pageLabel = await resolvePageLabel(dbSession.surah_number, dbSession.start_verse, dbSession.end_verse);
          setActiveHifzSession({
            surahName: surah?.name || `Sourate ${dbSession.surah_number}`,
            stepName: STEP_NAMES[dbSession.current_step] || `Étape ${dbSession.current_step}`,
            pageLabel,
            phase: STEP_PHASE[dbSession.current_step],
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
        .select('surah_number, current_phase, verse_start, verse_end')
        .eq('user_id', user.id)
        .is('completed_at', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (dbSession && dbSession.current_phase >= 0 && dbSession.current_phase <= 3) {
        const surahData = await import('@/lib/surahData');
        const surah = surahData.SURAHS.find((s: any) => s.number === dbSession.surah_number);
        const pageLabel = await resolvePageLabel(dbSession.surah_number, dbSession.verse_start, dbSession.verse_end);
        setActiveMouradSession({
          surahName: surah?.name || `Sourate ${dbSession.surah_number}`,
          phaseName: MOURAD_PHASE_NAMES[dbSession.current_phase] || `Phase ${dbSession.current_phase}`,
          pageLabel,
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

        {/* En-tête ISTIQÂMAH */}
        <motion.div variants={itemVariants} className="flex flex-col items-center gap-2 py-4">
          <div className="w-14 h-px" style={{ background: `linear-gradient(90deg, transparent, ${COLORS.goldAccent}, transparent)` }} />
          <h2
            className="text-lg font-semibold tracking-[0.25em] uppercase istiqamah-shimmer"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            ISTIQÂMAH
          </h2>
          <p className="text-xs italic" style={{ color: `${COLORS.sage}bb` }}>
            La constance mène à l'excellence
          </p>
          <div className="w-14 h-px" style={{ background: `linear-gradient(90deg, transparent, ${COLORS.goldAccent}, transparent)` }} />
        </motion.div>


        {/* Le Noble Coran */}
        <motion.div variants={itemVariants}>
          {hasFullAccess && !accessLoading ? (
            <Link to="/quran-reader" className="block">
              <motion.div
                className="relative overflow-hidden rounded-[2rem] p-7 group"
                style={{
                  background: COLORS.beige,
                  border: `2px solid ${COLORS.emerald}35`,
                  boxShadow: `0 6px 24px -8px ${COLORS.emerald}15`,
                }}
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
                      className="text-xl font-bold tracking-[0.1em] uppercase istiqamah-shimmer"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      Le Noble Coran
                    </h3>
                  </div>
                </div>
              </motion.div>
            </Link>
          ) : (
            <div
              className="relative overflow-hidden rounded-[2rem] p-7 opacity-75"
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

        {/* Méthode Tikrar-ISTIQÂMAH */}
        <motion.div variants={itemVariants}>
          {hasFullAccess && !accessLoading ? (
            <Link to="/hifz" className="block">
              <motion.div
                className="relative overflow-hidden rounded-[2rem] p-7 group"
                style={{
                  background: activeHifzSession
                    ? `linear-gradient(135deg, ${COLORS.emeraldDeep} 0%, ${COLORS.emerald} 100%)`
                    : `linear-gradient(135deg, ${COLORS.emerald} 0%, ${COLORS.emeraldLight} 100%)`,
                  border: `2px solid ${COLORS.gold}40`,
                  boxShadow: activeHifzSession
                    ? `0 8px 32px -8px ${COLORS.emeraldDeep}70`
                    : `0 8px 32px -8px ${COLORS.emerald}50`,
                  borderLeft: activeHifzSession ? `4px solid ${COLORS.goldAccent}` : undefined,
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
                      <BookOpen className="h-8 w-8" style={{ color: '#fff' }} />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3
                      className="text-sm font-bold tracking-[0.08em] uppercase"
                      style={{ fontFamily: "'Inter', sans-serif", color: activeHifzSession ? COLORS.goldAccent : '#fff' }}
                    >
                      {activeHifzSession ? '▶️ Continuer ma session' : <>Méthode Tikrar-ISTIQÂMAH<sup className="text-[0.6em] ml-0.5">1</sup></>}
                    </h3>
                    <p className="text-white/70 text-sm mt-1">
                      {activeHifzSession
                        ? `${activeHifzSession.surahName} — ${activeHifzSession.stepName}${activeHifzSession.pageLabel ? ` (${activeHifzSession.pageLabel})` : ''}`
                        : 'Graver le Coran dans les cœurs'}
                    </p>
                    {activeHifzSession?.phase && (
                      <span
                        className="inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase"
                        style={{
                          background: activeHifzSession.phase.label === 'Étape A'
                            ? `${COLORS.goldAccent}25`
                            : `${COLORS.goldAccent}40`,
                          color: COLORS.goldAccent,
                          border: `1px solid ${COLORS.goldAccent}50`,
                        }}
                      >
                        {activeHifzSession.phase.label === 'Étape B' && (
                          <span className="inline-block w-1.5 h-1.5 rounded-full mr-0.5" style={{ background: COLORS.goldAccent, boxShadow: `0 0 4px ${COLORS.goldAccent}` }} />
                        )}
                        {activeHifzSession.phase.label} — {activeHifzSession.phase.tag}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            </Link>
          ) : (
            <motion.div
              className="relative overflow-hidden rounded-[2rem] p-7 opacity-60 cursor-not-allowed"
              style={{
                background: `linear-gradient(135deg, ${COLORS.emerald} 0%, ${COLORS.emeraldLight} 100%)`,
                border: `2px solid ${COLORS.gold}20`,
              }}
            >
              <div className="absolute -bottom-4 -right-4 w-32 h-32 rounded-full blur-xl" style={{ background: `${COLORS.gold}10` }} />
              <div className="relative z-10 flex items-center gap-5">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${COLORS.gold}22`, border: `1px solid ${COLORS.gold}35` }}
                >
                  <BookOpen className="h-8 w-8" style={{ color: '#fff' }} />
                </div>
                <div className="flex-1">
                  <h3
                    className="text-sm font-bold tracking-[0.08em] uppercase"
                    style={{ fontFamily: "'Inter', sans-serif", color: '#fff' }}
                  >
                    Méthode Tikrar-ISTIQÂMAH<sup className="text-[0.6em] ml-0.5">1</sup>
                  </h3>
                  <p className="text-white/70 text-sm mt-1">Bientôt disponible in shaa Allah</p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Méthode Oustaz Mourad — admin only active (masquée, SHOW_MOURAD_CARD = false) */}
        {SHOW_MOURAD_CARD && <motion.div variants={itemVariants}>
          {isAdmin && !accessLoading ? (
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
                      className="text-sm font-bold tracking-[0.08em] uppercase"
                      style={{ fontFamily: "'Inter', sans-serif", color: COLORS.goldAccent }}
                    >
                      {activeMouradSession ? '▶️ Continuer ma session' : 'Méthode Oustaz Mourad + Tikrar + Istiqâmah'}
                    </h3>
                    <p className="text-white/70 text-sm mt-1">
                      {activeMouradSession
                        ? `${activeMouradSession.surahName} — ${activeMouradSession.phaseName}${activeMouradSession.pageLabel ? ` (${activeMouradSession.pageLabel})` : ''}`
                        : 'Graver le Coran dans les cœurs'}
                    </p>
                  </div>
                </div>
              </motion.div>
            </Link>
          ) : (
            <motion.div
              className="relative overflow-hidden rounded-[2rem] p-7 opacity-60 cursor-not-allowed"
              style={{
                background: `linear-gradient(135deg, ${COLORS.emerald} 0%, ${COLORS.emeraldLight} 100%)`,
                border: `2px solid ${COLORS.gold}20`,
              }}
            >
              <div className="absolute -bottom-4 -right-4 w-32 h-32 rounded-full blur-xl" style={{ background: `${COLORS.gold}10` }} />
              <div className="relative z-10 flex items-center gap-5">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${COLORS.gold}22`, border: `1px solid ${COLORS.gold}35` }}
                >
                  <BookHeart className="h-7 w-7" style={{ color: COLORS.goldAccent }} />
                </div>
                <div className="flex-1">
                  <h3
                    className="text-sm font-bold tracking-[0.08em] uppercase"
                    style={{ fontFamily: "'Inter', sans-serif", color: COLORS.goldAccent }}
                  >
                    Méthode Oustaz Mourad + Tikrar + Istiqâmah
                  </h3>
                  <p className="text-white/70 text-sm mt-1">Bientôt disponible in shaa Allah</p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>}

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
                    <RefreshCw className="h-8 w-8" style={{ color: '#fff' }} />
                  </div>
                  {pendingReviews > 0 && (
                    <span
                      className="absolute -top-2 -right-2 min-w-[26px] h-[26px] rounded-full flex items-center justify-center text-[13px] font-extrabold px-1.5"
                      style={{
                        background: '#fff',
                        color: COLORS.emerald,
                        border: `2px solid ${COLORS.goldAccent}`,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      }}
                    >
                      {pendingReviews > 99 ? '99+' : pendingReviews}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <h3
                    className="text-xl font-bold tracking-[0.08em] uppercase"
                    style={{ fontFamily: "'Inter', sans-serif", color: '#fff' }}
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
              className="relative overflow-hidden rounded-[2rem] p-7 flex items-center gap-5 group"
              style={{
                background: COLORS.beigeWarm,
                border: `2px solid ${COLORS.emerald}30`,
                boxShadow: `0 4px 20px -6px ${COLORS.emerald}10`,
              }}
              whileTap={{ scale: 0.97 }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: `${COLORS.emerald}15`, border: `1px solid ${COLORS.emerald}25` }}
              >
                <BarChart3 className="h-7 w-7" style={{ color: COLORS.emerald }} />
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
