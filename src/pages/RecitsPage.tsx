import { motion } from 'framer-motion';
import { BookOpen, Clock, Lock } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const prophets = [
  { name: 'Adam', arabic: 'آدم', status: 'soon', stories: 12 },
  { name: 'Idris', arabic: 'إدريس', status: 'soon', stories: 4 },
  { name: 'Nuh', arabic: 'نوح', status: 'soon', stories: 15 },
  { name: 'Hud', arabic: 'هود', status: 'locked', stories: 8 },
  { name: 'Salih', arabic: 'صالح', status: 'locked', stories: 6 },
  { name: 'Ibrahim', arabic: 'إبراهيم', status: 'locked', stories: 25 },
];

export default function RecitsPage() {
  return (
    <AppLayout title="Récits">
      <div className="section-spacing">
        {/* Header */}
        <div className="zen-header">
          <h1>📚 Récits Prophétiques</h1>
          <p className="text-muted-foreground">
            365 récits pour nourrir ton âme
          </p>
        </div>

        {/* Coming Soon Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="illustrated-card bg-gradient-sky text-center">
            <Clock className="h-10 w-10 text-sky-foreground mx-auto mb-3" />
            <h3 className="font-display text-lg text-sky-foreground mb-2">
              Contenu en préparation
            </h3>
            <p className="text-sm text-sky-foreground/70">
              Les récits des Prophètes <span className="honorific">(عليه السلام)</span> seront bientôt disponibles, 
              in sha Allah <span className="honorific">(عز وجل)</span>.
            </p>
          </Card>
        </motion.div>

        {/* Prophet List */}
        <div className="space-y-3">
          <h2 className="font-display text-lg text-foreground">
          Prophètes <span className="honorific">(عليهم السلام)</span>
          </h2>
          
          {prophets.map((prophet, index) => (
            <motion.div
              key={prophet.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`pastel-card p-4 flex items-center justify-between ${
                prophet.status === 'locked' ? 'opacity-60' : ''
              }`}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-mint flex items-center justify-center">
                    <span className="text-lg font-arabic">{prophet.arabic}</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {prophet.name} <span className="honorific text-sm">(عليه السلام)</span>
                    </p>
                    <p className="text-sm text-muted-foreground">{prophet.stories} récits</p>
                  </div>
                </div>
                
                {prophet.status === 'soon' ? (
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    Bientôt
                  </Badge>
                ) : (
                  <Lock className="h-5 w-5 text-muted-foreground" />
                )}
              </Card>
            </motion.div>
          ))}
        </div>

      </div>
    </AppLayout>
  );
}
