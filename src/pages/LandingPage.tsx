import { Link } from 'react-router-dom';
import { SamsungBanner } from '@/components/layout/SamsungBanner';
import { InstallBanner } from '@/components/pwa/InstallBanner';
import { motion } from 'framer-motion';
import { BookOpen, Users, Target, Heart, ArrowRight, Sparkles, Smartphone, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { toast } from 'sonner';
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
    description: '365 histoires des Prophètes (عليهم السلام)',
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
  const { isInstallable, isInstalled, isIOS, promptInstall } = usePWAInstall();

  return (
    <div className="min-h-screen bg-gradient-warm">
      <InstallBanner />
      <SamsungBanner />
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

      {/* Download CTA - Only when not installed and installable */}
      {!isInstalled && isInstallable && (
        <div className="container max-w-lg mx-auto px-6 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <motion.button
              onClick={() => {
                if (isIOS) {
                  toast('📲 Pour installer l\'app', {
                    description: 'Appuie sur le bouton Partager (⎙) puis "Sur l\'écran d\'accueil"',
                    duration: 8000,
                  });
                } else {
                  promptInstall();
                }
              }}
              className="w-full relative overflow-hidden rounded-[2rem] p-8 shadow-2xl bg-gradient-to-r from-[hsl(var(--destructive))] via-[hsl(20,80%,55%)] to-[hsl(40,90%,55%)] group border-2 border-white/20"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
            >
              <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/20 blur-xl" />
              <div className="relative z-10 flex items-center justify-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-white/30 backdrop-blur-sm flex items-center justify-center">
                  <Download className="h-9 w-9 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-3xl font-display font-bold text-white tracking-tight">📲 Télécharger</p>
                  <p className="text-white/85 text-lg mt-0.5">Installe l'app sur ton téléphone</p>
                </div>
              </div>
            </motion.button>
          </motion.div>
        </div>
      )}

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

      {/* iPhone Install Tutorial - Only when not installed */}
      {!isInstalled && (
        <div className="container max-w-lg mx-auto px-6 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-sky/20 via-accent/10 to-lavender/20 p-6 shadow-lg border border-primary/10">
              <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-primary/5 blur-2xl" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Smartphone className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-foreground">
                    Comment installer l'app sur iPhone
                  </h3>
                </div>
                <p className="text-muted-foreground text-sm mb-4 ml-13">
                  Ouvre <strong>Safari</strong> (l'icône boussole bleue) et non Google Chrome
                </p>
                
                <div className="space-y-3">
                  <div>
                    <video
                      src="/videos/install-iphone-1.mp4"
                      controls
                      playsInline
                      preload="metadata"
                      className="w-full max-h-[200px] object-cover rounded-2xl shadow-md"
                    />
                    <p className="text-xs text-muted-foreground text-center mt-1.5">Cliquez sur les 3 points en bas ➜ « Écran d'accueil » ➜ « Ajouter » (voir vidéo)</p>
                  </div>
                  <div>
                    <video
                      src="/videos/install-iphone-2.mp4"
                      controls
                      playsInline
                      preload="metadata"
                      className="w-full max-h-[200px] object-cover rounded-2xl shadow-md"
                    />
                    <p className="text-xs text-muted-foreground text-center mt-1.5">Cliquez sur le bouton « Partager » en bas ➜ « Sur l'écran d'accueil » ➜ « Ajouter » (voir vidéo)</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
