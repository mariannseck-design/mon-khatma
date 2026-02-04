import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, Bell, BellOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getTodayMessage } from '@/lib/dailyMessages';
import { useDailyNotification } from '@/hooks/useDailyNotification';

interface DailyReminderBannerProps {
  isVisible: boolean;
  onDismiss: () => void;
}

export function DailyReminderBanner({ isVisible, onDismiss }: DailyReminderBannerProps) {
  const todayMessage = getTodayMessage();
  const { hasPermission, isSupported, requestPermission } = useDailyNotification();

  const handleEnableNotifications = async () => {
    await requestPermission();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="mb-4"
        >
          <Card className="relative overflow-hidden bg-gradient-to-br from-primary/15 via-secondary/10 to-accent/15 border-2 border-primary/20 p-4 rounded-2xl shadow-[0_8px_30px_-12px_rgba(0,0,0,0.1)]">
            {/* Close button */}
            <button
              onClick={onDismiss}
              className="absolute top-3 right-3 p-1 rounded-full hover:bg-foreground/10 transition-colors"
              aria-label="Fermer"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>

            {/* Content */}
            <div className="flex items-start gap-3 pr-6">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-primary mb-1">
                  {todayMessage.dayName} • 08:00
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  {todayMessage.message}
                </p>
                
                <div className="flex items-center gap-2 mt-3">
                  <Link to="/planificateur">
                    <Button 
                      size="sm" 
                      className="bg-primary text-primary-foreground hover:bg-primary/90 h-8 text-xs"
                    >
                      Ouvrir le Planificateur
                    </Button>
                  </Link>
                  
                  {isSupported && !hasPermission && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleEnableNotifications}
                      className="h-8 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <Bell className="h-3 w-3 mr-1" />
                      Activer
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
