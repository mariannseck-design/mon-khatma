import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, ChevronDown, BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { getSurahName } from '@/hooks/useMurajaData';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';

interface VerseEntry {
  surah: number;
  start: number;
  end: number;
}

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

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.floor((today.getTime() - new Date(d.toDateString()).getTime()) / 86400000);
  if (diff === 0) return "Aujourd'hui";
  if (diff === 1) return 'Hier';
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

interface Props {
  sessionType: 'rabt' | 'tour';
  accentColor: string;
}

export default function MurajaHistory({ sessionType, accentColor }: Props) {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('muraja_sessions')
      .select('id, session_type, difficulty_rating, verses_reviewed, completed_at, created_at')
      .eq('user_id', user.id)
      .eq('session_type', sessionType)
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data }) => {
        setSessions((data as unknown as SessionRow[]) || []);
        setLoading(false);
      });
  }, [user, sessionType]);

  // Group by date
  const grouped = sessions.reduce<Record<string, SessionRow[]>>((acc, s) => {
    const dateKey = (s.completed_at || s.created_at).split('T')[0];
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(s);
    return acc;
  }, {});

  const dateKeys = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  if (loading) return null;
  if (sessions.length === 0) return null;

  return (
    <Collapsible>
      <CollapsibleTrigger className="flex items-center gap-2 w-full py-2 text-xs font-semibold" style={{ color: accentColor }}>
        <History className="h-3.5 w-3.5" />
        <span>Historique ({sessions.length})</span>
        <ChevronDown className="h-3 w-3 ml-auto transition-transform [[data-state=open]>&]:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="space-y-3 mt-2">
          {dateKeys.map(dateKey => (
            <div key={dateKey}>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--p-text-40)' }}>
                {formatDate(dateKey + 'T00:00:00')}
              </p>
              <div className="space-y-1.5">
                {grouped[dateKey].map(s => {
                  const verses = (s.verses_reviewed || []) as VerseEntry[];
                  return (
                    <motion.div
                      key={s.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="rounded-xl px-3 py-2.5"
                      style={{ background: 'var(--p-card)', border: '1px solid var(--p-border)' }}
                    >
                      {verses.map((v, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--p-text-70)' }}>
                          <BookOpen className="h-3 w-3 flex-shrink-0" style={{ color: accentColor }} />
                          <span className="font-semibold">{getSurahName(v.surah)}</span>
                          <span style={{ color: 'var(--p-text-40)' }}>v.{v.start}→{v.end}</span>
                        </div>
                      ))}
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[10px]" style={{ color: 'var(--p-text-30)' }}>
                          {new Date(s.completed_at || s.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {s.difficulty_rating && (
                          <span className="text-[10px] font-medium" style={{ color: 'var(--p-text-50)' }}>
                            {RATING_LABELS[s.difficulty_rating] || s.difficulty_rating}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
