import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { ArrowLeft, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { getSurahName } from '@/hooks/useMurajaData';

interface VerseEntry { surah: number; start: number; end: number; }
interface SessionRow {
  id: string;
  session_type: string;
  difficulty_rating: string | null;
  verses_reviewed: VerseEntry[] | null;
  completed_at: string | null;
  created_at: string;
}

const RATING_LABELS: Record<string, string> = {
  hard: '🔴 Difficile',
  good: '🟠 Moyen',
  easy: '🟢 Facile',
  very_easy: '🔵 Très facile',
};

const TYPE_LABELS: Record<string, string> = {
  rabt: 'Ar-Rabt',
  tour: 'Consolidation',
};

const MONTH_NAMES = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

export default function MurajaHistoryPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());

  const goBack = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const goForward = () => {
    const isCurrentMonth = month === now.getMonth() && year === now.getFullYear();
    if (isCurrentMonth) return;
    if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1);
  };
  const isCurrentMonth = month === now.getMonth() && year === now.getFullYear();

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const endMonth = month === 11 ? 0 : month + 1;
    const endYear = month === 11 ? year + 1 : year;
    const endDate = `${endYear}-${String(endMonth + 1).padStart(2, '0')}-01`;

    supabase
      .from('muraja_sessions')
      .select('id, session_type, difficulty_rating, verses_reviewed, completed_at, created_at')
      .eq('user_id', user.id)
      .gte('created_at', startDate)
      .lt('created_at', endDate)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setSessions((data as unknown as SessionRow[]) || []);
        setLoading(false);
      });
  }, [user, month, year]);

  // Group by date
  const grouped = useMemo(() => {
    const g: Record<string, SessionRow[]> = {};
    for (const s of sessions) {
      const dateKey = (s.completed_at || s.created_at).split('T')[0];
      if (!g[dateKey]) g[dateKey] = [];
      g[dateKey].push(s);
    }
    return g;
  }, [sessions]);

  const dateKeys = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <AppLayout title="Historique" hideNav bgClassName="bg-gradient-muraja">
      <div className="max-w-md mx-auto px-4 py-5 space-y-5" style={{ backgroundColor: 'var(--p-bg)', minHeight: '100vh' }}>
        {/* Header */}
        <div className="relative flex items-center justify-center">
          <button onClick={() => navigate('/muraja')} className="absolute left-0 p-1.5 rounded-full" style={{ color: 'var(--p-text-40)' }}>
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
          </button>
          <h1 className="text-sm font-bold" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: 'var(--p-primary)' }}>
            Historique de révision
          </h1>
        </div>

        {/* Month selector */}
        <div className="flex items-center justify-between rounded-xl px-4 py-2.5" style={{ background: 'var(--p-card)', border: '1px solid var(--p-border)' }}>
          <button onClick={goBack} className="p-1 rounded-full" style={{ color: 'var(--p-text-50)' }}>
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-semibold" style={{ color: 'var(--p-text)' }}>
            {MONTH_NAMES[month]} {year}
          </span>
          <button onClick={goForward} className="p-1 rounded-full" style={{ color: isCurrentMonth ? 'var(--p-text-20)' : 'var(--p-text-50)' }} disabled={isCurrentMonth}>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: 'var(--p-primary)', borderTopColor: 'transparent' }} />
          </div>
        ) : sessions.length === 0 ? (
          <p className="text-center text-sm py-12" style={{ color: 'var(--p-text-40)' }}>
            Aucune session ce mois-ci.
          </p>
        ) : (
          <div className="space-y-4">
            {dateKeys.map(dateKey => {
              const d = new Date(dateKey + 'T00:00:00');
              const label = d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
              return (
                <div key={dateKey}>
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--p-text-40)' }}>
                    {label}
                  </p>
                  <div className="space-y-1.5">
                    {grouped[dateKey].map(s => {
                      const verses = (s.verses_reviewed || []) as VerseEntry[];
                      const typeColor = s.session_type === 'rabt' ? '#D4AF37' : '#10B981';
                      return (
                        <motion.div
                          key={s.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="rounded-xl px-3 py-2.5"
                          style={{ background: 'var(--p-card)', border: '1px solid var(--p-border)' }}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: typeColor }}>
                              {TYPE_LABELS[s.session_type] || s.session_type}
                            </span>
                            <span className="text-[10px]" style={{ color: 'var(--p-text-30)' }}>
                              {new Date(s.completed_at || s.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          {verses.map((v, i) => (
                            <div key={i} className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--p-text-70)' }}>
                              <BookOpen className="h-3 w-3 flex-shrink-0" style={{ color: typeColor }} />
                              <span className="font-semibold">{getSurahName(v.surah)}</span>
                              <span style={{ color: 'var(--p-text-40)' }}>v.{v.start}→{v.end}</span>
                            </div>
                          ))}
                          {s.difficulty_rating && (
                            <div className="mt-1">
                              <span className="text-[10px] font-medium" style={{ color: 'var(--p-text-50)' }}>
                                {RATING_LABELS[s.difficulty_rating] || s.difficulty_rating}
                              </span>
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Summary */}
        {!loading && sessions.length > 0 && (
          <div className="text-center text-[10px] py-2" style={{ color: 'var(--p-text-30)' }}>
            {sessions.length} session{sessions.length > 1 ? 's' : ''} · {dateKeys.length} jour{dateKeys.length > 1 ? 's' : ''}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
