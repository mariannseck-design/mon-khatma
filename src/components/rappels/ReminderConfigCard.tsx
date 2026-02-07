import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Clock, Trash2, Check, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Reminder {
  id: string;
  reminder_time: string;
  message: string;
  is_enabled: boolean;
  days_of_week: number[];
}

interface ReminderConfigCardProps {
  reminders: Reminder[];
  onRefresh: () => void;
}

const DAYS = [
  { value: 0, label: 'Dim' },
  { value: 1, label: 'Lun' },
  { value: 2, label: 'Mar' },
  { value: 3, label: 'Mer' },
  { value: 4, label: 'Jeu' },
  { value: 5, label: 'Ven' },
  { value: 6, label: 'Sam' },
];

export function ReminderConfigCard({ reminders, onRefresh }: ReminderConfigCardProps) {
  const { user } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [newTime, setNewTime] = useState('18:00');
  const [newMessage, setNewMessage] = useState("N'oublie pas ta lecture du Coran 📖");
  const [newDays, setNewDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddReminder = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    const { error } = await supabase
      .from('reading_reminders')
      .insert({
        user_id: user.id,
        reminder_time: newTime,
        message: newMessage,
        days_of_week: newDays,
        is_enabled: true
      });

    if (error) {
      toast.error('Erreur lors de l\'ajout du rappel');
      console.error(error);
    } else {
      toast.success('Rappel ajouté avec succès! 🔔');
      setIsAdding(false);
      setNewTime('18:00');
      setNewMessage("N'oublie pas ta lecture du Coran 📖");
      setNewDays([0, 1, 2, 3, 4, 5, 6]);
      onRefresh();
    }
    
    setIsSubmitting(false);
  };

  const handleToggle = async (id: string, enabled: boolean) => {
    const { error } = await supabase
      .from('reading_reminders')
      .update({ is_enabled: enabled })
      .eq('id', id);

    if (error) {
      toast.error('Erreur lors de la mise à jour');
    } else {
      onRefresh();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('reading_reminders')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Erreur lors de la suppression');
    } else {
      toast.success('Rappel supprimé');
      onRefresh();
    }
  };

  const toggleDay = (day: number) => {
    if (newDays.includes(day)) {
      setNewDays(newDays.filter(d => d !== day));
    } else {
      setNewDays([...newDays, day].sort());
    }
  };

  const formatDays = (days: number[]) => {
    if (days.length === 7) return 'Tous les jours';
    if (days.length === 0) return 'Aucun jour';
    return days.map(d => DAYS.find(day => day.value === d)?.label).join(', ');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg text-foreground">Mes rappels personnalisés</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsAdding(true)}
          className="text-primary"
        >
          <Plus className="h-4 w-4 mr-1" />
          Ajouter
        </Button>
      </div>

      {/* Add new reminder form */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="pastel-card p-4 space-y-4 border-2 border-primary/20">
              <div className="flex items-center gap-2 text-primary">
                <Clock className="h-5 w-5" />
                <span className="font-medium">Nouveau rappel</span>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="time">Heure du rappel</Label>
                  <Input
                    id="time"
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="message">Message</Label>
                  <Input
                    id="message"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Ex: N'oublie pas ta lecture de 18h"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Jours de la semaine</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {DAYS.map((day) => (
                      <button
                        key={day.value}
                        onClick={() => toggleDay(day.value)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                          newDays.includes(day.value)
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAdding(false)}
                  className="flex-1"
                >
                  <X className="h-4 w-4 mr-1" />
                  Annuler
                </Button>
                <Button
                  size="sm"
                  onClick={handleAddReminder}
                  disabled={isSubmitting || newDays.length === 0}
                  className="flex-1 bg-primary text-primary-foreground"
                >
                  <Check className="h-4 w-4 mr-1" />
                  Ajouter
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Existing reminders */}
      {reminders.length === 0 && !isAdding ? (
        <Card className="pastel-card p-6 text-center">
          <Clock className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Aucun rappel configuré</p>
          <p className="text-sm text-muted-foreground mt-1">
            Ajoute des rappels pour ne jamais oublier ta lecture
          </p>
        </Card>
      ) : (
        reminders.map((reminder, index) => (
          <motion.div
            key={reminder.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="pastel-card p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-lg font-bold text-primary">
                      {reminder.reminder_time.slice(0, 5)}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">{reminder.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDays(reminder.days_of_week)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={reminder.is_enabled}
                    onCheckedChange={(checked) => handleToggle(reminder.id, checked)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(reminder.id)}
                    className="h-8 w-8 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))
      )}
    </div>
  );
}
