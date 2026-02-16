import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';
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

const DEFAULT_DHIKRS = [
  { arabic: 'لَا إِلٰهَ إِلَّا الله', phonetic: 'La ilaha illa Allah', french: "Il n'y a de divinité en dehors d'Allah" },
  { arabic: 'اللهُ أَكْبَر', phonetic: 'Allahu Akbar', french: 'Allah est Grand' },
  { arabic: 'أَسْتَغْفِرُ اللهَ وَأَتُوبُ إِلَيْه', phonetic: 'Astaghfirullah wa Atoubou ilaih', french: 'Je demande pardon à Allah et me repens envers Lui' },
  { arabic: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِالله', phonetic: 'La hawla wala quwwata illa billah', french: "Il n'y a de puissance ni de force qu'en Allah" },
  { arabic: 'سُبْحَانَ الله', phonetic: 'SubhanAllah', french: 'Gloire à Allah' },
  { arabic: 'الْحَمْدُ لِله', phonetic: 'Alhamdulillah', french: 'Louange à Allah' },
  { arabic: 'لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ', phonetic: 'La ilaha illallahu wahdahu la sharika lahu...', french: "Il n'y a pas de divinité en dehors d'Allah, seul, sans associé..." },
  { arabic: 'اللهم صلِ على محمد وعلى آل محمد', phonetic: "Allahumma salli 'ala Muhammad...", french: "Ô Allah ! Couvre d'éloges et honore Muhammad ainsi que sa famille..." },
  { arabic: 'اللّهُـمَّ إِنِّـي أَسْأَلُـكَ الجَـنَّةَ وأََعوذُ بِـكَ مِـنَ الـنّار', phonetic: "Allâhumma innî as'aluka-l-jannata wa a'ûdhu bika mina n-nâr", french: "Ô Seigneur ! Je Te demande le Paradis et je me mets sous Ta protection contre l'Enfer." },
];

function getTimeGreeting(): string | null {
  const hour = new Date().getHours();
  if (hour >= 18 && hour < 22) return 'Passe une excellente soirée sous la protection divine.';
  if (hour >= 22 || hour < 5) return "Qu'Allah t'accorde une nuit paisible.";
  return null;
}

export default function RamadanDhikrSection({ dateStr }: RamadanDhikrSectionProps) {
  const { user } = useAuth();
  const [entries, setEntries] = useState<DhikrEntry[]>([]);
  const [newName, setNewName] = useState('');
  const [newCount, setNewCount] = useState(100);
  // Independent counters for each predefined dhikr (local state, keyed by index)
  const [predefinedCounts, setPredefinedCounts] = useState<Record<number, number>>(() => {
    const saved = localStorage.getItem(`dhikr_counts_${dateStr}`);
    return saved ? JSON.parse(saved) : {};
  });

  // Persist predefined counts to localStorage
  useEffect(() => {
    localStorage.setItem(`dhikr_counts_${dateStr}`, JSON.stringify(predefinedCounts));
  }, [predefinedCounts, dateStr]);

  // Reset when date changes
  useEffect(() => {
    const saved = localStorage.getItem(`dhikr_counts_${dateStr}`);
    setPredefinedCounts(saved ? JSON.parse(saved) : {});
  }, [dateStr]);

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

  const updatePredefinedCount = useCallback((index: number, value: number) => {
    const val = Math.max(0, value);
    setPredefinedCounts(prev => ({ ...prev, [index]: val }));
  }, []);

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
      setNewCount(100);
      toast.success('Dhikr ajouté ✨');
    }
  };

  const updateCount = async (id: string, newVal: number) => {
    const val = Math.max(0, newVal);
    setEntries(entries.map(e => e.id === id ? { ...e, count: val } : e));
    await supabase.from('ramadan_dhikr_entries').update({ count: val }).eq('id', id);
  };

  const removeEntry = async (id: string) => {
    setEntries(entries.filter(e => e.id !== id));
    await supabase.from('ramadan_dhikr_entries').delete().eq('id', id);
  };

  const timeGreeting = getTimeGreeting();

  return (
    <div className="space-y-4">
      {/* Introductory Reminder */}
      <Card className="pastel-card p-5 bg-gradient-to-br from-accent/20 to-accent/5">
        <p className="text-sm text-foreground/80 leading-relaxed">
          Le Prophète <span className="honorific font-bold" style={{ fontSize: '1.1em' }}>(عليه السلام)</span> a dit : <em>« Celui qui mentionne son Seigneur et celui qui ne Le mentionne pas sont semblables au vivant et au mort. »</em> Le zikr apaise le cœur, efface les péchés et rapproche de la satisfaction d'<span className="font-semibold">Allah</span> <span className="honorific font-bold" style={{ fontSize: '1.1em' }}>(عز وجل)</span>.
        </p>
      </Card>

      {/* Dynamic Time Greeting */}
      {timeGreeting && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <p className="text-sm text-center text-muted-foreground italic px-2">🌙 {timeGreeting}</p>
        </motion.div>
      )}

      {/* Predefined Zikr List with Independent Counters */}
      <Card className="pastel-card p-5 space-y-3">
        <h3 className="font-display text-base flex items-center gap-2">📿 Adhkâr</h3>
        <div className="space-y-4">
          {DEFAULT_DHIKRS.map((d, i) => (
            <div key={i} className="border-b border-border/30 pb-4 last:border-0 last:pb-0 space-y-2">
              <p className="arabic-text text-center text-lg leading-loose font-bold" style={{ fontSize: 'var(--arabic-font-size, 110%)' }}>
                {d.arabic}
              </p>
              <p className="text-center text-xs text-muted-foreground italic">({d.phonetic})</p>
              <p className="text-center text-sm text-foreground/70">{d.french}</p>
              <div className="flex items-center justify-center gap-2 pt-1">
                <Input
                  type="number"
                  value={predefinedCounts[i] || 0}
                  onChange={(e) => updatePredefinedCount(i, parseInt(e.target.value) || 0)}
                  className="text-sm h-9 rounded-xl bg-background/60 border-border/40 w-24 text-center font-bold text-primary"
                  min={0}
                  placeholder="0"
                />
                <span className="text-xs text-muted-foreground">fois</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* User's Custom Dhikr Counter */}
      <Card className="pastel-card p-5 bg-gradient-to-br from-accent/20 to-accent/5 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.06)]">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">🔢</span>
          <h3 className="font-display text-base">Saisis tes autres Dhikr ici...</h3>
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
                <Input
                  type="number"
                  value={entry.count}
                  onChange={(e) => updateCount(entry.id, parseInt(e.target.value) || 0)}
                  className="text-sm h-8 rounded-lg bg-background/80 border-border/40 w-20 text-center font-bold text-primary"
                  min={0}
                />
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
                placeholder="Ex: SubhanAllah..."
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
    </div>
  );
}
