import { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const COLORS = {
  emerald: '#2d6a4f',
  goldAccent: '#d4af37',
};

export default function DefisCommunityCounter() {
  const [stats, setStats] = useState<{ mulk: number; baqara: number; kahf: number }>({ mulk: 0, baqara: 0, kahf: 0 });

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.rpc('get_defis_collective_stats');
      if (data) {
        const parsed = typeof data === 'string' ? JSON.parse(data) : data;
        setStats({
          mulk: parsed.mulk_participants || 0,
          baqara: parsed.baqara_participants || 0,
          kahf: parsed.kahf_participants || 0,
        });
      }
    };
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  const total = stats.mulk + stats.baqara;
  if (total === 0) return null;

  return (
    <div
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
      style={{ background: `${COLORS.goldAccent}18`, color: COLORS.emerald }}
    >
      <Users className="h-3 w-3" style={{ color: COLORS.goldAccent }} />
      <span>{stats.mulk} Al-Mulk</span>
      <span style={{ color: `${COLORS.emerald}40` }}>·</span>
      <span>{stats.baqara} Al-Baqara</span>
    </div>
  );
}
