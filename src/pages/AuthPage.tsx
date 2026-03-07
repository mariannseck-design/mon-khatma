import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import logo from '@/assets/logo.png';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type AuthMode = 'login' | 'signup' | 'forgot-password' | 'check-email' | 'check-email-reset';

const COOLDOWN_SECONDS = 60;

function translateAuthError(message: string): string {
  if (message.includes('rate limit') || message.includes('over_email_send_rate_limit'))
    return 'Trop de tentatives. Merci de patienter quelques minutes avant de réessayer.';
  if (message.includes('already registered'))
    return 'Cet email est déjà utilisé. Essaie de te connecter.';
  if (message.includes('email_not_confirmed') || message.includes('Email not confirmed'))
    return 'Ton email n\'est pas encore confirmé. Vérifie ta boîte mail (et les spams).';
  if (message.includes('Invalid login'))
    return 'Email ou mot de passe incorrect.';
  if (message.includes('invalid_credentials'))
    return 'Email ou mot de passe incorrect.';
  return message;
}

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const { signIn, signUp, resendConfirmation } = useAuth();

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const startCooldown = useCallback(() => setCooldown(COOLDOWN_SECONDS), []);

  const handleResend = async () => {
    if (cooldown > 0 || !email) return;
    setLoading(true);
    try {
      const { error } = await resendConfirmation(email);
      if (error) {
        toast.error(translateAuthError(error.message));
        if (error.message.includes('rate limit')) startCooldown();
      } else {
        toast.success('Email de confirmation renvoyé !');
        startCooldown();
      }
    } catch {
      toast.error('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { toast.error('Entre ton adresse email'); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) toast.error(translateAuthError(error.message));
      else { setMode('check-email-reset'); }
    } catch { toast.error('Une erreur est survenue'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cooldown > 0) return;
    setLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) {
          const msg = translateAuthError(error.message);
          toast.error(msg);
          if (error.message.includes('email_not_confirmed') || error.message.includes('Email not confirmed')) {
            setMode('check-email');
          }
        } else {
          toast.success('Assalamu alaykum! Bienvenue 🌙');
        }
      } else {
        const trimmedName = displayName.trim();
        if (!trimmedName || trimmedName.length < 3) {
          toast.error('Merci d\'entrer ton prénom (au moins 3 caractères)');
          setLoading(false); return;
        }
        if (/^[\d\W]+$/.test(trimmedName)) {
          toast.error('Merci d\'entrer un vrai prénom');
          setLoading(false); return;
        }
        if (password.length < 6) {
          toast.error('Le mot de passe doit contenir au moins 6 caractères');
          setLoading(false); return;
        }

        const { error } = await signUp(email, password, displayName);
        if (error) {
          const msg = translateAuthError(error.message);
          toast.error(msg);
          if (error.message.includes('rate limit')) startCooldown();
        } else {
          setMode('check-email');
          startCooldown();
        }
      }
    } catch {
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
          <img src={logo} alt="Ma Khatma" className="w-20 h-20 rounded-3xl mx-auto mb-4 shadow-lg object-contain" />
          <h1 className="font-display text-2xl text-foreground">Ma Khatma</h1>
        </div>

        <Card className="pastel-card p-6">
          {mode === 'check-email' ? (
            <CheckEmailView
              email={email}
              cooldown={cooldown}
              loading={loading}
              onResend={handleResend}
              onBack={() => setMode('login')}
            />
          ) : mode === 'forgot-password' ? (
            <ForgotPasswordForm
              email={email}
              setEmail={setEmail}
              loading={loading}
              onSubmit={handleForgotPassword}
              onBack={() => setMode('login')}
            />
          ) : (
            <LoginSignupForm
              mode={mode}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              displayName={displayName}
              setDisplayName={setDisplayName}
              loading={loading}
              cooldown={cooldown}
              onSubmit={handleSubmit}
              onToggleMode={() => setMode(mode === 'login' ? 'signup' : 'login')}
              onForgotPassword={() => setMode('forgot-password')}
            />
          )}
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6 px-4">
          "La constance est la clé du succès dans ce monde et dans l'au-delà."
        </p>
      </motion.div>
    </div>
  );
}

/* ── Sub-components ── */

