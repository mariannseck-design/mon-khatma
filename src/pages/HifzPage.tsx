import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Plus, Check, RefreshCw, 
  ChevronRight, Brain, Clock, Trash2
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageTransition, FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/PageTransition';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Surah names
const SURAHS = [
  "Al-Fatihah", "Al-Baqarah", "Aal-E-Imran", "An-Nisa", "Al-Ma'idah",
  "Al-An'am", "Al-A'raf", "Al-Anfal", "At-Tawbah", "Yunus",
  // ... abbreviated for brevity
  "An-Nas"
];

interface HifzEntry {
  id: string;
  surah_number: number;
  ayah_start: number;
  ayah_end: number;
  status: string;
  next_review: string | null;
  review_count: number;
  interval_days: number;
}

export default function HifzPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<HifzEntry[]>([]);
  const [dueEntries, setDueEntries] = useState<HifzEntry[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newEntry, setNewEntry] = useState({
    surah: '114',
    ayahStart: '1',
    ayahEnd: '6'
  });

  useEffect(() => {
    if (user) fetchEntries();
  }, [user]);

  const fetchEntries = async () => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];

    const { data } = await supabase
      .from('hifz_progress')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) {
      setEntries(data);
      setDueEntries(data.filter(e => e.next_review && e.next_review <= today));
    }
  };

  const addEntry = async () => {
    if (!user) return;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { error } = await supabase
      .from('hifz_progress')
      .insert({
        user_id: user.id,
        surah_number: parseInt(newEntry.surah),
        ayah_start: parseInt(newEntry.ayahStart),
        ayah_end: parseInt(newEntry.ayahEnd),
        status: 'learning',
        next_review: tomorrow.toISOString().split('T')[0],
        interval_days: 1
      });

    if (error) {
      toast.error('Failed to add entry');
      return;
    }

    toast.success('New memorization added! 📖');
    setIsAddOpen(false);
    fetchEntries();
  };

  const completeReview = async (entry: HifzEntry, quality: number) => {
    if (!user) return;

    // SM-2 Spaced Repetition Algorithm
    let newInterval = entry.interval_days;
    let newEaseFactor = 2.5;

    if (quality >= 3) {
      if (entry.review_count === 0) {
        newInterval = 1;
      } else if (entry.review_count === 1) {
        newInterval = 6;
      } else {
        newInterval = Math.round(entry.interval_days * newEaseFactor);
      }
    } else {
      newInterval = 1;
    }

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + newInterval);

    const { error } = await supabase
      .from('hifz_progress')
      .update({
        last_reviewed: new Date().toISOString(),
        next_review: nextReview.toISOString().split('T')[0],
        review_count: entry.review_count + 1,
        interval_days: newInterval,
        status: quality >= 4 ? 'memorized' : 'reviewing'
      })
      .eq('id', entry.id);

    if (error) {
      toast.error('Failed to update');
      return;
    }

    toast.success('Review completed! 🌟');
    fetchEntries();
  };

  const deleteEntry = async (id: string) => {
    const { error } = await supabase
      .from('hifz_progress')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete');
      return;
    }

    toast.success('Entry removed');
    fetchEntries();
  };

  const getSurahName = (num: number) => {
    if (num === 114) return "An-Nas";
    if (num === 113) return "Al-Falaq";
    if (num === 112) return "Al-Ikhlas";
    if (num === 111) return "Al-Masad";
    if (num === 110) return "An-Nasr";
    return `Surah ${num}`;
  };

  return (
    <AppLayout title="Hifz Tracker">
      <PageTransition>
        <div className="space-y-6">
          {/* Stats Header */}
          <FadeIn>
            <div className="grid grid-cols-3 gap-3">
              <div className="glass-card p-4 rounded-xl text-center">
                <div className="text-2xl font-bold text-primary">{entries.length}</div>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
              <div className="glass-card p-4 rounded-xl text-center">
                <div className="text-2xl font-bold text-accent">{dueEntries.length}</div>
                <p className="text-xs text-muted-foreground">Due Today</p>
              </div>
              <div className="glass-card p-4 rounded-xl text-center">
                <div className="text-2xl font-bold text-success">
                  {entries.filter(e => e.status === 'memorized').length}
                </div>
                <p className="text-xs text-muted-foreground">Memorized</p>
              </div>
            </div>
          </FadeIn>

          {/* Due for Review */}
          {dueEntries.length > 0 && (
            <FadeIn delay={0.1}>
              <div className="space-y-3">
                <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 text-accent" />
                  Due for Review
                </h3>
                <StaggerContainer className="space-y-2">
                  {dueEntries.map((entry) => (
                    <StaggerItem key={entry.id}>
                      <div className="glass-card p-4 rounded-xl border-2 border-accent/30 bg-accent/5">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="font-medium text-foreground">
                              {getSurahName(entry.surah_number)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Ayah {entry.ayah_start} - {entry.ayah_end}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Brain className="h-4 w-4" />
                            Review #{entry.review_count + 1}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => completeReview(entry, 2)}
                            className="flex-1"
                          >
                            Hard
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => completeReview(entry, 3)}
                            className="flex-1"
                          >
                            Good
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => completeReview(entry, 5)}
                            className="flex-1 bg-gradient-spiritual"
                          >
                            Easy
                          </Button>
                        </div>
                      </div>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              </div>
            </FadeIn>
          )}

          {/* All Entries */}
          <FadeIn delay={0.2}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-semibold text-foreground">
                All Memorizations
              </h3>
              <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-gradient-spiritual">
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="font-display">Add New Memorization</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>Surah</Label>
                      <Select 
                        value={newEntry.surah} 
                        onValueChange={(v) => setNewEntry(prev => ({ ...prev, surah: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[114, 113, 112, 111, 110, 109, 108, 107, 106, 105].map(num => (
                            <SelectItem key={num} value={num.toString()}>
                              {getSurahName(num)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Start Ayah</Label>
                        <Input 
                          type="number" 
                          min="1"
                          value={newEntry.ayahStart}
                          onChange={(e) => setNewEntry(prev => ({ ...prev, ayahStart: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>End Ayah</Label>
                        <Input 
                          type="number" 
                          min="1"
                          value={newEntry.ayahEnd}
                          onChange={(e) => setNewEntry(prev => ({ ...prev, ayahEnd: e.target.value }))}
                        />
                      </div>
                    </div>
                    <Button onClick={addEntry} className="w-full bg-gradient-spiritual">
                      Add to Memorization
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {entries.length === 0 ? (
              <div className="glass-card p-8 rounded-xl text-center">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Start your Hifz journey by adding your first memorization
                </p>
              </div>
            ) : (
              <StaggerContainer className="space-y-2">
                {entries.map((entry) => (
                  <StaggerItem key={entry.id}>
                    <div className={cn(
                      "glass-card p-4 rounded-xl flex items-center justify-between",
                      entry.status === 'memorized' && "border-2 border-success/30"
                    )}>
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center",
                          entry.status === 'memorized' ? "bg-success/20 text-success" :
                          entry.status === 'reviewing' ? "bg-accent/20 text-accent" :
                          "bg-primary/10 text-primary"
                        )}>
                          {entry.status === 'memorized' ? (
                            <Check className="h-5 w-5" />
                          ) : (
                            <BookOpen className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {getSurahName(entry.surah_number)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Ayah {entry.ayah_start} - {entry.ayah_end}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {entry.next_review && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {new Date(entry.next_review).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => deleteEntry(entry.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            )}
          </FadeIn>
        </div>
      </PageTransition>
    </AppLayout>
  );
}
