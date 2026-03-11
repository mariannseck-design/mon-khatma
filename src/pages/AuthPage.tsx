import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, ArrowLeft, CheckCircle, Eye, EyeOff, BookOpen, Brain, Heart, MessageCircle } from 'lucide-react';
import logo from '@/assets/logo.png';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { InstallBanner } from '@/components/pwa/InstallBanner';
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

const FEATURES = [
  { icon: BookOpen, title: 'Ma Khatma', desc: 'Suivi de lecture' },
  { icon: Brain, title: 'Istiqamah', desc: 'Mémorisation' },
  { icon: Heart, title: 'Duas', desc: 'Invocations quotidiennes' },
];

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

  const handleForgotPasswordResend = async () => {
    if (cooldown > 0 || !email) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        toast.error(translateAuthError(error.message));
      } else {
        toast.success('Email renvoyé !');
        startCooldown();
      }
    } catch {
      toast.error('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
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
    <div className="min-h-screen bg-gradient-to-b from-[hsl(40,33%,97%)] to-[hsl(140,20%,95%)] flex flex-col">
      <InstallBanner />
      <div className="flex-1 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        {/* Logo & Header */}
        <div className="text-center mb-6">
          <div className="inline-block p-1 rounded-3xl border-2 border-[hsl(38,50%,75%)] shadow-[0_4px_20px_hsl(38,50%,75%,0.3)] mb-4">
            <img src={logo} alt="Ma Khatma" className="w-20 h-20 rounded-2xl object-contain" />
          </div>
          <h1 className="font-display text-2xl text-foreground mb-2">Ma Khatma</h1>
          <p className="text-xs text-muted-foreground leading-relaxed px-2">
            Cheminez vers une lecture et une mémorisation constantes, par la grâce d'Allah (عز وجل).
          </p>
        </div>

        <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-[0_8px_32px_hsl(0,0%,0%,0.06)] rounded-2xl p-6">
          {mode === 'check-email' ? (
            <CheckEmailView
              email={email} cooldown={cooldown} loading={loading}
              onResend={handleResend} onBack={() => setMode('login')}
              title="Vérifie ta boîte mail"
              description={<>Un email de confirmation a été envoyé à <strong className="text-foreground">{email}</strong>.</>}
            />
          ) : mode === 'check-email-reset' ? (
            <CheckEmailView
              email={email} cooldown={cooldown} loading={loading}
              onResend={handleForgotPasswordResend} onBack={() => setMode('login')}
              title="Email envoyé !"
              description={<>Un lien de réinitialisation a été envoyé à <strong className="text-foreground">{email}</strong>.</>}
            />
          ) : mode === 'forgot-password' ? (
            <ForgotPasswordForm
              email={email} setEmail={setEmail} loading={loading}
              onSubmit={handleForgotPassword} onBack={() => setMode('login')}
            />
          ) : (
            <LoginSignupForm
              mode={mode as 'login' | 'signup'}
              email={email} setEmail={setEmail}
              password={password} setPassword={setPassword}
              displayName={displayName} setDisplayName={setDisplayName}
              loading={loading} cooldown={cooldown}
              onSubmit={handleSubmit}
              onToggleMode={() => setMode(mode === 'login' ? 'signup' : 'login')}
              onForgotPassword={() => setMode('forgot-password')}
            />
          )}
        </Card>

        {/* Feature cards - login only */}
        {mode === 'login' && (
          <div className="flex gap-2 mt-5 px-1">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex-1 bg-white/60 backdrop-blur-sm rounded-xl p-3 text-center shadow-sm">
                <Icon className="h-5 w-5 mx-auto mb-1.5 text-primary" strokeWidth={1.5} />
                <p className="text-[11px] font-semibold text-foreground leading-tight">{title}</p>
                <p className="text-[10px] text-muted-foreground leading-tight">{desc}</p>
              </div>
            ))}
          </div>
        )}

        <p className="text-center text-[10px] text-muted-foreground mt-6 px-4 leading-relaxed">
          💡 Le saviez-vous ? Le terme <em>Istiqamah</em> évoque la persévérance. C'est la clé d'une mémorisation réussie.
        </p>

        <a
          href="https://wa.me/221785263862"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors mt-3"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          Besoin d'aide ? Contacte-nous
        </a>
      </motion.div>
      </div>
    </div>
  );
}

