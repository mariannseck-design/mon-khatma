import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, BellOff, Clock, ArrowLeft, Smartphone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useDailyNotification } from '@/hooks/useDailyNotification';
import { toast } from 'sonner';

export default function ParametresPage() {
  const { user } = useAuth();
  const { hasPermission, isSupported, requestPermission } = useDailyNotification();

  const [dailyEnabled, setDailyEnabled] = useState(true);
  const [reminderTime, setReminderTime] = useState('08:00');
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchPrefs = async () => {
      const { data } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        setDailyEnabled(data.daily_reminder_enabled);
        setReminderTime(data.reminder_time);
      }
      setLoaded(true);
    };
    fetchPrefs();
  }, [user]);

  const savePreferences = async () => {
    if (!user) return;
    setSaving(true);

    const { error } = await supabase
      .from('notification_preferences')
      .upsert(
        {
          user_id: user.id,
          daily_reminder_enabled: dailyEnabled,
          reminder_time: reminderTime,
        },
        { onConflict: 'user_id' }
      );

    setSaving(false);
    if (error) {
      toast.error('Erreur lors de la sauvegarde');
    } else {
      toast.success('Préférences enregistrées ✅');
    }
  };

  const handleToggleNotifications = async () => {
    if (!hasPermission && isSupported) {
      const granted = await requestPermission();
      if (!granted) {
        toast.error('Permission refusée. Active les notifications dans les paramètres de ton navigateur.');
        return;
      }
    }
    const newVal = !dailyEnabled;
    setDailyEnabled(newVal);
  };

  const timeOptions = Array.from({ length: 24 }, (_, h) => {
    const hour = h.toString().padStart(2, '0');
    return `${hour}:00`;
  });

  return (
    <AppLayout title="Paramètres">
      <div className="section-spacing">
        {/* Header */}
        <div className="zen-header">
          <h1>⚙️ Paramètres</h1>
          <p className="text-muted-foreground">
            Personnalise ton expérience Ma Khatma
          </p>
        </div>

        {/* Notifications Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="pastel-card p-5 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <h2 className="font-display text-lg text-foreground">Notifications</h2>
            </div>

            {/* Browser permission status */}
            {isSupported && !hasPermission && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-3 flex items-start gap-3">
                <BellOff className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">Notifications désactivées</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Autorise les notifications pour recevoir tes rappels quotidiens.
                  </p>
                  <Button
                    size="sm"
                    className="mt-2 h-8 text-xs"
                    onClick={async () => {
                      const granted = await requestPermission();
                      if (granted) toast.success('Notifications activées !');
                    }}
                  >
                    Autoriser les notifications
                  </Button>
                </div>
              </div>
            )}

            {/* Daily reminder toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground text-sm">Rappel quotidien</p>
                  <p className="text-xs text-muted-foreground">Reçois un message chaque jour</p>
                </div>
              </div>
              <Switch
                checked={dailyEnabled}
                onCheckedChange={handleToggleNotifications}
              />
            </div>

            {/* Time selector */}
            {dailyEnabled && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground text-sm">Heure du rappel</p>
                    <p className="text-xs text-muted-foreground">Choisis l'heure idéale</p>
                  </div>
                </div>
                <Select value={reminderTime} onValueChange={setReminderTime}>
                  <SelectTrigger className="w-24 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>
            )}

            {/* Save button */}
            {loaded && (
              <Button
                onClick={savePreferences}
                disabled={saving}
                className="w-full"
              >
                {saving ? 'Enregistrement...' : 'Enregistrer mes préférences'}
              </Button>
            )}

            {/* Test push notification button */}
            <Button
              variant="outline"
              className="w-full"
              onClick={async () => {
                // Try push notification first
                if ('serviceWorker' in navigator && 'PushManager' in window) {
                  try {
                    const reg = await navigator.serviceWorker.getRegistration('/');
                    const sub = reg ? await (reg as any).pushManager.getSubscription() : null;
                    if (sub) {
                      // Trigger the edge function for this user
                      const { error } = await supabase.functions.invoke('send-push-notifications', {
                        body: { test: true },
                      });
                      if (!error) {
                        toast.success('Notification push envoyée ! Vérifie ton appareil 📱');
                        return;
                      }
                    }
                  } catch (_) { /* fallback below */ }
                }
                // Fallback: local browser notification
                if ('Notification' in window && Notification.permission === 'granted') {
                  new Notification('Ma Khatma 📖', {
                    body: 'Ceci est un test. Qu\'Allah (عز وجل) t\'accorde la constance dans ta lecture.',
                    icon: '/favicon.png',
                  });
                  toast.success('Notification locale envoyée ✅');
                } else {
                  toast.error('Aucune souscription push active. Autorise les notifications d\'abord.');
                }
              }}
            >
              🔔 Tester les notifications
            </Button>
          </Card>
        </motion.div>

        {/* Info card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="illustrated-card bg-gradient-sky mt-4">
            <p className="text-sm text-sky-foreground/80">
              💡 Les rappels t'envoient un message inspirant du jour pour t'encourager dans ta lecture du Coran.
              Ils s'affichent aussi en bannière sur ta page d'accueil.
            </p>
          </Card>
        </motion.div>
      </div>
    </AppLayout>
  );
}
