import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Check, BookOpen } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const TOTAL_QURAN_PAGES = 604;

interface EveningCheckInProps {
  currentPage: number;
  onValidate: (lastPage: number) => Promise<void>;
  isValidated: boolean;
}

export function EveningCheckIn({ currentPage, onValidate, isValidated }: EveningCheckInProps) {
  const [lastPageRead, setLastPageRead] = useState<string>(currentPage > 0 ? String(currentPage) : '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePageChange = (value: string) => {
    const num = parseInt(value);
    if (value === '' || (num >= 1 && num <= TOTAL_QURAN_PAGES)) {
      setLastPageRead(value);
    }
  };

  const handleValidate = async () => {
    const page = parseInt(lastPageRead);
    if (isNaN(page) || page < 1 || page > TOTAL_QURAN_PAGES) return;
    
    setIsSubmitting(true);
    try {
      await onValidate(page);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isValidated) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <Card className="overflow-hidden border-none shadow-khatma bg-gradient-to-br from-sage via-primary to-gold">
          <div className="p-6 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/30 flex items-center justify-center"
            >
              <Check className="h-8 w-8 text-white" />
            </motion.div>
            <h3 className="font-display text-2xl font-bold text-white mb-2">
              Macha'Allah! ✨
            </h3>
            <p className="text-white/90 text-lg">
              Lecture du jour validée
            </p>
            <p className="text-white/70 text-base mt-3 italic">
              Qu'Allah <span className="honorific text-white">(عز وجل)</span> accepte ta lecture
            </p>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="overflow-hidden border-none shadow-khatma bg-gradient-to-br from-cream via-card to-cream/80">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sage/20 to-gold/20 flex items-center justify-center">
              <Moon className="h-7 w-7 text-foreground" />
            </div>
            <div>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground">
                Bilan du soir
              </h3>
              <p className="text-base text-muted-foreground">
                Bismillah, enregistre ta lecture
              </p>
            </div>
          </div>

          {/* Page Input */}
          <div className="space-y-4 mb-6">
            <Label className="text-lg font-semibold text-foreground">
              Dernière page lue aujourd'hui
            </Label>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Input
                  type="number"
                  min={1}
                  max={TOTAL_QURAN_PAGES}
                  value={lastPageRead}
                  onChange={(e) => handlePageChange(e.target.value)}
                  placeholder="Ex: 42"
                  className="text-center text-3xl font-bold h-20 bg-white border-2 border-sage/30 focus:border-primary rounded-2xl"
                />
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">sur</p>
                <p className="text-2xl font-bold text-foreground">{TOTAL_QURAN_PAGES}</p>
              </div>
            </div>

            {/* Quick page indicator */}
            {lastPageRead && parseInt(lastPageRead) > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-sage/10 rounded-2xl p-4"
              >
                <p className="text-base text-foreground flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <span>
                    Juz <span className="font-bold">{Math.ceil(parseInt(lastPageRead) / 20)}</span>
                    {' — '}
                    <span className="font-semibold text-primary">
                      {((parseInt(lastPageRead) / TOTAL_QURAN_PAGES) * 100).toFixed(1)}%
                    </span> du Coran
                  </span>
                </p>
              </motion.div>
            )}
          </div>

          {/* Validate Button */}
          <Button
            onClick={handleValidate}
            disabled={!lastPageRead || parseInt(lastPageRead) < 1 || isSubmitting}
            className="w-full h-16 bg-gradient-to-r from-sage via-primary to-gold hover:opacity-90 text-white font-bold text-lg shadow-lg hover-lift transition-all disabled:opacity-50 rounded-2xl"
          >
            <Check className="h-6 w-6 mr-3" />
            Valider ma lecture
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
