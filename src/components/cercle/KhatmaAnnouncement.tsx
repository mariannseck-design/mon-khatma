import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

export function KhatmaAnnouncement() {
  const [recentCompletion, setRecentCompletion] = useState<{ display_name: string | null; completed_at: string } | null>(null);

  useEffect(() => {
    fetchRecentCompletion();
  }, []);

  const fetchRecentCompletion = async () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const { data } = await supabase
      .from('khatma_completions')
      .select('display_name, completed_at')
      .gte('completed_at', oneWeekAgo.toISOString())
      .order('completed_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) setRecentCompletion(data);
  };

  if (!recentCompletion) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="p-5 border border-amber-300/50 bg-amber-50/30 dark:bg-amber-950/10 rounded-2xl">
        <h3 className="font-display text-base text-foreground text-center mb-3">
          Félicitations à notre sœur qui vient de boucler sa Khatma ! 🌸✨
        </h3>
        <p className="text-sm text-muted-foreground text-center italic leading-relaxed mb-3">
          « En vérité, c'est Nous qui avons fait descendre le Rappel (Al-Zikr), et c'est Nous qui en sommes les gardiens. »
          <span className="block text-xs mt-1 not-italic">(Sourate Al-Hijr, verset 9)</span>
        </p>
        <p className="text-sm text-foreground text-center leading-relaxed">
          Continuez vos efforts, car le Coran est le meilleur des Zikr.{' '}
          <strong>Chaque lettre lue vous rapproche de la Paix intérieure et de la satisfaction d'Allah.</strong>
        </p>
      </Card>
    </motion.div>
  );
}