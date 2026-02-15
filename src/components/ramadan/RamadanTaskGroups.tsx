import { motion, AnimatePresence } from 'framer-motion';
import { Check, Sparkles, BookOpen, Heart, HandHeart, Plus, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { DailyTasks } from '@/pages/RamadanPage';

const taskGroups = [
  {
    title: 'Prières',
    icon: Sparkles,
    color: 'from-primary/20 to-primary/5',
    items: [
      { key: 'prayer_fajr', label: 'Fajr' },
      { key: 'prayer_dhuhr', label: 'Dhuhr' },
      { key: 'prayer_asr', label: 'Asr' },
      { key: 'prayer_maghrib', label: 'Maghrib' },
      { key: 'prayer_isha', label: 'Isha' },
      { key: 'prayer_tarawih', label: 'Tarawih' },
      { key: 'prayer_tahajjud', label: 'Tahajjud' },
    ],
  },
  {
    title: 'Sunnah',
    icon: Heart,
    color: 'from-accent/30 to-accent/5',
    items: [
      { key: 'sunnah_duha', label: 'Prière Duha' },
      { key: 'sunnah_rawatib', label: 'Rawatib' },
      { key: 'sunnah_witr', label: 'Witr' },
    ],
  },
  {
    title: 'Lecture',
    icon: BookOpen,
    color: 'from-secondary/30 to-secondary/5',
    items: [
      { key: 'reading_quran', label: 'Coran' },
      { key: 'reading_hadith', label: 'Hadith' },
    ],
  },
  {
    title: 'Bonnes actions',
    icon: HandHeart,
    color: 'from-primary/15 to-accent/10',
    items: [
      { key: 'sadaqa', label: 'Sadaqa' },
    ],
  },
];

interface RamadanTaskGroupsProps {
  tasks: DailyTasks;
  toggleTask: (key: string) => void;
  customGoodDeeds: string[];
  newDeed: string;
  setNewDeed: (v: string) => void;
  addCustomDeed: () => void;
  removeCustomDeed: (index: number) => void;
}

export default function RamadanTaskGroups({
  tasks, toggleTask, customGoodDeeds, newDeed, setNewDeed, addCustomDeed, removeCustomDeed,
}: RamadanTaskGroupsProps) {
  return (
    <>
      {taskGroups.map((group, gi) => (
        <motion.div
          key={group.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: gi * 0.1 }}
        >
          <Card className={`pastel-card p-5 bg-gradient-to-br ${group.color} shadow-[0_8px_30px_-12px_rgba(0,0,0,0.06)]`}>
            <div className="flex items-center gap-2 mb-4">
              <group.icon className="h-5 w-5 text-primary" />
              <h3 className="font-display text-base">{group.title}</h3>
            </div>
            <div className="space-y-3">
              {group.items.map((item) => {
                const checked = tasks[item.key as keyof DailyTasks];
                return (
                  <div
                    key={item.key}
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={() => toggleTask(item.key)}
                  >
                    <Checkbox
                      checked={checked}
                      className="h-5 w-5 rounded-lg border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary pointer-events-none"
                    />
                    <span className={`text-sm font-medium transition-all ${checked ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                      {item.label}
                    </span>
                    <AnimatePresence>
                      {checked && (
                        <motion.span
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          className="ml-auto text-primary"
                        >
                          <Check className="h-4 w-4" />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}

              {/* Custom good deeds for "Bonnes actions" group */}
              {group.title === 'Bonnes actions' && (
                <>
                  {customGoodDeeds.map((deed, i) => (
                    <div key={i} className="flex items-center gap-3 pl-1">
                      <Check className="h-4 w-4 text-primary shrink-0" />
                      <span className="text-sm font-medium text-foreground flex-1">{deed}</span>
                      <button onClick={() => removeCustomDeed(i)} className="text-muted-foreground hover:text-destructive transition-colors">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 pt-1">
                    <Input
                      value={newDeed}
                      onChange={(e) => setNewDeed(e.target.value)}
                      placeholder="Ajouter une bonne action..."
                      className="text-sm h-9 rounded-xl bg-background/60 border-border/40"
                      onKeyDown={(e) => e.key === 'Enter' && addCustomDeed()}
                    />
                    <Button size="icon" variant="ghost" onClick={addCustomDeed} disabled={!newDeed.trim()} className="shrink-0 h-9 w-9">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          </Card>
        </motion.div>
      ))}
    </>
  );
}
