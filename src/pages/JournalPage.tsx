import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Sun, Moon, PenTool, Save, Calendar, 
  ChevronLeft, ChevronRight, Sparkles
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageTransition, FadeIn } from '@/components/ui/PageTransition';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface JournalEntry {
  id?: string;
  morning_objectives: string;
  evening_reflection: string;
  gratitude_notes: string;
  mood_rating: number;
}

const MOOD_EMOJIS = ['😔', '😕', '😐', '🙂', '😊'];

export default function JournalPage() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [entry, setEntry] = useState<JournalEntry>({
    morning_objectives: '',
    evening_reflection: '',
    gratitude_notes: '',
    mood_rating: 3
  });
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const dateStr = selectedDate.toISOString().split('T')[0];
  const isToday = dateStr === new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (user) fetchEntry();
  }, [user, dateStr]);

  const fetchEntry = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('ramadan_journal')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', dateStr)
      .single();

    if (data) {
      setEntry({
        id: data.id,
        morning_objectives: data.morning_objectives || '',
        evening_reflection: data.evening_reflection || '',
        gratitude_notes: data.gratitude_notes || '',
        mood_rating: data.mood_rating || 3
      });
    } else {
      setEntry({
        morning_objectives: '',
        evening_reflection: '',
        gratitude_notes: '',
        mood_rating: 3
      });
    }
    setHasChanges(false);
  };

  const saveEntry = async () => {
    if (!user) return;
    setIsSaving(true);

    try {
      const { error } = await supabase
        .from('ramadan_journal')
        .upsert({
          user_id: user.id,
          date: dateStr,
          morning_objectives: entry.morning_objectives || null,
          evening_reflection: entry.evening_reflection || null,
          gratitude_notes: entry.gratitude_notes || null,
          mood_rating: entry.mood_rating
        }, {
          onConflict: 'user_id,date'
        });

      if (error) throw error;

      toast.success('Journal saved! 📝');
      setHasChanges(false);
    } catch (error) {
      toast.error('Failed to save journal');
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (field: keyof JournalEntry, value: string | number) => {
    setEntry(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    if (newDate <= new Date()) {
      setSelectedDate(newDate);
    }
  };

  const hour = new Date().getHours();
  const isMorning = hour < 12;

  return (
    <AppLayout title="Ramadan Journal">
      <PageTransition>
        <div className="space-y-6">
          {/* Date Selector */}
          <FadeIn>
            <div className="flex items-center justify-between glass-card p-3 rounded-xl">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => changeDate(-1)}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div className="text-center">
                <div className="flex items-center gap-2 justify-center">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {selectedDate.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
                {isToday && (
                  <span className="text-xs text-primary font-medium">Today</span>
                )}
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => changeDate(1)}
                disabled={isToday}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </FadeIn>

          {/* Morning Objectives */}
          <FadeIn delay={0.1}>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                  <Sun className="h-4 w-4" />
                </div>
                <h3 className="font-display font-semibold text-foreground">
                  Morning Objectives
                </h3>
                {isMorning && isToday && (
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                    Active
                  </span>
                )}
              </div>
              <Textarea
                placeholder="What do you want to achieve spiritually today? Set your intentions..."
                value={entry.morning_objectives}
                onChange={(e) => updateField('morning_objectives', e.target.value)}
                className="min-h-[120px] resize-none"
              />
            </div>
          </FadeIn>

          {/* Evening Reflection */}
          <FadeIn delay={0.2}>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <Moon className="h-4 w-4" />
                </div>
                <h3 className="font-display font-semibold text-foreground">
                  Evening Reflection
                </h3>
                {!isMorning && isToday && (
                  <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                    Active
                  </span>
                )}
              </div>
              <Textarea
                placeholder="How was your day? Reflect on your spiritual journey, lessons learned..."
                value={entry.evening_reflection}
                onChange={(e) => updateField('evening_reflection', e.target.value)}
                className="min-h-[120px] resize-none"
              />
            </div>
          </FadeIn>

          {/* Gratitude */}
          <FadeIn delay={0.3}>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
                  <Sparkles className="h-4 w-4" />
                </div>
                <h3 className="font-display font-semibold text-foreground">
                  Gratitude
                </h3>
              </div>
              <Textarea
                placeholder="What are you grateful for today? List your blessings..."
                value={entry.gratitude_notes}
                onChange={(e) => updateField('gratitude_notes', e.target.value)}
                className="min-h-[80px] resize-none"
              />
            </div>
          </FadeIn>

          {/* Mood Rating */}
          <FadeIn delay={0.4}>
            <div className="glass-card p-4 rounded-xl">
              <h3 className="font-display font-semibold text-foreground mb-4 text-center">
                How are you feeling?
              </h3>
              <div className="flex justify-center gap-2">
                {MOOD_EMOJIS.map((emoji, index) => (
                  <motion.button
                    key={index}
                    onClick={() => updateField('mood_rating', index + 1)}
                    className={cn(
                      "w-12 h-12 rounded-xl text-2xl transition-all",
                      entry.mood_rating === index + 1 
                        ? "bg-primary/20 scale-110 shadow-lg" 
                        : "bg-muted hover:bg-muted/80"
                    )}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {emoji}
                  </motion.button>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Save Button */}
          <FadeIn delay={0.5}>
            <Button 
              onClick={saveEntry}
              disabled={!hasChanges || isSaving}
              className="w-full h-12 bg-gradient-spiritual"
            >
              {isSaving ? (
                'Saving...'
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Save Journal Entry
                </>
              )}
            </Button>
          </FadeIn>
        </div>
      </PageTransition>
    </AppLayout>
  );
}
