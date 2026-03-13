import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDevMode } from '@/hooks/useDevMode';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { getSM2Config } from '@/lib/sm2Config';
import HifzConfig from '@/components/hifz/HifzConfig';
import HifzGoalOnboarding from '@/components/hifz/HifzGoalOnboarding';
import HifzDiagnostic from '@/components/hifz/HifzDiagnostic';
import HifzStepIntentionComprehension from '@/components/hifz/HifzStepIntentionComprehension';
import HifzStepImpregnationTajweed from '@/components/hifz/HifzStepImpregnationTajweed';
import HifzStepMemorisation from '@/components/hifz/HifzStepMemorisation';
import HifzStep5Tikrar from '@/components/hifz/HifzStep5Tikrar';
import HifzSuccess from '@/components/hifz/HifzSuccess';
import HifzBreathingPause from '@/components/hifz/HifzBreathingPause';
import DevSkipButton from '@/components/hifz/DevSkipButton';
import { SURAHS } from '@/lib/surahData';
import { getExactVersePage } from '@/lib/quranData';
import { motion } from 'framer-motion';

interface HifzSession {
  surahNumber: number;
  startVerse: number;
  endVerse: number;
  repetitionLevel: number;
}

const GRADIENT_STYLE = {
  background: 'linear-gradient(135deg, #0d7377 0%, #14919b 50%, #0d7377 100%)',
  border: '2px solid rgba(212,175,55,0.4)',
  boxShadow: '0 8px 32px -8px rgba(13,115,119,0.4)',
};

const LOCAL_KEY = 'hifz_active_session';

function saveLocalSession(session: HifzSession, step: number, sessionId: string | null, stepStatus?: Record<string, any>) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify({ session, step, sessionId, stepStatus, ts: Date.now() }));
}

function loadLocalSession(): { session: HifzSession; step: number; sessionId: string | null } | null {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data.session || typeof data.step !== 'number' || data.step < 0) return null;
    if (Date.now() - (data.ts || 0) > 24 * 60 * 60 * 1000) {
      localStorage.removeItem(LOCAL_KEY);
      return null;
    }
    return data;
  } catch {
    localStorage.removeItem(LOCAL_KEY);
    return null;
  }
}

function clearLocalSession() {
  localStorage.removeItem(LOCAL_KEY);
  localStorage.removeItem('hifz_istiqamah_state');
  localStorage.removeItem('hifz_immersion_state');
}

const STEP_NAMES = [
  'Intention et Compréhension',
  'Imprégnation',
  'Mémorisation',
  'Tikrâr',
];

