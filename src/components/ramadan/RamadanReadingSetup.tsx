import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface RamadanReadingSetupProps {
  onSetupComplete: (firstName: string, dailyPages: number) => void;
}

export default function RamadanReadingSetup({ onSetupComplete }: RamadanReadingSetupProps) {
  const { user } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [dailyPages, setDailyPages] = useState<number>(5);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [savedName, setSavedName] = useState('');
  const [savedPages, setSavedPages] = useState(0);

  const handleSubmit = async () => {
    if (!user || !firstName.trim() || dailyPages < 1) return;
    setSubmitting(true);

    const { error } = await supabase
      .from('ramadan_reading_goals')
      .upsert(
        { user_id: user.id, first_name: firstName.trim(), daily_pages: dailyPages },
        { onConflict: 'user_id' }
      );

    if (error) {
      toast.error("Erreur lors de l'enregistrement");
      console.error(error);
    } else {
      setSavedName(firstName.trim());
      setSavedPages(dailyPages);
      setSuccess(true);
      setTimeout(() => {
        onSetupComplete(firstName.trim(), dailyPages);
      }, 3000);
    }
    setSubmitting(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="pastel-card p-6 bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 border-2 border-primary/20">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-8 w-8 text-primary" />
          </div>
          <h2 className="font-display text-xl text-foreground mb-2">
            Ramadan Moubarak ! 🌙
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            En ce mois béni, quel est ton objectif de lecture quotidien pour rester constante
            avec le Livre d'Allah <span className="honorific font-bold" style={{ fontSize: '1.1em' }}>(عز وجل)</span> ?
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!success ? (
            <motion.div
              key="form"
              className="space-y-4"
              exit={{ opacity: 0, y: -10 }}
            >
              <div>
                <Label htmlFor="firstName">Ton prénom</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Ex: Fatima"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="dailyPages">Nombre de pages par jour</Label>
                <Input
                  id="dailyPages"
                  type="number"
                  min={1}
                  max={50}
                  value={dailyPages}
                  onChange={(e) => setDailyPages(parseInt(e.target.value) || 1)}
                  className="mt-1"
                />
              </div>

              <Button
                onClick={handleSubmit}
                disabled={submitting || !firstName.trim() || dailyPages < 1}
                className="w-full bg-primary text-primary-foreground"
              >
                {submitting ? 'Enregistrement...' : 'Valider mon engagement ✨'}
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              <Sparkles className="h-10 w-10 text-primary mx-auto mb-3" />
              <p className="text-foreground leading-relaxed">
                Qu'Allah <span className="honorific font-bold" style={{ fontSize: '1.1em' }}>(عز وجل)</span> accepte
                ta dévotion, <strong>{savedName}</strong> ! Ton objectif de{' '}
                <strong>{savedPages} page{savedPages > 1 ? 's' : ''}</strong> par jour est un
                magnifique engagement pour ce Ramadan. 🤲
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
