import { useState } from 'react';
import { motion } from 'framer-motion';
import { Smile, Frown, Meh, Heart, Cloud, Sun, Sparkles } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const moods = [
  { icon: Sun, label: 'Sereine', value: 5, color: 'bg-gradient-mint' },
  { icon: Smile, label: 'Bien', value: 4, color: 'bg-gradient-sky' },
  { icon: Meh, label: 'Neutre', value: 3, color: 'bg-muted' },
  { icon: Cloud, label: 'Fatiguée', value: 2, color: 'bg-gradient-lavender' },
  { icon: Frown, label: 'Difficile', value: 1, color: 'bg-gradient-peach' },
];

export default function EmotionsPage() {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [gratitude, setGratitude] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (!selectedMood) {
      toast.error('Sélectionne ton humeur d\'abord');
      return;
    }
    
    setSaved(true);
    toast.success('Masha\'Allah, continue ainsi! 🌙');
  };

  return (
    <AppLayout title="Émotions">
      <div className="section-spacing">
        {/* Header */}
        <div className="zen-header">
          <h1>🌸 Comment te sens-tu?</h1>
          <p className="text-muted-foreground">
            Prends un moment pour toi, avec l'aide d'Allah <span className="honorific">(عز وجل)</span>
          </p>
        </div>

        {/* Mood Selection */}
        <Card className="pastel-card p-6">
          <h3 className="font-display text-lg mb-4 text-center">Mon humeur aujourd'hui</h3>
          
          <div className="flex justify-center gap-3">
            {moods.map((mood) => {
              const Icon = mood.icon;
              const isSelected = selectedMood === mood.value;
              
              return (
                <motion.button
                  key={mood.value}
                  onClick={() => setSelectedMood(mood.value)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all ${
                    isSelected 
                      ? `${mood.color} scale-110 shadow-lg` 
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className={`h-8 w-8 ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`} />
                  <span className={`text-xs ${isSelected ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                    {mood.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </Card>

        {/* Gratitude */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="pastel-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="h-5 w-5 text-peach" />
              <h3 className="font-display text-lg">Gratitude</h3>
            </div>
            
            <p className="text-sm text-muted-foreground mb-3">
              Pour quoi es-tu reconnaissante aujourd'hui?
            </p>
            
            <Textarea
              placeholder="Alhamdulillah pour..."
              value={gratitude}
              onChange={(e) => setGratitude(e.target.value)}
              className="min-h-[100px] rounded-xl resize-none"
            />
          </Card>
        </motion.div>

        {/* Save Button */}
        {!saved && (
          <Button 
            onClick={handleSave}
            className="w-full bg-primary text-primary-foreground hover-lift h-12 rounded-xl"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Enregistrer mon moment
          </Button>
        )}

        {/* Success State */}
        {saved && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="illustrated-card bg-gradient-mint text-center py-8">
              <Sparkles className="h-12 w-12 text-primary-foreground mx-auto mb-4" />
              <h3 className="font-display text-xl text-primary-foreground mb-2">
                Moment enregistré!
              </h3>
              <p className="text-sm text-primary-foreground/70">
                Qu'Allah <span className="honorific">(عز وجل)</span> t'accorde la paix intérieure.
              </p>
            </Card>
          </motion.div>
        )}

        {/* Reflection Card */}
        <Card className="pastel-card p-6">
          <h3 className="font-display text-lg mb-3">💭 Réflexion du jour</h3>
          <p className="text-foreground italic">
            "Le croyant qui se mélange aux gens et supporte leurs nuisances est meilleur que 
            celui qui ne se mélange pas aux gens et ne supporte pas leurs nuisances."
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            — Hadith rapporté par At-Tirmidhi
          </p>
        </Card>
      </div>
    </AppLayout>
  );
}
