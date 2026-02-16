import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Moon, Sun, Type } from 'lucide-react';

export default function ParametresPage() {
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });

  const [arabicSize, setArabicSize] = useState(() => {
    const saved = localStorage.getItem('arabic-text-size');
    return saved ? parseInt(saved, 10) : 110;
  });

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

        {/* Info */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="illustrated-card bg-gradient-sky">
            <p className="text-sm text-sky-foreground/80">
              💡 Les rappels et notifications se gèrent depuis la page <strong>Rappels</strong> accessible via la navigation en bas.
            </p>
          </Card>
        </motion.div>
      </div>
    </AppLayout>
  );
}
