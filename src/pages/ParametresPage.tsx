import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Moon, Sun, Type, AlertTriangle, Brain, RotateCcw } from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { getSM2Config, saveSM2Config, resetSM2Config, getSM2Defaults } from '@/lib/sm2Config';

export default function ParametresPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [confirmText, setConfirmText] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });

  const [arabicSize, setArabicSize] = useState(() => {
    const saved = localStorage.getItem('arabic-text-size');
    return saved ? parseInt(saved, 10) : 110;
  });

  const sm2Defaults = getSM2Defaults();
  const [sm2Ease, setSm2Ease] = useState(() => getSM2Config().initialEase);
  const [sm2Int1, setSm2Int1] = useState(() => getSM2Config().interval1);
  const [sm2Int2, setSm2Int2] = useState(() => getSM2Config().interval2);
  const [sm2Int3, setSm2Int3] = useState(() => getSM2Config().interval3);
  const [sm2Int4, setSm2Int4] = useState(() => getSM2Config().interval4);

  const toggleTheme = (checked: boolean) => {
    setIsDark(checked);
    if (checked) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  useEffect(() => {
    document.documentElement.style.setProperty('--arabic-font-size', `${arabicSize}%`);
    localStorage.setItem('arabic-text-size', arabicSize.toString());
  }, [arabicSize]);

  return (
    <AppLayout title="Paramètres">
      <div className="section-spacing">
        <div className="zen-header">
          <h1>⚙️ Paramètres</h1>
          <p className="text-muted-foreground">
            Personnalise ton expérience Ma Khatma
          </p>
        </div>

        {/* Dark Mode Toggle */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="pastel-card p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  {isDark ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-primary" />}
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">Mode sombre</p>
                  <p className="text-xs text-muted-foreground">
                    {isDark ? 'Activé' : 'Désactivé'}
                  </p>
                </div>
              </div>
              <Switch checked={isDark} onCheckedChange={toggleTheme} />
            </div>
          </Card>
        </motion.div>

        {/* Arabic Text Size */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="pastel-card p-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Type className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">Taille du texte arabe</p>
                <p className="text-xs text-muted-foreground">Ajuste la lisibilité des versets</p>
              </div>
            </div>

            <Slider
              value={[arabicSize]}
              onValueChange={([v]) => setArabicSize(v)}
              min={100}
              max={180}
              step={10}
              className="w-full"
            />

            <p className="arabic-text text-center" style={{ fontSize: `${arabicSize}%` }}>
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>
          </Card>
        </motion.div>

        {/* SM-2 Spaced Repetition Config */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card className="pastel-card p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Brain className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">Révision espacée</p>
                  <p className="text-xs text-muted-foreground">Personnalise l'algorithme SM-2</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-muted-foreground"
                onClick={() => {
                  resetSM2Config();
                  setSm2Ease(sm2Defaults.initialEase);
                  setSm2Int1(sm2Defaults.interval1);
                  setSm2Int2(sm2Defaults.interval2);
                  setSm2Int3(sm2Defaults.interval3);
                  setSm2Int4(sm2Defaults.interval4);
                  toast({ title: '↩️ Valeurs par défaut restaurées' });
                }}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Facteur de facilité initial</span>
                  <span className="font-medium text-foreground">{sm2Ease.toFixed(1)}</span>
                </div>
                <Slider
                  value={[sm2Ease * 10]}
                  onValueChange={([v]) => { const val = v / 10; setSm2Ease(val); saveSM2Config({ initialEase: val }); }}
                  min={15}
                  max={35}
                  step={1}
                  className="w-full"
                />
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Plus élevé = intervalles qui augmentent plus vite
                </p>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">1er intervalle</span>
                  <span className="font-medium text-foreground">{sm2Int1} jour{sm2Int1 > 1 ? 's' : ''}</span>
                </div>
                <Slider
                  value={[sm2Int1]}
                  onValueChange={([v]) => { setSm2Int1(v); saveSM2Config({ interval1: v }); }}
                  min={1}
                  max={3}
                  step={1}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">2e intervalle</span>
                  <span className="font-medium text-foreground">{sm2Int2} jours</span>
                </div>
                <Slider
                  value={[sm2Int2]}
                  onValueChange={([v]) => { setSm2Int2(v); saveSM2Config({ interval2: v }); }}
                  min={3}
                  max={10}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="illustrated-card bg-gradient-sky">
            <p className="text-sm text-sky-foreground/80">
              💡 Les rappels et notifications se gèrent depuis la page <strong>Rappels</strong> accessible via la navigation en bas.
            </p>
          </Card>
        </motion.div>

        {/* Danger Zone - Reset Hifz */}
        {user && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="pastel-card p-4 border-destructive/30">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">Zone dangereuse</p>
                  <p className="text-xs text-muted-foreground">Actions irréversibles</p>
                </div>
              </div>

              <AlertDialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setConfirmText(''); }}>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="w-full border-destructive/30 text-destructive hover:bg-destructive/10">
                    Réinitialiser mon parcours Hifz
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>⚠️ Réinitialiser le parcours Hifz ?</AlertDialogTitle>
                    <AlertDialogDescription className="space-y-2">
                      <span className="block">Cette action supprimera <strong>définitivement</strong> toutes tes données de mémorisation :</span>
                      <span className="block">• Sessions de mémorisation</span>
                      <span className="block">• Versets mémorisés</span>
                      <span className="block">• Séries (streaks)</span>
                      <span className="block">• Objectifs de Hifz</span>
                      <span className="block mt-3">Pour confirmer, tape <strong>REINITIALISER</strong> ci-dessous :</span>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <Input
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="Tape REINITIALISER"
                    className="mt-2"
                  />
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction
                      disabled={confirmText !== 'REINITIALISER' || isResetting}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={async (e) => {
                        e.preventDefault();
                        setIsResetting(true);
                        try {
                          const uid = user.id;
                          await Promise.all([
                            supabase.from('hifz_sessions').delete().eq('user_id', uid),
                            supabase.from('hifz_memorized_verses').delete().eq('user_id', uid),
                            supabase.from('hifz_streaks').delete().eq('user_id', uid),
                            supabase.from('hifz_goals').delete().eq('user_id', uid),
                            supabase.from('muraja_sessions').delete().eq('user_id', uid),
                          ]);
                          await supabase.from('profiles').update({ onboarding_completed: false }).eq('user_id', uid);
                          localStorage.removeItem('hifz_active_session');
                          toast({ title: '✅ Parcours réinitialisé', description: 'Tu peux recommencer ton diagnostic.' });
                          setDialogOpen(false);
                          navigate('/hifz');
                        } catch (err) {
                          toast({ title: 'Erreur', description: 'Une erreur est survenue.', variant: 'destructive' });
                        } finally {
                          setIsResetting(false);
                        }
                      }}
                    >
                      {isResetting ? 'Suppression...' : 'Confirmer la réinitialisation'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </Card>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
}
