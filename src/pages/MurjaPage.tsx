import { AppLayout } from '@/components/layout/AppLayout';
import { RefreshCw } from 'lucide-react';

export default function MurjaPage() {
  return (
    <AppLayout title="Muraja'a" hideNav>
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
            <RefreshCw className="h-10 w-10" style={{ color: '#d4af37' }} />
          </div>
          <h1
            className="text-2xl font-bold tracking-[0.1em] uppercase mb-3"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#d4af37' }}
          >
            Muraja'a
          </h1>
          <p className="text-white/80 text-base leading-relaxed">
            Révise et consolide ta mémorisation grâce à l'algorithme de répétition espacée.
          </p>
          <p className="text-white/50 text-sm mt-6">
            Module en cours de construction in shaa Allah
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
