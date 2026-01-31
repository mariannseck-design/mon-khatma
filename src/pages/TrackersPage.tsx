import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Sun, Moon as MoonIcon, Clock } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageTransition, FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/PageTransition';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Database } from '@/integrations/supabase/types';

type PrayerType = Database['public']['Enums']['prayer_type'];

interface PrayerItem {
  id: string;
  name: string;
  arabicName: string;
  type: PrayerType;
  completed: boolean;
}

interface AdhkarItem {
  id: string;
  name: string;
  type: 'morning' | 'evening' | 'after_prayer';
  completed: boolean;
}

const SUNNAH_PRAYERS: Omit<PrayerItem, 'id' | 'completed'>[] = [
  { name: 'Fajr Sunnah', arabicName: 'سنة الفجر', type: 'fajr_sunnah' },
  { name: 'Dhuhr Before', arabicName: 'سنة الظهر القبلية', type: 'dhuhr_before' },
  { name: 'Dhuhr After', arabicName: 'سنة الظهر البعدية', type: 'dhuhr_after' },
  { name: 'Asr Sunnah', arabicName: 'سنة العصر', type: 'asr_sunnah' },
  { name: 'Maghrib After', arabicName: 'سنة المغرب', type: 'maghrib_after' },
  { name: 'Isha Before', arabicName: 'سنة العشاء القبلية', type: 'isha_before' },
  { name: 'Isha After', arabicName: 'سنة العشاء البعدية', type: 'isha_after' },
  { name: 'Witr', arabicName: 'الوتر', type: 'witr' },
  { name: 'Duha', arabicName: 'صلاة الضحى', type: 'duha' },
  { name: 'Tahajjud', arabicName: 'التهجد', type: 'tahajjud' },
  { name: 'Ishraq', arabicName: 'صلاة الإشراق', type: 'ishraq' },
  { name: 'Awwabin', arabicName: 'صلاة الأوابين', type: 'awwabin' },
];

const ADHKAR_ITEMS: Omit<AdhkarItem, 'id' | 'completed'>[] = [
  { name: 'Morning Adhkar', type: 'morning' },
  { name: 'Evening Adhkar', type: 'evening' },
  { name: 'After Prayer Adhkar', type: 'after_prayer' },
];

