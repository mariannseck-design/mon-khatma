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
          <h1 className="text-2xl sm:text-3xl">🌸 Comment te sens-tu?</h1>
          <p className="text-base text-muted-foreground">
            Prends un moment pour toi, avec l'aide d'Allah <span className="honorific">(عز وجل)</span>
          </p>
        </div>

        {/* Mood Selection */}
        <Card className="pastel-card p-6">
          <h3 className="font-display text-xl mb-5 text-center">Mon humeur aujourd'hui</h3>
          
          <div className="flex justify-center gap-3 flex-wrap">
            {moods.map((mood) => {
              const Icon = mood.icon;
              const isSelected = selectedMood === mood.value;
              
              return (
                <motion.button
                  key={mood.value}
                  onClick={() => setSelectedMood(mood.value)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all min-w-[4.5rem] ${
                    isSelected 
                      ? `${mood.color} scale-110 shadow-lg` 
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className={`h-9 w-9 ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`} />
                  <span className={`text-sm font-medium ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>
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
              <Heart className="h-6 w-6 text-peach" />
              <h3 className="font-display text-xl">Gratitude</h3>
            </div>
            
            <p className="text-base text-muted-foreground mb-4">
              Pour quoi es-tu reconnaissante aujourd'hui?
            </p>
            
            <Textarea
              placeholder="Alhamdulillah pour..."
              value={gratitude}
              onChange={(e) => setGratitude(e.target.value)}
              className="min-h-[120px] rounded-xl resize-none text-base"
            />
          </Card>
        </motion.div>

        {/* Save Button */}
        {!saved && (
          <Button 
            onClick={handleSave}
            className="w-full bg-primary text-primary-foreground hover-lift h-14 rounded-2xl text-lg font-semibold"
          >
            <Sparkles className="h-5 w-5 mr-2" />
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
              <Sparkles className="h-14 w-14 text-primary-foreground mx-auto mb-4" />
              <h3 className="font-display text-2xl text-primary-foreground mb-2">
                Moment enregistré!
              </h3>
              <p className="text-base text-primary-foreground/70">
                Qu'Allah <span className="honorific">(عز وجل)</span> t'accorde la paix intérieure.
              </p>
            </Card>
          </motion.div>
        )}

        {/* Reflection Card */}
        <Card className="pastel-card p-6">
          <h3 className="font-display text-xl mb-4">💭 Réflexion du jour</h3>
          <p className="text-base text-foreground italic leading-relaxed">
            "Le croyant qui se mélange aux gens et supporte leurs nuisances est meilleur que 
            celui qui ne se mélange pas aux gens et ne supporte pas leurs nuisances."
          </p>
          <p className="text-base text-muted-foreground mt-3">
            — Hadith rapporté par At-Tirmidhi
          </p>
        </Card>
      </div>
    </AppLayout>
  );
}
