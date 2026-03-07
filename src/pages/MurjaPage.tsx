import { useState, useEffect, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { RefreshCw, RotateCcw, BookOpen, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { SURAHS } from '@/lib/surahData';
import MurajaCountdown from '@/components/muraja/MurajaCountdown';
import MurajaRabt from '@/components/muraja/MurajaRabt';
import MurajaTour from '@/components/muraja/MurajaTour';
import MurajaCelebration from '@/components/muraja/MurajaCelebration';

interface MemorizedVerse {
  id: string;
  surah_number: number;
  verse_start: number;
  verse_end: number;
  memorized_at: string;
  last_reviewed_at: string | null;
  next_review_date: string;
  sm2_interval: number;
  sm2_ease_factor: number;
  sm2_repetitions: number;
}

export default function MurjaPage() {
  const { user } = useAuth();
  const [allVerses, setAllVerses] = useState<MemorizedVerse[]>([]);
  const [loading, setLoading] = useState(true);
  const [celebration, setCelebration] = useState<'daily' | 'cycle' | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!user) return;
    const fetchVerses = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('hifz_memorized_verses')
        .select('*')
        .eq('user_id', user.id)
        .order('memorized_at', { ascending: false });
      setAllVerses((data as MemorizedVerse[]) || []);
      setLoading(false);
    };
    fetchVerses();
  }, [user, refreshKey]);

  // Verses memorized in last 30 days (for Ar-Rabt)
  const recentVerses = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return allVerses.filter(v => new Date(v.memorized_at) >= thirtyDaysAgo);
  }, [allVerses]);

  // Verses due for review today (for Le Tour)
  const dueVerses = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return allVerses.filter(v => v.next_review_date <= today);
  }, [allVerses]);

  // Next review date for countdown
  const nextReviewDate = useMemo(() => {
    if (allVerses.length === 0) return null;
    const sorted = [...allVerses].sort((a, b) =>
      a.next_review_date.localeCompare(b.next_review_date)
    );
    const nextDateStr = sorted[0].next_review_date;
    return new Date(nextDateStr + 'T00:00:00');
  }, [allVerses]);

  // Total memorized verse count
  const totalVersesCount = useMemo(() => {
    return allVerses.reduce((sum, v) => sum + (v.verse_end - v.verse_start + 1), 0);
  }, [allVerses]);

  // Group by surah for summary
  const surahSummary = useMemo(() => {
    const map = new Map<number, { name: string; versesCount: number; nextReview: string }>();
    for (const v of allVerses) {
      const existing = map.get(v.surah_number);
      const count = v.verse_end - v.verse_start + 1;
      if (existing) {
        existing.versesCount += count;
        if (v.next_review_date < existing.nextReview) existing.nextReview = v.next_review_date;
      } else {
        const surahName = SURAHS.find(s => s.number === v.surah_number)?.name || `Sourate ${v.surah_number}`;
        map.set(v.surah_number, { name: surahName, versesCount: count, nextReview: v.next_review_date });
      }
    }
    return [...map.values()].sort((a, b) => a.nextReview.localeCompare(b.nextReview));
  }, [allVerses]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const refresh = () => setRefreshKey(k => k + 1);

  return (
    <AppLayout title="Muraja'a" hideNav>
      <div className="max-w-md mx-auto px-4 py-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-1">
          <div
            className="w-14 h-14 rounded-xl mx-auto mb-3 flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(212,175,55,0.25), rgba(212,175,55,0.1))',
              border: '1px solid rgba(212,175,55,0.3)',
            }}
          >
            <RefreshCw className="h-7 w-7" style={{ color: '#d4af37' }} />
          </div>
          <h1
            className="text-2xl font-bold tracking-[0.08em] uppercase"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#d4af37' }}
          >
            Muraja'a
          </h1>
          <p className="text-muted-foreground text-sm">
            Consolide ta mémorisation par la répétition espacée
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : allVerses.length === 0 ? (
          <div
            className="rounded-2xl p-8 text-center"
            style={{
              background: 'linear-gradient(135deg, #0d7377 0%, #14919b 50%, #0d7377 100%)',
              border: '2px solid rgba(212,175,55,0.3)',
              boxShadow: '0 8px 32px -8px rgba(13,115,119,0.4)',
            }}
          >
            <RotateCcw className="h-10 w-10 mx-auto mb-4" style={{ color: '#d4af37' }} />
            <p className="text-white/80 text-base leading-relaxed">
              Tu n'as pas encore de versets mémorisés.
            </p>
            <p className="text-white/50 text-sm mt-2">
              Commence par le module Hifz pour ancrer tes premiers versets !
            </p>
          </div>
        ) : (
          <>
            {/* Countdown */}
            <MurajaCountdown nextReviewDate={nextReviewDate} />

            {/* Ar-Rabt section */}
            <MurajaRabt
              recentVerses={recentVerses}
              onSessionComplete={() => {
                setCelebration('daily');
                refresh();
              }}
            />

            {/* Le Tour section */}
            <MurajaTour
              dueVerses={dueVerses}
              onSessionComplete={() => {
                setCelebration('daily');
                refresh();
              }}
              onCycleComplete={() => {
                setCelebration('cycle');
                refresh();
              }}
            />

            {/* Summary of memorized verses */}
            <div
              className="rounded-2xl p-5 space-y-4"
              style={{
                background: 'linear-gradient(135deg, rgba(13,115,119,0.12), rgba(20,145,155,0.06))',
                border: '1px solid rgba(212,175,55,0.2)',
              }}
            >
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" style={{ color: '#d4af37' }} />
                <h3
                  className="text-base font-semibold"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#d4af37' }}
                >
                  Mon trésor — {totalVersesCount} verset{totalVersesCount > 1 ? 's' : ''} ancré{totalVersesCount > 1 ? 's' : ''}
                </h3>
              </div>

              <div className="space-y-2">
                {surahSummary.map((s) => (
                  <div
                    key={s.name}
                    className="flex items-center justify-between px-3 py-2 rounded-xl"
                    style={{ background: 'rgba(13,115,119,0.08)' }}
                  >
                    <span className="text-sm font-medium" style={{ color: '#0d7377' }}>
                      {s.name}
                    </span>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{s.versesCount} v.</span>
                      <span className="flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" />
                        {formatDate(s.nextReview)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Refresh button */}
            <div className="text-center pt-2">
              <Button
                variant="ghost"
                onClick={refresh}
                className="text-xs gap-1.5"
                style={{ color: '#0d7377' }}
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Actualiser
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Celebration modal */}
      <MurajaCelebration
        type={celebration || 'daily'}
        isOpen={celebration !== null}
        onClose={() => setCelebration(null)}
      />
    </AppLayout>
  );
}
