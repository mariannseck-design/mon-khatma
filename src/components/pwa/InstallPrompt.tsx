import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Share, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import logo from '@/assets/logo.png';

export function InstallPrompt() {
  const { isInstallable, isInstalled, isIOS, promptInstall } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // Don't show if already installed or dismissed
  if (isInstalled || dismissed) return null;

  // Show iOS guide
  if (isIOS && !isInstallable) {
    return (
      <AnimatePresence>
        {showIOSGuide && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-20 left-4 right-4 z-50"
          >
            <Card className="p-4 bg-card/98 backdrop-blur-xl border-primary/20 shadow-xl rounded-2xl">
              <button 
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-3 right-3 p-1 rounded-full hover:bg-muted"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
              
              <div className="flex items-center gap-3 mb-4">
                <img src={logo} alt="Mon Khatma" className="w-12 h-12 rounded-xl" />
                <div>
                  <h3 className="font-semibold text-foreground">Installer Mon Khatma</h3>
                  <p className="text-sm text-muted-foreground">Ajoute l'app à ton écran d'accueil</p>
                </div>
              </div>

              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Share className="h-4 w-4 text-primary" />
                  </div>
                  <p>Appuie sur le bouton <strong>Partager</strong> en bas de Safari</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Plus className="h-4 w-4 text-primary" />
                  </div>
                  <p>Choisis <strong>"Sur l'écran d'accueil"</strong></p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {!showIOSGuide && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed bottom-24 right-4 z-50"
          >
            <Button
              onClick={() => setShowIOSGuide(true)}
              className="rounded-full shadow-lg bg-primary hover:bg-primary/90 h-14 w-14"
            >
              <Download className="h-6 w-6" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Show install prompt for Android/Desktop
  if (!isInstallable) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="fixed bottom-20 left-4 right-4 z-50"
      >
        <Card className="p-4 bg-card/98 backdrop-blur-xl border-primary/20 shadow-xl rounded-2xl">
          <button 
            onClick={() => setDismissed(true)}
            className="absolute top-3 right-3 p-1 rounded-full hover:bg-muted"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
          
          <div className="flex items-center gap-3 mb-4">
            <img src={logo} alt="Mon Khatma" className="w-12 h-12 rounded-xl" />
            <div>
              <h3 className="font-semibold text-foreground">Installer Mon Khatma</h3>
              <p className="text-sm text-muted-foreground">Accède rapidement à ton suivi</p>
            </div>
          </div>

          <Button 
            onClick={promptInstall}
            className="w-full bg-primary text-primary-foreground rounded-xl h-12"
          >
            <Download className="h-5 w-5 mr-2" />
            Installer l'application
          </Button>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
