import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, BookOpen, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
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
          <h1 className="font-display text-2xl text-foreground">Istiqamah</h1>
          <p className="text-sm text-muted-foreground mt-1">Par Marianne Seck</p>
        </div>

        {/* Form Card */}
        <Card className="pastel-card p-6">
          <h2 className="font-display text-xl text-center mb-6">
            {isLogin ? 'Connexion' : 'Inscription'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
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
              <Label htmlFor="password" className="text-foreground">Mot de passe</Label>
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
                  {isLogin ? 'Se connecter' : 'S\'inscrire'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Toggle */}
          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {isLogin ? 'Pas encore de compte? ' : 'Déjà un compte? '}
              <span className="text-primary font-medium">
                {isLogin ? 'S\'inscrire' : 'Se connecter'}
              </span>
            </button>
          </div>
        </Card>

        {/* Quote */}
        <p className="text-center text-xs text-muted-foreground mt-6 px-4">
          "La constance (Istiqamah) est la clé du succès dans ce monde et dans l'au-delà."
        </p>
      </motion.div>
    </div>
  );
}
