import { motion } from 'framer-motion';
import { Bell, Calendar, Clock, Moon, BookOpen, ExternalLink } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

const reminders = [
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
  },
  {
    id: 'daily',
    title: 'Lecture quotidienne',
    description: 'Rappel pour ta lecture du Coran',
    schedule: 'Tous les jours à 21h',
    enabled: false,
    icon: Clock
  }
];

const externalTools = [
  {
    name: 'Life With Allah',
    description: 'Dhikr & Dua quotidiens',
    icon: '🤲',
    color: 'bg-gradient-mint'
  },
  {
    name: 'Tarteel',
    description: 'Mémorisation IA du Coran',
    icon: '🎙️',
    color: 'bg-gradient-lavender'
  },
  {
    name: 'Mon app de lecture',
    description: 'Ouvre ton app préférée',
    icon: '📖',
    color: 'bg-gradient-peach'
  }
];

export default function RappelsPage() {
  return (
    <AppLayout title="Rappels">
      <div className="section-spacing">
        {/* Header */}
        <div className="zen-header">
          <h1>🔔 Rappels & Outils</h1>
          <p className="text-muted-foreground">
            Ne manque jamais ta lecture, in sha Allah <span className="honorific">(عز وجل)</span>
          </p>
        </div>

        {/* Reminders */}
        <div className="space-y-3">
          <h2 className="font-display text-lg text-foreground">Notifications</h2>
          
          {reminders.map((reminder, index) => {
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

        {/* Celebrations Info */}
        <Card className="illustrated-card bg-gradient-sky">
          <div className="flex items-center gap-3 mb-3">
            <Moon className="h-6 w-6 text-sky-foreground" />
            <h3 className="font-display text-lg text-sky-foreground">Célébrations</h3>
          </div>
          <p className="text-sm text-sky-foreground/80">
            Tu recevras des messages de félicitations lorsque tu termines un Juz' 
            ou une semaine complète de lecture! 🎉
          </p>
        </Card>

        {/* External Tools */}
        <div className="space-y-3">
          <h2 className="font-display text-lg text-foreground">Boîte à outils</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Recommandations d'applications complémentaires
          </p>
          
          {externalTools.map((tool, index) => (
            <motion.div
              key={tool.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="pastel-card p-4 flex items-center justify-between hover-lift cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl ${tool.color} flex items-center justify-center`}>
                    <span className="text-2xl">{tool.icon}</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{tool.name}</p>
                    <p className="text-sm text-muted-foreground">{tool.description}</p>
                  </div>
                </div>
                <ExternalLink className="h-5 w-5 text-muted-foreground" />
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
