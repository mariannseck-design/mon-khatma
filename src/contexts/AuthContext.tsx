import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';


interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  accessLoading: boolean;
  isAdmin: boolean;
  hasFullAccess: boolean;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resendConfirmation: (email: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessLoading, setAccessLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAllowedEmail, setIsAllowedEmail] = useState(false);

  // Sequence guard to ignore stale async responses
  const accessSeqRef = useRef(0);

  const resolveAccess = async (userId: string, email: string | undefined, seq: number) => {
    setAccessLoading(true);
    // Reset immediately — fail closed
    setIsAdmin(false);
    setIsAllowedEmail(false);

    try {
      const [adminResult, emailResult] = await Promise.all([
        supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .eq('role', 'admin')
          .maybeSingle(),
        email
          ? supabase.rpc('is_allowed_email', { _email: email })
          : Promise.resolve({ data: false }),
      ]);

      // Only apply if this is still the latest check
      if (seq !== accessSeqRef.current) return;

      setIsAdmin(!!adminResult.data);
      setIsAllowedEmail(!!emailResult.data);
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error resolving access:', error);
      if (seq !== accessSeqRef.current) return;
      setIsAdmin(false);
      setIsAllowedEmail(false);
    } finally {
      if (seq === accessSeqRef.current) {
        setAccessLoading(false);
      }
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Increment sequence to invalidate any in-flight checks
        const seq = ++accessSeqRef.current;

        if (session?.user) {
          // Reset immediately, then resolve
          setIsAdmin(false);
          setIsAllowedEmail(false);
          setAccessLoading(true);
          setTimeout(() => {
            resolveAccess(session.user.id, session.user.email, seq);
            ensureProfile(session.user.id);
          }, 0);
        } else {
          setIsAdmin(false);
          setIsAllowedEmail(false);
          setAccessLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      const seq = ++accessSeqRef.current;
      
      if (session?.user) {
        resolveAccess(session.user.id, session.user.email, seq);
        ensureProfile(session.user.id);
      } else {
        setAccessLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const ensureProfile = async (userId: string) => {
    try {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (!existingProfile) {
        const { data: { user } } = await supabase.auth.getUser();
        const displayName = user?.user_metadata?.display_name || null;
        
        await supabase
          .from('profiles')
          .insert({ user_id: userId, display_name: displayName });
      }
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error ensuring profile:', error);
    }
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          display_name: displayName
        }
      }
    });

    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    // Reset access immediately on sign out
    const seq = ++accessSeqRef.current;
    setIsAdmin(false);
    setIsAllowedEmail(false);
    setAccessLoading(false);
    await supabase.auth.signOut();
  };

  const resendConfirmation = async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: `${window.location.origin}/` }
    });
    return { error: error as Error | null };
  };

    const hasFullAccess = isAdmin || isAllowedEmail;

    return (
      <AuthContext.Provider value={{ 
        user, 
        session, 
        loading,
        accessLoading,
        isAdmin,
        hasFullAccess,
        signUp, 
        signIn, 
        signOut,
        resendConfirmation
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    return {
      user: null,
      session: null,
      loading: true,
      accessLoading: true,
      isAdmin: false,
      hasFullAccess: false,
      signUp: async () => ({ error: new Error('Auth not initialized') }),
      signIn: async () => ({ error: new Error('Auth not initialized') }),
      signOut: async () => {},
      resendConfirmation: async () => ({ error: new Error('Auth not initialized') }),
    } as AuthContextType;
  }
  return context;
}
