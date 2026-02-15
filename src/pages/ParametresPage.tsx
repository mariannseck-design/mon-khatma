import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/card';

export default function ParametresPage() {
  return (
    <AppLayout title="Paramètres">
      <div className="section-spacing">
        <div className="zen-header">
          <h1>⚙️ Paramètres</h1>
          <p className="text-muted-foreground">
            Personnalise ton expérience Ma Khatma
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="illustrated-card bg-gradient-sky">
            <p className="text-sm text-sky-foreground/80">
              💡 Les rappels et notifications se gèrent désormais depuis la page <strong>Rappels</strong> accessible via la navigation en bas.
            </p>
          </Card>
        </motion.div>
      </div>
    </AppLayout>
  );
}