export default function TrackersPage() {
  const { user } = useAuth();
  const [prayers, setPrayers] = useState<PrayerItem[]>([]);
  const [adhkar, setAdhkar] = useState<AdhkarItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTrackers();
    }
  }, [user]);

  const fetchTrackers = async () => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];

    // Fetch prayers
    const { data: prayerData } = await supabase
      .from('prayer_tracker')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today);

    const prayerMap = new Map(prayerData?.map(p => [p.prayer_type, p.completed]) || []);
    const prayerList = SUNNAH_PRAYERS.map((p, i) => ({
      id: `prayer-${i}`,
      ...p,
      completed: prayerMap.get(p.type) || false
    }));
    setPrayers(prayerList);

    // Fetch adhkar
    const { data: adhkarData } = await supabase
      .from('adhkar_tracker')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today);

    const adhkarMap = new Map(adhkarData?.map(a => [a.adhkar_type, a.completed]) || []);
    const adhkarList = ADHKAR_ITEMS.map((a, i) => ({
      id: `adhkar-${i}`,
      ...a,
      completed: adhkarMap.get(a.type) || false
    }));
    setAdhkar(adhkarList);

    setLoading(false);
  };

  const togglePrayer = async (prayer: PrayerItem) => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    const newCompleted = !prayer.completed;

    // Optimistic update
    setPrayers(prev => prev.map(p => 
      p.type === prayer.type ? { ...p, completed: newCompleted } : p
    ));

    try {
      const { error } = await supabase
        .from('prayer_tracker')
        .upsert({
          user_id: user.id,
          date: today,
          prayer_type: prayer.type,
          completed: newCompleted,
          completed_at: newCompleted ? new Date().toISOString() : null
        }, {
          onConflict: 'user_id,date,prayer_type'
        });

      if (error) throw error;

      if (newCompleted) {
        toast.success(`${prayer.name} completed! ✨`);
      }
    } catch (error) {
      // Revert on error
      setPrayers(prev => prev.map(p => 
        p.type === prayer.type ? { ...p, completed: !newCompleted } : p
      ));
      toast.error('Failed to update');
    }
  };

  const toggleAdhkar = async (item: AdhkarItem) => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    const newCompleted = !item.completed;

    // Optimistic update
    setAdhkar(prev => prev.map(a => 
      a.type === item.type ? { ...a, completed: newCompleted } : a
    ));

    try {
      const { error } = await supabase
        .from('adhkar_tracker')
        .upsert({
          user_id: user.id,
          date: today,
          adhkar_type: item.type,
          completed: newCompleted,
          completed_at: newCompleted ? new Date().toISOString() : null
        }, {
          onConflict: 'user_id,date,adhkar_type'
        });

      if (error) throw error;

      if (newCompleted) {
        toast.success(`${item.name} completed! 🌙`);
      }
    } catch (error) {
      setAdhkar(prev => prev.map(a => 
        a.type === item.type ? { ...a, completed: !newCompleted } : a
      ));
      toast.error('Failed to update');
    }
  };

  const completedPrayers = prayers.filter(p => p.completed).length;
  const completedAdhkar = adhkar.filter(a => a.completed).length;

  return (
    <AppLayout title="Daily Trackers">
      <PageTransition>
        <div className="space-y-6">
          {/* Summary */}
          <FadeIn>
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card p-4 rounded-xl text-center">
                <div className="text-3xl font-bold text-primary">
                  {completedPrayers}/{prayers.length}
                </div>
                <p className="text-sm text-muted-foreground">Sunnah Prayers</p>
              </div>
              <div className="glass-card p-4 rounded-xl text-center">
                <div className="text-3xl font-bold text-accent">
                  {completedAdhkar}/{adhkar.length}
                </div>
                <p className="text-sm text-muted-foreground">Adhkar</p>
              </div>
            </div>
          </FadeIn>

          <Tabs defaultValue="prayers" className="w-full">
            <TabsList className="w-full grid grid-cols-2 mb-4">
              <TabsTrigger value="prayers" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Prayers
              </TabsTrigger>
              <TabsTrigger value="adhkar" className="flex items-center gap-2">
                <MoonIcon className="h-4 w-4" />
                Adhkar
              </TabsTrigger>
            </TabsList>

            <TabsContent value="prayers">
              <StaggerContainer className="space-y-2">
                {prayers.map((prayer) => (
                  <StaggerItem key={prayer.id}>
                    <motion.button
                      onClick={() => togglePrayer(prayer)}
                      className={cn(
                        "w-full p-4 rounded-xl flex items-center justify-between transition-all",
                        prayer.completed 
                          ? "bg-primary/10 border-2 border-primary/30" 
                          : "glass-card hover:border-primary/20"
                      )}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-4">
                        <motion.div
                          initial={false}
                          animate={{ 
                            backgroundColor: prayer.completed ? 'hsl(var(--primary))' : 'transparent',
                            borderColor: prayer.completed ? 'hsl(var(--primary))' : 'hsl(var(--border))'
                          }}
                          className="w-6 h-6 rounded-full border-2 flex items-center justify-center"
                        >
                          <AnimatePresence>
                            {prayer.completed && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                              >
                                <Check className="h-4 w-4 text-primary-foreground" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                        <div className="text-left">
                          <p className={cn(
                            "font-medium transition-colors",
                            prayer.completed ? "text-primary" : "text-foreground"
                          )}>
                            {prayer.name}
                          </p>
                          <p className="text-sm text-muted-foreground font-arabic">
                            {prayer.arabicName}
                          </p>
                        </div>
                      </div>
                    </motion.button>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </TabsContent>

            <TabsContent value="adhkar">
              <StaggerContainer className="space-y-3">
                {adhkar.map((item) => (
                  <StaggerItem key={item.id}>
                    <motion.button
                      onClick={() => toggleAdhkar(item)}
                      className={cn(
                        "w-full p-5 rounded-xl flex items-center justify-between transition-all",
                        item.completed 
                          ? "bg-accent/10 border-2 border-accent/30" 
                          : "glass-card hover:border-accent/20"
                      )}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center",
                          item.type === 'morning' ? "bg-amber-100 text-amber-600" :
                          item.type === 'evening' ? "bg-indigo-100 text-indigo-600" :
                          "bg-emerald-100 text-emerald-600"
                        )}>
                          {item.type === 'morning' ? <Sun className="h-6 w-6" /> :
                           item.type === 'evening' ? <MoonIcon className="h-6 w-6" /> :
                           <Clock className="h-6 w-6" />}
                        </div>
                        <div className="text-left">
                          <p className={cn(
                            "font-medium text-lg transition-colors",
                            item.completed ? "text-accent" : "text-foreground"
                          )}>
                            {item.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {item.completed ? 'Completed' : 'Tap to complete'}
                          </p>
                        </div>
                      </div>
                      <motion.div
                        initial={false}
                        animate={{ 
                          backgroundColor: item.completed ? 'hsl(var(--accent))' : 'transparent',
                          borderColor: item.completed ? 'hsl(var(--accent))' : 'hsl(var(--border))'
                        }}
                        className="w-8 h-8 rounded-full border-2 flex items-center justify-center"
                      >
                        <AnimatePresence>
                          {item.completed && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                            >
                              <Check className="h-5 w-5 text-accent-foreground" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    </motion.button>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </TabsContent>
          </Tabs>
        </div>
      </PageTransition>
    </AppLayout>
  );
}
