import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Link2, Shield, ArrowLeft, Check, Star } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import HifzStep5Liaison from '@/components/hifz/HifzStep5Liaison';
import HifzStep6Tour from '@/components/hifz/HifzStep6Tour';

const GRADIENT_STYLE = {
  background: 'linear-gradient(135deg, #0d7377 0%, #14919b 50%, #0d7377 100%)',
  border: '2px solid rgba(212,175,55,0.4)',
  boxShadow: '0 8px 32px -8px rgba(13,115,119,0.4)',
};

type RevisionMode = 'menu' | 'liaison' | 'tour' | 'done';

export default function RevisionPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<RevisionMode>('menu');

  if (mode === 'liaison') {
    return (
      <AppLayout title="Entretien & Révision" hideNav>
        <div className="min-h-[80vh] rounded-[2rem] p-6 mx-[-4px]" style={GRADIENT_STYLE}>
          <HifzStep5Liaison
            onNext={() => setMode('menu')}
            onBack={() => setMode('menu')}
          />
        </div>
      </AppLayout>
    );
  }

  if (mode === 'tour') {
    return (
      <AppLayout title="Entretien & Révision" hideNav>
        <div className="min-h-[80vh] rounded-[2rem] p-6 mx-[-4px]" style={GRADIENT_STYLE}>
          <HifzStep6Tour
            onComplete={() => setMode('done')}
            onBack={() => setMode('menu')}
          />
        </div>
      </AppLayout>
    );
  }

  if (mode === 'done') {
    return (
      <AppLayout title="Entretien & Révision" hideNav>
        <div className="min-h-[80vh] rounded-[2rem] p-6 mx-[-4px]" style={GRADIENT_STYLE}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6 py-12"
          >
            <div
              className="w-20 h-20 rounded-full mx-auto flex items-center justify-center"
              style={{ background: 'rgba(212,175,55,0.2)', border: '2px solid rgba(212,175,55,0.4)' }}
            >
              <Star className="h-10 w-10" style={{ color: '#d4af37' }} fill="#d4af37" />
            </div>
            <h2
              className="text-xl font-bold tracking-[0.1em] uppercase"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#d4af37' }}
            >
              Révision terminée !
            </h2>
            <p className="text-white/70 text-sm px-4">
              Qu'Allah bénisse ta constance dans la préservation de Sa parole.
            </p>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/accueil')}
              className="mx-auto px-6 py-3 rounded-2xl flex items-center gap-2 font-semibold"
              style={{ background: 'linear-gradient(135deg, #d4af37, #b8962e)', color: '#1a2e1a' }}
            >
              <ArrowLeft className="h-5 w-5" />
              Retour à l'accueil
            </motion.button>
          </motion.div>
        </div>
      </AppLayout>
    );
  }

  // Menu
  return (
    <AppLayout title="Entretien & Révision" hideNav>
      <div className="min-h-[80vh] rounded-[2rem] p-6 mx-[-4px]" style={GRADIENT_STYLE}>
        <div className="space-y-6">
          {/* Back button */}
          <button
            onClick={() => navigate('/accueil')}
            className="flex items-center gap-2 text-sm font-medium"
            style={{ color: 'rgba(255,255,255,0.7)' }}
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </button>

          <div className="text-center space-y-2">
            <h1
              className="text-xl font-bold tracking-[0.1em] uppercase"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#d4af37' }}
            >
              Entretien & Révision
            </h1>
            <p className="text-white/60 text-sm">
              Préserve et renforce ta mémorisation
            </p>
          </div>

          {/* Liaison card */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setMode('liaison')}
            className="w-full text-left rounded-2xl p-5 space-y-3"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(212,175,55,0.2)' }}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.25)' }}
              >
                <Link2 className="h-6 w-6" style={{ color: '#d4af37' }} />
              </div>
              <div>
                <h3 className="text-base font-bold" style={{ color: '#f0e6c8' }}>La Liaison (Ar-Rabt)</h3>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Récite tes acquis des 30 derniers jours
                </p>
              </div>
            </div>
          </motion.button>

          {/* Tour card */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setMode('tour')}
            className="w-full text-left rounded-2xl p-5 space-y-3"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(212,175,55,0.2)' }}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.25)' }}
              >
                <Shield className="h-6 w-6" style={{ color: '#d4af37' }} />
              </div>
              <div>
                <h3 className="text-base font-bold" style={{ color: '#f0e6c8' }}>Le Tour (Révision SM-2)</h3>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Révise tes blocs selon la répétition espacée
                </p>
              </div>
            </div>
          </motion.button>
        </div>
      </div>
    </AppLayout>
  );
}
