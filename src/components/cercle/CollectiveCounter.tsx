import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

export function CollectiveCounter() {
  const [todayPages, setTodayPages] = useState(0);
  const [readersCount, setReadersCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodayStats();

    const channel = supabase
      .channel('collective-counter')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'quran_progress' },
        () => fetchTodayStats()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchTodayStats = async () => {
    const { data, error } = await supabase.rpc('get_today_collective_stats');

    if (!error && data) {
      const stats = data as { total_pages: number; readers_count: number };
      setTodayPages(stats.total_pages || 0);
      setReadersCount(stats.readers_count || 0);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-amber-50 to-orange-50 p-6">
        <div className="flex items-center justify-center h-20">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <Card className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border-amber-100 p-6 overflow-hidden relative">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-200/20 rounded-full blur-2xl" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h3 className="font-display text-lg text-foreground">Célébrations du jour</h3>
              <p className="text-xs text-muted-foreground">Ensemble, avec l'aide d'Allah</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-8">
            {/* Pages counter */}
            <div className="text-center">
              <motion.div
                key={todayPages}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-4xl font-bold text-amber-600 font-display"
              >
                {todayPages}
              </motion.div>
              <p className="text-sm text-muted-foreground mt-1">pages lues</p>
            </div>

            <div className="w-px h-12 bg-amber-200" />

            {/* Readers counter */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Users className="h-5 w-5 text-amber-500" />
                <motion.span
                  key={readersCount}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-2xl font-bold text-amber-600 font-display"
                >
                  {readersCount}
                </motion.span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">lectrices actives</p>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-4 italic">
            « Et coopérez dans la bienfaisance et la piété » - Al-Ma'idah, 5:2
          </p>
        </div>
      </Card>
    </motion.div>
  );
}
