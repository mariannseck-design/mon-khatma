import { useState, useCallback, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import HifzConfig from '@/components/hifz/HifzConfig';
import HifzGoalOnboarding from '@/components/hifz/HifzGoalOnboarding';
import HifzStep0Intention from '@/components/hifz/HifzStep0Intention';
import HifzStep1Revision from '@/components/hifz/HifzStep1Revision';
import HifzStep2Impregnation from '@/components/hifz/HifzStep2Impregnation';
import HifzStep3Memorisation from '@/components/hifz/HifzStep3Memorisation';
import HifzStep4Validation from '@/components/hifz/HifzStep4Validation';
import HifzStep5Liaison from '@/components/hifz/HifzStep5Liaison';
import HifzStep6Tour from '@/components/hifz/HifzStep6Tour';
import HifzSuccess from '@/components/hifz/HifzSuccess';
import DevSkipButton from '@/components/hifz/DevSkipButton';

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

export default function HifzPage() {
  const { user } = useAuth();
  const [step, setStep] = useState<number>(-1);
  const [session, setSession] = useState<HifzSession | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [hasGoal, setHasGoal] = useState<boolean | null>(null); // null = loading
  const [showGoalOnboarding, setShowGoalOnboarding] = useState(false);

  // Check if user has an active goal
  useEffect(() => {
    if (!user) { setHasGoal(true); return; } // skip for non-auth
    const check = async () => {
      const { data } = await supabase
        .from('hifz_goals')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();
      setHasGoal(!!data);
      if (!data) setShowGoalOnboarding(true);
    };
    check();
  }, [user]);

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
  }, [user]);

  const updateStep = useCallback(async (newStep: number) => {
    setStep(newStep);
    if (sessionId && user) {
      await supabase.from('hifz_sessions').update({
        current_step: newStep,
        step_status: { [`step_${newStep}`]: 'in_progress' },
      }).eq('id', sessionId);
    }
  }, [sessionId, user]);

  const completeSession = useCallback(async (difficulty: string) => {
    if (sessionId && user) {
      await supabase.from('hifz_sessions').update({
        current_step: 6,
        completed_at: new Date().toISOString(),
      }).eq('id', sessionId);

      if (session) {
        try {
          const { error: upsertError } = await supabase.from('hifz_memorized_verses').upsert({
            user_id: user.id,
            surah_number: session.surahNumber,
            verse_start: session.startVerse,
            verse_end: session.endVerse,
            memorized_at: new Date().toISOString(),
            next_review_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
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
        const isConsecutive = lastDate && (
          new Date(today).getTime() - new Date(lastDate).getTime() <= 86400000
        );
        await supabase.from('hifz_streaks').update({
          current_streak: isConsecutive ? streak.current_streak + 1 : 1,
          longest_streak: Math.max(streak.longest_streak, isConsecutive ? streak.current_streak + 1 : 1),
          last_active_date: today,
        }).eq('id', streak.id);
      } else {
        await supabase.from('hifz_streaks').insert({
          user_id: user.id, current_streak: 1, longest_streak: 1, last_active_date: today,
        });
      }
    }
    setStep(7);
  }, [sessionId, user, session]);

  // Loading state
  if (hasGoal === null) {
    return (
      <AppLayout title="Espace Hifz" hideNav>
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    );
  }

  // Goal onboarding
  if (showGoalOnboarding) {
    return (
      <AppLayout title="Espace Hifz" hideNav>
        <div className="min-h-[80vh] rounded-[2rem] p-6 mx-[-4px]" style={GRADIENT_STYLE}>
          <HifzGoalOnboarding
            onGoalSet={() => { setHasGoal(true); setShowGoalOnboarding(false); }}
          />
        </div>
      </AppLayout>
    );
  }

  // Config screen
  if (!session || step === -1) {
    return (
      <AppLayout title="Espace Hifz" hideNav>
        <div className="min-h-[80vh] rounded-[2rem] p-6 mx-[-4px]" style={GRADIENT_STYLE}>
          <HifzConfig onStart={startSession} />
        </div>
      </AppLayout>
    );
  }

  // Session steps
  return (
    <AppLayout title="Espace Hifz" hideNav>
      <div className="min-h-[80vh] rounded-[2rem] p-6 mx-[-4px]" style={GRADIENT_STYLE}>
        {step === 0 && <HifzStep0Intention surahNumber={session.surahNumber} startVerse={session.startVerse} endVerse={session.endVerse} onNext={() => updateStep(1)} onBack={() => setStep(-1)} />}
        {step === 1 && <HifzStep1Revision onNext={() => updateStep(2)} onBack={() => setStep(0)} />}
        {step === 2 && <HifzStep2Impregnation surahNumber={session.surahNumber} startVerse={session.startVerse} endVerse={session.endVerse} onNext={() => updateStep(3)} onBack={() => setStep(1)} />}
        {step === 3 && <HifzStep3Memorisation surahNumber={session.surahNumber} startVerse={session.startVerse} endVerse={session.endVerse} repetitionLevel={session.repetitionLevel} onNext={() => updateStep(4)} onBack={() => setStep(2)} />}
        {step === 4 && <HifzStep4Validation surahNumber={session.surahNumber} startVerse={session.startVerse} endVerse={session.endVerse} onNext={() => updateStep(5)} onBack={() => setStep(3)} />}
        {step === 5 && <HifzStep5Liaison onNext={() => updateStep(6)} onBack={() => setStep(4)} />}
        {step === 6 && <HifzStep6Tour onComplete={completeSession} onBack={() => setStep(5)} />}
        {step === 7 && <HifzSuccess />}
        {step >= 0 && step <= 6 && (
          <DevSkipButton onSkip={() => {
            if (step < 6) { updateStep(step + 1); }
            else { completeSession('easy'); }
          }} />
        )}
      </div>
    </AppLayout>
  );
}