/* ── Sub-components ── */

const softInputClass = "pl-10 rounded-xl bg-[hsl(150,10%,96%)] border-[hsl(150,10%,90%)] shadow-[inset_0_2px_4px_hsl(0,0%,0%,0.04)] focus:bg-white transition-colors";

function CheckEmailView({ email, cooldown, loading, onResend, onBack, title, description }: {
  email: string; cooldown: number; loading: boolean;
  onResend: () => void; onBack: () => void;
  title?: string; description?: React.ReactNode;
}) {
  return (
    <div className="text-center space-y-4">
      <CheckCircle className="h-12 w-12 text-primary mx-auto" />
      <h2 className="font-display text-xl">{title || 'Vérifie ta boîte mail'}</h2>
      <p className="text-sm text-muted-foreground">
        {description || <>Un email de confirmation a été envoyé à <strong className="text-foreground">{email}</strong>.</>}
      </p>
      <div className="text-xs text-muted-foreground space-y-1">
        <p>📬 Vérifie aussi tes <strong>spams</strong> et <strong>courrier indésirable</strong></p>
        <p>⏳ L'email peut prendre quelques minutes</p>
      </div>
      <Button onClick={onResend} disabled={cooldown > 0 || loading} variant="outline" className="w-full rounded-xl">
        {loading ? <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          : cooldown > 0 ? `Renvoyer dans ${cooldown}s` : 'Renvoyer l\'email'}
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
      <h2 className="font-display text-xl text-center mb-2">Mot de passe oublié ?</h2>
      <p className="text-sm text-muted-foreground text-center mb-6">
        Entre ton email et nous t'enverrons un lien pour réinitialiser ton mot de passe.
      </p>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="reset-email" className="text-foreground">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id="reset-email" type="email" placeholder="ton@email.com" value={email}
              onChange={(e) => setEmail(e.target.value)} required className={softInputClass} />
          </div>
        </div>
        <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl bg-[hsl(160,40%,55%)] hover:bg-[hsl(160,40%,48%)] text-white mt-6 shadow-md">
          {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <>Envoyer le lien <ArrowRight className="ml-2 h-4 w-4" /></>}
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
  const [showPassword, setShowPassword] = useState(false);

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
                onChange={(e) => setDisplayName(e.target.value)} required minLength={3} className={softInputClass} />
            </div>
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-foreground">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id="email" type="email" placeholder="ton@email.com" value={email}
              onChange={(e) => setEmail(e.target.value)} required className={softInputClass} />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-foreground">Mot de passe</Label>
            {mode === 'login' && (
              <button type="button" onClick={onForgotPassword} className="text-xs text-primary hover:underline">
                Mot de passe oublié ?
              </button>
            )}
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password}
              onChange={(e) => setPassword(e.target.value)} required className={`${softInputClass} pr-10`} />
            <button type="button" onClick={() => setShowPassword(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <Button type="submit" disabled={loading || cooldown > 0}
          className="w-full h-12 rounded-xl bg-[hsl(160,40%,55%)] hover:bg-[hsl(160,40%,48%)] text-white mt-6 shadow-md">
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : cooldown > 0 ? (
            `Patienter ${cooldown}s`
          ) : (
            <>{mode === 'login' ? 'Se connecter' : 'S\'inscrire'} <ArrowRight className="ml-2 h-4 w-4" /></>
          )}
        </Button>
      </form>
      <div className="mt-6 text-center">
        <button onClick={onToggleMode} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          {mode === 'login' ? 'Pas encore de compte ? ' : 'Déjà un compte ? '}
          <span className="text-primary font-medium">{mode === 'login' ? 'S\'inscrire' : 'Se connecter'}</span>
        </button>
      </div>
    </>
  );
}
