import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Minus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface DhikrEntry {
  id: string;
  dhikr_name: string;
  count: number;
}

interface RamadanDhikrSectionProps {
  dateStr: string;
}

export default function RamadanDhikrSection({ dateStr }: RamadanDhikrSectionProps) {
  const { user } = useAuth();
  const [entries, setEntries] = useState<DhikrEntry[]>([]);
  const [newName, setNewName] = useState('');
  const [newCount, setNewCount] = useState(33);

  useEffect(() => {
    fetchEntries();
  }, [user, dateStr]);

  const fetchEntries = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('ramadan_dhikr_entries')
      .select('id, dhikr_name, count')
      .eq('user_id', user.id)
      .eq('entry_date', dateStr)
      .order('created_at', { ascending: true });
    if (data) setEntries(data);
  };

  const addEntry = async () => {
    if (!user || !newName.trim()) return;
    const { data } = await supabase
      .from('ramadan_dhikr_entries')
      .insert({ user_id: user.id, entry_date: dateStr, dhikr_name: newName.trim(), count: newCount })
      .select('id, dhikr_name, count')
      .single();
    if (data) {
      setEntries([...entries, data]);
      setNewName('');
      setNewCount(33);
      toast.success('Dhikr ajouté ✨');
    }
  };

  const updateCount = async (id: string, delta: number) => {
    const entry = entries.find(e => e.id === id);
    if (!entry) return;
    const newVal = Math.max(0, entry.count + delta);
    setEntries(entries.map(e => e.id === id ? { ...e, count: newVal } : e));
    await supabase.from('ramadan_dhikr_entries').update({ count: newVal }).eq('id', id);
  };

  const removeEntry = async (id: string) => {
    setEntries(entries.filter(e => e.id !== id));
    await supabase.from('ramadan_dhikr_entries').delete().eq('id', id);
  };

  return (
    <Card className="pastel-card p-5 bg-gradient-to-br from-accent/20 to-accent/5 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.06)]">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">📿</span>
        <h3 className="font-display text-base">Dhikr</h3>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {entries.map((entry) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex items-center gap-2 bg-background/60 rounded-xl p-3"
            >
              <span className="text-sm font-medium text-foreground flex-1 truncate">{entry.dhikr_name}</span>
              <div className="flex items-center gap-1">
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => updateCount(entry.id, -1)}>
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="text-sm font-bold text-primary min-w-[2rem] text-center">{entry.count}</span>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => updateCount(entry.id, 1)}>
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              <button onClick={() => removeEntry(entry.id)} className="text-muted-foreground hover:text-destructive transition-colors ml-1">
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Add new dhikr */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center gap-2">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Ex: SubhanAllah, Alhamdulillah..."
              className="text-sm h-9 rounded-xl bg-background/60 border-border/40 flex-1"
              onKeyDown={(e) => e.key === 'Enter' && addEntry()}
            />
            <Input
              type="number"
              value={newCount}
              onChange={(e) => setNewCount(Math.max(1, parseInt(e.target.value) || 1))}
              className="text-sm h-9 rounded-xl bg-background/60 border-border/40 w-16 text-center"
              min={1}
            />
            <Button size="icon" variant="ghost" onClick={addEntry} disabled={!newName.trim()} className="shrink-0 h-9 w-9">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