export default function HifzPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(-1);
  const [session, setSession] = useState<HifzSession | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [hasGoal, setHasGoal] = useState<boolean | null>(null);
  const [showGoalOnboarding, setShowGoalOnboarding] = useState(false);
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const [restoringSession, setRestoringSession] = useState(true);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [showBreathingPause, setShowBreathingPause] = useState(false);
  const [pendingResume, setPendingResume] = useState<{ session: HifzSession; step: number; sessionId: string | null } | null>(null);
  const [resumePageLabel, setResumePageLabel] = useState('');
  const { isDevMode } = useDevMode();
  const stepStartRef = useRef<number>(Date.now());
  const stepTimesRef = useRef<Record<string, number>>({});

  // Resolve page label for resume prompt
  useEffect(() => {
    if (!pendingResume) { setResumePageLabel(''); return; }
    const { surahNumber, startVerse, endVerse } = pendingResume.session;
    (async () => {
      const pStart = await getExactVersePage(surahNumber, startVerse);
      const pEnd = await getExactVersePage(surahNumber, endVerse);
      setResumePageLabel(pStart === pEnd ? `p. ${pStart}` : `p. ${pStart}–${pEnd}`);
    })();
  }, [pendingResume]);

  // Save session progress locally
  useEffect(() => {
    if (session && step >= 0 && step <= 3) {
      saveLocalSession(session, step, sessionId);
    }
  }, [session, step, sessionId]);

  useEffect(() => {
    const handler = () => {
      if (document.visibilityState === 'visible' && session && step >= 0 && step <= 3) {
        saveLocalSession(session, step, sessionId);
      }
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, [session, step, sessionId]);

  // Init: check goal, restore session
  useEffect(() => {
    if (!user) { setHasGoal(true); setRestoringSession(false); return; }
    const init = async () => {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!profileData?.onboarding_completed) {
        setShowDiagnostic(true);
        setRestoringSession(false);
        return;
      }

      const { data: goalData } = await supabase
        .from('hifz_goals')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();
      setHasGoal(!!goalData);
      if (!goalData) setShowGoalOnboarding(true);

      const local = loadLocalSession();
      if (local && local.step >= 0 && local.step <= 3) {
        setPendingResume(local);
        setShowResumePrompt(true);
        setRestoringSession(false);
        return;
      }

      const { data: activeSession } = await supabase
        .from('hifz_sessions')
        .select('*')
        .eq('user_id', user.id)
        .is('completed_at', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (activeSession && activeSession.current_step >= 0 && activeSession.current_step <= 3) {
        const restored = {
          session: {
            surahNumber: activeSession.surah_number,
            startVerse: activeSession.start_verse,
            endVerse: activeSession.end_verse,
            repetitionLevel: activeSession.repetition_level,
          },
          step: activeSession.current_step,
          sessionId: activeSession.id,
        };
        setPendingResume(restored);
        setShowResumePrompt(true);
      }
      setRestoringSession(false);
    };
    init();
  }, [user]);

  const handleResume = () => {
    if (pendingResume) {
      setSession(pendingResume.session);
      setStep(pendingResume.step);
      setSessionId(pendingResume.sessionId);
    }
    setShowResumePrompt(false);
    setPendingResume(null);
  };

  const handleRestart = () => {
    clearLocalSession();
    setShowResumePrompt(false);
    setPendingResume(null);
    setSession(null);
    setStep(-1);
    setSessionId(null);
  };

  const startSession = useCallback(async (config: HifzSession) => {
    setSession(config);
    if (user) {
      const { data } = await supabase.from('hifz_sessions').insert({
        user_id: user.id,
        surah_number: config.surahNumber,
        start_verse: config.startVerse,
        end_verse: config.endVerse,
        repetition_level: config.repetitionLevel,
        current_step: 0,
      }).select('id').single();
      if (data) setSessionId(data.id);
    }
    setStep(0);
    stepStartRef.current = Date.now();
    stepTimesRef.current = {};
  }, [user]);

  const updateStep = useCallback(async (newStep: number) => {
    const elapsedSeconds = Math.floor((Date.now() - stepStartRef.current) / 1000);
    if (step >= 0) {
      stepTimesRef.current[`step_${step}_time`] = elapsedSeconds;
    }
    stepStartRef.current = Date.now();
    setStep(newStep);

    if (sessionId && user) {
      await supabase.from('hifz_sessions').update({
        current_step: newStep,
        step_status: {
          ...stepTimesRef.current,
          [`step_${newStep}`]: 'in_progress',
        },
      }).eq('id', sessionId);
    }
  }, [sessionId, user, step]);

  const handlePause = useCallback(async () => {
    if (session && step >= 0 && step <= 3) {
      saveLocalSession(session, step, sessionId);
      if (sessionId && user) {
        await supabase.from('hifz_sessions').update({
          current_step: step,
          step_status: { ...stepTimesRef.current, paused: true },
        }).eq('id', sessionId);
      }
    }
    navigate('/accueil');
  }, [session, step, sessionId, user, navigate]);

  // After step 1 (Imprégnation), show breathing pause before step 2 (Mémorisation)
  const handleImpregnationComplete = useCallback(() => {
    setShowBreathingPause(true);
  }, []);

  const handleBreathingComplete = useCallback(() => {
    setShowBreathingPause(false);
    updateStep(2);
  }, [updateStep]);

  // Complete session after Tikrâr (step 3)
  const completeSession = useCallback(async () => {
    const elapsedSeconds = Math.floor((Date.now() - stepStartRef.current) / 1000);
    if (step >= 0) {
      stepTimesRef.current[`step_${step}_time`] = elapsedSeconds;
    }

    clearLocalSession();

    if (sessionId && user) {
      await supabase.from('hifz_sessions').update({
        current_step: 4,
        completed_at: new Date().toISOString(),
        step_status: { ...stepTimesRef.current, completed: true },
      }).eq('id', sessionId);

      if (session) {
        try {
          const today = new Date().toISOString().split('T')[0];
          const sm2Cfg = getSM2Config();
          const { error: upsertError } = await supabase.from('hifz_memorized_verses').upsert({
            user_id: user.id,
            surah_number: session.surahNumber,
            verse_start: session.startVerse,
            verse_end: session.endVerse,
            memorized_at: new Date().toISOString(),
            next_review_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
            liaison_status: 'liaison',
            liaison_start_date: today,
            sm2_interval: sm2Cfg.interval1,
            sm2_ease_factor: sm2Cfg.initialEase,
            sm2_repetitions: 0,
          }, { onConflict: 'user_id,surah_number,verse_start,verse_end' });

          if (upsertError) {
            console.error('Upsert failed, trying insert:', upsertError);
            await supabase.from('hifz_memorized_verses').insert({
              user_id: user.id,
              surah_number: session.surahNumber,
              verse_start: session.startVerse,
              verse_end: session.endVerse,
              memorized_at: new Date().toISOString(),
              next_review_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
              liaison_status: 'liaison',
              liaison_start_date: today,
              sm2_interval: sm2Cfg.interval1,
              sm2_ease_factor: sm2Cfg.initialEase,
              sm2_repetitions: 0,
            });
          }
        } catch (err) {
          console.error('Error saving memorized verses:', err);
        }
      }

      // Update streak
      const today = new Date().toISOString().split('T')[0];
      const { data: streak } = await supabase.from('hifz_streaks')
        .select('*').eq('user_id', user.id).maybeSingle();

      if (streak) {
        const lastDate = streak.last_active_date;
        if (lastDate !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];
          const isConsecutive = lastDate === yesterdayStr;
          await supabase.from('hifz_streaks').update({
            current_streak: isConsecutive ? streak.current_streak + 1 : 1,
            longest_streak: Math.max(streak.longest_streak, isConsecutive ? streak.current_streak + 1 : 1),
            last_active_date: today,
          }).eq('id', streak.id);
        }
      } else {
        await supabase.from('hifz_streaks').insert({
          user_id: user.id, current_streak: 1, longest_streak: 1, last_active_date: today,
        });
      }
    }
    setStep(4); // success screen
  }, [sessionId, user, session, step]);

  const devModeBadge = isDevMode && (
    <div className="mb-3 flex justify-center">
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide" style={{ background: 'rgba(212,175,55,0.2)', color: '#d4af37', border: '1px solid rgba(212,175,55,0.4)' }}>
        🛠 Mode Testeur actif
      </span>
    </div>
  );

  if ((hasGoal === null && !showDiagnostic) || restoringSession) {
    return (
      <AppLayout title="Espace Hifz" hideNav>
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    );
  }

  if (showDiagnostic) {
    return (
      <AppLayout title="Espace Hifz" hideNav>
        <div className="min-h-[80vh] rounded-[2rem] p-6 mx-[-4px]" style={GRADIENT_STYLE}>
          <HifzDiagnostic
            onComplete={() => {
              setShowDiagnostic(false);
              if (user) {
                supabase.from('hifz_goals').select('id').eq('user_id', user.id).eq('is_active', true).maybeSingle().then(({ data }) => {
                  setHasGoal(!!data);
                  if (!data) setShowGoalOnboarding(true);
                });
              }
            }}
            onSkip={() => {
              setShowDiagnostic(false);
              if (user) {
                supabase.from('hifz_goals').select('id').eq('user_id', user.id).eq('is_active', true).maybeSingle().then(({ data }) => {
                  setHasGoal(!!data);
                  if (!data) setShowGoalOnboarding(true);
                });
              }
            }}
          />
        </div>
      </AppLayout>
    );
  }

  if (showResumePrompt && pendingResume) {
    const surah = SURAHS.find(s => s.number === pendingResume.session.surahNumber);
    const stepName = STEP_NAMES[pendingResume.step] || `Étape ${pendingResume.step + 2}`;
    return (
      <AppLayout title="Espace Hifz" hideNav>
        <div className="min-h-[80vh] rounded-[2rem] p-6 mx-[-4px]" style={GRADIENT_STYLE}>
          {devModeBadge}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6"
          >
            <div className="text-4xl">📖</div>
            <h2 className="text-xl font-bold" style={{ color: '#f0e6c8', fontFamily: "'Playfair Display', serif" }}>
              Session en cours
            </h2>
            <div className="rounded-2xl p-4 space-y-2" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(212,175,55,0.3)' }}>
              <p className="text-sm font-semibold" style={{ color: '#d4af37' }}>
                {surah?.name || `Sourate ${pendingResume.session.surahNumber}`}
              </p>
              <p className="text-xs" style={{ color: 'rgba(240,230,200,0.7)' }}>
                Versets {pendingResume.session.startVerse} → {pendingResume.session.endVerse}
                {resumePageLabel && <span style={{ color: 'rgba(240,230,200,0.5)' }}> · {resumePageLabel}</span>}
              </p>
              <p className="text-xs" style={{ color: 'rgba(240,230,200,0.7)' }}>
                Étape : <span className="font-semibold" style={{ color: '#f0e6c8' }}>{stepName}</span>
              </p>
            </div>
            <div className="flex flex-col gap-3 w-full max-w-xs">
              <button
                onClick={handleResume}
                className="w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-95"
                style={{ background: 'linear-gradient(135deg, #d4af37, #c9a030)', color: '#1a2e1a', boxShadow: '0 4px 15px rgba(212,175,55,0.3)' }}
              >
                ▶️ Reprendre ma session
              </button>
              <button
                onClick={handleRestart}
                className="w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-95"
                style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(240,230,200,0.8)', border: '1px solid rgba(240,230,200,0.2)' }}
              >
                🔄 Recommencer une nouvelle session
              </button>
            </div>
          </motion.div>
        </div>
        <DevSkipButton isDevMode={isDevMode} onSkip={handleResume} />
      </AppLayout>
    );
  }

  if (showGoalOnboarding) {
    return (
      <AppLayout title="Espace Hifz" hideNav>
        <div className="min-h-[80vh] rounded-[2rem] p-6 mx-[-4px]" style={GRADIENT_STYLE}>
          <HifzGoalOnboarding
            onGoalSet={() => { setHasGoal(true); setShowGoalOnboarding(false); }}
          />
        </div>
        <DevSkipButton isDevMode={isDevMode} onSkip={() => { setHasGoal(true); setShowGoalOnboarding(false); }} />
      </AppLayout>
    );
  }

  if (!session || step === -1) {
    return (
      <AppLayout title="Espace Hifz" hideNav>
        <div className="min-h-[80vh] rounded-[2rem] p-6 mx-[-4px]" style={GRADIENT_STYLE}>
          {devModeBadge}
          <HifzConfig onStart={startSession} />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Espace Hifz" hideNav>
      <div className="min-h-[80vh] rounded-[2rem] p-6 mx-[-4px]" style={GRADIENT_STYLE}>
        {devModeBadge}
        {showBreathingPause && <HifzBreathingPause onComplete={handleBreathingComplete} />}

        {/* Step 0 → Étape 2/5 : Intention et Compréhension */}
        {!showBreathingPause && step === 0 && (
          <HifzStepIntentionComprehension
            surahNumber={session.surahNumber}
            startVerse={session.startVerse}
            endVerse={session.endVerse}
            onNext={() => updateStep(1)}
            onBack={() => setStep(-1)}
            onPause={handlePause}
          />
        )}

        {/* Step 1 → Étape 3/5 : Imprégnation de la récitation et du Tajweed */}
        {!showBreathingPause && step === 1 && (
          <HifzStepImpregnationTajweed
            surahNumber={session.surahNumber}
            startVerse={session.startVerse}
            endVerse={session.endVerse}
            onNext={handleImpregnationComplete}
            onBack={() => setStep(0)}
            onPause={handlePause}
          />
        )}

        {/* Step 2 → Étape 4/5 : Mémorisation */}
        {!showBreathingPause && step === 2 && (
          <HifzStepMemorisation
            surahNumber={session.surahNumber}
            startVerse={session.startVerse}
            endVerse={session.endVerse}
            onNext={() => updateStep(3)}
            onBack={() => setStep(1)}
            onPause={handlePause}
          />
        )}

        {/* Step 3 → Étape 5/5 : Tikrâr */}
        {!showBreathingPause && step === 3 && (
          <HifzStep5Tikrar
            surahNumber={session.surahNumber}
            startVerse={session.startVerse}
            endVerse={session.endVerse}
            onNext={completeSession}
            onBack={() => setStep(2)}
            onPause={handlePause}
            stepStatus={typeof stepTimesRef.current === 'object' ? stepTimesRef.current : {}}
            onUpdateStatus={(status) => {
              stepTimesRef.current = { ...stepTimesRef.current, ...status };
              if (sessionId && user) {
                supabase.from('hifz_sessions').update({ step_status: stepTimesRef.current }).eq('id', sessionId);
              }
            }}
          />
        )}

        {/* Step 4 → Succès */}
        {step === 4 && <HifzSuccess stepTimes={stepTimesRef.current} />}
      </div>
      {step >= 0 && step <= 4 && (
        <DevSkipButton isDevMode={isDevMode} onSkip={() => {
          console.log(`[DevSkip] 🔀 Skip à step=${step}, breathing=${showBreathingPause}`);
          if (showBreathingPause) { handleBreathingComplete(); }
          else if (step === 0) { updateStep(1); }
          else if (step === 1) { handleImpregnationComplete(); }
          else if (step === 2) { updateStep(3); }
          else if (step === 3) { completeSession(); }
          else if (step === 4) { navigate('/muraja'); }
        }} />
      )}
    </AppLayout>
  );
}