function CheckEmailView({ email, cooldown, loading, onResend, onBack }: {
  email: string; cooldown: number; loading: boolean;
  onResend: () => void; onBack: () => void;
}) {
  return (
    <div className="text-center space-y-4">
      <CheckCircle className="h-12 w-12 text-primary mx-auto" />
      <h2 className="font-display text-xl">Vérifie ta boîte mail</h2>
      <p className="text-sm text-muted-foreground">
        Un email de confirmation a été envoyé à <strong className="text-foreground">{email}</strong>.
      </p>
      <div className="text-xs text-muted-foreground space-y-1">
        <p>📬 Vérifie aussi tes <strong>spams</strong></p>
        <p>⏳ L'email peut prendre quelques minutes</p>
      </div>
      <Button
        onClick={onResend}
        disabled={cooldown > 0 || loading}
        variant="outline"
        className="w-full rounded-xl"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        ) : cooldown > 0 ? (
          `Renvoyer dans ${cooldown}s`
        ) : (
          'Renvoyer l\'email'
        )}
      </Button>
      <button onClick={onBack} className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 mx-auto">
        <ArrowLeft className="h-4 w-4" /> Retour à la connexion
      </button>
    </div>
  );
}

function ForgotPasswordForm({ email, setEmail, loading, onSubmit, onBack }: {
  email: string; setEmail: (v: string) => void; loading: boolean;
  onSubmit: (e: React.FormEvent) => void; onBack: () => void;
}) {
  return (
    <>
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
        <ArrowLeft className="h-4 w-4" /> Retour
      </button>
      <h2 className="font-display text-xl text-center mb-2">Mot de passe oublié?</h2>
      <p className="text-sm text-muted-foreground text-center mb-6">
        Entre ton email et nous t'enverrons un lien pour réinitialiser ton mot de passe.
      </p>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="reset-email" className="text-foreground">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id="reset-email" type="email" placeholder="ton@email.com" value={email}
              onChange={(e) => setEmail(e.target.value)} required className="pl-10 rounded-xl" />
          </div>
        </div>
        <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground hover-lift h-12 rounded-xl mt-6">
          {loading ? <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" /> : <>Envoyer le lien <ArrowRight className="ml-2 h-4 w-4" /></>}
        </Button>
      </form>
    </>
  );
}

function LoginSignupForm({ mode, email, setEmail, password, setPassword, displayName, setDisplayName, loading, cooldown, onSubmit, onToggleMode, onForgotPassword }: {
  mode: 'login' | 'signup'; email: string; setEmail: (v: string) => void;
  password: string; setPassword: (v: string) => void;
  displayName: string; setDisplayName: (v: string) => void;
  loading: boolean; cooldown: number;
  onSubmit: (e: React.FormEvent) => void; onToggleMode: () => void; onForgotPassword: () => void;
}) {
  return (
    <>
      <h2 className="font-display text-xl text-center mb-6">
        {mode === 'login' ? 'Connexion' : 'Inscription'}
      </h2>
      <form onSubmit={onSubmit} className="space-y-4">
        {mode === 'signup' && (
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground">Ton prénom</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="name" type="text" placeholder="Ex: Fatima, Aïcha..." value={displayName}
                onChange={(e) => setDisplayName(e.target.value)} required minLength={3} className="pl-10 rounded-xl" />
            </div>
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-foreground">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id="email" type="email" placeholder="ton@email.com" value={email}
              onChange={(e) => setEmail(e.target.value)} required className="pl-10 rounded-xl" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-foreground">Mot de passe</Label>
            {mode === 'login' && (
              <button type="button" onClick={onForgotPassword} className="text-xs text-primary hover:underline">
                Mot de passe oublié?
              </button>
            )}
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id="password" type="password" placeholder="••••••••" value={password}
              onChange={(e) => setPassword(e.target.value)} required className="pl-10 rounded-xl" />
          </div>
        </div>
        <Button type="submit" disabled={loading || cooldown > 0} className="w-full bg-primary text-primary-foreground hover-lift h-12 rounded-xl mt-6">
          {loading ? (
            <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
          ) : cooldown > 0 ? (
            `Patienter ${cooldown}s`
          ) : (
            <>{mode === 'login' ? 'Se connecter' : 'S\'inscrire'} <ArrowRight className="ml-2 h-4 w-4" /></>
          )}
        </Button>
      </form>
      <div className="mt-6 text-center">
        <button onClick={onToggleMode} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          {mode === 'login' ? 'Pas encore de compte? ' : 'Déjà un compte? '}
          <span className="text-primary font-medium">{mode === 'login' ? 'S\'inscrire' : 'Se connecter'}</span>
        </button>
      </div>
    </>
  );
}
