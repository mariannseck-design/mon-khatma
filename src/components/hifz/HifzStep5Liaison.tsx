import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link2, Check } from 'lucide-react';
import HifzStepWrapper from './HifzStepWrapper';

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export default function HifzStep5Liaison({ onNext, onBack }: Props) {
  const [confirmed, setConfirmed] = useState(false);

  return (
    <HifzStepWrapper stepNumber={5} stepTitle="La Liaison (Ar-Rabt)" onBack={onBack}>
      <div className="text-center space-y-6">
        <div
          className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center"
          style={{ background: 'rgba(212,175,55,0.2)', border: '1px solid rgba(212,175,55,0.3)' }}
        >
          <Link2 className="h-8 w-8" style={{ color: '#d4af37' }} />
        </div>

        <p className="text-white/80 text-sm leading-relaxed px-2">
          Connecte tes acquis. Récite une fois, sans regarder, tout ce que tu as mémorisé depuis 30 jours.
        </p>

        <div
          className="rounded-2xl p-5"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(212,175,55,0.15)' }}
        >
          <p className="text-white/60 text-sm mb-4">
            Cette étape renforce la liaison entre les passages. Prends le temps nécessaire pour réciter de mémoire tout ce que tu as appris récemment.
          </p>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setConfirmed(true)}
            disabled={confirmed}
            className="px-6 py-3 rounded-xl font-semibold text-sm"
            style={{
              background: confirmed ? 'rgba(212,175,55,0.3)' : 'rgba(255,255,255,0.1)',
              color: confirmed ? '#d4af37' : 'white',
              border: `1px solid ${confirmed ? '#d4af37' : 'rgba(255,255,255,0.15)'}`,
            }}
          >
            {confirmed ? 'Récitation confirmée ✓' : 'J\'ai récité de mémoire'}
          </motion.button>
        </div>

        {confirmed && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.97 }}
            onClick={onNext}
            className="w-full rounded-2xl py-4 flex items-center justify-center gap-2 font-semibold"
            style={{ background: 'linear-gradient(135deg, #d4af37, #b8962e)', color: '#1a2e1a' }}
          >
            <Check className="h-5 w-5" />
            Passer à l'étape finale
          </motion.button>
        )}
      </div>
    </HifzStepWrapper>
  );
}
