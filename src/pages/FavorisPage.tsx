import { motion } from 'framer-motion';
import { Heart, BookOpen, Star } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/card';

export default function FavorisPage() {
  return (
    <AppLayout title="Favoris">
      <div className="section-spacing">
        {/* Header */}
        <div className="zen-header">
          <h1>❤️ Mes Favoris</h1>
          <p className="text-muted-foreground">
            Tes récits et versets préférés
          </p>
        </div>

        {/* Empty State */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="illustrated-card bg-gradient-peach text-center py-12">
            <Heart className="h-16 w-16 text-peach-foreground/50 mx-auto mb-4" />
            <h3 className="font-display text-lg text-peach-foreground mb-2">
              Aucun favori pour l'instant
            </h3>
            <p className="text-sm text-peach-foreground/70 max-w-xs mx-auto">
              Lorsque tu liras les récits des Prophètes <span className="honorific">(عليهم السلام)</span>, 
              tu pourras sauvegarder tes passages préférés ici.
            </p>
          </Card>
        </motion.div>

        {/* Coming Soon */}
        <div className="space-y-3">
          <h2 className="font-display text-lg text-foreground">Bientôt disponible</h2>
          
          <Card className="pastel-card p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-mint flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <p className="font-medium text-foreground">365 Récits Prophétiques</p>
              <p className="text-sm text-muted-foreground">
                D'Adam <span className="honorific">(عليه السلام)</span> à Mouhamed <span className="honorific">(ﷺ)</span>
              </p>
            </div>
          </Card>

          <Card className="pastel-card p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-lavender flex items-center justify-center">
              <Star className="h-6 w-6 text-accent-foreground" />
            </div>
            <div>
              <p className="font-medium text-foreground">Versets du Coran</p>
              <p className="text-sm text-muted-foreground">Sauvegarde tes ayat préférées</p>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
