import { motion } from 'framer-motion';
import { Moon, Pencil, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface RamadanTaqwaReviewProps {
  gratitude: string;
  setGratitude: (v: string) => void;
  intention: string;
  setIntention: (v: string) => void;
  reviewId: string | null;
  isEditing: boolean;
  setIsEditing: (v: boolean) => void;
  saving: boolean;
  saveReview: () => void;
  deleteReview: () => void;
}

export default function RamadanTaqwaReview({
  gratitude, setGratitude, intention, setIntention,
  reviewId, isEditing, setIsEditing, saving, saveReview, deleteReview,
}: RamadanTaqwaReviewProps) {
  const hasExistingReview = !!reviewId && !isEditing;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <Card className="pastel-card p-6 bg-gradient-to-br from-secondary/20 to-accent/10 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Moon className="h-5 w-5 text-primary" />
            <h3 className="font-display text-lg">Mon Bilan Taqwa</h3>
          </div>
          {hasExistingReview && (
            <div className="flex items-center gap-1">
              <Button size="icon" variant="ghost" onClick={() => setIsEditing(true)} className="h-8 w-8">
                <Pencil className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={deleteReview} className="h-8 w-8 text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {hasExistingReview ? (
          <div className="space-y-4">
            {gratitude && (
              <div>
                <p className="text-sm font-semibold text-foreground mb-1">🤲 Gratitude du jour</p>
                <p className="text-sm text-muted-foreground bg-background/40 rounded-xl p-3">{gratitude}</p>
              </div>
            )}
            {intention && (
              <div>
                <p className="text-sm font-semibold text-foreground mb-1">🌟 Intention pour demain</p>
                <p className="text-sm text-muted-foreground bg-background/40 rounded-xl p-3">{intention}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">
                🤲 Gratitude du jour
              </label>
              <Textarea
                placeholder="Al-Hamdulillah pour..."
                value={gratitude}
                onChange={(e) => setGratitude(e.target.value)}
                className="min-h-[80px] bg-background/60 border-border/40 rounded-2xl resize-none text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">
                🌟 Intention pour demain
              </label>
              <Textarea
                placeholder="Demain, in sha Allah, je souhaite..."
                value={intention}
                onChange={(e) => setIntention(e.target.value)}
                className="min-h-[80px] bg-background/60 border-border/40 rounded-2xl resize-none text-sm"
              />
            </div>
            <Button
              onClick={saveReview}
              disabled={saving || (!gratitude && !intention)}
              className="w-full bg-primary text-primary-foreground rounded-2xl hover-lift"
            >
              {saving ? 'Enregistrement...' : isEditing ? 'Mettre à jour 🌙' : 'Enregistrer ma réflexion 🌙'}
            </Button>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
