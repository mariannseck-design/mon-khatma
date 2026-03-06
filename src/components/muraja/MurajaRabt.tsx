import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SURAHS } from '@/lib/surahData';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface MemorizedVerse {
  id: string;
  surah_number: number;
  verse_start: number;
  verse_end: number;
  memorized_at: string;
  last_reviewed_at: string | null;
}

interface MurajaRabtProps {
  recentVerses: MemorizedVerse[];
  onSessionComplete: () => void;
}

export default function MurajaRabt({ recentVerses, onSessionComplete }: MurajaRabtProps) {
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  if (recentVerses.length === 0) {
    return (
      <div
        className="rounded-2xl p-6 text-center"
        style={{
          background: 'linear-gradient(135deg, rgba(13,115,119,0.15), rgba(20,145,155,0.08))',
          border: '1px solid rgba(212,175,55,0.2)',
        }}
      >
        <BookOpen className="h-8 w-8 mx-auto mb-3" style={{ color: '#d4af37' }} />
        <p className="text-muted-foreground text-sm">
          Aucun verset mémorisé ces 30 derniers jours.
        </p>
        <p className="text-muted-foreground text-xs mt-1">
          Commence par le module Hifz !
        </p>
      </div>
    );
  }

  const current = recentVerses[currentIndex];
  const surahName = SURAHS.find(s => s.number === current?.surah_number)?.name || `Sourate ${current?.surah_number}`;
  const allDone = completed.size === recentVerses.length;

  const markReviewed = async () => {
    if (!user || !current) return;

    // Update last_reviewed_at
    await supabase
      .from('hifz_memorized_verses')
      .update({ last_reviewed_at: new Date().toISOString() })
      .eq('id', current.id);

    // Log muraja session
    await supabase.from('muraja_sessions').insert({
      user_id: user.id,
      session_type: 'rabt',
      verses_reviewed: [{ surah: current.surah_number, start: current.verse_start, end: current.verse_end }],
      completed_at: new Date().toISOString(),
    });

    const newCompleted = new Set(completed);
    newCompleted.add(current.id);
    setCompleted(newCompleted);

    if (newCompleted.size === recentVerses.length) {
      toast.success("Ar-Rabt terminé ! Qu'Allah (عز وجل) te facilite 🤲");
      onSessionComplete();
    } else {
      // Move to next unreviewed
      let next = (currentIndex + 1) % recentVerses.length;
      while (newCompleted.has(recentVerses[next].id)) {
        next = (next + 1) % recentVerses.length;
      }
      setCurrentIndex(next);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3
          className="text-lg font-semibold"
          style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#d4af37' }}
        >
          Ar-Rabt — Révision de proximité
        </h3>
        <span className="text-xs text-muted-foreground">
          {completed.size}/{recentVerses.length}
        </span>
      </div>

      {/* Progress dots */}
      <div className="flex gap-1.5 flex-wrap">
        {recentVerses.map((v, i) => (
          <div
            key={v.id}
            className="w-3 h-3 rounded-full transition-all cursor-pointer"
            style={{
              background: completed.has(v.id)
                ? '#d4af37'
                : i === currentIndex
                ? 'rgba(212,175,55,0.5)'
                : 'rgba(13,115,119,0.3)',
              boxShadow: i === currentIndex ? '0 0 8px rgba(212,175,55,0.4)' : 'none',
            }}
            onClick={() => !completed.has(v.id) && setCurrentIndex(i)}
          />
        ))}
      </div>

      {!allDone && current && (
        <motion.div
          key={current.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-6"
          style={{
            background: 'linear-gradient(135deg, rgba(13,115,119,0.2), rgba(20,145,155,0.1))',
            border: '1px solid rgba(212,175,55,0.25)',
          }}
        >
          <div className="text-center space-y-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Récite de mémoire</p>
            <p className="text-xl font-bold" style={{ color: '#0d7377' }}>
              {surahName}
            </p>
            <p className="text-sm" style={{ color: '#d4af37' }}>
              Versets {current.verse_start} → {current.verse_end}
            </p>

            <Button
              onClick={markReviewed}
              className="mt-4 gap-2"
              style={{
                background: 'linear-gradient(135deg, #d4af37, #c5a028)',
                color: '#0d4a4c',
                border: 'none',
              }}
            >
              <CheckCircle2 className="h-4 w-4" />
              J'ai révisé ✓
            </Button>
          </div>
        </motion.div>
      )}

      {allDone && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl p-6 text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(212,175,55,0.15), rgba(212,175,55,0.05))',
            border: '1px solid rgba(212,175,55,0.3)',
          }}
        >
          <CheckCircle2 className="h-10 w-10 mx-auto mb-2" style={{ color: '#d4af37' }} />
          <p className="font-semibold" style={{ color: '#d4af37' }}>Ar-Rabt complété !</p>
        </motion.div>
      )}
    </div>
  );
}
