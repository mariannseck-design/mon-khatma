import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { LucideIcon } from 'lucide-react';

interface ComingSoonGateProps {
  children: ReactNode;
  title: string;
  icon: LucideIcon;
  description: string;
  hideNav?: boolean;
  adminOnly?: boolean;
}

export default function ComingSoonGate({ children, title, icon: Icon, description, hideNav, adminOnly }: ComingSoonGateProps) {
  const { hasFullAccess, isAdmin, accessLoading } = useAuth();

  // While access is still being resolved, show loading — fail closed
  if (accessLoading) {
    return (
      <AppLayout title={title} hideNav={hideNav}>
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    );
  }

  if (adminOnly ? isAdmin : hasFullAccess) return <>{children}</>;

  return (
    <AppLayout title={title} hideNav={hideNav}>
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <div
          className="w-full max-w-md rounded-[2rem] p-8 text-center"
          style={{
            background: 'linear-gradient(135deg, #0d7377 0%, #14919b 50%, #0d7377 100%)',
            border: '2px solid rgba(212,175,55,0.4)',
            boxShadow: '0 8px 32px -8px rgba(13,115,119,0.4), inset 0 0 30px rgba(212,175,55,0.06)',
          }}
        >
          <div
            className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(212,175,55,0.25), rgba(212,175,55,0.1))',
              border: '1px solid rgba(212,175,55,0.3)',
            }}
          >
            <Icon className="h-10 w-10" style={{ color: '#d4af37' }} />
          </div>
          <h1
            className="text-2xl font-bold tracking-[0.1em] uppercase mb-3"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#d4af37' }}
          >
            {title}
          </h1>
          <p className="text-white/80 text-base leading-relaxed">
            {description}
          </p>
          <p className="text-white/50 text-sm mt-6">
            Bientôt disponible in shaa Allah 🤲
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
