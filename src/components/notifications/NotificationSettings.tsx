import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, BellOff, TestTube2, Clock, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface NotificationPrefs {
  daily_reminder_enabled: boolean;
  reminder_time: string;
}

export function NotificationSettings() {
  const { user } = useAuth();
  const { 
    isSupported, 
    isSubscribed, 
    permission, 
    isLoading,
    subscribe, 
    unsubscribe,
    sendTestNotification 
  } = usePushNotifications();

  const [prefs, setPrefs] = useState<NotificationPrefs>({
    daily_reminder_enabled: true,
    reminder_time: '20:00:00',
  });
  const [savingPrefs, setSavingPrefs] = useState(false);

  // Load preferences
  useEffect(() => {
    if (!user) return;

    const loadPrefs = async () => {
      const { data } = await supabase
        .from('notification_preferences')
        .select('daily_reminder_enabled, reminder_time')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        setPrefs({
          daily_reminder_enabled: data.daily_reminder_enabled,
          reminder_time: data.reminder_time,
        });
      }
    };

    loadPrefs();
  }, [user]);

  const handleToggleNotifications = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  };

  const handleTimeChange = async (time: string) => {
    if (!user) return;
    
    setSavingPrefs(true);
    const newTime = `${time}:00`;
    
    try {
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          daily_reminder_enabled: prefs.daily_reminder_enabled,
          reminder_time: newTime,
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;
      
      setPrefs(prev => ({ ...prev, reminder_time: newTime }));
      toast.success('Heure de rappel mise à jour');
    } catch (error) {
      console.error('Error updating time:', error);
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setSavingPrefs(false);
    }
  };

  const timeOptions = [
    { value: '07:00', label: '07:00 - Matin' },
    { value: '12:00', label: '12:00 - Midi' },
    { value: '17:00', label: '17:00 - Après-midi' },
    { value: '20:00', label: '20:00 - Soir (recommandé)' },
    { value: '21:00', label: '21:00 - Soirée' },
  ];

  if (!isSupported) {
    return (
      <Card className="p-4 bg-muted/50 rounded-2xl">
        <div className="flex items-center gap-3 text-muted-foreground">
          <BellOff className="h-5 w-5" />
          <p className="text-sm">
            Les notifications push ne sont pas supportées sur ce navigateur.
            Essaie d'utiliser Chrome ou Safari.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Main Toggle Card */}
      <Card className="p-4 rounded-2xl border-2 border-primary/10 bg-gradient-to-br from-card to-primary/5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isSubscribed ? 'bg-primary/20' : 'bg-muted'
            }`}>
              {isSubscribed ? (
                <Bell className="h-6 w-6 text-primary" />
              ) : (
                <BellOff className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <div>
              <h3 className="font-medium text-foreground">
                Notifications quotidiennes
              </h3>
              <p className="text-sm text-muted-foreground">
                {isSubscribed 
                  ? 'Tu recevras un rappel de lecture'
                  : 'Active pour ne jamais oublier ta lecture'
                }
              </p>
            </div>
          </div>
          
          <Switch
            checked={isSubscribed}
            onCheckedChange={handleToggleNotifications}
            disabled={isLoading}
            className="data-[state=checked]:bg-primary"
          />
        </div>

        {/* Permission denied warning */}
        {permission === 'denied' && (
          <div className="mt-3 p-3 bg-destructive/10 rounded-xl">
            <p className="text-sm text-destructive">
              Les notifications sont bloquées. Autorise-les dans les paramètres de ton navigateur.
            </p>
          </div>
        )}
      </Card>

      {/* Time Selection */}
      {isSubscribed && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <Card className="p-4 rounded-2xl">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-gold" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Heure du rappel</h4>
                  <p className="text-xs text-muted-foreground">
                    Choisis le meilleur moment
                  </p>
                </div>
              </div>

              <Select
                value={prefs.reminder_time.slice(0, 5)}
                onValueChange={handleTimeChange}
                disabled={savingPrefs}
              >
                <SelectTrigger className="w-[160px] h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Test Button */}
      {isSubscribed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Button
            variant="outline"
            onClick={sendTestNotification}
            className="w-full h-12 rounded-xl border-dashed"
          >
            <TestTube2 className="h-4 w-4 mr-2" />
            Envoyer une notification test
          </Button>
        </motion.div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-2">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}
    </motion.div>
  );
}
