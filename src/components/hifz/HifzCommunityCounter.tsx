import { useState, useEffect } from 'react';
import { Users, BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const COLORS = {
  emerald: '#2d6a4f',
  goldAccent: '#d4af37',
};

export default function HifzCommunityCounter() {
  const [stats, setStats] = useState<{ active_memorizers: number; total_verses: number }>({
    active_memorizers: 0,
    total_verses: 0,
  });

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.rpc('get_hifz_collective_stats');
      if (data) {
        const parsed = typeof data === 'string' ? JSON.parse(data) : data;
        setStats({
          active_memorizers: parsed.active_memorizers || 0,
          total_verses: parsed.total_verses_memorized || 0,
        });
      }
    };
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  const total = stats.active_memorizers + stats.total_verses;
  if (total === 0) return null;

  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold mx-auto w-fit"
      style={{ background: `${COLORS.goldAccent}18`, color: COLORS.emerald }}
    >
      <Users className="h-3 w-3" style={{ color: COLORS.goldAccent }} />
      <span>{stats.active_memorizers} mémorisatrices</span>
      <span style={{ color: `${COLORS.emerald}40` }}>·</span>
      <BookOpen className="h-3 w-3" style={{ color: COLORS.goldAccent }} />
      <span>{stats.total_verses} versets</span>
    </div>
  );
}
