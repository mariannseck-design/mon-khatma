import { motion } from 'framer-motion';
import { Bell, User, Shield, Smartphone, Moon, Sun } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/card';
import { NotificationSettings } from '@/components/notifications/NotificationSettings';
import { useAuth } from '@/contexts/AuthContext';

export default function ParametresPage() {
  const { user } = useAuth();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <AppLayout title="Paramètres">
      <motion.div
        className="space-y-6 pb-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">
            ⚙️ Paramètres
          </h1>
          <p className="text-muted-foreground">
            Personnalise ton expérience
          </p>
        </motion.div>

        {/* User Info */}
        <motion.div variants={itemVariants}>
          <Card className="p-4 rounded-2xl bg-gradient-to-br from-card to-muted/30">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center">
                <User className="h-7 w-7 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground truncate">
                  {user?.email || 'Non connecté'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Compte Istiqamah
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Notifications Section */}
        <motion.div variants={itemVariants} className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Bell className="h-5 w-5 text-primary" />
            <h2 className="font-display text-lg font-semibold text-foreground">
              Notifications
            </h2>
          </div>
          <NotificationSettings />
        </motion.div>

        {/* Info Card */}
        <motion.div variants={itemVariants}>
          <Card className="p-4 rounded-2xl bg-gradient-to-br from-gold/10 to-cream/50 border-gold/20">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center flex-shrink-0">
                <Smartphone className="h-5 w-5 text-gold" />
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-1">
                  Astuce mobile
                </h3>
                <p className="text-sm text-muted-foreground">
                  Pour recevoir les notifications même quand l'application est fermée, 
                  ajoute Istiqamah à ton écran d'accueil depuis le menu de ton navigateur.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Spiritual closing */}
        <motion.div 
          variants={itemVariants}
          className="text-center pt-4"
        >
          <p className="font-display text-sm text-muted-foreground italic">
            "Et rappelle, car le rappel profite aux croyants."
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            — Sourate Adh-Dhariyat, verset 55
          </p>
        </motion.div>
      </motion.div>
    </AppLayout>
  );
}
