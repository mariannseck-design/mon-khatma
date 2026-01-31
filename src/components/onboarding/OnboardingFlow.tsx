import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sparkles, ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type ThemeColor = 'emerald' | 'ocean' | 'sunset' | 'midnight';

interface ThemeOption {
  id: ThemeColor;
  name: string;
  colors: string;
  gradient: string;
}

const themes: ThemeOption[] = [
  { id: 'emerald', name: 'Emerald', colors: 'from-emerald-600 to-emerald-800', gradient: 'bg-gradient-to-br from-emerald-500 to-teal-600' },
  { id: 'ocean', name: 'Ocean', colors: 'from-blue-600 to-cyan-700', gradient: 'bg-gradient-to-br from-blue-500 to-cyan-600' },
  { id: 'sunset', name: 'Sunset', colors: 'from-orange-500 to-rose-600', gradient: 'bg-gradient-to-br from-orange-400 to-rose-500' },
  { id: 'midnight', name: 'Midnight', colors: 'from-indigo-600 to-purple-800', gradient: 'bg-gradient-to-br from-indigo-500 to-purple-600' },
];

export function OnboardingFlow() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<ThemeColor>('emerald');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleComplete = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName || null,
          theme_color: selectedTheme,
          onboarding_completed: true
        })
        .eq('user_id', user.id);

      if (error) throw error;
      
      toast.success('Welcome to your spiritual journey! 🌙');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    // Welcome Step
    <motion.div
      key="welcome"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="text-center space-y-8"
    >
      <div className="relative mx-auto w-24 h-24">
        <div className="absolute inset-0 bg-primary/20 rounded-3xl animate-pulse" />
        <div className="absolute inset-2 bg-gradient-spiritual rounded-2xl flex items-center justify-center shadow-xl">
          <Moon className="h-10 w-10 text-primary-foreground" />
        </div>
        <motion.div
          className="absolute -top-2 -right-2"
          animate={{ rotate: [0, 15, -15, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Sparkles className="h-6 w-6 text-accent" />
        </motion.div>
      </div>

      <div className="space-y-3">
        <h1 className="font-display text-3xl font-bold text-foreground">
          Bienvenue
        </h1>
        <p className="text-muted-foreground text-lg max-w-xs mx-auto">
          Begin your journey towards spiritual consistency and inner peace
        </p>
      </div>

      <Button 
        onClick={() => setStep(1)} 
        size="lg" 
        className="w-full max-w-xs bg-gradient-spiritual hover:opacity-90 transition-opacity"
      >
        Get Started
        <ChevronRight className="ml-2 h-4 w-4" />
      </Button>
    </motion.div>,

    // Name Step
    <motion.div
      key="name"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-8"
    >
      <div className="text-center space-y-3">
        <h2 className="font-display text-2xl font-bold text-foreground">
          What should we call you?
        </h2>
        <p className="text-muted-foreground">
          Your name will personalize your experience
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium">
            Display Name
          </Label>
          <Input
            id="name"
            placeholder="Enter your name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="h-12 text-lg"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setStep(0)} className="flex-1">
          Back
        </Button>
        <Button 
          onClick={() => setStep(2)} 
          className="flex-1 bg-gradient-spiritual"
        >
          Continue
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </motion.div>,

    // Theme Step
    <motion.div
      key="theme"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-8"
    >
      <div className="text-center space-y-3">
        <h2 className="font-display text-2xl font-bold text-foreground">
          Choose Your Theme
        </h2>
        <p className="text-muted-foreground">
          Select a color that resonates with you
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {themes.map((theme) => (
          <motion.button
            key={theme.id}
            onClick={() => setSelectedTheme(theme.id)}
            className={`relative p-4 rounded-2xl border-2 transition-all ${
              selectedTheme === theme.id 
                ? 'border-primary shadow-lg scale-105' 
                : 'border-border hover:border-primary/50'
            }`}
            whileHover={{ scale: selectedTheme === theme.id ? 1.05 : 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className={`h-16 rounded-xl ${theme.gradient} mb-3`} />
            <p className="font-medium text-foreground">{theme.name}</p>
            
            {selectedTheme === theme.id && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center"
              >
                <Check className="h-4 w-4 text-primary-foreground" />
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
          Back
        </Button>
        <Button 
          onClick={handleComplete}
          disabled={isSubmitting}
          className="flex-1 bg-gradient-spiritual"
        >
          {isSubmitting ? 'Setting up...' : 'Complete Setup'}
          <Sparkles className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </motion.div>,
  ];

  return (
    <div className="min-h-screen bg-background pattern-overlay flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 mb-12">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === step ? 'w-8 bg-primary' : i < step ? 'w-2 bg-primary' : 'w-2 bg-border'
              }`}
              animate={{ width: i === step ? 32 : 8 }}
            />
          ))}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {steps[step]}
        </AnimatePresence>
      </div>
    </div>
  );
}
