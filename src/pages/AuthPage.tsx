import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, BookOpen, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type AuthMode = 'login' | 'signup' | 'forgot-password';

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Entre ton adresse email');
      return;
    }
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Un email de réinitialisation a été envoyé! Vérifie ta boîte mail.');
        setMode('login');
      }
    } catch (error) {
      toast.error('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) {
          toast.error(error.message || 'Erreur de connexion');
        } else {
          toast.success('Assalamu alaykum! Bienvenue 🌙');
        }
      } else {
        if (password.length < 6) {
          toast.error('Le mot de passe doit contenir au moins 6 caractères');
          setLoading(false);
          return;
        }
        
        const { error } = await signUp(email, password, displayName);
        if (error) {
          if (error.message.includes('already registered')) {
            toast.error('Cet email est déjà utilisé');
          } else {
            toast.error(error.message || 'Erreur lors de l\'inscription');
          }
        } else {
          toast.success('Inscription réussie! Vérifie tes emails pour confirmer ton compte.');
        }
      }
    } catch (error) {
      toast.error('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-warm flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-3xl bg-gradient-mint mx-auto flex items-center justify-center mb-4 shadow-lg">
            <BookOpen className="h-10 w-10 text-primary-foreground" />
          </div>
          <h1 className="font-display text-2xl text-foreground">Mon Khatma</h1>
        </div>

        {/* Form Card */}
        <Card className="pastel-card p-6">
          {mode === 'forgot-password' ? (
            <>
              <button
                onClick={() => setMode('login')}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour
              </button>
              <h2 className="font-display text-xl text-center mb-2">
                Mot de passe oublié?
              </h2>
              <p className="text-sm text-muted-foreground text-center mb-6">
                Entre ton email et nous t'enverrons un lien pour réinitialiser ton mot de passe.
              </p>

              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email" className="text-foreground">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="ton@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-10 rounded-xl"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-primary-foreground hover-lift h-12 rounded-xl mt-6"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      Envoyer le lien
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </>
          ) : (
            <>
              <h2 className="font-display text-xl text-center mb-6">
                {mode === 'login' ? 'Connexion' : 'Inscription'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'signup' && (
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-foreground">Prénom</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="Ton prénom"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="pl-10 rounded-xl"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="ton@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-10 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-foreground">Mot de passe</Label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => setMode('forgot-password')}
                        className="text-xs text-primary hover:underline"
                      >
                        Mot de passe oublié?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pl-10 rounded-xl"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-primary-foreground hover-lift h-12 rounded-xl mt-6"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      {mode === 'login' ? 'Se connecter' : 'S\'inscrire'}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              {/* Toggle */}
              <div className="mt-6 text-center">
                <button
                  onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {mode === 'login' ? 'Pas encore de compte? ' : 'Déjà un compte? '}
                  <span className="text-primary font-medium">
                    {mode === 'login' ? 'S\'inscrire' : 'Se connecter'}
                  </span>
                </button>
              </div>
            </>
          )}
        </Card>

        {/* Quote */}
        <p className="text-center text-xs text-muted-foreground mt-6 px-4">
          "La constance est la clé du succès dans ce monde et dans l'au-delà."
        </p>
      </motion.div>
    </div>
  );
}
