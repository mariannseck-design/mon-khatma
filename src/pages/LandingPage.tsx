import { Link } from 'react-router-dom';
import { SamsungBanner } from '@/components/layout/SamsungBanner';
import { motion } from 'framer-motion';
import { BookOpen, Users, Target, Heart, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import logo from '@/assets/logo.png';

const features = [
  {
    icon: Target,
    title: 'Planificateur Tilawah',
    description: 'Définis tes objectifs de lecture quotidiens',
    color: 'bg-gradient-mint'
  },
  {
    icon: Users,
    title: 'Espace Communauté',
    description: 'Rejoins un espace d\'entraide pour avancer ensemble',
    color: 'bg-gradient-lavender'
  },
  {
    icon: BookOpen,
    title: 'Récits Prophétiques',
    description: '365 histoires des Prophètes (عليه السلام)',
    color: 'bg-gradient-peach'
  },
  {
    icon: Heart,
    title: 'Suivi émotionnel',
    description: 'Prends soin de ton bien-être spirituel',
    color: 'bg-gradient-sky'
  }
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-warm">
      <SamsungBanner />
      {/* Hero */}
      <div className="container max-w-lg mx-auto px-6 pt-16 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <img src={logo} alt="Ma Khatma" className="w-28 h-28 mx-auto mb-6 drop-shadow-xl" />
          
          <h1 className="font-display text-4xl text-foreground mb-3">
            Ma Khatma
          </h1>
          <p className="text-muted-foreground max-w-xs mx-auto">
            Ton compagnon spirituel pour une lecture constante du Coran, 
            avec l'aide d'Allah <span className="honorific">(عز وجل)</span>
          </p>
        </motion.div>
      </div>

      {/* Features */}
      <div className="container max-w-lg mx-auto px-6 pb-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <Card className="pastel-card p-4 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl ${feature.color} flex items-center justify-center shrink-0`}>
                    <Icon className="h-6 w-6 text-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{feature.title}</p>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* CTA */}
      <div className="container max-w-lg mx-auto px-6 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-4"
        >
          <Link to="/auth">
            <Button className="w-full bg-primary text-primary-foreground hover-lift h-14 rounded-2xl text-lg">
              <Sparkles className="mr-2 h-5 w-5" />
              Commencer mon parcours
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          
        </motion.div>
      </div>


      {/* Quote */}
      <div className="container max-w-lg mx-auto px-6 pb-12">
        <Card className="illustrated-card bg-gradient-mint text-center">
          <p className="font-display text-lg text-primary-foreground italic mb-2">
            "Sois constant (Istaqim) comme il t'a été ordonné."
          </p>
          <p className="text-sm text-primary-foreground/70">
            — Sourate Hud, verset 112
          </p>
        </Card>
      </div>
    </div>
  );
}
