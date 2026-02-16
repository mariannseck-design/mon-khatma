import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, BellOff, BookOpen, Calendar, Clock } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { ReminderConfigCard } from '@/components/rappels/ReminderConfigCard';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useDailyNotification } from '@/hooks/useDailyNotification';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';

interface Reminder {
  id: string;
  reminder_time: string;
  message: string;
  is_enabled: boolean;
  days_of_week: number[];
}

const defaultReminders = [
  {
    id: 'monday',
    title: 'Motivation du Lundi',
    description: 'Un message pour bien commencer la semaine',
    schedule: 'Chaque lundi à 8h',
    enabled: true,
    icon: Calendar
  },
  {
    id: 'friday',
    title: 'Sourate Al-Kahf',
    description: 'Rappel de lecture le vendredi',
    schedule: 'Chaque vendredi à 7h',
    enabled: true,
    icon: BookOpen
  }
];




export default function RappelsPage() {
  const { user } = useAuth();
  const { hasPermission, isSupported, requestPermission } = useDailyNotification();
  const isMobile = useIsMobile();
  const [userReminders, setUserReminders] = useState<Reminder[]>([]);
  const [dailyEnabled, setDailyEnabled] = useState(true);
  const [reminderTime, setReminderTime] = useState('08:00');
  const [saving, setSaving] = useState(false);
  const [prefsLoaded, setPrefsLoaded] = useState(false);

  const fetchReminders = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('reading_reminders')
      .select('*')
      .eq('user_id', user.id)
      .order('reminder_time', { ascending: true });
    if (data) setUserReminders(data);
  };

  const fetchPrefs = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    if (data) {
      setDailyEnabled(data.daily_reminder_enabled);
      setReminderTime(data.reminder_time);
    }
    setPrefsLoaded(true);
  };

  useEffect(() => {
    fetchReminders();
    fetchPrefs();
  }, [user]);

  const savePreferences = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from('notification_preferences')
      .upsert(
        { user_id: user.id, daily_reminder_enabled: dailyEnabled, reminder_time: reminderTime },
        { onConflict: 'user_id' }
      );
    setSaving(false);
    if (error) {
      toast.error('Erreur lors de la sauvegarde');
    } else {
      toast.success('Préférences enregistrées ✅');
    }
  };

  const handleActivateNotifications = async () => {
    if (!isSupported) {
      toast.error('Les notifications ne sont pas supportées par ton navigateur.');
      return;
    }
    const granted = await requestPermission();
    if (granted) {
      toast.success('Notifications activées ! 🔔');
    } else {
      toast.error('Permission refusée. Active les notifications dans les paramètres de ton navigateur.');
    }
  };

  const handleToggleDaily = () => {
    if (!hasPermission && isSupported) {
      handleActivateNotifications();
      return;
    }
    setDailyEnabled(!dailyEnabled);
  };

  const handleTestNotification = async () => {
    // First ensure we have push permission
    if ('Notification' in window && Notification.permission !== 'granted') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        toast.error('Permission de notification refusée. Active-la dans les paramètres de ton navigateur.');
        return;
      }
    }

    // Try server-side push notification
    try {
      const { data, error } = await supabase.functions.invoke('send-push-notifications', {
        body: { test: true },
      });
      if (!error && data?.sent > 0) {
        toast.success('Notification push envoyée ! Vérifie ton appareil 📱');
        return;
      }
      if (data?.error === 'No push subscriptions found') {
        toast.info('Aucune souscription push trouvée. Recharge la page et réessaie.');
        return;
      }
    } catch (_) { /* fallback below */ }

    // Fallback: local notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Ma Khatma 📖', {
        body: 'Ceci est un test. Qu\'Allah (عز وجل) t\'accorde la constance dans ta lecture.',
        icon: '/favicon.png',
      });
      toast.success('Notification locale envoyée ✅');
    } else {
      toast.error('Impossible d\'envoyer la notification. Vérifie tes permissions.');
    }
  };

  return (
    <AppLayout title="Rappels">
      <div className="section-spacing">
        {/* Header */}
        <div className="zen-header">
          <h1>🔔 Rappels & Notifications</h1>
          <p className="text-muted-foreground">
            Gère tous tes rappels au même endroit
          </p>
        </div>

        {/* Notification Status Banner */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className={`p-4 flex items-center justify-between rounded-2xl border-2 ${
                hasPermission
                  ? 'bg-primary/5 border-primary/20'
                  : 'bg-destructive/5 border-destructive/20'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    hasPermission ? 'bg-primary/15' : 'bg-destructive/15'
                  }`}>
                    {hasPermission
                      ? <Bell className="h-5 w-5 text-primary" />
                      : <BellOff className="h-5 w-5 text-destructive" />
                    }
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">
                      {hasPermission ? 'Notifications activées ✅' : 'Notifications désactivées'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {hasPermission
                        ? 'Tu recevras tes rappels à l\'heure prévue'
                        : 'Active-les pour ne rien manquer'
                      }
                    </p>
                  </div>
                </div>
                {!hasPermission && (
                  <Button
                    size="sm"
                    onClick={handleActivateNotifications}
                    className="bg-primary text-primary-foreground text-xs"
                  >
                    Activer
                  </Button>
                )}
              </Card>
            </motion.div>

            {/* Rappel quotidien global */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="pastel-card p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Bell className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">Rappel quotidien</p>
                      <p className="text-xs text-muted-foreground">Reçois un message chaque jour</p>
                    </div>
                  </div>
                  <Switch
                    checked={dailyEnabled}
                    onCheckedChange={handleToggleDaily}
                  />
                </div>

                {dailyEnabled && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="flex items-center justify-between pt-2 border-t border-border/50"
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm text-foreground">Heure du rappel</p>
                    </div>
                    <Input
                      type="time"
                      value={reminderTime}
                      onChange={(e) => setReminderTime(e.target.value)}
                      className="w-28 h-9 text-center"
                    />
                  </motion.div>
                )}

                {prefsLoaded && (
                  <Button onClick={savePreferences} disabled={saving} className="w-full" size="sm">
                    {saving ? 'Enregistrement...' : 'Enregistrer'}
                  </Button>
                )}
              </Card>
            </motion.div>

            {/* Custom User Reminders */}
            <ReminderConfigCard reminders={userReminders} onRefresh={fetchReminders} />

            {/* Notifications automatiques */}
            <div className="space-y-3">
              <h2 className="font-display text-lg text-foreground">Notifications automatiques</h2>
              {defaultReminders.map((reminder, index) => {
                const Icon = reminder.icon;
                return (
                  <motion.div
                    key={reminder.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="pastel-card p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{reminder.title}</p>
                          <p className="text-xs text-muted-foreground">{reminder.schedule}</p>
                        </div>
                      </div>
                      <Switch defaultChecked={reminder.enabled} />
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Test */}
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleTestNotification}
              >
                🔔 Tester les notifications
              </Button>
            </div>

        {/* Android note */}
        <Card className="pastel-card p-4 bg-peach/10 border-peach/30">
          <p className="text-sm text-muted-foreground">
            📱 <strong>Note :</strong> Les notifications fonctionnent sur iPhone et ordinateur, mais ne sont pas encore disponibles sur Android pour le moment.
          </p>
        </Card>
      </div>
    </AppLayout>
  );
}
