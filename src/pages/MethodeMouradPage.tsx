import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useDevMode } from '@/hooks/useDevMode';
import DevSkipButton from '@/components/hifz/DevSkipButton';
import MouradConfig from '@/components/mourad/MouradConfig';
import MouradPhase1 from '@/components/mourad/MouradPhase1';
import MouradPhase2 from '@/components/mourad/MouradPhase2';
import MouradPhase3 from '@/components/mourad/MouradPhase3';
import MouradPhase4 from '@/components/mourad/MouradPhase4';
import MouradMaintenance from '@/components/mourad/MouradMaintenance';
import MouradSuccess from '@/components/mourad/MouradSuccess';

interface SessionData {
  id: string;
  surah_number: number;
  verse_start: number;
  verse_end: number;
  current_phase: number;
  listen_count: number;
  repetition_40_count: number;
  maintenance_day: number;
  maintenance_start_date: string | null;
  reciter_id: string;
  completed_at: string | null;
}

export default function MethodeMouradPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);

  // Load active session
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from('mourad_sessions' as any)
        .select('*')
        .eq('user_id', user.id)
        .is('completed_at', null)
        .order('created_at', { ascending: false })
        .limit(1);
      if (data && data.length > 0) {
        setSession(data[0] as any);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const updateSession = useCallback(async (updates: Partial<SessionData>) => {
    if (!session) return;
    await supabase
      .from('mourad_sessions' as any)
      .update(updates as any)
      .eq('id', session.id);
    setSession(prev => prev ? { ...prev, ...updates } : null);
  }, [session]);

  const handleStart = async (config: { surahNumber: number; startVerse: number; endVerse: number }) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('mourad_sessions' as any)
      .insert({
        user_id: user.id,
        surah_number: config.surahNumber,
        verse_start: config.startVerse,
        verse_end: config.endVerse,
        current_phase: 1,
      } as any)
      .select()
      .single();
    if (error) {
      toast({ title: 'Erreur', description: 'Impossible de créer la session', variant: 'destructive' });
      return;
    }
    setSession(data as any);
  };

  const advancePhase = async (nextPhase: number) => {
    await updateSession({ current_phase: nextPhase } as any);
    toast({ title: 'Phase validée ✓', description: `Passage à la phase ${nextPhase}` });
  };

  const handleMaintenanceComplete = async () => {
    if (!session || !user) return;
    // Transfer to hifz_memorized_verses for SM-2
    await supabase.from('hifz_memorized_verses').insert({
      user_id: user.id,
      surah_number: session.surah_number,
      verse_start: session.verse_start,
      verse_end: session.verse_end,
      liaison_start_date: session.maintenance_start_date,
      liaison_status: 'consolidation',
    });
    await updateSession({ completed_at: new Date().toISOString(), current_phase: 5 } as any);
    toast({ title: 'Cycle terminé ! 🎉', description: 'Les versets ont été transférés vers Muraja\'a' });
  };

  const handleNewCycle = () => {
    setSession(null);
  };

  if (loading) {
    return (
      <AppLayout title="Méthode Oustaz Mourad" hideNav>
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: '#059669', borderTopColor: 'transparent' }} />
        </div>
      </AppLayout>
    );
  }

  const phase = session?.current_phase ?? 0;
  const isCompleted = !!session?.completed_at;

  return (
    <div className="min-h-screen" style={{ background: '#FDF8F0' }}>
      {/* Header */}
      <div className="sticky top-0 z-50 px-4 py-3 flex items-center gap-3" style={{ background: 'rgba(253,248,240,0.95)', backdropFilter: 'blur(10px)' }}>
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(5,150,105,0.1)' }}>
          <ArrowLeft className="h-4 w-4" style={{ color: '#059669' }} />
        </button>
        <h1 className="text-lg font-bold text-gray-800">Méthode Oustaz Mourad</h1>
        {session && !isCompleted && (
          <span className="ml-auto text-xs font-medium px-2 py-1 rounded-full" style={{ background: 'rgba(5,150,105,0.1)', color: '#059669' }}>
            Phase {phase}/4
          </span>
        )}
      </div>

      <div className="max-w-lg mx-auto px-4 pb-24 pt-2">
        {/* Phase indicators */}
        {session && !isCompleted && phase <= 4 && (
          <div className="flex gap-1 mb-6">
            {[1, 2, 3, 4].map(p => (
              <div
                key={p}
                className="flex-1 h-1.5 rounded-full transition-all"
                style={{
                  background: p <= phase ? '#059669' : 'rgba(5,150,105,0.15)',
                }}
              />
            ))}
          </div>
        )}

        {/* Content */}
        {!session && <MouradConfig onStart={handleStart} />}

        {session && phase === 1 && (
          <MouradPhase1
            surahNumber={session.surah_number}
            startVerse={session.verse_start}
            endVerse={session.verse_end}
            onValidate={() => advancePhase(2)}
          />
        )}

        {session && phase === 2 && (
          <MouradPhase2
            surahNumber={session.surah_number}
            startVerse={session.verse_start}
            endVerse={session.verse_end}
            listenCount={session.listen_count}
            reciterId={session.reciter_id}
            onListenComplete={async () => {
              const newCount = session.listen_count + 1;
              await updateSession({ listen_count: newCount } as any);
            }}
            onReciterChange={async (id) => {
              await updateSession({ reciter_id: id } as any);
            }}
            onValidate={() => advancePhase(3)}
          />
        )}

        {session && phase === 3 && (
          <MouradPhase3
            surahNumber={session.surah_number}
            startVerse={session.verse_start}
            endVerse={session.verse_end}
            reciterId={session.reciter_id}
            onValidate={() => advancePhase(4)}
          />
        )}

        {session && phase === 4 && (
          <MouradPhase4
            surahNumber={session.surah_number}
            startVerse={session.verse_start}
            endVerse={session.verse_end}
            repetitionCount={session.repetition_40_count}
            onAddRepetitions={async (count) => {
              const newCount = Math.min(40, session.repetition_40_count + count);
              await updateSession({ repetition_40_count: newCount } as any);
            }}
            onValidate={async () => {
              await updateSession({
                current_phase: 5,
                maintenance_start_date: new Date().toISOString().split('T')[0],
              } as any);
            }}
          />
        )}

        {session && phase === 5 && !isCompleted && (
          <MouradMaintenance
            surahNumber={session.surah_number}
            startVerse={session.verse_start}
            endVerse={session.verse_end}
            maintenanceDay={session.maintenance_day}
            maintenanceStartDate={session.maintenance_start_date}
            onDayComplete={async () => {
              const newDay = session.maintenance_day + 1;
              if (newDay >= 30) {
                await handleMaintenanceComplete();
              } else {
                await updateSession({ maintenance_day: newDay } as any);
              }
            }}
          />
        )}

        {isCompleted && session && (
          <MouradSuccess
            surahNumber={session.surah_number}
            startVerse={session.verse_start}
            endVerse={session.verse_end}
            onNewCycle={handleNewCycle}
            onGoToMuraja={() => navigate('/muraja')}
          />
        )}
      </div>
    </div>
  );
}
